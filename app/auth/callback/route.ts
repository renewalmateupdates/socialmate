export const dynamic = 'force-dynamic'
import { createServerClient } from '@supabase/ssr'
import { recordFunnel } from '@/lib/usage'
import { isFirstSignIn } from '@/lib/new-account'
import { ATTRIBUTION_COOKIES, ATTRIBUTION_DONE_COOKIE, mergeAttribution, readAttribution, referrerHost } from '@/lib/attribution'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { inngest } from '@/lib/inngest'
 
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
 
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
 
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)
 
    if (session?.user) {
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // One answer to "is this the account's first sign-in?", used by every
      // new-account step below. It is not simply "created in the last minute":
      // see lib/new-account.ts for the email signups that rule silently dropped.
      const isNewAccount = isFirstSignIn(session.user)
      const attribution = isNewAccount
        ? mergeAttribution(
            readAttribution(name => cookieStore.get(name)?.value),
            session.user.user_metadata?.attribution,
          )
        : {}
 
      // Auto-create personal workspace if it doesn't exist yet
      try {
        const { data: existingWs } = await adminSupabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', session.user.id)
          .eq('is_personal', true)
          .single()
 
        if (!existingWs) {
          await adminSupabase
            .from('workspaces')
            .insert({
              owner_id:    session.user.id,
              name:        'Personal',
              is_personal: true,
            })
        }
      } catch (err) {
        console.error('Personal workspace creation error:', err)
      }
 
      // Referral tracking
      const refCode = cookieStore.get('sm_ref')?.value
      if (refCode) {
        try {
          const { data: referrerSettings } = await adminSupabase
            .from('user_settings')
            .select('user_id')
            .eq('referral_code', refCode)
            .single()
 
          if (referrerSettings && referrerSettings.user_id !== session.user.id) {
            await adminSupabase
              .from('referral_conversions')
              .upsert({
                affiliate_user_id: referrerSettings.user_id,
                referred_user_id:  session.user.id,
                referral_code:     refCode,
                status:            'pending',
                converted_at:      new Date().toISOString(),
                lock_expires_at:   new Date(
                  Date.now() + 60 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }, {
                onConflict:       'referred_user_id',
                ignoreDuplicates: true,
              })
          }
        } catch (err) {
          console.error('Referral tracking error:', err)
        }
        cookieStore.delete('sm_ref')
      }
 
      // Welcome email — only on first signup (account created within 60s + no flag set)
      try {
        const email = session.user.email

        const { data: emailFlagRow } = await adminSupabase
          .from('user_settings')
          .select('welcome_email_sent')
          .eq('user_id', session.user.id)
          .single()

        const alreadySent = emailFlagRow?.welcome_email_sent === true

        // The one moment we can tell a new account from a returning one.
        // Guarded by !alreadySent so a re-auth inside the 60s window
        // cannot record a second signup for the same person.
        if (isNewAccount && !alreadySent) {
          const fromHost = referrerHost(attribution.referrer)
          recordFunnel(adminSupabase, session.user.id, 'signup_completed', {
            provider: session.user.app_metadata?.provider ?? 'email',
            ...(attribution.landing && { landing: attribution.landing }),
            ...(fromHost            && { referrer_host: fromHost }),
            ...(attribution.source  && { utm_source: attribution.source }),
          })
        }

        if (email && isNewAccount && !alreadySent) {
          // Upsert, not update: an update on a missing row changes nothing and
          // reports no error, which left the flag unset and the guard above open.
          const { error: flagError } = await adminSupabase
            .from('user_settings')
            .upsert({ user_id: session.user.id, welcome_email_sent: true }, { onConflict: 'user_id' })
          if (flagError) console.error('[auth/callback] welcome flag write failed:', flagError.message)

          // Fire onboarding email sequence via Inngest (Day 0 welcome, Day 3 AI tools, Day 7 upgrade nudge)
          const firstName = (session.user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
            || (session.user.user_metadata?.name as string | undefined)?.split(' ')[0]
            || undefined
          // The id makes this idempotent: Inngest runs the sequence once per
          // account even if a second first-sign-in callback gets this far.
          inngest.send({
            id:   `user-signup-${session.user.id}`,
            name: 'user/signup',
            data: { email, firstName },
          }).catch((err: unknown) => console.error('[auth/callback] Failed to send user/signup event:', err))
        }

        // Sync IRIS newsletter opt-in preference from signup form metadata
        const newsletterOptIn = session.user.user_metadata?.newsletter_opted_in
        if (isNewAccount && typeof newsletterOptIn === 'boolean') {
          await adminSupabase
            .from('user_settings')
            .upsert({ user_id: session.user.id, iris_opt_in: newsletterOptIn }, { onConflict: 'user_id' })
        }
      } catch (err) {
        console.error('Welcome email error:', err)
      }

      // Login tracking — increment login_count and update last_active on every sign-in
      try {
        const { error: rpcError } = await adminSupabase.rpc('increment_login_count', { p_user_id: session.user.id })
        if (rpcError) {
          // Fallback if RPC doesn't exist yet — direct upsert
          const { data: current } = await adminSupabase
            .from('user_settings')
            .select('login_count')
            .eq('user_id', session.user.id)
            .maybeSingle()
          const { error: upsertError } = await adminSupabase
            .from('user_settings')
            .upsert({
              user_id: session.user.id,
              login_count: (current?.login_count ?? 0) + 1,
              last_active: new Date().toISOString(),
            }, { onConflict: 'user_id' })
          if (upsertError) console.error('Login tracking error:', upsertError)
        }
      } catch (trackErr) {
        console.error('Login tracking error:', trackErr)
      }

      // Where the account came from: recorded on the first page the visitor
      // landed on, or carried in the account's metadata from the signup form.
      // Persisted on the first sign-in only. See lib/attribution.ts.
      if (isNewAccount) {
        try {
          if (attribution.source || attribution.medium || attribution.campaign || attribution.referrer) {
            const { error: attributionError } = await adminSupabase
              .from('user_settings')
              .upsert({
                user_id: session.user.id,
                ...(attribution.source   && { signup_source:   attribution.source   }),
                ...(attribution.medium   && { signup_medium:   attribution.medium   }),
                ...(attribution.campaign && { signup_campaign: attribution.campaign }),
                ...(attribution.referrer && { signup_referrer: attribution.referrer }),
              }, { onConflict: 'user_id' })
            if (attributionError) console.error('[auth/callback] attribution write failed:', attributionError.message)
          }

          // Clean up, and stop this browser recording a source for an account
          // that already exists.
          for (const name of Object.values(ATTRIBUTION_COOKIES)) cookieStore.delete(name)
          cookieStore.set(ATTRIBUTION_DONE_COOKIE, '1', { path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'lax' })
        } catch (err) {
          console.error('UTM attribution error:', err)
        }
      }
 
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      // Read the ?redirect= param passed through from the login page (Google OAuth path)
      const redirectParam = requestUrl.searchParams.get('redirect')
      const defaultRedirect = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      // Only use redirectParam for authenticated pages — skip onboarding redirect check
      const finalRedirect = !profile?.onboarding_completed
        ? '/onboarding'
        : (redirectParam || defaultRedirect)
      return NextResponse.redirect(new URL(finalRedirect, requestUrl.origin))
    }
  }
 
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
 
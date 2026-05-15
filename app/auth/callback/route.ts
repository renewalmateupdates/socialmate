export const dynamic = 'force-dynamic'
import { createServerClient } from '@supabase/ssr'
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
        const createdAt = new Date(session.user.created_at).getTime()
        const isNewAccount = Date.now() - createdAt < 60_000

        const { data: emailFlagRow } = await adminSupabase
          .from('user_settings')
          .select('welcome_email_sent')
          .eq('user_id', session.user.id)
          .single()

        const alreadySent = emailFlagRow?.welcome_email_sent === true

        if (email && isNewAccount && !alreadySent) {
          await adminSupabase
            .from('user_settings')
            .update({ welcome_email_sent: true })
            .eq('user_id', session.user.id)

          // Fire onboarding email sequence via Inngest (Day 0 welcome, Day 3 AI tools, Day 7 upgrade nudge)
          const firstName = (session.user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
            || (session.user.user_metadata?.name as string | undefined)?.split(' ')[0]
            || undefined
          inngest.send({
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
 
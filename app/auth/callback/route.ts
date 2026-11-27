export const dynamic = 'force-dynamic'
import { createServerClient } from '@supabase/ssr'
import { isFirstSignIn } from '@/lib/new-account'
import { ATTRIBUTION_COOKIES, ATTRIBUTION_DONE_COOKIE, ONBOARDING_LEAD_COOKIE, ONBOARDING_LEAD_MAX_AGE_SECONDS, landedOnTiktok, mergeAttribution, readAttribution } from '@/lib/attribution'
import { ensurePersonalWorkspace, recordSignIn } from '@/lib/sign-in'
import { REFERRAL_COOKIE } from '@/lib/referral-code'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, after } from 'next/server'
import type { NextRequest } from 'next/server'

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
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) console.warn('[auth/callback] code exchange failed:', exchangeError.message)

    if (session?.user) {
      const user = session.user
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // One answer to "is this the account's first sign-in?", used by every
      // new-account step. It is not simply "created in the last minute": see
      // lib/new-account.ts for the email signups that rule silently dropped.
      const isNewAccount = isFirstSignIn(user)
      const attribution = isNewAccount
        ? mergeAttribution(
            readAttribution(name => cookieStore.get(name)?.value),
            user.user_metadata?.attribution,
          )
        : {}
      const refCode = cookieStore.get(REFERRAL_COOKIE)?.value

      // The only waits before the redirect, side by side: the personal
      // workspace the next page loads, and whether onboarding is done, which
      // picks that page. Everything else is in recordSignIn, after the redirect
      // (lib/sign-in.ts says why: the callback took 1.31 s at p75).
      const [, profileResult] = await Promise.all([
        ensurePersonalWorkspace(adminSupabase, user.id),
        supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle(),
      ])
      if (profileResult.error) console.warn('[auth/callback] profile read failed:', profileResult.error.message)
      const profile = profileResult.data

      // Cookies go out with this response, so they change here, never in after().
      if (refCode) cookieStore.delete(REFERRAL_COOKIE)
      if (isNewAccount) {
        // The landing page is gone once these cookies are, so tell onboarding
        // now whether to lead with TikTok.
        if (landedOnTiktok(attribution.landing)) {
          cookieStore.set(ONBOARDING_LEAD_COOKIE, 'tiktok', { path: '/', maxAge: ONBOARDING_LEAD_MAX_AGE_SECONDS, sameSite: 'lax' })
        }
        // Clean up, and stop this browser recording a source for an account
        // that already exists.
        for (const name of Object.values(ATTRIBUTION_COOKIES)) cookieStore.delete(name)
        cookieStore.set(ATTRIBUTION_DONE_COOKIE, '1', { path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'lax' })
      }

      // The referral, the welcome email and newsletter choice, the login count
      // and the signup source: nothing the next page reads.
      after(() => recordSignIn(adminSupabase, user, { isNewAccount, attribution, refCode }))

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

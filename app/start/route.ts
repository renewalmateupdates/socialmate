import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

/**
 * /start?from=tool — where a free tool's "Schedule this post" button goes.
 *
 * Signed in: straight to Compose, which picks up the post the tool saved in
 * this browser. Not signed in: to signup, after which onboarding's first-post
 * step uses the same post (new accounts always go through onboarding).
 *
 * The public pages skip the auth round trip (see proxy.ts), so this one
 * small route does it, only when someone clicks.
 */
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from') === 'tool' ? 'tool' : null
  const compose = from ? '/compose?from=tool' : '/compose'

  let signedIn = false
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
    )
    const { data: { user } } = await supabase.auth.getUser()
    signedIn = !!user
  } catch (err) {
    // Unknown is treated as signed out: signup offers a sign-in link anyway.
    console.warn('[start] session check failed:', err)
  }

  const target = signedIn
    ? compose
    : `/signup?redirect=${encodeURIComponent(compose)}${from ? '&from=tool' : ''}`
  const res = NextResponse.redirect(new URL(target, request.url))
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex')
  return res
}

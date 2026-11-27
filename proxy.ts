import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// Routes that require authentication; redirect to /login if no session. The
// list is shared with the sitemap so the two cannot disagree.
import { isProtectedPath } from '@/lib/protected-paths'
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE_SECONDS, referralCodeFromUrl } from '@/lib/referral-code'

// Attach the referral capture (?ref=CODE, or the /refer/CODE landing page) to
// a response. Runs on every route: referral links land on public marketing
// pages, not just protected ones. auth/callback credits the signup from this
// cookie.
function captureRefCode(request: NextRequest, response: NextResponse): NextResponse {
  const refCode = referralCodeFromUrl(request.nextUrl)
  if (refCode) {
    response.cookies.set(REFERRAL_COOKIE, refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
      path: '/',
      sameSite: 'lax',
    })
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = isProtectedPath(pathname)

  // PUBLIC ROUTES: no auth call at all.
  //
  // supabase.auth.getUser() is a NETWORK round trip to Supabase Auth to validate
  // the JWT. The matcher below covers every page (only static assets are
  // excluded), so this used to run on the landing page, every /blog post, every
  // /vs page, /pricing, /signup — and /login itself. On all of those the result
  // was computed and then thrown away, because `user` is only ever read by the
  // isProtected guard below. That is a full auth round trip added to the TTFB of
  // pages that never needed it.
  //
  // Token refresh is unaffected in practice: the browser client has
  // autoRefreshToken on, and any navigation into a protected route still runs
  // the full session handling below.
  if (!isProtected) {
    return captureRefCode(request, NextResponse.next({ request }))
  }

  // PROTECTED ROUTES: full session handling (validates + refreshes cookies).
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    // MUST be `redirect` — app/login/page.tsx reads searchParams.get('redirect').
    // This was `next`, which the login page ignores, so anyone deep-linked into
    // a protected route landed on /dashboard after signing in instead of the
    // page they actually asked for. See the CLAUDE.md gotcha.
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return captureRefCode(request, supabaseResponse)
}

// Pages only. Every request this matches is a billed invocation of its own,
// before the route runs. On Nov 19, 2026, the day Vercel paused the Hobby team
// for CPU, Observability showed it running 8.1K times, more than every function
// together in the same window (about 4.5K). It used to match /api/* too, where
// it did nothing (no API route is a protected path, so each passed straight
// through, the ?ref= check its only work), and files such as the demo video
// (fetched in ranges, one request per piece), sw.js, manifest.json, robots.txt
// and sitemap.xml. API routes check their own session.
export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mp3|txt|xml|json|js|css|map|woff2?|pdf)$).*)',
  ],
}

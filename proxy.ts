import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication — redirect to /login if no session
const PROTECTED_PATHS = [
  '/dashboard',
  '/analytics',
  '/compose',
  '/calendar',
  '/queue',
  '/drafts',
  '/settings',
  '/accounts',
  '/ai-features',
  '/sm-pulse',
  '/sm-radar',
  '/bulk-scheduler',
  '/hashtags',
  '/affiliate',
  '/notifications',
  '/team',
  '/workspaces',
  '/onboarding',
  '/inbox',
  '/social-inbox',
  '/link-in-bio',
  '/rss-import',
  '/media',
  '/templates',
  '/approvals',
  '/evergreen',
  '/best-times',
  '/competitor-tracking',
  '/content-gap',
  '/search',
]

// Attach the ?ref=CODE capture to a response. Runs on every route (referral
// links land on public marketing pages, not just protected ones).
function captureRefCode(request: NextRequest, response: NextResponse): NextResponse {
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode) {
    response.cookies.set('sm_ref', refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path))

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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

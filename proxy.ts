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

export async function proxy(request: NextRequest) {
  // Auth guard for protected routes
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

  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Capture referral code from ?ref=CODE and store in cookie for 30 days
  const { searchParams } = new URL(request.url)
  const refCode = searchParams.get('ref')
  if (refCode) {
    supabaseResponse.cookies.set('sm_ref', refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'
import { INSTAGRAM_SCOPES, appUrl, metaConnectOpen } from '@/lib/meta'

// Starts "Instagram API with Instagram Login". Business and Creator accounts
// only; Instagram itself turns personal accounts away at its own screen.
export async function GET() {
  const base = appUrl()

  // Until Meta approves the app, Instagram refuses anyone without a role on it,
  // so the button is admin-only and the route matches.
  if (!metaConnectOpen() && !(await requireAdmin())) {
    return NextResponse.redirect(`${base}/accounts?error=instagram_not_open`)
  }

  const clientId = process.env.INSTAGRAM_APP_ID
  if (!clientId) {
    console.error('[Instagram OAuth] INSTAGRAM_APP_ID is not set')
    return NextResponse.redirect(`${base}/accounts?error=instagram_not_configured`)
  }

  const state = crypto.randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('instagram_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // 30 minutes, like TikTok: a first-time login can involve 2FA or a hop to the app.
    maxAge:   1800,
    path:     '/',
  })

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${base}/api/accounts/instagram/callback`,
    response_type: 'code',
    scope:         INSTAGRAM_SCOPES.join(','),
    state,
    // Instagram Login only, not "continue with Facebook".
    enable_fb_login: '0',
    // Always show the login and consent screens, so picking a second account works.
    force_authentication: '1',
  })

  return NextResponse.redirect(`https://www.instagram.com/oauth/authorize?${params.toString()}`)
}

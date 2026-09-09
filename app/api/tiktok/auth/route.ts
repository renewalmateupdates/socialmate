export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL!

  const state = crypto.randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure:   true,
    sameSite: 'lax',
    maxAge:   300,
    path:     '/',
  })

  const params = new URLSearchParams({
    client_key:    clientKey,
    scope:         'user.info.basic,video.publish,video.upload',
    response_type: 'code',
    redirect_uri:  `${appUrl}/api/tiktok/callback`,
    state,
    // Without this, TikTok skips the authorization page entirely for a
    // browser session that's already logged into TikTok and has previously
    // approved this app -- it silently re-auths and redirects straight back.
    // That's the right default for a returning user reconnecting, but it also
    // means a disconnect-then-reconnect never actually shows the consent
    // screen, which both looks broken to a user who expects to pick an
    // account and undermines a demo video meant to show TikTok's own consent
    // screen for the content sharing audit.
    disable_auto_auth: '1',
  })

  return NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  )
}

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET() {
  const clientKey = process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY!
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
  })

  return NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  )
}

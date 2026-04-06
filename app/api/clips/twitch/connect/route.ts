export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('twitch_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  })

  const params = new URLSearchParams({
    client_id:     process.env.TWITCH_CLIENT_ID!,
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/clips/twitch/callback`,
    response_type: 'code',
    scope:         'clips:edit user:read:email',
    state,
  })

  return NextResponse.redirect(
    `https://id.twitch.tv/oauth2/authorize?${params}`
  )
}

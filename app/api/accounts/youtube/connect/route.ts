export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { appUrl } from '@/lib/meta'
import { YOUTUBE_SCOPES } from '@/lib/youtube'
import { canConnectYouTube } from '@/lib/review-access'

// Starts Google sign-in to connect a YouTube channel for video uploads.
export async function GET() {
  const base = appUrl()

  // Until Google verifies the app, only its test users can sign in, so the
  // button is limited (admin and reviewer logins) and the route matches.
  if (!(await canConnectYouTube())) {
    return NextResponse.redirect(`${base}/accounts?error=youtube_not_open`)
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID
  if (!clientId || !process.env.YOUTUBE_CLIENT_SECRET) {
    console.error('[YouTube OAuth] YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET not set')
    return NextResponse.redirect(`${base}/accounts?error=youtube_not_configured`)
  }

  const state = crypto.randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('youtube_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 10,
    path:     '/',
  })

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${base}/api/accounts/youtube/callback`,
    response_type: 'code',
    scope:         YOUTUBE_SCOPES.join(' '),
    state,
    // A refresh token is needed to upload at the scheduled time, and Google only
    // returns one on a consent screen.
    access_type:   'offline',
    prompt:        'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

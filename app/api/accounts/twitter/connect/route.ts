export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// X (Twitter) OAuth 2.0 Authorization Code + PKCE
// Required env vars:
//   TWITTER_CLIENT_ID       — from developer.twitter.com
//   TWITTER_CLIENT_SECRET   — from developer.twitter.com
//   NEXT_PUBLIC_APP_URL     — e.g. https://socialmate.studio

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET() {
  const state        = crypto.randomBytes(16).toString('hex')
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32))
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(codeVerifier).digest()
  )

  const cookieStore = await cookies()
  cookieStore.set('twitter_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  })
  cookieStore.set('twitter_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  })

  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             process.env.TWITTER_CLIENT_ID!,
    redirect_uri:          `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts/twitter/callback`,
    scope:                 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })

  return NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`)
}

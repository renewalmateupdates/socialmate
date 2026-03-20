export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts/linkedin/callback`,
    state,
    scope: 'openid profile email w_member_social',
  })

  return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`)
}
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const rawInstance = searchParams.get('instance')

  if (!rawInstance) {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_no_instance`)
  }

  // Normalize instance — strip protocol and trailing slash
  const instance = rawInstance
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .toLowerCase()

  const redirectUri = `${appUrl}/api/accounts/mastodon/callback`

  // Register app with this instance dynamically
  let clientId: string
  let clientSecret: string

  try {
    const registerRes = await fetch(`https://${instance}/api/v1/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'SocialMate',
        redirect_uris: redirectUri,
        scopes: 'read write',
        website: appUrl,
      }),
    })

    if (!registerRes.ok) {
      return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_register_failed`)
    }

    const appData = await registerRes.json()
    clientId = appData.client_id
    clientSecret = appData.client_secret
  } catch {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_instance_unreachable`)
  }

  const state = crypto.randomBytes(16).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('mastodon_oauth', JSON.stringify({ state, instance, clientId, clientSecret }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read write',
    state,
  })

  return NextResponse.redirect(`https://${instance}/oauth/authorize?${params}`)
}
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { FACEBOOK_SCOPES, GRAPH_VERSION, appUrl } from '@/lib/meta'
import { canConnectMeta } from '@/lib/review-access'

// Starts Facebook Login to connect the Facebook Pages a person manages.
// SocialMate posts as a Page, never to someone's personal profile (Meta's API
// does not allow that).
export async function GET() {
  const base = appUrl()

  if (!(await canConnectMeta())) {
    return NextResponse.redirect(`${base}/accounts?error=facebook_not_open`)
  }

  const clientId = process.env.META_APP_ID
  if (!clientId) {
    console.error('[Facebook OAuth] META_APP_ID is not set')
    return NextResponse.redirect(`${base}/accounts?error=facebook_not_configured`)
  }

  const state = crypto.randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('facebook_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   1800,
    path:     '/',
  })

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${base}/api/accounts/facebook/callback`,
    response_type: 'code',
    state,
  })
  // Business-type apps use "Facebook Login for Business", where the permissions
  // live in a configuration instead of a scope list. Either works.
  const configId = process.env.META_FB_LOGIN_CONFIG_ID
  if (configId) params.set('config_id', configId)
  else params.set('scope', FACEBOOK_SCOPES.join(','))

  return NextResponse.redirect(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`)
}

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { appUrl } from '@/lib/meta'
import { canConnectMeta } from '@/lib/meta-access'

// Starts "Instagram API with Unified Login": Facebook Login for Business with
// the Instagram configuration (META_IG_CONFIG_ID). The person can log in with
// Instagram or Facebook, picks the Instagram professional account to share,
// and SocialMate receives a system-user token for it. Meta no longer offers
// the older Instagram Login to new apps.
export async function GET() {
  const base = appUrl()

  // Until Meta approves the app, only people with a role on it (and Meta's
  // reviewers) can log in, so the button is limited and the route matches.
  if (!(await canConnectMeta())) {
    return NextResponse.redirect(`${base}/accounts?error=instagram_not_open`)
  }

  const clientId = process.env.META_APP_ID
  const configId = process.env.META_IG_CONFIG_ID
  if (!clientId || !configId) {
    console.error('[Instagram OAuth] META_APP_ID / META_IG_CONFIG_ID not set')
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

  // The same parameters as the "Login URL" Meta generates for this configuration.
  const params = new URLSearchParams({
    client_id:                     clientId,
    config_id:                     configId,
    redirect_uri:                  `${base}/api/accounts/instagram/callback`,
    response_type:                 'code',
    override_default_response_type: 'true',
    state,
    // Always show the login, so connecting a second account works.
    prompt:                        'login',
  })

  return NextResponse.redirect(`https://www.facebook.com/dialog/oauth?${params.toString()}`)
}

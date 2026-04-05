export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=twitter_denied`)
  }

  const cookieStore = await cookies()
  const storedState    = cookieStore.get('twitter_oauth_state')?.value
  const codeVerifier   = cookieStore.get('twitter_code_verifier')?.value

  if (!storedState || storedState !== state || !codeVerifier) {
    return NextResponse.redirect(`${appUrl}/accounts?error=twitter_invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Basic auth with client_id:client_secret (required for confidential clients)
      Authorization: `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  `${appUrl}/api/accounts/twitter/callback`,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}))
    console.error('[Twitter OAuth] Token exchange failed:', err)
    return NextResponse.redirect(`${appUrl}/accounts?error=twitter_token_failed`)
  }

  const { access_token, refresh_token, expires_in, scope } = await tokenRes.json()
  const expires_at = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null

  // Fetch Twitter user info
  const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    console.error('[Twitter OAuth] User fetch failed:', await userRes.text())
    return NextResponse.redirect(`${appUrl}/accounts?error=twitter_user_failed`)
  }

  const { data: twitterUser } = await userRes.json()
  const account_name      = `@${twitterUser.username}` || twitterUser.name || 'X Account'
  const profile_image_url = twitterUser.profile_image_url?.replace('_normal', '_400x400') || null
  const platform_user_id  = twitterUser.id

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  // Upsert connected account
  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'twitter')
    .eq('platform_user_id', platform_user_id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('connected_accounts')
      .update({ access_token, refresh_token, expires_at, account_name, profile_image_url })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        platform: 'twitter',
        platform_user_id,
        account_name,
        profile_image_url,
        access_token,
        refresh_token: refresh_token || null,
        expires_at,
        scope: scope || 'tweet.read tweet.write users.read offline.access',
      })

    if (dbError) {
      console.error('[Twitter OAuth] DB insert error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=twitter_db_error`)
    }
  }

  // Clean up cookies
  cookieStore.delete('twitter_oauth_state')
  cookieStore.delete('twitter_code_verifier')

  return NextResponse.redirect(`${appUrl}/accounts?success=twitter_connected`)
}

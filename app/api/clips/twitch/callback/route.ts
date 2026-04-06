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
    return NextResponse.redirect(`${appUrl}/clips?error=twitch_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('twitch_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/clips?error=twitch_invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      code,
      grant_type:    'authorization_code',
      redirect_uri:  `${appUrl}/api/clips/twitch/callback`,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}))
    console.error('[Twitch OAuth] Token exchange failed:', err)
    return NextResponse.redirect(`${appUrl}/clips?error=twitch_token_failed`)
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json()
  const expires_at = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null

  // Fetch Twitch user info
  const userRes = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      'Client-Id':    process.env.TWITCH_CLIENT_ID!,
      Authorization:  `Bearer ${access_token}`,
    },
  })

  if (!userRes.ok) {
    console.error('[Twitch OAuth] User fetch failed:', await userRes.text())
    return NextResponse.redirect(`${appUrl}/clips?error=twitch_user_failed`)
  }

  const { data: twitchUsers } = await userRes.json()
  const twitchUser = twitchUsers?.[0]
  if (!twitchUser) {
    return NextResponse.redirect(`${appUrl}/clips?error=twitch_user_failed`)
  }

  const channel_id     = twitchUser.id
  const channel_name   = twitchUser.display_name || twitchUser.login
  const channel_avatar = twitchUser.profile_image_url || null

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

  // Upsert connection
  const { error: dbError } = await supabase
    .from('clip_connections')
    .upsert(
      {
        user_id: user.id,
        platform: 'twitch',
        channel_id,
        channel_name,
        channel_avatar,
        access_token,
        refresh_token: refresh_token || null,
        expires_at,
      },
      { onConflict: 'user_id,platform,channel_id' }
    )

  if (dbError) {
    console.error('[Twitch OAuth] DB upsert error:', dbError)
    return NextResponse.redirect(`${appUrl}/clips?error=twitch_db_error`)
  }

  // Clean up cookies
  cookieStore.delete('twitch_oauth_state')

  return NextResponse.redirect(`${appUrl}/clips?success=twitch_connected`)
}

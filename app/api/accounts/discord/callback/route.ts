import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=discord_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('discord_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl}/api/accounts/discord/callback`,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=token_failed`)
  }

  const { access_token, refresh_token, expires_in, scope } = await tokenRes.json()

  // Get Discord user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=user_failed`)
  }

  const discordUser = await userRes.json()
  const username = discordUser.global_name || discordUser.username
  const avatar_url = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()

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

  // Check if this Discord account already connected
  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'discord')
    .eq('platform_user_id', discordUser.id)
    .single()

  if (existing) {
    // Update tokens
    await supabase
      .from('connected_accounts')
      .update({ access_token, refresh_token, expires_at, scope })
      .eq('id', existing.id)
  } else {
    // Insert new
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        platform: 'discord',
        platform_user_id: discordUser.id,
        username,
        avatar_url,
        access_token,
        refresh_token,
        expires_at,
        scope,
        status: 'active',
        connected_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Discord DB error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=db_error`)
    }
  }

  cookieStore.delete('discord_oauth_state')
  return NextResponse.redirect(`${appUrl}/accounts?success=discord_connected`)
}
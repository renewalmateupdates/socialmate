export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code      = searchParams.get('code')
  const state     = searchParams.get('state')
  const error     = searchParams.get('error')
  const guildId   = searchParams.get('guild_id')  // Discord sends this when bot is added

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/discord?error=bot_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('discord_bot_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/discord?error=invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  `${appUrl}/api/accounts/discord/bot-callback`,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/discord?error=token_failed`)
  }

  const tokenData = await tokenRes.json()
  const { access_token, refresh_token, expires_in, scope } = tokenData

  // Get Discord user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/discord?error=user_fetch_failed`)
  }

  const discordUser = await userRes.json()

  // Get guild name from bot API if we have a guild_id
  let guildName = null
  if (guildId && process.env.DISCORD_BOT_TOKEN) {
    try {
      const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      })
      if (guildRes.ok) {
        const guildData = await guildRes.json()
        guildName = guildData.name
      }
    } catch {
      // Non-fatal — guild name is cosmetic
    }
  }

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

  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()
  const metadata   = guildId ? { guild_id: guildId, guild_name: guildName } : {}

  // Check if a bot-connected account already exists for this guild
  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'discord')
    .eq('platform_user_id', guildId ?? discordUser.id)
    .maybeSingle()

  if (existing) {
    // Update with fresh token + metadata
    await supabase
      .from('connected_accounts')
      .update({ access_token, refresh_token, expires_at, scope, metadata })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'discord',
        platform_user_id: guildId ?? discordUser.id,
        account_name:     guildName ?? discordUser.global_name ?? discordUser.username,
        profile_image_url: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        access_token,
        refresh_token,
        expires_at,
        scope,
        metadata,
      })

    if (dbError) {
      console.error('Discord bot DB error:', dbError)
      return NextResponse.redirect(`${appUrl}/discord?error=db_error`)
    }
  }

  cookieStore.delete('discord_bot_state')
  return NextResponse.redirect(`${appUrl}/discord?success=bot_connected`)
}

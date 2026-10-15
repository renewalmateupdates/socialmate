export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { checkReconnect, markConnected } from '@/lib/platform-jail'
import { checkAccountSlot } from '@/lib/account-limits'
import { isLegacyDiscordAccount } from '@/lib/discord-accounts'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code      = searchParams.get('code')
  const state     = searchParams.get('state')
  const error     = searchParams.get('error')
  const guildId   = searchParams.get('guild_id')  // Discord sends this when bot is added

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=discord_bot_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('discord_bot_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=discord_invalid_state`)
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
    return NextResponse.redirect(`${appUrl}/accounts?error=discord_token_failed`)
  }

  const tokenData = await tokenRes.json()
  const { access_token, refresh_token, expires_in, scope } = tokenData

  // Get Discord user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=discord_user_fetch_failed`)
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
  const platformAccountId = guildId ?? discordUser.id

  // One owner per Discord account, and a 45-day pause before a different
  // SocialMate user can pick it up. Reconnecting your own is always allowed.
  const verdict = await checkReconnect('discord', platformAccountId, user.id)
  if (!verdict.allowed) {
    cookieStore.delete('discord_bot_state')
    return NextResponse.redirect(
      verdict.reason === 'already_connected'
        ? `${appUrl}/accounts?error=discord_already_connected`
        : `${appUrl}/accounts?error=discord_in_cooldown&until=${encodeURIComponent(verdict.until)}`
    )
  }

  // Check if a bot-connected account already exists for this guild
  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'discord')
    .eq('platform_user_id', platformAccountId)
    .maybeSingle()

  // An older login-only Discord connection (no server, so it could never post)
  // is upgraded in place the first time the bot is added. That keeps one row,
  // leaves anything pointing at it alone, and does not need a free slot: a free
  // plan's single Discord slot is exactly what these accounts were sitting in.
  let legacyId: string | null = null
  if (!existing) {
    const { data: legacyRows } = await supabase
      .from('connected_accounts')
      .select('id, platform, metadata')
      .eq('user_id', user.id)
      .eq('platform', 'discord')
      .is('workspace_id', null)
    legacyId = (legacyRows ?? []).find(isLegacyDiscordAccount)?.id ?? null
  }

  // Plan cap on connected accounts per platform. Reconnecting an account this
  // workspace already holds is a token refresh, not a new slot, so it passes.
  if (!existing && !legacyId) {
    const slot = await checkAccountSlot(user.id, 'discord', null, platformAccountId)
    if (!slot.allowed) {
      return NextResponse.redirect(
        `${appUrl}/accounts?error=discord_plan_limit&limit=${slot.limit}&plan=${slot.plan}`
      )
    }
  }

  if (existing) {
    // Update with fresh token + metadata
    await supabase
      .from('connected_accounts')
      .update({ access_token, refresh_token, expires_at, scope, metadata })
      .eq('id', existing.id)
  } else if (legacyId) {
    const { error: upgradeErr } = await supabase
      .from('connected_accounts')
      .update({
        platform_user_id: platformAccountId,
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
      .eq('id', legacyId)

    if (upgradeErr) {
      console.error('Discord bot upgrade error:', upgradeErr)
      return NextResponse.redirect(`${appUrl}/accounts?error=discord_db_error`)
    }
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'discord',
        platform_user_id: platformAccountId,
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
      return NextResponse.redirect(`${appUrl}/accounts?error=discord_db_error`)
    }
  }

  await markConnected('discord', platformAccountId, user.id)

  cookieStore.delete('discord_bot_state')
  return NextResponse.redirect(`${appUrl}/accounts?success=discord_connected`)
}

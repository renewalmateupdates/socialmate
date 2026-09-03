export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * The channels of the Discord server the bot was invited to.
 *
 * This exists so that picking where posts go is one click inside the app,
 * rather than the six-step chore it used to be: open Discord, find the channel,
 * Settings, Integrations, Webhooks, New Webhook, copy the URL, come back, paste
 * it. Seven external accounts connected Discord and not one of them ever
 * completed that, which made Discord the only live platform that could connect
 * successfully and never publish anything.
 *
 * Requires the account to have been connected through `bot-connect`, which is
 * what puts `guild_id` in metadata. Accounts connected through the older
 * `identify` flow have no server attached and cannot list anything — they get a
 * 409 telling them to reconnect, because there is genuinely nothing else to do.
 */

// GUILD_TEXT and GUILD_ANNOUNCEMENT. The rest (voice, category, forum, stage)
// cannot take a plain message and would only be noise in the picker.
const POSTABLE_CHANNEL_TYPES = [0, 5]

interface DiscordChannel { id: string; name: string; type: number; position?: number }

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.error('[discord/channels] DISCORD_BOT_TOKEN is not set')
    return NextResponse.json(
      { error: 'Discord is not fully configured on our side. We have been notified.' },
      { status: 503 }
    )
  }

  // Never discard the error — a failed lookup here reads exactly like "no
  // Discord account" and would send someone to reconnect for no reason.
  const { data: account, error } = await supabase
    .from('connected_accounts')
    .select('metadata')
    .eq('user_id', user.id)
    .eq('platform', 'discord')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('[discord/channels] account lookup failed:', error.message)
    return NextResponse.json({ error: 'Could not read your Discord connection.' }, { status: 500 })
  }
  if (!account) {
    return NextResponse.json({ error: 'No Discord account connected.' }, { status: 404 })
  }

  const guildId = (account.metadata as { guild_id?: string } | null)?.guild_id
  if (!guildId) {
    return NextResponse.json(
      {
        error: 'reconnect_required',
        message: 'This Discord account was connected before we could see your server. Reconnect Discord to pick a channel.',
      },
      { status: 409 }
    )
  }

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.warn('[discord/channels] guild fetch failed:', res.status, detail.slice(0, 200))
    // 403/404 here almost always means the bot was kicked or the server was
    // deleted. Say that, rather than a status code.
    if (res.status === 403 || res.status === 404) {
      return NextResponse.json(
        {
          error: 'reconnect_required',
          message: 'We can no longer see that Discord server. The bot may have been removed. Reconnect Discord to fix it.',
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Discord did not respond. Try again in a moment.' }, { status: 502 })
  }

  const all = (await res.json()) as DiscordChannel[]
  const channels = all
    .filter(c => POSTABLE_CHANNEL_TYPES.includes(c.type))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(c => ({ id: c.id, name: c.name }))

  return NextResponse.json({
    guildId,
    guildName: (account.metadata as { guild_name?: string } | null)?.guild_name ?? null,
    channels,
  })
}

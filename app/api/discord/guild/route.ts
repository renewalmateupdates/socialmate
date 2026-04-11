export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getGuildStats, getGuildChannels, getGuildRoles } from '@/lib/discord-bot'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Find the user's discord connected account with a guild_id in metadata
  const { data: accounts, error: acctError } = await admin
    .from('connected_accounts')
    .select('id, platform_user_id, account_name, metadata')
    .eq('user_id', user.id)
    .eq('platform', 'discord')

  if (acctError) return NextResponse.json({ error: acctError.message }, { status: 500 })

  // Find an account that has a guild_id stored in metadata
  const account = accounts?.find((a: any) => a.metadata?.guild_id)

  if (!account) {
    return NextResponse.json({ connected: false, guild: null, channels: [], roles: [], guild_id: null })
  }

  const guildId: string = account.metadata.guild_id
  const now = Date.now()
  const cachedAt: number = account.metadata.guild_cached_at ?? 0
  const FIVE_MIN = 5 * 60 * 1000

  // Return cached stats if fresh
  if (account.metadata.guild_cache && now - cachedAt < FIVE_MIN) {
    const cached = account.metadata.guild_cache
    return NextResponse.json({
      connected: true,
      guild: cached.guild,
      channels: cached.channels,
      roles: cached.roles,
      guild_id: guildId,
    })
  }

  // Fetch fresh from Discord Bot API
  try {
    const [guild, channels, roles] = await Promise.all([
      getGuildStats(guildId),
      getGuildChannels(guildId),
      getGuildRoles(guildId),
    ])

    // Cache in metadata
    const updatedMetadata = {
      ...account.metadata,
      guild_cache: { guild, channels, roles },
      guild_cached_at: now,
    }

    await admin
      .from('connected_accounts')
      .update({ metadata: updatedMetadata })
      .eq('id', account.id)

    return NextResponse.json({
      connected: true,
      guild,
      channels,
      roles,
      guild_id: guildId,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Discord API error' }, { status: 502 })
  }
}

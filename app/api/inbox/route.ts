export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// ── Types ─────────────────────────────────────────────────────────────────────
export type InboxItem = {
  id: string
  platform: 'bluesky' | 'mastodon' | 'telegram' | 'discord'
  type: 'mention' | 'reply' | 'like' | 'repost' | 'follow' | 'message'
  from_name: string
  from_handle: string
  from_avatar?: string
  content: string
  post_url?: string
  timestamp: string
  read: boolean
  // Bluesky threading refs (for reply)
  parent_uri?: string
  parent_cid?: string
  root_uri?: string
  root_cid?: string
  // Mastodon reply refs
  in_reply_to_id?: string
  instance?: string
}

// ── Bluesky ──────────────────────────────────────────────────────────────────
async function fetchBluesky(account: {
  access_token: string
  refresh_token: string
  user_id: string
}): Promise<InboxItem[]> {
  let accessJwt = account.access_token

  try {
    const refreshRes = await fetch(
      'https://bsky.social/xrpc/com.atproto.server.refreshSession',
      { method: 'POST', headers: { Authorization: `Bearer ${account.refresh_token}` } }
    )
    if (refreshRes.ok) {
      const session = await refreshRes.json()
      accessJwt = session.accessJwt
      await getSupabaseAdmin()
        .from('connected_accounts')
        .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
        .eq('user_id', account.user_id)
        .eq('platform', 'bluesky')
    }
  } catch {
    // Use existing token if refresh fails
  }

  const res = await fetch(
    'https://bsky.social/xrpc/app.bsky.notification.listNotifications?limit=50',
    { headers: { Authorization: `Bearer ${accessJwt}` } }
  )
  if (!res.ok) return []

  const { notifications } = await res.json()

  const TYPE_MAP: Record<string, InboxItem['type']> = {
    mention: 'mention',
    reply:   'reply',
    quote:   'mention',
    like:    'like',
    repost:  'repost',
    follow:  'follow',
  }

  return (notifications || [])
    .filter((n: any) => TYPE_MAP[n.reason])
    .map((n: any): InboxItem => {
      // n.uri is the notification subject (the post that triggered it).
      // n.record.reply contains parent/root refs when the notification IS a reply.
      const parentRef = n.record?.reply?.parent
      const rootRef   = n.record?.reply?.root

      return {
        id:          `bsky-${n.uri || n.cid}`,
        platform:    'bluesky',
        type:        TYPE_MAP[n.reason],
        from_name:   n.author?.displayName || n.author?.handle || 'Unknown',
        from_handle: n.author?.handle ? `@${n.author.handle}` : 'unknown',
        from_avatar: n.author?.avatar,
        content:     n.record?.text || '',
        post_url:    n.uri && n.author?.handle
          ? `https://bsky.app/profile/${n.author.handle}/post/${n.uri.split('/').pop()}`
          : undefined,
        timestamp:   n.indexedAt,
        read:        !!n.isRead,
        // Threading refs so the client can send a properly-threaded reply
        parent_uri:  n.uri,
        parent_cid:  n.cid,
        root_uri:    rootRef?.uri   || n.uri,
        root_cid:    rootRef?.cid   || n.cid,
      }
    })
}

// ── Mastodon ─────────────────────────────────────────────────────────────────
async function fetchMastodon(account: {
  access_token: string
  platform_user_id: string
  [key: string]: any
}): Promise<InboxItem[]> {
  // instance_url may be a top-level column or embedded in platform_user_id as "id@instance.tld"
  let instanceUrl =
    account.instance_url ||
    account.extra?.instance_url ||
    ''
  if (!instanceUrl && account.platform_user_id?.includes('@')) {
    const parts = account.platform_user_id.split('@')
    instanceUrl = `https://${parts[parts.length - 1]}`
  }
  if (!instanceUrl) instanceUrl = 'https://mastodon.social'

  const base = instanceUrl.replace(/\/$/, '')
  // Derive just the host for use as the `instance` field (no trailing slash, no protocol)
  const instanceHost = instanceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

  const params = new URLSearchParams({ limit: '50' })
  ;['mention', 'reblog', 'favourite', 'follow'].forEach(t => params.append('types[]', t))

  const res = await fetch(`${base}/api/v1/notifications?${params}`, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  })
  if (!res.ok) return []

  const notifications = await res.json()
  if (!Array.isArray(notifications)) return []

  const TYPE_MAP: Record<string, InboxItem['type']> = {
    mention:   'mention',
    reblog:    'repost',
    favourite: 'like',
    follow:    'follow',
  }

  return notifications
    .filter((n: any) => TYPE_MAP[n.type])
    .map((n: any): InboxItem => ({
      id:             `masto-${n.id}`,
      platform:       'mastodon',
      type:           TYPE_MAP[n.type],
      from_name:      n.account?.display_name || n.account?.acct || 'Unknown',
      from_handle:    n.account?.acct ? `@${n.account.acct}` : 'unknown',
      from_avatar:    n.account?.avatar,
      content:        n.status?.content ? n.status.content.replace(/<[^>]*>/g, '') : '',
      post_url:       n.status?.url,
      timestamp:      n.created_at,
      read:           false, // Mastodon v1 API doesn't expose per-notification read state
      // Reply refs
      in_reply_to_id: n.status?.id,
      instance:       instanceHost,
    }))
}

// ── Telegram ─────────────────────────────────────────────────────────────────
async function fetchTelegram(account: {
  access_token: string
}): Promise<InboxItem[]> {
  const botToken = account.access_token
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/getUpdates?limit=50&allowed_updates=["message"]`
  )
  if (!res.ok) return []

  const data = await res.json()
  if (!data.ok || !Array.isArray(data.result)) return []

  return data.result
    .filter((update: any) => update.message)
    .map((update: any): InboxItem => {
      const msg  = update.message
      const from = msg.from || {}
      const firstName = from.first_name || ''
      const lastName  = from.last_name  || ''
      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || 'Telegram User'
      const handle    = from.username ? `@${from.username}` : `id:${from.id}`
      const chatType  = msg.chat?.type || 'private'
      const chatTitle = msg.chat?.title
      const content   = msg.text || msg.caption || `[${msg.photo ? 'photo' : msg.sticker ? 'sticker' : 'media'}]`

      return {
        id:          `tg-${update.update_id}`,
        platform:    'telegram',
        type:        'message',
        from_name:   chatTitle && chatType !== 'private' ? `${fullName} (${chatTitle})` : fullName,
        from_handle: handle,
        content,
        timestamp:   new Date(msg.date * 1000).toISOString(),
        read:        false,
      }
    })
}

// ── Discord ──────────────────────────────────────────────────────────────────
async function fetchDiscord(account: {
  access_token: string
  metadata?: { guild_id?: string; guild_name?: string }
}): Promise<InboxItem[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) return []

  const guildId = account.metadata?.guild_id
  if (!guildId) return []

  // Fetch text channels in the guild
  const channelsRes = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    { headers: { Authorization: `Bot ${botToken}` } }
  )
  if (!channelsRes.ok) return []

  const channels = await channelsRes.json()
  if (!Array.isArray(channels)) return []

  // GUILD_TEXT = 0, GUILD_ANNOUNCEMENT = 5
  const textChannels = channels
    .filter((c: any) => c.type === 0 || c.type === 5)
    .slice(0, 5) // limit to first 5 text channels to avoid rate limits

  const guildName = account.metadata?.guild_name || 'Discord Server'

  const messagesPerChannel = await Promise.all(
    textChannels.map(async (channel: any) => {
      try {
        const msgRes = await fetch(
          `https://discord.com/api/v10/channels/${channel.id}/messages?limit=10`,
          { headers: { Authorization: `Bot ${botToken}` } }
        )
        if (!msgRes.ok) return []
        const msgs = await msgRes.json()
        if (!Array.isArray(msgs)) return []

        return msgs
          .filter((m: any) => m.content || m.embeds?.length > 0)
          .map((m: any): InboxItem => ({
            id:          `discord-${m.id}`,
            platform:    'discord',
            type:        'message',
            from_name:   m.author?.global_name || m.author?.username || 'Discord User',
            from_handle: m.author?.username ? `@${m.author.username}` : 'unknown',
            from_avatar: m.author?.avatar
              ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
              : undefined,
            content:     m.content || (m.embeds?.[0]?.description ?? '[embed]'),
            post_url:    `https://discord.com/channels/${guildId}/${channel.id}/${m.id}`,
            timestamp:   m.timestamp,
            read:        false,
          }))
      } catch {
        return []
      }
    })
  )

  return messagesPerChannel.flat()
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const platformFilter = searchParams.get('platform') || 'all'

  // Determine which platforms to fetch
  const wantedPlatforms =
    platformFilter === 'all'
      ? ['bluesky', 'mastodon', 'telegram', 'discord']
      : [platformFilter]

  const { data: accounts } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('platform, access_token, refresh_token, platform_user_id, instance_url, metadata')
    .eq('user_id', user.id)
    .in('platform', wantedPlatforms)

  const allAccounts = accounts || []

  const bskyAccount    = allAccounts.find((a: any) => a.platform === 'bluesky')
  const mastoAccount   = allAccounts.find((a: any) => a.platform === 'mastodon')
  const tgAccount      = allAccounts.find((a: any) => a.platform === 'telegram')
  const discordAccount = allAccounts.find((a: any) => a.platform === 'discord' && a.metadata?.guild_id)

  const [bskyItems, mastoItems, tgItems, discordItems] = await Promise.all([
    bskyAccount && wantedPlatforms.includes('bluesky')
      ? fetchBluesky({ ...bskyAccount, user_id: user.id }).catch(() => [])
      : Promise.resolve([]),
    mastoAccount && wantedPlatforms.includes('mastodon')
      ? fetchMastodon(mastoAccount).catch(() => [])
      : Promise.resolve([]),
    tgAccount && wantedPlatforms.includes('telegram')
      ? fetchTelegram(tgAccount).catch(() => [])
      : Promise.resolve([]),
    discordAccount && wantedPlatforms.includes('discord')
      ? fetchDiscord(discordAccount).catch(() => [])
      : Promise.resolve([]),
  ])

  const items: InboxItem[] = [
    ...bskyItems,
    ...mastoItems,
    ...tgItems,
    ...discordItems,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const connectedPlatforms = Array.from(new Set(allAccounts.map((a: any) => a.platform)))

  return NextResponse.json({ items, connectedPlatforms })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export type UnifiedNotification = {
  id: string
  platform: 'bluesky' | 'mastodon'
  type: 'mention' | 'reply' | 'like' | 'repost' | 'follow'
  actor_handle: string
  actor_display_name: string
  content?: string
  created_at: string
  read: boolean
}

// ── Bluesky ──────────────────────────────────────────────────────────────────
async function fetchBluesky(account: {
  access_token: string
  refresh_token: string
  user_id: string
}): Promise<UnifiedNotification[]> {
  let accessJwt = account.access_token

  // Attempt token refresh
  try {
    const refreshRes = await fetch(
      'https://bsky.social/xrpc/com.atproto.server.refreshSession',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${account.refresh_token}` },
      }
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

  const TYPE_MAP: Record<string, UnifiedNotification['type']> = {
    mention: 'mention',
    reply:   'reply',
    quote:   'mention',
    like:    'like',
    repost:  'repost',
    follow:  'follow',
  }

  return (notifications || [])
    .filter((n: any) => TYPE_MAP[n.reason])
    .map((n: any): UnifiedNotification => ({
      id:                 `bsky-${n.uri || n.cid}`,
      platform:           'bluesky',
      type:               TYPE_MAP[n.reason],
      actor_handle:       n.author?.handle ? `@${n.author.handle}` : 'unknown',
      actor_display_name: n.author?.displayName || n.author?.handle || 'Unknown',
      content:            n.record?.text,
      created_at:         n.indexedAt,
      read:               !!n.isRead,
    }))
}

// ── Mastodon ─────────────────────────────────────────────────────────────────
async function fetchMastodon(account: {
  access_token: string
  platform_user_id: string
  instance_url?: string
}): Promise<UnifiedNotification[]> {
  // instance_url may be stored in extra metadata — fall back to mastodon.social
  const instanceUrl =
    (account as any).instance_url ||
    (account as any).extra?.instance_url ||
    'https://mastodon.social'

  const base = instanceUrl.replace(/\/$/, '')

  const params = new URLSearchParams({
    limit: '50',
  })
  ;['mention', 'reblog', 'favourite', 'follow'].forEach(t =>
    params.append('types[]', t)
  )

  const res = await fetch(`${base}/api/v1/notifications?${params}`, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  })
  if (!res.ok) return []

  const notifications = await res.json()
  if (!Array.isArray(notifications)) return []

  const TYPE_MAP: Record<string, UnifiedNotification['type']> = {
    mention:   'mention',
    reblog:    'repost',
    favourite: 'like',
    follow:    'follow',
  }

  return notifications
    .filter((n: any) => TYPE_MAP[n.type])
    .map((n: any): UnifiedNotification => ({
      id:                 `masto-${n.id}`,
      platform:           'mastodon',
      type:               TYPE_MAP[n.type],
      actor_handle:       n.account?.acct ? `@${n.account.acct}` : 'unknown',
      actor_display_name: n.account?.display_name || n.account?.acct || 'Unknown',
      content:            n.status?.content
        ? n.status.content.replace(/<[^>]*>/g, '') // strip HTML tags
        : undefined,
      created_at: n.created_at,
      read:       false, // Mastodon doesn't expose per-notification read state via v1 API
    }))
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: accounts } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('platform, access_token, refresh_token, platform_user_id, instance_url')
    .eq('user_id', user.id)
    .in('platform', ['bluesky', 'mastodon'])

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ notifications: [], platforms: [] })
  }

  const bskyAccount   = accounts.find((a: any) => a.platform === 'bluesky')
  const mastoAccount  = accounts.find((a: any) => a.platform === 'mastodon')

  const [bskyNotifs, mastoNotifs] = await Promise.all([
    bskyAccount
      ? fetchBluesky({ ...bskyAccount, user_id: user.id }).catch(() => [])
      : Promise.resolve([]),
    mastoAccount
      ? fetchMastodon(mastoAccount).catch(() => [])
      : Promise.resolve([]),
  ])

  // Merge + sort by newest first
  const notifications: UnifiedNotification[] = [
    ...bskyNotifs,
    ...mastoNotifs,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const platforms = accounts.map((a: any) => a.platform)

  return NextResponse.json({ notifications, platforms })
}

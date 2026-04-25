export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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

export async function POST() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all user's connected Mastodon accounts (may have multiple instances)
  const { data: accounts } = await supabase
    .from('connected_accounts')
    .select('platform_user_id, access_token')
    .eq('user_id', user.id)
    .eq('platform', 'mastodon')

  if (!accounts?.length) {
    return NextResponse.json({ synced: 0, error: 'No Mastodon account connected' })
  }

  // Build a map of mastodonId -> { instance, access_token }
  // platform_user_id is stored as "{mastodonId}@{instance}"
  const accountMap: Record<string, { instance: string; access_token: string }> = {}
  for (const acct of accounts) {
    const parts = acct.platform_user_id?.split('@')
    if (!parts || parts.length < 2) continue
    const mastodonId = parts[0]
    const instance = parts.slice(1).join('@') // handle instances that might contain @
    accountMap[mastodonId] = { instance, access_token: acct.access_token }
  }

  if (!Object.keys(accountMap).length) {
    return NextResponse.json({ synced: 0, error: 'Could not parse Mastodon account info' })
  }

  const admin = getSupabaseAdmin()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch posts that need syncing:
  // - include mastodon in platforms
  // - published or partial
  // - mastodon_stats is null OR last synced > 7 days ago
  const { data: ourPosts } = await admin
    .from('posts')
    .select('id, platform_post_ids, mastodon_stats')
    .eq('user_id', user.id)
    .contains('platforms', ['mastodon'])
    .in('status', ['published', 'partial'])
    .not('platform_post_ids', 'is', null)
    .limit(50)

  if (!ourPosts?.length) {
    return NextResponse.json({ synced: 0 })
  }

  // Filter to posts where mastodon_stats is null or fetched_at is older than 7 days
  const postsToSync = ourPosts.filter(p => {
    const stats = p.mastodon_stats as { fetched_at?: string } | null
    if (!stats) return true
    if (!stats.fetched_at) return true
    return stats.fetched_at < sevenDaysAgo
  })

  if (!postsToSync.length) {
    return NextResponse.json({ synced: 0, message: 'All posts already synced recently' })
  }

  let synced = 0
  const errors: string[] = []
  const fetchedAt = new Date().toISOString()

  for (const post of postsToSync) {
    const ids = post.platform_post_ids as Record<string, string> | null
    if (!ids) continue

    // platform_post_ids->mastodon may be stored as "{statusId}@{instance}" or just the status ID
    const rawId = ids['mastodon']
    if (!rawId) continue

    // Try to extract instance + status ID
    // Stored format options: "12345@mastodon.social" or just "12345"
    let statusId: string
    let instance: string | null = null
    let accessToken: string | null = null

    if (rawId.includes('@')) {
      const atIdx = rawId.indexOf('@')
      statusId = rawId.slice(0, atIdx)
      instance = rawId.slice(atIdx + 1)
      // Find matching account by instance
      const match = Object.values(accountMap).find(a => a.instance === instance)
      accessToken = match?.access_token ?? null
    } else {
      // No instance in the ID — use the first connected account
      statusId = rawId
      const firstAccount = Object.values(accountMap)[0]
      instance = firstAccount?.instance ?? null
      accessToken = firstAccount?.access_token ?? null
    }

    if (!instance || !accessToken || !statusId) {
      errors.push(`post ${post.id}: could not determine instance or token`)
      continue
    }

    try {
      const res = await fetch(`https://${instance}/api/v1/statuses/${statusId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res.ok) {
        if (res.status === 404) {
          errors.push(`post ${post.id}: status not found on ${instance}`)
        } else {
          errors.push(`post ${post.id}: Mastodon API error ${res.status}`)
        }
        continue
      }

      const status = await res.json()

      await admin
        .from('posts')
        .update({
          mastodon_stats: {
            favourites_count: status.favourites_count ?? 0,
            reblogs_count:    status.reblogs_count ?? 0,
            replies_count:    status.replies_count ?? 0,
            fetched_at:       fetchedAt,
          },
        })
        .eq('id', post.id)

      synced++
    } catch (err) {
      errors.push(`post ${post.id}: ${String(err)}`)
    }
  }

  return NextResponse.json({ synced, errors: errors.length ? errors : undefined })
}

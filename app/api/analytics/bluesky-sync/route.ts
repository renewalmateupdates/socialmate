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

  // Get user's Bluesky connected account (any workspace)
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('platform_user_id, account_name, access_token')
    .eq('user_id', user.id)
    .eq('platform', 'bluesky')
    .limit(1)
    .maybeSingle()

  if (!account) {
    return NextResponse.json({ synced: 0, error: 'No Bluesky account connected' })
  }

  const handle = account.account_name ?? account.platform_user_id

  try {
    // Fetch last 20 posts from Bluesky public API
    const feedRes = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=20`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!feedRes.ok) {
      return NextResponse.json({ synced: 0, error: 'Bluesky sync unavailable' })
    }

    const feedData = await feedRes.json()
    const feedItems: any[] = feedData.feed ?? []

    if (!feedItems.length) {
      return NextResponse.json({ synced: 0 })
    }

    // Extract post URIs and engagement counts
    const blueskyPosts = feedItems.map((item: any) => ({
      uri:         item.post?.uri as string,
      likeCount:   (item.post?.likeCount as number) ?? 0,
      repostCount: (item.post?.repostCount as number) ?? 0,
      replyCount:  (item.post?.replyCount as number) ?? 0,
    })).filter(p => p.uri)

    // Fetch our posts that have platform_post_ids containing bluesky URIs
    const admin = getSupabaseAdmin()
    const { data: ourPosts } = await admin
      .from('posts')
      .select('id, platform_post_ids')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .not('platform_post_ids', 'is', null)

    if (!ourPosts?.length) {
      return NextResponse.json({ synced: 0 })
    }

    let synced = 0
    const fetchedAt = new Date().toISOString()

    for (const bskyPost of blueskyPosts) {
      // Find matching post in our DB where platform_post_ids->bluesky contains the URI
      const match = ourPosts.find(p => {
        const ids = p.platform_post_ids as Record<string, string> | null
        if (!ids) return false
        // The stored value may be the full URI or just the rkey portion
        const storedUri = ids['bluesky'] ?? ''
        return storedUri === bskyPost.uri || bskyPost.uri.endsWith(storedUri)
      })

      if (!match) continue

      await admin
        .from('posts')
        .update({
          bluesky_stats: {
            likes:      bskyPost.likeCount,
            reposts:    bskyPost.repostCount,
            replies:    bskyPost.replyCount,
            fetched_at: fetchedAt,
          },
        })
        .eq('id', match.id)

      synced++
    }

    return NextResponse.json({ synced })
  } catch {
    return NextResponse.json({ synced: 0, error: 'Bluesky sync unavailable' })
  }
}

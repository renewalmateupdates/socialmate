export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function fetchBlueskyEngagement(postUri: string, accessToken: string) {
  try {
    const res = await fetch(
      `https://bsky.social/xrpc/app.bsky.feed.getPosts?uris=${encodeURIComponent(postUri)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const post = data.posts?.[0]
    if (!post) return null
    return {
      likes: post.likeCount || 0,
      reposts: post.repostCount || 0,
      replies: post.replyCount || 0,
      quotes: post.quoteCount || 0,
    }
  } catch {
    return null
  }
}

async function fetchMastodonEngagement(postId: string, instance: string, accessToken: string) {
  try {
    const res = await fetch(`https://${instance}/api/v1/statuses/${postId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      likes: data.favourites_count || 0,
      reposts: data.reblogs_count || 0,
      replies: data.replies_count || 0,
    }
  } catch {
    return null
  }
}

async function fetchDiscordEngagement(messageId: string, accessToken: string) {
  try {
    // Get DM channels first
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!dmRes.ok) return null
    const channels = await dmRes.json()
    if (!channels.length) return null

    // Try each channel to find the message
    for (const channel of channels.slice(0, 3)) {
      const msgRes = await fetch(
        `https://discord.com/api/v10/channels/${channel.id}/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (msgRes.ok) {
        const msg = await msgRes.json()
        const reactionCount = (msg.reactions || []).reduce(
          (sum: number, r: any) => sum + (r.count || 0), 0
        )
        return {
          reactions: reactionCount,
          replies: 0,
        }
      }
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all published posts with platform_post_ids
  const { data: posts } = await getSupabaseAdmin()
    .from('posts')
    .select('id, platforms, platform_post_ids, analytics')
    .eq('user_id', user.id)
    .eq('status', 'published')
    .not('platform_post_ids', 'is', null)

  if (!posts?.length) {
    return NextResponse.json({ synced: 0 })
  }

  // Get connected accounts for this user
  const { data: accounts } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('platform, access_token, platform_user_id')
    .eq('user_id', user.id)

  const accountMap = (accounts || []).reduce((acc, a) => {
    acc[a.platform] = a
    return acc
  }, {} as Record<string, any>)

  let synced = 0

  for (const post of posts) {
    const postIds = post.platform_post_ids as Record<string, string>
    if (!postIds) continue

    const newAnalytics: Record<string, any> = post.analytics || {}
    let updated = false

    for (const [platform, postId] of Object.entries(postIds)) {
      const account = accountMap[platform]
      if (!account) continue

      let engagement = null

      if (platform === 'bluesky') {
        engagement = await fetchBlueskyEngagement(postId, account.access_token)
      } else if (platform === 'mastodon') {
        const instance = account.platform_user_id?.split('@').slice(1).join('@')
        if (instance) {
          engagement = await fetchMastodonEngagement(postId, instance, account.access_token)
        }
      } else if (platform === 'discord') {
        engagement = await fetchDiscordEngagement(postId, account.access_token)
      }

      if (engagement) {
        newAnalytics[platform] = {
          ...engagement,
          synced_at: new Date().toISOString(),
        }
        updated = true
      }
    }

    if (updated) {
      await getSupabaseAdmin()
        .from('posts')
        .update({ analytics: newAnalytics })
        .eq('id', post.id)
      synced++
    }
  }

  return NextResponse.json({ synced, total: posts.length })
}
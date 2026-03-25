import { Inngest } from 'inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

export const inngest = new Inngest({ id: 'socialmate' })

export const publishScheduledPost = inngest.createFunction(
  {
    id:      'publish-scheduled-post',
    // Retry up to 3 times with exponential backoff before giving up
    retries: 3,
    // Prevent multiple simultaneous runs for the same post
    concurrency: { limit: 10 },
  },
  { event: 'post/scheduled' },
  async ({ event, step }) => {
    const { postId, scheduledAt } = event.data

    if (!postId || !scheduledAt) {
      throw new Error('Missing postId or scheduledAt in event data')
    }

    // Sleep until the scheduled time
    await step.sleepUntil('wait-until-scheduled', new Date(scheduledAt))

    // Publish the post (wrapped in step for retry isolation)
    const result = await step.run('publish-post', async () => {
      // ── IDEMPOTENCY GUARD ─────────────────────────────────────────────────
      // Check DB state before doing ANYTHING. If Inngest retries after a
      // transient error, this guard prevents the post from being sent twice.
      const { data: postCheck } = await getSupabaseAdmin()
        .from('posts')
        .select('status, published_at, platform_post_ids')
        .eq('id', postId)
        .single()

      const alreadyTerminal =
        postCheck?.status === 'published' ||
        postCheck?.status === 'partial'   ||
        postCheck?.status === 'failed'    ||
        !!postCheck?.published_at

      if (alreadyTerminal) {
        console.log(`[PUBLISH-GUARD] Post ${postId} already in terminal state (${postCheck?.status}), skipping`)
        return { skipped: true, status: postCheck?.status }
      }
      // ─────────────────────────────────────────────────────────────────────

      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/publish`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId, fromInngest: true }),
      })

      const data = await res.json().catch(() => ({}))

      // 409 = publish route guard caught a duplicate (race condition)
      if (res.status === 409) {
        console.log(`[PUBLISH-GUARD] Post ${postId} returned 409 — already published, skipping`)
        return { skipped: true, status: 'published' }
      }

      if (!res.ok) {
        // Mark post as failed so it doesn't stay stuck in 'scheduled' state.
        // The fail route uses .eq('status','scheduled') so it's idempotent.
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/fail`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ postId }),
        }).catch(err => console.error('[Inngest] Failed to mark post as failed:', err))

        const errMsg = data.error || `HTTP ${res.status}`
        console.error(`[Inngest] Publish failed for post ${postId}: ${errMsg}`)
        throw new Error(`Publish failed: ${errMsg}`)
      }

      console.log(`[Inngest] Successfully published post ${postId}:`, {
        status:    data.status,
        platforms: data.results?.map((r: any) => `${r.platform}:${r.success ? 'ok' : 'fail'}`),
      })

      return data
    })

    return result
  }
)

// Weekly email digest — runs every Monday at 9am UTC
export const weeklyDigest = inngest.createFunction(
  { id: 'weekly-digest', retries: 2 },
  { cron: '0 9 * * 1' },
  async ({ step }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Get all users who published at least 1 post in the last 7 days
    const { data: recentPosts } = await step.run('fetch-active-users', async () => {
      return getSupabaseAdmin()
        .from('posts')
        .select('user_id, platforms, published_at')
        .gte('published_at', weekAgo)
        .in('status', ['published', 'partial'])
        .order('published_at', { ascending: false })
    })

    if (!recentPosts || recentPosts.length === 0) {
      console.log('[Weekly Digest] No active users this week')
      return { sent: 0 }
    }

    // Group posts by user
    const userPostMap: Record<string, any[]> = {}
    for (const post of recentPosts) {
      if (!userPostMap[post.user_id]) userPostMap[post.user_id] = []
      userPostMap[post.user_id].push(post)
    }

    const userIds = Object.keys(userPostMap)
    let sent = 0

    await step.run('send-digests', async () => {
      // Fetch user emails in batch
      const { data: settings } = await getSupabaseAdmin()
        .from('user_settings')
        .select('user_id, notification_prefs')
        .in('user_id', userIds)

      const usersRes = await getSupabaseAdmin().auth.admin.listUsers()
      const users = usersRes.data?.users ?? []
      const emailMap: Record<string, string> = {}
      for (const u of users) { if (u.email) emailMap[u.id] = u.email }

      for (const userId of userIds) {
        const email = emailMap[userId]
        if (!email) continue

        // Check if user has opted out of weekly digest (key: weekly_digest, default: true)
        const userSettings = settings?.find(s => s.user_id === userId)
        const prefs = userSettings?.notification_prefs || {}
        if (prefs.weekly_digest === false) continue

        const posts = userPostMap[userId]
        const postCount = posts.length
        const platformSet = new Set<string>(posts.flatMap((p: any) => p.platforms || []))
        const platforms = Array.from(platformSet)

        await getResend().emails.send({
          from: 'SocialMate <hello@socialmate.studio>',
          to: email,
          subject: `📊 Your week on SocialMate — ${postCount} post${postCount !== 1 ? 's' : ''} published`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
              <div style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">SocialMate</div>
              <p style="color: #888; font-size: 12px; margin: 0 0 24px;">Weekly digest · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Your week in review 📊</h2>
              <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 32px; font-weight: 800; color: #111;">${postCount}</div>
                <div style="font-size: 13px; color: #555;">post${postCount !== 1 ? 's' : ''} published this week</div>
                ${platforms.length > 0 ? `<div style="font-size: 12px; color: #888; margin-top: 8px;">on ${platforms.join(', ')}</div>` : ''}
              </div>
              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                Keep up the momentum. Consistent posting is the #1 driver of social media growth.
              </p>
              <a href="${appUrl}/dashboard" style="display: inline-block; margin-top: 20px; background: #000; color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
                View Dashboard →
              </a>
              <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />
              <p style="color: #bbb; font-size: 11px;">
                You're receiving this because you published posts this week.
                <a href="${appUrl}/settings?tab=Notifications" style="color: #bbb;">Manage preferences</a>
              </p>
            </div>
          `,
        })
        sent++
      }
      return { sent }
    })

    console.log(`[Weekly Digest] Sent ${sent} emails`)
    return { sent }
  }
)

// Fetch post engagement metrics 1hr and 24hr after publish
export const fetchPostAnalytics = inngest.createFunction(
  { id: 'fetch-post-analytics', retries: 2 },
  { event: 'post/published' },
  async ({ event, step }) => {
    const { postId, platformPostIds } = event.data as {
      postId: string
      userId: string
      platformPostIds: Record<string, string>
    }

    async function fetchEngagement(): Promise<Record<string, { likes: number; replies: number; reposts: number }>> {
      const analytics: Record<string, { likes: number; replies: number; reposts: number }> = {}

      // Bluesky — public API, no auth needed
      const bskyUri = platformPostIds?.bluesky
      if (bskyUri) {
        try {
          const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=${encodeURIComponent(bskyUri)}`)
          if (res.ok) {
            const data = await res.json()
            const post = data.posts?.[0]
            if (post) {
              analytics.bluesky = {
                likes:   post.likeCount   ?? 0,
                replies: post.replyCount  ?? 0,
                reposts: post.repostCount ?? 0,
              }
            }
          }
        } catch { /* ignore */ }
      }

      // Mastodon — needs instance URL from user's connected account
      const mastodonId = platformPostIds?.mastodon
      if (mastodonId) {
        try {
          const { data: account } = await getSupabaseAdmin()
            .from('connected_accounts')
            .select('platform_user_id, access_token')
            .eq('platform', 'mastodon')
            .single()
          if (account) {
            const instance = account.platform_user_id?.split('@')[1]
            if (instance) {
              const res = await fetch(`https://${instance}/api/v1/statuses/${mastodonId}`, {
                headers: { 'Authorization': `Bearer ${account.access_token}` },
              })
              if (res.ok) {
                const data = await res.json()
                analytics.mastodon = {
                  likes:   data.favourites_count ?? 0,
                  replies: data.replies_count    ?? 0,
                  reposts: data.reblogs_count    ?? 0,
                }
              }
            }
          }
        } catch { /* ignore */ }
      }

      return analytics
    }

    // Fetch at 1 hour
    await step.sleepUntil('wait-1hr', new Date(Date.now() + 60 * 60 * 1000))
    const analytics1h = await step.run('fetch-1hr', fetchEngagement)
    await getSupabaseAdmin()
      .from('posts')
      .update({ analytics: { ...analytics1h, fetched_at_1h: new Date().toISOString() } })
      .eq('id', postId)

    // Fetch at 24 hours — merge with 1h data
    await step.sleepUntil('wait-24hr', new Date(Date.now() + 23 * 60 * 60 * 1000))
    const analytics24h = await step.run('fetch-24hr', fetchEngagement)
    // Merge 24h into the 1h snapshot so both snapshots are preserved
    await getSupabaseAdmin()
      .from('posts')
      .update({
        analytics: {
          ...analytics1h,
          fetched_at_1h: new Date().toISOString(),
          ...analytics24h,
          fetched_at_24h: new Date().toISOString(),
        },
      })
      .eq('id', postId)

    return { postId, analytics24h }
  }
)

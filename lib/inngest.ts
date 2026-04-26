import { Inngest } from 'inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { createDecipheriv } from 'crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SOMA_COSTS } from '@/lib/soma-costs'
import {
  getRecentMembers,
  sendChannelMessage,
  assignRole,
} from '@/lib/discord-bot'
import {
  enkiCalcEMA, enkiCalcRSI, enkiCalcMACD, enkiCalcBB,
  enkiCalcATR, enkiCalcADX, enkiCalcPearsonCorr, enkiVolumeSpike,
} from '@/lib/enki/indicators'
import {
  enkiAnalyzeSymbol, enkiMakeRiskDecision,
  type FusedSignal,
} from '@/lib/enki/strategy-engine'
import {
  scoreTruthMomentum, scoreTruthMeanReversion, applyCongressionalBoost,
  fetchTruthCongressData, computeTrailPct, computeTruthKelly,
  truthCalcCorrelation,
  type TruthSignal, type TruthStrategy,
} from '@/lib/enki/truth-mode'

// ── Enki AES-256-CBC decrypt helper ───────────────────────────────────────────
// Mirrors the encrypt/decrypt in app/api/enki/brokers/alpaca/route.ts
function enkiDecryptKey(encryptedText: string): string {
  const hexKey = process.env.ENKI_ENCRYPTION_KEY
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('ENKI_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  const key = Buffer.from(hexKey, 'hex')
  const [ivHex, encHex] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

// ── Push notification helper ───────────────────────────────────────────────────
// Fire-and-forget: sends a browser push notification to a user via the
// /api/notifications/send route. Non-fatal — never throws.
// Generate VAPID keys with: npx web-push generate-vapid-keys
async function sendPushNotification(userId: string, title: string, body: string, url: string, tag: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
    await fetch(`${appUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.CRON_SECRET || '',
      },
      body: JSON.stringify({ user_id: userId, title, body, url, tag }),
    })
  } catch { /* non-fatal — push is best-effort */ }
}

export const inngest = new Inngest({ id: 'socialmate' })

export const publishScheduledPost = inngest.createFunction(
  {
    id:      'publish-scheduled-post',
    // Retry up to 3 times with exponential backoff before giving up
    retries: 3,
    // Prevent multiple simultaneous runs for the same post
    concurrency: { limit: 5 },
  },
  { event: 'post/scheduled' },
  async ({ event, step }) => {
    const { postId, scheduledAt } = event.data

    if (!postId || !scheduledAt) {
      throw new Error('Missing postId or scheduledAt in event data')
    }

    // Sleep until the scheduled time
    await step.sleepUntil('wait-until-scheduled', new Date(scheduledAt))

    // Idempotency guard: check post hasn't already been published before sleeping ends
    const postCheck = await step.run('check-post-status', async () => {
      const { data: post } = await getSupabaseAdmin()
        .from('posts')
        .select('id, status, published_at')
        .eq('id', postId)
        .single()
      return post
    })

    if (postCheck && postCheck.status !== 'scheduled') {
      console.log(`[PUBLISH-GUARD] Post ${postId} already has status="${postCheck.status}" — skipping publish`)
      return { skipped: true, reason: 'already_processed', status: postCheck.status }
    }

    // Publish the post (wrapped in step for retry isolation)
    const result = await step.run('publish-post', async () => {
      // ── IDEMPOTENCY GUARD ─────────────────────────────────────────────────
      // Check DB state before doing ANYTHING. If Inngest retries after a
      // transient error, this guard prevents the post from being sent twice.
      const { data: innerPostCheck } = await getSupabaseAdmin()
        .from('posts')
        .select('user_id, status, published_at, platform_post_ids, platforms')
        .eq('id', postId)
        .single()

      const alreadyTerminal =
        innerPostCheck?.status === 'published' ||
        innerPostCheck?.status === 'partial'   ||
        innerPostCheck?.status === 'failed'    ||
        !!innerPostCheck?.published_at

      if (alreadyTerminal) {
        console.log(`[PUBLISH-GUARD] Post ${postId} already in terminal state (${innerPostCheck?.status}), skipping`)
        return { skipped: true, status: innerPostCheck?.status }
      }

      const existingPostIds = (innerPostCheck?.platform_post_ids &&
        typeof innerPostCheck.platform_post_ids === 'object')
        ? innerPostCheck.platform_post_ids as Record<string, string>
        : null
      const hasExistingPostIds = existingPostIds && Object.keys(existingPostIds).length > 0

      if (hasExistingPostIds) {
        // Post was published in a previous attempt but the status write failed.
        // Repair the status now so the post doesn't stay stuck as 'scheduled'.
        const allPlatforms: string[] = innerPostCheck?.platforms || []
        const publishedCount = Object.keys(existingPostIds).length
        const repairedStatus = publishedCount >= allPlatforms.length ? 'published' : 'partial'
        await getSupabaseAdmin()
          .from('posts')
          .update({ status: repairedStatus, published_at: new Date().toISOString() })
          .eq('id', postId)
          .eq('status', 'scheduled') // safe guard — only repair if still scheduled
        console.log(`[PUBLISH-GUARD] Post ${postId} platform_post_ids already set — repaired status → ${repairedStatus}`)
        return { skipped: true, reason: 'platform_post_ids already set', repaired: repairedStatus }
      }
      // ─────────────────────────────────────────────────────────────────────

      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/publish`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId, fromInngest: true }),
      })

      const data = await res.json().catch(() => ({}))

      // 409 = already published (idempotency) — treat as success, don't retry
      if (res.status === 409) {
        console.log(`[PUBLISH-GUARD] Post ${postId} already published (409) — treating as success`)
        return { skipped: true, status: 'already_published' }
      }

      if (!res.ok) {
        const errMsg = data.error || `HTTP ${res.status}`

        // 'publishedOk: true' means the post WAS sent to the platform but the DB
        // status update failed. Do NOT mark as failed — that would be a lie.
        // Inngest will retry; the platform_post_ids guard will catch the duplicate.
        if (!data.publishedOk) {
          // Platform publish genuinely failed — safe to mark as failed in DB.
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/fail`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ postId }),
          }).catch(err => console.error('[Inngest] Failed to mark post as failed:', err))
          console.error(`[Inngest] Publish failed for post ${postId}: ${errMsg}`)
          // Fire-and-forget failure notification
          if (innerPostCheck?.user_id) {
            getSupabaseAdmin()
              .from('notifications')
              .insert({
                user_id:    innerPostCheck.user_id,
                type:       'post_failed',
                message:    `A scheduled post failed to publish. Check your connected accounts.`,
                action_url: '/queue',
              })
              .then(({ error }) => { if (error) console.warn('[notifications] insert failed:', error.message) })
          }
        } else {
          // Post was published but DB update failed — retry without calling fail route.
          console.warn(`[Inngest] Post ${postId} published OK but DB update failed — retrying (${errMsg})`)
        }

        throw new Error(`Publish failed: ${errMsg}`)
      }

      console.log(`[Inngest] Successfully published post ${postId}:`, {
        status:    data.status,
        platforms: data.results?.map((r: any) => `${r.platform}:${r.success ? 'ok' : 'fail'}`),
      })

      // Fire-and-forget success notification
      if (innerPostCheck?.user_id) {
        const platformList = (innerPostCheck.platforms || []).join(', ')
        getSupabaseAdmin()
          .from('notifications')
          .insert({
            user_id:    innerPostCheck.user_id,
            type:       'post_published',
            message:    platformList
              ? `Post published successfully to ${platformList}.`
              : 'Post published successfully.',
            action_url: '/queue',
          })
          .then(({ error }) => { if (error) console.warn('[notifications] insert failed:', error.message) })
        // Browser push notification — non-fatal, best-effort
        sendPushNotification(
          innerPostCheck.user_id,
          '✅ Post published',
          'Your post has been published successfully.',
          '/queue',
          'post-published',
        )
      }

      return data
    })

    return result
  }
)

// Weekly email digest — runs every Sunday at 8am UTC
export const weeklyDigest = inngest.createFunction(
  { id: 'weekly-digest', name: 'Weekly Digest Email', retries: 2 },
  { cron: '0 8 * * 0' },
  async ({ step }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const weekAgoIso = weekAgo.toISOString()
    const nowIso = now.toISOString()
    const nextWeekIso = nextWeek.toISOString()

    // Format week range for subject/header: "Apr 18 – Apr 25"
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const weekRange = `${fmt(weekAgo)} – ${fmt(now)}`

    // Step 1: fetch all users who have posted in the last 7 days
    const activeData = await step.run('fetch-active-users', async () => {
      const supabase = getSupabaseAdmin()

      // Published posts this week — includes content for top post preview
      const { data: weekPosts } = await supabase
        .from('posts')
        .select('id, user_id, content, platforms, published_at, bluesky_stats, scheduled_at, status')
        .gte('published_at', weekAgoIso)
        .in('status', ['published', 'partial'])
        .order('published_at', { ascending: false })

      if (!weekPosts || weekPosts.length === 0) return { weekPosts: [], scheduledPosts: [], settingsRows: [], allUserIds: [] }

      const userIdSet = new Set<string>(weekPosts.map((p: any) => p.user_id))
      const allUserIds = Array.from(userIdSet)

      // Scheduled posts in next 7 days — for "coming up" count
      const { data: scheduledPosts } = await supabase
        .from('posts')
        .select('user_id, scheduled_at')
        .in('user_id', allUserIds)
        .eq('status', 'scheduled')
        .gte('scheduled_at', nowIso)
        .lte('scheduled_at', nextWeekIso)

      // user_settings for opt-out check
      const { data: settingsRows } = await supabase
        .from('user_settings')
        .select('user_id, notification_prefs')
        .in('user_id', allUserIds)

      return { weekPosts, scheduledPosts: scheduledPosts ?? [], settingsRows: settingsRows ?? [], allUserIds }
    })

    const { weekPosts, scheduledPosts, settingsRows, allUserIds } = activeData as {
      weekPosts: any[]
      scheduledPosts: any[]
      settingsRows: any[]
      allUserIds: string[]
    }

    if (!weekPosts || weekPosts.length === 0) {
      console.log('[Weekly Digest] No active users this week')
      return { sent: 0 }
    }

    // Step 2: fetch user emails via Auth admin
    const emailMap = await step.run('fetch-user-emails', async () => {
      const usersRes = await getSupabaseAdmin().auth.admin.listUsers({ perPage: 1000 })
      const users = usersRes.data?.users ?? []
      const map: Record<string, string> = {}
      for (const u of users) { if (u.email) map[u.id] = u.email }
      return map
    })

    // Step 3: compute per-user stats and send in batches of 50
    let sent = 0
    const BATCH_SIZE = 50
    const batches: string[][] = []
    for (let i = 0; i < allUserIds.length; i += BATCH_SIZE) {
      batches.push(allUserIds.slice(i, i + BATCH_SIZE))
    }

    // Build lookup structures outside the step
    const scheduledByUser: Record<string, number> = {}
    for (const sp of scheduledPosts) {
      scheduledByUser[sp.user_id] = (scheduledByUser[sp.user_id] ?? 0) + 1
    }

    const settingsMap: Record<string, any> = {}
    for (const row of settingsRows) {
      settingsMap[row.user_id] = row.notification_prefs ?? {}
    }

    // Group week posts by user
    const postsByUser: Record<string, any[]> = {}
    for (const post of weekPosts) {
      if (!postsByUser[post.user_id]) postsByUser[post.user_id] = []
      postsByUser[post.user_id].push(post)
    }

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batchResult = await step.run(`send-batch-${batchIdx}`, async () => {
        const supabase = getSupabaseAdmin()
        const resend = getResend()
        const batch = batches[batchIdx]
        let batchSent = 0

        for (const userId of batch) {
          try {
            const email = (emailMap as Record<string, string>)[userId]
            if (!email) continue

            // Respect opt-out — default is opted IN
            const prefs = settingsMap[userId] ?? {}
            if (prefs.weekly_digest === false) continue

            const userPosts = postsByUser[userId] ?? []
            const postsThisWeek = userPosts.length
            if (postsThisWeek === 0) continue

            const scheduledCount = scheduledByUser[userId] ?? 0

            // Top platform: most posts this week
            const platformCounts: Record<string, number> = {}
            for (const p of userPosts) {
              for (const plat of (p.platforms ?? [])) {
                platformCounts[plat] = (platformCounts[plat] ?? 0) + 1
              }
            }
            const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

            // Streak: count consecutive days with at least one post ending today (UTC)
            const postedDays = new Set<string>()
            for (const p of userPosts) {
              if (p.published_at) {
                postedDays.add(p.published_at.slice(0, 10))
              }
            }
            // Also look back up to 30 days for older posts to extend streak
            const { data: olderPosts } = await supabase
              .from('posts')
              .select('published_at')
              .eq('user_id', userId)
              .in('status', ['published', 'partial'])
              .gte('published_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
              .lt('published_at', weekAgoIso)
            for (const op of (olderPosts ?? [])) {
              if (op.published_at) postedDays.add(op.published_at.slice(0, 10))
            }
            let currentStreak = 0
            const todayUtc = now.toISOString().slice(0, 10)
            let checkDay = new Date(todayUtc)
            while (postedDays.has(checkDay.toISOString().slice(0, 10))) {
              currentStreak++
              checkDay = new Date(checkDay.getTime() - 24 * 60 * 60 * 1000)
            }

            // Top post: highest engagement (bluesky_stats likes+reposts+replies), fallback to most recent
            let topPost: any = null
            let topEngagement = -1
            for (const p of userPosts) {
              const bs = p.bluesky_stats
              const eng = bs ? ((bs.likes ?? 0) + (bs.reposts ?? 0) + (bs.replies ?? 0)) : 0
              if (eng > topEngagement) {
                topEngagement = eng
                topPost = p
              }
            }
            if (!topPost) topPost = userPosts[0]
            const topPostPreview = topPost?.content
              ? topPost.content.slice(0, 120) + (topPost.content.length > 120 ? '…' : '')
              : null

            // Subject
            const subject = `📊 Your SocialMate week — ${postsThisWeek} post${postsThisWeek !== 1 ? 's' : ''}${currentStreak >= 3 ? `, ${currentStreak} day streak` : ''}`

            // Dark email HTML
            const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your SocialMate week</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="margin-bottom:28px;">
      <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">SocialMate</div>
      <div style="font-size:12px;color:#666;margin-top:4px;">Weekly digest · ${weekRange}</div>
    </div>

    <!-- Title -->
    <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 8px;">Your week in review</h1>
    <p style="font-size:14px;color:#888;margin:0 0 28px;">Here's what you shipped this week.</p>

    <!-- Big stats row -->
    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#141414;border:1px solid #222;border-radius:12px;padding:20px;">
        <div style="font-size:36px;font-weight:800;color:#22c55e;line-height:1;">${postsThisWeek}</div>
        <div style="font-size:12px;color:#888;margin-top:6px;">post${postsThisWeek !== 1 ? 's' : ''} this week</div>
      </div>
      ${currentStreak > 0 ? `
      <div style="flex:1;background:#141414;border:1px solid #222;border-radius:12px;padding:20px;">
        <div style="font-size:36px;font-weight:800;color:#f59e0b;line-height:1;">${currentStreak}</div>
        <div style="font-size:12px;color:#888;margin-top:6px;">day streak 🔥</div>
      </div>` : ''}
    </div>

    ${topPlatform ? `
    <!-- Top platform -->
    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Top platform</div>
      <div style="font-size:16px;font-weight:700;color:#ffffff;text-transform:capitalize;">${topPlatform}</div>
    </div>` : ''}

    ${topPostPreview ? `
    <!-- Top post preview -->
    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Top post</div>
      <div style="font-size:14px;color:#ccc;line-height:1.5;font-style:italic;">"${topPostPreview}"</div>
      ${topEngagement > 0 ? `<div style="font-size:12px;color:#555;margin-top:8px;">${topEngagement} engagement</div>` : ''}
    </div>` : ''}

    ${scheduledCount > 0 ? `
    <!-- Scheduled next week -->
    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Coming up</div>
      <div style="font-size:16px;font-weight:700;color:#ffffff;">${scheduledCount} post${scheduledCount !== 1 ? 's' : ''} scheduled for next week</div>
    </div>` : `<div style="margin-bottom:24px;"></div>`}

    <!-- CTA -->
    <a href="${appUrl}/analytics" style="display:inline-block;background:#22c55e;color:#000000;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;margin-bottom:32px;">
      View your analytics →
    </a>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #222;margin:0 0 20px;" />

    <!-- Footer -->
    <p style="font-size:11px;color:#444;line-height:1.6;margin:0;">
      You're receiving this because you published posts on SocialMate this week.<br>
      <a href="${appUrl}/settings?tab=Notifications" style="color:#555;">Unsubscribe from weekly digest</a>
    </p>
  </div>
</body>
</html>`

            await resend.emails.send({
              from: 'SocialMate <hello@socialmate.studio>',
              to: email,
              subject,
              html,
            })
            batchSent++
          } catch (err) {
            // Never let one user's failure stop the rest
            console.error(`[Weekly Digest] Failed to send to user ${userId}:`, err)
          }
        }

        return batchSent
      })

      sent += batchResult as number
    }

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

// Evergreen content recycler — runs daily at 6am UTC
// Re-queues evergreen posts when a user's schedule runs low
export const evergreenRecycler = inngest.createFunction(
  { id: 'evergreen-recycler', name: 'Evergreen Content Recycler', retries: 2 },
  { cron: '0 6 * * *' },
  async ({ step }) => {
    const result = await step.run('recycle-evergreen-posts', async () => {
      // Check kill switch
      const { data: flag } = await getSupabaseAdmin()
        .from('feature_flags')
        .select('enabled')
        .eq('flag', 'evergreen_recycling')
        .maybeSingle()

      if (flag && flag.enabled === false) {
        console.log('[Evergreen] Kill switch active — skipping recycler run')
        return { recycled: 0, skipped: true }
      }

      const db = getSupabaseAdmin()
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Find all distinct user+workspace combos that have evergreen posts
      // not queued in the last 7 days
      const { data: candidates } = await db
        .from('posts')
        .select('user_id, workspace_id')
        .eq('is_evergreen', true)

      if (!candidates?.length) return { recycled: 0, checked: 0 }

      // Deduplicate user+workspace combos
      const combos = Array.from(new Map(
        candidates.map(p => [`${p.user_id}:${p.workspace_id ?? 'null'}`, p])
      ).values())

      let recycled = 0

      for (const { user_id, workspace_id } of combos) {
        // Count scheduled posts in next 7 days for this user+workspace
        const { count } = await db
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user_id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', now.toISOString())
          .lte('scheduled_at', sevenDaysFromNow.toISOString())
          .eq(workspace_id ? 'workspace_id' : 'user_id', workspace_id ?? user_id)

        // Skip if they already have 3+ posts scheduled in the next week
        if ((count ?? 0) >= 3) continue

        // Find best candidate: least-recently-queued evergreen post for this combo
        let evQuery = db
          .from('posts')
          .select('id, content, platforms, destinations, evergreen_queue_count, workspace_id')
          .eq('user_id', user_id)
          .eq('is_evergreen', true)
          .eq('status', 'published')

        if (workspace_id) {
          evQuery = evQuery.eq('workspace_id', workspace_id)
        } else {
          evQuery = evQuery.is('workspace_id', null)
        }

        const { data: evPosts } = await evQuery
          .or(`evergreen_last_queued_at.is.null,evergreen_last_queued_at.lt.${sevenDaysAgo.toISOString()}`)
          .order('evergreen_last_queued_at', { ascending: true, nullsFirst: true })
          .limit(1)

        if (!evPosts?.length) continue

        const post = evPosts[0]

        // Schedule 24-48 hours from now, at a random time between 9am-7pm UTC
        const hoursAhead = 24 + Math.floor(Math.random() * 24)
        const scheduledAt = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
        scheduledAt.setUTCHours(9 + Math.floor(Math.random() * 10), 0, 0, 0)

        // Create the recycled post (copy, not marked evergreen to avoid loops)
        const { data: newPost, error: insertError } = await db
          .from('posts')
          .insert({
            user_id,
            workspace_id: post.workspace_id,
            content: post.content,
            platforms: post.platforms,
            destinations: post.destinations,
            status: 'scheduled',
            scheduled_at: scheduledAt.toISOString(),
            is_evergreen: false,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('[Evergreen] Insert failed:', insertError.message)
          continue
        }

        // Update the source evergreen post's last-queued timestamp
        await db
          .from('posts')
          .update({
            evergreen_last_queued_at: now.toISOString(),
            evergreen_queue_count: (post.evergreen_queue_count || 0) + 1,
          })
          .eq('id', post.id)

        // Schedule the new post via Inngest
        await inngest.send({
          name: 'post/scheduled',
          data: { postId: newPost.id, scheduledAt: scheduledAt.toISOString() },
        })

        recycled++
        console.log(`[Evergreen] Recycled post ${post.id} → new post ${newPost.id} at ${scheduledAt.toISOString()}`)
      }

      return { recycled, checked: combos.length }
    })

    return result
  }
)

// ─── Discord Welcome Message Poller — every 5 minutes ─────────────────────────
// Polls each enabled discord_welcome_configs row for new members and sends
// welcome messages + assigns auto-roles.
export const discordWelcomePoller = inngest.createFunction(
  { id: 'discord-welcome-poller', name: 'Discord Welcome Message Poller', retries: 2 },
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    // Fetch all enabled welcome configs
    const configs = await step.run('fetch-welcome-configs', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('discord_welcome_configs')
        .select('id, user_id, guild_id, channel_id, message, last_member_id')
        .eq('enabled', true)
      if (error) {
        console.error('[DiscordPoller] Failed to fetch configs:', error.message)
        return []
      }
      return data ?? []
    })

    if (!configs.length) {
      console.log('[DiscordPoller] No enabled welcome configs found')
      return { processed: 0 }
    }

    // Fetch role configs for all guilds in one query
    const guildIds = Array.from(new Set(configs.map((c: any) => c.guild_id)))
    const roleConfigs = await step.run('fetch-role-configs', async () => {
      const { data } = await getSupabaseAdmin()
        .from('discord_role_configs')
        .select('guild_id, role_id, enabled')
        .in('guild_id', guildIds)
        .eq('enabled', true)
      return data ?? []
    })

    // Build guild_id → role_id map for quick lookup
    const roleMap: Record<string, string> = {}
    for (const rc of roleConfigs) {
      roleMap[rc.guild_id] = rc.role_id
    }

    let totalWelcomed = 0

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i]

      // 500ms delay between guilds to respect Discord rate limits (skip first)
      if (i > 0) {
        await step.sleep(`rate-limit-delay-${i}`, 500)
      }

      await step.run(`process-guild-${config.guild_id}-${config.id}`, async () => {
        let members: Awaited<ReturnType<typeof getRecentMembers>>
        try {
          members = await getRecentMembers(
            config.guild_id,
            config.last_member_id ?? undefined,
          )
        } catch (err: any) {
          console.error(`[DiscordPoller] getRecentMembers failed for guild ${config.guild_id}:`, err.message)
          return
        }

        if (!members.length) return

        // Sort ascending by user id (Discord snowflake ids are time-ordered)
        members.sort((a, b) => (BigInt(a.user.id) < BigInt(b.user.id) ? -1 : 1))

        const lastMemberId = members[members.length - 1].user.id

        // First-run bootstrap: store cursor without sending welcomes to prevent floods
        if (!config.last_member_id) {
          console.log(`[DiscordPoller] First run for guild ${config.guild_id} — setting cursor to ${lastMemberId}, no messages sent`)
          await getSupabaseAdmin()
            .from('discord_welcome_configs')
            .update({ last_member_id: lastMemberId, updated_at: new Date().toISOString() })
            .eq('id', config.id)
          return
        }

        // Process each new member
        for (const member of members) {
          const username = member.user.global_name || member.user.username
          const welcomeText = config.message.replace(/\{\{username\}\}/g, username)

          try {
            await sendChannelMessage(config.channel_id, welcomeText)
            totalWelcomed++
          } catch (err: any) {
            console.error(`[DiscordPoller] sendChannelMessage failed for ${member.user.id}:`, err.message)
          }

          // Assign auto-role if configured for this guild
          const roleId = roleMap[config.guild_id]
          if (roleId) {
            try {
              await assignRole(config.guild_id, member.user.id, roleId)
            } catch (err: any) {
              console.error(`[DiscordPoller] assignRole failed for ${member.user.id}:`, err.message)
            }
          }
        }

        // Advance the cursor
        await getSupabaseAdmin()
          .from('discord_welcome_configs')
          .update({ last_member_id: lastMemberId, updated_at: new Date().toISOString() })
          .eq('id', config.id)

        console.log(`[DiscordPoller] Guild ${config.guild_id}: welcomed ${members.length} member(s), cursor → ${lastMemberId}`)
      })
    }

    return { processed: configs.length, welcomed: totalWelcomed }
  }
)

// ─── Send Notification — event-driven ─────────────────────────────────────────
// Listens for 'notification/send' events and inserts a row into the
// notifications table. Used by any background job that needs to notify a user.
export const sendNotification = inngest.createFunction(
  { id: 'send-notification', name: 'Send Notification', retries: 3 },
  { event: 'notification/send' },
  async ({ event, step }) => {
    const { user_id, type, title, body, link } = event.data as {
      user_id: string
      type: string
      title: string
      body: string
      link?: string
    }

    if (!user_id || !type || !body) {
      throw new Error('notification/send: missing required fields (user_id, type, body)')
    }

    await step.run('insert-notification', async () => {
      const { error } = await getSupabaseAdmin()
        .from('notifications')
        .insert({
          user_id,
          type,
          // title is stored as the leading portion of message for display compat
          message: title ? `${title}: ${body}` : body,
          action_url: link ?? null,
          read: false,
        })
      if (error) {
        console.error('[sendNotification] Insert failed:', error.message)
        throw new Error(`Failed to insert notification: ${error.message}`)
      }
    })

    console.log(`[sendNotification] Inserted ${type} notification for user ${user_id}`)
    return { user_id, type }
  }
)

// ─── Onboarding Email Sequence — triggered on user/signup ─────────────────────
// Sends 3 emails: Day 0 welcome, Day 3 AI tools showcase, Day 7 personal + upgrade nudge
export const onboardingSequence = inngest.createFunction(
  { id: 'onboarding-sequence', name: 'Onboarding Email Sequence', retries: 2 },
  { event: 'user/signup' },
  async ({ event, step }) => {
    const { email, firstName } = event.data as { email: string; firstName?: string }
    const name = firstName || 'there'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

    // ── Email 1 — Day 0: Welcome ───────────────────────────────────────────────
    await step.run('send-welcome-email', async () => {
      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        to: email,
        subject: 'Welcome to SocialMate 👋',
        html: `
          <div style="background:#0a0a0a;min-height:100vh;padding:0;margin:0;">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;background:#0a0a0a;">

            <!-- Logo -->
            <div style="margin-bottom:32px;">
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:28px;height:28px;background:#ffffff;border-radius:8px;text-align:center;line-height:28px;font-weight:900;font-size:14px;color:#000;">S</span>
                <span style="font-weight:800;font-size:16px;color:#ffffff;letter-spacing:-0.5px;">SocialMate</span>
              </span>
            </div>

            <!-- Headline -->
            <h1 style="font-size:28px;font-weight:800;margin:0 0 12px;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
              Hey ${name}, you're in. 👋
            </h1>
            <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 28px;">
              SocialMate is live and ready to go. You've got everything you need to start scheduling, growing, and creating — right now.
            </p>

            <!-- Feature bullets -->
            <div style="background:#111111;border:1px solid #222222;border-radius:14px;padding:24px;margin-bottom:28px;">
              <p style="font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">What's waiting for you</p>
              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;">Schedule posts to <strong style="color:#ffffff;">5 live platforms</strong> — Bluesky, Discord, Telegram, Mastodon, X/Twitter</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;"><strong style="color:#ffffff;">12 AI content tools</strong> — captions, hooks, threads, hashtags and more (50 free credits/month)</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;"><strong style="color:#ffffff;">Link in Bio builder</strong> — free on every plan, forever</span>
              </div>
            </div>

            <!-- CTA -->
            <div style="margin-bottom:32px;">
              <a href="${appUrl}/settings" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;letter-spacing:-0.2px;">
                Connect your first account →
              </a>
            </div>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #222222;margin:28px 0;" />

            <!-- Personal note -->
            <p style="font-size:13px;color:#71717a;line-height:1.7;margin:0;">
              <strong style="color:#a1a1aa;">P.S.</strong> I built SocialMate solo between deli shifts. If you ever have feedback, a feature request, or just want to say hi — reply to this email. I read every message.
            </p>
            <p style="font-size:13px;color:#71717a;margin:12px 0 0;">— Joshua, Founder of SocialMate</p>

          </div>
          </div>
        `,
      })
    })

    // ── Wait 20 hours then check for activation ───────────────────────────────
    await step.sleep('wait-day1-check', '20h')

    // ── Day 1: First Post Nudge (only if no posts yet) ─────────────────────────
    await step.run('send-day1-nudge', async () => {
      const db = getSupabaseAdmin()
      // Check if user has published or scheduled anything yet
      const { data: profile } = await db
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single()
      if (!profile?.user_id) return

      const { count } = await db
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.user_id)
        .in('status', ['scheduled', 'published'])

      if ((count ?? 0) > 0) return // already activated — skip nudge

      // Send in-app notification
      await db.from('notifications').insert({
        user_id: profile.user_id,
        type:    'activation',
        title:   'Your first post is waiting',
        body:    "You set up your account — now let's get something scheduled. It takes less than a minute.",
        href:    '/compose',
      })

      // Send email nudge
      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        to: email,
        subject: 'One post. That\'s all it takes.',
        html: `
          <div style="background:#0a0a0a;min-height:100vh;padding:0;margin:0;">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;background:#0a0a0a;">
            <div style="margin-bottom:32px;">
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:28px;height:28px;background:#ffffff;border-radius:8px;text-align:center;line-height:28px;font-weight:900;font-size:14px;color:#000;">S</span>
                <span style="font-weight:800;font-size:16px;color:#ffffff;">SocialMate</span>
              </span>
            </div>
            <h1 style="font-size:26px;font-weight:800;margin:0 0 16px;color:#ffffff;letter-spacing:-0.5px;">
              Hey ${name} — your first post is one click away.
            </h1>
            <p style="font-size:15px;color:#a1a1aa;line-height:1.6;margin:0 0 24px;">
              You set up your SocialMate account yesterday. Nice work.<br><br>
              Now the most important step: schedule your first post. It doesn't have to be perfect. It just has to be out there.
            </p>
            <a href="${appUrl}/compose" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:32px;">
              Write My First Post →
            </a>
            <p style="font-size:13px;color:#52525b;line-height:1.6;margin:0;">
              Takes less than a minute. Use the AI caption tool if you need a starting point — it's free on every plan.
            </p>
            <p style="font-size:13px;color:#71717a;margin:24px 0 0;">— Joshua, Founder of SocialMate</p>
          </div>
          </div>
        `,
      })
    })

    // ── Wait remaining ~2 days to hit Day 3 total ─────────────────────────────
    await step.sleep('wait-3-days', '52h')

    // ── Email 2 — Day 3: AI Tools Showcase ────────────────────────────────────
    await step.run('send-day3-email', async () => {
      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        to: email,
        subject: 'Are you using SocialMate\'s AI tools yet?',
        html: `
          <div style="background:#0a0a0a;min-height:100vh;padding:0;margin:0;">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;background:#0a0a0a;">

            <!-- Logo -->
            <div style="margin-bottom:32px;">
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:28px;height:28px;background:#ffffff;border-radius:8px;text-align:center;line-height:28px;font-weight:900;font-size:14px;color:#000;">S</span>
                <span style="font-weight:800;font-size:16px;color:#ffffff;letter-spacing:-0.5px;">SocialMate</span>
              </span>
            </div>

            <!-- Headline -->
            <h1 style="font-size:26px;font-weight:800;margin:0 0 12px;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
              Hey ${name} — are you using the AI tools yet?
            </h1>
            <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 8px;">
              Most people connect their accounts but miss the AI tools entirely. They're the secret weapon.
            </p>
            <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 28px;">
              Here's what's in there:
            </p>

            <!-- AI tools list -->
            <div style="background:#111111;border:1px solid #222222;border-radius:14px;padding:24px;margin-bottom:28px;">
              <p style="font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">AI Tools — available now</p>

              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;min-width:20px;">✦</span>
                <div>
                  <p style="font-size:14px;font-weight:700;color:#ffffff;margin:0 0 2px;">Caption Generator</p>
                  <p style="font-size:12px;color:#71717a;margin:0;">Drop in a topic, get a ready-to-post caption in seconds.</p>
                </div>
              </div>

              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;min-width:20px;">✦</span>
                <div>
                  <p style="font-size:14px;font-weight:700;color:#ffffff;margin:0 0 2px;">Content Rewriter</p>
                  <p style="font-size:12px;color:#71717a;margin:0;">Take any post and rewrite it for a different tone, platform, or audience.</p>
                </div>
              </div>

              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;min-width:20px;">✦</span>
                <div>
                  <p style="font-size:14px;font-weight:700;color:#ffffff;margin:0 0 2px;">Hook Writer</p>
                  <p style="font-size:12px;color:#71717a;margin:0;">Generate scroll-stopping opening lines that grab attention.</p>
                </div>
              </div>

              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;min-width:20px;">✦</span>
                <div>
                  <p style="font-size:14px;font-weight:700;color:#ffffff;margin:0 0 2px;">Thread Builder</p>
                  <p style="font-size:12px;color:#71717a;margin:0;">Turn a single idea into a full multi-part thread, formatted and ready to schedule.</p>
                </div>
              </div>

              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;min-width:20px;">✦</span>
                <div>
                  <p style="font-size:14px;font-weight:700;color:#ffffff;margin:0 0 2px;">Hashtag Suggester</p>
                  <p style="font-size:12px;color:#71717a;margin:0;">Get relevant hashtags based on your post content and target audience.</p>
                </div>
              </div>
            </div>

            <!-- Credits note -->
            <div style="background:#1a0a2e;border:1px solid #2d1b69;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="font-size:13px;color:#c4b5fd;margin:0;line-height:1.6;">
                Each tool costs <strong style="color:#ffffff;">1–5 credits</strong>. Free plan gives you <strong style="color:#ffffff;">50 credits/month</strong> — enough to create a solid week of content. On Pro ($5/mo) you get <strong style="color:#ffffff;">500 credits</strong>. Most users build 3–4 months of posts in one sitting.
              </p>
            </div>

            <!-- CTA -->
            <div style="margin-bottom:32px;">
              <a href="${appUrl}/dashboard" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;letter-spacing:-0.2px;">
                Try an AI tool now →
              </a>
            </div>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #222222;margin:28px 0;" />

            <p style="font-size:13px;color:#71717a;line-height:1.7;margin:0;">— Joshua, Founder of SocialMate</p>
            <p style="font-size:11px;color:#3f3f46;margin:12px 0 0;">You're receiving this because you signed up at socialmate.studio.</p>

          </div>
          </div>
        `,
      })
    })

    // ── Wait 4 more days (7 days total from signup) ────────────────────────────
    await step.sleep('wait-4-more-days', '4d')

    // ── Email 3 — Day 7: Personal note + soft upgrade nudge ───────────────────
    await step.run('send-day7-email', async () => {
      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        to: email,
        subject: 'A week in — how\'s it going?',
        html: `
          <div style="background:#0a0a0a;min-height:100vh;padding:0;margin:0;">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;background:#0a0a0a;">

            <!-- Logo -->
            <div style="margin-bottom:32px;">
              <span style="display:inline-flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:28px;height:28px;background:#ffffff;border-radius:8px;text-align:center;line-height:28px;font-weight:900;font-size:14px;color:#000;">S</span>
                <span style="font-weight:800;font-size:16px;color:#ffffff;letter-spacing:-0.5px;">SocialMate</span>
              </span>
            </div>

            <!-- Headline -->
            <h1 style="font-size:26px;font-weight:800;margin:0 0 12px;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
              Hey ${name} — a week in. How's it going?
            </h1>

            <!-- Personal story -->
            <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 16px;">
              You've been with SocialMate for a week now. I wanted to check in personally.
            </p>
            <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 16px;">
              I built SocialMate because I believe powerful software shouldn't cost $99/month. The tools that help people grow online should be available to everyone — not just the ones who can afford the big platforms. That's the whole mission: <strong style="color:#ffffff;">power to the people. Build the door.</strong>
            </p>
            <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 28px;">
              If the free plan is working for you, that's genuinely great. Stay on it as long as you need. If you're hitting limits — here's what Pro unlocks:
            </p>

            <!-- Pro features -->
            <div style="background:#111111;border:1px solid #222222;border-radius:14px;padding:24px;margin-bottom:28px;">
              <p style="font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Pro Plan — $5/month</p>

              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;"><strong style="color:#ffffff;">500 AI credits/month</strong> — 10x the free plan</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;"><strong style="color:#ffffff;">5 team seats</strong> — bring your collaborators</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;"><strong style="color:#ffffff;">200 X/Twitter posts/month</strong> instead of 50</span>
              </div>
            </div>

            <!-- Price callout -->
            <div style="background:#0f1a0f;border:1px solid #1a3a1a;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="font-size:13px;color:#86efac;margin:0;line-height:1.6;">
                Pro is <strong style="color:#ffffff;">$5/month</strong> — less than a coffee. What competitors charge $99/month for, we give you for $5.
              </p>
            </div>

            <!-- CTA -->
            <div style="margin-bottom:32px;">
              <a href="${appUrl}/pricing" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;letter-spacing:-0.2px;">
                Upgrade to Pro →
              </a>
            </div>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #222222;margin:28px 0;" />

            <!-- Genuine close -->
            <p style="font-size:14px;color:#a1a1aa;line-height:1.7;margin:0 0 8px;">
              Either way, I'm glad you're here. Reply anytime — I read every email.
            </p>
            <p style="font-size:13px;color:#71717a;margin:0;">— Joshua, Founder of SocialMate</p>
            <p style="font-size:11px;color:#3f3f46;margin:12px 0 0;">You're receiving this because you signed up at socialmate.studio.</p>

          </div>
          </div>
        `,
      })
    })

    console.log(`[OnboardingSequence] Completed 3-email sequence for ${email}`)
    return { email, done: true }
  }
)

// ─── Credit Low Checker — daily at noon UTC ────────────────────────────────────
// Finds users with fewer than 10 total credits and fires a credit_low
// notification if they haven't received one in the last 7 days.
export const creditLowChecker = inngest.createFunction(
  { id: 'credit-low-checker', name: 'Credit Low Checker', retries: 2 },
  { cron: '0 12 * * *' },
  async ({ step }) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Find users with combined credits < 10
    const lowCreditUsers = await step.run('find-low-credit-users', async () => {
      // Fetch all user_settings rows and filter in JS to avoid complex DB expressions
      const { data, error } = await getSupabaseAdmin()
        .from('user_settings')
        .select('user_id, monthly_credits_remaining, ai_credits_remaining, earned_credits, paid_credits')

      if (error) {
        console.error('[CreditLowChecker] Failed to query user_settings:', error.message)
        return []
      }

      return (data ?? []).filter((row: any) => {
        const monthly = row.monthly_credits_remaining ?? row.ai_credits_remaining ?? 0
        const earned  = row.earned_credits ?? 0
        const paid    = row.paid_credits ?? 0
        return (monthly + earned + paid) < 10
      })
    })

    if (!lowCreditUsers.length) {
      console.log('[CreditLowChecker] No users with low credits found')
      return { notified: 0 }
    }

    const userIds = lowCreditUsers.map((u: any) => u.user_id)

    // Find which users already got a credit_low notification in the last 7 days
    const recentlyNotifiedIds = await step.run('find-recently-notified', async () => {
      const { data } = await getSupabaseAdmin()
        .from('notifications')
        .select('user_id')
        .in('user_id', userIds)
        .eq('type', 'credit_low')
        .gte('created_at', sevenDaysAgo)
      return (data ?? []).map((n: any) => n.user_id as string)
    })

    const recentlyNotifiedSet = new Set<string>(recentlyNotifiedIds)

    // Fire notification/send events for users who haven't been notified recently
    const toNotify = lowCreditUsers.filter((u: any) => !recentlyNotifiedSet.has(u.user_id))

    await step.run('send-credit-low-notifications', async () => {
      for (const user of toNotify) {
        const monthly = user.monthly_credits_remaining ?? user.ai_credits_remaining ?? 0
        const earned  = user.earned_credits ?? 0
        const paid    = user.paid_credits ?? 0
        const total   = monthly + earned + paid

        await inngest.send({
          name: 'notification/send',
          data: {
            user_id: user.user_id,
            type:    'credit_low',
            title:   'Credits Running Low',
            body:    `You have ${total} AI credit${total !== 1 ? 's' : ''} remaining. Top up to keep creating.`,
            link:    '/settings?tab=Credits',
          },
        })
      }
    })

    console.log(`[CreditLowChecker] Fired credit_low notifications for ${toNotify.length} user(s) (${lowCreditUsers.length - toNotify.length} skipped — notified recently)`)
    return { notified: toNotify.length, skipped: lowCreditUsers.length - toNotify.length }
  }
)

// ─── Enki Signal Helpers — pure OHLCV calculations, no external libraries ──────

// ─── Indicator math imported from @/lib/enki/indicators ──────────────────────
// enkiCalcEMA, enkiCalcRSI, enkiCalcMACD, enkiCalcBB, enkiCalcATR,
// enkiCalcADX, enkiCalcPearsonCorr, enkiVolumeSpike

/**
 * Multi-indicator composite score from OHLCV bars.
 * Returns confidence 0-10, direction, triggered signal names, and ATR value.
 *
 * Scoring (max 9 pts):
 *   RSI  0-2 · MACD 0-2 · EMA 9/21 crossover 0-1 · Bollinger Bands 0-2 · Volume spike 0-1
 * Fires buy/sell when: score >= 4, clear winner by 2+ pts over opposite direction.
 */
function enkiScoreSignals(
  closes: number[], highs: number[], lows: number[], volumes: number[]
): { confidence: number; side: 'buy' | 'sell' | 'neutral'; signals: string[]; atr: number | null; adx: number | null } {
  const price  = closes[closes.length - 1]
  const rsi    = enkiCalcRSI(closes)
  const macd   = enkiCalcMACD(closes)
  const ema9   = enkiCalcEMA(closes, 9)
  const ema21  = enkiCalcEMA(closes, 21)
  const bb     = enkiCalcBB(closes)
  const atr    = enkiCalcATR(highs, lows, closes)
  const adx    = enkiCalcADX(highs, lows, closes)
  const volSpk = enkiVolumeSpike(volumes)

  let buyScore = 0, sellScore = 0
  const buySignals: string[] = [], sellSignals: string[] = []

  // RSI (0-2 pts)
  if (rsi !== null) {
    if      (rsi < 30) { buyScore  += 2; buySignals.push(`RSI oversold (${rsi.toFixed(1)})`) }
    else if (rsi < 40) { buyScore  += 1; buySignals.push(`RSI mild oversold (${rsi.toFixed(1)})`) }
    else if (rsi > 70) { sellScore += 2; sellSignals.push(`RSI overbought (${rsi.toFixed(1)})`) }
    else if (rsi > 60) { sellScore += 1; sellSignals.push(`RSI mild overbought (${rsi.toFixed(1)})`) }
  }

  // MACD (0-2 pts)
  if (macd !== null) {
    if      (macd.hist > 0 && macd.macd > macd.signal) { buyScore  += 2; buySignals.push(`MACD bullish (hist +${macd.hist.toFixed(3)})`) }
    else if (macd.hist < 0 && macd.macd < macd.signal) { sellScore += 2; sellSignals.push(`MACD bearish (hist ${macd.hist.toFixed(3)})`) }
  }

  // EMA 9/21 crossover zone (0-1 pt)
  if (ema9.length > 0 && ema21.length > 0) {
    if (ema9[ema9.length - 1] > ema21[ema21.length - 1]) { buyScore  += 1; buySignals.push('EMA9>EMA21 golden zone') }
    else                                                   { sellScore += 1; sellSignals.push('EMA9<EMA21 death zone') }
  }

  // Bollinger Bands (0-2 pts)
  if (bb !== null) {
    if      (price < bb.lower) { buyScore  += 2; buySignals.push(`Below BB lower ($${bb.lower.toFixed(2)})`) }
    else if (price > bb.upper) { sellScore += 2; sellSignals.push(`Above BB upper ($${bb.upper.toFixed(2)})`) }
  }

  // Volume spike confirmation (0-1 pt bonus to whichever side is leading)
  if (volSpk) {
    if (buyScore >= sellScore) { buyScore  += 1; buySignals.push('Volume spike') }
    else                       { sellScore += 1; sellSignals.push('Volume spike') }
  }

  // ADX Regime Filter: discount trend signals in choppy markets, boost in strong trends
  if (adx !== null) {
    if (adx < 20) {
      // Choppy/ranging — MACD and EMA signals are unreliable in sideways markets
      const macdPts = buySignals.some(s => s.startsWith('MACD')) ? 2 : (sellSignals.some(s => s.startsWith('MACD')) ? 2 : 0)
      const emaPts  = buySignals.some(s => s.startsWith('EMA'))  ? 1 : (sellSignals.some(s => s.startsWith('EMA'))  ? 1 : 0)
      const discount = macdPts + emaPts
      if (buyScore >= sellScore) { buyScore  = Math.max(0, buyScore  - discount); if (discount > 0) buySignals.push(`ADX ${adx.toFixed(1)} — ranging, trend signals discounted`) }
      else                       { sellScore = Math.max(0, sellScore - discount); if (discount > 0) sellSignals.push(`ADX ${adx.toFixed(1)} — ranging, trend signals discounted`) }
    } else if (adx > 35) {
      // Strong trend — bonus to the leading side
      if      (buyScore > sellScore)  { buyScore++;  buySignals.push(`ADX ${adx.toFixed(1)} — strong trend`) }
      else if (sellScore > buyScore)  { sellScore++; sellSignals.push(`ADX ${adx.toFixed(1)} — strong trend`) }
    }
  }

  // Clear-winner rule: need ≥ 4 pts, and 2+ pt gap over the other direction
  let side: 'buy' | 'sell' | 'neutral' = 'neutral'
  let score = 0
  let signals: string[] = []

  if      (buyScore  >= 4 && buyScore  - sellScore >= 2) { side = 'buy';  score = buyScore;  signals = buySignals  }
  else if (sellScore >= 4 && sellScore - buyScore  >= 2) { side = 'sell'; score = sellScore; signals = sellSignals }

  const confidence = side === 'neutral' ? 0 : Math.min(10, Math.round((score / 9) * 10))
  return { confidence, side, signals, atr, adx }
}

// ─── Enki External Signal Fetchers — free APIs, no keys required ──────────────

/** CNN Fear & Greed stock-market index. Returns 0–100 (25=extreme fear, 75=extreme greed). */
async function enkiFetchFearGreed(): Promise<number | null> {
  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const score = data?.fear_and_greed?.score
    return typeof score === 'number' ? Math.round(score) : null
  } catch { return null }
}

/**
 * House Stock Watcher free S3 JSON — congressional stock disclosures.
 * Returns per-symbol map of whether a member bought/sold in the last 30 days.
 */
async function enkiFetchCongressTrades(
  symbols: string[]
): Promise<Record<string, { buy: boolean; sell: boolean; members: number }>> {
  try {
    const res = await fetch(
      'https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!res.ok) return {}
    const txs: Array<{ ticker: string; transaction_date: string; type: string }> = await res.json()
    const cutoff   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const symSet   = new Set(symbols.map(s => s.toUpperCase()))
    const out: Record<string, { buy: boolean; sell: boolean; members: number }> = {}
    for (const tx of txs) {
      const sym = tx.ticker?.toUpperCase().replace('$', '')
      if (!sym || !symSet.has(sym)) continue
      if (tx.transaction_date < cutoff) continue
      if (!out[sym]) out[sym] = { buy: false, sell: false, members: 0 }
      const t = tx.type?.toLowerCase() ?? ''
      if (t.includes('purchase')) { out[sym].buy = true; out[sym].members++ }
      if (t.includes('sale'))       out[sym].sell = true
    }
    return out
  } catch { return {} }
}

/**
 * ApeWisdom Reddit mention API — top mentioned stocks across WSB + r/stocks.
 * Returns per-symbol rank (1 = most mentioned) and 24h mention count.
 * Free, no API key.
 */
async function enkiFetchRedditMentions(
  symbols: string[]
): Promise<Record<string, { rank: number; mentions: number }>> {
  try {
    const res = await fetch('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return {}
    const data = await res.json()
    const results: Array<{ ticker: string; rank: number; mentions: number }> = data?.results ?? []
    const symSet = new Set(symbols.map(s => s.toUpperCase()))
    const out: Record<string, { rank: number; mentions: number }> = {}
    for (const item of results) {
      const sym = item.ticker?.toUpperCase()
      if (sym && symSet.has(sym)) out[sym] = { rank: item.rank, mentions: item.mentions }
    }
    return out
  } catch { return {} }
}

// ─── Enki Paper Trading Scan — every 15 minutes ────────────────────────────────
// For each Citizen-tier user with active doctrines, runs a multi-indicator signal
// stack (RSI/MACD/EMA/BB/ATR/Volume from Yahoo Finance OHLCV bars), then executes
// paper trades at confidence >= 6 (autonomous) or queues pending_approval trades.
export const enkiPaperTradingScan = inngest.createFunction(
  { id: 'enki-paper-trading-scan', name: 'Enki Paper Trading Scan', retries: 1 },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    // ── 1. Fetch active Citizen + Commander users with active doctrines ────────
    const activeUsers = await step.run('fetch-active-citizen-users', async () => {
      const db = getSupabaseAdmin()

      // Find citizen + commander profiles not in dormant mode
      // Standard scan: all users. Cloud Runner users also get the 5-min scan.
      const { data: profiles, error: profErr } = await db
        .from('enki_profiles')
        .select('user_id, guardian_mode, tier, cloud_runner, alpaca_connected, alpaca_key_id, alpaca_secret, alpaca_paper')
        .in('tier', ['citizen', 'commander', 'emperor'])
        .neq('guardian_mode', 'dormant')

      if (profErr) {
        console.error('[EnkiScan] profiles query error:', profErr.message)
        return []
      }
      if (!profiles?.length) return []

      const userIds = profiles.map((p: any) => p.user_id)

      // Find which of those users have at least one active doctrine
      const { data: doctrines, error: docErr } = await db
        .from('enki_doctrines')
        .select('user_id, id, name, config')
        .in('user_id', userIds)
        .eq('is_active', true)

      if (docErr) {
        console.error('[EnkiScan] doctrines query error:', docErr.message)
        return []
      }
      if (!doctrines?.length) {
        console.log('[EnkiScan] No users with active doctrines — skipping scan')
        return []
      }

      // Build per-user list: { profile, doctrines[] }
      const profileMap: Record<string, any> = {}
      for (const p of profiles) { profileMap[p.user_id] = { ...p, doctrines: [] } }
      for (const d of doctrines) {
        if (profileMap[d.user_id]) profileMap[d.user_id].doctrines.push(d)
      }

      const activeList = (Object.values(profileMap) as any[]).filter((u: any) => u.doctrines.length > 0)
      if (!activeList.length) return []

      // Fetch display names from SocialMate profiles table
      const activeIds = activeList.map((u: any) => u.user_id)
      const { data: smProfiles } = await db
        .from('profiles')
        .select('id, full_name')
        .in('id', activeIds)

      const displayNameMap: Record<string, string> = {}
      for (const p of smProfiles ?? []) {
        displayNameMap[p.id] = (p.full_name as string | null) || `Trader${(p.id as string).slice(0, 6)}`
      }

      return activeList.map((u: any) => ({
        ...u,
        displayName: displayNameMap[u.user_id] || `Trader${(u.user_id as string).slice(0, 6)}`,
      }))
    })

    if (!activeUsers.length) {
      console.log('[EnkiScan] No active Citizen users with doctrines — scan complete')
      return { scanned: 0, trades: 0 }
    }

    console.log(`[EnkiScan] Processing ${activeUsers.length} user(s)`)

    // ── 2. Fetch prices for all unique symbols across all doctrines ───────────
    // Collect symbols from all doctrines (default to SPY, QQQ if not set)
    const allSymbols = new Set<string>()
    for (const user of activeUsers) {
      for (const doctrine of user.doctrines) {
        const symbols: string[] = doctrine.config?.symbols ?? ['SPY', 'QQQ']
        for (const s of symbols) allSymbols.add(s.toUpperCase())
      }
    }

    const symbolList = Array.from(allSymbols)

    // ── 2a. Fetch external market signals (once per scan cycle) ──────────────
    const marketCtx = await step.run('fetch-market-context', async () => {
      const [fearGreed, congress, reddit] = await Promise.all([
        enkiFetchFearGreed(),
        enkiFetchCongressTrades(symbolList),
        enkiFetchRedditMentions(symbolList),
      ])
      console.log(`[EnkiScan] Market context: F&G=${fearGreed ?? 'n/a'}, congress signals=${Object.keys(congress).length}, reddit mentions=${Object.keys(reddit).length}`)
      return { fearGreed, congress, reddit }
    })

    const priceMap = await step.run('fetch-prices', async () => {
      const signalMap: Record<string, {
        price: number; confidence: number; side: 'buy' | 'sell' | 'neutral'; atr: number | null; signals: string[]; closes20: number[]; adx: number | null; engineSignal?: FusedSignal
      }> = {}

      for (const symbol of symbolList) {
        try {
          // 3-month daily OHLCV bars — ~65 bars, enough for RSI(14)/MACD(26)/EMA(21)/BB(20)/ATR(14)
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
          if (!res.ok) {
            console.warn(`[EnkiScan] Yahoo fetch failed for ${symbol}: ${res.status}`)
            continue
          }
          const data   = await res.json()
          const result = data?.chart?.result?.[0]
          if (!result) continue

          const quote   = result.indicators?.quote?.[0]
          const closes  = (quote?.close  ?? []).filter((v: unknown) => v != null) as number[]
          const highs   = (quote?.high   ?? []).filter((v: unknown) => v != null) as number[]
          const lows    = (quote?.low    ?? []).filter((v: unknown) => v != null) as number[]
          const volumes = (quote?.volume ?? []).filter((v: unknown) => v != null) as number[]

          if (closes.length < 20) continue
          const currentPrice = closes[closes.length - 1]
          if (!currentPrice) continue

          const scored = enkiScoreSignals(closes, highs, lows, volumes)
          let { confidence, side, signals } = scored

          // ── Apply external signal modifiers ────────────────────────────────
          // Congressional buy confirmation (+1 to buy confidence)
          const cong = marketCtx.congress[symbol]
          if (cong?.buy && side === 'buy') {
            confidence = Math.min(10, confidence + 1)
            signals = [...signals, `Congress buy (${cong.members} member${cong.members > 1 ? 's' : ''})`]
          }

          // Reddit/WSB trending in top 25 — bullish momentum confirmation (+1)
          const reddit = marketCtx.reddit[symbol]
          if (reddit && reddit.rank <= 25 && side === 'buy') {
            confidence = Math.min(10, confidence + 1)
            signals = [...signals, `WSB trending #${reddit.rank} (${reddit.mentions} mentions)`]
          }

          // Fear & Greed: extreme fear caps buy entries (market panic = bad time to buy)
          const fg = marketCtx.fearGreed
          if (fg !== null && fg <= 25 && side === 'buy') {
            confidence = Math.min(confidence, 5) // below threshold — guardian waits
            signals = [...signals, `F&G extreme fear (${fg}) — buy capped`]
          }
          // Extreme greed: slight headwind on buys (already overbought market)
          if (fg !== null && fg >= 80 && side === 'buy') {
            confidence = Math.max(0, confidence - 1)
            signals = [...signals, `F&G extreme greed (${fg}) — reduced`]
          }

          // Daily returns for correlation guard (last 20 days)
          const closes20 = closes.length >= 2
            ? closes.slice(-21).map((c, i, arr) => i === 0 ? 0 : (c - arr[i-1]) / arr[i-1]).slice(1)
            : []

          // ── Strategy Engine: multi-strategy fusion overlay ─────────────────
          // Runs 4 isolated strategies (momentum, mean_reversion, sentiment, volatility)
          // and fuses them into a single composite conviction score.
          let engineSignal: FusedSignal | undefined
          try {
            engineSignal = enkiAnalyzeSymbol(symbol, closes, highs, lows, volumes, marketCtx)

            if (engineSignal.side !== 'neutral' && engineSignal.enkiConfidence > 0) {
              if (engineSignal.side === side || side === 'neutral') {
                // Agreement or engine leads: blend upward, add strategy labels
                const blended = Math.round((confidence + engineSignal.enkiConfidence) / 2)
                confidence = Math.min(10, Math.max(confidence, blended))
                side = engineSignal.side
                // Prepend top engine signals (avoid duplicating legacy signals)
                const newSigs = engineSignal.signals
                  .filter(s => !signals.some(ls => ls.startsWith(s.slice(0, 8))))
                  .slice(0, 3)
                signals = [...newSigs, ...signals]
              } else {
                // Conflict: strategies disagree — be more conservative
                confidence = Math.max(0, confidence - 2)
                signals = [...signals, `Strategy conflict: engine=${engineSignal.side} (${engineSignal.confidence}/100)`]
              }
            }
          } catch (engErr: any) {
            console.warn(`[EnkiScan] Strategy engine error for ${symbol}:`, engErr.message)
          }

          signalMap[symbol] = { price: currentPrice, confidence, side, signals, atr: scored.atr, closes20, adx: scored.adx, engineSignal }
          console.log(`[EnkiScan] ${symbol}: $${currentPrice.toFixed(2)} → ${side} conf=${confidence} engine=${engineSignal?.confidence ?? 'n/a'}/100 ADX=${scored.adx?.toFixed(1) ?? 'n/a'} [${signals.slice(0,3).join(' | ')}]`)
        } catch (err: any) {
          console.warn(`[EnkiScan] Price fetch error for ${symbol}:`, err.message)
        }
      }

      return signalMap
    })

    // ── 3. Execute paper trades per user ─────────────────────────────────────
    let totalTrades = 0

    for (let i = 0; i < activeUsers.length; i++) {
      const user = activeUsers[i]

      await step.run(`scan-user-${user.user_id}-${i}`, async () => {
        const db = getSupabaseAdmin()
        const now = new Date()
        const today = now.toISOString().slice(0, 10) // YYYY-MM-DD

        // ── SL/TP Guardian: auto-close positions that hit stop-loss or take-profit ──
        const { data: slTpTrades } = await db
          .from('enki_trades')
          .select('symbol, side, qty, price, doctrine_id, executed_at, reason')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')
          .eq('status', 'filled')
          .order('executed_at', { ascending: true })

        // Hoist openPos so both SL/TP guardian and max-positions guard can use it
        const openPos: Record<string, { qty: number; totalCost: number; doctrine_id: string | null }> = {}

        if (slTpTrades?.length) {
          // Compute net open position + avg cost basis per symbol
          for (const t of slTpTrades) {
            if (!openPos[t.symbol]) openPos[t.symbol] = { qty: 0, totalCost: 0, doctrine_id: null }
            if (t.side === 'buy') {
              openPos[t.symbol].qty       += t.qty
              openPos[t.symbol].totalCost += t.qty * t.price
            } else {
              openPos[t.symbol].qty       -= t.qty
              openPos[t.symbol].totalCost -= t.qty * t.price
            }
            if (t.doctrine_id) openPos[t.symbol].doctrine_id = t.doctrine_id
          }

          // Track which TP ladder rungs have already fired per symbol
          const tp1Hit = new Set<string>()
          const tp2Hit = new Set<string>()
          for (const t of slTpTrades ?? []) {
            if (t.side === 'sell' && (t.reason as string | null)?.includes('TP1 partial')) tp1Hit.add(t.symbol)
            if (t.side === 'sell' && (t.reason as string | null)?.includes('TP2 partial')) tp2Hit.add(t.symbol)
          }

          const utcHourSl = now.getUTCHours()
          const utcMinSl  = now.getUTCMinutes()
          const utcTimeSl = utcHourSl * 60 + utcMinSl
          const dowSl     = now.getUTCDay()
          const isOpenSl  = dowSl !== 0 && dowSl !== 6 && utcTimeSl >= 13 * 60 + 30 && utcTimeSl < 20 * 60

          if (isOpenSl) {
            for (const [sym, pos] of Object.entries(openPos)) {
              if (pos.qty <= 0) continue
              const signal = priceMap[sym]
              if (!signal) continue

              const avgCost  = pos.totalCost / pos.qty
              const pnlPct   = ((signal.price - avgCost) / avgCost) * 100
              const doctrine = user.doctrines.find((d: any) => d.id === pos.doctrine_id) ?? user.doctrines[0]

              // ATR-based dynamic SL/TP levels; falls back to doctrine config
              const atrVal   = priceMap[sym]?.atr
              const docSlPct = doctrine?.config?.stop_loss_pct   ?? 8
              const docTpPct = doctrine?.config?.take_profit_pct ?? 15
              const slPct    = atrVal ? Math.max(docSlPct, (1.5 * atrVal / avgCost) * 100) : docSlPct
              const tpPct    = atrVal ? Math.max(docTpPct, (2.5 * atrVal / avgCost) * 100) : docTpPct

              const hitSL   = pnlPct <= -slPct
              const alreadyTp1 = tp1Hit.has(sym)
              const alreadyTp2 = tp2Hit.has(sym)
              // TP Ladder thresholds: 40% of TP for TP1, 75% for TP2
              const hitTp1  = !alreadyTp1 && pnlPct >= tpPct * 0.4
              const hitTp2  = alreadyTp1 && !alreadyTp2 && pnlPct >= tpPct * 0.75

              if (!hitSL && !hitTp1 && !hitTp2) continue

              let sellQty = pos.qty
              let reason  = ''

              if (hitSL) {
                reason = `Stop loss triggered: ${pnlPct.toFixed(2)}% (limit: -${slPct.toFixed(2)}%${atrVal ? ' ATR-based' : ''})`
              } else if (hitTp1) {
                // TP1: close 33%, tighten trailing stop to lock in gains
                sellQty = Math.max(0.0001, pos.qty * 0.33)
                reason  = `TP1 partial exit (33%): +${pnlPct.toFixed(2)}% ≥ +${(tpPct * 0.4).toFixed(2)}% target`
                await db.from('enki_trailing_stops').upsert(
                  { user_id: user.user_id, broker: 'paper', symbol: sym, highest_price: signal.price, stop_pct: 3, updated_at: now.toISOString() },
                  { onConflict: 'user_id,broker,symbol' }
                )
              } else if (hitTp2) {
                // TP2: close another 33% (~50% of remaining after TP1), tighten trail further
                sellQty = Math.max(0.0001, pos.qty * 0.5)
                reason  = `TP2 partial exit (33%): +${pnlPct.toFixed(2)}% ≥ +${(tpPct * 0.75).toFixed(2)}% target`
                await db.from('enki_trailing_stops').upsert(
                  { user_id: user.user_id, broker: 'paper', symbol: sym, highest_price: signal.price, stop_pct: 2, updated_at: now.toISOString() },
                  { onConflict: 'user_id,broker,symbol' }
                )
              }

              const { error: slTpErr } = await db.from('enki_trades').insert({
                user_id:     user.user_id,
                doctrine_id: doctrine?.id ?? null,
                symbol:      sym,
                side:        'sell',
                qty:         sellQty,
                price:       signal.price,
                total:       sellQty * signal.price,
                broker:      'paper',
                paper:       true,
                confidence:  9,
                status:      'filled',
                reason,
                executed_at: now.toISOString(),
              })
              if (!slTpErr) {
                totalTrades++
                const tag = hitSL ? 'SL' : hitTp1 ? 'TP1' : 'TP2'
                console.log(`[EnkiScan] ${tag}: ${user.user_id} SELL ${sellQty.toFixed(4)}x${sym} @$${signal.price} — ${reason}`)
              }
            }
          }
        }

        // ── Trailing Stop Guardian ────────────────────────────────────────────
        // For each open position with a trailing stop record: advance the stop
        // as price rises, close the position if price falls below stop.
        const { data: trailingStops } = await db
          .from('enki_trailing_stops')
          .select('symbol, highest_price, stop_pct')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')

        if (trailingStops?.length) {
          const utcTsH = now.getUTCHours(), utcTsM = now.getUTCMinutes()
          const utcTsT = utcTsH * 60 + utcTsM
          const dowTs  = now.getUTCDay()
          const mktTs  = dowTs !== 0 && dowTs !== 6 && utcTsT >= 14 * 60 && utcTsT < 19 * 60 + 45
          if (mktTs) {
            for (const ts of trailingStops) {
              const signal = priceMap[ts.symbol]
              if (!signal) continue
              const curPx       = signal.price
              const highestPx   = Number(ts.highest_price)
              const stopPct     = Number(ts.stop_pct)
              const stopPrice   = highestPx * (1 - stopPct / 100)

              if (curPx > highestPx) {
                // Price made new high — advance the trailing stop
                await db.from('enki_trailing_stops').upsert(
                  { user_id: user.user_id, broker: 'paper', symbol: ts.symbol, highest_price: curPx, stop_pct: stopPct, updated_at: now.toISOString() },
                  { onConflict: 'user_id,broker,symbol' }
                )
              } else if (curPx <= stopPrice && openPos[ts.symbol]?.qty > 0) {
                // Trailing stop hit — close position
                const pos    = openPos[ts.symbol]
                const reason = `Trailing stop hit: $${curPx.toFixed(2)} ≤ stop $${stopPrice.toFixed(2)} (${stopPct}% trail from $${highestPx.toFixed(2)})`
                const doctrine = user.doctrines.find((d: any) => d.id === pos.doctrine_id) ?? user.doctrines[0]
                const { error: tsErr } = await db.from('enki_trades').insert({
                  user_id: user.user_id, doctrine_id: doctrine?.id ?? null,
                  symbol: ts.symbol, side: 'sell', qty: pos.qty, price: curPx,
                  total: pos.qty * curPx, broker: 'paper', paper: true,
                  confidence: 9, status: 'filled', reason, executed_at: now.toISOString(),
                })
                if (!tsErr) {
                  totalTrades++
                  console.log(`[EnkiScan] Trailing stop closed: ${user.user_id} SELL ${pos.qty.toFixed(4)}x${ts.symbol} — ${reason}`)
                  await db.from('enki_trailing_stops').delete()
                    .eq('user_id', user.user_id).eq('broker', 'paper').eq('symbol', ts.symbol)
                }
              }
            }
          }
        }

        // ── Daily drawdown guard: halt new trades if today's loss >= limit ──────
        const maxDdPct: number = user.doctrines[0]?.config?.max_daily_drawdown_pct ?? 3
        const { data: todaySnap } = await db
          .from('enki_snapshots')
          .select('daily_pnl, portfolio_value')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')
          .eq('snapshot_date', today)
          .maybeSingle()
        if (todaySnap?.daily_pnl != null && todaySnap?.portfolio_value) {
          const ddPct = (todaySnap.daily_pnl / todaySnap.portfolio_value) * 100
          if (ddPct <= -maxDdPct) {
            console.log(`[EnkiScan] Daily drawdown limit hit for ${user.user_id}: ${ddPct.toFixed(2)}% (limit -${maxDdPct}%) — halting trades today`)
            return
          }
        }

        // ── Re-entry cooldown: skip symbols stopped out in the last 2 hours ────
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        const { data: recentStopOuts } = await db
          .from('enki_trades')
          .select('symbol')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')
          .eq('side', 'sell')
          .eq('status', 'filled')
          .ilike('reason', '%stop%')
          .gte('executed_at', twoHoursAgo)
        const cooledSymbols = new Set((recentStopOuts ?? []).map((t: any) => t.symbol as string))

        // Open position count for max-positions enforcement (reuses hoisted openPos)
        const openPositionCount = Object.values(openPos).filter(p => p.qty > 0).length

        // ── Half-Kelly Position Sizing from closed trade history ──────────────
        // Kelly% = (W×(R+1)−1)/R, halved, capped 5–20%. Falls back to doctrine if <20 trades.
        let kellyPct: number | null = null
        {
          const buyQs: Record<string, Array<{ qty: number; price: number }>> = {}
          const results: Array<{ win: boolean; pct: number }> = []
          for (const t of slTpTrades ?? []) {
            if (t.side === 'buy') {
              if (!buyQs[t.symbol]) buyQs[t.symbol] = []
              buyQs[t.symbol].push({ qty: t.qty, price: t.price })
            } else if (t.side === 'sell') {
              const q = buyQs[t.symbol]
              if (!q?.length) continue
              let rem = t.qty, cost = 0
              while (rem > 0 && q.length > 0) {
                const b = q[0], m = Math.min(rem, b.qty)
                cost += m * b.price; rem -= m; b.qty -= m
                if (b.qty <= 0) q.shift()
              }
              if (cost > 0) results.push({ win: t.qty * t.price > cost, pct: (t.qty * t.price - cost) / cost })
            }
          }
          if (results.length >= 20) {
            const wins   = results.filter(r => r.win)
            const losses = results.filter(r => !r.win)
            const W      = wins.length / results.length
            const avgWin  = wins.length   > 0 ? wins.reduce((s, r)   => s + r.pct, 0) / wins.length  : 0
            const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, r) => s + r.pct, 0) / losses.length) : 0
            if (avgLoss > 0) {
              const R = avgWin / avgLoss
              const kelly = (W * (R + 1) - 1) / R
              kellyPct = Math.max(5, Math.min(20, (kelly / 2) * 100))
              console.log(`[EnkiScan] Kelly sizing for ${user.user_id}: W=${(W*100).toFixed(1)}% R=${R.toFixed(2)} → half-Kelly=${kellyPct.toFixed(1)}%`)
            }
          }
        }

        // Portfolio drawdown metrics — used by Risk Supervisor in symbol loop below
        const portfolioTotalDdPct = todaySnap?.portfolio_value
          ? ((todaySnap.portfolio_value - 10000) / 10000) * 100
          : 0
        const portfolioDailyDdPct = (todaySnap?.daily_pnl != null && todaySnap?.portfolio_value)
          ? (todaySnap.daily_pnl / todaySnap.portfolio_value) * 100
          : 0

        for (const doctrine of user.doctrines) {
          const symbols: string[] = doctrine.config?.symbols ?? ['SPY', 'QQQ']
          const maxPositions: number = doctrine.config?.max_positions ?? 5

          for (const rawSym of symbols) {
            const symbol = rawSym.toUpperCase()
            const signal = priceMap[symbol]
            if (!signal || signal.price == null || signal.confidence == null || signal.side == null) continue

            const { price, confidence, side } = signal

            // Only act on signals with confidence >= 6
            if (confidence < 6) continue
            if (side === 'neutral') continue

            // Fortress Guard: skip first 30 min open (9:30–10:00 ET chop) and last 15 min
            // (3:45–4:00 ET gap risk). Best window: 10:00 AM–3:45 PM ET = 14:00–19:45 UTC.
            const utcHour      = now.getUTCHours()
            const utcMin       = now.getUTCMinutes()
            const utcTime      = utcHour * 60 + utcMin
            const dayOfWeek    = now.getUTCDay()
            const isMarketOpen = dayOfWeek !== 0 && dayOfWeek !== 6 && utcTime >= 14 * 60 && utcTime < 19 * 60 + 45

            if (!isMarketOpen) continue

            // Re-entry cooldown: don't re-enter a symbol that was stopped out < 2h ago
            if (cooledSymbols.has(symbol)) {
              console.log(`[EnkiScan] Re-entry cooldown: ${symbol} stopped out within 2h — skipping`)
              continue
            }

            // ── Max positions guard ─────────────────────────────────────────────
            const isExistingPosition = openPos[symbol] && openPos[symbol].qty > 0
            if (!isExistingPosition && openPositionCount >= maxPositions) {
              console.log(`[EnkiScan] Max positions (${maxPositions}) reached for ${user.user_id} — skipping new ${symbol}`)
              continue
            }

            // ── Correlation Guard: skip if |corr| > 0.85 with any open position ──
            // Prevents doubling down on nearly identical assets (e.g. SPY + QQQ)
            if (side === 'buy' && !isExistingPosition) {
              const newReturns = priceMap[symbol]?.closes20
              if (newReturns && newReturns.length >= 5) {
                let highCorr = false
                for (const [openSym, openPosData] of Object.entries(openPos)) {
                  if (openPosData.qty <= 0 || openSym === symbol) continue
                  const openReturns = priceMap[openSym]?.closes20
                  if (!openReturns || openReturns.length < 5) continue
                  const corr = enkiCalcPearsonCorr(newReturns, openReturns)
                  if (Math.abs(corr) > 0.85) {
                    highCorr = true
                    console.log(`[EnkiScan] Correlation guard: ${symbol} r=${corr.toFixed(2)} with ${openSym} — skipping`)
                    break
                  }
                }
                if (highCorr) continue
              }
            }

            // ── Risk Supervisor + Position Sizing ─────────────────────────────
            // If the strategy engine fired, run the full decay/allocation/risk chain.
            // Falls back to half-Kelly or doctrine config when engine has no signal.
            const startingCash = 10000
            const riskPreset   = (user as any).risk_preset ?? 'balanced'
            let positionSizePct: number = kellyPct ?? doctrine.config?.position_size_pct ?? 10

            if (signal.engineSignal) {
              try {
                const riskDecision = enkiMakeRiskDecision(
                  signal.engineSignal,
                  kellyPct,
                  doctrine.config?.position_size_pct ?? 10,
                  [],  // strategyPerf: populated as enki_strategy_performance table fills
                  {
                    totalDrawdownPct:  portfolioTotalDdPct,
                    dailyDrawdownPct:  portfolioDailyDdPct,
                    openPositionCount,
                    maxPositions,
                  },
                  riskPreset,
                )
                if (riskDecision.action === 'REJECT') {
                  console.log(`[EnkiScan] Risk supervisor REJECTED ${symbol} for ${user.user_id}: ${riskDecision.reason}`)
                  continue
                }
                positionSizePct = riskDecision.positionSizePct
                console.log(`[EnkiScan] Risk supervisor ${riskDecision.action} ${symbol}: size=${positionSizePct}% conf=${riskDecision.finalConfidence}/10`)
              } catch (riskErr: any) {
                console.warn(`[EnkiScan] Risk supervisor error for ${symbol}:`, riskErr.message)
                // Fall through to legacy sizing
              }
            }

            // Fetch the latest snapshot to get current portfolio value
            const { data: latestSnap } = await db
              .from('enki_snapshots')
              .select('portfolio_value')
              .eq('user_id', user.user_id)
              .eq('broker', 'paper')
              .order('snapshot_date', { ascending: false })
              .limit(1)
              .maybeSingle()

            const currentPortfolioValue = latestSnap?.portfolio_value ?? startingCash
            const tradeAmount = Math.max(10, (currentPortfolioValue * positionSizePct) / 100)
            // Allow fractional shares for paper trading
            const qty = tradeAmount / price
            if (qty <= 0) continue

            // ── Commander live trading via Alpaca ───────────────────────────
            const isCommander = user.tier === 'commander' || user.tier === 'emperor'
            const useAlpaca = isCommander && user.alpaca_connected && doctrine.config?.broker === 'alpaca'

            if (useAlpaca) {
              try {
                const keyId = enkiDecryptKey(user.alpaca_key_id)
                const secret = enkiDecryptKey(user.alpaca_secret)
                const alpacaBase = user.alpaca_paper
                  ? 'https://paper-api.alpaca.markets'
                  : 'https://api.alpaca.markets'

                // Use notional-based order — buy $tradeAmount worth, no qty math needed
                const orderPayload: Record<string, string> = {
                  symbol,
                  notional: tradeAmount.toFixed(2),
                  side,
                  type: 'market',
                  time_in_force: 'day',
                }

                const orderRes = await fetch(`${alpacaBase}/v2/orders`, {
                  method: 'POST',
                  headers: {
                    'APCA-API-KEY-ID': keyId,
                    'APCA-API-SECRET-KEY': secret,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(orderPayload),
                })

                if (orderRes.ok) {
                  const orderData = await orderRes.json()
                  const liveStatus = user.guardian_mode === 'autonomous' ? 'filled' : 'pending_approval'
                  const { error: liveTradeErr } = await db
                    .from('enki_trades')
                    .insert({
                      user_id:          user.user_id,
                      doctrine_id:      doctrine.id,
                      symbol,
                      side,
                      qty,
                      price,
                      total:            tradeAmount,
                      broker:           'alpaca',
                      paper:            !!user.alpaca_paper,
                      confidence,
                      status:           liveStatus,
                      broker_order_id:  orderData.id ?? null,
                      reason:           `Live Alpaca: ${enkiSignalLabel(signal)} | ${positionSizePct}% portfolio ($${tradeAmount.toFixed(2)})`,
                      executed_at:      now.toISOString(),
                    })
                  if (liveTradeErr) {
                    console.error(`[EnkiScan] Alpaca trade insert error for ${user.user_id}/${symbol}:`, liveTradeErr.message)
                  } else {
                    totalTrades++
                    console.log(`[EnkiScan] Alpaca live order: ${user.user_id} ${side.toUpperCase()} $${tradeAmount.toFixed(2)} ${symbol} (order ${orderData.id})`)
                  }
                } else {
                  const errBody = await orderRes.json().catch(() => ({}))
                  console.error(`[EnkiScan] Alpaca order failed for ${user.user_id}/${symbol}: ${errBody.message ?? orderRes.status}`)
                }
              } catch (alpacaErr: unknown) {
                const msg = alpacaErr instanceof Error ? alpacaErr.message : String(alpacaErr)
                console.error(`[EnkiScan] Alpaca execution error for ${user.user_id}/${symbol}:`, msg)
              }
              // Skip paper trade when Alpaca execution was attempted
              continue
            }

            // ── Paper trade (citizen tier or paper fallback) ────────────────
            const status = user.guardian_mode === 'autonomous'
              ? 'filled'
              : 'pending_approval'

            const { error: tradeErr } = await db
              .from('enki_trades')
              .insert({
                user_id:     user.user_id,
                doctrine_id: doctrine.id,
                symbol,
                side,
                qty,
                price,
                broker:      'paper',
                paper:       true,
                confidence,
                status,
                reason:      `${enkiSignalLabel(signal)} | ${positionSizePct}% portfolio ($${tradeAmount.toFixed(2)})`,
                executed_at: now.toISOString(),
              })

            if (tradeErr) {
              console.error(`[EnkiScan] Trade insert error for ${user.user_id}/${symbol}:`, tradeErr.message)
              continue
            }

            // On a filled BUY: create/advance trailing stop record
            if (side === 'buy' && status === 'filled') {
              const trailPct = signal.atr
                ? Math.max(2, Math.min(10, Math.round((signal.atr / price) * 200 * 10) / 10))
                : (doctrine.config?.trailing_stop_pct ?? 5)
              await db.from('enki_trailing_stops').upsert(
                { user_id: user.user_id, broker: 'paper', symbol, highest_price: price, stop_pct: trailPct, updated_at: now.toISOString() },
                { onConflict: 'user_id,broker,symbol' }
              )
            }
            // On a filled SELL: remove trailing stop (position closed)
            if (side === 'sell' && status === 'filled') {
              await db.from('enki_trailing_stops').delete()
                .eq('user_id', user.user_id).eq('broker', 'paper').eq('symbol', symbol)
            }

            if (status === 'filled') totalTrades++
            console.log(`[EnkiScan] Paper trade: ${user.user_id} ${side.toUpperCase()} ${qty.toFixed(4)}x${symbol} @$${price} ($${tradeAmount.toFixed(2)}, ${positionSizePct}% of portfolio, ${status})`)
            // Browser push notification — non-fatal
            sendPushNotification(
              user.user_id,
              '📈 Enki: New trade signal',
              `${symbol} — ${side.toUpperCase()} (paper)`,
              '/enki/dashboard',
              'enki-trade',
            )

            // ── DCA Safety Orders ───────────────────────────────────────────
            // Average into a losing position if still bullish and not in a strong downtrend.
            // Max 2 safety orders per position. Each is 50% of original position size.
            if (isExistingPosition && openPos[symbol].qty > 0 && signal.side !== 'sell') {
              const dcaPos     = openPos[symbol]
              const dcaAvgCost = dcaPos.totalCost / dcaPos.qty
              const dcaPnlPct  = ((price - dcaAvgCost) / dcaAvgCost) * 100
              const dcaSlPct   = signal.atr
                ? Math.max(doctrine.config?.stop_loss_pct ?? 8, (1.5 * signal.atr / dcaAvgCost) * 100)
                : (doctrine.config?.stop_loss_pct ?? 8)
              // DCA zone: between 30% and 70% of the way toward stop loss
              const inDcaZone   = dcaPnlPct <= -(dcaSlPct * 0.3) && dcaPnlPct >= -(dcaSlPct * 0.7)
              // Skip if ADX > 25 (strong downtrend — don't catch falling knife)
              const adxVal      = priceMap[symbol]?.adx
              const notDowntrend = adxVal === null || adxVal < 25
              if (inDcaZone && notDowntrend) {
                const dcaCount = (slTpTrades ?? []).filter((t: any) =>
                  t.symbol === symbol && t.side === 'buy' && (t.reason as string | null)?.includes('DCA safety')
                ).length
                if (dcaCount < 2) {
                  const dcaSizePct = (doctrine.config?.position_size_pct ?? 10) * 0.5
                  const dcaAmount  = Math.max(5, (currentPortfolioValue * dcaSizePct) / 100)
                  const dcaQty     = dcaAmount / price
                  const dcaStatus  = user.guardian_mode === 'autonomous' ? 'filled' : 'pending_approval'
                  const { error: dcaErr } = await db.from('enki_trades').insert({
                    user_id:     user.user_id,
                    doctrine_id: doctrine.id,
                    symbol,
                    side:        'buy',
                    qty:         dcaQty,
                    price,
                    broker:      'paper',
                    paper:       true,
                    confidence:  signal.confidence,
                    status:      dcaStatus,
                    reason:      `DCA safety order #${dcaCount + 1}: ${dcaPnlPct.toFixed(2)}% drawdown, ADX=${adxVal?.toFixed(1) ?? 'n/a'}`,
                    executed_at: now.toISOString(),
                  })
                  if (!dcaErr) {
                    if (dcaStatus === 'filled') totalTrades++
                    console.log(`[EnkiScan] DCA safety #${dcaCount + 1}: ${user.user_id} BUY $${dcaAmount.toFixed(2)} ${symbol} (pnl=${dcaPnlPct.toFixed(2)}%)`)
                  }
                }
              }
            }
          }
        }

        // ── 4. Update daily paper portfolio snapshot ─────────────────────────
        // Fetch all filled paper buys/sells to estimate portfolio value
        const { data: allTrades } = await db
          .from('enki_trades')
          .select('symbol, side, qty, price, executed_at')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')
          .eq('status', 'filled')
          .order('executed_at', { ascending: true })

        if (!allTrades?.length) return

        // Net position per symbol
        const positions: Record<string, { qty: number; cost: number }> = {}
        for (const t of allTrades) {
          if (!positions[t.symbol]) positions[t.symbol] = { qty: 0, cost: 0 }
          if (t.side === 'buy') {
            positions[t.symbol].qty  += t.qty
            positions[t.symbol].cost += t.qty * t.price
          } else {
            positions[t.symbol].qty  -= t.qty
            positions[t.symbol].cost -= t.qty * t.price
          }
        }

        // Value open positions at current prices
        let portfolioValue = 10000 // simulated starting cash
        let openPositions = 0
        for (const [sym, pos] of Object.entries(positions)) {
          if (pos.qty <= 0) continue
          openPositions++
          const currentPx = priceMap[sym]?.price ?? pos.cost / Math.max(pos.qty, 1)
          portfolioValue += pos.qty * currentPx - pos.cost
        }

        // Fetch yesterday's snapshot for daily P&L
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        const { data: prevSnap } = await db
          .from('enki_snapshots')
          .select('portfolio_value')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')
          .eq('snapshot_date', yesterday)
          .maybeSingle()

        const prevValue = prevSnap?.portfolio_value ?? portfolioValue
        const dailyPnl  = portfolioValue - prevValue

        // Upsert today's snapshot
        await db
          .from('enki_snapshots')
          .upsert(
            {
              user_id:         user.user_id,
              broker:          'paper',
              snapshot_date:   today,
              portfolio_value: portfolioValue,
              daily_pnl:       dailyPnl,
              total_pnl:       portfolioValue - 10000,
              open_positions:  openPositions,
              cash:            10000,
              equity:          portfolioValue,
              updated_at:      now.toISOString(),
            },
            { onConflict: 'user_id,broker,snapshot_date' }
          )

        // Upsert leaderboard entry
        const totalPnlPct     = ((portfolioValue - 10000) / 10000) * 100
        const totalTradeCount = allTrades?.length ?? 0

        // ── Real win rate via FIFO buy/sell matching ────────────────────────
        const winResults: boolean[] = []
        const buyQueues: Record<string, Array<{ qty: number; price: number }>> = {}
        for (const t of allTrades ?? []) {
          if (t.side === 'buy') {
            if (!buyQueues[t.symbol]) buyQueues[t.symbol] = []
            buyQueues[t.symbol].push({ qty: t.qty, price: t.price })
          } else if (t.side === 'sell') {
            const queue = buyQueues[t.symbol]
            if (!queue?.length) continue
            let remaining = t.qty
            let costBasis = 0
            while (remaining > 0 && queue.length > 0) {
              const buy     = queue[0]
              const matched = Math.min(remaining, buy.qty)
              costBasis    += matched * buy.price
              remaining    -= matched
              buy.qty      -= matched
              if (buy.qty <= 0) queue.shift()
            }
            winResults.push(t.qty * t.price - costBasis > 0)
          }
        }
        const closedCount = winResults.length
        const winRate     = closedCount > 0
          ? Math.round((winResults.filter(Boolean).length / closedCount) * 10000) / 100
          : 0

        // ── Streak tracking ─────────────────────────────────────────────────
        let conquest_streak = 0
        for (let k = winResults.length - 1; k >= 0; k--) {
          if (!winResults[k]) break
          conquest_streak++
        }
        let best_streak = 0, curStreak = 0
        for (const w of winResults) {
          curStreak = w ? curStreak + 1 : 0
          if (curStreak > best_streak) best_streak = curStreak
        }

        // ── Doctrine rank ────────────────────────────────────────────────────
        // Initiate → Trader → Conqueror → Warlord → Emperor → Mythic Architect
        let doctrine_rank = 'Initiate'
        if      (totalTradeCount >= 200 && winRate >= 65) doctrine_rank = 'Mythic Architect'
        else if (totalTradeCount >= 100 && winRate >= 60) doctrine_rank = 'Emperor'
        else if (totalTradeCount >= 50  && winRate >= 55) doctrine_rank = 'Warlord'
        else if (totalTradeCount >= 25  && winRate >= 50) doctrine_rank = 'Conqueror'
        else if (totalTradeCount >= 10)                   doctrine_rank = 'Trader'

        const displayName = (user.displayName as string | undefined) || `Trader${(user.user_id as string).slice(0, 6)}`

        await db
          .from('enki_leaderboard')
          .upsert(
            {
              user_id:         user.user_id,
              display_name:    displayName,
              tier:            user.tier ?? 'citizen',
              trading_mode:    'paper',
              total_pnl_pct:   Math.round(totalPnlPct * 100) / 100,
              total_trades:    totalTradeCount,
              win_rate:        winRate,
              conquest_streak,
              best_streak,
              doctrine_rank,
              is_visible:      true,
              updated_at:      now.toISOString(),
            },
            { onConflict: 'user_id' }
          )
      })
    }

    console.log(`[EnkiScan] Scan complete — ${activeUsers.length} user(s), ${totalTrades} paper trade(s) executed`)
    return { scanned: activeUsers.length, trades: totalTrades }
  }
)

// Helper: human-readable signal summary for trade reason strings
function enkiSignalLabel(signal: { confidence: number; side: string; signals?: string[] }): string {
  const sigList = signal.signals?.length ? signal.signals.slice(0, 3).join(' · ') : `${signal.side} signal`
  return `${sigList} (conf ${signal.confidence}/10)`
}

// ─── Enki Cloud Runner Scan — every 5 minutes (Cloud Runner subscribers only) ──
// Identical logic to enkiPaperTradingScan but runs 3× more often and only
// processes users who have cloud_runner = true. This is the paid differentiator:
// faster signal response, more trades caught on shorter-lived momentum moves.
export const enkiCloudRunnerScan = inngest.createFunction(
  { id: 'enki-cloud-runner-scan', name: 'Enki Cloud Runner Scan', retries: 1 },
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    const activeUsers = await step.run('fetch-cloud-runner-users', async () => {
      const db = getSupabaseAdmin()

      const { data: profiles, error: profErr } = await db
        .from('enki_profiles')
        .select('user_id, guardian_mode, tier, cloud_runner, alpaca_connected, alpaca_key_id, alpaca_secret, alpaca_paper')
        .in('tier', ['commander', 'emperor'])
        .eq('cloud_runner', true)
        .neq('guardian_mode', 'dormant')

      if (profErr || !profiles?.length) return []

      const userIds = profiles.map((p: any) => p.user_id)
      const { data: doctrines, error: docErr } = await db
        .from('enki_doctrines')
        .select('user_id, id, name, config')
        .in('user_id', userIds)
        .eq('is_active', true)

      if (docErr || !doctrines?.length) return []

      const profileMap: Record<string, any> = {}
      for (const p of profiles) { profileMap[p.user_id] = { ...p, doctrines: [] } }
      for (const d of doctrines) {
        if (profileMap[d.user_id]) profileMap[d.user_id].doctrines.push(d)
      }

      const activeList = (Object.values(profileMap) as any[]).filter((u: any) => u.doctrines.length > 0)
      if (!activeList.length) return []

      const { data: smProfiles } = await db
        .from('profiles')
        .select('id, full_name')
        .in('id', activeList.map((u: any) => u.user_id))

      const displayNameMap: Record<string, string> = {}
      for (const p of smProfiles ?? []) {
        displayNameMap[p.id] = (p.full_name as string | null) || `Trader${(p.id as string).slice(0, 6)}`
      }

      return activeList.map((u: any) => ({
        ...u,
        displayName: displayNameMap[u.user_id] || `Trader${(u.user_id as string).slice(0, 6)}`,
      }))
    })

    if (!activeUsers.length) return { scanned: 0, trades: 0 }
    console.log(`[CloudRunnerScan] Processing ${activeUsers.length} cloud runner user(s)`)

    // Reuse the same price fetch + trade logic as enkiPaperTradingScan
    // by delegating to the same step functions — avoids duplicating hundreds of lines.
    // Fire the standard scan event so Inngest reuses that function's logic.
    // We pass cloud_runner_only=true in metadata so it won't double-execute.
    // NOTE: Since we can't easily share step logic across functions, we inline a
    // lightweight version: just fetch prices + fire trades for cloud runner users.
    const allSymbols = new Set<string>()
    for (const user of activeUsers) {
      for (const doctrine of user.doctrines) {
        const symbols: string[] = doctrine.config?.symbols ?? ['SPY', 'QQQ']
        for (const s of symbols) allSymbols.add(s.toUpperCase())
      }
    }

    const symbolList = Array.from(allSymbols)
    const priceMap = await step.run('cr-fetch-prices', async () => {
      const signalMap: Record<string, {
        price: number; confidence: number; side: 'buy' | 'sell' | 'neutral'; atr: number | null; signals: string[]; closes20: number[]; adx: number | null
      }> = {}
      for (const symbol of symbolList) {
        try {
          // Same 3-month daily OHLCV bars as the 15-min scan — Cloud Runner advantage is
          // frequency (5-min vs 15-min), not a different signal stack
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
          if (!res.ok) continue
          const data   = await res.json()
          const result = data?.chart?.result?.[0]
          if (!result) continue
          const quote   = result.indicators?.quote?.[0]
          const closes  = (quote?.close  ?? []).filter((v: unknown) => v != null) as number[]
          const highs   = (quote?.high   ?? []).filter((v: unknown) => v != null) as number[]
          const lows    = (quote?.low    ?? []).filter((v: unknown) => v != null) as number[]
          const volumes = (quote?.volume ?? []).filter((v: unknown) => v != null) as number[]
          if (closes.length < 20) continue
          const currentPrice = closes[closes.length - 1]
          if (!currentPrice) continue
          const scored = enkiScoreSignals(closes, highs, lows, volumes)
          const closes20 = closes.length >= 2
            ? closes.slice(-21).map((c, i, arr) => i === 0 ? 0 : (c - arr[i-1]) / arr[i-1]).slice(1)
            : []
          signalMap[symbol] = { price: currentPrice, ...scored, closes20 }
        } catch { /* skip */ }
      }
      return signalMap
    })

    let totalTrades = 0
    for (let i = 0; i < activeUsers.length; i++) {
      const user = activeUsers[i]
      await step.run(`cr-scan-user-${user.user_id}-${i}`, async () => {
        const db  = getSupabaseAdmin()
        const now = new Date()
        const utcTime = now.getUTCHours() * 60 + now.getUTCMinutes()
        const dow     = now.getUTCDay()
        const isOpen  = dow !== 0 && dow !== 6 && utcTime >= 13 * 60 + 30 && utcTime < 20 * 60
        if (!isOpen) return

        for (const doctrine of user.doctrines) {
          const symbols: string[] = doctrine.config?.symbols ?? ['SPY', 'QQQ']
          for (const rawSym of symbols) {
            const symbol = rawSym.toUpperCase()
            const signal = priceMap[symbol]
            if (!signal || signal.confidence < 6 || signal.side === 'neutral') continue

            const positionSizePct: number = doctrine.config?.position_size_pct ?? 10
            const { data: latestSnap } = await db
              .from('enki_snapshots')
              .select('portfolio_value')
              .eq('user_id', user.user_id)
              .eq('broker', 'paper')
              .order('snapshot_date', { ascending: false })
              .limit(1)
              .maybeSingle()

            const currentPortfolioValue = latestSnap?.portfolio_value ?? 10000
            const tradeAmount = Math.max(10, (currentPortfolioValue * positionSizePct) / 100)
            const qty = tradeAmount / signal.price
            if (qty <= 0) continue

            const status = user.guardian_mode === 'autonomous' ? 'filled' : 'pending_approval'
            const { error: tradeErr } = await db.from('enki_trades').insert({
              user_id:     user.user_id,
              doctrine_id: doctrine.id,
              symbol,
              side:        signal.side,
              qty,
              price:       signal.price,
              total:       tradeAmount,
              broker:      'paper',
              paper:       true,
              confidence:  signal.confidence,
              status,
              reason:      `Cloud Runner: ${enkiSignalLabel(signal)} | ${positionSizePct}% portfolio ($${tradeAmount.toFixed(2)})`,
              executed_at: now.toISOString(),
            })
            if (!tradeErr && status === 'filled') {
              totalTrades++
              // Browser push notification — non-fatal
              sendPushNotification(
                user.user_id,
                '📈 Enki: New trade signal',
                `${symbol} — ${signal.side.toUpperCase()} (Cloud Runner)`,
                '/enki/dashboard',
                'enki-trade',
              )
            }
          }
        }
      })
    }

    console.log(`[CloudRunnerScan] Complete — ${activeUsers.length} user(s), ${totalTrades} trade(s)`)
    return { scanned: activeUsers.length, trades: totalTrades }
  }
)

// ─── Competitor Alerts — every 4 hours ────────────────────────────────────────
// Checks competitor_posts for new posts fetched since last_checked_at on each
// competitor_account. Sends an in-app notification + browser push to the owner
// when new competitor activity is detected. Uses already-stored posts — no
// external API calls. Updates last_checked_at after alerting.
export const competitorAlerts = inngest.createFunction(
  { id: 'competitor-alerts', name: 'Competitor Post Alerts' },
  { cron: '0 */4 * * *' },
  async ({ step }) => {
    const db = getSupabaseAdmin()

    // Fetch all competitor accounts that have been checked at least once
    const competitors = await step.run('fetch-competitors', async () => {
      const { data, error } = await db
        .from('competitor_accounts')
        .select('id, user_id, platform, handle, last_checked_at')
      if (error) {
        console.error('[CompetitorAlerts] Failed to fetch accounts:', error.message)
        return []
      }
      return data ?? []
    })

    if (!competitors.length) return { alerted: 0, checked: 0 }

    let alerted = 0
    let checked = 0

    for (const comp of competitors) {
      await step.run(`check-competitor-${comp.id}`, async () => {
        try {
          // Find posts fetched after this competitor was last checked
          // If never checked, alert on any posts fetched in the last 4 hours
          const sinceTs = comp.last_checked_at
            ? comp.last_checked_at
            : new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()

          const { data: newPosts, error: postsError } = await db
            .from('competitor_posts')
            .select('id, posted_at, content, post_url')
            .eq('competitor_id', comp.id)
            .gt('fetched_at', sinceTs)
            .order('posted_at', { ascending: false })
            .limit(5)

          if (postsError) {
            console.error(`[CompetitorAlerts] Posts query failed for ${comp.handle}:`, postsError.message)
            return
          }

          const now = new Date().toISOString()

          if (newPosts && newPosts.length > 0) {
            const displayHandle = comp.handle.startsWith('@') ? comp.handle : `@${comp.handle}`
            const platformLabel = comp.platform.charAt(0).toUpperCase() + comp.platform.slice(1)
            const title = `👀 New post from ${displayHandle}`
            const body = `${displayHandle} just posted on ${platformLabel}`
            const url = '/competitor-tracking'

            // In-app notification (fire-and-forget)
            db.from('notifications')
              .insert({
                user_id:    comp.user_id,
                type:       'competitor_post',
                message:    `${displayHandle} just posted on ${platformLabel}. Check their latest content.`,
                action_url: url,
              })
              .then(({ error: insertErr }) => {
                if (insertErr) console.warn('[CompetitorAlerts] notifications insert failed:', insertErr.message)
              })

            // Browser push (best-effort)
            await sendPushNotification(comp.user_id, title, body, url, 'competitor_post')

            alerted++
            console.log(`[CompetitorAlerts] Alerted user ${comp.user_id} — ${comp.platform}:${comp.handle} (${newPosts.length} new post(s))`)
          }

          // Always update last_checked_at so the window advances
          await db
            .from('competitor_accounts')
            .update({ last_checked_at: now })
            .eq('id', comp.id)

          checked++
        } catch (err: any) {
          console.error(`[CompetitorAlerts] Error checking ${comp.platform}:${comp.handle}:`, err.message)
        }
      })
    }

    return { alerted, checked, total: competitors.length }
  }
)

// ─── Competitor Post Fetcher — daily at 7am UTC ────────────────────────────────
// Fetches recent public posts for each tracked competitor account and stores
// them in competitor_posts. Supports Bluesky, Mastodon, YouTube, Reddit.
// Discord, Telegram, LinkedIn require auth/bots — skipped for now.
export const competitorPostFetcher = inngest.createFunction(
  { id: 'competitor-post-fetcher', name: 'Competitor Post Fetcher', retries: 2 },
  { cron: '0 7 * * *' },
  async ({ step }) => {
    const db = getSupabaseAdmin()

    // Fetch all competitor accounts across all users
    const competitors = await step.run('fetch-competitor-accounts', async () => {
      const { data, error } = await db
        .from('competitor_accounts')
        .select('id, user_id, platform, handle')
      if (error) {
        console.error('[CompetitorFetcher] Failed to fetch accounts:', error.message)
        return []
      }
      return data ?? []
    })

    if (!competitors.length) {
      console.log('[CompetitorFetcher] No competitor accounts found')
      return { processed: 0 }
    }

    let processed = 0
    let errors = 0

    for (let i = 0; i < competitors.length; i++) {
      const comp = competitors[i]

      // 1-second delay between competitors to respect rate limits
      if (i > 0) {
        await step.sleep(`rate-limit-delay-${i}`, 1000)
      }

      await step.run(`fetch-posts-${comp.id}`, async () => {
        try {
          const posts = await fetchPublicPosts(comp.platform, comp.handle)

          if (!posts.length) {
            console.log(`[CompetitorFetcher] No posts for ${comp.platform}:${comp.handle}`)
            return
          }

          // Upsert posts — use post_url as natural key to avoid duplicates
          for (const post of posts) {
            await db
              .from('competitor_posts')
              .upsert(
                {
                  competitor_id: comp.id,
                  user_id: comp.user_id,
                  platform: comp.platform,
                  post_url: post.post_url,
                  content: post.content,
                  posted_at: post.posted_at,
                  fetched_at: new Date().toISOString(),
                  engagement: post.engagement,
                },
                { onConflict: 'competitor_id,post_url', ignoreDuplicates: false }
              )
          }

          // Update last_checked_at on the competitor account
          await db
            .from('competitor_accounts')
            .update({ last_checked_at: new Date().toISOString() })
            .eq('id', comp.id)

          processed++
          console.log(`[CompetitorFetcher] Fetched ${posts.length} posts for ${comp.platform}:${comp.handle}`)
        } catch (err: any) {
          errors++
          console.error(`[CompetitorFetcher] Error fetching ${comp.platform}:${comp.handle}:`, err.message)
        }
      })
    }

    return { processed, errors, total: competitors.length }
  }
)

// ── Public post fetchers per platform ─────────────────────────────────────────

interface FetchedPost {
  post_url: string | null
  content: string
  posted_at: string | null
  engagement: Record<string, number>
}

async function fetchPublicPosts(platform: string, handle: string): Promise<FetchedPost[]> {
  const cleanHandle = handle.replace(/^@/, '').trim()

  switch (platform) {
    case 'bluesky':
      return fetchBlueskyPosts(cleanHandle)
    case 'mastodon':
      return fetchMastodonPosts(cleanHandle)
    case 'youtube':
      return fetchYouTubePosts(cleanHandle)
    case 'reddit':
      return fetchRedditPosts(cleanHandle)
    default:
      // Discord, Telegram, LinkedIn — require auth, skip for now
      return []
  }
}

async function fetchBlueskyPosts(handle: string): Promise<FetchedPost[]> {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=10`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const items: any[] = data.feed ?? []
    return items.slice(0, 10).map((item: any) => {
      const post = item.post
      const rec  = post?.record
      return {
        post_url:   post?.uri ? `https://bsky.app/profile/${handle}/post/${post.uri.split('/').pop()}` : null,
        content:    (rec?.text ?? '').slice(0, 500),
        posted_at:  rec?.createdAt ?? null,
        engagement: {
          likes:   post?.likeCount   ?? 0,
          reposts: post?.repostCount ?? 0,
          replies: post?.replyCount  ?? 0,
        },
      }
    })
  } catch {
    return []
  }
}

async function fetchMastodonPosts(handle: string): Promise<FetchedPost[]> {
  try {
    // handle format: user@instance.social OR instance.social/user
    let username = handle
    let instance = 'mastodon.social' // default fallback

    if (handle.includes('@')) {
      const parts = handle.split('@')
      username = parts[0]
      instance = parts[1] || instance
    }

    // Look up account ID
    const lookupRes = await fetch(
      `https://${instance}/api/v1/accounts/lookup?acct=${encodeURIComponent(username)}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!lookupRes.ok) return []
    const account = await lookupRes.json()
    const accountId = account?.id
    if (!accountId) return []

    // Fetch statuses
    const statusRes = await fetch(
      `https://${instance}/api/v1/accounts/${accountId}/statuses?limit=10&exclude_replies=true`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!statusRes.ok) return []
    const statuses: any[] = await statusRes.json()

    return statuses.slice(0, 10).map((s: any) => ({
      post_url:   s.url ?? null,
      content:    (s.content ?? '').replace(/<[^>]+>/g, '').slice(0, 500),
      posted_at:  s.created_at ?? null,
      engagement: {
        likes:   s.favourites_count ?? 0,
        reposts: s.reblogs_count    ?? 0,
        replies: s.replies_count    ?? 0,
      },
    }))
  } catch {
    return []
  }
}

async function fetchYouTubePosts(handle: string): Promise<FetchedPost[]> {
  try {
    // Try @handle RSS feed format
    const feedUrl = handle.startsWith('UC')
      ? `https://www.youtube.com/feeds/videos.xml?channel_id=${handle}`
      : `https://www.youtube.com/feeds/videos.xml?user=${handle}`

    const res = await fetch(feedUrl, { headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' } })
    if (!res.ok) return []
    const xml = await res.text()

    // Simple XML parse — extract entry elements
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []
    return entries.slice(0, 10).map((entry: string) => {
      const id      = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ?? [])[1] ?? ''
      const title   = (entry.match(/<title>([^<]+)<\/title>/)            ?? [])[1] ?? ''
      const date    = (entry.match(/<published>([^<]+)<\/published>/)    ?? [])[1] ?? null
      const views   = parseInt((entry.match(/<media:statistics views="(\d+)"/) ?? [])[1] ?? '0', 10)
      return {
        post_url:   id ? `https://www.youtube.com/watch?v=${id}` : null,
        content:    title.slice(0, 500),
        posted_at:  date,
        engagement: { views },
      }
    })
  } catch {
    return []
  }
}

async function fetchRedditPosts(handle: string): Promise<FetchedPost[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/user/${encodeURIComponent(handle)}/posts.json?limit=10`,
      { headers: { 'User-Agent': 'SocialMate/1.0 (competitor-tracker; +https://socialmate.studio)' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const posts: any[] = data.data?.children ?? []

    return posts.slice(0, 10).map((child: any) => {
      const p = child.data
      return {
        post_url:   p.url ? `https://www.reddit.com${p.permalink}` : null,
        content:    (p.selftext || p.title || '').slice(0, 500),
        posted_at:  p.created_utc ? new Date(p.created_utc * 1000).toISOString() : null,
        engagement: {
          upvotes:  p.score         ?? 0,
          comments: p.num_comments  ?? 0,
        },
      }
    })
  } catch {
    return []
  }
}

// ─── Enki Truth Mode Scan ─────────────────────────────────────────────────────
// Parallel validation system. Runs alongside the main scan without interfering.
// Long-only paper trades stored in enki_truth_trades.
// Purpose: determine if momentum + mean_reversion strategies have real edge.
// Rules: no new signals, no parameter changes, 50 trades minimum per strategy.

export const enkiTruthModeScan = inngest.createFunction(
  { id: 'enki-truth-mode-scan', name: 'Enki Truth Mode Scan', retries: 1 },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    // ── 1. Fetch users with Truth Mode enabled ────────────────────────────────
    const activeUsers = await step.run('truth-fetch-users', async () => {
      const db = getSupabaseAdmin()
      const { data, error } = await db
        .from('enki_profiles')
        .select('user_id, truth_mode_enabled')
        .eq('truth_mode_enabled', true)
        .neq('guardian_mode', 'dormant')
      if (error || !data?.length) return []
      return data.map((p: any) => p.user_id as string)
    })

    if (!activeUsers.length) return { scanned: 0, trades: 0 }

    // ── 2. Collect unique symbols from open truth positions + watchlists ──────
    const symbolsStep = await step.run('truth-collect-symbols', async () => {
      const db = getSupabaseAdmin()

      const { data: openRows } = await db
        .from('enki_truth_trades')
        .select('symbol')
        .in('user_id', activeUsers)
        .eq('is_open', true)

      const symbolSet = new Set<string>((openRows ?? []).map((r: any) => r.symbol as string))

      const { data: doctrines } = await db
        .from('enki_doctrines')
        .select('user_id, config')
        .in('user_id', activeUsers)
        .eq('is_active', true)

      for (const d of doctrines ?? []) {
        const syms: string[] = d.config?.symbols ?? ['SPY', 'QQQ']
        for (const s of syms) symbolSet.add(s.toUpperCase())
      }

      return Array.from(symbolSet)
    })

    if (!symbolsStep.length) return { scanned: 0, trades: 0 }

    // ── 3. Fetch OHLCV + compute truth signals ────────────────────────────────
    const priceData = await step.run('truth-fetch-prices', async () => {
      const result: Record<string, {
        closes:       number[]
        highs:        number[]
        lows:         number[]
        price:        number
        atr:          number
        dailyReturns: number[]
        momentum:     ReturnType<typeof scoreTruthMomentum>
        meanRev:      ReturnType<typeof scoreTruthMeanReversion>
      }> = {}

      for (const symbol of symbolsStep) {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
          if (!res.ok) continue
          const json  = await res.json()
          const r     = json?.chart?.result?.[0]
          if (!r) continue
          const quote   = r.indicators?.quote?.[0]
          const closes  = (quote?.close  ?? []).filter((v: unknown) => v != null) as number[]
          const highs   = (quote?.high   ?? []).filter((v: unknown) => v != null) as number[]
          const lows    = (quote?.low    ?? []).filter((v: unknown) => v != null) as number[]
          const volumes = (quote?.volume ?? []).filter((v: unknown) => v != null) as number[]
          if (closes.length < 30) continue

          const atrRaw = enkiCalcATR(highs, lows, closes)
          if (!atrRaw) continue

          const dailyReturns = closes.slice(-21).map((c: number, i: number, arr: number[]) =>
            i === 0 ? 0 : (c - arr[i - 1]) / arr[i - 1]
          ).slice(1)

          result[symbol] = {
            closes,
            highs,
            lows,
            price:        closes[closes.length - 1],
            atr:          atrRaw,
            dailyReturns,
            momentum:     scoreTruthMomentum(closes, highs, lows, volumes),
            meanRev:      scoreTruthMeanReversion(closes, highs, lows),
          }
        } catch (err: any) {
          console.warn(`[TruthScan] Price error ${symbol}:`, err.message)
        }
      }

      return result
    })

    const congressData = await step.run('truth-fetch-congress', async () => {
      return fetchTruthCongressData(symbolsStep)
    })

    // ── 4. Per-user processing ────────────────────────────────────────────────
    let totalTrades = 0
    const now = new Date()

    for (let i = 0; i < activeUsers.length; i++) {
      const userId = activeUsers[i]

      await step.run(`truth-scan-user-${userId}-${i}`, async () => {
        const db   = getSupabaseAdmin()
        const utcT = now.getUTCHours() * 60 + now.getUTCMinutes()
        const dow  = now.getUTCDay()
        const marketOpen = dow !== 0 && dow !== 6 && utcT >= 13 * 60 + 30 && utcT < 20 * 60

        // ── 4a. Process open positions ────────────────────────────────────────
        const { data: openTrades } = await db
          .from('enki_truth_trades')
          .select('*')
          .eq('user_id', userId)
          .eq('is_open', true)

        for (const pos of openTrades ?? []) {
          const sym           = pos.symbol as string
          const px            = priceData[sym]?.price
          if (!px || !marketOpen) continue

          const entryPrice        = Number(pos.entry_price)
          const remainingQty      = Number(pos.remaining_qty)
          const atrAtEntry        = Number(pos.atr_at_entry)
          const highestPriceSeen  = Number(pos.highest_price_seen)
          const tp1Hit            = Boolean(pos.tp1_hit)
          const tp2Hit            = Boolean(pos.tp2_hit)
          const newHighest        = Math.max(highestPriceSeen, px)

          const trailPct      = computeTrailPct(atrAtEntry, entryPrice, tp1Hit, tp2Hit)
          const trailStop     = newHighest * (1 - trailPct / 100)
          const staticStop    = Number(pos.stop_price)
          const effectiveStop = Math.max(staticStop, trailStop)

          if (newHighest > highestPriceSeen) {
            await db.from('enki_truth_trades')
              .update({ highest_price_seen: newHighest, updated_at: new Date().toISOString() })
              .eq('id', pos.id)
          }

          if (px <= effectiveStop) {
            const pnlPct    = ((px - entryPrice) / entryPrice) * 100
            const pnlDollar = (px - entryPrice) * remainingQty
            const isTrail   = px > staticStop
            await db.from('enki_truth_trades').update({
              is_open:           false,
              exit_price:        px,
              exit_time:         new Date().toISOString(),
              exit_reason:       isTrail ? 'trailing_stop' : 'stop_loss',
              stop_loss_hit:     !isTrail,
              trailing_stop_hit: isTrail,
              pnl_dollar:        pnlDollar,
              pnl_pct:           pnlPct,
              win:               pnlPct > 0,
              updated_at:        new Date().toISOString(),
            }).eq('id', pos.id)
            await updateTruthStats(db, userId, pos.strategy as TruthStrategy, pos.confidence, Boolean(pos.congressional_boost), pnlPct)
            totalTrades++
            console.log(`[TruthScan] ${isTrail ? 'TRAIL' : 'SL'}: ${userId} ${sym} @$${px.toFixed(2)} P&L=${pnlPct.toFixed(2)}%`)
            continue
          }

          if (!tp1Hit && px >= Number(pos.tp1_price)) {
            const sellQty = remainingQty * 0.33
            await db.from('enki_truth_trades').update({
              tp1_hit:            true,
              tp1_exit_price:     px,
              tp1_exit_time:      new Date().toISOString(),
              remaining_qty:      remainingQty - sellQty,
              highest_price_seen: newHighest,
              updated_at:         new Date().toISOString(),
            }).eq('id', pos.id)
            totalTrades++
            console.log(`[TruthScan] TP1: ${userId} ${sym} @$${px.toFixed(2)}`)
            continue
          }

          if (tp1Hit && !tp2Hit && px >= Number(pos.tp2_price)) {
            const sellQty = remainingQty * 0.5
            await db.from('enki_truth_trades').update({
              tp2_hit:            true,
              tp2_exit_price:     px,
              tp2_exit_time:      new Date().toISOString(),
              remaining_qty:      remainingQty - sellQty,
              highest_price_seen: newHighest,
              updated_at:         new Date().toISOString(),
            }).eq('id', pos.id)
            totalTrades++
            console.log(`[TruthScan] TP2: ${userId} ${sym} @$${px.toFixed(2)}`)
          }
        }

        // ── 4b. New signal evaluation ─────────────────────────────────────────
        if (!marketOpen) return

        const { data: allOpen } = await db
          .from('enki_truth_trades')
          .select('symbol, entry_price, position_usd, pnl_pct')
          .eq('user_id', userId)
          .eq('is_open', true)

        let openCountLocal = (allOpen ?? []).length
        if (openCountLocal >= 5) return

        const totalEquity    = 10_000
        const unrealizedPnl  = (allOpen ?? []).reduce((s: number, p: any) => s + (Number(p.pnl_pct) / 100) * Number(p.position_usd), 0)
        const portfolioValue = totalEquity + unrealizedPnl

        const todayStart = new Date(now); todayStart.setUTCHours(0, 0, 0, 0)
        const { data: todayClosed } = await db
          .from('enki_truth_trades')
          .select('pnl_dollar')
          .eq('user_id', userId)
          .eq('is_open', false)
          .gte('exit_time', todayStart.toISOString())
        const dailyPnl = (todayClosed ?? []).reduce((s: number, t: any) => s + Number(t.pnl_dollar ?? 0), 0)

        if (dailyPnl / totalEquity <= -0.03) {
          console.log(`[TruthScan] Daily 3% stop for ${userId}`)
          return
        }
        if (portfolioValue / totalEquity - 1 <= -0.12) {
          console.log(`[TruthScan] Portfolio 12% drawdown stop for ${userId}`)
          return
        }

        const { data: closedTrades } = await db
          .from('enki_truth_trades')
          .select('win, pnl_pct')
          .eq('user_id', userId)
          .eq('is_open', false)
          .limit(100)

        const kellyPct = computeTruthKelly(
          (closedTrades ?? []).map((t: any) => ({ win: Boolean(t.win), pnlPct: Number(t.pnl_pct ?? 0) }))
        )

        const openSymbols = Array.from(new Set((allOpen ?? []).map((p: any) => p.symbol as string)))

        const cooldownCutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        const { data: recentClosed } = await db
          .from('enki_truth_trades')
          .select('symbol')
          .eq('user_id', userId)
          .eq('is_open', false)
          .gte('exit_time', cooldownCutoff)
        const cooldownSet = new Set((recentClosed ?? []).map((r: any) => r.symbol as string))

        // Same-day entry guard: no re-entry for a symbol already traded today (prevents
        // duplicate data points that would corrupt the experiment's per-day sample).
        const todayEntryStart = new Date(now)
        todayEntryStart.setUTCHours(0, 0, 0, 0)
        const { data: todayEntries } = await db
          .from('enki_truth_trades')
          .select('symbol')
          .eq('user_id', userId)
          .gte('entry_time', todayEntryStart.toISOString())
        const todaySymbolSet = new Set((todayEntries ?? []).map((r: any) => r.symbol as string))

        for (const symbol of symbolsStep) {
          if (openCountLocal >= 5) break
          if (cooldownSet.has(symbol)) continue
          if (todaySymbolSet.has(symbol)) continue

          const data = priceData[symbol]
          if (!data) continue
          if ((allOpen ?? []).some((p: any) => p.symbol === symbol)) continue

          // Correlation guard: Pearson > 0.85 with any open position
          let tooCorrelated = false
          for (const openSym of openSymbols) {
            const openReturns = priceData[openSym]?.dailyReturns ?? []
            if (openReturns.length < 10 || data.dailyReturns.length < 10) continue
            const minLen = Math.min(openReturns.length, data.dailyReturns.length)
            const corr = truthCalcCorrelation(openReturns.slice(-minLen), data.dailyReturns.slice(-minLen))
            if (corr !== null && corr > 0.85) { tooCorrelated = true; break }
          }
          if (tooCorrelated) continue

          // Collect valid signals (momentum first, then mean_reversion)
          const candidates: Array<{ rawSig: TruthSignal; atr: number }> = []
          if (data.momentum) candidates.push({ rawSig: data.momentum.signal, atr: data.momentum.atr })
          if (data.meanRev)  candidates.push({ rawSig: data.meanRev.signal,  atr: data.meanRev.atr })

          for (const { rawSig, atr } of candidates) {
            const sig = applyCongressionalBoost(rawSig, congressData[symbol])

            const positionSizePct = kellyPct / 100
            const positionUsd     = portfolioValue * positionSizePct
            const qty             = positionUsd / data.price

            const { error: insertErr } = await db.from('enki_truth_trades').insert({
              user_id:             userId,
              symbol,
              strategy:            sig.strategy,
              confidence:          sig.confidence,
              congressional_boost: sig.congressionalBoost,
              adx_at_entry:        sig.adxAtEntry,
              rsi_at_entry:        sig.rsiAtEntry,
              atr_at_entry:        atr,
              spy_price_at_entry:  priceData['SPY']?.price ?? null,
              entry_price:         data.price,
              entry_time:          new Date().toISOString(),
              qty,
              remaining_qty:       qty,
              position_size_pct:   kellyPct,
              position_usd:        positionUsd,
              kelly_pct_used:      kellyPct,
              stop_price:          sig.stopPrice,
              highest_price_seen:  data.price,
              tp1_price:           sig.tp1Price,
              tp2_price:           sig.tp2Price,
              is_open:             true,
            })

            if (!insertErr) {
              openCountLocal++
              totalTrades++
              console.log(`[TruthScan] ENTRY: ${userId} ${sig.strategy.toUpperCase()} ${symbol} @$${data.price.toFixed(2)} conf=${sig.confidence} kelly=${kellyPct}%${sig.congressionalBoost ? ' [CONGRESS BOOST]' : ''}`)
              break
            }
          }
        }
      })
    }

    return { scanned: activeUsers.length, trades: totalTrades }
  }
)

// ── Truth Mode stat aggregator — called on every trade close ──────────────────
async function updateTruthStats(
  db:            ReturnType<typeof getSupabaseAdmin>,
  userId:        string,
  strategy:      TruthStrategy,
  confidence:    string,
  congressBoost: boolean,
  pnlPct:        number,
): Promise<void> {
  const win = pnlPct > 0

  const { data: existing } = await db
    .from('enki_truth_strategy_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('strategy', strategy)
    .single()

  const cur = existing ?? {
    total_trades: 0, wins: 0, losses: 0,
    gross_win_pct: 0, gross_loss_pct: 0,
    high_conf_trades: 0, high_conf_wins: 0,
    medium_conf_trades: 0, medium_conf_wins: 0,
    congress_trades: 0, congress_wins: 0,
    max_consecutive_losses: 0, current_consecutive_losses: 0,
    total_pnl_pct: 0,
  }

  const newTotal    = Number(cur.total_trades) + 1
  const newWins     = Number(cur.wins)   + (win ? 1 : 0)
  const newLosses   = Number(cur.losses) + (win ? 0 : 1)
  const newGrossWin  = win ? Number(cur.gross_win_pct)  + pnlPct : Number(cur.gross_win_pct)
  const newGrossLoss = win ? Number(cur.gross_loss_pct) : Number(cur.gross_loss_pct) + pnlPct

  const avgWin  = newWins   > 0 ? newGrossWin  / newWins   : 0
  const avgLoss = newLosses > 0 ? newGrossLoss / newLosses : 0
  const profitFactor = newLosses > 0 && newGrossLoss !== 0
    ? Math.abs(newGrossWin) / Math.abs(newGrossLoss)
    : null

  const consecLosses = win ? 0 : Number(cur.current_consecutive_losses) + 1

  await db.from('enki_truth_strategy_stats').upsert({
    user_id:                    userId,
    strategy,
    total_trades:               newTotal,
    wins:                       newWins,
    losses:                     newLosses,
    win_rate:                   newTotal > 0 ? newWins / newTotal : 0,
    gross_win_pct:              newGrossWin,
    gross_loss_pct:             newGrossLoss,
    avg_win_pct:                avgWin,
    avg_loss_pct:               avgLoss,
    profit_factor:              profitFactor,
    total_pnl_pct:              newGrossWin + newGrossLoss,
    high_conf_trades:           confidence === 'HIGH'   ? Number(cur.high_conf_trades)   + 1 : Number(cur.high_conf_trades),
    high_conf_wins:             confidence === 'HIGH'   && win ? Number(cur.high_conf_wins)   + 1 : Number(cur.high_conf_wins),
    medium_conf_trades:         confidence === 'MEDIUM' ? Number(cur.medium_conf_trades) + 1 : Number(cur.medium_conf_trades),
    medium_conf_wins:           confidence === 'MEDIUM' && win ? Number(cur.medium_conf_wins) + 1 : Number(cur.medium_conf_wins),
    congress_trades:            congressBoost ? Number(cur.congress_trades) + 1 : Number(cur.congress_trades),
    congress_wins:              congressBoost && win ? Number(cur.congress_wins) + 1 : Number(cur.congress_wins),
    max_consecutive_losses:     Math.max(Number(cur.max_consecutive_losses), consecLosses),
    current_consecutive_losses: consecLosses,
    updated_at:                 new Date().toISOString(),
  }, { onConflict: 'user_id,strategy' })
}

// ─── Studio Stax — renewal email drip — 9 AM UTC daily ───────────────────────
// Sends 30/14/7-day renewal reminders to Studio Stax listing holders.
// Uses *_sent_at timestamp columns for idempotency (safe to re-run any day).
// Renewal link = token-authenticated /studio-stax/renew page (existing flow).

export const studioStaxRenewalEmails = inngest.createFunction(
  { id: 'studio-stax-renewal-emails', name: 'Studio Stax Renewal Emails', retries: 2 },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

    // ── 1. Fetch active slots with expires_at set ─────────────────────────────
    const slots = await step.run('fetch-active-slots', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('studio_stax_slots')
        .select('id, buyer_name, buyer_email, listing_id, amount_paid_cents, expires_at, renewal_email_30_sent_at, renewal_email_14_sent_at, renewal_email_7_sent_at, renewal_token, renewal_token_expires')
        .eq('status', 'active')
        .not('expires_at', 'is', null)
        .gt('expires_at', new Date().toISOString())
      if (error) {
        console.error('[StaxRenewalEmails] DB error:', error.message)
        return []
      }
      return data ?? []
    })

    if (!slots.length) {
      console.log('[StaxRenewalEmails] No active slots found')
      return { sent: 0, skipped: 0 }
    }

    // ── 2. Bulk-fetch listing names ───────────────────────────────────────────
    const listingNameMap: Record<string, string> = await step.run('fetch-listing-names', async () => {
      const ids = Array.from(new Set(slots.map((s: any) => s.listing_id).filter(Boolean))) as string[]
      if (!ids.length) return {}
      const { data } = await getSupabaseAdmin()
        .from('curated_listings')
        .select('id, name')
        .in('id', ids)
      const map: Record<string, string> = {}
      for (const r of data ?? []) map[r.id] = r.name
      return map
    })

    // ── 3. Send renewal emails ────────────────────────────────────────────────
    let sent = 0
    let skipped = 0

    await step.run('send-renewal-emails', async () => {
      const { randomUUID } = await import('crypto')
      const resend = getResend()
      const now = new Date()

      for (const slot of slots) {
        const daysLeft = Math.floor((new Date(slot.expires_at).getTime() - now.getTime()) / 86400000)

        // Determine which bucket this slot is in and whether we've already sent
        const needs30 = daysLeft <= 30 && daysLeft > 14 && !slot.renewal_email_30_sent_at
        const needs14 = daysLeft <= 14 && daysLeft > 7  && !slot.renewal_email_14_sent_at
        const needs7  = daysLeft <= 7  && daysLeft >= 0  && !slot.renewal_email_7_sent_at

        if (!needs30 && !needs14 && !needs7) {
          skipped++
          continue
        }

        const email     = slot.buyer_email
        const name      = slot.buyer_name || 'there'
        const toolName  = listingNameMap[slot.listing_id] || 'your listing'
        const renewDate = new Date(slot.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        const tierLabel = (slot.amount_paid_cents ?? 10000) <= 10000 ? 'founding' : 'standard'
        const renewalDollars = Math.round((slot.amount_paid_cents ?? 10000) * 0.80 / 100)

        // Ensure a valid renewal token exists (create/refresh if needed)
        let token = slot.renewal_token
        const tokenExpired = slot.renewal_token_expires && new Date(slot.renewal_token_expires) < now
        if (!token || tokenExpired) {
          token = randomUUID()
          try {
            await getSupabaseAdmin()
              .from('studio_stax_slots')
              .update({
                renewal_token:         token,
                renewal_token_expires: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('id', slot.id)
          } catch (err) {
            console.error(`[StaxRenewalEmails] Token update failed for slot ${slot.id}:`, err)
          }
        }
        const renewalLink = `${appUrl}/studio-stax/renew?token=${token}`

        // Build subject + HTML based on bucket
        let subject: string
        let html: string

        if (needs30) {
          subject = `Your Studio Stax listing renews in 30 days`
          html = staxEmailHtml({
            name, toolName, renewDate, daysLeft, renewalLink, renewalDollars,
            tierLabel, urgency: 'low',
          })
        } else if (needs14) {
          subject = `14 days left on your Studio Stax listing`
          html = staxEmailHtml({
            name, toolName, renewDate, daysLeft, renewalLink, renewalDollars,
            tierLabel, urgency: 'medium',
          })
        } else {
          subject = `\u26a0\ufe0f Your Studio Stax listing expires in 7 days`
          html = staxEmailHtml({
            name, toolName, renewDate, daysLeft, renewalLink, renewalDollars,
            tierLabel, urgency: 'high',
          })
        }

        try {
          await resend.emails.send({
            from:    'SocialMate <noreply@socialmate.studio>',
            to:      email,
            subject,
            html,
          })
          const sentAt = now.toISOString()
          const field  = needs30 ? 'renewal_email_30_sent_at' : needs14 ? 'renewal_email_14_sent_at' : 'renewal_email_7_sent_at'
          await getSupabaseAdmin()
            .from('studio_stax_slots')
            .update({ [field]: sentAt })
            .eq('id', slot.id)
          sent++
        } catch (err) {
          console.error(`[StaxRenewalEmails] Resend failed for ${email}:`, err)
          // Non-fatal — keep going
        }
      }
    })

    console.log(`[StaxRenewalEmails] Done — sent: ${sent}, skipped: ${skipped}`)
    return { sent, skipped }
  }
)

// ── Studio Stax email HTML builder ───────────────────────────────────────────
function staxEmailHtml(opts: {
  name: string
  toolName: string
  renewDate: string
  daysLeft: number
  renewalLink: string
  renewalDollars: number
  tierLabel: string
  urgency: 'low' | 'medium' | 'high'
}): string {
  const { name, toolName, renewDate, daysLeft, renewalLink, renewalDollars, tierLabel, urgency } = opts
  const isFounding = tierLabel === 'founding'
  const urgencyColor = urgency === 'high' ? '#ef4444' : urgency === 'medium' ? '#f59e0b' : '#3b82f6'
  const urgencyBg    = urgency === 'high' ? '#fef2f2' : urgency === 'medium' ? '#fffbeb' : '#eff6ff'
  const urgencyText  = urgency === 'high'
    ? `Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left — your listing expires soon.`
    : urgency === 'medium'
    ? `${daysLeft} days left — renew early to lock in your rate.`
    : `${daysLeft} days until renewal — plan ahead.`

  const savingsNote = isFounding
    ? `you save $20 off the $100/yr founding rate`
    : `you save $30 off the $150/yr standard rate`

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#F59E0B,#7C3AED);padding:24px 32px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;text-align:center;line-height:32px;font-weight:800;font-size:14px;color:#fff;">S</div>
          <span style="font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.02em;">SocialMate</span>
          <span style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-left:4px;">Studio Stax</span>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:32px;">

        <!-- Urgency badge -->
        <div style="background:${urgencyBg};border:1px solid ${urgencyColor}40;border-radius:12px;padding:14px 18px;margin-bottom:24px;border-left:4px solid ${urgencyColor};">
          <p style="margin:0;font-size:13px;font-weight:700;color:${urgencyColor};">${urgencyText}</p>
        </div>

        <p style="margin:0 0 12px;font-size:14px;color:#d1d5db;">Hi ${name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.7;">
          Your Studio Stax listing <strong style="color:#f1f1f1;">"${toolName}"</strong> is set to renew on
          <strong style="color:#F59E0B;">${renewDate}</strong>.
          Renew now and keep your spot at <strong style="color:#f1f1f1;">$${renewalDollars}/year</strong> (${savingsNote}).
        </p>

        <!-- What you keep -->
        <div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">What you keep on renewal</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#9ca3af;line-height:1.9;">
            <li>Your listing stays live in the SM-Give ranked directory</li>
            <li>${isFounding ? 'Founding member rate locked in for life' : 'Standard tier status maintained'}</li>
            <li>All SM-Give donation credit and ranking preserved</li>
            ${isFounding ? '<li style="color:#F59E0B;">If you let it lapse, your founding spot opens to others</li>' : ''}
          </ul>
        </div>

        <!-- CTA -->
        <div style="margin:24px 0;">
          <a href="${renewalLink}"
            style="background:#F59E0B;color:#000;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
            Renew Now — $${renewalDollars}/year →
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #222;margin:24px 0;" />

        <!-- RenewalMate teaser -->
        <div style="margin-bottom:16px;">
          <p style="font-size:13px;color:#9ca3af;line-height:1.7;margin:0 0 8px;">
            We're also building <strong style="color:#f1f1f1;">RenewalMate</strong> — a dedicated tool for tracking all your
            subscriptions and renewals so nothing sneaks up on you.
            SocialMate members get early access free. Stay tuned.
          </p>
          <a href="https://renewalmate.com" style="font-size:12px;font-weight:700;color:#F59E0B;text-decoration:none;">renewalmate.com →</a>
        </div>

        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
          — Joshua &amp; the SocialMate team<br/>
          <a href="mailto:hello@socialmate.studio" style="color:#6b7280;text-decoration:none;font-size:12px;">hello@socialmate.studio</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #222;padding:16px 32px;text-align:center;">
        <p style="font-size:11px;color:#374151;margin:0;">
          &copy; ${new Date().getFullYear()} Gilgamesh Enterprise LLC &middot; SocialMate &middot;
          <a href="mailto:hello@socialmate.studio" style="color:#4b5563;text-decoration:none;">hello@socialmate.studio</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ── SOMA Credits Monthly Reset ─────────────────────────────────────────────────
// Runs on the 1st of every month at midnight UTC.
// Resets soma_credits_used = 0 and recalculates soma_credits_monthly based on
// current workspace plan (handles mid-month plan changes correctly).
export const resetSomaCredits = inngest.createFunction(
  { id: 'reset-soma-credits' },
  { cron: '0 0 1 * *' },
  async ({ step }) => {
    const result = await step.run('reset-soma-credits', async () => {
      const admin = getSupabaseAdmin()

      // Fetch all workspaces with their plan
      const { data: workspaces, error } = await admin
        .from('workspaces')
        .select('id, plan')

      if (error) {
        console.error('[ResetSomaCredits] Failed to fetch workspaces:', error.message)
        return { reset: 0, error: error.message }
      }

      if (!workspaces?.length) return { reset: 0 }

      // Map plan → monthly SOMA credit allowance
      function planToSomaCredits(plan: string | null): number {
        if (!plan) return 0
        if (plan === 'pro' || plan === 'pro_annual')       return 1000
        if (plan === 'agency' || plan === 'agency_annual') return 5000
        return 0
      }

      const now = new Date().toISOString()
      let resetCount = 0

      // Process in batches of 100 to stay within Supabase limits
      const batchSize = 100
      for (let i = 0; i < workspaces.length; i += batchSize) {
        const batch = workspaces.slice(i, i + batchSize)
        const ids   = batch.map(w => w.id)

        // Build per-workspace soma_credits_monthly updates
        // Group by credit amount to minimise DB round trips
        const buckets: Record<number, string[]> = {}
        for (const w of batch) {
          const credits = planToSomaCredits(w.plan)
          if (!buckets[credits]) buckets[credits] = []
          buckets[credits].push(w.id)
        }

        for (const [credits, wIds] of Object.entries(buckets)) {
          const { error: updateError } = await admin
            .from('workspaces')
            .update({
              soma_credits_used:     0,
              soma_credits_monthly:  Number(credits),
              soma_credits_reset_at: now,
            })
            .in('id', wIds)

          if (updateError) {
            console.error('[ResetSomaCredits] Batch update error:', updateError.message)
          } else {
            resetCount += wIds.length
          }
        }
      }

      console.log(`[ResetSomaCredits] Reset ${resetCount} workspaces`)
      return { reset: resetCount }
    })

    return result
  }
)

export const streakNotifications = inngest.createFunction(
  { id: 'streak-notifications', name: 'Streak Notifications', retries: 2 },
  { cron: '0 22 * * *' }, // 6 PM ET (approx)
  async ({ step }) => {
    const nowUtc = new Date()
    const todayUtc = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate()))
    const thirtyDaysAgo = new Date(todayUtc.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const atRiskUsers = await step.run('find-streak-at-risk-users', async () => {
      const { data: posts, error } = await getSupabaseAdmin()
        .from('posts')
        .select('user_id, published_at')
        .gte('published_at', thirtyDaysAgo)
        .in('status', ['published', 'partial'])
        .not('published_at', 'is', null)

      if (error) {
        console.error('[StreakNotifications] Failed to query posts:', error.message)
        return []
      }
      if (!posts?.length) return []

      function dayKey(iso: string) {
        const d = new Date(iso)
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
      }

      const todayKey = dayKey(todayUtc.toISOString())

      const userDays = new Map<string, Set<string>>()
      for (const post of posts) {
        if (!userDays.has(post.user_id)) userDays.set(post.user_id, new Set())
        userDays.get(post.user_id)!.add(dayKey(post.published_at))
      }

      const atRisk: Array<{ user_id: string; streak: number }> = []

      for (const [userId, days] of Array.from(userDays.entries())) {
        if (days.has(todayKey)) continue // already posted today, no alert needed

        let streak = 0
        const cursor = new Date(todayUtc)
        cursor.setUTCDate(cursor.getUTCDate() - 1)
        while (streak < 30) {
          if (!days.has(dayKey(cursor.toISOString()))) break
          streak++
          cursor.setUTCDate(cursor.getUTCDate() - 1)
        }

        if (streak >= 3) atRisk.push({ user_id: userId, streak })
      }

      return atRisk
    })

    if (!atRiskUsers.length) {
      console.log('[StreakNotifications] No at-risk streaks')
      return { notified: 0 }
    }

    const userIds = atRiskUsers.map(u => u.user_id)

    const recentlyNotifiedIds = await step.run('find-recently-notified', async () => {
      const { data } = await getSupabaseAdmin()
        .from('notifications')
        .select('user_id')
        .in('user_id', userIds)
        .eq('type', 'streak_at_risk')
        .gte('created_at', todayUtc.toISOString())
      return (data ?? []).map((n: any) => n.user_id as string)
    })

    const notifiedSet = new Set<string>(recentlyNotifiedIds)
    const toNotify = atRiskUsers.filter(u => !notifiedSet.has(u.user_id))

    await step.run('send-streak-notifications', async () => {
      for (const user of toNotify) {
        const body = `You're on a ${user.streak}-day posting streak! Post something today to keep it going.`
        await inngest.send({
          name: 'notification/send',
          data: { user_id: user.user_id, type: 'streak_at_risk', title: 'Your streak is at risk!', body, link: '/create' },
        })
        await sendPushNotification(user.user_id, 'Streak at risk!', body, '/create', 'streak_at_risk')
      }
    })

    console.log(`[StreakNotifications] Notified ${toNotify.length} (skipped ${atRiskUsers.length - toNotify.length})`)
    return { notified: toNotify.length, skipped: atRiskUsers.length - toNotify.length }
  }
)

function somaParseGeminiJson(text: string): any {
  return JSON.parse(
    text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  )
}

const SOMA_PLATFORM_INSTRUCTIONS: Record<string, string> = {
  twitter:   'Twitter/X: ≤280 chars. Punchy, direct, hook in first line. Max 2 hashtags.',
  bluesky:   'Bluesky: ≤300 chars. Conversational, authentic. Community-friendly.',
  linkedin:  'LinkedIn: 3-6 sentences. Professional but human. Start with hook, end with question or takeaway.',
  mastodon:  'Mastodon: ≤500 chars. Community-native, no corporate tone.',
  instagram: 'Instagram: Caption style. 3-5 sentences + 5-8 relevant hashtags on new line.',
  discord:   'Discord: Casual announcement style. Can use **bold** for emphasis. Concise.',
}

export const somaAutopilotRun = inngest.createFunction(
  { id: 'soma-autopilot-run', name: 'SOMA Autopilot Run', retries: 1 },
  { cron: '0 12 * * 1' }, // Every Monday at noon UTC (~8 AM ET)
  async ({ step }) => {
    const GENERATE_COST = SOMA_COSTS.generate_week // 75 credits
    const now = new Date()
    const weekLabel = `Auto — Week of ${now.toISOString().slice(0, 10)}`
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()

    // Find all autopilot/full_send projects whose workspaces have enough credits
    const eligibleProjects = await step.run('find-autopilot-projects', async () => {
      const admin = getSupabaseAdmin()

      const { data: projects, error } = await admin
        .from('soma_projects')
        .select(`
          id, workspace_id, user_id, name, platforms, posts_per_day, content_window_days, mode, runs_this_month,
          workspaces!inner(id, owner_id, soma_credits_monthly, soma_credits_used, soma_credits_purchased, soma_autopilot_enabled)
        `)
        .in('mode', ['autopilot', 'full_send'])

      if (error) {
        console.error('[SomaAutopilot] Failed to query projects:', error.message)
        return []
      }

      return (projects ?? []).filter((p: any) => {
        const ws = p.workspaces
        if (!ws?.soma_autopilot_enabled) return false
        const remaining = Math.max(0, (ws.soma_credits_monthly ?? 0) - (ws.soma_credits_used ?? 0)) + (ws.soma_credits_purchased ?? 0)
        // Run cap check
        const runCap = p.mode === 'full_send' ? 12 : 8
        if ((p.runs_this_month ?? 0) >= runCap) return false
        return remaining >= GENERATE_COST
      })
    })

    if (!eligibleProjects.length) {
      console.log('[SomaAutopilot] No eligible autopilot projects')
      return { processed: 0 }
    }

    // Skip projects that already ran today (idempotency)
    const projectIds = eligibleProjects.map((p: any) => p.id)
    const alreadyRanProjectIds = await step.run('check-already-ran', async () => {
      const { data } = await getSupabaseAdmin()
        .from('soma_weekly_ingestion')
        .select('metadata')
        .gte('created_at', todayStart)
      // ingestion records store project_id in metadata when auto-generated
      const ran = (data ?? [])
        .map((r: any) => r.metadata?.project_id)
        .filter(Boolean)
      return ran as string[]
    })

    const alreadyRanSet = new Set<string>(alreadyRanProjectIds)
    const toProcess = eligibleProjects.filter((p: any) => !alreadyRanSet.has(p.id))

    if (!toProcess.length) {
      console.log('[SomaAutopilot] All eligible projects already ran today')
      return { processed: 0, skipped: eligibleProjects.length }
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[SomaAutopilot] Missing Gemini API key')
      return { processed: 0, error: 'missing_api_key' }
    }

    let processed = 0
    let failed = 0

    for (const project of toProcess) {
      try {
        await step.run(`autopilot-project-${project.id}`, async () => {
          const admin = getSupabaseAdmin()
          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
          const ws = (project as any).workspaces

          const platforms = (project.platforms as string[]) ?? ['bluesky']
          const windowDays = project.content_window_days ?? 7
          const postsPerDay = project.posts_per_day ?? 2

          // Fetch latest master doc for this project as context
          const { data: docs } = await admin
            .from('soma_master_docs')
            .select('id, version, content')
            .eq('project_id', project.id)
            .order('version', { ascending: false })
            .limit(2)

          const currentDoc = docs?.[0] ?? null
          const prevDoc = docs?.[1] ?? null

          let rawInput: string
          if (currentDoc) {
            rawInput = currentDoc.content
          } else {
            // No master doc — fall back to recent posts
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            const { data: recentPosts } = await admin
              .from('posts')
              .select('content')
              .eq('workspace_id', project.workspace_id)
              .in('status', ['published', 'partial'])
              .gte('published_at', sevenDaysAgo)
              .limit(20)
            const lines = (recentPosts ?? []).map(p => `- ${(p.content ?? '').slice(0, 200)}`).join('\n')
            rawInput = lines || 'No prior content. Generate fresh content for a creator building their online presence.'
          }

          // Fetch voice profile
          const { data: profile } = await admin
            .from('soma_identity_profiles')
            .select('tone_profile, writing_style_rules, behavioral_traits, voice_examples')
            .eq('workspace_id', project.workspace_id)
            .maybeSingle()

          const identityContext = profile
            ? `CREATOR VOICE PROFILE:
Tone: ${JSON.stringify(profile.tone_profile)}
Style: ${JSON.stringify(profile.writing_style_rules)}
Personality: ${JSON.stringify(profile.behavioral_traits)}
Example posts: ${Array.isArray(profile.voice_examples) ? (profile.voice_examples as string[]).join(' | ') : 'none'}`
            : 'No voice profile — use authentic, direct tone.'

          // Ingest: extract insights (diff if we have prev doc)
          const ingestPrompt = prevDoc
            ? `Compare these two weekly master docs. Extract what is NEW or CHANGED. Return ONLY valid JSON (no markdown):
{"key_themes":["theme1"],"wins":["win1"],"challenges":["challenge1"],"directional_shifts":["shift1"],"content_angles":["angle1","angle2","angle3","angle4","angle5"],"emotional_tone":"grinding","diff_summary":"One sentence: what changed most."}
PREVIOUS: ${prevDoc.content.slice(0, 3000)}
CURRENT: ${rawInput.slice(0, 3000)}
emotional_tone must be: high, reflective, grinding, or celebratory`
            : `Analyze this weekly master doc. Return ONLY valid JSON (no markdown):
{"key_themes":["theme1"],"wins":["win1"],"challenges":["challenge1"],"directional_shifts":["shift1"],"content_angles":["angle1","angle2","angle3","angle4","angle5"],"emotional_tone":"grinding","diff_summary":"First week baseline."}
MASTER DOC: ${rawInput.slice(0, 4000)}
emotional_tone must be: high, reflective, grinding, or celebratory`

          const ingestResult = await model.generateContent(ingestPrompt)
          const extracted_insights = somaParseGeminiJson(ingestResult.response.text())

          // Insert ingestion record
          const { data: ingestion, error: ingestionErr } = await admin
            .from('soma_weekly_ingestion')
            .insert({
              workspace_id: project.workspace_id,
              user_id: project.user_id,
              week_label: weekLabel,
              raw_input: rawInput,
              extracted_insights,
              generated_posts_count: 0,
              metadata: { project_id: project.id, auto: true },
            })
            .select('id')
            .single()

          if (ingestionErr || !ingestion) throw new Error(`Ingestion insert failed: ${ingestionErr?.message}`)

          // Generate platform-native posts
          const platformInstructions = platforms
            .map(p => SOMA_PLATFORM_INSTRUCTIONS[p] ?? `${p}: Keep it natural and platform-appropriate.`)
            .join('\n')
          const totalPosts = postsPerDay * windowDays

          const genPrompt = `${identityContext}

THIS WEEK'S INSIGHTS:
Key themes: ${extracted_insights.key_themes?.join(', ')}
Wins: ${extracted_insights.wins?.join(', ')}
Challenges: ${extracted_insights.challenges?.join(', ')}
What changed: ${extracted_insights.diff_summary ?? 'New content week'}
Content angles: ${extracted_insights.content_angles?.join(' | ')}
Emotional tone: ${extracted_insights.emotional_tone}

PLATFORM-SPECIFIC FORMATTING RULES:
${platformInstructions}

Generate ${totalPosts} posts spread across ${windowDays} days, ${postsPerDay} per day.
Assign each post to exactly one platform from: ${platforms.join(', ')}
Distribute platforms roughly evenly.

Return ONLY valid JSON:
{"posts":[{"day":1,"slot":"morning","platform":"bluesky","content":"post text","content_type":"mindset"}]}

Rules:
- day 1 to ${windowDays}, slot: morning/afternoon/evening
- morning: mindset/vision, afternoon: progress/updates, evening: reflection/lesson
- NEVER use: "In today's world", "Let's dive in", "game-changer", "synergy", "leverage"
- Format each post correctly for its platform
- Sound human, not AI-generated`

          const genResult = await model.generateContent(genPrompt)
          const { posts: generatedPosts = [] } = somaParseGeminiJson(genResult.response.text())

          // Insert posts
          let postsCreated = 0
          const postStatus = project.mode === 'full_send' ? 'scheduled' : 'scheduled' // both auto modes schedule
          for (const post of generatedPosts as any[]) {
            const base = new Date()
            base.setDate(base.getDate() + (post.day - 1))
            const hours = post.slot === 'morning' ? 9 : post.slot === 'afternoon' ? 14 : 19
            base.setHours(hours, 0, 0, 0)

            const { error: postErr } = await admin.from('posts').insert({
              user_id: project.user_id,
              workspace_id: project.workspace_id,
              content: post.content,
              platforms: [post.platform ?? platforms[0]],
              status: postStatus,
              scheduled_at: base.toISOString(),
              metadata: { source: 'soma_autopilot', project_id: project.id, ingestion_id: ingestion.id, day: post.day, slot: post.slot, content_type: post.content_type },
            })
            if (!postErr) postsCreated++
          }

          await admin.from('soma_weekly_ingestion').update({ generated_posts_count: postsCreated }).eq('id', ingestion.id)

          // Update project runs
          await admin.from('soma_projects')
            .update({ runs_this_month: (project.runs_this_month ?? 0) + 1, last_generated_at: now.toISOString() })
            .eq('id', project.id)

          // Deduct credits
          const monthly = ws.soma_credits_monthly ?? 0
          const used = ws.soma_credits_used ?? 0
          const purchased = ws.soma_credits_purchased ?? 0
          const monthlyAvailable = Math.max(0, monthly - used)
          const newUsed = monthlyAvailable >= GENERATE_COST ? used + GENERATE_COST : monthly
          const newPurchased = monthlyAvailable >= GENERATE_COST ? purchased : purchased - (GENERATE_COST - monthlyAvailable)
          const balanceAfter = Math.max(0, monthly - newUsed) + newPurchased

          await admin.from('workspaces').update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased }).eq('id', project.workspace_id)
          await admin.from('soma_credit_ledger').insert({ workspace_id: project.workspace_id, user_id: project.user_id, action_type: 'autopilot_run', credits_used: GENERATE_COST, balance_after: balanceAfter })

          // Notify user
          const ownerId = ws.owner_id ?? project.user_id
          await inngest.send({ name: 'notification/send', data: { user_id: ownerId, type: 'soma_autopilot', title: `"${project.name}" week is ready`, body: `SOMA generated ${postsCreated} posts. Review them in your queue.`, link: `/soma/projects/${project.id}` } })
          await sendPushNotification(ownerId, `"${project.name}" week is ready!`, `SOMA generated ${postsCreated} posts. Review in your queue.`, `/soma/projects/${project.id}`, 'soma_autopilot')

          // Email notification
          try {
            const { data: ownerData } = await admin.auth.admin.getUserById(ownerId)
            const ownerEmail = ownerData?.user?.email
            if (ownerEmail && process.env.RESEND_API_KEY) {
              const modeLabel = project.mode === 'full_send' ? 'Full Send' : 'Autopilot'
              const previewPosts = (generatedPosts as any[]).slice(0, 2)
              const postCards = previewPosts.map((p: any) => `
                <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px;margin-bottom:10px;">
                  <div style="font-size:10px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">${p.platform ?? ''} · Day ${p.day}</div>
                  <div style="font-size:13px;color:#e5e5e5;line-height:1.5;">${(p.content ?? '').slice(0, 120)}${(p.content ?? '').length > 120 ? '…' : ''}</div>
                </div>`).join('')
              const extraCount = postsCreated - previewPosts.length
              await getResend().emails.send({
                from: 'SOMA <soma@socialmate.studio>',
                to: ownerEmail,
                subject: `⚡ SOMA scheduled ${postsCreated} posts for "${project.name}"`,
                html: `<div style="background:#0f0f0f;font-family:sans-serif;padding:32px;max-width:520px;margin:0 auto;border-radius:16px;">
                  <p style="color:#f59e0b;font-size:18px;font-weight:900;margin:0 0 4px;">⚡ SOMA</p>
                  <p style="color:#e5e5e5;font-size:16px;font-weight:700;margin:0 0 16px;">${modeLabel} ran — ${postsCreated} posts scheduled</p>
                  <p style="color:#888;font-size:13px;margin:0 0 20px;">Project: <strong style="color:#e5e5e5;">${project.name}</strong> · Week of ${weekLabel.replace('Auto — Week of ', '')}</p>
                  ${postCards}
                  ${extraCount > 0 ? `<p style="color:#666;font-size:12px;margin:8px 0 20px;">+ ${extraCount} more post${extraCount !== 1 ? 's' : ''} in your schedule</p>` : ''}
                  <a href="https://socialmate.studio/soma/projects/${project.id}" style="display:inline-block;background:#f59e0b;color:#000;font-weight:900;font-size:13px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px;">View Schedule →</a>
                  <p style="color:#444;font-size:11px;margin-top:24px;">SocialMate by Gilgamesh Enterprise LLC · You're receiving this because SOMA Autopilot is active.</p>
                </div>`,
              })
            }
          } catch (emailErr) {
            console.error('[SomaAutopilot] Email send failed:', emailErr)
          }

          console.log(`[SomaAutopilot] project ${project.id} (${project.name}): ${postsCreated} posts`)
        })
        processed++
      } catch (err: any) {
        console.error(`[SomaAutopilot] project ${project.id} failed:`, err?.message)
        failed++
      }
    }

    console.log(`[SomaAutopilot] processed: ${processed}, failed: ${failed}, skipped: ${alreadyRanSet.size}`)
    return { processed, failed, skipped: alreadyRanSet.size }
  }
)

// ─── Enki Weekly P&L Summary Email ───────────────────────────────────────────
// Every Monday at 9am UTC — sends a summary email to each user who had at
// least one trade in the past 7 days.
export const enkiWeeklySummary = inngest.createFunction(
  { id: 'enki-weekly-summary', name: 'Enki Weekly P&L Summary', retries: 1 },
  { cron: '0 9 * * 1' }, // Monday 9am UTC
  async ({ step }) => {
    const admin = getSupabaseAdmin()

    // Get all users with enki_profiles
    const { data: profiles } = await admin
      .from('enki_profiles')
      .select('user_id')

    if (!profiles || profiles.length === 0) return { sent: 0 }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    let sent = 0

    for (const profile of profiles) {
      try {
        await step.run(`enki-weekly-summary-${profile.user_id}`, async () => {
          // Fetch all trades in the last 7 days for this user
          const { data: weekTrades } = await admin
            .from('enki_trades')
            .select('id, symbol, side, qty, price, status, created_at')
            .eq('user_id', profile.user_id)
            .gte('created_at', sevenDaysAgo)
            .order('created_at', { ascending: true })

          if (!weekTrades || weekTrades.length === 0) return // skip users with no activity

          // Closed trades = filled or executed
          const closedTrades = weekTrades.filter((t: any) =>
            t.status === 'filled' || t.status === 'executed'
          )

          // Count open positions (pending / pending_approval)
          const openPositions = weekTrades.filter((t: any) =>
            t.status === 'pending' || t.status === 'pending_approval'
          ).length

          // Compute P&L from buy/sell pairs (FIFO)
          const buyQueues: Record<string, Array<{ qty: number; price: number }>> = {}
          const sellPnl: Array<{ symbol: string; pnl_dollar: number; pnl_pct: number }> = []

          for (const t of closedTrades as any[]) {
            if (t.side === 'buy') {
              if (!buyQueues[t.symbol]) buyQueues[t.symbol] = []
              buyQueues[t.symbol].push({ qty: Number(t.qty), price: Number(t.price) })
            } else if (t.side === 'sell') {
              const queue = buyQueues[t.symbol]
              if (!queue || queue.length === 0) continue
              let remainingQty = Number(t.qty)
              let totalCost = 0
              let matchedQty = 0
              while (remainingQty > 0 && queue.length > 0) {
                const buy = queue[0]
                const take = Math.min(remainingQty, buy.qty)
                totalCost += take * buy.price
                matchedQty += take
                remainingQty -= take
                buy.qty -= take
                if (buy.qty <= 0) queue.shift()
              }
              if (matchedQty > 0) {
                const revenue = matchedQty * Number(t.price)
                const pnl_dollar = revenue - totalCost
                const pnl_pct = totalCost > 0 ? (pnl_dollar / totalCost) * 100 : 0
                sellPnl.push({ symbol: t.symbol, pnl_dollar, pnl_pct })
              }
            }
          }

          const tradeCount  = weekTrades.length
          const wins        = sellPnl.filter(p => p.pnl_dollar > 0)
          const losses      = sellPnl.filter(p => p.pnl_dollar <= 0)
          const winRate     = sellPnl.length > 0 ? Math.round((wins.length / sellPnl.length) * 100) : null
          const totalPnl    = sellPnl.reduce((sum, p) => sum + p.pnl_dollar, 0)
          const avgPnlPct   = sellPnl.length > 0
            ? sellPnl.reduce((sum, p) => sum + p.pnl_pct, 0) / sellPnl.length
            : null

          // Best trade by pnl_pct
          const bestTrade = sellPnl.length > 0
            ? sellPnl.reduce((best, p) => p.pnl_pct > best.pnl_pct ? p : best, sellPnl[0])
            : null

          // Subject line
          const avgPnlStr = avgPnlPct !== null
            ? `${avgPnlPct >= 0 ? '+' : ''}${avgPnlPct.toFixed(1)}%`
            : 'active'
          const subject = `\u26a1 Enki week: ${tradeCount} trade${tradeCount !== 1 ? 's' : ''}, ${avgPnlStr} avg`

          // Fetch user email
          const { data: userData } = await admin.auth.admin.getUserById(profile.user_id)
          const email = userData?.user?.email
          if (!email || !process.env.RESEND_API_KEY) return

          // Stats rows HTML
          const statsRows = [
            ['Trades This Week', String(tradeCount)],
            ['Win Rate', winRate !== null ? `${winRate}% (${wins.length}W / ${losses.length}L)` : 'N/A'],
            ['Total P&L', sellPnl.length > 0 ? `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toFixed(2)}` : 'N/A'],
            ['Open Positions', String(openPositions)],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:10px 14px;color:#999;font-size:12px;border-bottom:1px solid #1f1f1f;">${label}</td>
              <td style="padding:10px 14px;color:#f5f5f5;font-size:13px;font-weight:700;text-align:right;border-bottom:1px solid #1f1f1f;">${value}</td>
            </tr>`).join('')

          const bestTradeHtml = bestTrade ? `
            <div style="background:#1a1200;border:1px solid #3d2f00;border-radius:10px;padding:14px 18px;margin:20px 0;">
              <p style="color:#f59e0b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Best Trade This Week</p>
              <p style="color:#fff;font-size:18px;font-weight:900;margin:0;">${bestTrade.symbol}
                <span style="color:${bestTrade.pnl_pct >= 0 ? '#4ade80' : '#f87171'};font-size:16px;margin-left:10px;">
                  ${bestTrade.pnl_pct >= 0 ? '+' : ''}${bestTrade.pnl_pct.toFixed(2)}%
                </span>
              </p>
            </div>` : ''

          await getResend().emails.send({
            from: 'Enki <enki@socialmate.studio>',
            to: email,
            subject,
            html: `<div style="background:#0a0a0a;font-family:sans-serif;padding:32px;max-width:520px;margin:0 auto;border-radius:16px;">
              <div style="margin-bottom:24px;">
                <p style="color:#f59e0b;font-size:16px;font-weight:900;margin:0 0 2px;">\u26a1 Enki</p>
                <p style="color:#555;font-size:11px;margin:0;">Treasury Guardian \u00b7 Weekly Briefing</p>
              </div>
              <p style="color:#e5e5e5;font-size:22px;font-weight:900;margin:0 0 6px;">
                ${tradeCount} trade${tradeCount !== 1 ? 's' : ''} executed
              </p>
              <p style="color:#666;font-size:13px;margin:0 0 24px;">
                Past 7 days \u00b7 ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <table style="width:100%;border-collapse:collapse;background:#111;border-radius:10px;overflow:hidden;border:1px solid #1f1f1f;">
                ${statsRows}
              </table>
              ${bestTradeHtml}
              <a href="https://socialmate.studio/enki/trades" style="display:inline-block;background:#f59e0b;color:#000;font-weight:900;font-size:13px;padding:13px 28px;border-radius:10px;text-decoration:none;margin-top:8px;">
                View Full Trade History \u2192
              </a>
              <p style="color:#333;font-size:11px;margin-top:28px;line-height:1.6;">
                SocialMate by Gilgamesh Enterprise LLC \u00b7 Paper trading results are simulated and not financial advice.
              </p>
            </div>`,
          })

          sent++
        })
      } catch (err: any) {
        console.error(`[EnkiWeeklySummary] user ${profile.user_id} failed:`, err?.message)
      }
    }

    console.log(`[EnkiWeeklySummary] sent: ${sent}`)
    return { sent }
  }
)

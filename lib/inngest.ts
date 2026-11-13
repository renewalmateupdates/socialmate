import { Inngest } from 'inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SOMA_MONTHLY_CREDITS } from '@/lib/soma-costs'
import { buildIrisEmailHtml } from '@/lib/iris-email'
import { lifecycleEmail, getActivationState } from '@/lib/lifecycle-emails'
import {
  getRecentMembers,
  sendChannelMessage,
  assignRole,
} from '@/lib/discord-bot'
import { runCapReached, runCapForMode } from '@/lib/soma-runs'
import { effectiveSomaMode } from '@/lib/soma-mode'
import {
  GENERATE_COST as SOMA_GENERATE_COST, INGEST_COST as SOMA_INGEST_COST,
  collectSavedDoc, countOpenSlots, latestInsights, runSomaGeneration,
  type InsightsSource, type QueuedPost, type SavedDocResult, type SomaRunResult,
} from '@/lib/soma-generate'
import { normalizePlan } from '@/lib/plan'
import { REPLY_TO, sendMail } from '@/lib/mail'
import { recordFunnel } from '@/lib/usage'
import { handleFirstPostCredits, updateStreak } from '@/lib/post-activation'
import { repairSentPost, sentPlatformIds } from '@/lib/publish/repair-sent'
import { syncTiktokPublishToPosts } from '@/lib/tiktok-post-sync'
import { getValidAccessToken } from '@/lib/tiktok-auth'
import { createNotification } from '@/lib/notify'
import { sendScheduledTiktok, draftsNotice, stagedFilesToClean, isStagedVideoUrl, type TiktokSendOutcome, type StagedTiktokRow } from '@/lib/tiktok-scheduled'
import { listAllAuthUsers, oldestFirst, selectAll } from '@/lib/admin-metrics'

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

// ── Recurring posts helper ──────────────────────────────────────────────────
// Computes the next scheduled_at date given a recurrence rule.
function computeNextOccurrence(date: Date, rule: string): Date {
  const next = new Date(date)
  switch (rule) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      // Advance by one month; if the day overflows (e.g. Jan 31 → Mar 3)
      // pull back to the last day of the target month.
      const targetMonth = next.getMonth() + 1
      next.setMonth(targetMonth)
      if (next.getMonth() !== targetMonth % 12) {
        next.setDate(0) // last day of the intended month
      }
      break
    default:
      next.setDate(next.getDate() + 7)
  }
  return next
}

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
        .select('user_id, workspace_id, status, published_at, platform_post_ids, platforms, content, media_urls, destinations, scheduled_at, is_recurring, recurrence_rule, recurrence_end_date, recurrence_parent_id, metadata')
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

      if (innerPostCheck && sentPlatformIds(innerPostCheck)) {
        // Post was published in a previous attempt but the status write failed.
        // Repair the status now so the post doesn't stay stuck as 'scheduled'.
        // This used to discard the update's error and log "repaired" either
        // way, so a write that could never succeed looked like a fixed post.
        const repair = await repairSentPost({ id: postId, ...innerPostCheck }, 'inngest')
        if (!repair.ok) {
          // Throw so the run shows as failed. The post has been sent and the
          // guard above stops any retry from sending it again.
          throw new Error(`Post ${postId} was sent but its status could not be repaired: ${repair.error}`)
        }
        return { skipped: true, reason: 'platform_post_ids already set', repaired: repair.status }
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
            headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.CRON_SECRET || '' },
            body:    JSON.stringify({ postId }),
          }).catch(err => console.error('[Inngest] Failed to mark post as failed:', err))
          console.error(`[Inngest] Publish failed for post ${postId}: ${errMsg}`)
          // Fire-and-forget failure notification
          if (innerPostCheck?.user_id) {
            getSupabaseAdmin()
              .from('notifications')
              .insert({
                user_id: innerPostCheck.user_id,
                type:    'post_failed',
                title:   'A scheduled post failed',
                message: `A scheduled post failed to publish. Check your connected accounts.`,
                data:    { href: '/queue' },
              })
              .then(({ error }) => { if (error) console.warn('[notifications] insert failed:', error.message) })
          }
        } else {
          // Post was published but DB update failed — retry without calling fail route.
          console.warn(`[Inngest] Post ${postId} published OK but DB update failed — retrying (${errMsg})`)
        }

        throw new Error(`Publish failed: ${errMsg}`)
      }

      // A transient platform failure comes back as status 'retrying': the publish
      // route left the post 'scheduled', pushed scheduled_at forward and emitted
      // a fresh post/scheduled event. This run is done; the requeued one takes
      // over. Nothing below should treat it as a publish.
      if (data.status === 'retrying') {
        console.log(
          `[Inngest] Post ${postId} deferred after a transient failure ` +
          `(attempt ${data.attempt}) — requeued for ${data.retryAt}`
        )
        return { requeued: true, attempt: data.attempt, retryAt: data.retryAt }
      }

      console.log(`[Inngest] Successfully published post ${postId}:`, {
        status:    data.status,
        platforms: data.results?.map((r: any) => `${r.platform}:${r.success ? 'ok' : 'fail'}`),
      })

      // ── Recurring post: schedule next occurrence ──────────────────────────
      // Only reschedule if the post was actually published (not partial/failed),
      // and has a valid recurrence rule and scheduled_at to compute from.
      if (
        innerPostCheck?.is_recurring &&
        innerPostCheck?.recurrence_rule &&
        innerPostCheck?.scheduled_at &&
        (data.status === 'published' || data.status === 'partial')
      ) {
        try {
          // A retried post has had scheduled_at pushed forward by the backoff.
          // Stepping the recurrence from that would drift the whole series, so
          // use the slot it was originally scheduled for when one was recorded.
          const seriesAnchor =
            (innerPostCheck.metadata as Record<string, unknown> | null)?.original_scheduled_at
            ?? innerPostCheck.scheduled_at
          const nextAt = computeNextOccurrence(
            new Date(seriesAnchor as string),
            innerPostCheck.recurrence_rule,
          )
          const endDate = innerPostCheck.recurrence_end_date
            ? new Date(innerPostCheck.recurrence_end_date)
            : null

          if (!endDate || nextAt <= endDate) {
            const nextAtIso = nextAt.toISOString()
            const { data: clonedPost, error: cloneErr } = await getSupabaseAdmin()
              .from('posts')
              .insert({
                user_id:              innerPostCheck.user_id,
                workspace_id:         innerPostCheck.workspace_id,
                content:              innerPostCheck.content,
                platforms:            innerPostCheck.platforms,
                destinations:         innerPostCheck.destinations ?? {},
                media_urls:           innerPostCheck.media_urls ?? null,
                status:               'scheduled',
                scheduled_at:         nextAtIso,
                is_recurring:         true,
                recurrence_rule:      innerPostCheck.recurrence_rule,
                recurrence_end_date:  innerPostCheck.recurrence_end_date ?? null,
                recurrence_parent_id: innerPostCheck.recurrence_parent_id ?? postId,
              })
              .select('id')
              .single()

            if (cloneErr) {
              console.error(`[RECURRING] Failed to clone post ${postId}:`, cloneErr.message)
            } else if (clonedPost) {
              console.log(`[RECURRING] Cloned post ${postId} → ${clonedPost.id} at ${nextAtIso}`)
              // Trigger Inngest to sleep-and-publish the cloned post
              await inngest.send({
                name: 'post/scheduled',
                data: { postId: clonedPost.id, scheduledAt: nextAtIso },
              }).catch(err => console.error('[RECURRING] Failed to send post/scheduled for clone:', err))
            }
          } else {
            console.log(`[RECURRING] Post ${postId} recurrence ended — next occurrence ${nextAt.toISOString()} is past end date ${endDate.toISOString()}`)
          }
        } catch (recurErr) {
          console.error('[RECURRING] Error scheduling next occurrence:', recurErr)
          // Non-fatal: the published post is already done, don't fail the step
        }
      }

      // Fire-and-forget success notification
      if (innerPostCheck?.user_id) {
        const platformList = (innerPostCheck.platforms || []).join(', ')
        getSupabaseAdmin()
          .from('notifications')
          .insert({
            user_id: innerPostCheck.user_id,
            type:    'post_published',
            title:   'Post published',
            message: platformList
              ? `Post published successfully to ${platformList}.`
              : 'Post published successfully.',
            data:    { href: '/queue' },
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
      const users = await listAllAuthUsers(getSupabaseAdmin())
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
              replyTo: REPLY_TO,
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
    const { postId, userId, platformPostIds } = event.data as {
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
          // userId was typed on event.data but never destructured above, so this
          // query had no user_id filter at all -- it read connected_accounts for
          // ANY user on platform='mastodon' globally, not the post owner's. With
          // 0-1 real Mastodon-connected users total that returned the only row
          // that could match; the moment a second user connects Mastodon this
          // either starts fetching engagement with the wrong account's token or
          // throws on "multiple rows" for every post published, by anyone.
          const { data: account } = await getSupabaseAdmin()
            .from('connected_accounts')
            .select('platform_user_id, access_token')
            .eq('user_id', userId)
            .eq('platform', 'mastodon')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
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
        .eq('evergreen', true)

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
          .eq('evergreen', true)
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
            evergreen: false,
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

// ─── Discord Welcome Message Poller — hourly ──────────────────────────────────
// Polls each enabled discord_welcome_configs row for new members and sends
// welcome messages + assigns auto-roles.
//
// Hourly, down from every 15 minutes. No server has welcome messages set up
// (0 rows in discord_welcome_configs, Oct 22), so 96 runs a day found nothing,
// and each run and step counts against the Inngest Hobby plan's 50,000 monthly
// executions. If servers start using it, a faster schedule is a one-line change.
export const discordWelcomePoller = inngest.createFunction(
  { id: 'discord-welcome-poller', name: 'Discord Welcome Message Poller', retries: 2 },
  { cron: '0 * * * *' },
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
          // title has its own column and is NOT NULL. It used to be folded into
          // message "for display compat", alongside an action_url column that
          // does not exist — so this insert threw on every single call and the
          // step retried until it gave up.
          user_id,
          type,
          title: title || 'Notification',
          message: body,
          ...(link ? { data: { href: link } } : {}),
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
        replyTo: REPLY_TO,
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
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;">Schedule posts to <strong style="color:#ffffff;">7 live platforms</strong> — Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, LinkedIn</span>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                <span style="color:#7C3AED;font-weight:700;font-size:15px;flex-shrink:0;">✓</span>
                <span style="font-size:14px;color:#d4d4d8;line-height:1.5;"><strong style="color:#ffffff;">15+ AI content tools</strong> — captions, hooks, threads, hashtags and more (50 free credits/month)</span>
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
              <strong style="color:#a1a1aa;">P.S.</strong> I built SocialMate solo, nights and weekends. If you ever have feedback, a feature request, or just want to say hi — reply to this email. I read every message.
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
      // Check if user has published or scheduled anything yet.
      //
      // This selected 'user_id' until Aug 2026. profiles is keyed on 'id' (it
      // mirrors auth.users.id) and has no user_id column, so the query returned
      // a 400, `profile` came back null, and the guard below swallowed it — the
      // day 1 nudge never sent to anyone, silently, for as long as it existed.
      // Same failure mode as the calendar bug: an explicit column list against a
      // column that isn't there errors rather than returning empty.
      const { data: profile, error: profileErr } = await db
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (profileErr) {
        console.warn('[onboarding] day1 profile lookup failed:', profileErr.message)
        return
      }
      if (!profile?.id) return

      const { count } = await db
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .in('status', ['scheduled', 'published'])

      if ((count ?? 0) > 0) return // already activated — skip nudge

      // Send in-app notification.
      //
      // Was inserting `body` and `href`; the table has neither (it is
      // user_id/type/title/message/data/is_read, per app/api/notifications).
      // Postgres rejects the whole row on an unknown column, so this insert
      // failed every time it ran. Widespread — see the notifications sweep.
      const { error: notifErr } = await db.from('notifications').insert({
        user_id: profile.id,
        type:    'activation',
        title:   'Your first post is waiting',
        message: "You set up your account. Now let's get something scheduled, it takes less than a minute.",
        data:    { href: '/compose' },
      })
      if (notifErr) console.warn('[onboarding] day1 notification insert failed:', notifErr.message)

      // Send email nudge
      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        replyTo: REPLY_TO,
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
    // Branches on real state. Pitching the AI toolkit to someone who has not
    // connected a single account is selling the second step to a person still
    // stuck on the first, and it reads like we are not paying attention.
    await step.run('send-day3-email', async () => {
      const state = await getActivationState(email)
      if (state.userId && !state.hasConnected) {
        await getResend().emails.send({
          from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
          replyTo: REPLY_TO,
          to: email,
          subject: 'One connection away',
          html: lifecycleEmail({
            headline: `${name}, everything is set up except the one part that matters.`,
            paragraphs: [
              'Your account is ready, but there is no platform connected to it yet, so there is nowhere for a post to go. That is the whole blocker, and it takes about thirty seconds to clear.',
              'Bluesky, Mastodon, Discord and Telegram connect instantly and are free forever. No approval queue, no review process, no card.',
            ],
            panel: {
              label: 'Connect one, then the rest gets easy',
              lines: [
                'Bluesky or Mastodon if you want the fastest path',
                'Discord or Telegram to post straight into your community',
                'X, TikTok and LinkedIn are there when you want them',
              ],
            },
            ctaLabel: 'Connect a platform',
            ctaHref: `${appUrl}/accounts`,
          }),
        })
        return
      }

      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        replyTo: REPLY_TO,
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
                Each tool costs <strong style="color:#ffffff;">1–5 credits</strong>. Free plan gives you <strong style="color:#ffffff;">50 credits/month</strong> — enough to create a solid week of content. On Pro ($8/mo) you get <strong style="color:#ffffff;">500 credits</strong>. Most users build 3–4 months of posts in one sitting.
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
    // Last touch of the signup drip. If they still have not connected anything,
    // a soft upgrade nudge is the wrong ask — nothing has been delivered yet to
    // upgrade from. Ask what got in the way instead.
    await step.run('send-day7-email', async () => {
      const state = await getActivationState(email)
      if (state.userId && !state.hasConnected) {
        await getResend().emails.send({
          from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
          replyTo: REPLY_TO,
          to: email,
          subject: 'Did something get in the way?',
          html: lifecycleEmail({
            headline: 'A week in, and I want to know what stopped you.',
            paragraphs: [
              `You signed up a week ago, ${name}, and nothing is connected yet. I am not going to pretend that is a coincidence, and I would rather ask than guess.`,
              'If the connect flow broke, if the platform you actually wanted is not live yet, or if this simply was not what you expected, reply and tell me. I read every reply myself and it goes straight into what I build next.',
              'If you would rather just get going, the button below is the whole remaining setup.',
            ],
            ctaLabel: 'Connect a platform',
            ctaHref: `${appUrl}/accounts`,
            footnote: 'This is the last email in your setup series.',
          }),
        })
        return
      }

      await getResend().emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        replyTo: REPLY_TO,
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
              <p style="font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Pro Plan — $8/month</p>

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

            <!-- IRIS Newsletter mention -->
            <div style="background:#111111;border:1px solid #222222;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
              <p style="font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">📨 IRIS Dispatch — our weekly newsletter</p>
              <p style="font-size:13px;color:#a1a1aa;line-height:1.6;margin:0 0 10px;">
                Every week I send out the IRIS Dispatch — creator tips, product updates, and what we're shipping next. You're opted in by default. Manage it anytime in settings.
              </p>
              <a href="${appUrl}/settings" style="font-size:13px;color:#7C3AED;font-weight:600;text-decoration:none;">Newsletter preferences →</a>
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
                user_id: comp.user_id,
                type:    'competitor_post',
                title:   `${displayHandle} just posted`,
                message: `${displayHandle} just posted on ${platformLabel}. Check their latest content.`,
                data:    { href: url },
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
        .select('id, plan, owner_id')

      if (error) {
        console.error('[ResetSomaCredits] Failed to fetch workspaces:', error.message)
        return { reset: 0, error: error.message }
      }

      if (!workspaces?.length) return { reset: 0 }

      // The plan, resolved the way lib/plan.ts resolveWorkspacePlan does it: the
      // workspace's own plan, else its owner's user_settings.plan. Batched, since
      // this runs over every workspace. The allowance itself is
      // SOMA_MONTHLY_CREDITS; this used to grant 1,000 / 5,000 while the credits
      // API granted 500 / 2,000.
      const ownerIds = Array.from(new Set(workspaces.filter(w => !w.plan && w.owner_id).map(w => w.owner_id as string)))
      const ownerPlan = new Map<string, string | null>()
      for (let i = 0; i < ownerIds.length; i += 100) {
        const { data: settings, error: sErr } = await admin
          .from('user_settings')
          .select('user_id, plan')
          .in('user_id', ownerIds.slice(i, i + 100))
        if (sErr) console.warn('[ResetSomaCredits] user_settings lookup failed:', sErr.message)
        for (const row of settings ?? []) ownerPlan.set(row.user_id as string, row.plan as string | null)
      }
      function planToSomaCredits(w: { plan: string | null; owner_id: string | null }): number {
        const raw = w.plan || (w.owner_id ? ownerPlan.get(w.owner_id) : null) || null
        return SOMA_MONTHLY_CREDITS[normalizePlan(raw)]
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
          const credits = planToSomaCredits(w)
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

      // Belt and braces. The run cap no longer depends on this firing —
      // lib/soma-runs.ts derives the period from last_generated_at — but
      // zeroing the column keeps the number shown in the UI honest on the 1st
      // for projects that have not generated yet this month.
      const { error: runsErr } = await admin
        .from('soma_projects')
        .update({ runs_this_month: 0 })
        .gt('runs_this_month', 0)
      if (runsErr) console.error('[ResetSomaCredits] runs_this_month reset failed:', runsErr.message)

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

// ─── SOMA scheduled runs ──────────────────────────────────────────────────────
// Both jobs go through lib/soma-generate.ts, the same path as the Generate
// button, and it fills only the open slots. That is what lets the Monday run
// and Full Send's daily run coexist: the Monday run fills the mode's window,
// and the daily run tops up today and tomorrow, which after a Monday fill is
// usually nothing, so it costs nothing. They used to plan independently and a
// Full Send platform could get 14 posts in a day against its cap of 7.
//
// A run that finds no open slot makes no model call, charges nothing and
// counts no run, which also makes a retried step harmless.

const SOMA_PROJECT_SELECT = '*, workspaces!inner(id, owner_id, soma_credits_monthly, soma_credits_used, soma_credits_purchased, soma_autopilot_enabled, soma_full_send_enabled)'

function somaCreditsLeft(ws: any): number {
  return Math.max(0, (ws?.soma_credits_monthly ?? 0) - (ws?.soma_credits_used ?? 0)) + (ws?.soma_credits_purchased ?? 0)
}

async function queueSomaPosts(posts: QueuedPost[]) {
  if (posts.length) await inngest.send(posts.map(p => ({ name: 'post/scheduled', data: p })))
}

function somaApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!key) throw new Error('Missing Gemini API key (GEMINI_API_KEY)')
  return key
}

/** A scheduled run's fill steps stop after this many, whatever is still open. */
const SOMA_MAX_FILL_STEPS = 6

/**
 * One project's scheduled run, as Inngest steps:
 *   1. Monday only: pull the saved doc link and keep a new version if it
 *      changed (free, no model call).
 *   2. Count open slots. None open ends the run here: no doc read, no charge.
 *   3. Insights: the latest ingestion, or a paid read of a newer doc.
 *   4. Fill open slots, one step per batch so each fits the function's time
 *      limit. Only the first fill step charges and counts as a run.
 */
async function runScheduledSoma(step: any, project: any, trigger: 'weekly' | 'daily', apiKey: string, label: string) {
  const total = {
    postsCreated: 0, unfilled: 0, openSlots: 0, windowDays: 0,
    mode: 'safe' as SomaRunResult['mode'],
    platformCounts: {} as Record<string, number>,
    doc: { status: 'none' } as SavedDocResult,
    insightsSource: 'none' as InsightsSource,
  }

  if (trigger === 'weekly') {
    total.doc = await step.run(`${label}-collect-${project.id}`, () => collectSavedDoc(getSupabaseAdmin(), project))
  }

  const open: number = await step.run(`${label}-plan-${project.id}`, () =>
    countOpenSlots(getSupabaseAdmin(), project, project.workspaces, trigger))
  if (open === 0) return total

  const { insights, ingestionId, source } = await step.run(`${label}-insights-${project.id}`, () =>
    latestInsights(getSupabaseAdmin(), project, apiKey))
  total.insightsSource = source

  for (let batch = 0; batch < SOMA_MAX_FILL_STEPS; batch++) {
    let r: SomaRunResult
    try {
      r = await step.run(`${label}-fill-${project.id}-${batch}`, () => runSomaGeneration({
        admin:        getSupabaseAdmin(),
        project,
        workspace:    project.workspaces,
        trigger,
        insights,
        ingestionId,
        actorUserId:  project.user_id,
        apiKey,
        enqueue:      queueSomaPosts,
        continuation: batch > 0,
      }))
    } catch (err: any) {
      // The first step failing fails the run. A later one failing leaves what
      // the earlier steps wrote (and charged for) in place; the rest stays open.
      if (batch === 0) throw err
      console.warn(`[SOMA ${trigger}] project ${project.id} stopped after ${batch} fill steps:`, err?.message)
      break
    }
    if (batch === 0) Object.assign(total, { openSlots: r.openSlots, windowDays: r.windowDays, mode: r.mode })
    total.postsCreated += r.postsCreated
    total.unfilled = r.unfilled
    for (const [p, n] of Object.entries(r.platformCounts)) total.platformCounts[p] = (total.platformCounts[p] ?? 0) + n
    if (r.openSlots === 0 || r.unfilled === 0) break
  }
  return total
}

/** One sentence on what happened to the project's doc this run, or '' when nothing worth saying. */
function somaDocNote(doc: SavedDocResult, source: InsightsSource): string {
  if (doc.status === 'failed') return `SOMA couldn't read your saved doc link: ${doc.error} It wrote from your last doc instead.`
  if (source === 'read') return `SOMA read the new version of your doc (${SOMA_INGEST_COST} SOMA credits).`
  if (source === 'skipped_no_credits') return `Your doc has a new version, but there weren't enough SOMA credits to read it and generate, so SOMA wrote from your last doc.`
  if (source === 'read_failed') return `SOMA couldn't read the new version of your doc this week, so it wrote from your last doc.`
  return ''
}

async function notifySomaWeeklyRun(
  project: any,
  result: Pick<SomaRunResult, 'mode' | 'postsCreated' | 'unfilled' | 'windowDays' | 'platformCounts'> & { doc: SavedDocResult; insightsSource: InsightsSource },
) {
  const ownerId = project.workspaces?.owner_id ?? project.user_id
  const platforms = Object.keys(result.platformCounts).join(', ')
  const verb = result.mode === 'safe' ? 'drafted' : 'scheduled'
  const docNote = somaDocNote(result.doc, result.insightsSource)
  try {
    await inngest.send({ name: 'notification/send', data: {
      user_id: ownerId, type: 'soma_autopilot',
      title: `"${project.name}" week is ready`,
      body: `SOMA ${verb} ${result.postsCreated} posts. Review them in your queue.${docNote ? ` ${docNote}` : ''}`,
      link: `/soma/projects/${project.id}`,
    } })
    await sendPushNotification(ownerId, `"${project.name}" week is ready`, `SOMA ${verb} ${result.postsCreated} posts.`, `/soma/projects/${project.id}`, 'soma_autopilot')
  } catch (err: any) {
    console.error('[SomaAutopilot] notification failed:', err?.message)
  }
  try {
    const { data: owner } = await getSupabaseAdmin().auth.admin.getUserById(ownerId)
    const email = owner?.user?.email
    if (!email || !process.env.RESEND_API_KEY) return
    const modeLabel = result.mode === 'full_send' ? 'Full Send' : 'Autopilot'
    await sendMail({
      from:    'SOMA <soma@socialmate.studio>',
      to:      email,
      subject: `SOMA ${verb} ${result.postsCreated} posts for "${project.name}"`,
      html: `<div style="background:#0f0f0f;font-family:sans-serif;padding:32px;max-width:520px;margin:0 auto;border-radius:16px;">
        <p style="color:#f59e0b;font-size:18px;font-weight:900;margin:0 0 4px;">SOMA</p>
        <p style="color:#e5e5e5;font-size:16px;font-weight:700;margin:0 0 16px;">${modeLabel} ran: ${result.postsCreated} posts ${verb}</p>
        <p style="color:#888;font-size:13px;margin:0 0 20px;">Project: <strong style="color:#e5e5e5;">${project.name}</strong> · ${platforms} · the next ${result.windowDays} days</p>
        ${docNote ? `<p style="color:#bbb;font-size:13px;margin:0 0 16px;">${docNote.replace(/</g, '&lt;')}</p>` : ''}
        ${result.unfilled > 0 ? `<p style="color:#888;font-size:12px;margin:0 0 16px;">${result.unfilled} open slots were not filled this run; the next run fills them.</p>` : ''}
        <a href="https://socialmate.studio/soma/projects/${project.id}" style="display:inline-block;background:#f59e0b;color:#000;font-weight:900;font-size:13px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px;">View schedule</a>
        <p style="color:#444;font-size:11px;margin-top:24px;">SocialMate by Gilgamesh Enterprise LLC · You're receiving this because SOMA ${modeLabel} is active.</p>
      </div>`,
    })
  } catch (err: any) {
    console.error('[SomaAutopilot] email failed:', err?.message)
  }
}

export const somaAutopilotRun = inngest.createFunction(
  { id: 'soma-autopilot-run', name: 'SOMA Autopilot Run', retries: 1 },
  { cron: '0 12 * * 1' }, // Every Monday at noon UTC (~8 AM ET)
  async ({ step }) => {
    const eligibleProjects = await step.run('find-autopilot-projects', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('soma_projects')
        .select(SOMA_PROJECT_SELECT)
        .in('mode', ['autopilot', 'full_send'])
      if (error) throw new Error(`[SomaAutopilot] project query failed: ${error.message}`)
      return (data ?? []).filter((p: any) => {
        // The mode the workspace pays for: a Full Send project in an
        // Autopilot-only workspace runs on Autopilot's limits.
        const mode = effectiveSomaMode(p.mode, p.workspaces)
        if (mode === 'safe' || p.paused) return false
        if (runCapReached(p, runCapForMode(mode))) return false
        return somaCreditsLeft(p.workspaces) >= SOMA_GENERATE_COST
      })
    })
    if (!eligibleProjects.length) return { processed: 0 }

    const apiKey = somaApiKey()
    let processed = 0
    let nothingOpen = 0
    let failed = 0
    for (const project of eligibleProjects) {
      try {
        const result = await runScheduledSoma(step, project, 'weekly', apiKey, 'autopilot')
        if (result.postsCreated > 0) {
          processed++
          await step.run(`autopilot-notify-${project.id}`, () => notifySomaWeeklyRun(project, result))
        } else {
          nothingOpen++
          // A broken link is worth knowing about even in a week with nothing to fill.
          if (result.doc.status === 'failed') {
            await step.run(`autopilot-link-failed-${project.id}`, () => inngest.send({ name: 'notification/send', data: {
              user_id: project.workspaces?.owner_id ?? project.user_id, type: 'soma_autopilot',
              title: `SOMA couldn't read the doc link for "${project.name}"`,
              body: somaDocNote(result.doc, result.insightsSource),
              link: `/soma/projects/${project.id}`,
            } }))
          }
        }
      } catch (err: any) {
        console.error(`[SomaAutopilot] project ${project.id} failed:`, err?.message)
        failed++
      }
    }
    console.log(`[SomaAutopilot] filled: ${processed}, nothing open: ${nothingOpen}, failed: ${failed}`)
    return { processed, nothingOpen, failed }
  }
)

// ─── SOMA Full Send Daily Run ─────────────────────────────────────────────────
// Every day at 1pm UTC (9am EDT), Full Send projects only: tops up today and
// tomorrow to each platform's posts per day (7 at most). Daily runs do not use
// the mode's monthly runs ("12 runs a month, plus a daily run"); each one that
// writes posts costs a generation's credits, and one that finds nothing open
// costs nothing.
export const somaFullSendDailyRun = inngest.createFunction(
  { id: 'soma-full-send-daily-run', name: 'SOMA Full Send Daily Run', retries: 1 },
  { cron: '0 13 * * *' }, // Every day at 1pm UTC (9am EDT)
  async ({ step }) => {
    const eligibleProjects = await step.run('find-full-send-projects', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('soma_projects')
        .select(SOMA_PROJECT_SELECT)
        .eq('mode', 'full_send')
      if (error) throw new Error(`[SomaFullSend] project query failed: ${error.message}`)
      return (data ?? []).filter((p: any) =>
        effectiveSomaMode(p.mode, p.workspaces) === 'full_send'
        && !p.paused
        && somaCreditsLeft(p.workspaces) >= SOMA_GENERATE_COST)
    })
    if (!eligibleProjects.length) return { processed: 0 }

    const apiKey = somaApiKey()
    let processed = 0
    let nothingOpen = 0
    let failed = 0
    for (const project of eligibleProjects) {
      try {
        const result = await runScheduledSoma(step, project, 'daily', apiKey, 'full-send')
        if (result.postsCreated > 0) processed++
        else nothingOpen++
      } catch (err: any) {
        console.error(`[SomaFullSend] project ${project.id} failed:`, err?.message)
        failed++
      }
    }
    console.log(`[SomaFullSend] filled: ${processed}, nothing open: ${nothingOpen}, failed: ${failed}`)
    return { processed, nothingOpen, failed }
  }
)

// ── Post Performance Alerts ────────────────────────────────────────────────────
// Runs every 6 hours. For each user with recently-synced engagement stats,
// computes whether any post in the last 7 days is "taking off" (≥50 total
// engagements OR ≥2× the user's 30-day average). Sends a push + in-app
// notification once per qualifying post (deduped via notifications table).
export const postPerformanceAlerts = inngest.createFunction(
  { id: 'post-performance-alerts', name: 'Post Performance Alerts', retries: 2 },
  { cron: '0 */6 * * *' },
  async ({ step }) => {
    const admin = getSupabaseAdmin()

    // ── 1. Fetch recent posts with engagement data ─────────────────────────
    const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const recentPosts = await step.run('fetch-recent-posts-with-stats', async () => {
      const { data, error } = await admin
        .from('posts')
        .select('id, user_id, content, bluesky_stats, mastodon_stats')
        .eq('status', 'published')
        .gte('published_at', sevenDaysAgo)
        .or('bluesky_stats.not.is.null,mastodon_stats.not.is.null')

      if (error) {
        console.error('[PostPerformanceAlerts] fetch recent posts error:', error.message)
        return []
      }
      return data ?? []
    })

    if (!recentPosts.length) {
      console.log('[PostPerformanceAlerts] No recent posts with stats')
      return { alerted: 0 }
    }

    // ── 2. Collect unique user IDs from the recent set ────────────────────
    const userIdSet = new Set<string>()
    for (const p of recentPosts) userIdSet.add(p.user_id)
    const userIds = Array.from(userIdSet)

    // ── 3. Fetch 30-day baseline stats for average computation ─────────────
    const baselinePosts = await step.run('fetch-baseline-posts', async () => {
      const { data, error } = await admin
        .from('posts')
        .select('user_id, bluesky_stats, mastodon_stats')
        .eq('status', 'published')
        .gte('published_at', thirtyDaysAgo)
        .in('user_id', userIds)
        .or('bluesky_stats.not.is.null,mastodon_stats.not.is.null')

      if (error) {
        console.error('[PostPerformanceAlerts] fetch baseline error:', error.message)
        return []
      }
      return data ?? []
    })

    // Step 4 used to live here: a second dedup query selecting `action_url`, a
    // column that does not exist. It returned a 400, so `data` was null and the
    // result was always []. Its own comment conceded the post id is stored in
    // `message` instead — which is what step 6 below actually reads. Nothing
    // referenced it. Removed rather than repaired, since the working dedup is
    // twenty lines further down.
    const recentPostIds = recentPosts.map((p: any) => p.id as string)

    // ── 5. Fetch notification_prefs for all affected users ────────────────
    const userPrefs = await step.run('fetch-user-prefs', async () => {
      const { data } = await admin
        .from('user_settings')
        .select('user_id, notification_prefs')
        .in('user_id', userIds)

      const map: Record<string, any> = {}
      for (const row of data ?? []) map[row.user_id] = row.notification_prefs ?? {}
      return map
    })

    // ── 6. Fetch already-sent dedup set (use message field containing post id) ──
    const alertedPostIds = await step.run('fetch-alerted-post-ids', async () => {
      const { data } = await admin
        .from('notifications')
        .select('message')
        .in('user_id', userIds)
        .eq('type', 'post_performance')

      // We encode post id as last token: "... [postId]"
      const ids: string[] = []
      for (const n of data ?? []) {
        const match = (n.message as string).match(/\[([a-f0-9-]{36})\]$/)
        if (match) ids.push(match[1])
      }
      return ids
    })

    // ── 7. Compute per-user average engagement ────────────────────────────
    function totalEngagement(post: any): number {
      let total = 0
      if (post.bluesky_stats) {
        total += (post.bluesky_stats.likes    ?? 0)
             +   (post.bluesky_stats.reposts  ?? 0)
             +   (post.bluesky_stats.replies  ?? 0)
      }
      if (post.mastodon_stats) {
        total += (post.mastodon_stats.favourites_count ?? 0)
             +   (post.mastodon_stats.reblogs_count    ?? 0)
             +   (post.mastodon_stats.replies_count    ?? 0)
      }
      return total
    }

    const userAvgEngagement = new Map<string, number>()
    const userBaselineGroups = new Map<string, any[]>()
    for (const p of baselinePosts) {
      if (!userBaselineGroups.has(p.user_id)) userBaselineGroups.set(p.user_id, [])
      userBaselineGroups.get(p.user_id)!.push(p)
    }
    for (const [uid, posts] of Array.from(userBaselineGroups.entries())) {
      const engagements = posts.map(totalEngagement)
      const avg = engagements.length > 0
        ? engagements.reduce((a, b) => a + b, 0) / engagements.length
        : 0
      userAvgEngagement.set(uid, avg)
    }

    // ── 8. Evaluate and alert ─────────────────────────────────────────────
    let alerted = 0

    await step.run('evaluate-and-alert', async () => {
      for (const post of recentPosts) {
        try {
          // Check user pref
          const prefs = userPrefs[post.user_id] ?? {}
          if (prefs.performance_alerts === false) continue

          // Skip already alerted posts
          if (alertedPostIds.includes(post.id)) continue

          const engagement = totalEngagement(post)
          if (engagement === 0) continue

          const userAvg = userAvgEngagement.get(post.user_id) ?? 0
          const meetsThreshold = engagement >= 50 || (userAvg > 0 && engagement >= userAvg * 2)
          if (!meetsThreshold) continue

          // Truncate content to 60 chars
          const snippet = (post.content as string ?? '').slice(0, 60)
          const title   = '🔥 Your post is taking off!'
          const body    = `${snippet}${(post.content as string ?? '').length > 60 ? '…' : ''} — ${engagement} engagements`
          // Embed post id in message for future dedup
          const message = `${body} [${post.id}]`

          // In-app notification
          await admin
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type:    'post_performance',
              title,
              message,
              data:    { href: '/analytics' },
            })
            .then(({ error }: { error: any }) => {
              if (error) console.warn('[PostPerformanceAlerts] notifications insert failed:', error.message)
            })

          // Push notification (best-effort)
          await sendPushNotification(post.user_id, title, body, '/analytics', 'post_performance')

          alerted++
          console.log(`[PostPerformanceAlerts] Alerted user ${post.user_id} — post ${post.id} (${engagement} engagements, avg ${userAvg.toFixed(1)})`)
        } catch (err: any) {
          console.error(`[PostPerformanceAlerts] user ${post.user_id} post ${post.id} failed:`, err?.message)
        }
      }
    })

    console.log(`[PostPerformanceAlerts] alerted: ${alerted}`)
    return { alerted }
  }
)

// ── TikTok Scheduled Post Publisher ──────────────────────────────────────────
// Runs every 5 minutes, picks up tiktok_posts due for publishing.
//
// Rebuilt in October 2026. What changed, and why:
//   - A direct post that TikTok refuses only because our content sharing audit
//     is still pending now goes to the creator's TikTok drafts instead of
//     failing. See lib/tiktok-scheduled.ts.
//   - The token comes from getValidAccessToken. This job had its own copy of
//     the refresh with the two bugs that helper was written to fix: a row with
//     no expiry never refreshed, and a failed refresh carried on with the dead
//     token. It also refreshed with the sandbox key whenever one was set.
//   - The row is claimed with a conditional update before anything is sent, so
//     two overlapping runs cannot both send the same video.
//   - Sending never throws. A throw makes Inngest retry the step, and a retry
//     after TikTok accepted the video would send it twice.
//   - The quota is no longer counted a second time here. /api/tiktok/post
//     counts a scheduled video when it is scheduled, and cancelling gives the
//     slot back, so every scheduled video used to cost two of the month's slots.
//   - The creator hears about the outcome. A failed scheduled video used to
//     drop out of the queue with nothing anywhere saying what happened.
//   - Woken by the post's own schedule, not a 5-minute poll. /api/tiktok/post
//     sends tiktok/scheduled with the time, and the run sleeps until then. The
//     poll ran 288 times a day to find, almost always, nothing (one scheduled
//     post in all of October), and every run and step counts against the
//     Inngest Hobby plan's 50,000 monthly executions. The hourly cron stays as
//     a backstop for a post whose event was lost; the claim below means the
//     two can never both send the same video.

export const publishScheduledTiktokPosts = inngest.createFunction(
  { id: 'publish-scheduled-tiktok-posts', concurrency: { limit: 3 } },
  [{ event: 'tiktok/scheduled' }, { cron: '0 * * * *' }],
  async ({ event, step }) => {
    const scheduledAt = (event as any)?.data?.scheduledAt
    if (event.name === 'tiktok/scheduled' && scheduledAt) {
      await step.sleepUntil('wait-until-scheduled', new Date(scheduledAt))
    }

    const due = await step.run('fetch-due-tiktok-posts', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('tiktok_posts')
        .select('id, user_id, workspace_id, video_url, post_caption, sound_id, privacy_level, disable_duet, disable_comment, disable_stitch, brand_content_toggle, brand_organic_toggle')
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())
        .limit(20)
      // Nothing has been sent yet, so letting Inngest retry the read is safe.
      if (error) throw new Error(`[tiktok-scheduled] could not read due posts: ${error.message}`)
      return data ?? []
    })

    const counts = { published: 0, in_drafts: 0, failed: 0, skipped: 0 }

    for (const post of due) {
      // Its own step, so a retry of anything below can never claim or send again.
      const claimed = await step.run(`claim-tiktok-${post.id}`, async () => {
        const { data, error } = await getSupabaseAdmin()
          .from('tiktok_posts')
          .update({ status: 'publishing' })
          .eq('id', post.id)
          .eq('status', 'scheduled')
          .select('id')
        if (error) {
          console.warn(`[tiktok-scheduled] claim failed for ${post.id}:`, error.message)
          return false
        }
        return (data?.length ?? 0) > 0
      })
      if (!claimed) { counts.skipped++; continue }

      const outcome = await step.run(`send-tiktok-${post.id}`, async (): Promise<TiktokSendOutcome & { openId: string | null }> => {
        try {
          const auth = await getValidAccessToken(post.user_id)
          if (!auth.ok) return { kind: 'failed', code: auth.reason, message: auth.message, openId: null }
          const result = await sendScheduledTiktok(post, auth.token)
          return { ...result, openId: auth.openId }
        } catch (err) {
          console.error(`[tiktok-scheduled] send threw for ${post.id}:`, err instanceof Error ? err.message : err)
          return {
            kind: 'failed', code: 'exception', openId: null,
            message: 'Something went wrong on our side while sending this video to TikTok.',
          }
        }
      })

      // Separate from the send: if a write here fails, Inngest retries only
      // this step, and TikTok is not asked a second time.
      await step.run(`record-tiktok-${post.id}`, async () => {
        const db = getSupabaseAdmin()

        if (outcome.kind === 'published') {
          const { error } = await db
            .from('tiktok_posts')
            .update({ status: 'published', tiktok_post_id: outcome.postId, tiktok_account_open_id: outcome.openId, error_message: null })
            .eq('id', post.id)
          if (error) throw new Error(`[tiktok-scheduled] could not record published ${post.id}: ${error.message}`)
          recordFunnel(db, post.user_id, 'tiktok_post_done', { mode: 'scheduled_fire', result: 'published' })
          await syncTiktokPublishToPosts({
            id:           post.id,
            user_id:      post.user_id,
            workspace_id: post.workspace_id ?? null,
            post_caption: post.post_caption ?? null,
          })
          return
        }

        if (outcome.kind === 'in_drafts') {
          const { error } = await db
            .from('tiktok_posts')
            .update({ status: 'in_drafts', tiktok_post_id: outcome.publishId, tiktok_account_open_id: outcome.openId, error_message: null })
            .eq('id', post.id)
          if (error) throw new Error(`[tiktok-scheduled] could not record in_drafts ${post.id}: ${error.message}`)
          recordFunnel(db, post.user_id, 'tiktok_post_done', { mode: 'scheduled_fire', result: 'in_drafts', direct_code: outcome.directCode })
          const notice = draftsNotice(outcome.directCode, post.post_caption)
          await createNotification(db, {
            userId:  post.user_id,
            type:    'post_published',
            title:   notice.title,
            message: notice.message,
            href:    '/tiktok/studio',
            data:    { tiktok_post_id: post.id, direct_code: outcome.directCode },
          })
          return
        }

        const { error } = await db
          .from('tiktok_posts')
          .update({ status: 'failed', error_message: outcome.message })
          .eq('id', post.id)
        if (error) throw new Error(`[tiktok-scheduled] could not record failure ${post.id}: ${error.message}`)
        recordFunnel(db, post.user_id, 'tiktok_post_failed', { mode: 'scheduled_fire', code: outcome.code })

        // The slot was counted when this was scheduled and the video never
        // posted, so give it back, the same as cancelling does.
        const { data: ws, error: wsErr } = await db
          .from('workspaces')
          .select('tiktok_videos_this_month')
          .eq('owner_id', post.user_id)
          .eq('is_personal', true)
          .maybeSingle()
        if (wsErr) {
          console.warn(`[tiktok-scheduled] quota read failed for ${post.user_id}:`, wsErr.message)
        } else if (ws) {
          const { error: refundErr } = await db
            .from('workspaces')
            .update({ tiktok_videos_this_month: Math.max(0, (ws.tiktok_videos_this_month ?? 0) - 1) })
            .eq('owner_id', post.user_id)
            .eq('is_personal', true)
          if (refundErr) console.warn(`[tiktok-scheduled] quota refund failed for ${post.user_id}:`, refundErr.message)
        }

        await createNotification(db, {
          userId:  post.user_id,
          type:    'post_failed',
          title:   'Your scheduled TikTok video was not posted',
          message: outcome.message,
          href:    '/tiktok/studio',
          data:    { tiktok_post_id: post.id, code: outcome.code },
        })
      })

      counts[outcome.kind]++
    }

    return { ...counts, total: due.length }
  }
)

// ── TikTok staged video cleanup ───────────────────────────────────────────────
// Deletes our copy of a scheduled TikTok video once TikTok has it. Nothing did
// before, so every scheduled video stayed in the media bucket for good. Which
// rows qualify, and why, is in stagedFilesToClean (lib/tiktok-scheduled.ts).

export const cleanupStagedTiktokVideos = inngest.createFunction(
  { id: 'cleanup-staged-tiktok-videos', retries: 2 },
  { cron: '30 7 * * *' },
  async ({ step }) => {
    const candidates = await step.run('find-staged-videos', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('tiktok_posts')
        .select('id, status, video_storage_path, video_url, scheduled_at, created_at')
        .not('video_storage_path', 'is', null)
        .in('status', ['published', 'in_drafts', 'failed'])
        .order('created_at', { ascending: true })
        .limit(300)
      if (error) throw new Error(`[tiktok-cleanup] could not read staged videos: ${error.message}`)
      return stagedFilesToClean((data ?? []) as StagedTiktokRow[])
    })
    if (candidates.length === 0) return { removed: 0 }

    return await step.run('remove-staged-videos', async () => {
      const db = getSupabaseAdmin()
      const paths = candidates.map(row => row.video_storage_path as string)

      // Storage skips a path that is already gone without an error, so a clean
      // call means every one of these files is gone now.
      const { error: removeError } = await db.storage.from('media').remove(paths)
      if (removeError) throw new Error(`[tiktok-cleanup] storage remove failed: ${removeError.message}`)

      // Cleared only after the files are gone, so a failed removal is simply
      // picked up again tomorrow. A retry of this step is harmless for the same reason.
      const { error: pathError } = await db
        .from('tiktok_posts')
        .update({ video_storage_path: null })
        .in('id', candidates.map(row => row.id))
      if (pathError) throw new Error(`[tiktok-cleanup] could not clear staged paths: ${pathError.message}`)

      const deadLinks = candidates.filter(row => isStagedVideoUrl(row.video_url)).map(row => row.id)
      if (deadLinks.length > 0) {
        const { error: urlError } = await db.from('tiktok_posts').update({ video_url: null }).in('id', deadLinks)
        if (urlError) console.warn('[tiktok-cleanup] could not clear dead video links:', urlError.message)
      }

      return { removed: paths.length }
    })
  }
)

// ─── Monthly Credits Reset Email ────────────────────────────────────────────
// Fires on the 1st of every month at 10am UTC.
// Reminds users their credits just reset + soft upgrade nudge for free tier.
export const monthlyCreditsResetEmail = inngest.createFunction(
  { id: 'monthly-credits-reset-email', name: 'Monthly Credits Reset Email', retries: 2 },
  { cron: '0 10 1 * *' },
  async ({ step }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

    // Fetch all users + their plan
    const userData = await step.run('fetch-users', async () => {
      const supabase = getSupabaseAdmin()
      const authUsers = await listAllAuthUsers(supabase)

      const settings = await selectAll<{ user_id: string; plan: string | null }>('user_settings', () =>
        oldestFirst(supabase.from('user_settings').select('user_id, plan')))

      const planMap: Record<string, string> = {}
      for (const s of settings ?? []) planMap[s.user_id] = s.plan ?? 'free'

      return authUsers
        .filter(u => u.email)
        .map(u => ({ id: u.id, email: u.email!, plan: planMap[u.id] ?? 'free' }))
    })

    const users = userData as Array<{ id: string; email: string; plan: string }>
    const CREDIT_MAP: Record<string, number> = {
      free: 50, pro: 500, pro_annual: 500, agency: 2000, agency_annual: 2000,
    }

    const resend = getResend()
    let sent = 0

    for (const u of users) {
      const credits = CREDIT_MAP[u.plan] ?? 50
      const isFree = u.plan === 'free'
      const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#000000;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">SocialMate</div>
            <div style="font-size:13px;color:#9ca3af;margin-top:6px;">Your monthly credits just reset</div>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;font-weight:900;color:#16a34a;">${credits}</div>
              <div style="font-size:14px;font-weight:700;color:#15803d;margin-top:4px;">credits available for ${month}</div>
            </div>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">Your ${credits} monthly credits are ready. Use them on AI captions, rewrites, hooks, hashtag suggestions, thread generation, and more.</p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${appUrl}/compose" style="display:inline-block;background:#000000;color:#ffffff;padding:14px 36px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none;">Start scheduling →</a>
            </div>
            ${isFree ? `
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;">
              <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:8px;">💡 Want 10× more credits?</div>
              <div style="font-size:13px;color:#78350f;line-height:1.6;">Upgrade to Pro for <strong>500 credits/month</strong> , plus 1,000 posts a month, 5 team seats and scheduling a month ahead. $8/month.</div>
              <div style="margin-top:12px;text-align:center;">
                <a href="${appUrl}/pricing" style="display:inline-block;background:#d97706;color:#ffffff;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;">Upgrade to Pro — $8/mo →</a>
              </div>
            </div>` : ''}
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;text-align:center;">
              <p style="font-size:11px;color:#9ca3af;margin:0;">You're receiving this because you have a SocialMate account. <a href="${appUrl}/settings?tab=Notifications" style="color:#6b7280;">Manage preferences</a></p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

      try {
        await resend.emails.send({
          from: 'SocialMate <noreply@socialmate.studio>',
          replyTo: REPLY_TO,
          to: u.email,
          subject: `Your ${credits} SocialMate credits just reset — ${month}`,
          html,
        })
        sent++
      } catch (err) {
        console.error('[Monthly Credits Email] failed for', u.email, err)
      }
    }

    return { sent, total: users.length }
  }
)

// ─── Comeback Re-engagement Emails — daily 2pm UTC ────────────────────────────
// Sends targeted re-engagement emails to users at 7, 14, and 30 days of inactivity.
// Uses last_sign_in_at window (1-day bucket) for natural deduplication.
export const comebackEmails = inngest.createFunction(
  { id: 'comeback-emails', name: 'Comeback Re-engagement Emails', retries: 1 },
  { cron: '0 14 * * *' },
  async ({ step }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
    const now = Date.now()

    const users = await step.run('fetch-users', async () => {
      const authUsers = await listAllAuthUsers(getSupabaseAdmin())
      return authUsers
        .filter(u => u.email && u.last_sign_in_at)
        .map(u => ({
          email: u.email!,
          name: (u.user_metadata?.full_name as string || u.email!.split('@')[0]),
          daysSince: Math.round((now - new Date(u.last_sign_in_at!).getTime()) / 86_400_000),
        }))
    })

    const day7  = users.filter(u => u.daysSince === 7)
    const day14 = users.filter(u => u.daysSince === 14)
    const day30 = users.filter(u => u.daysSince === 30)

    const emailLogo = `<div style="margin-bottom:32px;"><span style="font-weight:900;font-size:18px;color:#ffffff;letter-spacing:-0.5px;">SocialMate</span></div>`

    await step.run('send-7d-batch', async () => {
      const resend = getResend()
      for (const u of day7) {
        try {
          await resend.emails.send({
            from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
            replyTo: REPLY_TO,
            to: u.email,
            subject: `${u.name}, your content isn't going to post itself`,
            html: `<div style="background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;">
              ${emailLogo}
              <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 16px;letter-spacing:-0.5px;">It's been a week.</h1>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 16px;">
                You signed up for SocialMate and then... life happened. We get it.
              </p>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 24px;">
                Here's the thing — scheduling your content takes 5 minutes a week with SocialMate. The AI tools do most of the heavy lifting. You just show up and pick what to post.
              </p>
              <div style="background:#111111;border:1px solid #222222;border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="font-size:13px;color:#71717a;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">What you left on the table</p>
                <p style="font-size:14px;color:#d4d4d8;margin:0 0 8px;">✦ AI captions + hooks — write your post in 10 seconds</p>
                <p style="font-size:14px;color:#d4d4d8;margin:0 0 8px;">✦ Schedule to 7 platforms at once — Bluesky, X, TikTok, Discord, Telegram, Mastodon, LinkedIn</p>
                <p style="font-size:14px;color:#d4d4d8;margin:0;">✦ SOMA — your AI content agent that posts for you on autopilot</p>
              </div>
              <a href="${appUrl}/compose" style="display:inline-block;background:#7C3AED;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:28px;">Schedule one post right now →</a>
              <p style="font-size:13px;color:#52525b;">— Joshua, Founder of SocialMate</p>
              <p style="font-size:11px;color:#3f3f46;margin-top:16px;">Reply "unsubscribe" to stop these check-ins.</p>
            </div>`,
          })
        } catch { /* non-fatal */ }
      }
    })

    await step.run('send-14d-batch', async () => {
      const resend = getResend()
      for (const u of day14) {
        try {
          await resend.emails.send({
            from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
            replyTo: REPLY_TO,
            to: u.email,
            subject: 'Still here if you need us',
            html: `<div style="background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;">
              ${emailLogo}
              <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 16px;letter-spacing:-0.5px;">Two weeks. We're still here.</h1>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 16px;">
                You haven't been back in two weeks. That's okay. Life is busy and you're probably building something worth talking about.
              </p>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 24px;">
                Here's what's new since you left — TikTok scheduling is fully live, we launched 8 AI agents that post for you, and there's a creator monetization hub where your audience can support you directly.
              </p>
              <div style="background:#111111;border:1px solid #222222;border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="font-size:13px;color:#71717a;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">What's new</p>
                <p style="font-size:14px;color:#d4d4d8;margin:0 0 8px;">🎵 TikTok scheduling is live — schedule directly to TikTok</p>
                <p style="font-size:14px;color:#d4d4d8;margin:0 0 8px;">🤖 8 AI agents — newsletter, repurpose, inbox, trend scout, and more</p>
                <p style="font-size:14px;color:#d4d4d8;margin:0;">💸 Creator Monetization Hub — tip jar + fan subscriptions, 0% platform cut</p>
              </div>
              <a href="${appUrl}/dashboard" style="display:inline-block;background:#7C3AED;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:28px;">Come back and take a look →</a>
              <p style="font-size:13px;color:#52525b;">— Joshua, Founder of SocialMate</p>
              <p style="font-size:11px;color:#3f3f46;margin-top:16px;">Reply "unsubscribe" to stop these check-ins.</p>
            </div>`,
          })
        } catch { /* non-fatal */ }
      }
    })

    await step.run('send-30d-batch', async () => {
      const resend = getResend()
      for (const u of day30) {
        try {
          await resend.emails.send({
            from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
            replyTo: REPLY_TO,
            to: u.email,
            subject: 'One last note from me (for real)',
            html: `<div style="background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#ffffff;">
              ${emailLogo}
              <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 16px;letter-spacing:-0.5px;">One month. One last reach-out.</h1>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 16px;">
                It's been 30 days since you last logged in. I'm not going to keep emailing you after this — that's not how I operate.
              </p>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 16px;">
                If SocialMate wasn't the right fit, that's genuinely okay. But if life just got in the way and you want to give it a real shot — I'd love to have you back. Your account is exactly as you left it.
              </p>
              <p style="font-size:15px;color:#a1a1aa;line-height:1.7;margin:0 0 24px;">
                And if there's something specific that wasn't working — reply to this email and tell me. I actually read these.
              </p>
              <a href="${appUrl}/dashboard" style="display:inline-block;background:#7C3AED;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:28px;">Log back in →</a>
              <p style="font-size:13px;color:#52525b;line-height:1.6;">— Joshua, Founder of SocialMate<br><span style="font-size:12px;color:#3f3f46;">After this I'll leave you alone. Promise.</span></p>
            </div>`,
          })
        } catch { /* non-fatal */ }
      }
    })

    return { day7: day7.length, day14: day14.length, day30: day30.length }
  }
)

// ─── IRIS Auto-Dispatch — Sunday 8pm UTC ──────────────────────────────────────
// Fully automated: generates the newsletter via Gemini AND sends it to all
// opted-in users via Resend. No admin review step — Joshua just gets an FYI.
export const irisAutoDispatch = inngest.createFunction(
  { id: 'iris-auto-dispatch', name: 'IRIS Auto-Dispatch', retries: 1 },
  { cron: '0 20 * * 0' },
  async ({ step }) => {
    const minus7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const weekData = await step.run('gather-week-data', async () => {
      const db = getSupabaseAdmin()
      const [signupsRes, postsRes, tiktokRes, blogRes] = await Promise.all([
        db.from('workspaces').select('id', { count: 'exact', head: true }).eq('is_personal', true).gte('created_at', minus7d),
        db.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', minus7d),
        db.from('tiktok_posts').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('created_at', minus7d),
        db.from('blog_posts').select('title').order('published_at', { ascending: false }).limit(3),
      ])
      return {
        newSignups:     signupsRes.count ?? 0,
        postsPublished: postsRes.count ?? 0,
        tiktokPosts:    tiktokRes.count ?? 0,
        recentBlogs:    (blogRes.data ?? []).map((p: { title: string }) => p.title),
      }
    })

    const draft = await step.run('generate-draft', async () => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
      const result = await model.generateContent(`You are writing the IRIS Dispatch — a weekly creator newsletter from SocialMate. Write in Joshua's authentic voice: bootstrapped solo founder, genuinely cares about creators, no corporate fluff.

Platform stats this week:
- New signups: ${weekData.newSignups}
- Posts published by users: ${weekData.postsPublished}
- TikTok posts: ${weekData.tiktokPosts}
- Recent blog posts: ${weekData.recentBlogs.join(', ')}

Write a complete newsletter with these fields:
- subject: punchy email subject line (no emoji spam, 1 emoji max)
- intro: 2-3 sentences, punchy opener that feels personal (NOT "Hey creators!" — more like a friend writing to you)
- creator_tip: One high-value actionable tip for growing on social media
- what_shipped: 3-4 bullet points of recent SocialMate features/improvements (draw from: SOMA, AI agents, TikTok live, Creator Monetization Hub, calendar, analytics, etc.)
- real_numbers: 1-2 sentences about growth/usage using the stats above
- whats_next: 2-3 sentences teasing what's coming (vague but exciting — chrome extension, loyalty badges, community features, etc.)
- closing: 1-2 sentence personal sign-off from Joshua

Return ONLY valid JSON (no markdown, no code blocks): {"subject":"...","intro":"...","creator_tip":"...","what_shipped":"...","real_numbers":"...","whats_next":"...","closing":"..."}`)

      const text = result.response.text().trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null
      try { return JSON.parse(jsonMatch[0]) } catch { return null }
    })

    if (!draft) return { success: false, reason: 'generation_failed' }

    const result = await step.run('send-dispatch', async () => {
      const db = getSupabaseAdmin()

      const { count } = await db.from('iris_dispatches').select('*', { count: 'exact', head: true })
      const edition = (count ?? 0) + 1

      const whatShipped = [draft.what_shipped, draft.creator_tip ? `\n\n💡 Creator tip: ${draft.creator_tip}` : ''].join('')

      const bodyHtml = buildIrisEmailHtml({
        edition,
        subject: draft.subject,
        intro: draft.intro,
        whatShipped,
        realNumbers: draft.real_numbers ?? '',
        whatsNext: draft.whats_next ?? '',
        closing: draft.closing ?? '',
      })

      // Opted in BY DEFAULT: include true AND null. .eq('iris_opt_in', true) silently
      // dropped legacy rows whose flag was never set (NULL), so opted-in-by-default users
      // (incl. the admin account) never received it. Only an explicit false opts out.
      const { data: optins } = await db.from('user_settings').select('user_id').or('iris_opt_in.eq.true,iris_opt_in.is.null')
      const optedInIds = new Set((optins ?? []).map((r: { user_id: string }) => r.user_id))

      const authUsers = await listAllAuthUsers(db)
      const emails = authUsers
        .filter(u => u.email && optedInIds.has(u.id))
        .map(u => u.email!)

      if (emails.length === 0) return { success: false as const, reason: 'no_recipients', edition: 0, sent: 0, total: 0 }

      await db.from('iris_dispatches').insert({
        edition,
        subject: draft.subject,
        intro: draft.intro,
        what_shipped: whatShipped,
        real_numbers: draft.real_numbers ?? null,
        whats_next: draft.whats_next ?? null,
        closing: draft.closing ?? null,
        body_html: bodyHtml,
        recipient_count: emails.length,
      })

      const resend = getResend()
      let sent = 0
      const CHUNK = 100
      for (let i = 0; i < emails.length; i += CHUNK) {
        const chunk = emails.slice(i, i + CHUNK)
        try {
          await resend.batch.send(chunk.map(to => ({
            from: 'Joshua @ SocialMate <noreply@socialmate.studio>',
            replyTo: REPLY_TO,
            to,
            subject: draft.subject,
            html: buildIrisEmailHtml({
              edition,
              subject: draft.subject,
              intro: draft.intro,
              whatShipped,
              realNumbers: draft.real_numbers ?? '',
              whatsNext: draft.whats_next ?? '',
              closing: draft.closing ?? '',
              recipientEmail: to,
            }),
          })))
          sent += chunk.length
        } catch (err) {
          console.error('IRIS auto-dispatch batch send error:', err)
        }
      }

      return { success: true as const, edition, sent, total: emails.length }
    })

    // Lightweight FYI to admin — no action needed, just visibility
    if (result.success) {
      await step.run('notify-admin', async () => {
        await getResend().emails.send({
          from: 'SocialMate System <joshua@socialmate.studio>',
          replyTo: REPLY_TO,
          to: 'socialmatehq@gmail.com',
          subject: `✅ IRIS Dispatch #${result.edition} sent automatically — ${draft.subject}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f9fafb;">
            <h2 style="color:#111;margin:0 0 8px;">IRIS Dispatch #${result.edition} sent</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">Sent automatically to ${result.sent}/${result.total} opted-in subscribers. No action needed.</p>
            <p style="color:#374151;font-size:14px;"><strong>Subject:</strong> ${draft.subject}</p>
          </div>`,
        })
      })
    }

    return { ...result, subject: draft.subject }
  }
)

// ─── Admin Health Alert — every 4 hours ───────────────────────────────────────
// Emails admin if 3+ posts fail within a 4-hour window.
// The 4h cron window naturally prevents repeat alerts for the same failure cluster.
export const adminHealthAlert = inngest.createFunction(
  { id: 'admin-health-alert', name: 'Admin Post Failure Alert', retries: 0 },
  { cron: '0 */4 * * *' },
  async ({ step }) => {
    const threshold  = 3
    const windowMs   = 4 * 60 * 60 * 1000
    const windowStart = new Date(Date.now() - windowMs).toISOString()
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

    const { failures, partial } = await step.run('check-failures', async () => {
      const db = getSupabaseAdmin()
      const [failRes, partRes] = await Promise.all([
        db.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('updated_at', windowStart),
        db.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'partial').gte('updated_at', windowStart),
      ])
      return { failures: failRes.count ?? 0, partial: partRes.count ?? 0 }
    })

    if (failures < threshold) return { failures, partial, alert: false }

    await step.run('send-alert', async () => {
      await getResend().emails.send({
        from: 'SocialMate System <joshua@socialmate.studio>',
        replyTo: REPLY_TO,
        to: 'socialmatehq@gmail.com',
        subject: `⚠️ ${failures} post failures in the last 4h`,
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#dc2626;">⚠️ Post Failure Alert</h2>
          <p><strong>${failures} posts failed</strong> and <strong>${partial} partially failed</strong> in the last 4 hours.</p>
          <p>This may indicate a platform API issue or a token expiration problem.</p>
          <ul>
            <li><a href="${appUrl}/admin/platform-stats">Platform Stats →</a></li>
            <li><a href="${appUrl}/admin/overview">Admin Overview →</a></li>
          </ul>
          <p style="color:#6b7280;font-size:12px;">Threshold: ${threshold} failures / 4h window</p>
        </div>`,
      })
    })

    return { failures, partial, alert: true }
  }
)

// ── Achievement checker — daily at 11am UTC ───────────────────────────────
const ACHIEVEMENT_DEFS = [
  { key: 'first_post',  reward: 0,   check: (p: number, _s: number, _m: number, _pl: number) => p >= 1   },
  { key: 'posts_10',    reward: 25,  check: (p: number, _s: number, _m: number, _pl: number) => p >= 10  },
  { key: 'posts_50',    reward: 50,  check: (p: number, _s: number, _m: number, _pl: number) => p >= 50  },
  { key: 'posts_100',   reward: 100, check: (p: number, _s: number, _m: number, _pl: number) => p >= 100 },
  { key: 'posts_500',   reward: 200, check: (p: number, _s: number, _m: number, _pl: number) => p >= 500 },
  { key: 'streak_7',    reward: 25,  check: (_p: number, s: number, _m: number, _pl: number) => s >= 7   },
  { key: 'streak_30',   reward: 50,  check: (_p: number, s: number, _m: number, _pl: number) => s >= 30  },
  { key: 'streak_100',  reward: 150, check: (_p: number, s: number, _m: number, _pl: number) => s >= 100 },
  { key: 'month_3',     reward: 100, check: (_p: number, _s: number, m: number, _pl: number) => m >= 3   },
  { key: 'month_6',     reward: 100, check: (_p: number, _s: number, m: number, _pl: number) => m >= 6   },
  { key: 'month_12',    reward: 100, check: (_p: number, _s: number, m: number, _pl: number) => m >= 12  },
  { key: 'platforms_3',     reward: 25,  check: (_p: number, _s: number, _m: number, pl: number) => pl >= 3  },
  { key: '30_day_challenge', reward: 50,  check: (_p: number, s: number, _m: number, _pl: number) => s >= 30 },
]

export const checkAchievements = inngest.createFunction(
  { id: 'check-achievements', name: 'Daily Achievement Checker', retries: 1 },
  { cron: '0 11 * * *' },
  async ({ step }) => {
    const db = getSupabaseAdmin()

    const newlyAwarded = await step.run('check-all-users', async () => {
      const { data: users } = await db.from('profiles').select('id, created_at')
      if (!users?.length) return 0

      let totalAwarded = 0

      for (const user of users) {
        try {
          const userId = user.id
          const joinedAt = new Date(user.created_at)
          const monthsOn = (Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)

          const [{ count: pubCount }, { data: platforms }, { data: existing }, { data: scheduled }] = await Promise.all([
            db.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'published'),
            db.from('connected_accounts').select('platform').eq('user_id', userId),
            db.from('user_achievements').select('achievement_key').eq('user_id', userId),
            db.from('posts').select('scheduled_at').eq('user_id', userId).in('status', ['published', 'scheduled']).order('scheduled_at', { ascending: false }),
          ])

          const publishedCount = pubCount ?? 0
          const platformCount  = new Set((platforms || []).map((p: any) => p.platform)).size
          const earnedKeys     = new Set((existing || []).map((e: any) => e.achievement_key))

          // Calculate streak from scheduled_at dates
          let streak = 0
          if (scheduled?.length) {
            const days = new Set(scheduled.map((p: any) => new Date(p.scheduled_at).toDateString()))
            const sorted = Array.from(days).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            let cursor = new Date(); cursor.setHours(0, 0, 0, 0)
            for (const day of sorted) {
              const d = new Date(day); d.setHours(0, 0, 0, 0)
              const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
              if (diff <= 1) { streak++; cursor = d } else break
            }
          }

          for (const def of ACHIEVEMENT_DEFS) {
            if (earnedKeys.has(def.key)) continue
            if (!def.check(publishedCount, streak, Math.floor(monthsOn), platformCount)) continue

            await db.from('user_achievements').insert({ user_id: userId, achievement_key: def.key, credits_awarded: def.reward })

            if (def.reward > 0) {
              const { data: s } = await db.from('user_settings').select('earned_credits').eq('user_id', userId).single()
              await db.from('user_settings').update({ earned_credits: (s?.earned_credits ?? 0) + def.reward }).eq('user_id', userId)
            }

            // Every other notification write in this codebase uses is_read
            // (what /api/notifications/count and /api/notifications actually
            // filter on) -- this one used `read`, a column that doesn't exist,
            // and discarded the insert error, so the "Achievement Unlocked!"
            // notification has almost certainly never shown up for anyone.
            // The credit award above is unaffected -- that part was correct.
            const { error: notifErr } = await db.from('notifications').insert({
              user_id: userId,
              type: 'achievement',
              title: '🏆 Achievement Unlocked!',
              message: `You earned the "${def.key.replace(/_/g, ' ')}" badge${def.reward > 0 ? ` + ${def.reward} bonus credits` : ''}`,
              is_read: false,
            })
            if (notifErr) console.warn(`[checkAchievements] notification insert failed for ${userId}:`, notifErr.message)

            totalAwarded++
          }
        } catch (err) {
          console.error(`[checkAchievements] user ${user.id}:`, err)
        }
      }

      return totalAwarded
    })

    return { newlyAwarded }
  }
)

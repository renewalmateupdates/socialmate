import { Inngest } from 'inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import {
  getRecentMembers,
  sendChannelMessage,
  assignRole,
} from '@/lib/discord-bot'

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
      }

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

    // ── Wait 3 days ────────────────────────────────────────────────────────────
    await step.sleep('wait-3-days', '3d')

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

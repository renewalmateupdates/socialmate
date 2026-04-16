import { Inngest } from 'inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { createDecipheriv } from 'crypto'
import {
  getRecentMembers,
  sendChannelMessage,
  assignRole,
} from '@/lib/discord-bot'

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

// ─── Enki Paper Trading Scan — every 15 minutes ────────────────────────────────
// For each Citizen-tier user with active doctrines, runs a simplified signal
// check (Yahoo Finance free endpoint, no API key), then executes paper trades
// at confidence >= 6 (autonomous) or queues pending_approval trades.
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

    const priceMap = await step.run('fetch-prices', async () => {
      const prices: Record<string, number> = {}
      const signalMap: Record<string, { price: number; confidence: number; side: 'buy' | 'sell' | 'neutral' }> = {}

      for (const symbol of symbolList) {
        try {
          // Yahoo Finance free chart endpoint — no API key needed
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=15m&range=1d`
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          })
          if (!res.ok) {
            console.warn(`[EnkiScan] Yahoo fetch failed for ${symbol}: ${res.status}`)
            continue
          }
          const data = await res.json()
          const meta = data?.chart?.result?.[0]?.meta
          if (!meta) continue

          const currentPrice: number = meta.regularMarketPrice ?? meta.chartPreviousClose
          const prevClose: number    = meta.chartPreviousClose ?? currentPrice

          if (!currentPrice) continue

          prices[symbol] = currentPrice

          // Simple signal: compare current price vs previous close
          const changePct = ((currentPrice - prevClose) / prevClose) * 100

          let confidence = 3 // neutral
          let side: 'buy' | 'sell' | 'neutral' = 'neutral'

          if (changePct > 0.04) {
            confidence = 7
            side = 'buy'
          } else if (changePct < -0.04) {
            confidence = 7
            side = 'sell'
          }

          signalMap[symbol] = { price: currentPrice, confidence, side }
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
          .select('symbol, side, qty, price, doctrine_id, executed_at')
          .eq('user_id', user.user_id)
          .eq('broker', 'paper')
          .eq('status', 'filled')
          .order('executed_at', { ascending: true })

        if (slTpTrades?.length) {
          // Compute net open position + avg cost basis per symbol
          const openPos: Record<string, { qty: number; totalCost: number; doctrine_id: string | null }> = {}
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

              const avgCost    = pos.totalCost / pos.qty
              const pnlPct     = ((signal.price - avgCost) / avgCost) * 100
              const doctrine   = user.doctrines.find((d: any) => d.id === pos.doctrine_id) ?? user.doctrines[0]
              const slPct      = doctrine?.config?.stop_loss_pct   ?? 8
              const tpPct      = doctrine?.config?.take_profit_pct ?? 15
              const hitSL      = pnlPct <= -slPct
              const hitTP      = pnlPct >= tpPct
              if (!hitSL && !hitTP) continue

              const reason = hitSL
                ? `Stop loss triggered: ${pnlPct.toFixed(2)}% (limit: -${slPct}%)`
                : `Take profit triggered: +${pnlPct.toFixed(2)}% (target: +${tpPct}%)`

              const { error: slTpErr } = await db.from('enki_trades').insert({
                user_id:     user.user_id,
                doctrine_id: doctrine?.id ?? null,
                symbol:      sym,
                side:        'sell',
                qty:         pos.qty,
                price:       signal.price,
                total:       pos.qty * signal.price,
                broker:      'paper',
                paper:       true,
                confidence:  9,
                status:      'filled',
                reason,
                executed_at: now.toISOString(),
              })
              if (!slTpErr) {
                totalTrades++
                console.log(`[EnkiScan] ${hitSL ? 'SL' : 'TP'} closed: ${user.user_id} SELL ${pos.qty.toFixed(4)}x${sym} @$${signal.price} — ${reason}`)
              }
            }
          }
        }

        for (const doctrine of user.doctrines) {
          const symbols: string[] = doctrine.config?.symbols ?? ['SPY', 'QQQ']

          for (const rawSym of symbols) {
            const symbol = rawSym.toUpperCase()
            const signal = priceMap[symbol]
            if (!signal || signal.price == null || signal.confidence == null || signal.side == null) continue

            const { price, confidence, side } = signal as { price: number; confidence: number; side: 'buy' | 'sell' | 'neutral' }

            // Only act on signals with confidence >= 6
            if (confidence < 6) continue
            if (side === 'neutral') continue

            // Fortress Guard: only between market hours (9:30–16:00 ET on weekdays)
            // We do a UTC check: ET is UTC-4 (EDT) / UTC-5 (EST)
            // Use 13:30–20:00 UTC as a safe approximation for market hours
            const utcHour = now.getUTCHours()
            const utcMin  = now.getUTCMinutes()
            const utcTime = utcHour * 60 + utcMin
            const dayOfWeek = now.getUTCDay() // 0=Sun, 6=Sat
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const isMarketOpen = !isWeekend && utcTime >= 13 * 60 + 30 && utcTime < 20 * 60

            if (!isMarketOpen) continue

            // ── Dynamic position sizing (Full Send mode) ────────────────────
            // Default: 10% of portfolio. Full Send (position_size_pct=100): use entire portfolio.
            const positionSizePct: number = doctrine.config?.position_size_pct ?? 10
            const startingCash = 10000

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
                      reason:           `Live Alpaca order: ${changePctLabel(signal)} | size ${positionSizePct}% of portfolio ($${tradeAmount.toFixed(2)})`,
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
                total:       tradeAmount,
                broker:      'paper',
                paper:       true,
                confidence,
                status,
                reason:      `Auto signal: ${changePctLabel(signal)} | size ${positionSizePct}% of portfolio ($${tradeAmount.toFixed(2)})`,
                executed_at: now.toISOString(),
              })

            if (tradeErr) {
              console.error(`[EnkiScan] Trade insert error for ${user.user_id}/${symbol}:`, tradeErr.message)
              continue
            }

            if (status === 'filled') totalTrades++
            console.log(`[EnkiScan] Paper trade: ${user.user_id} ${side.toUpperCase()} ${qty.toFixed(4)}x${symbol} @$${price} ($${tradeAmount.toFixed(2)}, ${positionSizePct}% of portfolio, ${status})`)
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

// Helper: human-readable price movement label
function changePctLabel(signal: { price: number; confidence: number; side: string }): string {
  if (signal.side === 'buy')  return `bullish momentum (conf ${signal.confidence}/10)`
  if (signal.side === 'sell') return `bearish momentum (conf ${signal.confidence}/10)`
  return 'neutral'
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
      const signalMap: Record<string, { price: number; confidence: number; side: 'buy' | 'sell' | 'neutral' }> = {}
      for (const symbol of symbolList) {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
          if (!res.ok) continue
          const data = await res.json()
          const meta = data?.chart?.result?.[0]?.meta
          if (!meta) continue
          const currentPrice: number = meta.regularMarketPrice ?? meta.chartPreviousClose
          const prevClose: number    = meta.chartPreviousClose ?? currentPrice
          if (!currentPrice) continue
          const changePct = ((currentPrice - prevClose) / prevClose) * 100
          let confidence = 3
          let side: 'buy' | 'sell' | 'neutral' = 'neutral'
          if (changePct > 0.03) { confidence = 7; side = 'buy'  }
          else if (changePct < -0.03) { confidence = 7; side = 'sell' }
          signalMap[symbol] = { price: currentPrice, confidence, side }
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
              reason:      `Cloud Runner 5m signal: ${changePctLabel(signal)} | size ${positionSizePct}% ($${tradeAmount.toFixed(2)})`,
              executed_at: now.toISOString(),
            })
            if (!tradeErr && status === 'filled') totalTrades++
          }
        }
      })
    }

    console.log(`[CloudRunnerScan] Complete — ${activeUsers.length} user(s), ${totalTrades} trade(s)`)
    return { scanned: activeUsers.length, trades: totalTrades }
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

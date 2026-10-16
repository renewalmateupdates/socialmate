import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendMail } from '@/lib/mail'
import {
  checkBluesky,
  checkDiscord,
  checkMastodon,
  coverageForPost,
  isDiscordSnowflake,
  mastodonRef,
  pickTargets,
  publicUrl,
  tally,
  targetKey,
  type FarEndOutcome,
  type FarEndTarget,
  type MastodonRef,
} from '@/lib/delivery-check'

// Posts published in this window get checked. A day of slack past one run.
const WINDOW_MS = 48 * 60 * 60 * 1000
// A post gets an hour to show up before it's checked, so indexing lag on the
// platform's side never reads as a missing post. Younger posts wait a night.
const MIN_AGE_MS = 60 * 60 * 1000
// Earlier checks are read back this far, so a settled post is never re-checked.
const HISTORY_MS = 4 * 24 * 60 * 60 * 1000
// Pause between calls to the same service, to stay far inside rate limits.
const GAP_MS = 250
// Same inbox adminHealthAlert writes to.
const ADMIN_TO = 'socialmatehq@gmail.com'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))

/**
 * Nightly far-end check (see lib/delivery-check.ts): asks Bluesky, Mastodon and
 * Discord whether recently published posts are really there, records the answer in
 * `delivery_checks`, and emails the admin only when one is missing. A post is
 * confirmed once and alerts once; unknowns are retried the next night.
 *
 * Throws instead of returning quietly when a query fails, so a broken run
 * shows as failed in Inngest rather than looking like a night with nothing to
 * check.
 */
export const farEndDeliveryCheck = inngest.createFunction(
  { id: 'far-end-delivery-check', name: 'Far-end delivery check', retries: 1 },
  { cron: '30 9 * * *' },
  async ({ step }) => {
    const plan = await step.run('load-targets', async () => {
      const db = getSupabaseAdmin()
      const since = new Date(Date.now() - WINDOW_MS).toISOString()
      const until = new Date(Date.now() - MIN_AGE_MS).toISOString()
      const { data: posts, error } = await db
        .from('posts')
        .select('id, user_id, platform_post_ids, destinations, published_at')
        .in('status', ['published', 'partial'])
        .gte('published_at', since)
        .lte('published_at', until)
        .not('platform_post_ids', 'is', null)
        .order('published_at', { ascending: false })
        .limit(500)
      if (error) throw new Error(`posts query failed: ${error.message}`)

      const targets: FarEndTarget[] = []
      let notCovered = 0
      for (const post of posts ?? []) {
        const c = coverageForPost(post)
        targets.push(...c.targets)
        notCovered += c.unchecked.length
      }
      if (targets.length === 0) return { targets, notCovered, postsSeen: posts?.length ?? 0 }

      const { data: prior, error: priorError } = await db
        .from('delivery_checks')
        .select('post_id, platform, result')
        .gte('checked_at', new Date(Date.now() - HISTORY_MS).toISOString())
      if (priorError) throw new Error(`delivery_checks query failed: ${priorError.message}`)
      const settled = new Set(
        (prior ?? [])
          .filter(r => r.result !== 'unknown')
          .map(r => targetKey({ postId: r.post_id, platform: r.platform })),
      )
      return { targets: pickTargets(targets, settled), notCovered, postsSeen: posts?.length ?? 0 }
    })

    if (plan.targets.length === 0) {
      return { checked: 0, postsSeen: plan.postsSeen, notCovered: plan.notCovered }
    }

    // Tokens are read and used inside this step and never returned, so they
    // are not stored in Inngest's step history.
    const outcomes: FarEndOutcome[] = await step.run('check-far-end', async () => {
      const results: FarEndOutcome[] = []

      const bsky = plan.targets.filter(t => t.platform === 'bluesky')
      if (bsky.length > 0) {
        const answers = await checkBluesky(bsky.map(t => t.remoteId))
        for (const t of bsky) results.push({ target: t, result: answers.get(t.remoteId) ?? 'unknown' })
      }

      const masto = plan.targets.filter(t => t.platform === 'mastodon')
      if (masto.length > 0) {
        const { data: accounts, error } = await getSupabaseAdmin()
          .from('connected_accounts')
          .select('user_id, platform_user_id, access_token')
          .eq('platform', 'mastodon')
          .in('user_id', Array.from(new Set(masto.map(t => t.userId))))
        if (error) throw new Error(`connected_accounts query failed: ${error.message}`)
        const refsByUser = new Map<string, MastodonRef[]>()
        for (const a of accounts ?? []) {
          const ref = mastodonRef(a.platform_user_id, a.access_token)
          if (!ref) continue
          refsByUser.set(a.user_id, [...(refsByUser.get(a.user_id) ?? []), ref])
        }
        for (const t of masto) {
          const refs = refsByUser.get(t.userId) ?? []
          // No connected account left to ask: we can't tell, so it isn't a missing post.
          results.push({ target: t, result: refs.length > 0 ? await checkMastodon(refs, t.remoteId) : 'unknown' })
          await sleep(GAP_MS)
        }
      }

      const disc = plan.targets.filter(t => t.platform === 'discord')
      if (disc.length > 0) {
        const db = getSupabaseAdmin()
        type Dest = { destination_id: string | null; webhook_url: string | null }
        const byId = new Map<string, Dest>()
        const destIds = Array.from(new Set(disc.map(t => t.destinationId).filter((d): d is string => !!d)))
        if (destIds.length > 0) {
          const { data, error } = await db
            .from('post_destinations')
            .select('id, destination_id, webhook_url')
            .in('id', destIds)
          if (error) throw new Error(`post_destinations query failed: ${error.message}`)
          for (const d of data ?? []) byId.set(d.id, d)
        }
        // A post with no recorded destination went to the user's first Discord
        // destination (the publisher's fallback). Only trust that when the user
        // has exactly one, or a check against the wrong channel reads as missing.
        const onlyByUser = new Map<string, Dest>()
        const needFallback = Array.from(new Set(
          disc.filter(t => !t.destinationId || !byId.has(t.destinationId)).map(t => t.userId),
        ))
        if (needFallback.length > 0) {
          const { data, error } = await db
            .from('post_destinations')
            .select('user_id, destination_id, webhook_url')
            .eq('platform', 'discord')
            .in('user_id', needFallback)
          if (error) throw new Error(`post_destinations fallback query failed: ${error.message}`)
          const counts = new Map<string, number>()
          for (const d of data ?? []) counts.set(d.user_id, (counts.get(d.user_id) ?? 0) + 1)
          for (const d of data ?? []) if (counts.get(d.user_id) === 1) onlyByUser.set(d.user_id, d)
        }
        const token = process.env.DISCORD_BOT_TOKEN
        if (!token) console.warn('[far-end] DISCORD_BOT_TOKEN is not set; Discord posts are recorded as unknown')
        for (const t of disc) {
          const dest = (t.destinationId ? byId.get(t.destinationId) : undefined) ?? onlyByUser.get(t.userId)
          // A webhook destination never produced this message id, so there is nothing to read back.
          const channel = dest && !dest.webhook_url && isDiscordSnowflake(dest.destination_id) ? dest.destination_id : null
          results.push({ target: t, result: channel ? await checkDiscord(channel, t.remoteId, token) : 'unknown' })
          await sleep(GAP_MS)
        }
      }
      return results
    })

    await step.run('record', async () => {
      const checkedAt = new Date().toISOString()
      const { error } = await getSupabaseAdmin()
        .from('delivery_checks')
        .upsert(
          outcomes.map(o => ({
            post_id:    o.target.postId,
            user_id:    o.target.userId,
            platform:   o.target.platform,
            remote_id:  o.target.remoteId,
            result:     o.result,
            checked_at: checkedAt,
          })),
          { onConflict: 'post_id,platform' },
        )
      if (error) throw new Error(`delivery_checks upsert failed: ${error.message}`)
    })

    const counts = tally(outcomes)
    const missing = outcomes.filter(o => o.result === 'missing')

    if (missing.length > 0) {
      await step.run('alert-admin', async () => {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
        const rows = missing.map(({ target }) => {
          const link = publicUrl(target)
          return `<li><strong>${esc(target.platform)}</strong>: post <code>${esc(target.postId)}</code>, remote id <code>${esc(target.remoteId)}</code>`
            + (link ? `, <a href="${esc(link)}">open it</a>` : '')
            + `, <a href="${appUrl}/admin/users/${esc(target.userId)}">the user</a></li>`
        }).join('')
        const { error } = await sendMail({
          to: ADMIN_TO,
          subject: `${missing.length} published post${missing.length === 1 ? '' : 's'} not found on the platform`,
          html: `
            <p>Last night's delivery check asked the platforms whether recently published posts are really there.
            These are marked published in SocialMate, but the platform says they don't exist:</p>
            <ul>${rows}</ul>
            <p>The author may have deleted one by hand, so look before assuming a bug. Each post alerts once.</p>
            <p>Checked ${outcomes.length}: ${counts.live} live, ${counts.missing} missing, ${counts.unknown} couldn't tell.
            ${plan.notCovered} on platforms this check can't read (X, LinkedIn, Telegram, TikTok, Discord webhooks).</p>`,
        })
        if (error) throw new Error(`alert email failed: ${error.message}`)
      })
    }

    return { checked: outcomes.length, ...counts, postsSeen: plan.postsSeen, notCovered: plan.notCovered }
  },
)

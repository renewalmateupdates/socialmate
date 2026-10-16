/**
 * Far-end delivery check: is a post SocialMate marked published actually live
 * on the platform? `posts.status` only records that the publish call returned.
 * A job can report success for days while nothing appears anywhere, and only
 * asking the platform shows it.
 *
 * Only free reads are used: Bluesky's public AppView, the poster's own Mastodon
 * instance, and the SocialMate bot reading back its own Discord message. X
 * reads cost money, LinkedIn grants no read scope, and Telegram, TikTok and
 * Discord webhook posts (which never return a message id) are not checked, so a
 * post there is never reported as live, only left out.
 *
 * Everything here is pure except the two fetchers, which take a `fetch` so the
 * tests can fake it. No '@/' imports: scripts/test-delivery-check.mjs loads this
 * file on its own.
 */

export type FarEndResult = 'live' | 'missing' | 'unknown'
export type CheckablePlatform = 'bluesky' | 'mastodon' | 'discord'

export interface FarEndTarget {
  postId: string
  userId: string
  platform: CheckablePlatform
  remoteId: string
  /** Discord only: the `post_destinations` row the post went to, from `posts.destinations.discord`. */
  destinationId?: string | null
}

export interface FarEndOutcome {
  target: FarEndTarget
  result: FarEndResult
}

/** A Mastodon account a post may have gone out from. The id is only meaningful on its own instance. */
export interface MastodonRef {
  host: string
  accountId: string | null
  token: string | null
}

export const BSKY_APPVIEW = 'https://public.api.bsky.app'
/** app.bsky.feed.getPosts accepts at most 25 URIs per call. */
export const BSKY_BATCH = 25
export const MAX_CHECKS_PER_RUN = 60
const TIMEOUT_MS = 10_000

const BSKY_POST_URI = /^at:\/\/did:[a-z0-9]+:[A-Za-z0-9._:%-]+\/app\.bsky\.feed\.post\/[A-Za-z0-9._~:-]+$/
const MASTODON_STATUS_ID = /^\d{1,20}$/
/** Discord snowflakes. A webhook post stores "discord-<timestamp>" instead, which never matches. */
const DISCORD_SNOWFLAKE = /^\d{15,25}$/
const HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/

export const isDiscordSnowflake = (s: unknown): s is string => typeof s === 'string' && DISCORD_SNOWFLAKE.test(s)

export const targetKey = (t: { postId: string; platform: string }) => `${t.postId}:${t.platform}`

/**
 * Splits one post's `platform_post_ids` into what can be checked for free and
 * the platforms that can't. A Bluesky id stored as a bare record key (some old
 * rows) has no DID to look it up by, so it counts as not checked.
 */
export function coverageForPost(post: { id: string; user_id: string; platform_post_ids: unknown; destinations?: unknown }): {
  targets: FarEndTarget[]
  unchecked: string[]
} {
  const ids = post.platform_post_ids
  if (!ids || typeof ids !== 'object' || Array.isArray(ids)) return { targets: [], unchecked: [] }
  const dest = post.destinations && typeof post.destinations === 'object' && !Array.isArray(post.destinations)
    ? (post.destinations as Record<string, unknown>)
    : {}
  const targets: FarEndTarget[] = []
  const unchecked: string[] = []
  for (const [platform, value] of Object.entries(ids as Record<string, unknown>)) {
    if (platform === 'bluesky' && typeof value === 'string' && BSKY_POST_URI.test(value)) {
      targets.push({ postId: post.id, userId: post.user_id, platform: 'bluesky', remoteId: value })
    } else if (platform === 'mastodon' && typeof value === 'string' && MASTODON_STATUS_ID.test(value)) {
      targets.push({ postId: post.id, userId: post.user_id, platform: 'mastodon', remoteId: value })
    } else if (platform === 'discord' && isDiscordSnowflake(value)) {
      const destinationId = typeof dest.discord === 'string' && dest.discord ? dest.discord : null
      targets.push({ postId: post.id, userId: post.user_id, platform: 'discord', remoteId: value, destinationId })
    } else {
      unchecked.push(platform)
    }
  }
  return { targets, unchecked }
}

/**
 * Most recent first, skipping anything already settled (found live or
 * missing on an earlier run), so each post is confirmed once and each missing
 * post alerts once. Unknowns are retried.
 */
export function pickTargets(targets: FarEndTarget[], settled: Set<string>, max = MAX_CHECKS_PER_RUN): FarEndTarget[] {
  return targets.filter(t => !settled.has(targetKey(t))).slice(0, max)
}

/** `connected_accounts.platform_user_id` is stored as "accountId@instance". */
export function mastodonRef(platformUserId: string | null | undefined, token: string | null | undefined): MastodonRef | null {
  if (!platformUserId) return null
  const at = platformUserId.indexOf('@')
  if (at < 0) return null
  const host = platformUserId.slice(at + 1).trim().toLowerCase()
  if (!HOSTNAME.test(host)) return null
  const accountId = platformUserId.slice(0, at).trim()
  return { host, accountId: accountId || null, token: token || null }
}

export function classifyMastodonStatus(httpStatus: number): FarEndResult {
  if (httpStatus === 200) return 'live'
  if (httpStatus === 404 || httpStatus === 410) return 'missing'
  return 'unknown'
}

/** Live if any instance has it, missing only if every instance answered that it's gone. */
export function combineResults(results: FarEndResult[]): FarEndResult {
  if (results.includes('live')) return 'live'
  if (results.length > 0 && results.every(r => r === 'missing')) return 'missing'
  return 'unknown'
}

/** Asks Bluesky's public AppView, in batches of 25. A failed call makes its whole batch unknown, never missing. */
export async function checkBluesky(uris: string[], fetchImpl: typeof fetch = fetch): Promise<Map<string, FarEndResult>> {
  const out = new Map<string, FarEndResult>()
  for (let i = 0; i < uris.length; i += BSKY_BATCH) {
    const batch = uris.slice(i, i + BSKY_BATCH)
    const query = batch.map(u => `uris=${encodeURIComponent(u)}`).join('&')
    let found: Set<string> | null = null
    try {
      const res = await fetchImpl(`${BSKY_APPVIEW}/xrpc/app.bsky.feed.getPosts?${query}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (res.ok) {
        const body = (await res.json()) as { posts?: Array<{ uri?: unknown }> }
        found = new Set((body.posts ?? []).map(p => p.uri).filter((u): u is string => typeof u === 'string'))
      }
    } catch {
      found = null
    }
    for (const uri of batch) out.set(uri, found === null ? 'unknown' : found.has(uri) ? 'live' : 'missing')
  }
  return out
}

/**
 * Asks each of the poster's Mastodon instances for the status, with their own
 * token so followers-only posts still answer. A 200 whose author isn't the
 * connected account is someone else's status with the same id, so it counts
 * as missing on that instance.
 */
export async function checkMastodon(refs: MastodonRef[], statusId: string, fetchImpl: typeof fetch = fetch): Promise<FarEndResult> {
  const results: FarEndResult[] = []
  for (const ref of refs) {
    try {
      const res = await fetchImpl(`https://${ref.host}/api/v1/statuses/${statusId}`, {
        headers: ref.token ? { Authorization: `Bearer ${ref.token}` } : {},
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      let result = classifyMastodonStatus(res.status)
      if (result === 'live' && ref.accountId) {
        const body = (await res.json().catch(() => null)) as { account?: { id?: unknown } } | null
        const author = body?.account?.id
        if (typeof author === 'string' && author !== ref.accountId) result = 'missing'
      }
      if (result === 'live') return 'live'
      results.push(result)
    } catch {
      results.push('unknown')
    }
  }
  return combineResults(results)
}

export function classifyDiscordStatus(httpStatus: number): FarEndResult {
  if (httpStatus === 200) return 'live'
  // 10008 Unknown Message, or 10003 Unknown Channel: either way the message is gone.
  if (httpStatus === 404) return 'missing'
  // 403 means the bot lost access to the channel, which says nothing about the message.
  return 'unknown'
}

/** The SocialMate bot reads back its own message. Needs View Channel and Read Message History, which the invite grants. */
export async function checkDiscord(channelId: string, messageId: string, botToken: string | null | undefined, fetchImpl: typeof fetch = fetch): Promise<FarEndResult> {
  if (!botToken || !isDiscordSnowflake(channelId) || !isDiscordSnowflake(messageId)) return 'unknown'
  try {
    const res = await fetchImpl(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return classifyDiscordStatus(res.status)
  } catch {
    return 'unknown'
  }
}

/** A link a person can open to see a Bluesky post. Mastodon's web paths vary by version, so none is guessed. */
export function publicUrl(target: FarEndTarget): string | null {
  if (target.platform !== 'bluesky') return null
  const m = target.remoteId.match(/^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/)
  return m ? `https://bsky.app/profile/${m[1]}/post/${m[2]}` : null
}

export function tally(outcomes: FarEndOutcome[]): Record<FarEndResult, number> {
  const t: Record<FarEndResult, number> = { live: 0, missing: 0, unknown: 0 }
  for (const o of outcomes) t[o.result]++
  return t
}

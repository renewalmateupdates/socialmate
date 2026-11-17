import crypto from 'crypto'
import { RetryablePublishError } from '@/lib/publish/retry'

/**
 * Shared plumbing for the three Meta integrations (Nov 2026):
 *
 *   • Instagram, through "Instagram API with Unified Login" (graph.facebook.com).
 *     Meta stopped offering "Instagram API with Instagram Login" to new apps, so
 *     this is Facebook Login for Business with an Instagram configuration: the
 *     person logs in with Instagram or Facebook, picks their Instagram account,
 *     and SocialMate gets a system-user token for it. No Facebook Page needed.
 *   • Facebook Pages, through Facebook Login for Business. Posts as the Page.
 *   • Threads, through the Threads API (graph.threads.net).
 *
 * All need Meta App Review (Advanced Access) before anyone outside the app's own
 * roles can connect. Until then Meta itself refuses strangers at its consent
 * screen, so the connect buttons stay hidden from the public behind
 * META_CONNECT_OPEN / NEXT_PUBLIC_META_CONNECT_OPEN (see metaConnectOpen below).
 *
 * Env:
 *   META_APP_ID, META_APP_SECRET            the Meta app (App settings > Basic)
 *   META_IG_CONFIG_ID                       Facebook Login for Business configuration
 *                                           for Instagram (system-user token, Instagram asset)
 *   META_FB_LOGIN_CONFIG_ID                 Facebook Login for Business configuration
 *                                           for Pages (user token, pages permissions)
 *   THREADS_APP_ID, THREADS_APP_SECRET      "Threads app ID/secret" shown under the
 *                                           Threads use case settings
 *   META_GRAPH_VERSION                      optional, defaults to v26.0
 *   THREADS_GRAPH_VERSION                   optional, defaults to v1.0
 *   META_CONNECT_OPEN=true                  let everyone connect (after App Review)
 *   NEXT_PUBLIC_META_CONNECT_OPEN=true      show the connect cards to everyone
 *   META_REVIEWER_EMAILS                    optional, comma-separated SocialMate login
 *                                           emails that may connect before App Review
 *                                           (the test login given to Meta's reviewers)
 */

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v26.0'

export const FB_GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`
export const THREADS_GRAPH = `https://graph.threads.net/${process.env.THREADS_GRAPH_VERSION || 'v1.0'}`

/** What SocialMate asks Threads for: who you are, and permission to post. No replies, insights or mentions. */
export const THREADS_SCOPES = ['threads_basic', 'threads_content_publish']

/**
 * What the Instagram configuration (META_IG_CONFIG_ID) asks for. Nothing that
 * reads DMs, comments or insights. business_management is required to list the
 * Instagram accounts the login shared (/me/assigned_instagram_accounts).
 */
export const INSTAGRAM_SCOPES = ['instagram_basic', 'instagram_content_publish', 'business_management']

/** What SocialMate asks Facebook for: list the Pages you manage, and post to them. */
export const FACEBOOK_SCOPES = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']

/**
 * Before App Review, only the admin (who has a role on the Meta app) and Meta's
 * own reviewers may start a connect. See canConnectMeta in lib/meta-access.ts.
 */
export function metaConnectOpen(): boolean {
  return process.env.META_CONNECT_OPEN === 'true'
}

/**
 * Meta's reviewers get access to the app while it is under review, but they log
 * in to SocialMate with an ordinary test login, so they would otherwise see the
 * "coming soon" cards. META_REVIEWER_EMAILS lists those test logins.
 */
export function isMetaReviewerEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const reviewers = (process.env.META_REVIEWER_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return reviewers.includes(email.trim().toLowerCase())
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
}

type MetaErrorBody = {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    error_user_title?: string
    error_user_msg?: string
  }
  error_message?: string
  error_type?: string
}

/**
 * Meta error codes that mean "not right now" rather than "never":
 * 1 unknown/transient, 2 service unavailable, 4 app rate limit, 17 user rate
 * limit, 32 page rate limit, 341 application limit, 613 calls exceeded.
 * lib/publish/retry.ts reschedules a post that fails with one of these.
 */
const TRANSIENT_CODES = new Set([1, 2, 4, 17, 32, 341, 613])

/** Instagram "reached the maximum number of posts" (24-hour publishing limit). */
const IG_PUBLISH_LIMIT_SUBCODE = 2207042

export class MetaApiError extends Error {
  readonly status: number
  readonly code?: number
  readonly subcode?: number
  constructor(message: string, status: number, code?: number, subcode?: number) {
    super(message)
    this.name = 'MetaApiError'
    this.status = status
    this.code = code
    this.subcode = subcode
  }
}

/**
 * Reads a failed Graph API response into an Error with a sentence a person can
 * act on. Transient failures come back as RetryablePublishError so a scheduled
 * post is tried again instead of being burned.
 */
export async function metaError(res: Response, platformName: string): Promise<Error> {
  const body = (await res.json().catch(() => ({}))) as MetaErrorBody
  const err = body.error ?? {}
  const raw = err.error_user_msg || err.message || body.error_message || `HTTP ${res.status}`
  const code = err.code
  const subcode = err.error_subcode

  if (code === 190 || res.status === 401) {
    return new MetaApiError(
      `${platformName} connection expired or was removed. Reconnect ${platformName} on the Accounts page.`,
      res.status, code, subcode,
    )
  }
  if (code === 10 || code === 200 || (code !== undefined && code >= 200 && code < 300)) {
    return new MetaApiError(
      `${platformName} refused permission (${raw}). Reconnect ${platformName} and allow posting.`,
      res.status, code, subcode,
    )
  }
  if (subcode === IG_PUBLISH_LIMIT_SUBCODE) {
    return new RetryablePublishError(`${platformName} daily publishing limit reached. SocialMate will try again later.`)
  }
  if ((code !== undefined && TRANSIENT_CODES.has(code)) || res.status >= 500) {
    return new RetryablePublishError(`${platformName} is busy right now (${raw}). SocialMate will try again.`)
  }
  return new MetaApiError(`${platformName} rejected the post: ${raw}`, res.status, code, subcode)
}

/** A short string safe to put in a redirect for the funnel's failure reasons. */
export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'unknown'
}

function base64UrlDecode(input: string): Buffer {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  return Buffer.from(b64 + pad, 'base64')
}

export type SignedRequestPayload = {
  algorithm?: string
  user_id?: string
  issued_at?: number
  [key: string]: unknown
}

/**
 * Verifies the `signed_request` Meta sends to the deauthorize and data deletion
 * callbacks: `<base64url HMAC-SHA256 signature>.<base64url JSON payload>`,
 * signed with the app secret. Threads callbacks are signed with the Threads app
 * secret and Facebook/Instagram ones with the Meta app secret, so both are tried. Returns null for anything that does not verify.
 */
export function parseSignedRequest(signedRequest: string | null | undefined): SignedRequestPayload | null {
  if (!signedRequest || !signedRequest.includes('.')) return null
  const [encodedSig, encodedPayload] = signedRequest.split('.', 2)
  if (!encodedSig || !encodedPayload) return null

  const secrets = [process.env.META_APP_SECRET, process.env.THREADS_APP_SECRET].filter(
    (s): s is string => typeof s === 'string' && s.length > 0,
  )
  const sig = base64UrlDecode(encodedSig)

  const verified = secrets.some(secret => {
    const expected = crypto.createHmac('sha256', secret).update(encodedPayload).digest()
    return expected.length === sig.length && crypto.timingSafeEqual(expected, sig)
  })
  if (!verified) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as SignedRequestPayload
    if (payload.algorithm && String(payload.algorithm).toUpperCase() !== 'HMAC-SHA256') return null
    return payload
  } catch {
    return null
  }
}

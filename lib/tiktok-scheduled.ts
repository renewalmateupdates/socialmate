/**
 * Hands a scheduled TikTok video to TikTok, and falls back to the creator's
 * drafts when TikTok refuses the direct post.
 *
 * Why the fallback exists: until TikTok's content sharing audit passes, a
 * direct post to a public TikTok account is refused with
 * `unaudited_client_can_only_post_to_private_accounts`. Every scheduled video
 * from a public account therefore failed at its scheduled time, stored TikTok's
 * raw "Please review our integration guidelines" text, and told nobody. The
 * first external creator to schedule one (Oct 6) got exactly that, and had a
 * second one queued behind it that would have failed the same way.
 *
 * The inbox endpoint is not gated by the audit, accepts the same verified
 * PULL_FROM_URL, and TikTok notifies the creator to finish the post in the app.
 * So a refused direct post now lands in their drafts at the time they picked,
 * which is what "Send to TikTok drafts" already does for an immediate post.
 *
 * Nothing needs flipping when the audit passes: the direct post starts
 * succeeding and the fallback simply stops running.
 *
 * Pure on purpose (fetch is injected, no database) so it can be exercised
 * against fake TikTok responses.
 */

export interface ScheduledTiktokPost {
  video_url: string | null
  post_caption: string | null
  sound_id: string | null
  privacy_level: string | null
  disable_duet: boolean | null
  disable_comment: boolean | null
  disable_stitch: boolean | null
  brand_content_toggle: boolean | null
  brand_organic_toggle: boolean | null
}

export type TiktokSendOutcome =
  | { kind: 'published'; postId: string }
  | { kind: 'in_drafts'; publishId: string; directCode: string }
  | { kind: 'failed'; code: string; message: string }

/**
 * Direct-post refusals the creator can still finish from their drafts. Both
 * are about who may see the post, which the creator picks for themselves in
 * the TikTok app when finishing a draft.
 */
export const DRAFTS_FALLBACK_CODES: ReadonlySet<string> = new Set([
  'unaudited_client_can_only_post_to_private_accounts',
  // The audience options TikTok offers are per creator and can change between
  // scheduling and posting, for example when the account is switched to private.
  'privacy_level_option_mismatch',
])

const DIRECT_INIT = 'https://open.tiktokapis.com/v2/post/publish/video/init/'
const INBOX_INIT  = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/'

type TiktokData = { publish_id?: string; publicaly_available_post_id?: string[] }
type CallResult = { ok: boolean; code: string; message: string; data: TiktokData }

async function callTiktok(fetchImpl: typeof fetch, url: string, token: string, body: unknown): Promise<CallResult> {
  try {
    const res = await fetchImpl(url, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
      body:    JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    // TikTok answers success with HTTP 200 and error.code 'ok'.
    const code: string = json?.error?.code ?? (res.ok ? 'ok' : `http_${res.status}`)
    return {
      ok:      res.ok && code === 'ok',
      code,
      message: String(json?.error?.message ?? ''),
      data:    (json?.data ?? {}) as TiktokData,
    }
  } catch (err) {
    return { ok: false, code: 'network_error', message: err instanceof Error ? err.message : String(err), data: {} }
  }
}

/** What to tell the creator, in their terms rather than TikTok's error codes. */
export function friendlyTiktokError(code: string, message: string): string {
  switch (code) {
    case 'unaudited_client_can_only_post_to_private_accounts':
      return 'TikTok will not let SocialMate post publicly yet, because our content sharing audit with TikTok is still pending.'
    case 'privacy_level_option_mismatch':
      return 'The audience you picked is no longer available on your TikTok account.'
    case 'spam_risk_too_many_pending_share':
      return 'TikTok allows at most 5 videos waiting in your drafts in a day. Post or delete some drafts in the TikTok app, then schedule this one again.'
    case 'spam_risk_too_many_posts':
      return 'Your TikTok account hit the daily limit for posts from apps. Schedule this one again for tomorrow.'
    case 'spam_risk_user_banned_from_posting':
      return 'TikTok is not allowing this account to post right now. Check the TikTok app for a notice.'
    case 'access_token_invalid':
    case 'scope_not_authorized':
      return 'Your TikTok connection has expired or is missing a permission. Reconnect TikTok on the Accounts page, then schedule this one again.'
    case 'url_ownership_unverified':
      return 'TikTok could not fetch the video from SocialMate. That is a problem on our side, not with your video.'
    case 'no_video':
      return 'The video for this post is missing, so there was nothing to send to TikTok.'
    default:
      return message ? `TikTok refused the post: ${message}` : `TikTok refused the post (${code}).`
  }
}

export async function sendScheduledTiktok(
  post: ScheduledTiktokPost,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TiktokSendOutcome> {
  if (!post.video_url) {
    return { kind: 'failed', code: 'no_video', message: friendlyTiktokError('no_video', '') }
  }

  const postInfo: Record<string, unknown> = {
    title:                    post.post_caption ?? '',
    privacy_level:            post.privacy_level ?? 'SELF_ONLY',
    disable_duet:             !!post.disable_duet,
    disable_comment:          !!post.disable_comment,
    disable_stitch:           !!post.disable_stitch,
    video_cover_timestamp_ms: 0,
  }
  if (post.sound_id && post.sound_id !== 'original') postInfo.music_id = post.sound_id
  // Commercial disclosure was collected at scheduling time and stored on the
  // row precisely so it survives to this later publish.
  if (post.brand_content_toggle || post.brand_organic_toggle) {
    postInfo.brand_content_toggle = !!post.brand_content_toggle
    postInfo.brand_organic_toggle = !!post.brand_organic_toggle
  }
  const sourceInfo = { source: 'PULL_FROM_URL', video_url: post.video_url }

  const direct = await callTiktok(fetchImpl, DIRECT_INIT, token, { post_info: postInfo, source_info: sourceInfo })
  if (direct.ok) {
    const id = direct.data.publicaly_available_post_id?.[0] ?? direct.data.publish_id ?? ''
    return { kind: 'published', postId: String(id) }
  }
  if (!DRAFTS_FALLBACK_CODES.has(direct.code)) {
    return { kind: 'failed', code: direct.code, message: friendlyTiktokError(direct.code, direct.message) }
  }

  // The inbox endpoint takes no post_info at all. Caption, audience and sound
  // are chosen by the creator in the TikTok app when they finish the draft.
  const inbox = await callTiktok(fetchImpl, INBOX_INIT, token, { source_info: sourceInfo })
  if (inbox.ok) {
    return { kind: 'in_drafts', publishId: String(inbox.data.publish_id ?? ''), directCode: direct.code }
  }
  return {
    kind:    'failed',
    code:    inbox.code,
    message: `${friendlyTiktokError(direct.code, direct.message)} Sending it to your TikTok drafts instead also failed. ${friendlyTiktokError(inbox.code, inbox.message)}`,
  }
}

/**
 * A scheduled video is copied into our storage so TikTok can pull it at the
 * scheduled time. Nothing removed that copy afterwards (only cancelling did),
 * so every scheduled video stayed in the media bucket for good: 146.7 MB across
 * 6 files by Oct 14, 2026, and each new one adds 25 to 50 MB.
 *
 * TikTok pulls the file within minutes of the send, so a day is a wide margin.
 * A failed video is kept a week in case someone looks into why it failed. A
 * video that is still scheduled or mid-send is never touched.
 */
export interface StagedTiktokRow {
  id: string
  status: string
  video_storage_path: string | null
  video_url: string | null
  scheduled_at: string | null
  created_at: string
}

export const STAGED_KEEP_AFTER_SEND_MS = 24 * 60 * 60 * 1000
export const STAGED_KEEP_AFTER_FAIL_MS = 7 * 24 * 60 * 60 * 1000

export function stagedFilesToClean(rows: StagedTiktokRow[], now: number = Date.now()): StagedTiktokRow[] {
  return rows.filter(row => {
    if (!row.video_storage_path) return false
    const sentAt = Date.parse(row.scheduled_at ?? row.created_at)
    if (!Number.isFinite(sentAt)) return false
    if (row.status === 'published' || row.status === 'in_drafts') return now - sentAt > STAGED_KEEP_AFTER_SEND_MS
    if (row.status === 'failed') return now - sentAt > STAGED_KEEP_AFTER_FAIL_MS
    return false
  })
}

/** Our proxy link to a staged file dies with the file. TikTok's own link, which replaces it once a post is live, is kept. */
export function isStagedVideoUrl(url: string | null): boolean {
  return !!url && url.includes('/api/tiktok/video/')
}

/** The in-app notice for a video that went to drafts instead of posting. */
export function draftsNotice(directCode: string, caption: string | null): { title: string; message: string } {
  const why = directCode === 'privacy_level_option_mismatch'
    ? 'The audience you picked is no longer available on your TikTok account'
    : 'TikTok has not approved SocialMate for public posts yet'
  const tail = caption?.trim() ? `\n\nYour caption, to paste in TikTok:\n${caption.trim()}` : ''
  return {
    title:   'Your TikTok video is waiting in your drafts',
    message: `${why}, so at your scheduled time the video went to your TikTok drafts instead. Open the TikTok app, tap the notification, then add your caption and post it.${tail}`,
  }
}

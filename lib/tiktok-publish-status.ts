import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Did TikTok actually publish it? One answer, used in two places:
 *
 *  - /api/tiktok/publish-status, which TikTok Studio polls every few seconds
 *    for two minutes after an upload, while the creator watches.
 *  - settleTiktokPublishes in lib/inngest.ts, which keeps asking after the
 *    creator leaves the page, and sweeps once a day for anything still open.
 *    It also settles scheduled videos and /api/tiktok/post's Post Now, which
 *    until Nov 18, 2026 were marked published the moment TikTok accepted the
 *    upload, before TikTok had pulled the file and decided.
 *
 * TikTok's Content Posting API is asynchronous. Uploading the bytes is not
 * publishing: TikTok processes the video on its own time, and
 * post/publish/status/fetch with the publish_id is the only way to learn
 * whether it accepted the video.
 *
 * Until Nov 18, 2026 only the Studio asked. A creator who closed the tab early,
 * or a video TikTok took more than two minutes to process, left the row on
 * 'publishing' for good, showing "Sending" in the Calendar and never mirrored
 * into posts, so the funnel, the first-post bonus and the streak never saw it.
 * Three rows from one creator were stuck that way when this was written.
 *
 * Client-safe: only type imports, so the Studio can read STUDIO_POLL_MS.
 */

export const TIKTOK_STATUS_URL = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/'

/** How long the Studio polls while the creator watches. */
export const STUDIO_POLL_MS = 2 * 60 * 1000

/**
 * When the follow-up job checks, each delay counted from the previous check:
 * 3, 13, 43 minutes and about 2.7 hours after the upload. The first lands just
 * after the Studio's own poll gives up. Each check costs two Inngest steps
 * (the sleep and the check), and most videos settle at the first.
 */
export const FOLLOW_UP_DELAYS_MS = [3 * 60 * 1000, 10 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000]

/** The daily sweep leaves rows younger than this to the follow-up job. */
export const SWEEP_MIN_AGE_MS = 10 * 60 * 1000

/** After a week of checks nobody can settle, say so instead of "Sending" forever. */
export const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export const NEVER_CONFIRMED =
  'TikTok never confirmed whether this video posted, and SocialMate stopped checking after a week. ' +
  'If it is not on your TikTok profile, post it again.'

const REJECTED_NO_REASON = 'TikTok rejected the video without giving a reason.'

/** What one status check found. */
export type TiktokPublishCheck =
  | { kind: 'published'; publicPostId: string | null }
  | { kind: 'failed'; reason: string | null }
  /** For an upload sent to the creator's drafts, this is the finish line. */
  | { kind: 'in_drafts' }
  /** PROCESSING_UPLOAD or PROCESSING_DOWNLOAD: ask again later. */
  | { kind: 'processing'; tiktokStatus: string | null }
  /** The check itself could not run. Says nothing about the video. */
  | { kind: 'unchecked'; httpStatus: number }

/** Reads TikTok's status payload. Pure, so it is tested without TikTok. */
export function readTiktokPublishStatus(payload: unknown): TiktokPublishCheck {
  const data = ((payload as { data?: unknown } | null)?.data ?? {}) as Record<string, unknown>
  const status = typeof data.status === 'string' ? data.status : null

  if (status === 'PUBLISH_COMPLETE') {
    // TikTok's docs spell the field "publicaly"; accept the other spelling too.
    const ids = data.publicaly_available_post_id ?? data.publicly_available_post_id
    return { kind: 'published', publicPostId: Array.isArray(ids) && ids.length ? String(ids[0]) : null }
  }
  if (status === 'FAILED') {
    const reason = typeof data.fail_reason === 'string' && data.fail_reason ? data.fail_reason : null
    return { kind: 'failed', reason }
  }
  if (status === 'SEND_TO_USER_INBOX') return { kind: 'in_drafts' }
  return { kind: 'processing', tiktokStatus: status }
}

/** Asks TikTok once. Never throws: a check that could not run is 'unchecked'. */
export async function fetchTiktokPublishStatus(
  publishId: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TiktokPublishCheck> {
  let res: Response
  try {
    res = await fetchImpl(TIKTOK_STATUS_URL, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ publish_id: publishId }),
    })
  } catch {
    return { kind: 'unchecked', httpStatus: 0 }
  }
  const payload = await res.json().catch(() => null)
  if (!res.ok || !payload) return { kind: 'unchecked', httpStatus: res.status }
  return readTiktokPublishStatus(payload)
}

export interface PublishingRow {
  id: string
  user_id: string
  workspace_id: string | null
  post_caption: string | null
}

export type SettledStatus = 'published' | 'failed' | 'in_drafts'

export interface RecordedCheck {
  /** The row's status after this check. */
  status: SettledStatus | 'publishing'
  settled: boolean
  /** True only for the call that moved the row off 'publishing'. */
  changed: boolean
  /** False when the write was refused, so our row may not say what TikTok said. */
  recorded: boolean
  reason: string | null
}

/**
 * Writes a check's outcome to tiktok_posts and, for a published video, mirrors
 * it into posts through `onPublished` (syncTiktokPublishToPosts; a parameter
 * so tests need no database).
 *
 * The update only applies while the row is still 'publishing'. When the
 * Studio's poll and the follow-up job settle the same video at once, exactly
 * one of them moves the row, and only that one mirrors it and notifies.
 *
 * Each write is checked: tiktok_posts.status has a CHECK constraint, and a
 * discarded 23514 once told the Studio a post had settled while the row stayed
 * on 'publishing'.
 */
export async function recordTiktokPublishCheck(
  db: SupabaseClient,
  row: PublishingRow,
  check: TiktokPublishCheck,
  openId: string | null,
  onPublished: (row: PublishingRow) => Promise<void>,
): Promise<RecordedCheck> {
  if (check.kind === 'processing' || check.kind === 'unchecked') {
    return { status: 'publishing', settled: false, changed: false, recorded: true, reason: null }
  }

  let status: SettledStatus
  let reason: string | null = null
  const patch: Record<string, unknown> = {}
  if (check.kind === 'published') {
    status = 'published'
    patch.error_message = null
    // The only link between our row and the video on TikTok's side.
    if (openId) patch.tiktok_account_open_id = openId
    if (check.publicPostId) patch.video_url = `https://www.tiktok.com/@/video/${check.publicPostId}`
  } else if (check.kind === 'failed') {
    status = 'failed'
    reason = check.reason
    patch.error_message = check.reason || REJECTED_NO_REASON
  } else {
    status = 'in_drafts'
    patch.error_message = null
  }
  patch.status = status

  const { data, error } = await db
    .from('tiktok_posts')
    .update(patch)
    .eq('id', row.id)
    .eq('status', 'publishing')
    .select('id')

  if (error) {
    console.error(`[tiktok-publish-status] could not record ${status} for ${row.id}:`, error.message)
    // Still TikTok's answer, so the Studio can tell the creator what happened.
    return { status, settled: true, changed: false, recorded: false, reason }
  }

  const changed = (data?.length ?? 0) > 0
  if (changed && status === 'published') await onPublished(row)
  return { status, settled: true, changed, recorded: true, reason }
}

/**
 * When the video went to TikTok: a scheduled post at its scheduled time (the
 * publisher sends it then, or within the hour), anything else when its row was
 * made. Ages are counted from here, never from created_at alone: a post
 * scheduled a week ahead would otherwise be given up on the moment it was sent.
 */
export function sentAt(row: { scheduled_at?: string | null; created_at: string }): string {
  return row.scheduled_at || row.created_at
}

/** Old enough for the daily sweep; younger uploads belong to the follow-up job. */
export function dueForSweep(sentAtIso: string, now: number): boolean {
  const t = Date.parse(sentAtIso)
  return Number.isFinite(t) && now - t >= SWEEP_MIN_AGE_MS
}

/** A row the follow-up could not settle within a week of sending it. */
export function shouldGiveUp(sentAtIso: string, now: number): boolean {
  const t = Date.parse(sentAtIso)
  return Number.isFinite(t) && now - t > GIVE_UP_AFTER_MS
}

/**
 * The notification for an outcome settled while the creator was not watching.
 * 'unconfirmed' is the week-long give-up.
 */
export function settledNotice(
  outcome: SettledStatus | 'unconfirmed',
  reason: string | null,
  caption: string | null,
): { type: 'post_published' | 'post_failed'; title: string; message: string } {
  const text = caption?.trim() ?? ''
  const which = text ? ` ("${text.length > 60 ? text.slice(0, 57).trimEnd() + '...' : text}")` : ''
  switch (outcome) {
    case 'published':
      return {
        type:    'post_published',
        title:   'Your TikTok video is live',
        message: `TikTok finished processing your video${which}, and it is on your profile now.`,
      }
    case 'in_drafts':
      return {
        type:    'post_published',
        title:   'Your TikTok video is in your drafts',
        message: `Your video${which} is waiting in your TikTok drafts. Open the TikTok app to add a sound if you want one, then post it.`,
      }
    case 'failed':
      return {
        type:    'post_failed',
        title:   'TikTok rejected your video',
        message: reason
          ? `TikTok did not publish your video${which}. The reason TikTok gave: ${reason}`
          : `TikTok did not publish your video${which} and gave no reason. Common causes are length, an unsupported format, or copyrighted audio.`,
      }
    case 'unconfirmed':
      return {
        type:    'post_failed',
        title:   'We could not confirm your TikTok video',
        message: `TikTok never told us whether your video${which} posted. If it is not on your TikTok profile, post it again.`,
      }
  }
}

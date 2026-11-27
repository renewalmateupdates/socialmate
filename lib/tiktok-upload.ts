/**
 * Getting a video's bytes where they need to go from TikTok Studio, on phone
 * connections that drop.
 *
 *  - uploadToTiktok sends a video to TikTok's upload_url piece by piece (the
 *    plan is lib/tiktok-chunks.ts) and resends a piece when the connection
 *    drops or TikTok answers 5xx. TikTok's Media Transfer Guide says to: "You
 *    should retry submitting this chunk."
 *  - putStagedVideo saves a video to our storage for a scheduled post, resends
 *    once on the same failures, and says what storage actually objected to.
 *  - confirmTiktokUpload records an upload TikTok already has, and finishes
 *    even if the page goes away first.
 *
 * Until Nov 19, 2026 one dropped piece failed the whole upload. Between Nov 15
 * and Nov 18 three phone uploads of 68 to 163 MB were cut off ("Load failed")
 * and the creator started each one over from zero; one 4 MB upload hit a
 * TikTok 500; and a scheduled video failed with only "Video upload failed
 * (400)", because storage's own explanation was thrown away.
 *
 * Client-safe and pure apart from fetch and sleep, which are passed in so the
 * tests run against a fake TikTok.
 */

/** Waits before each resend of the same piece; their count is the resend limit. */
export const RETRY_DELAYS_MS = [1500, 4000, 9000]

export type UploadOutcome =
  | { ok: true; resent: number }
  | { ok: false; code: string; message: string; resent: number }

type Sleep = (ms: number) => Promise<void>
const realSleep: Sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/** TikTok's progress header, "bytes 0-{last}/{total}": the last byte it has, or null. */
export function uploadedThrough(contentRange: string | null): number | null {
  const m = contentRange?.match(/bytes\s+\d+-(\d+)\/\d+/i)
  return m ? Number(m[1]) : null
}

export async function uploadToTiktok(opts: {
  url: string
  blob: Blob
  mimeType: string
  ranges: { start: number; end: number }[]
  fetchImpl?: typeof fetch
  sleep?: Sleep
  delays?: number[]
  onProgress?: (sentBytes: number, totalBytes: number) => void
}): Promise<UploadOutcome> {
  const { url, blob, mimeType, ranges } = opts
  const fetchImpl = opts.fetchImpl ?? fetch
  const sleep = opts.sleep ?? realSleep
  const delays = opts.delays ?? RETRY_DELAYS_MS
  const total = blob.size
  let resent = 0

  for (const { start, end } of ranges) {
    let attempt = 0
    let dropped = false
    for (;;) {
      let res: Response
      try {
        res = await fetchImpl(url, {
          method:  'PUT',
          body:    blob.slice(start, end + 1),
          headers: {
            'Content-Type':   mimeType,
            'Content-Range':  `bytes ${start}-${end}/${total}`,
            'Content-Length': String(end - start + 1),
          },
        })
      } catch (err) {
        // The connection dropped mid-piece ("Load failed" on Safari). TikTok
        // may or may not have the piece; resending it tells us which.
        dropped = true
        if (attempt < delays.length) { await sleep(delays[attempt++]); resent++; continue }
        const why = err instanceof Error ? err.message : 'network error'
        return {
          ok: false, code: 'upload_network', resent,
          message: `The upload to TikTok was cut off (${why}). Check your connection and try again.`,
        }
      }

      // 206 for a piece, 201 for the last one.
      if (res.ok) break

      if (res.status >= 500 && attempt < delays.length) { await sleep(delays[attempt++]); resent++; continue }

      // After a dropped attempt, 416 means TikTok's progress is already past
      // where we resent from: the earlier attempt landed and only its answer
      // was lost. If TikTok shows its progress, believe that instead.
      if (res.status === 416 && dropped) {
        const through = uploadedThrough(res.headers.get('content-range'))
        if (through === null || through >= end) break
      }

      const text = await res.text().catch(() => '')
      return {
        ok: false, code: `upload_http_${res.status}`, resent,
        message: `TikTok upload failed (${res.status})${text ? ': ' + text.slice(0, 200) : ''}`,
      }
    }
    opts.onProgress?.(end + 1, total)
  }
  return { ok: true, resent }
}

/**
 * Waits before each resend of a confirm whose answer never came back. The first
 * is longer than a confirm usually takes, so a resend rarely meets the original
 * still on its way through the route.
 */
export const CONFIRM_RETRY_DELAYS_MS = [3000, 8000]

/** What a creator is told when TikTok has the video and we could not record it. */
export const CONFIRM_LOST =
  'Your video reached TikTok, but SocialMate could not save the post. Check your TikTok profile before you post it again, so it does not go up twice.'

export type ConfirmOutcome =
  | { ok: true; data: Record<string, unknown>; resent: number }
  | { ok: false; code: string; message: string; resent: number }

/**
 * Records an upload TikTok already has (/api/tiktok/confirm-upload).
 *
 * Nov 25, 2026: a creator's upload finished, and the page went away before
 * this call came back ("Failed to fetch"). TikTok had the video, but SocialMate
 * kept no record of it, so nothing followed it up or told the creator what
 * TikTok decided, and the Studio's error read like a reason to post it again.
 * `keepalive` lets the request finish after the page is gone. The route answers
 * a confirm it already has as done, so resending one whose answer was lost
 * (a dropped connection, a 5xx) is safe.
 */
export async function confirmTiktokUpload(opts: {
  body: Record<string, unknown>
  fetchImpl?: typeof fetch
  sleep?: Sleep
  delays?: number[]
}): Promise<ConfirmOutcome> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const sleep = opts.sleep ?? realSleep
  const delays = opts.delays ?? CONFIRM_RETRY_DELAYS_MS
  let attempt = 0
  let resent = 0
  for (;;) {
    let res: Response
    try {
      res = await fetchImpl('/api/tiktok/confirm-upload', {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify(opts.body),
        keepalive: true,
      })
    } catch (err) {
      if (attempt < delays.length) { await sleep(delays[attempt++]); resent++; continue }
      const why = err instanceof Error ? err.message : 'network error'
      return { ok: false, code: 'confirm_network', resent, message: `${CONFIRM_LOST} (${why})` }
    }

    const text = await res.text().catch(() => '')
    let data: Record<string, unknown> = {}
    try {
      const parsed = text ? JSON.parse(text) : {}
      if (parsed && typeof parsed === 'object') data = parsed as Record<string, unknown>
    } catch { /* an error page: the status says enough */ }

    if (res.ok) return { ok: true, data, resent }
    if (res.status >= 500 && attempt < delays.length) { await sleep(delays[attempt++]); resent++; continue }

    const why = typeof data.error === 'string' && data.error ? data.error : `SocialMate answered ${res.status}`
    return { ok: false, code: String(data.code ?? `confirm_http_${res.status}`), resent, message: `${CONFIRM_LOST} (${why})` }
  }
}

/** Supabase Storage explains a refusal in a JSON body; keep its words. */
export function storageErrorDetail(body: string): { detail: string; tooLarge: boolean } {
  let detail = body.trim().slice(0, 160)
  let tooLarge = /maximum allowed size|payload too large|too large/i.test(body)
  try {
    const j = JSON.parse(body) as { message?: unknown; error?: unknown; statusCode?: unknown }
    const parts = [j.error, j.message].filter((p): p is string => typeof p === 'string' && p.length > 0)
    if (parts.length) detail = parts.join(': ').slice(0, 160)
    if (String(j.statusCode) === '413') tooLarge = true
  } catch { /* not JSON: keep the text */ }
  return { detail, tooLarge }
}

export const STAGE_TOO_LARGE =
  'This video is too big to save for scheduling. Post it now or send it to your TikTok drafts instead: those go straight to TikTok, which takes much bigger files.'

/**
 * Saves a video to a signed storage upload URL for a scheduled post. One
 * resend after a dropped connection or a 5xx; anything else is reported with
 * storage's own reason.
 */
export async function putStagedVideo(opts: {
  url: string
  blob: Blob
  mimeType: string
  fetchImpl?: typeof fetch
  sleep?: Sleep
  delays?: number[]
}): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const sleep = opts.sleep ?? realSleep
  const delays = opts.delays ?? [2000]
  let attempt = 0
  for (;;) {
    let res: Response
    try {
      res = await fetchImpl(opts.url, { method: 'PUT', body: opts.blob, headers: { 'Content-Type': opts.mimeType } })
    } catch (err) {
      if (attempt < delays.length) { await sleep(delays[attempt++]); continue }
      const why = err instanceof Error ? err.message : 'network error'
      return { ok: false, code: 'stage_network', message: `Saving your video was cut off (${why}). Check your connection and try again.` }
    }
    if (res.ok) return { ok: true }
    if (res.status >= 500 && attempt < delays.length) { await sleep(delays[attempt++]); continue }

    const { detail, tooLarge } = storageErrorDetail(await res.text().catch(() => ''))
    if (tooLarge || res.status === 413) return { ok: false, code: 'stage_too_large', message: STAGE_TOO_LARGE }
    return {
      ok: false, code: `stage_http_${res.status}`,
      message: `Video upload failed (${res.status}${detail ? `: ${detail}` : ''}). Try again, or post it now instead.`,
    }
  }
}

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

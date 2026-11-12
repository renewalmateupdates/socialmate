/**
 * Uploading a post's image or video, shared by Compose and the bulk scheduler.
 *
 * Both used to POST the file through /api/media/upload. A Vercel function
 * accepts at most 4.5 MB of request body, so any video over that, and many
 * phone photos, was refused before the route ran, and Compose said "check
 * your connection". Now the browser asks /api/media/upload-url for a signed
 * URL (same checks as before) and puts the file straight into storage, the
 * way TikTok Studio already did.
 */

export const MEDIA_ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/mov',
]

/** SocialMate's per-file cap, and what the publishers will fetch (lib/publish/video.ts). */
export const MEDIA_MAX_BYTES = 50 * 1024 * 1024

export type MediaUploadResult =
  | { ok: true; url: string; type: 'image' | 'video' }
  | { ok: false; error: string }

/** Browser only: puts one file in storage and returns its public URL. */
export async function uploadMediaFile(file: File): Promise<MediaUploadResult> {
  let res: Response
  try {
    res = await fetch('/api/media/upload-url', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: file.name, type: file.type, size: file.size }),
    })
  } catch {
    return { ok: false, error: 'Upload failed. Check your connection and try again.' }
  }
  const data = await res.json().catch(() => ({} as Record<string, unknown>))
  if (!res.ok || typeof data.signedUrl !== 'string' || typeof data.publicUrl !== 'string') {
    return { ok: false, error: typeof data.error === 'string' ? data.error : `Upload failed (${res.status}). Try again.` }
  }
  try {
    const put = await fetch(data.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    if (!put.ok) return { ok: false, error: `Upload failed (${put.status}). Try again.` }
  } catch {
    return { ok: false, error: 'Upload failed. Check your connection and try again.' }
  }
  return { ok: true, url: data.publicUrl, type: data.type === 'video' ? 'video' : 'image' }
}

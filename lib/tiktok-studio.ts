/**
 * Pure helpers shared by TikTok Studio (browser) and the TikTok post routes
 * (server). Keeping them in one place means the character count Studio shows
 * and the caption TikTok receives are the same string.
 */

export const TIKTOK_CAPTION_MAX = 2200

// A hashtag runs until whitespace, another #, or common punctuation. Written
// without Unicode property escapes because tsconfig targets ES5.
const HASHTAG_SOURCE = '#([^\\s#.,!?;:()\\[\\]{}"\'\\u2018\\u2019\\u201C\\u201D\\u2026]+)'

/** The hashtags already written in a caption, lowercased, without the #. */
export function captionHashtags(caption: string): string[] {
  const re = new RegExp(HASHTAG_SOURCE, 'g')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(caption || '')) !== null) out.push(m[1].toLowerCase())
  return out
}

/**
 * The Hashtags box's tags that still need adding: not already in the caption,
 * no repeats, in the order they were added. Matching ignores case, as TikTok does.
 */
export function tagsToAppend(caption: string, tags: string[]): string[] {
  const seen: Record<string, true> = {}
  for (const t of captionHashtags(caption)) seen[t] = true
  const out: string[] = []
  // Request bodies are untrusted: anything but an array means no tags.
  for (const raw of Array.isArray(tags) ? tags : []) {
    const tag = String(raw ?? '').trim().replace(/^#+/, '')
    const key = tag.toLowerCase()
    if (!tag || seen[key]) continue
    seen[key] = true
    out.push(tag)
  }
  return out
}

/**
 * The caption TikTok receives before the length cap: the caption, a blank line,
 * then the box's tags. Studio's counter measures this, so it can show going over.
 */
export function fullTikTokCaption(caption: string, tags: string[]): string {
  const extra = tagsToAppend(caption, tags).map(t => '#' + t).join(' ')
  return [caption, extra].filter(Boolean).join('\n\n')
}

/** What the routes send to TikTok as the post's title. */
export function buildTikTokCaption(caption: string, tags: string[]): string {
  return fullTikTokCaption(caption, tags).slice(0, TIKTOK_CAPTION_MAX)
}

// ── Cover frame ──────────────────────────────────────────────────────────────

export interface FrameLight {
  /** Mean brightness, 0 to 255. */
  luma: number
  /** Share of the sampled pixels brighter than 64, 0 to 1. */
  lit: number
}

/** Brightness of RGBA pixel data (as from getImageData), sampling every `step`th pixel. */
export function frameLight(rgba: ArrayLike<number>, step = 4): FrameLight {
  const stride = Math.max(1, Math.floor(step)) * 4
  let sum = 0
  let lit = 0
  let n = 0
  for (let i = 0; i + 2 < rgba.length; i += stride) {
    const y = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]
    sum += y
    if (y > 64) lit++
    n++
  }
  return n ? { luma: sum / n, lit: lit / n } : { luma: 0, lit: 0 }
}

/**
 * Reads as black: dark on average with almost nothing lit. A fade-in's first
 * frame, or a flat background before the text arrives, both qualify; a
 * dark-mode screen with text on it does not.
 */
export function isDarkFrame(f: FrameLight): boolean {
  return f.luma < 24 && f.lit < 0.02
}

/**
 * The cover to start with when a video's first frame is black: the earliest
 * sampled frame that isn't dark. Null means keep TikTok's default, the first
 * frame (nothing better was found, or no brightness was measured).
 */
export function defaultCoverTime(frames: { time: number; light?: FrameLight }[]): number | null {
  for (const f of frames) {
    if (f.light && !isDarkFrame(f.light)) return f.time
  }
  return null
}

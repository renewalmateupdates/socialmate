/**
 * Size math for the two image tools, /tools/quote-card and /tools/image-resizer.
 * Both draw on a canvas in the visitor's browser; nothing here touches the DOM,
 * so it is tested directly (scripts/test-image-tools.mjs).
 *
 * Pure, no imports.
 */

export interface ImagePreset {
  id: string
  /** Short name for buttons. */
  label: string
  /** What the size is for, in a few words. */
  use: string
  width: number
  height: number
}

/**
 * The sizes both tools export. YouTube and Pinterest are here because people
 * make images for them; SocialMate does not post to either yet, and the tool
 * pages say so.
 */
export const IMAGE_PRESETS: ImagePreset[] = [
  { id: 'x',         label: 'X',                 use: 'Post image',         width: 1600, height: 900 },
  { id: 'linkedin',  label: 'LinkedIn',          use: 'Post image',         width: 1200, height: 627 },
  { id: 'bluesky',   label: 'Bluesky',           use: 'Square post image',  width: 1000, height: 1000 },
  { id: 'discord',   label: 'Discord',           use: 'Embed image',        width: 1280, height: 720 },
  { id: 'youtube',   label: 'YouTube',           use: 'Thumbnail',          width: 1280, height: 720 },
  { id: 'tiktok',    label: 'TikTok',            use: 'Cover, 9:16',        width: 1080, height: 1920 },
  { id: 'pinterest', label: 'Pinterest',         use: 'Pin, 2:3',           width: 1000, height: 1500 },
  { id: 'square',    label: 'Square',            use: 'Anywhere, 1:1',      width: 1080, height: 1080 },
]

export function presetById(id: string): ImagePreset {
  return IMAGE_PRESETS.find(p => p.id === id) ?? IMAGE_PRESETS[0]
}

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5)

export interface Rect { x: number; y: number; w: number; h: number }
/** Where the crop sits inside the slack it can move in: 0 is left/top, 1 right/bottom. */
export interface Focus { x: number; y: number }

export const CENTER: Focus = { x: 0.5, y: 0.5 }

/**
 * The part of the source image that fills a width x height frame without
 * stretching ("crop to fill"). The crop keeps the frame's shape and is as big
 * as the source allows; `focus` slides it along whichever side has room.
 */
export function coverCrop(srcW: number, srcH: number, width: number, height: number, focus: Focus = CENTER): Rect {
  if (srcW <= 0 || srcH <= 0 || width <= 0 || height <= 0) return { x: 0, y: 0, w: Math.max(0, srcW), h: Math.max(0, srcH) }
  const frame = width / height
  let w = srcW
  let h = srcW / frame
  if (h > srcH) {
    h = srcH
    w = srcH * frame
  }
  return { x: (srcW - w) * clamp01(focus.x), y: (srcH - h) * clamp01(focus.y), w, h }
}

/**
 * Where the whole source image sits inside a width x height frame, scaled to
 * fit and centered ("fit"). The rest of the frame is background.
 */
export function containRect(srcW: number, srcH: number, width: number, height: number): Rect {
  if (srcW <= 0 || srcH <= 0 || width <= 0 || height <= 0) return { x: 0, y: 0, w: 0, h: 0 }
  const scale = Math.min(width / srcW, height / srcH)
  const w = srcW * scale
  const h = srcH * scale
  return { x: (width - w) / 2, y: (height - h) / 2, w, h }
}

/**
 * Moves the crop after a drag on a preview. The preview shows the crop
 * `previewWidth` pixels wide; dragging the picture right by `dx` moves the
 * crop left, so the picture follows the finger. An axis with no room to move
 * keeps its focus.
 */
export function dragFocus(
  focus: Focus,
  dx: number,
  dy: number,
  srcW: number,
  srcH: number,
  width: number,
  height: number,
  previewWidth: number,
): Focus {
  const crop = coverCrop(srcW, srcH, width, height, focus)
  if (previewWidth <= 0 || crop.w <= 0) return focus
  const sourcePerPreviewPx = crop.w / previewWidth
  const slackX = srcW - crop.w
  const slackY = srcH - crop.h
  const x = slackX > 0.5 ? clamp01((crop.x - dx * sourcePerPreviewPx) / slackX) : focus.x
  const y = slackY > 0.5 ? clamp01((crop.y - dy * sourcePerPreviewPx) / slackY) : focus.y
  return { x, y }
}

/** Which way a crop can be dragged, for the hint under each preview. */
export function cropAxis(srcW: number, srcH: number, width: number, height: number): 'x' | 'y' | null {
  const crop = coverCrop(srcW, srcH, width, height)
  if (srcW - crop.w > 0.5) return 'x'
  if (srcH - crop.h > 0.5) return 'y'
  return null
}

/** A preview's size: the frame's shape, no wider than maxW and no taller than maxH. */
export function previewSize(width: number, height: number, maxW: number, maxH: number): { w: number; h: number } {
  if (width <= 0 || height <= 0 || maxW <= 0 || maxH <= 0) return { w: 0, h: 0 }
  const scale = Math.min(maxW / width, maxH / height)
  return { w: Math.round(width * scale), h: Math.round(height * scale) }
}

/** "quote-card-x-1600x900.png": the tool, the preset and the size, so a folder of them sorts. */
export function exportFileName(tool: string, preset: ImagePreset, ext: 'png' | 'jpg'): string {
  const safe = tool.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image'
  return `${safe}-${preset.id}-${preset.width}x${preset.height}.${ext}`
}

// ── Quote card text ──────────────────────────────────────────────────────────

/** The font-size choices, as a share of the card's shorter side. */
export const QUOTE_SIZES = [
  { id: 's',  label: 'S',  share: 0.06 },
  { id: 'm',  label: 'M',  share: 0.08 },
  { id: 'l',  label: 'L',  share: 0.1 },
  { id: 'xl', label: 'XL', share: 0.125 },
] as const

export type QuoteSize = typeof QUOTE_SIZES[number]['id']

export const QUOTE_MAX_CHARS = 600

/**
 * Breaks text into lines no wider than maxWidth. `measure` gives a string's
 * width at the current font. A word longer than a whole line is broken by
 * characters rather than allowed to run off the card. Blank lines are kept.
 */
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const out: string[] = []
  for (const para of text.replace(/\r\n?/g, '\n').split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) { out.push(''); continue }
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (measure(candidate) <= maxWidth) { line = candidate; continue }
      if (line) out.push(line)
      if (measure(word) <= maxWidth) { line = word; continue }
      // One word wider than the card: break it by characters.
      let piece = ''
      for (const ch of Array.from(word)) {
        if (piece && measure(piece + ch) > maxWidth) { out.push(piece); piece = ch } else { piece += ch }
      }
      line = piece
    }
    out.push(line)
  }
  // Leading and trailing blank lines only push the quote off center.
  while (out.length && out[0] === '') out.shift()
  while (out.length && out[out.length - 1] === '') out.pop()
  return out
}

/**
 * The biggest font, starting from `startPx` and stepping down to `minPx`, at
 * which the wrapped quote fits in maxHeight. `measureAt(px)` returns a measure
 * for that size. At minPx it returns whatever fits and marks the rest cut.
 */
export function fitQuote(
  text: string,
  maxWidth: number,
  maxHeight: number,
  startPx: number,
  minPx: number,
  lineHeight: number,
  measureAt: (px: number) => (s: string) => number,
): { px: number; lines: string[]; cut: boolean } {
  const start = Math.max(1, Math.round(startPx))
  const min = Math.max(1, Math.min(start, Math.round(minPx)))
  for (let px = start; px >= min; px = px > min ? Math.max(min, Math.floor(px * 0.92)) : min - 1) {
    const lines = wrapLines(text, maxWidth, measureAt(px))
    if (lines.length * px * lineHeight <= maxHeight || px === min) {
      const fits = Math.max(1, Math.floor(maxHeight / (px * lineHeight)))
      if (lines.length <= fits) return { px, lines, cut: false }
      const kept = lines.slice(0, fits)
      kept[fits - 1] = `${kept[fits - 1].replace(/[\s.,;:!?]*$/, '')}…`
      return { px, lines: kept, cut: true }
    }
  }
  return { px: min, lines: [], cut: true }
}

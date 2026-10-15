/**
 * Splits long text into a numbered thread that fits each platform's limit,
 * counted the way that platform counts it. Powers the free /tools/thread-splitter.
 *
 * Pure, no imports, so it can be checked without the app running.
 */

export type ThreadPlatform = 'x' | 'bluesky' | 'mastodon'
export type Numbering = 'suffix' | 'prefix' | 'none'

export const THREAD_PLATFORMS: Record<ThreadPlatform, { label: string; limit: number; how: string }> = {
  x:        { label: 'X',        limit: 280, how: 'Most CJK characters and emoji count as 2, and every link counts as 23.' },
  bluesky:  { label: 'Bluesky',  limit: 300, how: 'Counts what you see as one character, so an emoji is 1. Links count in full.' },
  mastodon: { label: 'Mastodon', limit: 500, how: 'Most servers allow 500. Every link counts as 23.' },
}

export interface ThreadPart {
  text: string
  length: number
}

const URL_RE = /https?:\/\/[^\s]+/g
// X's ranges of code points that count as one (twitter-text v3). Everything
// else counts as two.
const X_SINGLE: [number, number][] = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]]
// Built at runtime rather than as a /u literal: the project type-checks against
// ES5, and a browser too old for property escapes gets a rougher emoji test
// instead of a page that fails to load.
const PICTOGRAPHIC = (() => {
  try { return new RegExp('\\p{Extended_Pictographic}', 'u') } catch { return /[☀-➿\uD83C-\uDBFF]/ }
})()

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

function graphemes(text: string): string[] {
  return segmenter ? Array.from(segmenter.segment(text), s => s.segment) : Array.from(text)
}

function xLength(text: string): number {
  let total = 0
  const rest = text.normalize('NFC').replace(URL_RE, () => { total += 23; return ' ' })
  // The space left where each link was is not part of the count.
  total -= (text.match(URL_RE) ?? []).length
  for (const g of graphemes(rest)) {
    if (PICTOGRAPHIC.test(g)) { total += 2; continue }
    for (const ch of Array.from(g)) {
      const cp = ch.codePointAt(0) ?? 0
      total += X_SINGLE.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2
    }
  }
  return total
}

/** Length the way the platform's own counter would show it. */
export function measure(text: string, platform: ThreadPlatform): number {
  if (platform === 'x') return xLength(text)
  if (platform === 'bluesky') return graphemes(text).length
  return Array.from(text.replace(URL_RE, 'x'.repeat(23))).length
}

// A sentence ends at . ! ? or an ellipsis followed by whitespace, so "3.5" and
// "socialmate.studio" stay whole. The paragraph is cut into consecutive slices,
// so every character lands in one: an earlier version matched sentences with a
// regex and silently dropped any text it could not match. No lookbehind
// either: older iPhones cannot parse it, and a regex error takes the page down.
const SENTENCE_END = /[.!?…]+["'”’)\]]*\s+/g

function sentencesOf(paragraph: string): string[] {
  const out: string[] = []
  let start = 0
  for (const m of Array.from(paragraph.matchAll(SENTENCE_END))) {
    const end = (m.index ?? 0) + m[0].length
    out.push(paragraph.slice(start, end))
    start = end
  }
  out.push(paragraph.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** Greedily fills each part, breaking at paragraphs, then sentences, then words, then characters. */
function pack(text: string, budget: number, platform: ThreadPlatform): string[] {
  const parts: string[] = []
  let current = ''
  const fits = (s: string) => measure(s, platform) <= budget
  const flush = () => { if (current.trim()) parts.push(current.trim()); current = '' }

  const add = (piece: string, joiner: string, level: 0 | 1 | 2) => {
    const candidate = current ? current + joiner + piece : piece
    if (fits(candidate)) { current = candidate; return }
    if (level === 2) { flush(); current = piece; return }
    flush()
    if (fits(piece)) { current = piece; return }
    if (level === 0) {
      piece.split(/\s+/).filter(Boolean).forEach(w => add(w, ' ', 1))
      return
    }
    // One word longer than a whole post, usually a long URL on Bluesky:
    // nothing to do but cut it.
    let chunk = ''
    for (const g of graphemes(piece)) {
      if (chunk && !fits(chunk + g)) { add(chunk, '', 2); chunk = '' }
      chunk += g
    }
    if (chunk) add(chunk, '', 2)
  }

  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  paragraphs.forEach((paragraph, pi) => {
    sentencesOf(paragraph).forEach((sentence, si) => {
      add(sentence, si === 0 ? (pi === 0 ? '' : '\n\n') : ' ', 0)
    })
  })
  flush()
  return parts
}

/**
 * The thread. Numbering ("1/5") is counted against the limit too: the space it
 * needs depends on how many parts there are, so the split is redone if adding
 * a digit to the total changes the answer.
 */
export function splitThread(raw: string, platform: ThreadPlatform, numbering: Numbering = 'suffix'): ThreadPart[] {
  const text = raw.replace(/\r\n?/g, '\n').trim()
  if (!text) return []
  const limit = THREAD_PLATFORMS[platform].limit

  let digits = 1
  let chunks: string[] = []
  for (let attempt = 0; attempt < 4; attempt++) {
    const reserve = numbering === 'none' ? 0 : 2 * digits + 2 // "12/12" plus its space
    chunks = pack(text, limit - reserve, platform)
    const needed = String(chunks.length).length
    if (numbering === 'none' || needed <= digits) break
    digits = needed
  }

  const n = chunks.length
  return chunks.map((chunk, i) => {
    const label = `${i + 1}/${n}`
    const text = numbering === 'none' || n === 1 ? chunk
      : numbering === 'prefix' ? `${label} ${chunk}`
      : `${chunk} ${label}`
    return { text, length: measure(text, platform) }
  })
}

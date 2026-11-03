// LinkedIn post formatter: LinkedIn posts are plain text, so "bold" and
// "italic" are really Unicode look-alike letters (the Mathematical Sans-Serif
// block). Pure functions so they can be tested (scripts/test-linkedin-format.mjs).
//
// Sans-serif variants are used because they sit closest to LinkedIn's own font.
// That block has no gaps, unlike the serif italic one (which skips "h").

export type TextStyle = 'bold' | 'italic' | 'boldItalic'

// First code point of A, a and 0 in each style. Italic has no digits.
const BASES: Record<TextStyle, { upper: number; lower: number; digit: number | null }> = {
  bold:       { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  italic:     { upper: 0x1d608, lower: 0x1d622, digit: null },
  boldItalic: { upper: 0x1d63c, lower: 0x1d656, digit: null },
}

/** Rewrites A–Z, a–z (and 0–9 for bold) in a style; everything else is left as is. */
export function styleText(text: string, style: TextStyle): string {
  const base = BASES[style]
  let out = ''
  for (const ch of plainText(text)) {
    const c = ch.codePointAt(0)!
    if (c >= 65 && c <= 90) out += String.fromCodePoint(base.upper + c - 65)
    else if (c >= 97 && c <= 122) out += String.fromCodePoint(base.lower + c - 97)
    else if (c >= 48 && c <= 57 && base.digit) out += String.fromCodePoint(base.digit + c - 48)
    else out += ch
  }
  return out
}

// Every styled letter and digit this tool writes, back to plain ASCII.
const PLAIN = new Map<number, string>()
for (const base of Object.values(BASES)) {
  for (let i = 0; i < 26; i++) {
    PLAIN.set(base.upper + i, String.fromCharCode(65 + i))
    PLAIN.set(base.lower + i, String.fromCharCode(97 + i))
  }
  if (base.digit) for (let i = 0; i < 10; i++) PLAIN.set(base.digit + i, String(i))
}

/** Undoes styleText for any style, so text can be re-styled or cleared. */
export function plainText(text: string): string {
  let out = ''
  for (const ch of text) out += PLAIN.get(ch.codePointAt(0)!) ?? ch
  return out
}

export type ListKind = 'dot' | 'number' | 'arrow' | 'check'

const LIST_PREFIX = /^\s*(?:(?:•|→|✅|▪\uFE0E?|-)\s+|\d{1,2}[.)]\s+)/

/** Turns each non-empty line into a list item, replacing any list marker it already had. */
export function toList(text: string, kind: ListKind): string {
  let n = 0
  return text
    .split('\n')
    .map((line) => {
      if (!line.trim()) return line
      const body = line.replace(LIST_PREFIX, '').trim()
      n++
      const marker = kind === 'number' ? `${n}.` : kind === 'arrow' ? '→' : kind === 'check' ? '✅' : '•'
      return `${marker} ${body}`
    })
    .join('\n')
}

/** LinkedIn's limit for a post. */
export const LINKEDIN_POST_LIMIT = 3000

/**
 * Length as LinkedIn is likely to count it. Styled letters are two UTF-16
 * units each, so they are counted as two: the safe side of the limit.
 */
export function linkedinLength(text: string): number {
  return text.length
}

/**
 * Roughly where LinkedIn cuts a post with "…see more" on a computer: about the
 * first 200 characters, or the third line break, whichever comes first. Phones
 * cut a little earlier. Approximate by nature; LinkedIn does not publish it.
 */
export const SEE_MORE_CHARS = 200

export function seeMoreCut(text: string): number {
  let lines = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n' && ++lines === 3) return Math.min(i, SEE_MORE_CHARS)
  }
  return Math.min(text.length, SEE_MORE_CHARS)
}

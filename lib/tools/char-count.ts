// Character counts for every platform at once, for /tools/character-counter.
//
// X, Bluesky and Mastodon reuse the thread splitter's counters, which follow
// each platform's published rules. Where a platform does not publish how it
// counts, this counts the strict way (UTF-16 units, so an emoji is 2): a green
// number then always fits, at worst with a few characters to spare.

import { measure } from './thread-splitter'

export type CountPlatform =
  | 'x' | 'bluesky' | 'mastodon' | 'linkedin' | 'tiktok'
  | 'discord' | 'telegram' | 'telegramCaption' | 'threads' | 'instagram'

export interface PlatformLimit {
  id: CountPlatform
  label: string
  limit: number
  /** How this platform counts, in one line. */
  how: string
  /** Whether SocialMate posts there. Shown, so nobody reads the counter as a promise. */
  inSocialMate: boolean
}

export const COUNT_PLATFORMS: PlatformLimit[] = [
  { id: 'x',               label: 'X post',            limit: 280,  inSocialMate: true,  how: 'Most CJK characters and emoji count as 2, and every link counts as 23. Paid X accounts can post longer.' },
  { id: 'bluesky',         label: 'Bluesky post',      limit: 300,  inSocialMate: true,  how: 'Counts what you see as one character, so an emoji is 1. Links count in full.' },
  { id: 'mastodon',        label: 'Mastodon post',     limit: 500,  inSocialMate: true,  how: 'Most servers allow 500, some more. Every link counts as 23.' },
  { id: 'linkedin',        label: 'LinkedIn post',     limit: 3000, inSocialMate: true,  how: 'Counted strictly here: emoji and styled letters as 2.' },
  { id: 'tiktok',          label: 'TikTok caption',    limit: 2200, inSocialMate: true,  how: 'The limit for captions posted through TikTok\'s API, which schedulers use. The TikTok app allows longer.' },
  { id: 'discord',         label: 'Discord message',   limit: 2000, inSocialMate: true,  how: 'The limit for bots and regular accounts. Nitro raises it for people typing by hand.' },
  { id: 'telegram',        label: 'Telegram message',  limit: 4096, inSocialMate: true,  how: 'Counted strictly here: emoji as 2.' },
  { id: 'telegramCaption', label: 'Telegram caption',  limit: 1024, inSocialMate: true,  how: 'Text sent with a photo or video has a lower limit than a plain message.' },
  { id: 'threads',         label: 'Threads post',      limit: 500,  inSocialMate: false, how: 'Counted strictly here: emoji as 2.' },
  { id: 'instagram',       label: 'Instagram caption', limit: 2200, inSocialMate: false, how: 'Counted strictly here: emoji as 2.' },
]

/** Length as the platform is likely to count it (see the note at the top). */
export function countFor(text: string, id: CountPlatform): number {
  if (id === 'x' || id === 'bluesky' || id === 'mastodon') return measure(text, id)
  return text.length
}

export interface CountRow extends PlatformLimit {
  count: number
  left: number
  fits: boolean
}

export function countAll(text: string): CountRow[] {
  return COUNT_PLATFORMS.map(p => {
    const count = countFor(text, p.id)
    return { ...p, count, left: p.limit - count, fits: count <= p.limit }
  })
}

export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  hashtags: number
}

export function textStats(text: string): TextStats {
  const trimmed = text.trim()
  return {
    characters: Array.from(text).length,
    charactersNoSpaces: Array.from(text.replace(/\s/g, '')).length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: text ? text.split('\n').length : 0,
    hashtags: (text.match(/(^|\s)#[^\s#]+/g) ?? []).length,
  }
}

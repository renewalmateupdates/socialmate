/**
 * A saved draft's poll, read back into Compose (Nov 19, 2026).
 *
 * Compose saves `poll_data` ({ options, duration }) with a draft, and the poll
 * panel promises "Poll data is saved with the post". Reopening the draft never
 * read it back, so the panel came up empty and the next save wrote null over
 * the poll. Pure, so scripts/test-compose-poll.mjs can run it in node.
 */

export const POLL_DURATIONS = ['1h', '6h', '1d', '3d', '7d'] as const
export type PollDuration = (typeof POLL_DURATIONS)[number]

/** The poll as Compose's panel holds it (2 to 4 option boxes), or null when the draft has none. */
export function draftPoll(raw: unknown): { options: string[]; duration: PollDuration } | null {
  if (!raw || typeof raw !== 'object') return null
  const { options, duration } = raw as { options?: unknown; duration?: unknown }
  if (!Array.isArray(options)) return null
  const texts = options.filter((o): o is string => typeof o === 'string').slice(0, 4)
  if (texts.length === 0) return null
  while (texts.length < 2) texts.push('')
  const known = (POLL_DURATIONS as readonly unknown[]).includes(duration)
  return { options: texts, duration: known ? (duration as PollDuration) : '1d' }
}

/**
 * Discord timestamp tags (<t:1760486400:F>). Discord shows each one in the
 * reader's own time zone, which is why they beat typing "8pm EST" into an
 * announcement. Powers the free /tools/discord-timestamp.
 *
 * Pure, no imports, so it can be checked without the app running.
 */

export type DiscordStyle = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'

export const DISCORD_STYLES: { style: DiscordStyle; label: string }[] = [
  { style: 'F', label: 'Long date and time' },
  { style: 'f', label: 'Date and time (the default)' },
  { style: 'D', label: 'Long date' },
  { style: 'd', label: 'Short date' },
  { style: 't', label: 'Short time' },
  { style: 'T', label: 'Long time' },
  { style: 'R', label: 'Relative' },
]

export function discordTag(unixSeconds: number, style: DiscordStyle): string {
  return style === 'f' ? `<t:${unixSeconds}>` : `<t:${unixSeconds}:${style}>`
}

/** Seconds since 1970 for a date and time typed into the page, read in the viewer's own time zone. */
export function unixFromLocal(date: string, time: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) return null
  const ms = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`).getTime()
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
]

/** "in 3 hours", "2 days ago": the largest whole unit, the way Discord words it. */
export function relativeText(unixSeconds: number, nowMs: number, locale = 'en-US'): string {
  const diff = unixSeconds - Math.round(nowMs / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(diff) >= size || unit === 'second') return rtf.format(Math.round(diff / size), unit)
  }
  return rtf.format(0, 'second')
}

/** Roughly how Discord renders each style for someone in `timeZone`. */
export function previewDiscord(
  unixSeconds: number,
  style: DiscordStyle,
  nowMs: number,
  locale = 'en-US',
  timeZone?: string,
): string {
  const d = new Date(unixSeconds * 1000)
  const tz = timeZone ? { timeZone } : {}
  const time = (seconds: boolean) =>
    d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), ...tz })
  const longDate = d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', ...tz })
  switch (style) {
    case 't': return time(false)
    case 'T': return time(true)
    case 'd': return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit', ...tz })
    case 'D': return longDate
    case 'f': return `${longDate} ${time(false)}`
    case 'F': return `${d.toLocaleDateString(locale, { weekday: 'long', ...tz })}, ${longDate} ${time(false)}`
    case 'R': return relativeText(unixSeconds, nowMs, locale)
  }
}

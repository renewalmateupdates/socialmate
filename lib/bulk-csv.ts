/**
 * CSV import for the Bulk Scheduler (Nov 13, 2026).
 *
 * One row per post. Columns, matched by header name in any order and case:
 *   content    (required) the post text
 *   date       YYYY-MM-DD, or M/D/YYYY as Excel and Google Sheets write it
 *   time       24-hour 09:00, or 12-hour 9:00 AM
 *   platforms  separated by ; | or spaces, e.g. "bluesky; linkedin". x means twitter
 *
 * Pure functions, no DOM, so scripts/test-bulk-csv.mjs can run them in node.
 */

export type CsvPost = { content: string; date: string; time: string; platforms: string[]; problem?: string }

export type CsvResult = {
  posts: CsvPost[]
  /** Why the file as a whole could not be read, if it could not. */
  error?: string
  /** Platform names in the file that bulk scheduling does not post to. */
  unknownPlatforms: string[]
  /** Rows dropped because their content was empty. */
  skippedEmpty: number
}

/** RFC 4180-style parsing: quoted fields may hold commas, quotes ("") and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ }
        else quoted = false
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') { quoted = true; continue }
    if (ch === ',') { row.push(field); field = ''; continue }
    if (ch === '\r') continue
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue }
    field += ch
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

const PLATFORM_ALIASES: Record<string, string> = { x: 'twitter', 'twitter/x': 'twitter', 'x/twitter': 'twitter' }

function normalizeDate(raw: string): string | null {
  const s = raw.trim()
  if (!s) return ''
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) return toIso(+m[1], +m[2], +m[3])
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
  if (m) return toIso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[1], +m[2])
  return null
}

function toIso(y: number, mo: number, d: number): string | null {
  const date = new Date(Date.UTC(y, mo - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function normalizeTime(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!s) return ''
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s?(am|pm)?$/)
  if (!m) return null
  let h = +m[1]
  const min = m[2] ? +m[2] : 0
  const ampm = m[3]
  if (min > 59) return null
  if (ampm) {
    if (h < 1 || h > 12) return null
    if (ampm === 'pm' && h !== 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
  } else if (!m[2] || h > 23) {
    return null
  }
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/**
 * Turn a CSV file into bulk rows. `allowed` is the platforms bulk posts to;
 * the defaults fill a row that leaves platforms or time blank.
 */
export function parseBulkCsv(
  text: string,
  opts: { allowed: string[]; defaultPlatforms: string[]; defaultTime: string },
): CsvResult {
  const table = parseCsv(text)
  if (table.length === 0) return { posts: [], error: 'The file is empty.', unknownPlatforms: [], skippedEmpty: 0 }

  const header = table[0].map(h => h.trim().toLowerCase())
  const col = (names: string[]) => header.findIndex(h => names.includes(h))
  const iContent   = col(['content', 'text', 'post', 'caption'])
  const iDate      = col(['date', 'day'])
  const iTime      = col(['time'])
  const iPlatforms = col(['platforms', 'platform'])
  if (iContent === -1) {
    return { posts: [], error: 'No "content" column. The first row needs headers: content, date, time, platforms.', unknownPlatforms: [], skippedEmpty: 0 }
  }

  const allowed = new Set(opts.allowed)
  const unknown = new Set<string>()
  const posts: CsvPost[] = []
  let skippedEmpty = 0

  for (const r of table.slice(1)) {
    const content = (r[iContent] ?? '').trim()
    if (!content) { skippedEmpty++; continue }

    const problems: string[] = []
    const date = iDate === -1 ? '' : normalizeDate(r[iDate] ?? '')
    if (date === null) problems.push(`date "${(r[iDate] ?? '').trim()}" isn't a date`)
    const time = iTime === -1 ? '' : normalizeTime(r[iTime] ?? '')
    if (time === null) problems.push(`time "${(r[iTime] ?? '').trim()}" isn't a time`)

    let platforms = opts.defaultPlatforms
    const rawPlatforms = iPlatforms === -1 ? '' : (r[iPlatforms] ?? '').trim()
    if (rawPlatforms) {
      const names = rawPlatforms.toLowerCase().split(/[;|\s]+/).filter(Boolean).map(n => PLATFORM_ALIASES[n] ?? n)
      platforms = Array.from(new Set(names.filter(n => allowed.has(n))))
      names.filter(n => !allowed.has(n)).forEach(n => unknown.add(n))
      if (platforms.length === 0) problems.push('no platform bulk posting supports')
    }

    posts.push({
      content,
      date: date || '',
      time: time || opts.defaultTime,
      platforms,
      ...(problems.length ? { problem: problems.join('; ') } : {}),
    })
  }

  return { posts, unknownPlatforms: Array.from(unknown), skippedEmpty }
}

/** A starter file with the headers and two example rows. */
export function bulkCsvTemplate(): string {
  return [
    'content,date,time,platforms',
    '"Your first post. Commas are fine inside quotes, like this.",2026-12-01,09:00,bluesky;linkedin',
    'Your second post,12/2/2026,5:30 PM,discord',
  ].join('\r\n') + '\r\n'
}

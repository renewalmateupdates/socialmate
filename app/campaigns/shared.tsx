// Display helpers shared by the Campaigns list and a single campaign's page.

// Monday first, the way people read a week; values are JS day numbers (0 = Sunday).
export const DAY_ORDER: [number, string][] = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']]

export const PLATFORM_NAMES: Record<string, string> = {
  bluesky:  'Bluesky',
  mastodon: 'Mastodon',
  discord:  'Discord',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  twitter:  'X',
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function fmtDay(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** "Mon, Wed, Fri at 10:00 AM · Oct 27 to Nov 24" */
export function scheduleSummary(c: { days: number[]; times: string[]; start_date: string; end_date: string }): string {
  const days = DAY_ORDER.filter(([d]) => c.days.includes(d)).map(([, label]) => label)
  const dayText = days.length === 7 ? 'Every day' : days.length === 5 && !c.days.includes(0) && !c.days.includes(6) ? 'Weekdays' : days.join(', ')
  const times = [...c.times].sort().map(fmtTime).join(', ')
  return `${dayText} at ${times} · ${fmtDay(c.start_date)} to ${fmtDay(c.end_date)}`
}

const PILL: Record<string, { label: string; cls: string }> = {
  active: { label: 'Running', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  paused: { label: 'Paused',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ended:  { label: 'Ended',   cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

export function StatusPill({ status }: { status: string }) {
  const p = PILL[status] ?? PILL.ended
  return <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${p.cls}`}>{p.label}</span>
}

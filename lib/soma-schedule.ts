// When SOMA Full Send posts go out.
//
// The daily run used to ask Gemini for a scheduled_date and scheduled_time on
// every post and trusted the answer. The prompt never said what today's date
// was, so the model made one up: on 2026-09-26 it returned 2026-03-30 and
// 2026-03-31 for all 28 posts. They were inserted as 'scheduled' in the past,
// nothing was told to publish them at a sensible time, and a backstop swept
// them out in one burst two hours later, sorted onto March in the calendar.
//
// The model writes the words. The clock is ours: this decides every time.

const MIN = 60_000

// 13:30-23:30 UTC is 9:30 AM-7:30 PM US Eastern (EDT), the same daytime window
// the manual generate route uses. Full Send runs at 13:00 UTC, so a normal run
// schedules the same day.
const WINDOW_START_MIN = 13 * 60 + 30
const WINDOW_END_MIN = 23 * 60 + 30
const LEAD_MS = 20 * MIN
// Room each post needs. If the rest of today's window cannot give every post at
// least this much, the whole batch moves to tomorrow instead of bunching up.
const PER_POST_MS = 45 * MIN
const PLATFORM_STAGGER_MS = 11 * MIN

/**
 * `perPlatform` publish times for one platform, spread evenly across the daytime
 * window. `platformIndex` staggers platforms so they do not all fire in the same
 * minute; `extraOffsetMin` does the same across projects.
 */
export function fullSendSlots(
  now: Date,
  perPlatform: number,
  platformIndex = 0,
  extraOffsetMin = 0,
): Date[] {
  if (perPlatform <= 0) return []

  const earliest = now.getTime() + LEAD_MS
  const e = new Date(earliest)
  let day = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate())
  let winStart = day + WINDOW_START_MIN * MIN
  let winEnd = day + WINDOW_END_MIN * MIN
  let start = Math.max(earliest, winStart)

  if (winEnd - start < perPlatform * PER_POST_MS) {
    day += 24 * 60 * MIN
    winStart = day + WINDOW_START_MIN * MIN
    winEnd = day + WINDOW_END_MIN * MIN
    start = winStart
  }

  const step = (winEnd - start) / perPlatform
  const offset = platformIndex * PLATFORM_STAGGER_MS + extraOffsetMin * MIN
  return Array.from({ length: perPlatform }, (_, i) => new Date(start + i * step + offset))
}

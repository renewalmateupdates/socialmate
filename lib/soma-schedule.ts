// When SOMA posts go out.
//
// The daily run used to ask Gemini for a scheduled_date and scheduled_time on
// every post and trusted the answer. The prompt never said what today's date
// was, so the model made one up: on 2026-09-26 it returned 2026-03-30 and
// 2026-03-31 for all 28 posts. They were inserted as 'scheduled' in the past,
// nothing was told to publish them at a sensible time, and a backstop swept
// them out in one burst two hours later, sorted onto March in the calendar.
//
// The model writes the words. The clock is ours: this decides every time.
//
// Every run (manual, the Monday run, Full Send's daily run) fills only the open
// slots. The three runs used to plan independently, so the Monday run filled a
// Full Send project 30 days ahead and the daily run then added another day's
// posts on top: up to 14 a day on one platform against a cap of 7. Counting
// what each day already holds is what keeps a platform at its cap, and it makes
// a run that finds nothing to fill a no-op.
//
// Pure: no imports beyond types, safe to test in isolation.

import type { PlatformSchedule } from './soma-mode'

const MIN = 60_000
const DAY = 24 * 60 * MIN

// 13:30-23:30 UTC is 9:30 AM-7:30 PM US Eastern (EDT). Full Send runs at 13:00
// UTC and the Monday run at 12:00, so a normal run can still use the same day.
const WINDOW_START_MIN = 13 * 60 + 30
const WINDOW_END_MIN = 23 * 60 + 30
/** A slot closer than this to now is skipped rather than scheduled. */
const LEAD_MS = 20 * MIN
const PLATFORM_STAGGER_MIN = 11

/** YYYY-MM-DD for the UTC day containing `d`. */
export function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** `count` consecutive UTC day keys starting with the day of `start`. */
export function windowDayKeys(start: Date, count: number): string[] {
  const first = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  return Array.from({ length: Math.max(0, count) }, (_, i) => utcDayKey(new Date(first + i * DAY)))
}

/**
 * `count` publish times on one UTC day, centered in even steps across the
 * daytime window. `platformIndex` staggers platforms so they do not all fire in
 * the same minute; `extraOffsetMin` does the same across projects. The offset
 * is kept under half a step so no slot slides into the next one or past
 * midnight.
 */
export function daySlots(dayKey: string, count: number, platformIndex = 0, extraOffsetMin = 0): Date[] {
  if (count <= 0) return []
  const dayStart = Date.parse(`${dayKey}T00:00:00Z`)
  const winStart = dayStart + WINDOW_START_MIN * MIN
  const step = ((WINDOW_END_MIN - WINDOW_START_MIN) * MIN) / count
  const offset = Math.min((platformIndex * PLATFORM_STAGGER_MIN + extraOffsetMin) * MIN, step * 0.45)
  return Array.from({ length: count }, (_, i) => new Date(winStart + i * step + step / 2 + offset))
}

export interface GapPlanInput {
  /** In display order; the index staggers each platform's times. */
  platforms: string[]
  /** Already capped to the mode (see capSchedule in lib/soma-mode.ts). */
  schedule: PlatformSchedule
  /** UTC day keys to fill, in order. */
  days: string[]
  /** Posts this project already has: platform -> day key -> their publish times (ms). */
  existing: Record<string, Record<string, number[]>>
  now: Date
  extraOffsetMin?: number
}

export interface PlannedSlot {
  platform: string
  day: string
  at: Date
}

/**
 * The open slots in a window: for each platform and each day it posts on, the
 * schedule's posts per day minus what that day already holds, never in the
 * past. Earliest first, so a run that stops early has filled the nearest days.
 *
 * An existing post takes a slot whatever its status. A failed post counts too:
 * refilling it would retry a platform that is failing (an expired token, a
 * missing permission) and spend credits every run doing it.
 */
export function planGapSlots(input: GapPlanInput): PlannedSlot[] {
  const earliest = input.now.getTime() + LEAD_MS
  const out: PlannedSlot[] = []
  input.platforms.forEach((platform, platformIndex) => {
    const cfg = input.schedule[platform]
    if (!cfg) return
    for (const day of input.days) {
      const dow = new Date(`${day}T12:00:00Z`).getUTCDay()
      if (!cfg.days.includes(dow)) continue
      const cap = Math.max(0, Math.floor(cfg.posts_per_day))
      const have = input.existing[platform]?.[day] ?? []
      if (have.length >= cap) continue
      // Lay out the whole day at its cap, let each existing post take the slot
      // nearest its own time, and fill what is left. The day ends at its cap,
      // and a new post never lands on top of one that is already there.
      const slots = daySlots(day, cap, platformIndex, input.extraOffsetMin ?? 0)
      for (const t of have) {
        let nearest = 0
        for (let i = 1; i < slots.length; i++) {
          if (Math.abs(slots[i].getTime() - t) < Math.abs(slots[nearest].getTime() - t)) nearest = i
        }
        slots.splice(nearest, 1)
      }
      for (const at of slots) if (at.getTime() >= earliest) out.push({ platform, day, at })
    }
  })
  return out.sort((a, b) => a.at.getTime() - b.at.getTime())
}

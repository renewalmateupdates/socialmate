/**
 * SOMA monthly run caps.
 *
 * `soma_projects.runs_this_month` was only ever incremented. The single place
 * it was set to zero was project creation — no cron touched it, no route reset
 * it, nothing. So it was a lifetime total being compared against a monthly cap,
 * and every project would eventually lock permanently. The live project reached
 * 21 against a Full Send cap of 12 with one actual run in the month, and
 * September would not have helped: nothing was ever going to clear it.
 *
 * The obvious repair is "add it to the monthly cron", and that is the wrong
 * one. It leaves a whole product gated on a single cron firing on the 1st, and
 * one missed tick locks every paying user out for a month with no way to
 * self-recover. Worse, it fails silently in exactly the way this bug already
 * did.
 *
 * So the period is derived instead of stored. `last_generated_at` already
 * records when the counter was last touched; if that was before the current
 * month began, this month's count is zero by definition, whatever the column
 * says. Self-healing, no migration, no cron dependency, and it cannot drift
 * again. The stored value is repaired on the next write.
 */

export interface RunCounted {
  runs_this_month?: number | null
  last_generated_at?: string | null
}

/** First instant of the current UTC month. */
export function monthStartUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/**
 * Runs used in the current calendar month.
 *
 * Reads zero whenever the last recorded generation predates this month, which
 * is what makes the reset automatic rather than scheduled.
 */
export function runsThisMonth(project: RunCounted, now: Date = new Date()): number {
  const last = project.last_generated_at ? new Date(project.last_generated_at) : null
  if (!last || Number.isNaN(last.getTime())) return 0
  if (last < monthStartUtc(now)) return 0
  return Math.max(0, project.runs_this_month ?? 0)
}

/**
 * The value to persist when recording a run. Rolls the stored counter over to 1
 * on the first run of a new month rather than adding to last month's total, so
 * the column converges on the truth instead of drifting further from it.
 */
export function nextRunCount(project: RunCounted, now: Date = new Date()): number {
  return runsThisMonth(project, now) + 1
}

/** Monthly cap by mode. Full Send's daily cron has its own higher cap. */
export function runCapForMode(mode: string | null | undefined): number {
  if (mode === 'full_send') return 12
  if (mode === 'autopilot') return 8
  return 4
}

/** True when the project has no runs left this month. */
export function runCapReached(project: RunCounted, cap: number, now: Date = new Date()): boolean {
  return runsThisMonth(project, now) >= cap
}

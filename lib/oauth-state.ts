/**
 * The OAuth state check, and how to tell a real failure from a repeat.
 *
 * Every connect callback compares the `state` TikTok (or anyone) sends back with
 * the one-time value we set in a cookie before redirecting out. Production showed
 * that most TikTok "invalid_state" failures were not failures at all: for three
 * people the TikTok row was written 4 to 8 seconds before the error, so they were
 * connected, and a second hit on the callback (a double tap on TikTok's Continue,
 * or a reload) found the one-time state already spent and sent them to an error
 * page instead of their new account.
 */

export type StateCheck =
  | { ok: true }
  | { ok: false; reason: 'state_missing' | 'state_mismatch' }

/**
 * `state_missing`: no state cookie came back with the callback. It expired, was
 * spent by an earlier hit, or the connect started on another host or browser.
 * `state_mismatch`: a cookie came back but for a different attempt, usually a
 * second connect started in another tab.
 */
export function checkOAuthState(stored: string | null | undefined, returned: string | null | undefined): StateCheck {
  if (!stored) return { ok: false, reason: 'state_missing' }
  if (!returned || stored !== returned) return { ok: false, reason: 'state_mismatch' }
  return { ok: true }
}

/** The repeats seen in production landed within seconds; two minutes covers a slow reload. */
export const REPEAT_WINDOW_MS = 2 * 60 * 1000

/**
 * True when the person's connection on this platform was written so recently that a
 * failed state check is the repeat of that connect, not a new attempt. Nothing is
 * linked on this path: it only decides whether to show success or an error.
 */
export function isRepeatOfFreshConnect(lastWrite: string | null | undefined, now: Date = new Date()): boolean {
  if (!lastWrite) return false
  const written = new Date(lastWrite).getTime()
  if (!Number.isFinite(written)) return false
  const age = now.getTime() - written
  return age >= 0 && age <= REPEAT_WINDOW_MS
}

import type { SupabaseClient } from '@supabase/supabase-js'

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
 * LinkedIn's repeats came later. On Nov 6 and Nov 23, 2026 the "invalid state"
 * errors arrived 3 to 4 minutes after a connect that worked, one person three
 * times (a reload, or LinkedIn's app sending them back to the callback). All
 * four people who saw that error since Oct 1 were connected. Showing success in
 * this window is still true: their connection was written moments before.
 */
export const SLOW_REPEAT_WINDOW_MS = 10 * 60 * 1000

/**
 * True when the person's connection on this platform was written so recently that a
 * failed state check is the repeat of that connect, not a new attempt. Nothing is
 * linked on this path: it only decides whether to show success or an error.
 */
export function isRepeatOfFreshConnect(
  lastWrite: string | null | undefined,
  now: Date = new Date(),
  windowMs: number = REPEAT_WINDOW_MS,
): boolean {
  if (!lastWrite) return false
  const written = new Date(lastWrite).getTime()
  if (!Number.isFinite(written)) return false
  const age = now.getTime() - written
  return age >= 0 && age <= windowMs
}

/**
 * The lookup behind a failed state check: was this person's connection on
 * `platform` written within the window? A read that fails answers no, so the
 * person sees the error they would have seen anyway. Callbacks set
 * `updated_at` when they reconnect an account, which is what makes a
 * reconnect count as fresh.
 */
export async function connectedJustNow(
  db: SupabaseClient,
  userId: string,
  platform: string,
  windowMs: number = REPEAT_WINDOW_MS,
  now: Date = new Date(),
): Promise<boolean> {
  const { data, error } = await db
    .from('connected_accounts')
    .select('updated_at, created_at')
    .eq('user_id', userId)
    .eq('platform', platform)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)
  if (error) {
    console.warn(`[oauth] recent-connect lookup failed (${platform}):`, error.message)
    return false
  }
  const row = (data ?? [])[0] as { updated_at?: string | null; created_at?: string | null } | undefined
  return isRepeatOfFreshConnect(row?.updated_at ?? row?.created_at, now, windowMs)
}

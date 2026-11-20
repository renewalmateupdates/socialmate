/**
 * The unread notification count, shared between a person's open tabs
 * (Nov 20, 2026).
 *
 * Since #817 each tab asks /api/notifications/count once a minute while it is
 * on screen. That still grows with how many tabs someone leaves open, not with
 * how many people use the app (two Reddit commenters said so the same day).
 * Now the tab that asks writes the answer to localStorage, and every other tab
 * uses it while it is fresh, and hears about it at once through the `storage`
 * event: about one request a minute per person, however many tabs.
 *
 * Pure helpers, no browser access, so scripts/test-unread-cache.mjs can load
 * them. hooks/useUnreadNotifications.ts does the reading and writing.
 */
export const UNREAD_CACHE_KEY = 'sm_unread_v1'

export type UnreadCacheEntry = { at: number; unread: number; uid: string }

/** The count stored under UNREAD_CACHE_KEY, if it is this person's and young enough. */
export function freshUnread(raw: string | null, uid: string, now: number, maxAgeMs: number): number | null {
  if (!raw || !uid) return null
  try {
    const e = JSON.parse(raw) as Partial<UnreadCacheEntry>
    if (e.uid !== uid || typeof e.unread !== 'number' || typeof e.at !== 'number') return null
    if (now - e.at < 0 || now - e.at >= maxAgeMs) return null
    return e.unread
  } catch {
    return null
  }
}

/** What to store after asking the server. */
export function unreadEntry(unread: number, uid: string, now: number): string {
  return JSON.stringify({ at: now, unread, uid } satisfies UnreadCacheEntry)
}

/** The count in a value another tab just stored, if it is this person's. */
export function unreadFromStored(raw: string | null, uid: string): number | null {
  if (!raw || !uid) return null
  try {
    const e = JSON.parse(raw) as Partial<UnreadCacheEntry>
    return e.uid === uid && typeof e.unread === 'number' ? e.unread : null
  } catch {
    return null
  }
}

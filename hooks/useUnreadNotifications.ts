'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchJsonShared, forgetShared } from '@/lib/shared-fetch'
import { useVisiblePoll } from '@/hooks/useVisiblePoll'
import { supabase } from '@/lib/supabase'
import { UNREAD_CACHE_KEY, freshUnread, unreadEntry, unreadFromStored } from '@/lib/unread-cache'

const UNREAD_URL = '/api/notifications/count'
const CHANGED_EVENT = 'sm:notifications-changed'
const POLL_MS = 60_000
// Under POLL_MS, so each minute's first tick asks the server and the other
// badges, in this tab or another one, share that answer.
const MAX_AGE_MS = 50_000

function readStored(): string | null {
  try { return localStorage.getItem(UNREAD_CACHE_KEY) } catch { return null }
}

/**
 * The unread notification count, for every badge on the page: the bell, and
 * the Notifications link in the sidebar. They used to poll separately (the
 * bell fetched the whole list each minute just to count it), four requests a
 * minute per open tab; then one a minute per visible tab (#817); now about one
 * a minute per person, shared between their open tabs (lib/unread-cache.ts).
 */
export function useUnreadNotifications(): number {
  const [unread, setUnread] = useState(0)
  const uidRef = useRef('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    uidRef.current = user.id
    // Another tab asked a moment ago: use its answer.
    const cached = freshUnread(readStored(), user.id, Date.now(), MAX_AGE_MS)
    if (cached !== null) { setUnread(cached); return }
    const d = await fetchJsonShared<{ unread?: number }>(UNREAD_URL, MAX_AGE_MS)
    if (d && typeof d.unread === 'number') {
      setUnread(d.unread)
      try { localStorage.setItem(UNREAD_CACHE_KEY, unreadEntry(d.unread, user.id, Date.now())) } catch { /* private mode */ }
    }
  }, [])

  const run = useCallback(() => { void load() }, [load])
  useVisiblePoll(run, POLL_MS)

  useEffect(() => {
    // Marked read here, in this tab.
    window.addEventListener(CHANGED_EVENT, run)
    // A new answer from another tab, shown at once.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== UNREAD_CACHE_KEY) return
      const n = unreadFromStored(e.newValue, uidRef.current)
      if (n !== null) setUnread(n)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGED_EVENT, run)
      window.removeEventListener('storage', onStorage)
    }
  }, [run])

  return unread
}

/**
 * Call after marking notifications read or deleting them, so every badge
 * shows the new count now rather than within the minute, in every tab.
 */
export function notificationsChanged(): void {
  // Forget once, before telling the badges: the first one to hear asks the
  // server and the rest, here and in other tabs, share its answer.
  forgetShared(UNREAD_URL)
  try { localStorage.removeItem(UNREAD_CACHE_KEY) } catch { /* private mode */ }
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

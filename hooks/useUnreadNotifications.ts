'use client'
import { useCallback, useEffect, useState } from 'react'
import { fetchJsonShared, forgetShared } from '@/lib/shared-fetch'
import { useVisiblePoll } from '@/hooks/useVisiblePoll'

const UNREAD_URL = '/api/notifications/count'
const CHANGED_EVENT = 'sm:notifications-changed'
const POLL_MS = 60_000
// Under POLL_MS, so each minute's first tick asks the server and the other
// badges on the page, ticking a moment later, share that answer.
const MAX_AGE_MS = 50_000

/**
 * The unread notification count, for every badge on the page: the bell, and
 * the Notifications link in both copies of the sidebar. They used to poll
 * separately (the bell fetched the whole list each minute just to count it),
 * four requests a minute per open tab; now it is one, and none while the tab
 * is in the background.
 */
export function useUnreadNotifications(): number {
  const [unread, setUnread] = useState(0)

  const load = useCallback(() => {
    fetchJsonShared<{ unread?: number }>(UNREAD_URL, MAX_AGE_MS).then(d => {
      if (d && typeof d.unread === 'number') setUnread(d.unread)
    })
  }, [])

  useVisiblePoll(load, POLL_MS)

  useEffect(() => {
    window.addEventListener(CHANGED_EVENT, load)
    return () => window.removeEventListener(CHANGED_EVENT, load)
  }, [load])

  return unread
}

/**
 * Call after marking notifications read or deleting them, so every badge on
 * the page shows the new count now rather than within the minute.
 */
export function notificationsChanged(): void {
  // Forget once, before telling the badges: the first one to hear asks the
  // server and the rest share its answer.
  forgetShared(UNREAD_URL)
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

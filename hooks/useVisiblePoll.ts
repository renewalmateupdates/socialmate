'use client'
import { useEffect, useRef } from 'react'

/**
 * Runs `run` now, then every `everyMs` while the tab is on screen, and once
 * more on coming back to the tab if a run is due. A tab in the background
 * makes no requests.
 *
 * A plain setInterval keeps firing in a background tab (browsers slow timers
 * to about once a minute, and these polls were already once a minute). A
 * signed-in tab left open all day on the Queue was one of the main callers of
 * Vercel's two busiest routes on Nov 19, 2026, the day the Hobby team was
 * paused for CPU. Every request is a billed function invocation.
 */
export function useVisiblePoll(run: () => void, everyMs: number): void {
  const runRef = useRef(run)
  useEffect(() => {
    runRef.current = run
  }, [run])

  useEffect(() => {
    let last = 0
    const tick = () => {
      if (document.visibilityState !== 'visible') return
      last = Date.now()
      runRef.current()
    }
    const onVisibility = () => {
      if (Date.now() - last >= everyMs) tick()
    }

    tick()
    const id = window.setInterval(tick, everyMs)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [everyMs])
}

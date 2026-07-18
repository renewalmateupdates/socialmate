'use client'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * The only JavaScript the hero set piece needs.
 *
 * Its whole job is to stop the loop when it scrolls out of view so we aren't
 * animating something nobody can see (and cooking a laptop battery to do it).
 * The composition itself is server-rendered HTML with CSS keyframes, so this
 * wrapper never touches the content — children stay a server component.
 *
 * Starts paused only if the browser supports IntersectionObserver; otherwise the
 * loop simply runs, which is the correct degradation.
 */
export default function LoopFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: '120px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="hero-clock" data-paused={paused ? 'true' : 'false'}>
      {children}
    </div>
  )
}

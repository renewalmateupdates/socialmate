'use client'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * One-shot scroll reveal. 16px translate, opacity, never re-triggers.
 *
 * Use this on TWO elements per page, not on everything. Scattered fade-ins on a
 * dozen sections is the loudest tell there is, and if everything animates the
 * animation stops meaning anything.
 *
 * Progressive enhancement, deliberately: the server renders children fully
 * visible, and only elements still below the fold on mount get the hidden state.
 * Content is never hidden behind JS that might not arrive, and elements already
 * on screen never flicker.
 */
export default function Reveal({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already visible on first paint? Leave it alone.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return

    setArmed(true)
    setShown(false)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${armed ? 'reveal' : ''} ${className}`}
      data-shown={shown ? 'true' : 'false'}
    >
      {children}
    </div>
  )
}

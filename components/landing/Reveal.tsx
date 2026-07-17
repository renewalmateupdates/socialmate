'use client'
import { useEffect, useRef, useState } from 'react'

// Scroll-reveal wrapper — content fades/slides in the first time it enters the
// viewport. Progressive enhancement done right for perf + SEO:
//  - Server HTML renders children fully visible (no hidden content if JS is
//    slow or off — this must never recreate the blank-page bug we just fixed).
//  - On mount, elements still BELOW the fold get the hidden state and animate
//    in when scrolled to. Elements already on screen never flicker.
//  - prefers-reduced-motion disables the whole thing.
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'ssr' | 'hidden' | 'shown'>('ssr')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already visible on first paint? Leave it alone.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92) return

    setState('hidden')
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState('shown')
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
      className={className}
      style={{
        opacity: state === 'hidden' ? 0 : 1,
        transform: state === 'hidden' ? 'translateY(24px)' : 'none',
        transition: `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

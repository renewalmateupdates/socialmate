'use client'
import { useEffect, useState } from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   EMBER FIELD
   ──────────────────────────────────────────────────────────────────────────────
   The shared Gilgamesh signature, ported from the GE site so the two properties
   move the same way and not just look the same.

   Sparse, slow, and barely there on purpose: 28 dots at 1.5–4px and 10–22%
   opacity. If you notice it as an effect, it's too strong.

   The positions come from a seeded PRNG rather than Math.random() so the server
   and client generate the identical field — Math.random() here would hydration-
   mismatch on every load.
   ══════════════════════════════════════════════════════════════════════════════ */

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0
    return (s >>> 0) / 4294967296
  }
}

const rand = seededRandom(2026)
const EMBERS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: rand() * 100,
  size: 1.5 + rand() * 2.5,
  opacity: 0.1 + rand() * 0.12,
  duration: 10 + rand() * 12,
  delay: -(rand() * 12),
  drift: (rand() - 0.5) * 100,
}))

export default function EmberField() {
  // Rendered client-side only, after checking the motion preference. Under
  // reduced motion it renders nothing at all rather than 28 frozen dots.
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {EMBERS.map(e => (
        <span
          key={e.id}
          className="absolute bottom-0 rounded-full bg-amber"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            opacity: e.opacity,
            animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
            '--drift': `${e.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

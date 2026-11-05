'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Quote } from 'lucide-react'
import { TESTIMONIALS, initials, siteLabel } from '@/lib/testimonials'

// Landing-page testimonials. One quote renders as a single card. From two on,
// it becomes a slider: one card at a time, sliding every 7 seconds, pausing on
// hover or keyboard focus, with dots to jump. People who ask for reduced motion
// get no auto-advance (the dots still work).

const ROTATE_MS = 7000

export default function TestimonialRail({ eyebrow, moreLabel }: { eyebrow: string; moreLabel: string }) {
  const items = TESTIMONIALS
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (items.length < 2 || paused) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [items.length, paused])

  if (items.length === 0) return null

  return (
    <section
      aria-label={eyebrow}
      className="mx-auto w-full max-w-4xl px-gutter pb-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="text-center font-mono text-eyebrow uppercase text-ink-faint">{eyebrow}</p>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-edge bg-panel">
        <div
          className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((t, i) => (
            <figure
              key={t.name}
              className="w-full flex-shrink-0 px-6 py-8 sm:px-10 sm:py-10"
              aria-hidden={i !== index}
            >
              <Quote className="h-6 w-6 text-ink-faint" strokeWidth={1.75} aria-hidden="true" />
              <blockquote className="mt-4 text-body-lg text-pretty text-ink-high">
                &ldquo;{t.short}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-edge bg-raised font-mono text-small text-ink-body"
                  aria-hidden="true"
                >
                  {initials(t.name)}
                </span>
                <span className="min-w-0">
                  <span className="block text-small font-semibold text-ink-high">{t.name}</span>
                  <span className="block text-small text-ink-muted">{t.role}, {t.company}</span>
                  {t.website && (
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={i === index ? 0 : -1}
                      className="block break-all text-small text-ink-muted underline decoration-edge-lit underline-offset-4 hover:text-ink-high"
                    >
                      {siteLabel(t.website)}
                    </a>
                  )}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        {items.length > 1 && (
          <div className="flex items-center gap-2">
            {items.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1} / ${items.length}`}
                aria-current={i === index}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span className={`block h-2 w-2 rounded-full ${i === index ? 'bg-ink-high' : 'bg-edge-lit'}`} />
              </button>
            ))}
          </div>
        )}
        <Link href="/wall-of-love" className="text-small text-ink-muted underline decoration-edge-lit underline-offset-4 hover:text-ink-high">
          {moreLabel}
        </Link>
      </div>
    </section>
  )
}

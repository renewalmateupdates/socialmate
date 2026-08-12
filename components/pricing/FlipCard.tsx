'use client'

import { useId, useState } from 'react'

// A pricing card with a back face listing what the tier unlocks over the one
// below it.
//
// The front sells the tier on its own terms; the back answers the only question
// someone comparing two adjacent tiers actually has, which is "what do I get
// that I don't already have". Keeping that on a second face rather than inline
// means the front stays scannable.
//
// Height is driven by the front face — the back is absolutely positioned over
// it, so every back list must be shorter than its front list. True today, since
// each delta is a subset of that tier's full feature list.
//
// One toggle, rendered outside the rotating element and always present: it does
// not move when the card turns, it is a single stable tab stop, and neither face
// carries a control that could be focused while turned away from the viewer.

export interface FlipUnlock {
  label: string
  from?: string // what the tier below gave, when this is an increase rather than a new capability
}

export function FlipCard({
  front,
  backTitle,
  backIntro,
  unlocks,
  flipLabel,
  className = '',
}: {
  front: React.ReactNode
  backTitle: string
  backIntro?: string
  unlocks: FlipUnlock[]
  flipLabel: string
  className?: string
}) {
  const [flipped, setFlipped] = useState(false)
  const backId = useId()

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="[perspective:1400px] flex-1">
        <div
          className={`relative h-full transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front */}
          <div className="[backface-visibility:hidden] h-full" aria-hidden={flipped}>
            {front}
          </div>

          {/* Back */}
          <div
            id={backId}
            aria-hidden={!flipped}
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-panel border border-amber/40 rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber mb-2">Unlocks</p>
              <h3 className="text-lg font-extrabold text-ink-high leading-tight">{backTitle}</h3>
              {backIntro && <p className="text-xs leading-relaxed text-ink-muted mt-2">{backIntro}</p>}
            </div>
            <div className="px-6 pb-6 flex-1">
              <ul className="space-y-2.5">
                {unlocks.map((u, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 font-bold text-amber">+</span>
                    <span className="text-small text-ink-body">
                      {u.label}
                      {u.from && <span className="text-ink-faint"> · was {u.from}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped(f => !f)}
        aria-expanded={flipped}
        aria-controls={backId}
        className="mt-2 w-full text-center text-xs font-semibold py-2 rounded-lg text-ink-muted hover:text-amber transition-colors"
      >
        {flipped ? '← Back to plan' : flipLabel}
      </button>
    </div>
  )
}

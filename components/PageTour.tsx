'use client'
import { useEffect, useState, useCallback } from 'react'

export interface TourStep {
  target: string  // CSS selector or element ID (without #)
  title: string
  body: string
}

interface Props {
  tourId: string
  steps: TourStep[]
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

const LS_KEY = (id: string) => `tour_seen_${id}`

export default function PageTour({ tourId, steps }: Props) {
  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [rect, setRect] = useState<TargetRect | null>(null)

  // Only show if not already seen
  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY(tourId))) {
        setActive(true)
      }
    } catch {
      // localStorage unavailable — skip tour silently
    }
  }, [tourId])

  const measureTarget = useCallback((idx: number) => {
    const step = steps[idx]
    if (!step) return
    // Support both plain IDs and CSS selectors
    const el = document.getElementById(step.target) ?? document.querySelector(step.target)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height })
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      setRect(null)
    }
  }, [steps])

  useEffect(() => {
    if (!active) return
    // Small delay to let page render settle
    const t = setTimeout(() => measureTarget(stepIdx), 150)
    return () => clearTimeout(t)
  }, [active, stepIdx, measureTarget])

  const finish = () => {
    setActive(false)
    try { localStorage.setItem(LS_KEY(tourId), '1') } catch {}
  }

  const next = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(i => i + 1)
    } else {
      finish()
    }
  }

  if (!active || steps.length === 0) return null

  const step = steps[stepIdx]
  const isLast = stepIdx === steps.length - 1

  // Position tooltip below the anchor, fallback to fixed bottom-right
  const tooltipStyle: React.CSSProperties = rect
    ? {
        position: 'absolute',
        top: rect.top + rect.height + 14,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 300)),
        zIndex: 9999,
      }
    : {
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 9999,
      }

  return (
    <>
      {/* Semi-transparent backdrop — pointer-events:none so users can still interact */}
      <div className="fixed inset-0 z-[9990] bg-black/30 pointer-events-none" />

      {/* Highlight ring */}
      {rect && (
        <div
          className="absolute z-[9995] rounded-xl pointer-events-none"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: '0 0 0 3px #f59e0b, 0 0 0 9999px rgba(0,0,0,0.3)',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="w-72 bg-gray-900 border border-amber-500/40 rounded-2xl shadow-2xl p-5"
        style={tooltipStyle}
      >
        {/* Arrow indicator toward anchor */}
        {rect && (
          <div
            className="absolute -top-2 left-5 w-3 h-3 bg-gray-900 border-l border-t border-amber-500/40 rotate-45"
          />
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-gray-700'
              }`}
            />
          ))}
        </div>

        <h3 className="font-extrabold text-sm text-white mb-1">{step.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">{step.body}</p>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={finish}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold rounded-xl transition-all"
          >
            {isLast ? 'Got it!' : `Next (${stepIdx + 1}/${steps.length})`}
          </button>
        </div>
      </div>
    </>
  )
}

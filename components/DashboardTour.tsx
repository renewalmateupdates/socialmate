'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type TourStep = {
  id: string
  title: string
  description: string
  anchor: string       // CSS selector or element id to highlight
  position: 'right' | 'bottom' | 'top'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'compose',
    title: 'Schedule your first post',
    description: 'Write and schedule to all your connected platforms from one place. If you created drafts during setup, they\'re waiting in the queue.',
    anchor: 'tour-compose',
    position: 'bottom',
  },
  {
    id: 'ai-credits',
    title: '100 credits to start',
    description: '50 free every month + 50 bonus for completing setup. Use them for captions, hashtags, viral hooks, post rewrites, and more.',
    anchor: 'tour-ai-credits',
    position: 'right',
  },
  {
    id: 'ai-features',
    title: '20+ AI Tools',
    description: 'Generate captions, rewrite posts, find viral hooks, score your content before posting, and more — all one click.',
    anchor: 'tour-ai-features',
    position: 'right',
  },
  {
    id: 'sidebar-customize',
    title: 'Make the sidebar yours',
    description: 'Click any section label to collapse it. Drag sections to reorder. Pick from 29 color themes or toggle dark mode under Theme at the bottom — all saved automatically.',
    anchor: 'tour-sidebar-collapse',
    position: 'right',
  },
]

type Props = {
  userId: string
}

export default function DashboardTour({ userId }: Props) {
  const [active, setActive]   = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [pos, setPos]         = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  useEffect(() => {
    // Fast check: localStorage (prevents flash before DB responds)
    const localDone = localStorage.getItem(`tour_completed_${userId}`) === 'true'
    if (localDone) return

    // Authoritative check: DB
    supabase
      .from('user_settings')
      .select('first_tour_completed')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.first_tour_completed) {
          // Sync to localStorage so next load is instant
          localStorage.setItem(`tour_completed_${userId}`, 'true')
        } else {
          setActive(true)
        }
      })
  }, [userId])

  useEffect(() => {
    if (!active) return
    const step = TOUR_STEPS[stepIdx]
    const el = document.getElementById(step.anchor)
    if (el) {
      const rect = el.getBoundingClientRect()
      setPos({ top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height })
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      setPos(null)
    }
  }, [active, stepIdx])

  const completeTour = async (dismissed = false) => {
    setActive(false)
    // Save to localStorage immediately (fast, prevents re-show on reload)
    localStorage.setItem(`tour_completed_${userId}`, 'true')
    // Save to DB (authoritative, survives localStorage clear)
    await supabase
      .from('user_settings')
      .update({ first_tour_completed: true })
      .eq('user_id', userId)
  }

  const next = () => {
    if (stepIdx < TOUR_STEPS.length - 1) setStepIdx(i => i + 1)
    else completeTour()
  }

  if (!active) return null

  const step = TOUR_STEPS[stepIdx]
  const isLast = stepIdx === TOUR_STEPS.length - 1

  // Tooltip position: below and slightly right of the anchor element
  const tooltipStyle: React.CSSProperties = pos
    ? { position: 'absolute', top: pos.top + pos.height + 12, left: Math.max(16, pos.left) }
    : { position: 'fixed', bottom: 100, right: 32 }

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 pointer-events-none"
        onClick={() => completeTour(true)}
      />

      {/* Highlight ring around anchor */}
      {pos && (
        <div
          className="absolute z-50 rounded-xl pointer-events-none"
          style={{
            top:    pos.top - 4,
            left:   pos.left - 4,
            width:  pos.width + 8,
            height: pos.height + 8,
            boxShadow: '0 0 0 4px #22c55e, 0 0 0 9999px rgba(0,0,0,0.4)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-50 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5"
        style={tooltipStyle}
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === stepIdx ? 'w-5 bg-green-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        <h3 className="font-extrabold text-base mb-1">{step.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{step.description}</p>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => completeTour(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Skip tour
          </button>

          {isLast ? (
            <Link
              href="/queue"
              onClick={() => completeTour()}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all">
              Go to queue →
            </Link>
          ) : (
            <button
              onClick={next}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:opacity-80 transition-all">
              Next ({stepIdx + 1}/{TOUR_STEPS.length})
            </button>
          )}
        </div>
      </div>
    </>
  )
}

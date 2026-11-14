'use client'
import { useEffect, useState } from 'react'
import { CalendarDays, LayoutGrid, PenLine, Plus, SlidersHorizontal, X as CloseIcon } from 'lucide-react'

export const GUIDE_SEEN_KEY   = 'sm_sidebar_guide_seen'
export const GUIDE_OPEN_EVENT = 'sm-open-sidebar-guide'
export const CUSTOMIZE_EVENT  = 'sm-open-sidebar-customizer'

/**
 * A short welcome to the sidebar, shown once per browser and reopenable from
 * "More tools". It exists because the sidebar now starts short, and someone
 * who knew the long one would otherwise wonder where their tools went.
 */
export default function SidebarGuide() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(GUIDE_SEEN_KEY)) setOpen(true)
    } catch { /* private mode: skip the guide rather than show it every visit */ }
    const show = () => setOpen(true)
    window.addEventListener(GUIDE_OPEN_EVENT, show)
    return () => window.removeEventListener(GUIDE_OPEN_EVENT, show)
  }, [])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(GUIDE_SEEN_KEY, '1') } catch { /* private mode */ }
  }

  if (!open) return null

  const steps = [
    { icon: PenLine,           title: 'Write in Compose',        body: 'Pick your platforms, write once, then post now or pick a time.' },
    { icon: CalendarDays,      title: 'See it all in Schedule',  body: 'Calendar and List show the same posts. Drag a post to a new day to move it.' },
    { icon: LayoutGrid,        title: 'Everything else is in More tools', body: 'Your sidebar starts short. Every other tool is under More tools at the bottom of it.' },
    { icon: Plus,              title: 'Keep what you use',       body: 'Press + next to a tool to add it to your sidebar.' },
    { icon: SlidersHorizontal, title: 'Or customize it all',     body: 'Customize sidebar lets you turn tools on and off, or show everything.' },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-guide-title"
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Quick guide</p>
            <h2 id="sidebar-guide-title" className="text-lg font-extrabold mt-0.5">Find your way around</h2>
          </div>
          <button onClick={close} aria-label="Close"
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <CloseIcon className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <ol className="px-5 space-y-3">
          {steps.map(s => (
            <li key={s.title} className="flex items-start gap-3">
              <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <s.icon className="w-4 h-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-bold">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2 p-5 pt-4">
          <button
            onClick={() => { close(); window.dispatchEvent(new CustomEvent(CUSTOMIZE_EVENT)) }}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400">
            Customize now
          </button>
          <button onClick={close}
            className="ml-auto text-xs font-bold px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80">
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

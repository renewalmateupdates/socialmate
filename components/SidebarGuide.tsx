'use client'
import { useEffect, useState } from 'react'
import { CalendarDays, LayoutGrid, PenLine, Plus, SlidersHorizontal, X as CloseIcon } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

export const GUIDE_SEEN_KEY   = 'sm_sidebar_guide_seen'
export const GUIDE_OPEN_EVENT = 'sm-open-sidebar-guide'
export const CUSTOMIZE_EVENT  = 'sm-open-sidebar-customizer'

/**
 * A short welcome to the sidebar, shown once per browser and reopenable from
 * "More tools". It exists because the sidebar now starts short, and someone
 * who knew the long one would otherwise wonder where their tools went.
 */
export default function SidebarGuide() {
  const { t } = useI18n()
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
    { icon: PenLine,           key: 'compose' },
    { icon: CalendarDays,      key: 'schedule' },
    { icon: LayoutGrid,        key: 'more' },
    { icon: Plus,              key: 'keep' },
    { icon: SlidersHorizontal, key: 'customize' },
  ].map(s => ({
    icon: s.icon,
    title: t(`app_sidebar.guide_${s.key}_title`),
    body: t(`app_sidebar.guide_${s.key}_body`),
  }))

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
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">{t('app_sidebar.quick_guide')}</p>
            <h2 id="sidebar-guide-title" className="text-lg font-extrabold mt-0.5">{t('app_sidebar.guide_title')}</h2>
          </div>
          <button onClick={close} aria-label={t('app_sidebar.close')}
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
            {t('app_sidebar.guide_customize_now')}
          </button>
          <button onClick={close}
            className="ml-auto text-xs font-bold px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80">
            {t('app_sidebar.guide_got_it')}
          </button>
        </div>
      </div>
    </div>
  )
}

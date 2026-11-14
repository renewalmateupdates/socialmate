'use client'
import { useEffect } from 'react'
import { Check, X as CloseIcon } from 'lucide-react'

export type CustomizerGroup = { section: string; label: string; items: { href: string; label: string }[] }

/**
 * Choose which tools sit in the sidebar. Everything not chosen stays one click
 * away under "More tools", so turning a tool off never removes it.
 */
export default function SidebarCustomizer({
  groups, shown, onChange, onShowAll, onReset, onClose,
}: {
  groups: CustomizerGroup[]
  shown: Set<string>
  onChange: (href: string, on: boolean) => void
  onShowAll: () => void
  onReset: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-sidebar-title"
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg max-h-[85dvh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 id="customize-sidebar-title" className="text-base font-extrabold">Customize your sidebar</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tick the tools you use. The rest wait under More tools, so nothing goes away.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <CloseIcon className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {groups.map(g => (
            <div key={g.section}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{g.label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {g.items.map(item => {
                  const on = shown.has(item.href)
                  return (
                    <button
                      key={item.href}
                      onClick={() => onChange(item.href, !on)}
                      aria-pressed={on}
                      className={`flex items-center gap-2.5 text-left text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all min-h-[40px] ${
                        on
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}>
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${on ? 'bg-amber-500 border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {on && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                      </span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onShowAll}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400">
            Show everything
          </button>
          <button onClick={onReset}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400">
            Back to the short list
          </button>
          <button onClick={onClose}
            className="ml-auto text-xs font-bold px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

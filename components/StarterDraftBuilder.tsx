'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import { STARTER_PATHS, buildDraft, isStarterLink, type StarterPath } from '@/lib/starter-post'

export type StarterBuild = { draft: string; path: StarterPath; text: string }

// One component, two places. Onboarding puts the result in its editable draft
// box; the Accounts post-connect card sends it to the composer. Keeping the
// frame logic and the form in one place is the point: two copies of "the first
// post helper" is how this codebase has drifted before.
const TONES = {
  onboarding: {
    wrap: 'mb-5 rounded-2xl border border-gray-200 dark:border-gray-700 p-4',
    label: 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide',
    hint: 'text-xs text-gray-400 dark:text-gray-500',
    chipOn: 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white',
    chipOff: 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400',
    input: 'border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-black',
    button: 'bg-black text-white hover:opacity-80',
  },
  card: {
    wrap: 'mt-3',
    label: 'text-xs font-bold text-emerald-800 dark:text-emerald-300',
    hint: 'text-xs text-emerald-700 dark:text-emerald-400',
    chipOn: 'bg-emerald-600 text-white border-emerald-600',
    chipOff: 'border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
    input: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500',
    button: 'bg-emerald-600 text-white hover:bg-emerald-500',
  },
} as const

export default function StarterDraftBuilder({
  where,
  tone,
  buttonLabel,
  onBuild,
}: {
  where: 'onboarding' | 'accounts'
  tone: keyof typeof TONES
  buttonLabel: string
  onBuild: (build: StarterBuild) => void
}) {
  const [path, setPath] = useState<StarterPath>('update')
  const [text, setText] = useState('')
  const t = TONES[tone]
  const active = STARTER_PATHS.find(p => p.id === path) ?? STARTER_PATHS[0]

  const submit = () => {
    const draft = buildDraft(path, text, 0)
    if (!draft) return
    // Flags only, never the sentence itself.
    track('starter_built', { path, kind: isStarterLink(text) ? 'link' : 'sentence', where })
    onBuild({ draft, path, text })
  }

  return (
    <div className={t.wrap}>
      <p className={t.label}>Want it to say something specific?</p>
      <p className={`${t.hint} mt-1 mb-3`}>
        Pick a kind of post, add one rough sentence or a link, and we&apos;ll write the post around it.
      </p>

      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Kind of post">
        {STARTER_PATHS.map(p => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === path}
            onClick={() => setPath(p.id)}
            className={`px-3 min-h-[44px] rounded-xl border text-xs font-semibold transition-colors ${p.id === path ? t.chipOn : t.chipOff}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
          placeholder={active.placeholder}
          aria-label="One rough sentence or a link"
          className={`flex-1 px-4 min-h-[44px] text-sm border rounded-xl focus:outline-none transition-all ${t.input}`}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          className={`px-5 min-h-[44px] text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 ${t.button}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

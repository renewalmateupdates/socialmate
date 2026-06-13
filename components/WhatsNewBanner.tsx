'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const LS_DISMISSED_KEY = 'whats_new_dismissed_id'

/**
 * Update LATEST when shipping a notable feature — bumping the id makes the
 * banner reappear for everyone who dismissed a previous version.
 */
const LATEST = {
  id: '2026-06-13',
  title: "What's new",
  items: [
    'Blog posts now show up in Signup Attribution — see which posts are turning readers into users',
  ],
}

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(LS_DISMISSED_KEY)
    if (dismissed === LATEST.id) return
    setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(LS_DISMISSED_KEY, LATEST.id)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative flex items-start gap-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-300 dark:border-sky-800 rounded-2xl px-5 py-4 mb-4">
      <span className="text-2xl flex-shrink-0">✨</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-sky-800 dark:text-sky-300 leading-tight">
          {LATEST.title}
        </p>
        <ul className="text-xs text-sky-700 dark:text-sky-400 mt-1 space-y-0.5 list-disc list-inside">
          {LATEST.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link href="/changelog" className="inline-block text-xs font-bold text-sky-800 dark:text-sky-300 underline mt-1.5">
          See full changelog →
        </Link>
      </div>
      <button
        onClick={dismiss}
        className="text-sky-500/60 hover:text-sky-700 transition-colors text-sm w-6 h-6 flex items-center justify-center flex-shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

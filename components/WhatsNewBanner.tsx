'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const LS_DISMISSED_KEY = 'whats_new_dismissed_id'

/**
 * Update LATEST when shipping a notable feature — bumping the id makes the
 * banner reappear for everyone who dismissed a previous version.
 *
 * `itemKeys` are i18n keys, not English strings. When you ship something new:
 * add `wn_<slug>` to app_dashboard in ALL NINE locale files (the build fails
 * otherwise), then list the key here and bump the id.
 */
const LATEST = {
  id: '2026-08-22',
  itemKeys: [
    'app_dashboard.wn_premium_dashboard',
    'app_dashboard.wn_full_translation',
  ],
}

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false)
  const { t } = useI18n()

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
    <div className="relative flex items-start gap-3.5 bg-surface border border-theme rounded-2xl px-5 py-4 mb-4">
      <div className="w-8 h-8 rounded-lg bg-violet/12 border border-violet/25 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-violet-ink" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-ink">
          {t('app_dashboard.whats_new')}
        </span>
        <ul className="text-xs text-app-ink mt-1.5 space-y-1">
          {LATEST.itemKeys.map((key) => (
            <li key={key} className="flex gap-2">
              <span className="text-violet-ink/60">·</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <Link href="/changelog" className="inline-block text-[11px] font-semibold text-violet-ink hover:underline mt-2.5">
          {t('app_dashboard.see_full_changelog')} →
        </Link>
      </div>
      <button
        onClick={dismiss}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-app-faint hover:text-theme hover:bg-app-fill transition-all flex-shrink-0"
        aria-label={t('app_common.close')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

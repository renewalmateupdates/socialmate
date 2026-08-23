'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lightbulb, X } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

/**
 * Tips carry an id and a link only. The copy lives in the locale files under
 * `app_dashboard.tip_<id>` / `app_dashboard.tiplink_<id>` so the tip reads in
 * the user's language — it used to be a hardcoded English array, which meant a
 * German user got a German greeting above an English tip.
 *
 * Adding a tip: add the id here, then add both keys to ALL NINE locale files.
 */
type Tip = { id: string; link?: string }

const TIPS: Tip[] = [
  { id: 'multi_platform',       link: '/compose' },
  { id: 'smart_queue',          link: '/queue' },
  { id: 'soma_generate',        link: '/soma' },
  { id: 'credits_reset',        link: '/settings?tab=Plan' },
  { id: 'hashtag_suggestions',  link: '/compose' },
  { id: 'calendar_view',        link: '/calendar' },
  { id: 'brand_voice',          link: '/settings?tab=Brand+Voice' },
  { id: 'link_in_bio',          link: '/link-in-bio' },
  { id: 'evergreen',            link: '/evergreen' },
  { id: 'streak',               link: '/streak' },
  { id: 'analytics_dna',        link: '/analytics/dna' },
  { id: 'team_invite',          link: '/team' },
  { id: 'inbox_replies',        link: '/inbox' },
  { id: 'thread_mode',          link: '/compose' },
  { id: 'media_library',        link: '/media' },
  { id: 'bulk_scheduler',       link: '/bulk-scheduler' },
  { id: 'templates',            link: '/templates' },
  { id: 'agents_hub',           link: '/agents' },
  { id: 'analytics',            link: '/analytics' },
  { id: 'short_links',          link: '/links' },
]

const LS_KEY = 'dismissed_tips'

export default function DidYouKnow() {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null)
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    setMounted(true)
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
      const next = TIPS.find(tip => !dismissed.includes(tip.id)) ?? null
      setCurrentTip(next)
    } catch {
      setCurrentTip(TIPS[0])
    }
  }, [])

  const dismiss = () => {
    if (!currentTip) return
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
      const updated = [...dismissed, currentTip.id]
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      const next = TIPS.find(tip => !updated.includes(tip.id)) ?? null
      setCurrentTip(next)
    } catch {
      setCurrentTip(null)
    }
  }

  // No flash on SSR
  if (!mounted || !currentTip) return null

  return (
    <div className="relative flex items-start gap-3.5 bg-surface border border-theme rounded-2xl px-5 py-4 mb-4">
      <div className="w-8 h-8 rounded-lg bg-amber/12 border border-amber/25 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="w-4 h-4 text-amber-ink" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-ink">
          {t('app_dashboard.did_you_know')}
        </span>
        <p className="text-sm text-app-ink leading-relaxed mt-1.5">
          {t(`app_dashboard.tip_${currentTip.id}`)}
        </p>
        {currentTip.link && (
          <Link
            href={currentTip.link}
            className="inline-block mt-3 text-[11px] font-semibold text-amber-ink border border-amber/30 bg-amber/[0.08] hover:bg-amber/[0.14] px-3 py-1.5 rounded-lg transition-all"
          >
            {t(`app_dashboard.tiplink_${currentTip.id}`)} →
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <button
          onClick={dismiss}
          className="text-[11px] font-semibold text-app-muted hover:text-theme border border-theme hover:border-theme-md px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
        >
          {t('app_dashboard.got_it')}
        </button>
        <button
          onClick={dismiss}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-app-faint hover:text-theme hover:bg-app-fill transition-all"
          aria-label={t('app_common.close')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gift, X } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { localeToBCP47 } from '@/lib/i18n'
import { track } from '@/lib/analytics'
import { BLACK_FRIDAY, BLACK_FRIDAY_PRICES, blackFridayEndLabel, isBlackFridayLive } from '@/lib/promos'

const LS_DISMISSED_KEY = 'sm_black_friday_2026_dismissed'

/**
 * The Black Friday deal for people on Free, Nov 26 to Dec 4 (lib/promos.ts),
 * on the Dashboard and on TikTok Studio's screen after a post (`from` says
 * which, on promo_clicked). One line and a close button, gone for good once
 * closed, in both places: upgrade prompts here are dismissible and never in
 * the way. Its link opens /pricing with the code already applied.
 */
export default function BlackFridayBanner({ plan, from = 'dashboard' }: { plan: string; from?: string }) {
  const [visible, setVisible] = useState(false)
  const { t, locale } = useI18n()

  useEffect(() => {
    if (plan !== 'free' || !isBlackFridayLive()) return
    try {
      if (localStorage.getItem(LS_DISMISSED_KEY) === '1') return
    } catch {}
    setVisible(true)
  }, [plan])

  const dismiss = () => {
    try { localStorage.setItem(LS_DISMISSED_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative flex items-start gap-3.5 bg-amber/[0.07] border border-amber/30 rounded-2xl px-5 py-4 mb-4">
      <div className="w-8 h-8 rounded-lg bg-amber/15 border border-amber/30 flex items-center justify-center flex-shrink-0">
        <Gift className="w-4 h-4 text-amber-ink" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-theme leading-tight">
          {t('promo.bf_dash_title', { percent: BLACK_FRIDAY.percentOff, months: BLACK_FRIDAY.months })}
        </p>
        <p className="text-xs text-app-muted mt-1">
          {t('promo.bf_dash_body', {
            code: BLACK_FRIDAY.code,
            monthly: BLACK_FRIDAY_PRICES.proMonthly,
            annual: BLACK_FRIDAY_PRICES.proAnnual,
            months: BLACK_FRIDAY.months,
            date: blackFridayEndLabel(localeToBCP47(locale)),
          })}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/pricing?code=${BLACK_FRIDAY.code}`}
          onClick={() => track('promo_clicked', { code: BLACK_FRIDAY.code, from })}
          className="text-[11px] font-bold px-3.5 py-2 bg-gradient-to-b from-amber-bright to-amber text-void rounded-xl hover:from-amber-bright hover:to-amber-bright transition-all whitespace-nowrap"
        >
          {t('promo.bf_cta')} →
        </Link>
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

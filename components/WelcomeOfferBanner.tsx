'use client'
import { useState, useEffect } from 'react'
import { Gift, X } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const LS_FIRST_SHOWN_KEY = 'welcome_offer_first_shown'
const LS_DISMISSED_KEY = 'welcome_offer_dismissed'

interface Props {
  /** ISO string — user.created_at from auth */
  createdAt: string
  plan: string
  /** Called when user clicks the CTA — should apply WELCOME50 and open Pro checkout */
  onApplyOffer?: () => void
}

export default function WelcomeOfferBanner({ createdAt, plan, onApplyOffer }: Props) {
  const [visible, setVisible] = useState(false)
  const [daysLeft, setDaysLeft] = useState(14)
  const { t } = useI18n()

  useEffect(() => {
    if (plan !== 'free') return

    const accountAge = Date.now() - new Date(createdAt).getTime()
    if (accountAge < FOURTEEN_DAYS_MS) return

    // Check if already dismissed permanently
    const dismissed = localStorage.getItem(LS_DISMISSED_KEY)
    if (dismissed === '1') return

    // Determine first shown timestamp
    let firstShown = parseInt(localStorage.getItem(LS_FIRST_SHOWN_KEY) ?? '0', 10)
    if (!firstShown) {
      firstShown = Date.now()
      localStorage.setItem(LS_FIRST_SHOWN_KEY, String(firstShown))
    }

    // Check if 14-day offer window has expired
    const offerExpiry = firstShown + FOURTEEN_DAYS_MS
    if (Date.now() > offerExpiry) return

    const msLeft = offerExpiry - Date.now()
    const days = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
    setDaysLeft(days)
    setVisible(true)
  }, [createdAt, plan])

  const dismiss = () => {
    localStorage.setItem(LS_DISMISSED_KEY, '1')
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
          {t('app_dashboard.welcome_offer_title')}
        </p>
        <p className="text-xs text-app-muted mt-1">
          {t('app_dashboard.welcome_offer_expires')}{' '}
          <span className="font-mono tabular-nums text-amber-ink font-semibold">
            {daysLeft} {daysLeft === 1 ? t('app_dashboard.w_day') : t('app_dashboard.w_days')}
          </span>
          {' · '}
          {t('app_dashboard.welcome_offer_code')}{' '}
          <span className="font-mono font-semibold text-amber-ink">WELCOME50</span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onApplyOffer && (
          <button
            onClick={onApplyOffer}
            className="text-[11px] font-bold px-3.5 py-2 bg-gradient-to-b from-amber-bright to-amber text-void rounded-xl hover:from-amber-bright hover:to-amber-bright transition-all whitespace-nowrap"
          >
            {t('app_dashboard.welcome_offer_cta')} →
          </button>
        )}
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

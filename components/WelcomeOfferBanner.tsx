'use client'
import { useState, useEffect } from 'react'

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
    <div className="relative flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-2xl px-5 py-4 mb-6">
      <span className="text-2xl flex-shrink-0">🎁</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-amber-800 dark:text-amber-300 leading-tight">
          Welcome offer — 50% off your first month
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
          Expires in <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span> · Code:{' '}
          <span className="font-mono font-bold">WELCOME50</span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onApplyOffer && (
          <button
            onClick={onApplyOffer}
            className="text-xs font-bold px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-black rounded-xl transition-all"
          >
            Claim offer →
          </button>
        )}
        <button
          onClick={dismiss}
          className="text-amber-500/60 hover:text-amber-700 transition-colors text-sm w-6 h-6 flex items-center justify-center"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

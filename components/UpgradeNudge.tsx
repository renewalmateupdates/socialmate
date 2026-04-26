'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface UpgradeNudgeProps {
  title: string
  description: string
  cta: string
  href: string
  variant?: 'banner' | 'inline'
  dismissKey?: string // localStorage key for 7-day dismiss
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function UpgradeNudge({
  title,
  description,
  cta,
  href,
  variant = 'banner',
  dismissKey,
}: UpgradeNudgeProps) {
  const [visible, setVisible] = useState(!dismissKey) // if no dismissKey, always show

  useEffect(() => {
    if (!dismissKey) return
    try {
      const stored = localStorage.getItem(dismissKey)
      if (stored) {
        const dismissedAt = parseInt(stored, 10)
        if (Date.now() - dismissedAt < SEVEN_DAYS_MS) {
          setVisible(false)
          return
        }
      }
    } catch {}
    setVisible(true)
  }, [dismissKey])

  const handleDismiss = () => {
    if (!dismissKey) return
    try {
      localStorage.setItem(dismissKey, String(Date.now()))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  if (variant === 'inline') {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-amber-400 leading-tight">{title}</p>
            <p className="text-xs text-amber-300/70 mt-0.5 leading-snug">{description}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              href={href}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
            >
              {cta}
            </Link>
            {dismissKey && (
              <button
                onClick={handleDismiss}
                className="text-amber-500/50 hover:text-amber-400 transition-colors text-sm leading-none ml-1"
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // banner variant
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 flex items-start gap-3">
      <span className="text-amber-400 text-base flex-shrink-0 mt-0.5">⚡</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-300 leading-tight">{title}</p>
        <p className="text-xs text-amber-300/70 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        <Link
          href={href}
          className="text-xs font-bold text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
        >
          {cta}
        </Link>
        {dismissKey && (
          <button
            onClick={handleDismiss}
            className="text-amber-500/50 hover:text-amber-400 transition-colors text-sm leading-none w-6 h-6 flex items-center justify-center rounded"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

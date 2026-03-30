'use client'
import { useState, useEffect } from 'react'

const PH_URL = 'https://www.producthunt.com/posts/socialmate-2'
const DISMISS_KEY = 'ph-launch-banner-dismissed-2026'

export default function PHLaunchBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show April 1–2, 2026 (Eastern time) — or always show if dismissed flag not set
    const now = new Date()
    const month = now.getMonth() // 0-indexed, 3 = April
    const date  = now.getDate()
    const year  = now.getFullYear()

    const isLaunchWindow = year === 2026 && month === 3 && (date === 1 || date === 2)
    const dismissed = localStorage.getItem(DISMISS_KEY)

    if (isLaunchWindow && !dismissed) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative z-50 bg-[#FF6154] text-white text-sm font-semibold">
      <div className="max-w-6xl mx-auto px-4 h-10 flex items-center justify-center gap-3">
        {/* PH logo */}
        <svg width="16" height="16" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm2.17 17.33H10.5V8.67h4.67c1.38 0 2.5 1.12 2.5 2.5v3.66c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
        </svg>
        <span>🚀 SocialMate is live on Product Hunt today!</span>
        <a
          href={PH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity whitespace-nowrap">
          Support us →
        </a>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  )
}

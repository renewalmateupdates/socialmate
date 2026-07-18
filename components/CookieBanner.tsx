'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-4xl mx-auto bg-panel border border-edge rounded-2xl shadow-2xl shadow-black/50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          {/* These widgets render from the root layout, OUTSIDE any page's `dark`
              wrapper, so `dark:` variants never activate here and the light-mode
              base classes were what actually shipped. Token classes only. */}
          <p className="mb-1.5 font-mono text-eyebrow uppercase text-ink-muted">Cookies</p>
          <p className="text-small leading-relaxed text-ink-body">
            We use essential cookies to keep you signed in and keep the app secure. No advertising cookies, no tracking pixels.{' '}
            <Link href="/privacy" className="text-ink-high font-medium underline hover:no-underline">
              Privacy Policy →
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="tap px-4 py-2 text-small text-ink-muted hover:text-ink-high border border-edge hover:border-edge-lit rounded-xl"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="tap px-4 py-2 text-small font-semibold bg-amber text-void rounded-xl hover:bg-amber/90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
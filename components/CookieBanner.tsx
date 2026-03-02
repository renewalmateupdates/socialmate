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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1">🍪 We use cookies</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            We use essential cookies to keep you signed in and keep the app secure. No advertising cookies, no tracking pixels.{' '}
            <Link href="/privacy" className="text-black font-semibold underline hover:no-underline">
              Privacy Policy →
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 rounded-xl transition-all"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs font-bold bg-black text-white rounded-xl hover:opacity-80 transition-all"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
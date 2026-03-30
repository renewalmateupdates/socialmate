'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const PH_URL = 'https://www.producthunt.com/posts/socialmate-2'

export default function HeroLaunchBadge() {
  const [mode, setMode] = useState<'pre' | 'live' | 'hidden'>('hidden')

  useEffect(() => {
    const now  = new Date()
    const y    = now.getFullYear()
    const m    = now.getMonth()
    const d    = now.getDate()

    if (y === 2026 && m === 3) {
      if (d < 1)           setMode('pre')
      else if (d <= 2)     setMode('live')
    } else if (y === 2026 && m < 3) {
      setMode('pre')
    }
  }, [])

  if (mode === 'hidden') return null

  if (mode === 'live') {
    return (
      <Link
        href={PH_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#FF6154]/10 border border-[#FF6154]/30 text-[#FF6154] dark:text-[#ff7a6e] text-xs font-bold px-4 py-2 rounded-full mb-4 hover:bg-[#FF6154]/20 transition-colors">
        <svg width="13" height="13" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm2.17 17.33H10.5V8.67h4.67c1.38 0 2.5 1.12 2.5 2.5v3.66c0 1.38-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
        🚀 We're live on Product Hunt today — support us →
      </Link>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 text-xs font-bold px-4 py-2 rounded-full mb-4">
      <svg width="13" height="13" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm2.17 17.33H10.5V8.67h4.67c1.38 0 2.5 1.12 2.5 2.5v3.66c0 1.38-1.12 2.5-2.5 2.5z" fill="currentColor"/>
      </svg>
      🚀 Launching on Product Hunt · April 1st
    </div>
  )
}

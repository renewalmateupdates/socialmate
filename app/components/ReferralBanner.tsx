'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ReferralBanner({ refCode }: { refCode: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [isAffiliate, setIsAffiliate] = useState(false)

  useEffect(() => {
    fetch(`/api/affiliate/check-code?ref=${refCode}`)
      .then(r => r.json())
      .then(d => setIsAffiliate(d.isAffiliate))
      .catch(() => {})
  }, [refCode])

  if (dismissed) return null

  return (
    <div className="w-full bg-black text-white text-sm py-2.5 px-4 flex items-center justify-center gap-3 relative">
      <span>🎁</span>
      <span className="font-medium">
        {isAffiliate
          ? 'You\'ve been referred by a SocialMate affiliate — create your free account and get started instantly.'
          : 'You\'ve been invited to SocialMate — create your free account and get started instantly.'
        }
      </span>
      <Link href="/signup" className="font-bold underline hover:no-underline ml-1">
        Get started free →
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 text-white/60 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  )
}
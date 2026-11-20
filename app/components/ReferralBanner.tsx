'use client'
import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Gift } from 'lucide-react'

// The code comes from the address bar, read in the browser. The homepage used
// to pass it in from searchParams, which stopped the page from being cached
// (app/page.tsx). The server render and hydration see no code, then the
// browser's answer replaces it, so there is no hydration mismatch.
const noSubscription = () => () => {}
const refFromUrl = () => new URLSearchParams(window.location.search).get('ref')?.trim() ?? ''
const noRefOnServer = () => ''

export default function ReferralBanner() {
  const refCode = useSyncExternalStore(noSubscription, refFromUrl, noRefOnServer)
  const [dismissed, setDismissed] = useState(false)
  const [isAffiliate, setIsAffiliate] = useState(false)

  useEffect(() => {
    if (!refCode) return
    fetch(`/api/affiliate/check-code?ref=${encodeURIComponent(refCode)}`)
      .then(r => r.json())
      .then(d => setIsAffiliate(d.isAffiliate))
      .catch(() => {})
  }, [refCode])

  if (!refCode || dismissed) return null

  return (
    <div className="w-full bg-black text-white text-sm py-2.5 px-4 flex items-center justify-center gap-3 relative">
      <Gift size={16} strokeWidth={2} />
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

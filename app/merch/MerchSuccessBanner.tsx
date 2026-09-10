'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PartyPopper } from 'lucide-react'

// The success banner is the only thing on /merch that depended on the URL query.
// Reading searchParams in the page opted the whole route into dynamic rendering,
// so every visit re-ran the blocking Printify fetch server-side instead of being
// served from the ISR cache. Reading it here — behind a Suspense boundary, which
// useSearchParams requires under static rendering — lets the page stay static.
function Banner() {
  const confirmed = useSearchParams().get('success') === 'true'
  if (!confirmed) return null

  return (
    <div style={{
      background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.3)',
      padding: '16px 24px', textAlign: 'center',
    }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <PartyPopper size={15} strokeWidth={2} /> Order confirmed! Your merch is being printed and will ship soon. Check your email for tracking.
      </span>
    </div>
  )
}

export function MerchSuccessBanner() {
  return (
    <Suspense fallback={null}>
      <Banner />
    </Suspense>
  )
}

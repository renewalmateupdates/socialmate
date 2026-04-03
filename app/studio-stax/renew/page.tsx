'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'

interface RenewalData {
  valid:         boolean
  expired?:      boolean
  listing?:      { id: string; name: string; tagline: string }
  buyerName?:    string
  originalPrice?: number // cents
  renewalPrice?:  number // cents
  expiresAt?:    string
  daysRemaining?: number
}

function RenewInner() {
  const params    = useSearchParams()
  const token     = params.get('token') || ''
  const [data, setData]       = useState<RenewalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`/api/studio-stax/renew?token=${token}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load. Contact hello@socialmate.studio'); setLoading(false) })
  }, [token])

  const handleRenew = async () => {
    setPaying(true)
    setError('')
    try {
      const res  = await fetch('/api/studio-stax/renew', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setError(json.error || 'Something went wrong. Please try again.')
        setPaying(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin mx-auto" />
    </div>
  )

  if (!token || !data?.valid) return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="text-4xl mb-4">{data?.expired ? '⏰' : '🔗'}</div>
      <h1 className="text-xl font-extrabold mb-3 text-gray-900 dark:text-gray-100">
        {data?.expired ? 'Renewal link expired' : 'Invalid renewal link'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {data?.expired
          ? "This renewal link has expired. Check your email for a fresh one, or contact us."
          : "This link is not valid. Use the link from your renewal reminder email."}
      </p>
      <a href="mailto:hello@socialmate.studio" className="text-sm font-semibold text-amber-500 hover:text-amber-400">
        hello@socialmate.studio →
      </a>
    </div>
  )

  const renewDollars    = (data.renewalPrice ?? 0) / 100
  const originalDollars = (data.originalPrice ?? 0) / 100
  const savings         = originalDollars - renewDollars
  const expiryDate      = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''
  const isUrgent        = (data.daysRemaining ?? 999) <= 7

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-4 ${
          isUrgent
            ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
        }`}>
          {isUrgent ? '🚨 Expiring soon' : '🔄 Annual renewal'}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-1">
          Renew your listing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hey {data.buyerName} — keep <strong>{data.listing!.name}</strong> live in Studio Stax.
        </p>
      </div>

      {/* Expiry warning */}
      <div className={`rounded-2xl p-4 mb-6 border ${
        isUrgent
          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
      }`}>
        <p className={`text-sm font-semibold ${isUrgent ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {isUrgent
            ? `⚠️ Your listing expires in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''} — renew now to avoid losing your spot.`
            : `Your listing expires on ${expiryDate} (${data.daysRemaining} days away).`}
        </p>
      </div>

      {/* Listing preview */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Your listing</p>
        <p className="font-extrabold text-gray-900 dark:text-gray-100">{data.listing!.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{data.listing!.tagline}</p>
      </div>

      {/* Renewal pricing card */}
      <div className="rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-950/20 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">Annual renewal</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${renewDollars}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/year</span>
            </div>
          </div>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">20% off</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-400 font-semibold mb-4">
          You save ${savings}/year as a loyal member (was ${originalDollars}/yr).
        </p>
        <div className="pt-4 border-t border-green-200 dark:border-green-800 space-y-2">
          {[
            'Listed for another 12 months',
            'Your SM-Give ranking is preserved',
            'Blog feature article continues every 3 months',
            'Renewal reminder emails at 30/14/7 days',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="text-green-500 font-bold">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleRenew}
        disabled={paying}
        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl text-base hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {paying ? 'Redirecting to payment...' : `Renew for $${renewDollars} →`}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
        Secure payment via Stripe · One-time annual renewal · No subscription
      </p>

      <div className="mt-8 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">From the SocialMate family</p>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Track all your subscriptions free with RenewalMate</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Never miss a renewal — RenewalMate tracks every tool automatically.</p>
        <a href="https://renewalmate.com" className="text-xs font-bold text-amber-500 hover:text-amber-400">renewalmate.com →</a>
      </div>
    </div>
  )
}

export default function StudioStaxRenewPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
        </div>
      }>
        <RenewInner />
      </Suspense>
    </PublicLayout>
  )
}

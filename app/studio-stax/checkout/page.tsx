'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'

interface CheckoutData {
  listing:        { id: string; name: string; tagline: string; applicant_name: string }
  slotsFilled:    number
  slotsRemaining: number
  foundingFull:   boolean
  currentTier:    'founding' | 'standard'
  annualPrice:    number   // in cents
  founderPrice:   number   // in cents
  standardPrice:  number   // in cents
  slotsTotal:     number
  valid:          boolean
  expired?:       boolean
}

function CheckoutInner() {
  const params    = useSearchParams()
  const token     = params.get('token') || ''
  const [data, setData]       = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`/api/studio-stax/checkout?token=${token}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load checkout. Try again or contact hello@socialmate.studio'); setLoading(false) })
  }, [token])

  const handlePay = async () => {
    setPaying(true)
    setError('')
    try {
      const res  = await fetch('/api/studio-stax/checkout', {
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
        {data?.expired ? 'This link has expired' : 'Invalid checkout link'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {data?.expired
          ? "Checkout links expire after 7 days. Contact us and we'll send a fresh one."
          : "This link is not valid. Make sure you're using the link from your approval email."}
      </p>
      <a href="mailto:hello@socialmate.studio" className="text-sm font-semibold text-amber-500 hover:text-amber-400">
        hello@socialmate.studio →
      </a>
    </div>
  )

  const price          = (data.annualPrice / 100)
  const renewalPrice   = data.currentTier === 'founding' ? data.founderPrice * 0.8 / 100 : data.standardPrice * 0.8 / 100
  const isFoundingTier = !data.foundingFull
  const pctFilled      = Math.min(100, Math.round((data.slotsFilled / data.slotsTotal) * 100))

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-4">
          Studio Stax — Secure Checkout
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-1">
          Complete your listing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You're approved, <strong>{data.listing.applicant_name}</strong>. Finish payment to go live.
        </p>
      </div>

      {/* Listing preview */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Your listing</p>
        <p className="font-extrabold text-gray-900 dark:text-gray-100">{data.listing.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{data.listing.tagline}</p>
      </div>

      {/* Founder progress bar */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            {isFoundingTier ? '🔥 Founder spots available' : '✅ Founder spots filled'}
          </span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            {data.slotsFilled} / {data.slotsTotal} claimed
          </span>
        </div>
        <div className="w-full bg-amber-100 dark:bg-amber-900/30 rounded-full h-1.5 mb-2">
          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${pctFilled}%` }} />
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-500">
          {isFoundingTier
            ? `${data.slotsRemaining} of ${data.slotsTotal} founder spots remain at $${data.founderPrice / 100}/yr. Price rises to $${data.standardPrice / 100} after.`
            : `All ${data.slotsTotal} founder spots are filled — joining at the standard rate.`}
        </p>
      </div>

      {/* Pricing card */}
      <div className={`rounded-2xl p-6 mb-6 border-2 ${
        isFoundingTier
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">Annual listing</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${price}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/year</span>
            </div>
          </div>
          {isFoundingTier && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">Founder price</span>
          )}
        </div>

        {isFoundingTier ? (
          <div className="space-y-1 mb-4">
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Founder rate: ${data.founderPrice / 100}/yr. Price goes to ${data.standardPrice / 100}/yr after founding spots fill.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Early renewal rate: ${renewalPrice}/yr (20% off).
            </p>
          </div>
        ) : (
          <div className="space-y-1 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All {data.slotsTotal} founding spots are filled — joining at the standard rate.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Early renewal rate: ${renewalPrice}/yr (20% off).
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {[
            'Listed for 12 months from purchase date',
            'SM-Give donation ranking — give more, rank higher',
            'Renewal reminder emails at 30/14/7 days',
            'Blog feature article at 3 months, then every 3 months active',
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
        onClick={handlePay}
        disabled={paying}
        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl text-base hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {paying ? 'Redirecting to payment...' : `Pay $${price} — Go live →`}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
        Secure payment via Stripe · One-time annual payment · No subscription
      </p>

      <div className="mt-8 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">From the SocialMate family</p>
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Track subscriptions free with RenewalMate</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Keep tabs on your Studio Stax renewal and all your tools automatically.</p>
        <a href="https://renewalmate.com" className="text-xs font-bold text-amber-500 hover:text-amber-400">renewalmate.com →</a>
      </div>
    </div>
  )
}

export default function StudioStaxCheckoutPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
        </div>
      }>
        <CheckoutInner />
      </Suspense>
    </PublicLayout>
  )
}

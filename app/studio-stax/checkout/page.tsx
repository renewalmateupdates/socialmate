'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'

const ANNUAL_FOUNDING  = 99
const ANNUAL_STANDARD  = 149
const QUARTERLY        = 49
const FOUNDING_LIMIT   = 100

interface CheckoutData {
  listing: { id: string; name: string; tagline: string; applicant_name: string }
  slotsFilled: number
  slotsRemaining: number
  currentQuarter: string
  isMidQuarter: boolean
  nextQuarter: string
  valid: boolean
  expired?: boolean
}

function CheckoutInner() {
  const params   = useSearchParams()
  const token    = params.get('token') || ''
  const [data, setData]       = useState<CheckoutData | null>(null)
  const [billing, setBilling] = useState<'annual' | 'quarterly'>('annual')
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, billingType: billing }),
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

  const annualPrice    = data && data.slotsRemaining > 0 ? ANNUAL_FOUNDING : ANNUAL_STANDARD
  const foundingActive = data ? data.slotsRemaining > 0 : false
  const quarterTarget  = data?.isMidQuarter ? data.nextQuarter : data?.currentQuarter

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-3xl mb-4">⏳</div>
        <p className="text-sm text-gray-500">Loading your checkout...</p>
      </div>
    )
  }

  if (!token || (data && !data.valid)) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-extrabold mb-3 text-gray-900 dark:text-gray-100">
          {data?.expired ? 'Link expired' : 'Invalid link'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {data?.expired
            ? 'This checkout link has expired. Reply to your approval email to request a new one.'
            : 'This link is invalid. Make sure you used the full URL from your approval email.'}
        </p>
        <a href="mailto:hello@socialmate.studio"
          className="text-sm font-bold text-amber-500 hover:text-amber-400">
          hello@socialmate.studio →
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5 text-xs font-bold text-green-700 dark:text-green-400 mb-4">
          ✅ Application approved
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          Complete your listing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-gray-100">{data?.listing.name}</span>
          {' '}is approved for Studio Stax. Choose your plan below.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-6">
        {(['annual', 'quarterly'] as const).map(b => (
          <button key={b} onClick={() => setBilling(b)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              billing === b ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}>
            {b === 'annual' ? 'Annual' : 'Quarterly'}
          </button>
        ))}
      </div>

      {/* Price card */}
      <div className={`rounded-2xl border-2 p-6 mb-6 ${
        billing === 'annual' ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
      }`}>
        {billing === 'annual' ? (
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${annualPrice}</span>
              <span className="text-sm text-gray-500 mb-1.5">/year</span>
              {foundingActive && annualPrice === ANNUAL_FOUNDING && (
                <span className="ml-auto text-xs font-bold bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Founding price
                </span>
              )}
            </div>
            {foundingActive ? (
              <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-3">
                {data!.slotsRemaining} of {FOUNDING_LIMIT} founding spots still available this quarter.
                After they fill, the price goes to ${ANNUAL_STANDARD}/year.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Founding spots are filled for this quarter. Standard annual rate.
              </p>
            )}
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Listed for a full year</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Renewal reminder emails at 30/14/7 days before expiry</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Early renewal at $80/year (saves you ${ANNUAL_STANDARD - 80})</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Blog feature written when your year is up</li>
            </ul>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${QUARTERLY}</span>
              <span className="text-sm text-gray-500 mb-1.5">/quarter</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-3">
              {data?.isMidQuarter
                ? `Starts ${quarterTarget} (we're mid-quarter — your slot begins next quarter)`
                : `Current quarter: ${quarterTarget}`}
            </p>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Listed for one full quarter</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Renew each quarter to stay listed</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">→</span> Annual saves you ${(QUARTERLY * 4) - annualPrice}/year vs quarterly</li>
            </ul>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">After payment</p>
        <ol className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li>1. Your listing goes live in Studio Stax immediately</li>
          <li>2. Donate to SM-Give to climb the rankings</li>
          <li>3. We write your blog feature when your year is up</li>
        </ol>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <button onClick={handlePay} disabled={paying}
        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl hover:opacity-80 transition-all disabled:opacity-50 text-sm">
        {paying ? 'Redirecting to payment...' : `Pay $${billing === 'annual' ? annualPrice : QUARTERLY} → complete listing`}
      </button>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
        Processed securely via Stripe. Questions?{' '}
        <a href="mailto:hello@socialmate.studio" className="underline">hello@socialmate.studio</a>
      </p>
    </div>
  )
}

export default function StudioStaxCheckout() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }>
        <CheckoutInner />
      </Suspense>
    </PublicLayout>
  )
}

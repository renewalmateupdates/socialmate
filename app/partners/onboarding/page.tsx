'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const gold   = '#F59E0B'
const purple = '#7C3AED'
const dark   = '#0a0a0a'
const surface = '#111111'
const border  = '#222222'
const muted   = '#6b7280'

const AFFILIATE_TOS = `
SOCIALMATE AFFILIATE PARTNER AGREEMENT
Effective: ${new Date().getFullYear()} · Gilgamesh Enterprise LLC

1. PROGRAM OVERVIEW
The SocialMate Affiliate Program ("Program") allows approved partners ("Affiliate") to earn commissions by referring paying customers to SocialMate.

2. COMMISSION RATES
• Subscriptions: 30% recurring base commission; 40% when Affiliate maintains 100+ active referrals
• Credit packs: 10% flat one-time commission
• Commissions are calculated on net revenue after refunds, chargebacks, and payment processing fees

3. PROMO CODES
Each Affiliate receives unique promo codes: a 3-month 20%-off code and a 6-month 15%-off code. Affiliates may not use their own promo codes for personal purchases.

4. PAYOUT RULES
• New earnings are subject to a 60-day holding period for fraud protection
• Payouts are processed weekly after the 60-day hold, via Stripe Connect
• Minimum payout balance: $25.00
• SocialMate reserves the right to withhold payouts pending investigation of fraudulent activity

5. TAX WITHHOLDING (W-9 REQUIREMENT)
• U.S. Affiliates who earn $600 or more in a calendar year are required by IRS regulations to submit a W-9 form
• SocialMate will notify Affiliates via email at day 1, 14, 30, 45, 55, and 59 after withholding threshold is reached
• W-9 forms must be submitted within 60 days of the withholding notification
• If a W-9 is not submitted within the 60-day window, withheld funds will be forfeited permanently. Forfeited funds are distributed as follows: 50% to SM-Give (SocialMate's charitable initiative) and 50% to Gilgamesh Enterprise LLC
• This policy is non-negotiable and Affiliates agree to this by accepting the Program

6. PROHIBITED CONDUCT
Affiliates may not: engage in spam, misleading advertising, cookie stuffing, trademark bidding, self-referrals, incentivized clicks, or any fraudulent activity. Violations result in immediate termination and forfeiture of all pending commissions.

7. TERMINATION
SocialMate may suspend or terminate any Affiliate account at any time for violations of this Agreement. Pending commissions for legitimate conversions will be paid after the hold period unless fraud is suspected.

8. LIMITATION OF LIABILITY
SocialMate's total liability to any Affiliate shall not exceed the commissions earned in the prior 30 days.

9. GOVERNING LAW
This Agreement is governed by the laws of the State of [Gilgamesh Enterprise LLC's jurisdiction]. Any disputes shall be resolved by binding arbitration.

By accepting this Agreement, you confirm you have read, understood, and agree to all terms above.
`

function OnboardingInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [step, setStep]           = useState(1)   // 1: TOS, 2: Profile, 3: Payout
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Step 1: TOS
  const [tosRead, setTosRead]       = useState(false)
  const [tosAgreed, setTosAgreed]   = useState(false)

  // Step 2: Profile
  const [fullName, setFullName]   = useState('')
  const [website, setWebsite]     = useState('')

  // Step 3: Payout (Stripe Connect)
  const [stripeSetupDone, setStripeSetupDone] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/partners'); return }

      const res = await fetch('/api/partners/stats')
      if (!res.ok) { router.push('/partners/access-denied'); return }
      const json = await res.json()

      if (!json.profile) { router.push('/partners/access-denied'); return }
      if (json.profile.onboarding_completed) { router.push('/partners/dashboard'); return }

      setLoading(false)
    }
    check()
  }, [router])

  async function handleTOS() {
    if (!tosAgreed) { setError('You must agree to the Affiliate Terms to continue'); return }
    setSubmitting(true)
    const res = await fetch('/api/partners/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'tos', agreed: true, token }),
    })
    if (!res.ok) { const j = await res.json(); setError(j.error); setSubmitting(false); return }
    setStep(2)
    setSubmitting(false)
  }

  async function handleProfile() {
    if (!fullName.trim()) { setError('Enter your full legal name'); return }
    setSubmitting(true)
    const res = await fetch('/api/partners/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'profile', full_name: fullName, website_url: website }),
    })
    if (!res.ok) { const j = await res.json(); setError(j.error); setSubmitting(false); return }
    setStep(3)
    setSubmitting(false)
  }

  async function handlePayoutSetup() {
    setSubmitting(true)
    // Kick off Stripe Connect onboarding
    const res = await fetch('/api/partners/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'payout_setup' }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setSubmitting(false); return }
    if (json.stripe_onboarding_url) {
      window.location.href = json.stripe_onboarding_url
    } else {
      // Mark as done if no Stripe yet (can skip)
      setStripeSetupDone(true)
      setSubmitting(false)
    }
  }

  async function handleSkipPayout() {
    setSubmitting(true)
    await fetch('/api/partners/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'complete' }),
    })
    router.push('/partners/dashboard')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const steps = [
    { n: 1, label: 'Agreement' },
    { n: 2, label: 'Profile' },
    { n: 3, label: 'Payout Setup' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: dark, padding: '48px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${gold}, ${purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
          }}>S</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#f1f1f1' }}>SocialMate</span>
          <span style={{ fontSize: 11, color: gold, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partner Onboarding</span>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: step > s.n ? '#22c55e' : step === s.n ? `linear-gradient(135deg, ${gold}, ${purple})` : '#1a1a1a',
                color: step >= s.n ? '#fff' : muted,
                border: step === s.n ? 'none' : `1px solid ${border}`,
              }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 12, color: step >= s.n ? '#f1f1f1' : muted, fontWeight: 600 }}>{s.label}</span>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: step > s.n ? '#22c55e' : border }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: TOS */}
        {step === 1 && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Affiliate Partner Agreement</h2>
            <p style={{ fontSize: 13, color: muted, margin: '0 0 20px' }}>Please read and agree to the terms before accessing your portal.</p>

            <div
              onScroll={(e) => {
                const el = e.currentTarget
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setTosRead(true)
              }}
              style={{
                background: '#0a0a0a', border: `1px solid ${border}`, borderRadius: 10,
                padding: 20, height: 280, overflowY: 'scroll', marginBottom: 20,
                fontSize: 12, color: '#9ca3af', lineHeight: 1.8, whiteSpace: 'pre-wrap',
              }}
            >
              {AFFILIATE_TOS}
              {!tosRead && (
                <div style={{ textAlign: 'center', padding: '8px 0 0', color: gold, fontSize: 11, fontWeight: 600 }}>
                  ↓ Scroll to read the full agreement
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
              <input
                type="checkbox"
                checked={tosAgreed}
                onChange={e => setTosAgreed(e.target.checked)}
                style={{ marginTop: 2, accentColor: gold }}
              />
              <span style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>
                I have read and agree to the SocialMate Affiliate Partner Agreement, including the W-9 requirement and forfeiture policy.
              </span>
            </label>

            {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</p>}

            <button
              onClick={handleTOS}
              disabled={submitting || !tosAgreed}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: tosAgreed ? `linear-gradient(135deg, ${gold}, ${purple})` : '#1a1a1a',
                color: tosAgreed ? '#fff' : muted,
                fontSize: 14, fontWeight: 700, cursor: tosAgreed ? 'pointer' : 'not-allowed',
                opacity: submitting ? 0.6 : 1, fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Saving...' : 'I Agree — Continue →'}
            </button>
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Your Profile</h2>
            <p style={{ fontSize: 13, color: muted, margin: '0 0 24px' }}>Tell us a bit about yourself for our records.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Full Legal Name *
                </label>
                <input
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: '#0a0a0a', border: `1px solid ${border}`,
                    color: '#f1f1f1', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Website / Social (optional)
                </label>
                <input
                  value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: '#0a0a0a', border: `1px solid ${border}`,
                    color: '#f1f1f1', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {error && <p style={{ fontSize: 13, color: '#f87171', margin: '16px 0 0' }}>{error}</p>}

            <button
              onClick={handleProfile}
              disabled={submitting}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${gold}, ${purple})`,
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                opacity: submitting ? 0.6 : 1, marginTop: 24, fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        )}

        {/* Step 3: Payout Setup */}
        {step === 3 && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              {stripeSetupDone ? '🎉 You\'re all set!' : 'Set Up Payouts'}
            </h2>
            <p style={{ fontSize: 13, color: muted, margin: '0 0 24px', lineHeight: 1.6 }}>
              {stripeSetupDone
                ? 'Your affiliate portal is ready. Go to your dashboard to see your referral link, promo codes, and earnings.'
                : 'Connect your Stripe account to receive weekly payouts directly to your bank. You can set this up now or come back later.'}
            </p>

            {!stripeSetupDone && (
              <div style={{ background: '#0a0a0a', border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: muted, margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payout Info</p>
                {[
                  '✅ Weekly payouts after 60-day hold',
                  '✅ Minimum $25.00 balance required',
                  '✅ Direct bank deposit via Stripe Connect',
                  '⚠️  W-9 required at $599 lifetime earnings',
                ].map((item, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 6px', lineHeight: 1.5 }}>{item}</p>
                ))}
              </div>
            )}

            {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</p>}

            {stripeSetupDone ? (
              <button
                onClick={() => router.push('/partners/dashboard')}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${gold}, ${purple})`,
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Go to Dashboard →
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handlePayoutSetup}
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${gold}, ${purple})`,
                    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    opacity: submitting ? 0.6 : 1, fontFamily: 'inherit',
                  }}
                >
                  {submitting ? 'Redirecting to Stripe...' : 'Connect Stripe Account →'}
                </button>
                <button
                  onClick={handleSkipPayout}
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    border: `1px solid ${border}`, background: 'transparent',
                    color: muted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Skip for now — set up later
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  )
}

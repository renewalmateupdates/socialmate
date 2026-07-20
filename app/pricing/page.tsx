'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const LS_WELCOME_FIRST_SHOWN = 'welcome_offer_first_shown'
const LS_WELCOME_DISMISSED = 'welcome_offer_dismissed'

const STRIPE_PRO_PRICE_ID               = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID            = 'price_1TFMHp7OMwDowUuUgeLAeJNY'
const STRIPE_PRO_ANNUAL_PRICE_ID        = 'price_1TFMHx7OMwDowUuUl9PqWxMs'
const STRIPE_AGENCY_ANNUAL_PRICE_ID     = 'price_1TFMI07OMwDowUuUoHfKJEpo'
const STRIPE_WHITE_LABEL_BASIC_PRICE_ID = 'price_1TFMHt7OMwDowUuU56Fzw4fE'
const STRIPE_WHITE_LABEL_PRO_PRICE_ID   = 'price_1TFMIG7OMwDowUuUcjNNGB0Q'

type Interval = 'monthly' | 'annual'

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthly: 0,
    annualSaving: 0,
    description: 'Everything you need to get started — no credit card, no catch.',
    badge: 'Always Free',
    badgeStyle: 'border border-jade/40 bg-jade/10 text-jade',
    cardBg: 'bg-panel',
    color: 'border border-edge',
    headerText: 'text-ink-high',
    subText: 'text-ink-muted',
    features: [
      { label: '7 live platforms now',             note: '3 more coming soon' },
      { label: '1 connected account per platform'                              },
      { label: '2 team seats'                                                  },
      { label: '100 posts / month'                                             },
      { label: '50 AI credits / month',            note: 'banks up to 75'     },
      { label: '1 GB media storage'                                            },
      { label: '2-week scheduling window'                                      },
      { label: '14-day & 30-day analytics'                                     },
      { label: 'Link in Bio page'                                              },
      { label: 'Bulk scheduler'                                                },
      { label: 'Post templates & hashtag library'                              },
      { label: 'Content Gap Detector',             note: '10 credits'         },
      { label: 'Competitor tracking',              note: 'up to 3 accounts'   },
      { label: 'RSS / blog import'                                             },
      { label: 'Evergreen content recycling'                                   },
    ],
    cta: 'Get Started Free',
    ctaHref: '/signup',
    monthlyPriceId: null,
    annualPriceId: null,
    ctaStyle: 'border border-edge-lit text-ink-high hover:border-ink-muted hover:bg-raised',
  },
  {
    name: 'Pro',
    monthlyPrice: 5,
    annualPrice: 55,
    annualMonthly: 4.58,
    annualSaving: 5,
    description: 'For creators and small businesses who want to grow faster.',
    badge: 'Most Popular',
    badgeStyle: 'border border-amber/40 bg-amber/10 text-amber',
    cardBg: 'bg-panel',
    color: 'border border-amber',
    headerText: 'text-ink-high',
    subText: 'text-ink-muted',
    features: [
      { label: 'Everything in Free'                                             },
      { label: '5 connected accounts per platform'                             },
      { label: '5 team seats'                                                  },
      { label: '1 client workspace'                                            },
      { label: '1,000 posts / month'                                           },
      { label: '500 AI credits / month',           note: 'banks up to 750'    },
      { label: '10 GB media storage'                                           },
      { label: '1-month scheduling window'                                     },
      { label: '90-day analytics history'                                      },
      { label: 'AI Content Calendar',              note: '25 credits'         },
      { label: 'AI Image Generation',              note: '25 credits'         },
      { label: 'Custom domain for Link in Bio'                                 },
      { label: 'Referral & affiliate program'                                  },
      { label: 'White Label add-on available',     note: '+$20/mo or +$40/mo' },
      { label: 'Priority support & early features'                             },
    ],
    cta: 'Start Pro',
    ctaHref: null,
    monthlyPriceId: STRIPE_PRO_PRICE_ID,
    annualPriceId: STRIPE_PRO_ANNUAL_PRICE_ID,
    ctaStyle: 'bg-gradient-to-b from-amber-bright to-amber text-void hover:from-amber-bright hover:to-amber-bright',
  },
  {
    name: 'Agency',
    monthlyPrice: 20,
    annualPrice: 209,
    annualMonthly: 17.42,
    annualSaving: 31,
    description: 'For agencies and power users managing multiple brands.',
    badge: 'Power Users',
    badgeStyle: 'border border-edge-lit bg-raised text-ink-muted',
    cardBg: 'bg-panel',
    color: 'border border-edge',
    headerText: 'text-ink-high',
    subText: 'text-ink-muted',
    features: [
      { label: 'Everything in Pro'                                              },
      { label: '10 connected accounts per platform'                            },
      { label: '15 team seats'                                                 },
      { label: '5 client workspaces',              note: 'more available on request' },
      { label: '5,000 posts / month'                                           },
      { label: '2,000 AI credits / month',         note: 'banks up to 3,000'  },
      { label: '50 GB media storage'                                           },
      { label: '3-month scheduling window'                                     },
      { label: '6-month analytics history'                                     },
      { label: 'PDF analytics reports'                                         },
      { label: 'Content approval workflows'                                    },
      { label: 'White Label add-on available',     note: '+$20/mo or +$40/mo' },
      { label: 'Dedicated support'                                             },
    ],
    cta: 'Start Agency',
    ctaHref: null,
    monthlyPriceId: STRIPE_AGENCY_PRICE_ID,
    annualPriceId: STRIPE_AGENCY_ANNUAL_PRICE_ID,
    ctaStyle: 'border border-edge-lit text-ink-high hover:border-ink-muted hover:bg-raised',
  },
]

const AI_CREDITS = [
  { feature: 'Caption Generator',       cost: '5 credits',  proOnly: false },
  { feature: 'Hashtag Generator',       cost: '5 credits',  proOnly: false },
  { feature: 'Post Rewrite / Improver', cost: '5 credits',  proOnly: false },
  { feature: 'Viral Hook Generator',    cost: '5 credits',  proOnly: false },
  { feature: 'Thread Generator',        cost: '10 credits', proOnly: false },
  { feature: 'Content Repurposer',      cost: '10 credits', proOnly: false },
  { feature: 'Post Score',              cost: '5 credits',  proOnly: false },
  { feature: 'SM-Pulse',                cost: '20 credits', proOnly: false },
  { feature: 'SM-Radar',                cost: '20 credits', proOnly: false },
  { feature: 'Content Gap Detector',    cost: '10 credits', proOnly: false },
  { feature: 'AI Content Calendar',     cost: '25 credits', proOnly: true  },
  { feature: 'AI Image Generation',     cost: '25 credits', proOnly: true  },
  { feature: 'TikTok AI Caption',       cost: '5 credits',  proOnly: false },
  { feature: 'TikTok AI Hashtags',      cost: '5 credits',  proOnly: false },
]

const WHITE_LABEL_TIERS = [
  {
    name: 'White Label Basic',
    price: '$20/mo',
    priceId: STRIPE_WHITE_LABEL_BASIC_PRICE_ID,
    tier: 'basic' as const,
    tagline: 'Sell it as your own tool. Keep 100% of the value.',
    features: [
      'Your logo replaces SocialMate everywhere',
      'Brand colors applied across the full app',
      'Your agency name in the browser tab, emails, and UI',
      'Charge clients whatever you want — we never appear',
    ],
    highlight: false,
  },
  {
    name: 'White Label Pro',
    price: '$40/mo',
    priceId: STRIPE_WHITE_LABEL_PRO_PRICE_ID,
    tier: 'pro' as const,
    tagline: 'Your own SaaS product. Zero dev work. Live in hours.',
    features: [
      'Everything in Basic',
      'Custom domain — clients see app.youragency.com',
      'SocialMate is completely invisible, even in the URL',
      'Deliver a $99/mo tool. Keep the entire margin.',
    ],
    highlight: true,
  },
]

const FAQ = [
  {
    q: 'How is the Free plan this generous?',
    a: "We built SocialMate lean from the start. By controlling AI costs through a credit system and keeping infrastructure efficient, we can offer genuinely powerful tools for free without burning out.",
  },
  {
    q: 'Will prices go up?',
    a: "We keep pricing as low as sustainably possible. Infrastructure costs are real, and pricing may adjust over time — but we'll always communicate changes clearly and in advance. No surprise charges, ever.",
  },
  {
    q: 'What happens when I run out of AI credits?',
    a: 'You can still schedule, draft, and manage posts — AI features pause until credits refresh next month. You can also earn bonus credits through referrals or buy credit packs.',
  },
  {
    q: 'Can I earn extra credits?',
    a: 'Yes — all users get access to the referral program. Every 5 paying referrals earns you +100 bonus credits, stacking with no cap.',
  },
  {
    q: 'What platforms are live right now?',
    a: 'Discord, Bluesky, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn are live — 7 platforms in total. YouTube, Pinterest, and Reddit are coming very soon. More on the roadmap.',
  },
  {
    q: 'Is White Label available on Free?',
    a: 'No — White Label is an add-on for Pro and Agency subscribers only. Basic ($20/mo) removes branding and adds your logo and colors. Pro ($40/mo) adds a custom domain for full client rebranding.',
  },
]

interface AppliedCoupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
}

export default function Pricing() {
  const { t } = useI18n()
  const [interval, setInterval] = useState<Interval>('monthly')
  const [loading, setLoading]   = useState<string | null>(null)
  const router = useRouter()

  const [couponInput, setCouponInput]       = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponApplied, setCouponApplied]   = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError]       = useState<string | null>(null)

  // Live user count
  const [userCount, setUserCount] = useState<number | null>(null)

  // Welcome offer banner state
  const [showWelcomeOffer, setShowWelcomeOffer] = useState(false)
  const [welcomeDaysLeft, setWelcomeDaysLeft]   = useState(14)

  useEffect(() => {
    // Fetch live user count
    fetch('/api/public/user-count')
      .then(r => r.json())
      .then(d => { if (typeof d.count === 'number') setUserCount(d.count) })
      .catch(() => {})

    // Welcome offer — check if user is eligible (free plan, 14+ day old account)
    // We detect plan + created_at from the session cookie via /api/auth/session pattern;
    // for the pricing page (public) we use user_settings via client-side supabase
    try {
      const dismissed = localStorage.getItem(LS_WELCOME_DISMISSED)
      if (!dismissed) {
        // Try to get user info from any auth session
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return
            const age = Date.now() - new Date(data.user.created_at).getTime()
            if (age < FOURTEEN_DAYS_MS) return

            // Check plan
            supabase
              .from('user_settings')
              .select('plan')
              .eq('user_id', data.user.id)
              .single()
              .then(({ data: settings }) => {
                if (!settings || settings.plan !== 'free') return

                let firstShown = parseInt(localStorage.getItem(LS_WELCOME_FIRST_SHOWN) ?? '0', 10)
                if (!firstShown) {
                  firstShown = Date.now()
                  localStorage.setItem(LS_WELCOME_FIRST_SHOWN, String(firstShown))
                }
                const offerExpiry = firstShown + FOURTEEN_DAYS_MS
                if (Date.now() > offerExpiry) return

                const msLeft = offerExpiry - Date.now()
                const days = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
                setWelcomeDaysLeft(days)
                setShowWelcomeOffer(true)
              })
          })
        }).catch(() => {})
      }
    } catch {}
  }, [])

  function displayUserCount(count: number | null): string {
    const n = count ?? 30
    const floored = Math.max(30, Math.floor(n / 10) * 10)
    return `${floored}`
  }

  function applyWelcomeOffer() {
    setCouponInput('WELCOME50')
    setCouponError(null)
    setCouponApplied(null)
    // Auto-validate and then scroll to Pro card
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME50' }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.valid) {
          setCouponApplied(json.coupon)
          // Scroll to plan cards
          document.querySelector('[data-plan-cards]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          setCouponError(json.error || 'Code not valid')
        }
      })
      .catch(() => { setCouponError('Could not validate code') })
  }

  const annual = interval === 'annual'

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponValidating(true)
    setCouponError(null)
    setCouponApplied(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim() }),
      })
      const json = await res.json()
      if (json.valid) {
        setCouponApplied(json.coupon)
      } else {
        setCouponError(json.error || 'Invalid code')
      }
    } catch {
      setCouponError('Could not validate code')
    } finally {
      setCouponValidating(false)
    }
  }

  function removeCoupon() {
    setCouponApplied(null)
    setCouponInput('')
    setCouponError(null)
  }

  function formatCouponDiscount(c: AppliedCoupon) {
    if (c.discount_type === 'percent') return `${c.discount_value}% off`
    if (c.discount_type === 'fixed') return `$${c.discount_value} off`
    if (c.discount_type === 'trial_extension') return `+${c.discount_value} free trial days`
    return ''
  }

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId, ...(couponApplied ? { coupon_code: couponApplied.code } : {}) }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'Unauthorized') {
        router.push(`/login?redirect=${encodeURIComponent('/settings/plan')}`)
      }
    } catch {
      console.error('Checkout failed')
    } finally {
      setLoading(null)
    }
  }

  const handleWhiteLabelCheckout = async (tier: 'basic' | 'pro', planName: string) => {
    setLoading(planName)
    try {
      const res = await fetch('/api/stripe/whitelabel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'Unauthorized') {
        router.push(`/login?redirect=${encodeURIComponent('/settings/plan')}`)
      } else if (data.error) {
        alert(data.error)
      }
    } catch {
      console.error('White label checkout failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            {t('pricing.headline')}
          </h1>
          <p className="text-ink-muted text-sm max-w-xl mx-auto leading-relaxed">
            {t('pricing.subheadline')}
          </p>
          <p className="text-xs text-ink-muted mt-4">
            <span className="font-bold text-ink-muted">{t('pricing.social_proof', { count: displayUserCount(userCount) })}</span>
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Nonprofit or student? <a href="/discount" className="text-amber hover:underline font-semibold">Special discounts available →</a>
          </p>

          <div className="flex items-center justify-center gap-1 mt-8 bg-raised rounded-2xl p-1 w-fit mx-auto">
            {(['monthly', 'annual'] as Interval[]).map(i => (
              <button key={i} onClick={() => setInterval(i)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  interval === i ? 'bg-panel text-ink-high shadow-sm' : 'text-ink-muted hover:text-ink-high'
                }`}>
                {i === 'monthly' ? t('pricing.interval_monthly') : (
                  <span className="flex items-center gap-2">
                    {t('pricing.interval_annual')}
                    <span className="text-xs font-bold text-jade bg-jade/10 px-2 py-0.5 rounded-full">{t('pricing.annual_save')}</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* COUPON CODE */}
        <div className="flex flex-col items-center mb-10">
          {couponApplied ? (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-jade/10 border border-jade/40 rounded-xl">
              <span className="text-jade text-sm font-bold">
                {couponApplied.code} — {formatCouponDiscount(couponApplied)} applied
              </span>
              <button onClick={removeCoupon} className="text-jade hover:text-jade/80 text-xs font-semibold">✕ Remove</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null) }}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  placeholder={t('pricing.coupon_placeholder')}
                  className="text-sm bg-panel border border-edge rounded-xl px-4 py-2 text-ink-high placeholder:text-ink-faint focus:outline-none focus:border-amber w-52"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponValidating || !couponInput.trim()}
                  className="px-4 py-2 bg-raised hover:bg-edge-lit disabled:opacity-50 text-ink-body text-sm font-semibold rounded-xl transition-colors"
                >
                  {couponValidating ? t('pricing.coupon_applying') : t('pricing.coupon_apply')}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500">{couponError}</p>
              )}
            </div>
          )}
        </div>

        {/* WELCOME OFFER BANNER — free users, 14+ days old, offer valid 14 days */}
        {showWelcomeOffer && (
          <div className="relative flex items-start gap-3 bg-amber/10 dark:bg-amber/10 border border-amber dark:border-amber rounded-2xl px-5 py-4 mb-8">
            <span className="text-2xl flex-shrink-0">🎁</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-amber dark:text-amber leading-tight">
                Welcome offer — 50% off your first month
              </p>
              <p className="text-xs text-amber dark:text-amber mt-0.5">
                Expires in <span className="font-bold">{welcomeDaysLeft} day{welcomeDaysLeft !== 1 ? 's' : ''}</span> · Code:{' '}
                <span className="font-mono font-bold">WELCOME50</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={applyWelcomeOffer}
                className="text-xs font-bold px-3 py-1.5 bg-amber hover:bg-amber-bright text-void rounded-xl transition-all"
              >
                Claim offer →
              </button>
              <button
                onClick={() => { localStorage.setItem(LS_WELCOME_DISMISSED, '1'); setShowWelcomeOffer(false) }}
                className="text-amber/60 hover:text-amber transition-colors text-sm w-6 h-6 flex items-center justify-center"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* BIRTHDAY PROMO BANNER — teaser before 6/15, active 6/15–12/15 */}
        {(() => {
          const now = new Date()
          const start = new Date('2026-05-17')
          const end = new Date('2026-12-16')
          const isActive = now >= start && now < end
          const isTeaser = now < start
          if (!isActive && !isTeaser) return null
          return (
            <div className={`mb-8 rounded-2xl p-5 border text-center ${
              isActive
                ? 'bg-amber/10 dark:bg-amber/10 border-amber dark:border-amber'
                : 'bg-raised border-edge'
            }`}>
              <p className="text-xl mb-1">🎂</p>
              {isActive ? (
                <>
                  <p className="text-sm font-extrabold text-amber dark:text-amber mb-1">
                    Birthday Deal — 31% off any plan
                  </p>
                  <p className="text-xs text-amber dark:text-amber mb-3 leading-relaxed">
                    Joshua's turning 31. Six months of savings. Runs through Dec 15, 2026.
                  </p>
                  <button
                    onClick={() => { setCouponInput('BDAY31'); setCouponError(null) }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber hover:bg-amber-bright text-void text-xs font-bold rounded-xl transition-all">
                    Apply code BDAY31 →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-extrabold text-ink-body mb-1">
                    Big deal dropping June 15 — 31% off everything
                  </p>
                  <p className="text-xs text-ink-muted">
                    Joshua's turning 31. Six months of discounts. Bookmark this page.
                  </p>
                </>
              )}
            </div>
          )
        })()}

        {/* PLAN CARDS */}
        <div data-plan-cards className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {PLANS.map(plan => {
            const priceId = annual ? plan.annualPriceId : plan.monthlyPriceId
            return (
              <div key={plan.name} className={`${plan.cardBg} ${plan.color} rounded-2xl overflow-hidden flex flex-col`}>
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`text-lg font-extrabold ${plan.headerText}`}>{plan.name}</h2>
                    {plan.badge && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeStyle}`}>{plan.badge}</span>
                    )}
                  </div>

                  {plan.monthlyPrice === 0 ? (
                    <div className={`flex items-end gap-1 mb-2 ${plan.headerText}`}>
                      <span className="font-mono text-4xl font-semibold tracking-tight">$0</span>
                      <span className={`text-sm mb-1.5 ${plan.subText}`}>/month, forever</span>
                    </div>
                  ) : annual ? (
                    <div className="mb-2">
                      <div className={`flex items-end gap-1 ${plan.headerText}`}>
                        <span className="font-mono text-4xl font-semibold tracking-tight">${plan.annualPrice}</span>
                        <span className={`text-sm mb-1.5 ${plan.subText}`}>/year</span>
                      </div>
                      <p className={`text-xs mt-1 ${plan.subText}`}>
                        ~${plan.annualMonthly}/mo ·{' '}
                        <span className="font-mono text-jade">save ${plan.annualSaving}</span>
                      </p>
                    </div>
                  ) : (
                    <div className={`flex items-end gap-1 mb-2 ${plan.headerText}`}>
                      <span className="font-mono text-4xl font-semibold tracking-tight">${plan.monthlyPrice}</span>
                      <span className={`text-sm mb-1.5 ${plan.subText}`}>/month</span>
                    </div>
                  )}
                  <p className={`text-xs leading-relaxed ${plan.subText}`}>{plan.description}</p>
                </div>

                <div className="px-6 py-5 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0 font-bold text-jade">✓</span>
                        <span className="text-small text-ink-body">
                          {f.label}
                          {f.note && <span className="text-ink-muted"> — {f.note}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {priceId ? (
                    <button onClick={() => handleCheckout(priceId, plan.name)}
                      disabled={loading === plan.name}
                      className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60 ${plan.ctaStyle}`}>
                      {loading === plan.name ? 'Loading...' : plan.cta}
                    </button>
                  ) : plan.ctaHref ? (
                    <Link href={plan.ctaHref}
                      className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all ${plan.ctaStyle}`}>
                      {plan.cta}
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}

          {/* Enterprise card */}
          <div className="bg-panel border border-edge-lit rounded-2xl overflow-hidden flex flex-col relative">
            {/* Top glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-edge-lit to-transparent" />
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-ink-high">Enterprise</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-raised/20 text-ink-muted border border-edge-lit/30">For Teams</span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-extrabold text-ink-high">Custom</span>
              </div>
              <p className="text-xs leading-relaxed text-ink-muted">For agencies and enterprises that need unlimited scale, custom terms, and a real SLA.</p>
            </div>

            <div className="px-6 py-5 flex-1 flex flex-col">
              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  { label: 'Everything in Agency' },
                  { label: 'Unlimited seats' },
                  { label: 'Unlimited client workspaces' },
                  { label: 'Custom credit allocation' },
                  { label: 'Dedicated onboarding' },
                  { label: 'SLA guarantee', note: '99.9% uptime' },
                  { label: 'White Label Pro included' },
                  { label: 'Priority support', note: '< 4hr response' },
                  { label: 'Custom contract' },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-ink-muted mt-0.5 flex-shrink-0 font-bold">✓</span>
                    <span className="text-xs text-ink-body">
                      {f.label}
                      {f.note && <span className="text-ink-muted"> — {f.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/enterprise"
                className="w-full text-center text-sm font-bold py-3 rounded-xl transition-all bg-raised hover:bg-edge-lit text-ink-high">
                Contact us →
              </Link>
            </div>
          </div>
        </div>

        {/* SECURE CHECKOUT BADGE */}
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span>🔒</span><span>{t('pricing.trust_stripe')}</span>
          </div>
          <div className="w-px h-3 bg-raised hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span>↩️</span><span>{t('pricing.trust_cancel')}</span>
          </div>
          <div className="w-px h-3 bg-raised hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span>💳</span><span>{t('pricing.trust_no_cc')}</span>
          </div>
        </div>

        {/* WHITE LABEL ADD-ON */}
        <div className="bg-panel border border-edge rounded-2xl p-6 mb-8">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold">{t('pricing.white_label_headline')}</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-raised text-ink-muted rounded-full">Pro & Agency only</span>
            </div>
            <p className="text-xs text-ink-muted">Turn SocialMate into your own branded product. Agencies are charging $99–$299/mo for tools built on exactly this. Your clients never know we exist.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHITE_LABEL_TIERS.map(wl => (
              <div key={wl.name} className={`border-2 rounded-2xl p-5 ${wl.highlight ? 'border-amber' : 'border-edge'}`}>
                {wl.highlight && (
                  <span className="text-xs font-bold bg-amber text-void px-2 py-0.5 rounded-full mb-3 inline-block">Best for agencies</span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-extrabold">{wl.name}</p>
                    <p className="text-xl font-extrabold mt-0.5">{wl.price}</p>
                    <p className="text-xs text-ink-muted mt-1 leading-snug max-w-[180px]">{wl.tagline}</p>
                  </div>
                  <button
                    onClick={() => handleWhiteLabelCheckout(wl.tier, wl.name)}
                    disabled={loading === wl.name}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-60 ${
                      wl.highlight
                        ? 'bg-amber text-void hover:bg-amber-bright'
                        : 'border border-edge text-ink-body hover:border-ink-muted'
                    }`}>
                    {loading === wl.name ? 'Loading...' : 'Add to plan →'}
                  </button>
                </div>
                <ul className="space-y-2">
                  {wl.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="text-jade font-bold flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* AI CREDIT COSTS */}
        <div className="bg-panel border border-edge rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold mb-1">{t('pricing.ai_credits_title')}</h3>
              <p className="text-xs text-ink-muted max-w-xl">
                {t('pricing.ai_credits_sub')}
              </p>
            </div>
            <Link href="/ai-features"
              className="text-xs font-bold text-ink-high hover:underline flex-shrink-0 ml-4">
              See all tools →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AI_CREDITS.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-raised rounded-xl px-3 py-2.5">
                <span className="text-xs text-ink-body font-semibold">
                  {item.feature}
                  {item.proOnly && (
                    <span className="ml-1.5 text-xs font-bold text-violet bg-violet/10 bg-violet/10 px-1.5 py-0.5 rounded-full">Pro+</span>
                  )}
                </span>
                <span className="text-xs font-extrabold text-ink-high ml-3 flex-shrink-0">{item.cost}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-ink-muted">Editing AI-generated content is always free — credits only charge on generation.</p>
            <Link href="/settings?tab=Plan"
              className="text-xs font-bold text-ink-high hover:underline flex-shrink-0">
              Buy credit packs →
            </Link>
          </div>
        </div>

        {/* CREDIT PACKS */}
        <div className="bg-void text-ink-high rounded-2xl p-6 mb-8 border border-edge">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold mb-1">Need more credits?</h3>
              <p className="text-xs text-ink-muted">One-time credit packs — added to your balance instantly. No subscription.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Starter',  credits: '100 cr',   price: '$1.99'  },
              { label: 'Popular',  credits: '300 cr',   price: '$4.99',  badge: true },
              { label: 'Pro Pack', credits: '750 cr',   price: '$9.99'  },
              { label: 'Max Pack', credits: '2,000 cr', price: '$19.99', bestValue: true },
            ].map((pack: any) => (
              <div key={pack.label} className={`bg-raised rounded-xl p-4 text-center relative ${pack.badge ? 'ring-1 ring-amber' : ''} ${pack.bestValue ? 'ring-1 ring-amber' : ''}`}>
                {pack.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-amber text-void px-2 py-0.5 rounded-full">Popular</span>
                )}
                {pack.bestValue && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-amber text-void px-2 py-0.5 rounded-full">Best value</span>
                )}
                <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                <p className="text-xs text-ink-muted mb-2">{pack.credits}</p>
                <p className="text-lg font-extrabold">{pack.price}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted mt-4 text-center">Purchase credit packs from Settings → Plan after signing up</p>
        </div>

        {/* X BOOSTER PACKS */}
        <div className="bg-void text-ink-high rounded-2xl p-6 mb-8 border border-edge">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">𝕏</span>
                <h3 className="text-base font-extrabold">{t('pricing.x_boosters_headline')}</h3>
              </div>
              <p className="text-xs text-ink-muted max-w-xl leading-relaxed">
                Need more X posts? Buy a one-time booster pack. Stacks on your plan quota. Never expires. No subscription required.
              </p>
            </div>
            <span className="text-xs font-bold bg-raised text-ink-body px-2 py-0.5 rounded-full flex-shrink-0 ml-4">One-time</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Spark',  icon: '⚡', posts: 50,  price: '$1.99'  },
              { label: 'Boost',  icon: '🔥', posts: 120, price: '$4.99', badge: 'Popular' },
              { label: 'Surge',  icon: '💥', posts: 250, price: '$9.99'  },
              { label: 'Storm',  icon: '🌪️', posts: 500, price: '$19.99', badge: 'Best value' },
            ].map(pack => (
              <div key={pack.label} className={`bg-panel hover:bg-raised transition-colors rounded-xl p-4 flex flex-col items-center text-center relative ${pack.badge === 'Popular' ? 'ring-1 ring-amber' : ''} ${pack.badge === 'Best value' ? 'ring-1 ring-amber' : ''}`}>
                {pack.badge && (
                  <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${pack.badge === 'Best value' ? 'bg-amber text-void' : 'bg-amber text-void'}`}>
                    {pack.badge}
                  </span>
                )}
                <span className="text-2xl mb-2">{pack.icon}</span>
                <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                <p className="text-xs text-ink-muted mb-3">{pack.posts} extra X posts</p>
                <p className="text-xl font-extrabold mb-3">{pack.price}</p>
                <Link
                  href="/settings?tab=plan#x-booster"
                  className="w-full text-center text-xs font-bold py-2 rounded-lg bg-raised hover:bg-edge-lit transition-colors text-ink-high">
                  Get {pack.label} →
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-ink-muted">
              Packs stack, roll over month-to-month, and never expire.
            </p>
            <p className="text-xs text-ink-muted">
              X posts cost $0.01 each via the Twitter API. Boosters let you pre-purchase in bulk — saving you ~75% vs. paying per-post at API cost.
            </p>
          </div>
        </div>

        {/* STUDIO STAX */}
        <div className="bg-panel border border-edge rounded-2xl p-6 mb-8">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold">Studio Stax — Get Listed</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-raised text-ink-muted rounded-full">Directory</span>
            </div>
            <p className="text-xs text-ink-muted max-w-xl leading-relaxed">
              Get your tool, product, or service in front of SocialMate&apos;s creator audience. Annual directory listing with analytics, SM-Give badge, and a dedicated listing page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Founding Member */}
            <div className="border-2 border-edge-lit rounded-2xl p-5 bg-raised relative">
              <span className="absolute -top-3 left-5 text-xs font-bold bg-raised text-ink-high px-3 py-0.5 rounded-full">First 100 spots only</span>
              <div className="flex items-start justify-between mb-4 mt-2">
                <div>
                  <p className="text-sm font-extrabold text-ink-high">Founding Member</p>
                  <p className="text-2xl font-extrabold mt-0.5 text-ink-high">$100<span className="text-sm font-semibold text-ink-muted">/yr</span></p>
                  <p className="text-xs text-ink-muted font-semibold mt-1">Locked in forever at this rate</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  'Directory listing with dedicated page',
                  'Analytics dashboard — views & clicks',
                  'SM-Give badge on your listing',
                  'Featured consideration (editorial picks)',
                  'Founding Member badge — permanent',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="text-jade font-bold flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Standard */}
            <div className="border-2 border-edge rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-extrabold text-ink-high">Standard</p>
                  <p className="text-2xl font-extrabold mt-0.5 text-ink-high">$150<span className="text-sm font-semibold text-ink-muted">/yr</span></p>
                  <p className="text-xs text-ink-muted mt-1">Open enrollment</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  'Directory listing with dedicated page',
                  'Analytics dashboard — views & clicks',
                  'SM-Give badge on your listing',
                  'Featured consideration (editorial picks)',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="text-jade font-bold flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-ink-muted leading-relaxed">
              Applications are reviewed. Approval is not guaranteed. NSFW content allowed with disclosure.
            </p>
            <Link
              href="/studio-stax/apply"
              className="flex-shrink-0 text-sm font-bold px-5 py-2.5 rounded-xl bg-raised hover:bg-raised text-ink-high transition-colors text-center">
              Apply to be listed →
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-panel border border-edge rounded-2xl p-6">
          <h3 className="text-base font-extrabold mb-6">{t('pricing.faq_headline')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ.map((item, i) => (
              <div key={i}>
                <p className="text-xs font-extrabold mb-1.5">{item.q}</p>
                <p className="text-xs text-ink-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SM-Give strip */}
        <div className="border-t border-edge mt-16 pt-10 pb-4">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-ink-muted">
              ❤️ <span className="font-semibold text-ink-body">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
              <a href="/give" className="text-amber hover:text-amber-bright font-semibold transition-colors">Learn about SM-Give →</a>
            </p>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-extrabold mb-2">Ready to get started?</h2>
          <p className="text-sm text-ink-muted mb-6">No card required. Free forever. 50 AI credits per month, included free.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="bg-amber text-void font-bold px-8 py-3.5 rounded-2xl hover:bg-amber-bright transition-all text-sm w-full sm:w-auto text-center">
              Create free account →
            </Link>
            <Link href="/features"
              className="text-ink-muted font-semibold hover:text-ink-high transition-all text-sm">
              See all features →
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
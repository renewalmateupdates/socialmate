'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'

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
    badgeStyle: 'bg-emerald-100 text-emerald-700',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    color: 'border-2 border-emerald-400',
    headerText: 'text-gray-900 dark:text-gray-100',
    subText: 'text-gray-500 dark:text-gray-400',
    features: [
      { label: '4 live platforms now',             note: '12 more coming soon' },
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
    ctaStyle: 'border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  },
  {
    name: 'Pro',
    monthlyPrice: 5,
    annualPrice: 55,
    annualMonthly: 4.58,
    annualSaving: 5,
    description: 'For creators and small businesses who want to grow faster.',
    badge: 'Most Popular',
    badgeStyle: 'bg-amber-100 text-amber-700',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
    color: 'border-2 border-amber-400',
    headerText: 'text-gray-900 dark:text-gray-100',
    subText: 'text-gray-500 dark:text-gray-400',
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
    ctaStyle: 'bg-amber-400 hover:bg-amber-500 text-black font-bold',
  },
  {
    name: 'Agency',
    monthlyPrice: 20,
    annualPrice: 209,
    annualMonthly: 17.42,
    annualSaving: 31,
    description: 'For agencies and power users managing multiple brands.',
    badge: 'Power Users',
    badgeStyle: 'bg-purple-100 text-purple-700',
    cardBg: 'bg-purple-50 dark:bg-purple-950/20',
    color: 'border-2 border-purple-500',
    headerText: 'text-gray-900 dark:text-gray-100',
    subText: 'text-gray-500 dark:text-gray-400',
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
    ctaStyle: 'bg-purple-600 hover:bg-purple-700 text-white font-bold',
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
]

const WHITE_LABEL_TIERS = [
  {
    name: 'White Label Basic',
    price: '$20/mo',
    priceId: STRIPE_WHITE_LABEL_BASIC_PRICE_ID,
    tier: 'basic' as const,
    features: [
      'Remove SocialMate branding',
      'Add your own logo',
      'Custom brand colors',
      'Your brand name throughout the app',
    ],
    highlight: false,
  },
  {
    name: 'White Label Pro',
    price: '$40/mo',
    priceId: STRIPE_WHITE_LABEL_PRO_PRICE_ID,
    tier: 'pro' as const,
    features: [
      'Everything in Basic',
      'Custom domain (app.yourbrand.com)',
      'Full client rebrand — SocialMate never visible',
      'Priority support',
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
    a: 'Discord, Bluesky, Telegram, and Mastodon are live. LinkedIn, YouTube, Pinterest, and Reddit are coming very soon — code complete, awaiting platform approval. 8 more are planned.',
  },
  {
    q: 'Is White Label available on Free?',
    a: 'No — White Label is an add-on for Pro and Agency subscribers only. Basic ($20/mo) removes branding and adds your logo and colors. Pro ($40/mo) adds a custom domain for full client rebranding.',
  },
]

export default function Pricing() {
  const [interval, setInterval] = useState<Interval>('monthly')
  const [loading, setLoading]   = useState<string | null>(null)
  const router = useRouter()

  const annual = interval === 'annual'

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId }),
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Buffer charges $18/mo for 5 platforms. Hootsuite charges $99/mo. SocialMate gives you all 16 platforms, 12 AI tools, and a Link in Bio page — starting at $0.
          </p>

          <div className="flex items-center justify-center gap-1 mt-8 bg-gray-100 rounded-2xl p-1 w-fit mx-auto">
            {(['monthly', 'annual'] as Interval[]).map(i => (
              <button key={i} onClick={() => setInterval(i)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  interval === i ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}>
                {i === 'monthly' ? 'Monthly' : (
                  <span className="flex items-center gap-2">
                    Annual
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Save up to 13%</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                      <span className="text-4xl font-extrabold">$0</span>
                      <span className={`text-sm mb-1.5 ${plan.subText}`}>/month, forever</span>
                    </div>
                  ) : annual ? (
                    <div className="mb-2">
                      <div className={`flex items-end gap-1 ${plan.headerText}`}>
                        <span className="text-4xl font-extrabold">${plan.annualPrice}</span>
                        <span className={`text-sm mb-1.5 ${plan.subText}`}>/year</span>
                      </div>
                      <p className={`text-xs mt-1 ${plan.subText}`}>
                        ~${plan.annualMonthly}/mo ·{' '}
                        <span className="text-green-400 font-bold">save ${plan.annualSaving}</span>
                      </p>
                    </div>
                  ) : (
                    <div className={`flex items-end gap-1 mb-2 ${plan.headerText}`}>
                      <span className="text-4xl font-extrabold">${plan.monthlyPrice}</span>
                      <span className={`text-sm mb-1.5 ${plan.subText}`}>/month</span>
                    </div>
                  )}
                  <p className={`text-xs leading-relaxed ${plan.subText}`}>{plan.description}</p>
                </div>

                <div className="px-6 py-5 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                        <span className="text-xs text-gray-600">
                          {f.label}
                          {f.note && <span className="text-gray-400"> — {f.note}</span>}
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
        </div>

        {/* WHITE LABEL ADD-ON */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold">White Label Add-on</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Pro & Agency only</span>
            </div>
            <p className="text-xs text-gray-500">Remove SocialMate branding entirely. Your logo, your colors, your domain. Two tiers based on how deep you want to go.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHITE_LABEL_TIERS.map(wl => (
              <div key={wl.name} className={`border-2 rounded-2xl p-5 ${wl.highlight ? 'border-black' : 'border-gray-100'}`}>
                {wl.highlight && (
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full mb-3 inline-block">Best for agencies</span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-extrabold">{wl.name}</p>
                    <p className="text-xl font-extrabold mt-0.5">{wl.price}</p>
                  </div>
                  <button
                    onClick={() => handleWhiteLabelCheckout(wl.tier, wl.name)}
                    disabled={loading === wl.name}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-60 ${
                      wl.highlight
                        ? 'bg-black text-white hover:opacity-80'
                        : 'border border-gray-200 text-gray-700 hover:border-black'
                    }`}>
                    {loading === wl.name ? 'Loading...' : 'Add to plan →'}
                  </button>
                </div>
                <ul className="space-y-2">
                  {wl.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* AI CREDIT COSTS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold mb-1">AI Credit Costs</h3>
              <p className="text-xs text-gray-500 max-w-xl">
                Credits refresh monthly. Unused credits roll over into your bank — Free banks up to 75, Pro up to 750, Agency up to 3,000. Banks reset every 6 months.
              </p>
            </div>
            <Link href="/ai-features"
              className="text-xs font-bold text-black hover:underline flex-shrink-0 ml-4">
              See all tools →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AI_CREDITS.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-xs text-gray-700 font-semibold">
                  {item.feature}
                  {item.proOnly && (
                    <span className="ml-1.5 text-xs font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">Pro+</span>
                  )}
                </span>
                <span className="text-xs font-extrabold text-gray-900 ml-3 flex-shrink-0">{item.cost}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">Editing AI-generated content is always free — credits only charge on generation.</p>
            <Link href="/settings?tab=Plan"
              className="text-xs font-bold text-black hover:underline flex-shrink-0">
              Buy credit packs →
            </Link>
          </div>
        </div>

        {/* CREDIT PACKS */}
        <div className="bg-black text-white rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold mb-1">Need more credits?</h3>
              <p className="text-xs text-gray-400">One-time credit packs — added to your balance instantly. No subscription.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Starter',  credits: '100 cr',   price: '$1.99'  },
              { label: 'Popular',  credits: '300 cr',   price: '$4.99',  badge: true },
              { label: 'Pro Pack', credits: '750 cr',   price: '$9.99'  },
              { label: 'Max Pack', credits: '2,000 cr', price: '$19.99', bestValue: true },
            ].map((pack: any) => (
              <div key={pack.label} className={`bg-white/10 rounded-xl p-4 text-center relative ${pack.badge ? 'ring-2 ring-white' : ''} ${pack.bestValue ? 'ring-2 ring-amber-400' : ''}`}>
                {pack.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-white text-black px-2 py-0.5 rounded-full">Popular</span>
                )}
                {pack.bestValue && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full">Best value</span>
                )}
                <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                <p className="text-xs text-gray-400 mb-2">{pack.credits}</p>
                <p className="text-lg font-extrabold">{pack.price}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">Purchase credit packs from Settings → Plan after signing up</p>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-base font-extrabold mb-6">Frequently asked questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ.map((item, i) => (
              <div key={i}>
                <p className="text-xs font-extrabold mb-1.5">{item.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SM-Give strip */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-10 pb-4">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ❤️ <span className="font-semibold text-gray-700 dark:text-gray-300">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
              <a href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Learn about SM-Give →</a>
            </p>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-extrabold mb-2">Ready to get started?</h2>
          <p className="text-sm text-gray-500 mb-6">No card required. Free forever. 50 AI credits per month, included free.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="bg-black text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm w-full sm:w-auto text-center">
              Create free account →
            </Link>
            <Link href="/features"
              className="text-gray-500 font-semibold hover:text-black transition-all text-sm">
              See all features →
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
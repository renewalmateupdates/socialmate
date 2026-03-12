'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'

// Monthly price IDs (live)
const STRIPE_PRO_PRICE_ID        = 'price_1T9pay7OMwDowUuU7S3G3lNX'
const STRIPE_AGENCY_PRICE_ID     = 'price_1T9qAd7OMwDowUuUpzjxLlG2'
const STRIPE_WHITE_LABEL_PRICE_ID = 'price_1T9qAu7OMwDowUuUsqM2jwoC'

// Annual price IDs — create these in Stripe then paste here
const STRIPE_PRO_ANNUAL_PRICE_ID    = '' // TODO: create in Stripe (~$55/yr)
const STRIPE_AGENCY_ANNUAL_PRICE_ID = '' // TODO: create in Stripe (~$210/yr)

type Interval = 'monthly' | 'annual'

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthly: 0,
    annualSaving: 0,
    description: 'Everything you need to get started — no credit card required.',
    badge: null,
    color: 'border-gray-200',
    headerBg: 'bg-gray-50',
    headerText: 'text-gray-900',
    subText: 'text-gray-400',
    features: [
      { label: '8 live platform integrations', note: 'More coming soon' },
      { label: '1 account per platform' },
      { label: '2 team seats' },
      { label: 'Schedule up to 2 weeks ahead' },
      { label: '100 scheduled posts / month' },
      { label: '100 AI credits / month' },
      { label: 'AI image gen & content calendar', note: 'Pro+ only' },
      { label: '1 GB media storage' },
      { label: 'Video up to 30 seconds' },
      { label: 'Bulk scheduling (manual)' },
      { label: '14-day & 30-day analytics' },
      { label: 'Link-in-bio page' },
      { label: 'Hashtag collections' },
      { label: 'Post templates' },
      { label: 'Content queue & drafts' },
      { label: 'Referral program' },
    ],
    cta: 'Get Started Free',
    ctaHref: '/signup',
    monthlyPriceId: null,
    annualPriceId: null,
    ctaStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  {
    name: 'Pro',
    monthlyPrice: 5,
    annualPrice: 55,      // 8% off $60
    annualMonthly: 4.58,  // $55/12
    annualSaving: 5,
    description: 'For creators and small businesses who want to move faster.',
    badge: 'Most Popular',
    color: 'border-black',
    headerBg: 'bg-black',
    headerText: 'text-white',
    subText: 'text-gray-300',
    features: [
      { label: 'Everything in Free' },
      { label: '5 accounts per platform' },
      { label: '5 team seats' },
      { label: 'Schedule up to 1 month ahead' },
      { label: '1,000 scheduled posts / month' },
      { label: '500 AI credits / month' },
      { label: 'AI image generation', note: '25 credits' },
      { label: 'AI bulk content calendar (30 days)', note: '20 credits' },
      { label: '10 GB media storage' },
      { label: 'Video up to 2 minutes' },
      { label: '14-day, 30-day & 90-day analytics' },
      { label: 'Advanced analytics' },
      { label: 'PDF export reports' },
      { label: 'Custom domain for link-in-bio' },
      { label: 'Priority support & early access' },
      { label: 'White Label add-on available', note: '+$20/mo' },
    ],
    cta: 'Start Pro',
    ctaHref: null,
    monthlyPriceId: STRIPE_PRO_PRICE_ID,
    annualPriceId: STRIPE_PRO_ANNUAL_PRICE_ID,
    ctaStyle: 'bg-white text-black hover:opacity-80 border-2 border-white',
  },
  {
    name: 'Agency',
    monthlyPrice: 20,
    annualPrice: 209,      // 13% off $240
    annualMonthly: 17.42,  // $209/12
    annualSaving: 31,
    description: 'For agencies and power users managing multiple brands.',
    badge: null,
    color: 'border-purple-200',
    headerBg: 'bg-purple-50',
    headerText: 'text-gray-900',
    subText: 'text-gray-500',
    features: [
      { label: 'Everything in Pro' },
      { label: '10 accounts per platform' },
      { label: '15 team seats' },
      { label: 'Schedule up to 3 months ahead' },
      { label: '5,000 scheduled posts / month' },
      { label: '2,000 AI credits / month' },
      { label: '50 GB media storage' },
      { label: 'Video up to 10 minutes' },
      { label: 'Client workspaces' },
      { label: '14-day, 30-day, 90-day & 6-month analytics' },
      { label: 'PDF export (any date range)' },
      { label: 'White Label add-on available', note: '+$20/mo' },
      { label: 'Dedicated support' },
    ],
    cta: 'Start Agency',
    ctaHref: null,
    monthlyPriceId: STRIPE_AGENCY_PRICE_ID,
    annualPriceId: STRIPE_AGENCY_ANNUAL_PRICE_ID,
    ctaStyle: 'bg-purple-600 text-white hover:opacity-80 border-2 border-purple-600',
  },
]

const WHITE_LABEL_FEATURES = [
  'Remove all SocialMate branding',
  'Custom logo & color scheme',
  'Custom domain for client dashboards',
  'White-labeled link-in-bio pages',
  'Client-facing reports without SocialMate branding',
]

const AI_CREDITS = [
  { feature: 'Caption generator',           cost: '1 credit',   proOnly: false },
  { feature: 'Hashtag generator',           cost: '1 credit',   proOnly: false },
  { feature: 'Post rewrite / improver',     cost: '1 credit',   proOnly: false },
  { feature: 'Viral Hook Generator',        cost: '2 credits',  proOnly: false },
  { feature: 'Post idea generator',         cost: '2 credits',  proOnly: false },
  { feature: 'Smart Auto-Formatting',       cost: '2 credits',  proOnly: false },
  { feature: 'Platform rewrite (1 → all)',  cost: '2 credits',  proOnly: false },
  { feature: 'SM-Radar growth report',      cost: '3 credits',  proOnly: false },
  { feature: 'Thread generator',            cost: '3 credits',  proOnly: false },
  { feature: 'Content repurposer',          cost: '3 credits',  proOnly: false },
  { feature: 'AI Media Kit generator',      cost: '3 credits',  proOnly: false },
  { feature: 'SM-Pulse trend scan',         cost: '5 credits',  proOnly: false },
  { feature: '2-week AI content calendar',  cost: '10 credits', proOnly: false },
  { feature: '30-day AI content calendar',  cost: '20 credits', proOnly: true  },
  { feature: 'AI image generation',         cost: '25 credits', proOnly: true  },
]

export default function Pricing() {
  const [interval, setInterval] = useState<Interval>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const annual = interval === 'annual'

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!priceId) {
      // Annual price IDs not yet created — fall back to monthly
      alert('Annual billing coming soon — signing you up monthly for now.')
      return
    }
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
        router.push('/login?redirect=/pricing')
      }
    } catch {
      console.error('Checkout failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Tools that charge $99/month for basic scheduling exist. SocialMate doesn't believe creators should have to pay that. Everything you need — at a fraction of the cost.
          </p>

          {/* INTERVAL TOGGLE */}
          <div className="flex items-center justify-center gap-1 mt-8 bg-gray-100 rounded-2xl p-1 w-fit mx-auto">
            {(['monthly', 'annual'] as Interval[]).map(i => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  interval === i ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}>
                {i === 'monthly' ? 'Monthly' : (
                  <span className="flex items-center gap-2">
                    Annual
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Save up to 13%
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {PLANS.map(plan => {
            const priceId = annual ? plan.annualPriceId : plan.monthlyPriceId
            return (
              <div key={plan.name} className={`bg-white border-2 rounded-2xl overflow-hidden flex flex-col ${plan.color}`}>
                <div className={`px-6 py-5 ${plan.headerBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-lg font-extrabold ${plan.headerText}`}>{plan.name}</h2>
                    {plan.badge && (
                      <span className="text-xs font-bold px-3 py-1 bg-white text-black rounded-full">{plan.badge}</span>
                    )}
                  </div>

                  {plan.monthlyPrice === 0 ? (
                    <div className={`flex items-end gap-1 mb-2 ${plan.headerText}`}>
                      <span className="text-3xl font-extrabold">$0</span>
                      <span className={`text-sm mb-1 ${plan.subText}`}>/month, forever</span>
                    </div>
                  ) : annual ? (
                    <div className="mb-2">
                      <div className={`flex items-end gap-1 ${plan.headerText}`}>
                        <span className="text-3xl font-extrabold">${plan.annualPrice}</span>
                        <span className={`text-sm mb-1 ${plan.subText}`}>/year</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${plan.subText}`}>
                        ~${plan.annualMonthly}/mo ·{' '}
                        <span className="text-green-400 font-bold">save ${plan.annualSaving}</span>
                      </p>
                    </div>
                  ) : (
                    <div className={`flex items-end gap-1 mb-2 ${plan.headerText}`}>
                      <span className="text-3xl font-extrabold">${plan.monthlyPrice}</span>
                      <span className={`text-sm mb-1 ${plan.subText}`}>/month</span>
                    </div>
                  )}
                  <p className={`text-xs ${plan.subText}`}>{plan.description}</p>
                </div>

                <div className="px-6 py-5 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-xs text-gray-600">
                          {f.label}
                          {f.note && <span className="text-gray-400"> — {f.note}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {priceId !== null ? (
                    <button
                      onClick={() => handleCheckout(priceId!, plan.name)}
                      disabled={loading === plan.name}
                      className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60 ${plan.ctaStyle}`}>
                      {loading === plan.name ? 'Loading...' : plan.cta}
                    </button>
                  ) : plan.ctaHref ? (
                    <Link
                      href={plan.ctaHref}
                      className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all ${plan.ctaStyle}`}>
                      {plan.cta}
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* WHITE LABEL ADDON */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-extrabold">White Label Add-on</h3>
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Pro & Agency</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Remove SocialMate branding entirely and replace it with your own. Perfect for agencies delivering social media services under their own brand.
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {WHITE_LABEL_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-extrabold">$20</div>
              <div className="text-xs text-gray-400">/month add-on</div>
              <button
                onClick={() => handleCheckout(STRIPE_WHITE_LABEL_PRICE_ID, 'WhiteLabel')}
                disabled={loading === 'WhiteLabel'}
                className="mt-3 inline-block text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                {loading === 'WhiteLabel' ? 'Loading...' : 'Add to plan →'}
              </button>
            </div>
          </div>
        </div>

        {/* AI CREDITS BREAKDOWN */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <h3 className="text-base font-extrabold mb-1">AI Credit Costs</h3>
          <p className="text-xs text-gray-500 mb-5">
            Credits refresh monthly. Unused credits bank up — Free banks up to 150, Pro up to 750, Agency up to 3,000. Banks reset every 6 months.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {AI_CREDITS.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-600">
                  {item.feature}
                  {item.proOnly && (
                    <span className="ml-1.5 text-xs font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">Pro+</span>
                  )}
                </span>
                <span className="text-xs font-bold text-gray-800 ml-2 flex-shrink-0">{item.cost}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Editing AI-generated content is always free. Credits are only charged at generation.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-base font-extrabold mb-4">Why is SocialMate so affordable?</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                q: 'How is Free this generous?',
                a: 'We built SocialMate lean from day one. By controlling AI costs with a credit system and keeping infrastructure efficient, we can offer genuinely powerful tools for free.',
              },
              {
                q: 'Will prices go up?',
                a: "Current pricing is locked for all active subscribers. If pricing ever changes, you'll know well in advance and grandfathered rates will be honored.",
              },
              {
                q: 'What happens when I run out of AI credits?',
                a: 'You can still schedule, draft, and manage posts manually — for free. AI features pause until your credits refresh next month, or you can earn more through referrals.',
              },
              {
                q: 'Can I earn extra credits?',
                a: 'Yes. Refer a friend — when they publish their first post you both earn +10 credits. If they upgrade to Pro you earn +25, Agency earns you +50.',
              },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs font-bold mb-1">{item.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
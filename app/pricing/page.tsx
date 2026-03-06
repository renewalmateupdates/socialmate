'use client'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Everything you need to get started — no credit card required.',
    badge: null,
    color: 'border-gray-200',
    headerColor: 'bg-gray-50',
    features: [
      { label: '8 live platform integrations', note: 'More coming soon' },
      { label: '1 account per platform' },
      { label: '2 team seats' },
      { label: 'Schedule up to 2 weeks ahead' },
      { label: '100 scheduled posts / month' },
      { label: '100 AI credits / month', note: 'Max bank: 300' },
      { label: '1 GB media storage' },
      { label: 'Video up to 30 seconds' },
      { label: 'Bulk scheduling (manual)' },
      { label: '7-day & 30-day analytics' },
      { label: 'Link-in-bio page' },
      { label: 'Hashtag collections' },
      { label: 'Post templates' },
      { label: 'Content queue & drafts' },
      { label: 'Referral program' },
    ],
    cta: 'Get Started Free',
    ctaHref: '/signup',
    ctaStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  {
    name: 'Pro',
    price: { monthly: 5, annual: 50 },
    description: 'For creators and small businesses who want to move faster.',
    badge: 'Most Popular',
    color: 'border-black',
    headerColor: 'bg-black',
    features: [
      { label: 'Everything in Free' },
      { label: '5 accounts per platform' },
      { label: '4 team seats' },
      { label: 'Schedule up to 1 month ahead' },
      { label: '1,000 scheduled posts / month' },
      { label: '300 AI credits / month', note: 'Max bank: 1,000' },
      { label: '10 GB media storage' },
      { label: 'Video up to 2 minutes' },
      { label: 'AI bulk content calendar (30 days)' },
      { label: '7, 30 & 90-day analytics' },
      { label: 'Advanced analytics (free)' },
      { label: 'PDF export reports' },
      { label: 'Custom domain for link-in-bio' },
      { label: 'Priority support & early access' },
      { label: 'White Label add-on available', note: '+$20/mo' },
    ],
    cta: 'Start Pro',
    ctaHref: '/signup?plan=pro',
    ctaStyle: 'bg-black text-white hover:opacity-80',
  },
  {
    name: 'Agency',
    price: { monthly: 20, annual: 200 },
    description: 'For agencies and power users managing multiple brands.',
    badge: null,
    color: 'border-purple-200',
    headerColor: 'bg-purple-50',
    features: [
      { label: 'Everything in Pro' },
      { label: '10 accounts per platform' },
      { label: 'Unlimited team seats' },
      { label: 'Schedule up to 3 months ahead' },
      { label: '5,000 scheduled posts / month' },
      { label: '1,000 AI credits / month', note: 'Max bank: 5,000' },
      { label: '50 GB media storage' },
      { label: 'Video up to 10 minutes' },
      { label: 'Client workspaces' },
      { label: 'All-time analytics' },
      { label: 'PDF export (any date range)' },
      { label: 'White Label add-on available', note: '+$20/mo' },
      { label: 'Dedicated support' },
    ],
    cta: 'Start Agency',
    ctaHref: '/signup?plan=agency',
    ctaStyle: 'bg-purple-600 text-white hover:opacity-80',
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
  { feature: 'Caption generator',              cost: '1 credit' },
  { feature: 'Hashtag generator',              cost: '1 credit' },
  { feature: 'Post rewrite / improver',        cost: '1 credit' },
  { feature: 'Viral Hook Generator',           cost: '2 credits' },
  { feature: 'Post idea generator',            cost: '2 credits' },
  { feature: 'Smart Auto-Formatting',          cost: '2 credits' },
  { feature: 'Platform rewrite (1 → all)',     cost: '2 credits' },
  { feature: 'SM-Radar growth report',         cost: '3 credits' },
  { feature: 'Thread generator',               cost: '3 credits' },
  { feature: 'Content repurposer',             cost: '3 credits' },
  { feature: 'AI Media Kit generator',         cost: '3 credits' },
  { feature: 'SM-Pulse trend scan',            cost: '5 credits' },
  { feature: '2-week AI content calendar',     cost: '10 credits' },
  { feature: '30-day AI content calendar',     cost: '20 credits' },
  { feature: 'AI image generation',            cost: '25 credits' },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Simple, transparent pricing
            </h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Tools that charge $99/month for basic scheduling exist. SocialMate doesn't believe creators should have to pay that. Everything you need — at a fraction of the cost.
            </p>

            {/* BILLING TOGGLE */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-semibold ${!annual ? 'text-black' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-black' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-semibold ${annual ? 'text-black' : 'text-gray-400'}`}>
                Annual <span className="text-green-600 font-bold">Save ~17%</span>
              </span>
            </div>
          </div>

          {/* PLAN CARDS */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {PLANS.map(plan => (
              <div key={plan.name} className={`bg-white border-2 rounded-2xl overflow-hidden flex flex-col ${plan.color}`}>
                <div className={`px-6 py-5 ${plan.headerColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className={`text-lg font-extrabold ${plan.headerColor === 'bg-black' ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h2>
                    {plan.badge && (
                      <span className="text-xs font-bold px-3 py-1 bg-white text-black rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-end gap-1 mb-2 ${plan.headerColor === 'bg-black' ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-3xl font-extrabold">
                      ${annual && plan.price.annual > 0
                        ? Math.round(plan.price.annual / 12)
                        : plan.price.monthly}
                    </span>
                    <span className={`text-sm mb-1 ${plan.headerColor === 'bg-black' ? 'text-gray-300' : 'text-gray-400'}`}>
                      /month{annual && plan.price.annual > 0 ? ', billed annually' : ''}
                    </span>
                  </div>
                  <p className={`text-xs ${plan.headerColor === 'bg-black' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
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
                  <Link href={plan.ctaHref}
                    className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all ${plan.ctaStyle}`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
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
                <Link href="/settings"
                  className="mt-3 inline-block text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Add to plan →
                </Link>
              </div>
            </div>
          </div>

          {/* AI CREDITS BREAKDOWN */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
            <h3 className="text-base font-extrabold mb-1">AI Credit Costs</h3>
            <p className="text-xs text-gray-500 mb-5">
              Credits refresh monthly. Unused credits bank up — Free banks up to 300, Pro up to 1,000, Agency up to 5,000. Banks reset every 6 months.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {AI_CREDITS.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-600">{item.feature}</span>
                  <span className="text-xs font-bold text-gray-800 ml-2 flex-shrink-0">{item.cost}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Editing AI-generated content is always free. Credits are only charged at generation.
            </p>
          </div>

          {/* FAQ / PHILOSOPHY */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <h3 className="text-base font-extrabold mb-4">Why is SocialMate so affordable?</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  q: 'How is Free this generous?',
                  a: "We built SocialMate lean from day one. By controlling AI costs with a credit system and keeping infrastructure efficient, we can offer genuinely powerful tools for free — something we'll keep improving as we grow.",
                },
                {
                  q: 'Will prices go up?',
                  a: 'Current pricing is locked for all active subscribers. If pricing ever changes, you\'ll know well in advance and grandfathered rates will be honored.',
                },
                {
                  q: 'What happens when I run out of AI credits?',
                  a: "You can still schedule, draft, and manage posts manually — for free. AI features pause until your credits refresh next month, or you can earn more through referrals.",
                },
                {
                  q: 'Can I earn extra credits?',
                  a: 'Yes. Refer a friend and you both earn 25 credits when they publish their first post. If they upgrade to a paid plan, you both earn 50 more.',
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
      </div>
    </div>
  )
}
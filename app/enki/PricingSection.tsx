'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PRICING = [
  {
    name: 'Citizen',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthly: 0,
    annualSaving: 0,
    description: 'Prove your doctrine before risking a dollar. Full paper trading with all guards active.',
    badge: 'Always Free',
    badgeStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-2 border-emerald-400',
    ring: '',
    features: [
      { label: 'Full paper trading — simulated capital' },
      { label: 'All 7 signal sources' },
      { label: 'Confidence scoring (6/10 threshold)' },
      { label: 'All Fortress Guard rules active' },
      { label: '7-day backtests' },
      { label: 'Leaderboard visibility (paper badge)' },
      { label: '1 active doctrine' },
    ],
    cta: 'Start Free — No Card',
    ctaStyle: 'border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 dark:border-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/40',
  },
  {
    name: 'Commander',
    monthlyPrice: 15,
    annualPrice: 120,
    annualMonthly: 10,
    annualSaving: 60,
    description: 'Your first live treasury operations. Stocks, compound mode, macro shields, conquest alerts.',
    badge: 'Most Popular',
    badgeStyle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-2 border-amber-400',
    ring: 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-950',
    features: [
      { label: 'Everything in Citizen' },
      { label: 'Live stock trading via Alpaca' },
      { label: 'Compound treasury mode' },
      { label: '3 active doctrines' },
      { label: 'Fortress macro shields' },
      { label: 'Conquest alerts (email + Telegram)' },
      { label: 'Strategy vault — pre-built doctrines' },
      { label: '30-day backtests' },
      { label: 'Cloud Runner available (+$10/mo)' },
    ],
    cta: 'Go Commander — $15/mo',
    ctaStyle: 'bg-amber-400 hover:bg-amber-500 text-black',
  },
  {
    name: 'Emperor',
    monthlyPrice: 29,
    annualPrice: 240,
    annualMonthly: 20,
    annualSaving: 108,
    description: 'The full autonomous empire-grade guardian. Crypto + stocks, 24/7, multi-broker.',
    badge: 'Full Autonomous',
    badgeStyle: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    cardBg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-2 border-purple-500',
    ring: '',
    features: [
      { label: 'Everything in Commander' },
      { label: 'Coinbase crypto trading 24/7' },
      { label: 'Multi-broker orchestration' },
      { label: 'Full autonomous mode (no approvals)' },
      { label: 'Advanced doctrine packs' },
      { label: 'Guild + doctrine marketplace' },
      { label: 'Elite empire badges' },
      { label: '90-day backtests' },
      { label: 'Cloud Runner available (+$10/mo)' },
    ],
    cta: 'Go Emperor — $29/mo',
    ctaStyle: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
]

export default function EnkiPricingSection() {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleCheckout(plan: string) {
    setLoading(plan)
    try {
      const billing = annual && plan !== 'cloud_runner' ? 'annual' : 'monthly'
      const res = await fetch('/api/enki/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan, billing }),
      })
      if (res.status === 401) { router.push('/login?redirect=/enki%23pricing'); return }
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className="mb-20">
      <div className="text-center mb-10">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">The Empire Path</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          Start free. Scale when ready.
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3 mb-6">
          Paper trade at $0 until you trust the guardian. Go live when you do.
          Founding member pricing locked in for early access.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              !annual
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              annual
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Annual
            <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-1.5 py-0.5 rounded-full">
              Save up to $108
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING.map(plan => {
          const showAnnual   = annual && plan.annualPrice > 0
          const displayPrice = showAnnual ? `$${plan.annualMonthly}` : `$${plan.monthlyPrice}`
          const displayPer   = showAnnual
            ? '/mo, billed annually'
            : plan.monthlyPrice === 0
            ? '/month, forever'
            : '/month'

          return (
            <div
              key={plan.name}
              className={`${plan.cardBg} ${plan.border} ${plan.ring} rounded-2xl overflow-hidden flex flex-col`}
            >
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeStyle}`}>
                    {plan.badge}
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{displayPrice}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">{displayPer}</span>
                </div>
                {showAnnual && plan.annualSaving > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-2">
                    Save ${plan.annualSaving}/year
                  </p>
                )}
                {(!showAnnual || plan.annualSaving === 0) && <div className="h-5 mb-0" />}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="px-6 pb-6 flex-1 flex flex-col">
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0 font-bold text-xs">◆</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{feat.label}</span>
                    </li>
                  ))}
                </ul>
                {plan.monthlyPrice === 0 ? (
                  <a
                    href="/enki/dashboard"
                    className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all block ${plan.ctaStyle}`}
                  >
                    {plan.cta} →
                  </a>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.name.toLowerCase())}
                    disabled={loading === plan.name.toLowerCase()}
                    className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-50 ${plan.ctaStyle}`}
                  >
                    {loading === plan.name.toLowerCase()
                    ? 'Loading...'
                    : plan.name === 'Commander'
                      ? `Go Commander — ${annual ? '$10/mo (annual)' : '$15/mo'} →`
                      : plan.name === 'Emperor'
                        ? `Go Emperor — ${annual ? '$20/mo (annual)' : '$29/mo'} →`
                        : `${plan.cta} →`
                  }
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
        Cloud Runner add-on ($10/mo) — 24/7 execution while your laptop is off. Available on Commander + Emperor.
      </p>
    </section>
  )
}

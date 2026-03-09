'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

// Commission math at 30%: Pro=$5/mo, Agency=$20/mo
// Row 1: (8×5)+(2×20)=$80 MRR × 30% = $24/mo, $288/yr
// Row 2: (35×5)+(15×20)=$475 MRR × 30% = $143/mo, $1,716/yr
// Row 3: (65×5)+(35×20)=$1,025 MRR × 30% = $308/mo, $3,696/yr
// Row 4: (170×5)+(80×20)=$2,450 MRR × 30% = $735/mo, $8,820/yr
const EARNINGS_EXAMPLES = [
  { referrals: 10,  proSubs: 8,   agencySubs: 2,  monthly: 24,  annual: 288   },
  { referrals: 50,  proSubs: 35,  agencySubs: 15, monthly: 143, annual: 1716  },
  { referrals: 100, proSubs: 65,  agencySubs: 35, monthly: 308, annual: 3696  },
  { referrals: 250, proSubs: 170, agencySubs: 80, monthly: 735, annual: 8820  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Apply to the program',    description: 'You must be an active SocialMate user to apply. Approval is reviewed manually to keep quality high.',                                                icon: '📋' },
  { step: '02', title: 'Get your affiliate link', description: 'Once approved, you receive a unique affiliate link and optional promo codes to share with your audience.',                                            icon: '🔗' },
  { step: '03', title: 'Earn on every referral',  description: 'Every time someone subscribes through your link, you earn 30% of their monthly payment — including add-ons.',                                       icon: '💸' },
  { step: '04', title: 'Get paid monthly',        description: 'Commissions sit for 60 days to protect against fraud and refunds, then pay out monthly once you hit the $50 minimum.',                               icon: '💰' },
]

const FAQ = [
  { q: 'How is commission calculated?',                  a: 'Commission is calculated on the actual amount paid — not the list price. If someone uses a promo code, you earn 30% of the discounted price. Once the discount period ends, you earn on the full price.' },
  { q: 'Do I earn commission on add-ons?',               a: 'Yes. If a referred user adds White Label ($20/mo) on top of their plan, you earn commission on the full amount they pay each month.' },
  { q: 'What happens if my referral cancels?',           a: 'Commission stops when the subscription ends. If they resubscribe later through your link, commission resumes.' },
  { q: 'What if my subscriber count drops below 100?',   a: 'Your rate returns to 30% until you\'re back above 100 active subscribers. There\'s no penalty — just the standard rate.' },
  { q: 'When do I get paid?',                            a: 'Commissions are held for 60 days to protect against fraud and chargebacks. After that, they\'re eligible for monthly payout once your balance reaches $50.' },
  { q: 'Do I need to stay subscribed to SocialMate?',   a: 'Yes. You must maintain an active SocialMate account to remain in the affiliate program.' },
]

export default function Affiliate() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [applied, setApplied] = useState(false)

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Affiliate Program</p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Believe in it? Get paid for it.</h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Active SocialMate users can apply to our affiliate program. Earn 30% recurring commission on every paying subscriber you refer — forever. Hit 100 active subscribers and it bumps to 40%.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: '30%', label: 'Recurring commission' },
            { value: '40%', label: 'At 100+ subscribers'  },
            { value: '∞',   label: 'Paid out forever'     },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <p className="text-4xl font-extrabold text-black mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-6">How it works</h2>
          <div className="grid grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-300">{step.step}</span>
                    <p className="text-sm font-extrabold">{step.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EARNINGS TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-1">Earnings potential</h2>
          <p className="text-xs text-gray-400 mb-5">Estimated at 30% commission. Assumes a realistic mix of Pro and Agency subscribers.</p>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-bold text-gray-400 uppercase tracking-wide">Active Referrals</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-400 uppercase tracking-wide">Pro Subs</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-400 uppercase tracking-wide">Agency Subs</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-400 uppercase tracking-wide">Monthly</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-400 uppercase tracking-wide">Annual</th>
                </tr>
              </thead>
              <tbody>
                {EARNINGS_EXAMPLES.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-bold text-gray-800">{row.referrals}</td>
                    <td className="px-4 py-3 text-gray-500">{row.proSubs}</td>
                    <td className="px-4 py-3 text-gray-500">{row.agencySubs}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">${row.monthly.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">${row.annual.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">At 100+ active subscribers, your rate bumps to 40% — increasing all figures above by ~33%.</p>
        </div>

        {/* APPLY CTA */}
        <div className="bg-black rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-base font-extrabold mb-1">Ready to apply?</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Applications are reviewed manually. You'll hear back within 3–5 business days. You must be an active SocialMate user to apply.
              </p>
            </div>
            <div className="flex-shrink-0">
              {applied ? (
                <div className="text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-xs font-bold text-green-400">Application submitted!</p>
                  <p className="text-xs text-gray-400">We'll be in touch within 3–5 days.</p>
                </div>
              ) : (
                <button onClick={() => setApplied(true)}
                  className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all">
                  Apply Now →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-base font-extrabold mb-5">Common questions</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-all">
                  <span className="text-xs font-bold text-gray-800">{item.q}</span>
                  <span className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
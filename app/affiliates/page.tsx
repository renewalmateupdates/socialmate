import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Program — SocialMate',
  description: 'Earn 30% recurring commission on every SocialMate subscriber you refer. Hit 100 active referrals and earn 40% — forever.',
}

const STEPS = [
  {
    n: '1',
    title: 'Apply for free',
    body: 'Submit your application. We review within 24–48 hours. No follower minimums, no approval fees.',
  },
  {
    n: '2',
    title: 'Share your link & codes',
    body: 'Get a unique referral link and custom discount codes to share with your audience however you want — video, newsletter, social post.',
  },
  {
    n: '3',
    title: 'Earn every month',
    body: "You earn 30% of what your referrals pay — every month they stay subscribed. It stacks. There's no cap.",
  },
]

const TIERS = [
  {
    label: 'Standard',
    rate: '30%',
    desc: 'Recurring on all plan payments',
    highlight: false,
  },
  {
    label: 'Elite (100+ referrals)',
    rate: '40%',
    desc: 'Recurring forever, once unlocked',
    highlight: true,
  },
]

const FAQ = [
  {
    q: 'When do I get paid?',
    a: 'Commissions are held 60 days (standard chargeback window), then become available to cash out via PayPal or bank transfer. Minimum payout is $25.',
  },
  {
    q: 'What plans do I earn on?',
    a: 'Pro ($5/mo), Agency ($20/mo), annual versions of both, and white label add-ons. You earn 30% on every payment your referral makes as long as they stay subscribed.',
  },
  {
    q: 'What about coupon codes?',
    a: "You'll get personal discount codes to give your audience a deal. If they use your code at checkout, you earn commission on what they actually pay — even after the discount.",
  },
  {
    q: 'Is there a referral limit?',
    a: "No cap, ever. Refer 1 or 1,000 — all commissions count. Hit 100 active referrals and your rate bumps to 40% permanently.",
  },
  {
    q: 'Do I need to be a SocialMate user?',
    a: "It helps, but it's not required. We approve applications based on your audience fit and content, not whether you're a paying customer.",
  },
]

export default function AffiliatesPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Hero */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-bold tracking-widest text-violet-500 uppercase mb-4">Partner Program</span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Earn 30% recurring.<br className="hidden sm:block" /> Every month. No cap.
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed mb-8">
            SocialMate gives creators what Buffer charges $18/mo for — starting at $5. That story sells itself.
            You share it, we pay you 30% of everything your referrals pay, forever.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/partners"
              className="px-7 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-colors text-sm"
            >
              Apply now — it&apos;s free
            </Link>
            <Link
              href="/partners/dashboard"
              className="px-7 py-3 border border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-colors text-sm"
            >
              Partner login
            </Link>
          </div>
        </div>

        {/* Commission tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
          {TIERS.map(t => (
            <div
              key={t.label}
              className={`rounded-2xl p-6 border-2 ${
                t.highlight
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {t.highlight && (
                <span className="inline-block text-xs font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full mb-3">
                  Elite Tier
                </span>
              )}
              <p className="text-4xl font-extrabold mb-1 text-gray-900 dark:text-gray-100">{t.rate}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-2xl font-extrabold mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-extrabold rounded-full flex items-center justify-center mb-4 text-sm">
                  {s.n}
                </div>
                <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 mb-20">
          <h2 className="text-xl font-extrabold mb-6">What you get</h2>
          <ul className="space-y-3">
            {[
              '30% recurring commission — bumps to 40% at 100 active referrals, forever',
              'Personal referral link that tracks every signup automatically',
              'Custom discount codes to give your audience a deal at checkout',
              'Real-time dashboard — earnings, conversions, payout status',
              '60-day cookie window so late converts still count',
              'Milestone badges and leaderboard for the competitive types',
              'Direct PayPal or bank payout once you hit the $25 minimum',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-2xl font-extrabold mb-8 text-center">Common questions</h2>
          <div className="space-y-4">
            {FAQ.map(f => (
              <div key={f.q} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                <p className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-sm">{f.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-violet-600 rounded-3xl p-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to start earning?</h2>
          <p className="text-violet-200 text-sm mb-8 max-w-md mx-auto">
            Applications are free. Approval is typically within 24–48 hours.
            Your first referral commission could come in this week.
          </p>
          <Link
            href="/partners"
            className="px-8 py-3.5 bg-white text-violet-700 font-extrabold rounded-2xl hover:opacity-90 transition-opacity text-sm"
          >
            Apply for the Partner Program
          </Link>
        </div>

      </div>
    </PublicLayout>
  )
}

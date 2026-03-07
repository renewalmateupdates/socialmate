'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const SIGNUP_REWARDS = [
  { trigger: 'Someone signs up with your link', reward: '+5 credits',        note: 'Credited immediately on signup'                },
  { trigger: 'They upgrade to Pro',             reward: '+50 credits',       note: 'Credited when payment is confirmed'            },
  { trigger: 'They upgrade to Agency',          reward: '+100 credits',      note: 'Credited when payment is confirmed'            },
]

const TIERS = [
  { paying: 5,   reward: '1 month Pro free',    icon: '🎁', desc: 'Your next billing cycle is on us'                },
  { paying: 10,  reward: '3 months Pro free',   icon: '⭐', desc: 'A full quarter covered'                          },
  { paying: 25,  reward: '6 months Pro free',   icon: '🚀', desc: 'Half a year free — you\'ve earned it'           },
  { paying: 50,  reward: '1 year Pro free',     icon: '💎', desc: 'An entire year at no cost'                      },
  { paying: 100, reward: 'Pro free for life',   icon: '👑', desc: 'You grow with us — we take care of you forever' },
]

const FAQ = [
  {
    q: 'How do I get my referral link?',
    a: 'Sign in to SocialMate and go to Settings → Referrals. Your unique link is generated automatically when you create an account.',
  },
  {
    q: 'When do I receive my credits?',
    a: 'Signup credits (5) are added within 24 hours. Upgrade credits (50 or 100) are added after a 7-day hold to protect against refunds and chargebacks.',
  },
  {
    q: 'What counts as a "paying referral" for tier rewards?',
    a: 'A paying referral is someone who subscribes to Pro or Agency through your link and remains subscribed for at least 30 days. Trial periods and refunded subscriptions do not count.',
  },
  {
    q: 'Can I refer myself or create fake accounts?',
    a: 'No. We actively monitor for abuse including self-referrals, duplicate accounts, and coordinated signup fraud. Accounts found abusing the referral system are permanently banned and all credits are voided.',
  },
  {
    q: 'Do tier rewards stack?',
    a: 'Yes. If you hit 10 paying referrals after already claiming the 5-referral reward, you receive the additional 2 months on top. Each tier is incremental.',
  },
  {
    q: 'What happens to my free Pro months if I\'m already on Pro?',
    a: 'Free months are applied as billing credits to your account, extending your subscription at no cost.',
  },
]

export default function Referral() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Referral Program</p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            Share SocialMate.<br />Earn real rewards.
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Every SocialMate user gets a personal referral link. Share it. When people you refer
            become paying users, you earn credits — and eventually free Pro. The more you refer,
            the more generous the rewards get.
          </p>
        </div>

        {/* GET YOUR LINK CTA */}
        <div className="bg-black text-white rounded-2xl p-6 mb-8 flex items-center justify-between gap-6">
          <div>
            <p className="font-extrabold mb-1">Get your personal referral link</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sign in to your account to access your unique referral link, track your referrals, and claim rewards.
            </p>
          </div>
          <Link href="/login"
            className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all flex-shrink-0">
            Sign in to get link →
          </Link>
        </div>

        {/* HOW CREDITS WORK */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-1">How you earn credits</h2>
          <p className="text-xs text-gray-400 mb-5">
            Credits are added to your AI credit balance and can be used for any AI tool.
          </p>
          <div className="space-y-3">
            {SIGNUP_REWARDS.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold">{item.trigger}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
                </div>
                <span className="text-sm font-extrabold text-green-600 bg-green-50 px-4 py-2 rounded-xl flex-shrink-0 ml-4">
                  {item.reward}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MILESTONE TIERS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-1">Milestone rewards</h2>
          <p className="text-xs text-gray-400 mb-5">
            Based on paying referrals only — people who subscribe to Pro or Agency and stay for 30+ days.
          </p>
          <div className="space-y-3">
            {TIERS.map((tier, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <span className="text-2xl flex-shrink-0">{tier.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {tier.paying} paying referral{tier.paying > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{tier.desc}</p>
                </div>
                <span className="text-xs font-extrabold px-4 py-2 bg-black text-white rounded-xl flex-shrink-0">
                  {tier.reward}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
            Tier rewards are cumulative. Reaching 10 paying referrals earns the 5-referral reward first, then the 10-referral reward.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-extrabold mb-5">Common questions</h2>
          <div className="grid grid-cols-2 gap-6">
            {FAQ.map((item, i) => (
              <div key={i}>
                <p className="text-xs font-bold mb-1">{item.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center">
          <p className="text-sm font-extrabold mb-1">Don't have an account yet?</p>
          <p className="text-xs text-gray-400 mb-4">
            Create a free account — no credit card required — and start referring immediately.
          </p>
          <Link href="/signup"
            className="inline-block bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
            Create free account →
          </Link>
        </div>

      </div>
    </PublicLayout>
  )
}
'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const SIGNUP_REWARDS = [
  { trigger: 'They publish their first post', reward: '+10 credits',  note: 'Both you and your referral receive +10 credits'          },
  { trigger: 'They upgrade to Pro',           reward: '+50 credits',  note: 'Credited after 7-day hold to protect against refunds'    },
  { trigger: 'They upgrade to Agency',        reward: '+50 credits',  note: 'Credited after 7-day hold to protect against refunds'    },
]

const TIERS = [
  {
    paying: 5,
    reward: '+100 bonus credits',
    icon: '🎁',
    desc: 'Every 5 paying referrals earns you +100 bonus credits, forever.',
    conditional: false,
  },
  {
    paying: 10,
    reward: '+100 bonus credits',
    icon: '⭐',
    desc: 'Every 5 paying referrals earns you +100 bonus credits, forever.',
    conditional: false,
  },
  {
    paying: 15,
    reward: '+100 bonus credits',
    icon: '🚀',
    desc: 'Every 5 paying referrals earns you +100 bonus credits, forever.',
    conditional: false,
  },
  {
    paying: 20,
    reward: '+100 bonus credits',
    icon: '💎',
    desc: 'Every 5 paying referrals earns you +100 bonus credits, forever.',
    conditional: false,
  },
  {
    paying: 25,
    reward: '+100 bonus credits',
    icon: '👑',
    desc: 'Every 5 paying referrals earns you +100 bonus credits, forever.',
    conditional: false,
  },
]

const FAQ = [
  {
    q: 'How do I get my referral link?',
    a: 'Sign in to SocialMate and go to Settings → Referrals. Your unique link is generated automatically when you create an account.',
  },
  {
    q: 'When do I receive my credits?',
    a: 'First-post credits (+10) are added within 24 hours of your referral publishing. Upgrade credits are added after a 7-day hold to protect against refunds and chargebacks.',
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
    a: 'Yes. Every 5 paying referrals earns you +100 bonus credits. Reach 10, earn another +100. Reach 15, earn another +100. Credits accumulate with no cap.',
  },
  {
    q: 'When do milestone credits arrive?',
    a: 'Bonus credits are credited automatically once your paying referral count crosses each multiple of 5. They\'re added to your AI credit balance and never expire.',
  },
  {
    q: 'What\'s the difference between referrals and the affiliate program?',
    a: 'The referral program is for everyone — earn credits and free Pro by sharing your link. The affiliate program is an application-based program for creators and marketers who want to earn cash commissions instead.',
  },
  {
    q: 'Do bonus credits expire?',
    a: 'No. Milestone bonus credits are added permanently to your AI credit balance and never expire. They work exactly like regular AI credits.',
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
            start posting and upgrade, you earn credits — and eventually free Pro. The more you refer,
            the more generous the rewards get.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 text-xs px-4 py-2 rounded-full mt-4">
            💡 Want to earn <strong className="text-gray-700">cash commissions</strong> instead?
            <Link href="/affiliate" className="text-black font-bold underline hover:no-underline ml-1">
              Apply to the Affiliate Program →
            </Link>
          </div>
        </div>

        {/* GET YOUR LINK CTA */}
        <div className="bg-black text-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold mb-1">Get your personal referral link</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sign in to your account to access your unique referral link, track your referrals, and claim rewards.
            </p>
          </div>
          <Link href="/login"
            className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all w-full sm:w-auto text-center flex-shrink-0">
            Sign in to get link →
          </Link>
        </div>

        {/* REFERRAL VS AFFILIATE CALLOUT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-2 border-black rounded-2xl p-5">
            <div className="text-lg mb-2">🎁</div>
            <h3 className="text-sm font-extrabold mb-1">Referral Program</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              For everyone. Share your link, earn AI credits and free Pro months. No application needed — starts the moment you sign up.
            </p>
            <div className="mt-3 text-xs font-bold text-black">You are here ↓</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="text-lg mb-2">💸</div>
            <h3 className="text-sm font-extrabold mb-1">Affiliate Program</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              For creators and marketers. Earn 30–40% recurring cash commissions on every referral. Requires an application and approval.
            </p>
            <Link href="/affiliate" className="mt-3 inline-block text-xs font-bold text-black underline hover:no-underline">
              Learn more & apply →
            </Link>
          </div>
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
                    {tier.conditional && (
                      <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        while active
                      </span>
                    )}
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
            All milestone rewards are permanent. Every 5 paying referrals earns you +100 bonus credits with no cap or expiry.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-extrabold mb-5">Common questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
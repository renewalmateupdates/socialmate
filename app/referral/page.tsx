'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const REWARD_TIERS = [
  { referrals: 1,   reward: '25 bonus AI credits',          icon: '🎁' },
  { referrals: 5,   reward: '150 bonus AI credits',         icon: '⭐' },
  { referrals: 10,  reward: '1 month Pro free',             icon: '🚀' },
  { referrals: 25,  reward: '3 months Pro free',            icon: '💎' },
  { referrals: 50,  reward: 'Lifetime Pro discount (50%)',  icon: '👑' },
]

const HISTORY = [
  { name: 'Alex M.',    date: 'Feb 28, 2025', status: 'Signed up',  reward: '+25 credits' },
  { name: 'Jordan K.',  date: 'Feb 14, 2025', status: 'Upgraded',   reward: '+50 credits' },
  { name: 'Sam R.',     date: 'Jan 30, 2025', status: 'Signed up',  reward: '+25 credits' },
]

export default function Referral() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'SOCIAL-DEMO'
  const referralLink = `https://socialmate.app/signup?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Referral Program</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Share SocialMate and earn credits every time someone joins.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Referrals',  value: '3'    },
            { label: 'Credits Earned',   value: '100'  },
            { label: 'Active Referrals', value: '2'    },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* REFERRAL LINK */}
        <div className="bg-black text-white rounded-2xl p-6 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Referral Link</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">
              {referralLink}
            </div>
            <button onClick={handleCopy}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${
                copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:opacity-80'
              }`}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            You earn 25 credits when someone signs up · 50 more if they upgrade to a paid plan
          </p>
        </div>

        {/* REWARD TIERS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-5">Reward Tiers</h2>
          <div className="space-y-3">
            {REWARD_TIERS.map((tier, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tier.icon}</span>
                  <div>
                    <p className="text-sm font-bold">
                      {tier.referrals} {tier.referrals === 1 ? 'referral' : 'referrals'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl">
                  {tier.reward}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORY */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-5">Referral History</h2>
          {HISTORY.length > 0 ? (
            <div className="space-y-2">
              {HISTORY.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{entry.name}</p>
                    <p className="text-xs text-gray-400">{entry.date} · {entry.status}</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                    {entry.reward}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No referrals yet — share your link to get started!</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <p className="text-sm font-extrabold mb-1">Want to earn more?</p>
          <p className="text-xs text-gray-400 mb-4">
            Check out the affiliate program for recurring 30% commission on every paying subscriber.
          </p>
          <Link href="/affiliate"
            className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
            View Affiliate Program →
          </Link>
        </div>

      </div>
    </PublicLayout>
  )
}
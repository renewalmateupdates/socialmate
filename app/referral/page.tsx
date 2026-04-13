'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { createClient } from '@/lib/supabase-browser'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

const SIGNUP_REWARDS = [
  { trigger: 'Your referral publishes their first post', reward: '+10 credits', both: true  },
  { trigger: 'They upgrade to Pro',                      reward: '+50 credits', both: false },
  { trigger: 'They upgrade to Agency',                   reward: '+50 credits', both: false },
]

const MILESTONES = [
  { paying: 5,  reward: '+100 bonus credits', icon: '🎁' },
  { paying: 10, reward: '+100 bonus credits', icon: '⭐' },
  { paying: 15, reward: '+100 bonus credits', icon: '🚀' },
  { paying: 20, reward: '+100 bonus credits', icon: '💎' },
  { paying: 25, reward: '+100 bonus credits', icon: '👑' },
]

const FAQ = [
  {
    q: 'How do I get my referral link?',
    a: 'Create a free account — your unique link is generated automatically at signup. You\'ll find it on this page once you\'re signed in.',
  },
  {
    q: 'When do I receive my credits?',
    a: 'First-post credits (+10) are added within 24 hours. Upgrade credits are added after a 7-day hold to protect against refunds.',
  },
  {
    q: 'What counts as a "paying referral" for milestones?',
    a: 'Someone who subscribes to Pro or Agency through your link and stays subscribed for 30+ days. Trial periods and refunds don\'t count.',
  },
  {
    q: 'Do milestone rewards stack?',
    a: 'Yes. Every 5 paying referrals earns +100 bonus credits with no cap. Reach 25, earn 500 bonus credits total.',
  },
  {
    q: 'Do bonus credits expire?',
    a: 'Never. Milestone credits are added permanently to your AI credit balance and work exactly like regular credits.',
  },
  {
    q: 'What\'s the difference between referrals and the affiliate program?',
    a: 'Referrals = credits (free, no application). Affiliates = cash commissions (30–40% recurring, application-based). Both can run simultaneously.',
  },
]

export default function ReferralPage() {
  const supabase = createClient()

  const [userId, setUserId]           = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied]           = useState(false)
  const [loading, setLoading]         = useState(true)
  const [stats, setStats]             = useState({ total: 0, paying: 0, credits: 0 })
  const [history, setHistory]         = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      setUserId(user.id)

      const { data: settings } = await supabase
        .from('user_settings')
        .select('referral_code')
        .eq('user_id', user.id)
        .single()

      if (settings?.referral_code) setReferralCode(settings.referral_code)

      // Load referral conversions
      const { data: conversions } = await supabase
        .from('referral_conversions')
        .select('*')
        .eq('affiliate_user_id', user.id)
        .order('converted_at', { ascending: false })

      if (conversions) {
        const paying       = conversions.filter(r => r.status === 'eligible' || r.status === 'paid')
        const totalCredits = conversions.reduce((sum, r) => sum + (r.total_earned ?? 0), 0)
        setStats({ total: conversions.length, paying: paying.length, credits: totalCredits })
        setHistory(conversions.slice(0, 5))
      }

      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const referralLink = referralCode ? `${APP_URL}/?ref=${referralCode}` : ''
  const nextMilestone = MILESTONES.find(m => stats.paying < m.paying)

  const handleCopy = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* ─── HEADER ─── */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Referral Program</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Share SocialMate.<br />Earn real rewards.
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Every account gets a personal referral link at signup — no application, no approval.
            Share it. When your referrals post and upgrade, you earn credits.
            The more you refer, the more generous the rewards.
          </p>
        </div>

        {/* ─── REFERRAL PROGRAM VS AFFILIATE CALLOUT ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-2xl p-5">
            <div className="text-2xl mb-2">🎁</div>
            <h3 className="text-sm font-extrabold mb-1">Referral Program</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              For everyone. Share your link, earn AI credits. No application — starts the moment you create an account.
            </p>
            <p className="mt-3 text-xs font-bold text-black dark:text-white">← You are here</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div className="text-2xl mb-2">💸</div>
            <h3 className="text-sm font-extrabold mb-1">Affiliate Program</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              For creators and marketers. Earn 30–40% recurring cash commissions on every referral. Application-based.
            </p>
            <Link href="/affiliate" className="mt-3 inline-block text-xs font-bold text-black dark:text-white underline hover:no-underline">
              Learn more &amp; apply →
            </Link>
          </div>
        </div>

        {/* ─── YOUR REFERRAL LINK (logged in) / CTA (logged out) ─── */}
        {loading ? (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 mb-8 animate-pulse h-28" />
        ) : userId ? (
          <div className="bg-black text-white rounded-2xl p-6 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your referral link</p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 font-mono text-sm text-gray-300 truncate">
                {referralLink || 'Generating your link...'}
              </div>
              <button
                onClick={handleCopy}
                disabled={!referralLink}
                className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all flex-shrink-0 disabled:opacity-40 min-h-[44px]">
                {copied ? '✓ Copied!' : 'Copy link'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Share this link anywhere. When someone signs up through it, you both earn credits.
            </p>
          </div>
        ) : (
          <div className="bg-black text-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-extrabold mb-1">Get your personal referral link</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Create a free account — your unique link is generated automatically. No credit card needed.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
              <Link href="/signup"
                className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-center min-h-[44px] flex items-center justify-center">
                Create free account →
              </Link>
              <Link href="/login"
                className="border border-gray-700 text-gray-300 text-sm font-bold px-6 py-3 rounded-xl hover:border-gray-500 transition-all text-center min-h-[44px] flex items-center justify-center">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* ─── LIVE STATS (logged in only) ─── */}
        {userId && !loading && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Referrals',  value: stats.total   },
              { label: 'Paying Referrals', value: stats.paying  },
              { label: 'Credits Earned',   value: stats.credits },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── MILESTONE PROGRESS (logged in + has paying refs) ─── */}
        {userId && !loading && nextMilestone && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-extrabold">Next milestone: {nextMilestone.paying} paying referrals</p>
              <span className="text-xs font-bold bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-full">
                {nextMilestone.reward}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-black dark:bg-white rounded-full transition-all"
                style={{ width: `${Math.min((stats.paying / nextMilestone.paying) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400">{stats.paying} / {nextMilestone.paying} paying referrals</p>
          </div>
        )}

        {/* ─── RECENT REFERRALS (logged in) ─── */}
        {userId && !loading && history.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-base font-extrabold mb-4">Recent referrals</h2>
            <div className="space-y-3">
              {history.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-xs font-bold">{entry.email ?? 'Anonymous'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {entry.converted_at ? new Date(entry.converted_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      entry.status === 'eligible' || entry.status === 'paid'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {entry.status ?? 'pending'}
                    </span>
                    {entry.total_earned > 0 && (
                      <span className="text-xs font-extrabold text-green-600">+{entry.total_earned} cr</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/settings?tab=Referrals"
              className="mt-4 inline-block text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              View full history in Settings →
            </Link>
          </div>
        )}

        {/* ─── HOW YOU EARN ─── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-1">How you earn credits</h2>
          <p className="text-xs text-gray-400 mb-5">Credits are added to your AI balance — use them for any AI tool.</p>
          <div className="space-y-3">
            {SIGNUP_REWARDS.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-bold">{item.trigger}</p>
                  {item.both && (
                    <p className="text-xs text-gray-400 mt-0.5">Both you and your referral get this</p>
                  )}
                </div>
                <span className="text-sm font-extrabold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-xl flex-shrink-0 ml-4">
                  {item.reward}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── MILESTONE TIERS ─── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold mb-1">Milestone rewards</h2>
          <p className="text-xs text-gray-400 mb-5">
            Every 5 paying referrals earns +100 bonus credits. Stacking, no cap, never expires.
          </p>
          <div className="space-y-3">
            {MILESTONES.map((tier, i) => {
              const unlocked = userId && stats.paying >= tier.paying
              return (
                <div key={i} className={`flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 ${unlocked ? '' : 'opacity-60'}`}>
                  <span className="text-2xl flex-shrink-0">{tier.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {tier.paying} paying referrals
                      {unlocked && (
                        <span className="ml-2 text-xs font-bold text-green-600 dark:text-green-400">✓ Unlocked</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl flex-shrink-0">
                    {tier.reward}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            All milestone credits are permanent and never expire. They stack with no cap.
          </p>
        </div>

        {/* ─── FAQ ─── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-extrabold mb-5">Common questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FAQ.map((item, i) => (
              <div key={i}>
                <p className="text-xs font-bold mb-1">{item.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SM-Give strip ─── */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-10 pb-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ❤️ <span className="font-semibold text-gray-700 dark:text-gray-300">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
            <Link href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Learn about SM-Give →</Link>
          </p>
        </div>

        {/* ─── BOTTOM CTA (logged out) ─── */}
        {!userId && !loading && (
          <div className="text-center mt-8">
            <p className="text-sm font-extrabold mb-1">Ready to start referring?</p>
            <p className="text-xs text-gray-400 mb-4">
              Create a free account — no credit card — and your referral link is ready immediately.
            </p>
            <Link href="/signup"
              className="inline-block bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-8 py-3 rounded-xl hover:opacity-80 transition-all">
              Create free account →
            </Link>
          </div>
        )}

      </div>
    </PublicLayout>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Referral = {
  id: string
  referred_email: string
  status: 'pending' | 'qualified' | 'upgraded'
  credits_earned: number
  created_at: string
}

const STEPS = [
  {
    number: '1',
    title: 'Share your link or code',
    description: 'Send your referral link or code to friends via social media, email, or DM.',
    icon: '🔗',
  },
  {
    number: '2',
    title: 'They sign up',
    description: 'Your friend creates a free SocialMate account using your link. The code is applied automatically.',
    icon: '👤',
  },
  {
    number: '3',
    title: 'Both of you activate',
    description: 'Once they verify their email, connect a platform, and publish their first post — you both earn 25 AI credits.',
    icon: '✅',
  },
  {
    number: '4',
    title: 'They upgrade (bonus)',
    description: 'If they upgrade to Pro or Agency, you both earn an extra 50 AI credits on top.',
    icon: '⚡',
  },
]

const REWARDS = [
  {
    scenario: 'Free → Free (qualified)',
    you: '+25 credits',
    them: '+25 credits',
    note: 'Must connect 1 platform + publish 1 post',
    color: 'bg-gray-50 border-gray-200',
    badge: 'Free',
    badgeColor: 'bg-gray-100 text-gray-600',
  },
  {
    scenario: 'Free → Paid upgrade',
    you: '+50 credits',
    them: '+50 credits',
    note: 'Stacks on top of the 25 qualification reward',
    color: 'bg-blue-50 border-blue-100',
    badge: 'Bonus',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    scenario: 'Pro / Agency referring → Paid upgrade',
    you: '1 month free on your plan',
    them: '+50 credits',
    note: 'Most powerful reward — your monthly bill disappears',
    color: 'bg-purple-50 border-purple-100',
    badge: 'Pro/Agency',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
]

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const { plan, credits } = useWorkspace()

  const referralCode = user ? `SM-${user.id.slice(0, 8).toUpperCase()}` : '...'
  const referralLink = user ? `https://socialmate.app/signup?ref=${referralCode}` : '...'

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

      setReferrals(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    showToast('Referral link copied!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    showToast('Referral code copied!', 'success')
  }

  const totalCreditsEarned = referrals.reduce((sum, r) => sum + r.credits_earned, 0)
  const qualifiedReferrals = referrals.filter(r => r.status === 'qualified' || r.status === 'upgraded')
  const upgradedReferrals = referrals.filter(r => r.status === 'upgraded')
  const pendingReferrals = referrals.filter(r => r.status === 'pending')

  const thisMonthRewards = referrals.filter(r => {
    const created = new Date(r.created_at)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      && (r.status === 'qualified' || r.status === 'upgraded')
  }).length

  const rewardsRemaining = Math.max(0, 5 - thisMonthRewards)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Referral Program</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Invite people to SocialMate — earn AI credits every time they qualify.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
              ))
            ) : (
              [
                { label: 'Credits Earned',    value: totalCreditsEarned,          icon: '⚡', color: 'text-yellow-500' },
                { label: 'Qualified',          value: qualifiedReferrals.length,   icon: '✅', color: 'text-green-600' },
                { label: 'Upgraded to Paid',  value: upgradedReferrals.length,    icon: '💎', color: 'text-purple-600' },
                { label: 'Rewards This Month', value: `${thisMonthRewards} / 5`,   icon: '🎯', color: 'text-blue-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    <span>{stat.icon}</span>
                  </div>
                  <div className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</div>
                </div>
              ))
            )}
          </div>

          {/* MONTHLY LIMIT NOTICE */}
          {rewardsRemaining < 5 && (
            <div className={`mb-6 rounded-2xl px-5 py-3 border flex items-center justify-between ${
              rewardsRemaining === 0
                ? 'bg-red-50 border-red-100'
                : 'bg-yellow-50 border-yellow-100'
            }`}>
              <p className={`text-xs font-semibold ${rewardsRemaining === 0 ? 'text-red-600' : 'text-yellow-700'}`}>
                {rewardsRemaining === 0
                  ? '🚫 You\'ve hit the 5 referral reward limit for this month. Resets on the 1st.'
                  : `⚠️ You have ${rewardsRemaining} referral reward${rewardsRemaining !== 1 ? 's' : ''} remaining this month.`
                }
              </p>
              <p className="text-xs text-gray-400">Max 5 per month to keep things fair for everyone</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* REFERRAL LINK */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-sm font-extrabold mb-1">Your referral link</h2>
              <p className="text-xs text-gray-400 mb-4">Share this anywhere — it auto-applies your code at signup.</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex-shrink-0 ${
                    copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'
                  }`}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* REFERRAL CODE */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-sm font-extrabold mb-1">Your referral code</h2>
              <p className="text-xs text-gray-400 mb-4">People can enter this manually at signup if they don't use your link.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-extrabold tracking-widest text-center text-gray-800 font-mono">
                  {referralCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="text-xs font-bold px-4 py-2.5 rounded-xl bg-black text-white hover:opacity-80 transition-all flex-shrink-0">
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-extrabold mb-5">How it works</h2>
            <div className="grid grid-cols-4 gap-4">
              {STEPS.map((step, i) => (
                <div key={i} className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-gray-100 hidden xl:block" />
                  )}
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl mx-auto mb-3">
                      {step.icon}
                    </div>
                    <div className="text-xs font-extrabold mb-1">{step.title}</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REWARD TIERS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-extrabold mb-5">Reward breakdown</h2>
            <div className="space-y-3">
              {REWARDS.map((reward, i) => (
                <div key={i} className={`border rounded-2xl p-4 ${reward.color}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-extrabold">{reward.scenario}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reward.badgeColor}`}>
                          {reward.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{reward.note}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-gray-700">You earn: <span className="text-green-600">{reward.you}</span></div>
                      <div className="text-xs text-gray-400">They earn: <span className="text-green-600">{reward.them}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                Referral rewards are capped at <span className="font-semibold text-gray-600">5 per month</span> to keep the system fair and sustainable. Rewards are added to your credit balance within 24 hours of qualification. Credits from referrals roll over and bank up — they don't expire with your monthly reset.
              </p>
            </div>
          </div>

          {/* REFERRAL HISTORY */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-4">Your referrals</h2>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🔗</div>
                <p className="text-sm font-bold mb-1">No referrals yet</p>
                <p className="text-xs text-gray-400 mb-4">Share your link above and start earning credits.</p>
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Copy your link
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* PENDING */}
                {pendingReferrals.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Pending ({pendingReferrals.length})</p>
                    {pendingReferrals.map(r => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-xl mb-2">
                        <div>
                          <p className="text-xs font-semibold">{r.referred_email}</p>
                          <p className="text-xs text-gray-400">Waiting for them to connect a platform + publish a post</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* QUALIFIED */}
                {qualifiedReferrals.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold">{r.referred_email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-green-600">+{r.credits_earned} credits</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        r.status === 'upgraded'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {r.status === 'upgraded' ? 'Upgraded' : 'Qualified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
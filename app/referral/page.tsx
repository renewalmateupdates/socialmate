'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Referral = {
  id: string
  referred_email: string
  status: 'pending' | 'signed_up' | 'active'
  created_at: string
}

const REWARDS = [
  { threshold: 1, label: '1 Referral', reward: '+5 AI Credits', icon: '🎁', color: 'bg-gray-100 text-gray-600' },
  { threshold: 3, label: '3 Referrals', reward: '+20 AI Credits', icon: '⭐', color: 'bg-blue-100 text-blue-700' },
  { threshold: 5, label: '5 Referrals', reward: '1 Month Pro Free', icon: '🏆', color: 'bg-purple-100 text-purple-700' },
  { threshold: 10, label: '10 Referrals', reward: '3 Months Pro Free', icon: '👑', color: 'bg-yellow-100 text-yellow-700' },
]

const SHARE_MESSAGES = [
  {
    platform: 'Twitter / X',
    icon: '🐦',
    message: (link: string) => `I've been using SocialMate to schedule posts across 16 social platforms — completely free. No per-channel fees, no limits. Way better than Buffer. Try it: ${link}`,
  },
  {
    platform: 'LinkedIn',
    icon: '💼',
    message: (link: string) => `If you manage social media for your brand or clients, check out SocialMate. It schedules across 16 platforms for free — including features Buffer and Hootsuite charge $100+/month for. Here's my referral link: ${link}`,
  },
  {
    platform: 'Instagram / Threads',
    icon: '📸',
    message: (link: string) => `Found a free social media scheduler that actually slaps 🔥 Schedule to 16 platforms, bulk schedule, link in bio builder, analytics — all free. Link in bio or here: ${link}`,
  },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const code = user.email?.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() + '-' + user.id.slice(0, 6)
      setReferralCode(code)

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

  const referralLink = `https://socialmate-six.vercel.app/signup?ref=${referralCode}`

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

  const handleCopyMessage = (platform: string, message: string) => {
    navigator.clipboard.writeText(message)
    setCopiedMsg(platform)
    showToast(`${platform} message copied!`, 'success')
    setTimeout(() => setCopiedMsg(null), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const signedUp = referrals.filter(r => r.status === 'signed_up' || r.status === 'active').length
  const pending = referrals.filter(r => r.status === 'pending').length
  const active = referrals.filter(r => r.status === 'active').length

  const nextReward = REWARDS.find(r => r.threshold > signedUp)
  const currentReward = [...REWARDS].reverse().find(r => r.threshold <= signedUp)
  const progressToNext = nextReward
    ? Math.min((signedUp / nextReward.threshold) * 100, 100)
    : 100

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral", active: true },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Referral Program</h1>
            <p className="text-sm text-gray-400 mt-0.5">Share SocialMate and earn free AI credits and Pro time</p>
          </div>

          {/* HERO */}
          <div className="bg-black text-white rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-extrabold tracking-tight">Invite friends, earn rewards 🎁</p>
                <p className="text-sm text-white/60 mt-1">For every friend who signs up, you both benefit</p>
              </div>
              <div className="text-4xl">🚀</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
              <code className="text-sm text-white flex-1 truncate font-mono">{referralLink}</code>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:opacity-80 transition-all"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {loading ? (
              [1,2,3].map(i => <SkeletonBox key={i} className="h-24 rounded-2xl" />)
            ) : (
              [
                { label: 'Invited', value: referrals.length, icon: '📨', sub: 'total invites sent' },
                { label: 'Signed Up', value: signedUp, icon: '✅', sub: 'joined SocialMate' },
                { label: 'Active', value: active, icon: '🔥', sub: 'still using the app' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))
            )}
          </div>

          {/* REWARD PROGRESS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold tracking-tight">Your Progress</h2>
              {currentReward && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${currentReward.color}`}>
                  {currentReward.icon} {currentReward.reward} earned!
                </span>
              )}
            </div>

            {nextReward && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{signedUp} / {nextReward.threshold} referrals to unlock</span>
                  <span className="text-xs font-bold">{nextReward.icon} {nextReward.reward}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-black h-3 rounded-full transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {nextReward.threshold - signedUp} more referral{nextReward.threshold - signedUp !== 1 ? 's' : ''} needed
                </p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {REWARDS.map(reward => {
                const unlocked = signedUp >= reward.threshold
                return (
                  <div
                    key={reward.threshold}
                    className={`rounded-xl p-3 border text-center transition-all ${unlocked ? 'border-black bg-black/5' : 'border-gray-100 opacity-50'}`}
                  >
                    <div className="text-xl mb-1">{reward.icon}</div>
                    <p className="text-xs font-bold">{reward.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{reward.reward}</p>
                    {unlocked && <p className="text-xs font-bold text-green-500 mt-1">✓ Unlocked</p>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SHARE MESSAGES */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-bold tracking-tight mb-1">Ready-to-Share Messages</h2>
            <p className="text-xs text-gray-400 mb-4">Copy and paste directly into your social media</p>
            <div className="space-y-3">
              {SHARE_MESSAGES.map(item => {
                const msg = item.message(referralLink)
                return (
                  <div key={item.platform} className="border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-xs font-bold">{item.platform}</span>
                      </div>
                      <button
                        onClick={() => handleCopyMessage(item.platform, msg)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${copiedMsg === item.platform ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {copiedMsg === item.platform ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{msg}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* REFERRAL LIST */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight">Your Referrals</h2>
              <span className="text-xs text-gray-400">{referrals.length} total</span>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <SkeletonBox key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : referrals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📨</div>
                <p className="text-sm font-bold mb-1">No referrals yet</p>
                <p className="text-xs text-gray-400 mb-4">Share your link above to start earning rewards</p>
                <button
                  onClick={handleCopyLink}
                  className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all"
                >
                  Copy My Referral Link
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {referrals.map(ref => (
                  <div key={ref.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {ref.referred_email[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ref.referred_email}</p>
                      <p className="text-xs text-gray-400">{timeAgo(ref.created_at)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      ref.status === 'active' ? 'bg-green-100 text-green-600' :
                      ref.status === 'signed_up' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {ref.status === 'active' ? '🔥 Active' : ref.status === 'signed_up' ? '✅ Signed Up' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
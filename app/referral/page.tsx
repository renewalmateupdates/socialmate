'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Referral = {
  id: string
  referred_email: string
  status: 'pending' | 'signed_up' | 'converted'
  created_at: string
  reward_claimed: boolean
  referrer_tier?: 'free' | 'pro' | 'agency'
}

const ALL_SHARE_PLATFORMS = [
  { id: 'twitter', icon: '🐦', label: 'X / Twitter', url: (msg: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}` },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn', url: (_: string, link: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}` },
  { id: 'facebook', icon: '📘', label: 'Facebook', url: (_: string, link: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}` },
  { id: 'threads', icon: '🧵', label: 'Threads', url: (msg: string) => `https://www.threads.net/intent/post?text=${encodeURIComponent(msg)}` },
  { id: 'reddit', icon: '🤖', label: 'Reddit', url: (msg: string, link: string) => `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(msg)}` },
  { id: 'telegram', icon: '✈️', label: 'Telegram', url: (msg: string, link: string) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msg)}` },
  { id: 'discord', icon: '💬', label: 'Discord', url: (msg: string) => `https://discord.com/channels/@me` },
  { id: 'bluesky', icon: '🦋', label: 'Bluesky', url: (msg: string) => `https://bsky.app/intent/compose?text=${encodeURIComponent(msg)}` },
  { id: 'pinterest', icon: '📌', label: 'Pinterest', url: (_: string, link: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}` },
  { id: 'tiktok', icon: '🎵', label: 'TikTok', url: () => `https://www.tiktok.com` },
  { id: 'instagram', icon: '📸', label: 'Instagram', url: () => `https://www.instagram.com` },
  { id: 'snapchat', icon: '👻', label: 'Snapchat', url: (_: string, link: string) => `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(link)}` },
  { id: 'youtube', icon: '▶️', label: 'YouTube', url: () => `https://www.youtube.com` },
  { id: 'mastodon', icon: '🐘', label: 'Mastodon', url: (msg: string) => `https://mastodon.social/share?text=${encodeURIComponent(msg)}` },
  { id: 'lemon8', icon: '🍋', label: 'Lemon8', url: () => `https://www.lemon8-app.com` },
  { id: 'email', icon: '📧', label: 'Email', url: (msg: string) => `mailto:?subject=Try SocialMate — It's Free&body=${encodeURIComponent(msg)}` },
]

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'Invited', color: 'bg-yellow-50 text-yellow-600 border border-yellow-200' },
  signed_up: { label: 'Activated', color: 'bg-blue-50 text-blue-600 border border-blue-200' },
  converted: { label: 'Upgraded', color: 'bg-green-50 text-green-700 border border-green-200' },
}

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'agency'>('free')
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Generate short clean code: first 4 chars of username + 4 digits
      const username = (user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')
      const code = username.slice(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000)
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const referralLink = `https://socialmate.app/signup?ref=${referralCode}`
  const shareMessage = `I've been using SocialMate to manage all my social media in one place — completely free. Try it: ${referralLink}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Referral link copied!', 'success')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    showToast('Code copied!', 'success')
  }

  const handleShare = (platform: typeof ALL_SHARE_PLATFORMS[0]) => {
    const url = platform.url(shareMessage, referralLink)
    window.open(url, '_blank')
  }

  const activated = referrals.filter(r => r.status === 'signed_up' || r.status === 'converted').length
  const converted = referrals.filter(r => r.status === 'converted').length
  const credits_earned = activated * 25

  const getReward = (referral: Referral) => {
    if (referral.status === 'converted') {
      return userTier === 'free' ? '+50 credits ✨' : '1 month free 🎉'
    }
    if (referral.status === 'signed_up') return '+25 credits ✨'
    return null
  }

  const visiblePlatforms = showAllPlatforms ? ALL_SHARE_PLATFORMS : ALL_SHARE_PLATFORMS.slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Referrals</h1>
            <p className="text-sm text-gray-400 mt-0.5">Invite friends and earn rewards</p>
          </div>

          {/* HERO */}
          <div className="bg-black text-white rounded-2xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
            <div className="relative z-10">
              <div className="text-3xl mb-3">🎁</div>
              <h2 className="text-xl font-extrabold mb-2">Share SocialMate, earn rewards</h2>
              <p className="text-white/70 text-sm mb-5 leading-relaxed">
                When someone you refer activates their account and publishes their first post, you both earn <span className="text-white font-bold">25 bonus AI credits</span>.
                {userTier === 'free'
                  ? <> If they upgrade to a paid plan, you earn an extra <span className="text-white font-bold">50 credits</span>.</>
                  : <> If they upgrade to a paid plan, you earn <span className="text-white font-bold">1 free month</span> of your current tier.</>
                }
              </p>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 border border-white/20">
                <p className="text-sm font-mono flex-1 truncate text-white/90">{referralLink}</p>
                <button onClick={handleCopyLink}
                  className="text-xs font-semibold px-3 py-1.5 bg-white text-black rounded-lg hover:opacity-80 transition-all flex-shrink-0">
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-bold tracking-tight mb-4">How it works</h2>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Share your link or code', desc: 'Send your referral link or code to friends — via social media, email, or DM.' },
                { step: '2', title: 'They sign up', desc: 'Your friend creates a free account using your link. The code is applied automatically.' },
                { step: '3', title: 'Both of you activate', desc: 'Once they confirm their email and publish their first post, you both earn 25 AI credits.' },
                { step: '4', title: 'They upgrade (bonus)', desc: userTier === 'free'
                  ? 'If they upgrade to Pro or Agency, you earn an extra 50 AI credits on top.'
                  : 'If they upgrade to the same tier or higher, you earn 1 free month of your current plan. Automatically.' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
              [
                { label: 'Total Invited', value: referrals.length, icon: '📧', color: 'text-gray-800' },
                { label: 'Activated', value: activated, icon: '✅', color: 'text-blue-600' },
                { label: 'Credits Earned', value: credits_earned, icon: '✨', color: 'text-purple-600' },
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

          {/* CODE + SHARE */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* CODE */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Your Referral Code</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between gap-3">
                <p className="text-2xl font-mono font-extrabold tracking-widest text-black">{referralCode}</p>
                <button onClick={handleCopyCode}
                  className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-400 transition-all flex-shrink-0">
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-400">Friends enter this code at signup to apply your referral</p>
            </div>

            {/* SHARE */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">Share Via</h2>
                <button onClick={() => setShowAllPlatforms(p => !p)}
                  className="text-xs text-gray-400 hover:text-black transition-colors font-semibold">
                  {showAllPlatforms ? 'Show less' : `All ${ALL_SHARE_PLATFORMS.length} →`}
                </button>
              </div>
              <div className="space-y-1.5">
                {visiblePlatforms.map(p => (
                  <button key={p.id} onClick={() => handleShare(p)}
                    className="w-full flex items-center gap-3 px-3 py-2 border border-gray-100 rounded-xl hover:border-gray-300 transition-all text-left">
                    <span className="text-sm">{p.icon}</span>
                    <span className="text-xs font-semibold">{p.label}</span>
                    <span className="ml-auto text-gray-400 text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold tracking-tight">Referral History</h2>
              <span className="text-xs text-gray-400">{referrals.length} total</span>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <SkeletonBox key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : referrals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No referrals yet</p>
                <p className="text-xs text-gray-400">Share your link above to get started</p>
              </div>
            ) : (
              <div>
                {referrals.map((referral, i) => {
                  const meta = STATUS_META[referral.status]
                  const reward = getReward(referral)
                  return (
                    <div key={referral.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i !== referrals.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {referral.referred_email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{referral.referred_email}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(referral.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                      {reward && <span className="text-xs font-semibold text-purple-600 whitespace-nowrap">{reward}</span>}
                    </div>
                  )
                })}
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
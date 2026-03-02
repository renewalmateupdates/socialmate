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
}

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const code = (user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000)
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

  const handleShare = (platform: string) => {
    const message = `I've been using SocialMate to manage all my social media in one place — try it free: ${referralLink}`
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Try SocialMate&body=${encodeURIComponent(message)}`,
    }
    window.open(urls[platform], '_blank')
  }

  const signed_up = referrals.filter(r => r.status === 'signed_up' || r.status === 'converted').length
  const converted = referrals.filter(r => r.status === 'converted').length
  const credits_earned = converted * 5

  const STATUS_META: Record<string, { label: string; color: string }> = {
    pending: { label: 'Invited', color: 'bg-yellow-50 text-yellow-600 border border-yellow-200' },
    signed_up: { label: 'Signed Up', color: 'bg-blue-50 text-blue-600 border border-blue-200' },
    converted: { label: 'Upgraded', color: 'bg-green-50 text-green-700 border border-green-200' },
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Referrals</h1>
            <p className="text-sm text-gray-400 mt-0.5">Invite friends, earn AI credits</p>
          </div>

          <div className="bg-black text-white rounded-2xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
            <div className="relative z-10">
              <div className="text-3xl mb-3">🎁</div>
              <h2 className="text-xl font-extrabold mb-2">Earn 5 AI credits per referral</h2>
              <p className="text-white/70 text-sm mb-6">For every friend who upgrades to Pro, you both get 5 free AI caption credits</p>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 border border-white/20">
                <p className="text-sm font-mono flex-1 truncate text-white/90">{referralLink}</p>
                <button onClick={handleCopyLink}
                  className="text-xs font-semibold px-3 py-1.5 bg-white text-black rounded-lg hover:opacity-80 transition-all flex-shrink-0">
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
              [
                { label: 'Total Invited', value: referrals.length, icon: '📧', color: 'text-gray-800' },
                { label: 'Signed Up', value: signed_up, icon: '👤', color: 'text-blue-600' },
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

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Your Referral Code</h2>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-xl font-mono font-bold flex-1 tracking-widest uppercase">{referralCode}</p>
                <button onClick={handleCopyCode}
                  className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-400">Friends can enter this code at signup</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Share Via</h2>
              <div className="space-y-2">
                {[
                  { id: 'twitter', icon: '🐦', label: 'X / Twitter' },
                  { id: 'linkedin', icon: '💼', label: 'LinkedIn' },
                  { id: 'email', icon: '📧', label: 'Email' },
                ].map(p => (
                  <button key={p.id} onClick={() => handleShare(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-100 rounded-xl hover:border-gray-300 transition-all text-left">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="ml-auto text-gray-400 text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                      {referral.status === 'converted' && (
                        <span className="text-xs font-semibold text-purple-600">+5 ✨</span>
                      )}
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
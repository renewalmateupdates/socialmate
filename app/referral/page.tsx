'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  const referralLink = user ? `https://socialmate-six.vercel.app/signup?ref=${user.id.slice(0, 8)}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const REWARDS = [
    { icon: "🎯", title: "Refer a free user", reward: "+25 AI credits", desc: "When someone signs up using your link, you get 25 bonus AI credits added to your account." },
    { icon: "⚡", title: "Refer a Pro upgrade", reward: "+3 months Pro free", desc: "When someone you referred upgrades to Pro, you get 3 months of Pro completely free." },
    { icon: "🏆", title: "Refer an Agency upgrade", reward: "+6 months Pro free", desc: "When someone you referred upgrades to Agency, you get 6 months of Pro free." },
  ]

  const SHARE_MESSAGES = [
    { label: "Twitter / X", text: `I've been using SocialMate to schedule all my social posts — and it's completely free. Way better than Buffer or Hootsuite. Sign up here: ${referralLink}` },
    { label: "LinkedIn", text: `If you're still paying for Buffer or Hootsuite, stop. SocialMate does everything they do — scheduling, AI captions, hashtags, analytics — for $0. Use my link: ${referralLink}` },
    { label: "WhatsApp / Text", text: `Hey! Check out SocialMate, it's a free social media scheduler that's actually good. Use my link: ${referralLink}` },
  ]

  const [copiedShare, setCopiedShare] = useState('')
  const handleCopyShare = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedShare(label)
    setTimeout(() => setCopiedShare(''), 2000)
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
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
          ].map(item => (
            <Link key={item.label} href={(item as any).href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(item as any).active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/compose" className="w-full block text-center bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>
      </div>

      <div className="ml-56 flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Referral Program</h1>
          <p className="text-sm text-gray-400 mt-0.5">Share SocialMate and earn free credits and Pro time.</p>
        </div>

        {/* HERO */}
        <div className="bg-black rounded-2xl p-8 mb-8 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">Refer friends. Earn rewards.</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Every person you refer earns you AI credits or free Pro time. No limits on how many people you can refer.</p>
        </div>

        {/* YOUR LINK */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="text-sm font-bold mb-1">Your unique referral link</div>
          <p className="text-xs text-gray-400 mb-4">Share this link anywhere. When someone signs up through it, rewards are automatically tracked.</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 font-mono truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${copied ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-black text-white hover:opacity-80'}`}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* REWARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {REWARDS.map(r => (
            <div key={r.title} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="text-3xl mb-3">{r.icon}</div>
              <div className="text-sm font-bold mb-1">{r.title}</div>
              <div className="text-base font-extrabold text-black mb-2">{r.reward}</div>
              <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* SHARE MESSAGES */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="text-sm font-bold mb-1">Ready-made share messages</div>
          <p className="text-xs text-gray-400 mb-4">Copy and paste these anywhere — your referral link is already included.</p>
          <div className="space-y-3">
            {SHARE_MESSAGES.map(msg => (
              <div key={msg.label} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">{msg.label}</span>
                  <button
                    onClick={() => handleCopyShare(msg.text, msg.label)}
                    className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${copiedShare === msg.label ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {copiedShare === msg.label ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* STATS PLACEHOLDER */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-sm font-bold mb-1">Your referral stats</div>
          <p className="text-xs text-gray-400 mb-6">Tracking launches when platform APIs go live.</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Referrals", value: "—" },
              { label: "Credits Earned", value: "—" },
              { label: "Pro Time Earned", value: "—" },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-extrabold text-gray-300 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
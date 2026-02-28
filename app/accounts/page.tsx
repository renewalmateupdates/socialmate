'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATFORMS = [
  { name: 'Instagram', icon: '📸', color: '#e1306c', description: 'Photos, Reels, Stories', eta: 'Q2 2026' },
  { name: 'X (Twitter)', icon: '𝕏', color: '#000000', description: 'Posts, Threads, Replies', eta: 'Q2 2026' },
  { name: 'LinkedIn', icon: '💼', color: '#0077b5', description: 'Posts, Articles, Updates', eta: 'Q2 2026' },
  { name: 'TikTok', icon: '🎵', color: '#000000', description: 'Short-form video', eta: 'Q3 2026' },
  { name: 'YouTube', icon: '▶️', color: '#ff0000', description: 'Videos, Shorts, Community', eta: 'Q3 2026' },
  { name: 'Pinterest', icon: '📌', color: '#e60023', description: 'Pins, Boards, Stories', eta: 'Q3 2026' },
  { name: 'Threads', icon: '🧵', color: '#000000', description: 'Text posts and photos', eta: 'Q3 2026' },
]

export default function Accounts() {
  const [user, setUser] = useState<any>(null)
  const [notifyRequested, setNotifyRequested] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  const handleNotify = (platform: string) => {
    setNotifyRequested(prev => [...prev, platform])
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
{ icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
{ icon: "🖼️", label: "Media Library", href: "/media" },
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
            { icon: "🔗", label: "Accounts", href: "/accounts", active: true },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
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

      <div className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Connected Accounts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Connect your social accounts to start auto-publishing.</p>
        </div>

        {/* NOTICE BANNER */}
        <div className="bg-black rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔐</div>
            <div>
              <div className="font-bold text-white text-sm mb-1">Platform API approvals in progress</div>
              <div className="text-gray-400 text-xs max-w-lg">We have submitted for API access to Instagram, X, LinkedIn and more. Each platform takes 4-12 weeks to approve. You will get an email the moment each one goes live. In the meantime you can use SocialMate to plan, write, and schedule all your content.</div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-6">
            <div className="text-white font-extrabold text-2xl">3</div>
            <div className="text-gray-400 text-xs">approvals pending</div>
          </div>
        </div>

        {/* SLOT USAGE */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold mb-1">Account slots — Free plan</div>
            <div className="text-xs text-gray-400">You can connect up to 3 accounts on the free plan. Upgrade to Pro for 10 slots.</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">+</div>
              ))}
            </div>
            <Link href="/pricing" className="bg-black text-white text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-80 transition-all">
              Upgrade →
            </Link>
          </div>
        </div>

        {/* PLATFORM GRID */}
        <div className="grid grid-cols-3 gap-4">
          {PLATFORMS.map(platform => {
            const notified = notifyRequested.includes(platform.name)
            return (
              <div key={platform.name} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${platform.color}15` }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{platform.name}</div>
                    <div className="text-xs text-gray-400">{platform.description}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-1 rounded-full">
                    ETA {platform.eta}
                  </span>
                  <span className="text-xs text-amber-600 font-semibold">⏳ Pending</span>
                </div>

                <button
                  onClick={() => handleNotify(platform.name)}
                  disabled={notified}
                  className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all ${notified ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'}`}
                >
                  {notified ? '✓ We will notify you' : '🔔 Notify me when live'}
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already connected a platform manually? <a href="mailto:renewalmate.updates@gmail.com" className="text-black font-semibold hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}
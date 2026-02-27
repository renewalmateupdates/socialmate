'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATFORMS = [
  { name: 'Instagram', icon: '📸', color: '#e1306c', description: 'Share photos and reels', status: 'coming_soon' },
  { name: 'X (Twitter)', icon: '🐦', color: '#1da1f2', description: 'Share posts and threads', status: 'coming_soon' },
  { name: 'LinkedIn', icon: '💼', color: '#0077b5', description: 'Share professional content', status: 'coming_soon' },
  { name: 'TikTok', icon: '🎵', color: '#000000', description: 'Share short form videos', status: 'coming_soon' },
  { name: 'YouTube', icon: '▶️', color: '#ff0000', description: 'Share videos and shorts', status: 'coming_soon' },
  { name: 'Pinterest', icon: '📌', color: '#e60023', description: 'Share pins and boards', status: 'coming_soon' },
  { name: 'Threads', icon: '🧵', color: '#000000', description: 'Share text and photos', status: 'coming_soon' },
]

export default function Accounts() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

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
          <p className="text-sm text-gray-400 mt-0.5">Connect your social media accounts to start publishing.</p>
        </div>

        {/* NOTICE BANNER */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <div className="font-semibold text-amber-800 text-sm">Platform integrations coming soon</div>
            <div className="text-amber-700 text-sm mt-0.5">We're in the process of getting API approval from each platform. You'll be notified by email as each one goes live. In the meantime you can schedule and organize all your content!</div>
          </div>
        </div>

        {/* PLATFORM GRID */}
        <div className="grid grid-cols-3 gap-4">
          {PLATFORMS.map(platform => (
            <div key={platform.name} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{platform.icon}</div>
                  <div>
                    <div className="font-bold text-sm">{platform.name}</div>
                    <div className="text-xs text-gray-400">{platform.description}</div>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="w-full py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
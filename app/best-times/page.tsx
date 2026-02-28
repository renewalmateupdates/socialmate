'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BEST_TIMES = [
  { platform: 'Instagram', icon: '📸', times: ['6:00 AM', '12:00 PM', '7:00 PM'], days: 'Tue, Wed, Fri', tip: 'Reels get 3x more reach than static posts.' },
  { platform: 'X (Twitter)', icon: '🐦', times: ['8:00 AM', '12:00 PM', '5:00 PM'], days: 'Mon, Tue, Wed', tip: 'Tweets with images get 150% more retweets.' },
  { platform: 'LinkedIn', icon: '💼', times: ['7:30 AM', '12:00 PM', '5:30 PM'], days: 'Tue, Wed, Thu', tip: 'Professional content performs best on weekday mornings.' },
  { platform: 'TikTok', icon: '🎵', times: ['7:00 AM', '3:00 PM', '8:00 PM'], days: 'Tue, Thu, Fri', tip: 'Post consistently — TikTok rewards daily creators.' },
  { platform: 'YouTube', icon: '▶️', times: ['2:00 PM', '4:00 PM', '9:00 PM'], days: 'Fri, Sat, Sun', tip: 'Longer videos (8-15 min) perform best for ad revenue.' },
  { platform: 'Pinterest', icon: '📌', times: ['8:00 PM', '9:00 PM', '11:00 PM'], days: 'Sat, Sun', tip: 'Pinterest has the longest content lifespan of any platform.' },
  { platform: 'Threads', icon: '🧵', times: ['9:00 AM', '1:00 PM', '7:00 PM'], days: 'Mon, Wed, Fri', tip: 'Conversational posts drive the most replies on Threads.' },
]

const getPlatformColor = (platform: string) => {
  const colors: Record<string, string> = {
    'Instagram': '#ec4899',
    'X (Twitter)': '#0ea5e9',
    'LinkedIn': '#3b82f6',
    'TikTok': '#000000',
    'YouTube': '#ef4444',
    'Pinterest': '#f43f5e',
    'Threads': '#8b5cf6',
  }
  return colors[platform] || '#6b7280'
}

export default function BestTimes() {
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
            { icon: "🔍", label: "Best Times", href: "/best-times", active: true },
          ].map(item => (
            <Link key={item.label} href={(item as any).href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(item as any).active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
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
          <h1 className="text-2xl font-extrabold tracking-tight">Best Times to Post</h1>
          <p className="text-sm text-gray-400 mt-0.5">Data-backed optimal posting times for each platform.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <div className="font-semibold text-amber-800 text-sm">These are general best times based on industry data</div>
            <div className="text-amber-700 text-sm mt-0.5">Once platform integrations go live, we'll analyze your specific audience and give you personalized recommendations.</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {BEST_TIMES.map(platform => (
            <div key={platform.platform} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{platform.icon}</span>
                <div>
                  <div className="font-extrabold text-sm">{platform.platform}</div>
                  <div className="text-xs text-gray-400">Best days: {platform.days}</div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {platform.times.map(time => (
                  <div key={time} style={{ backgroundColor: getPlatformColor(platform.platform) + '15', color: getPlatformColor(platform.platform) }} className="text-xs font-semibold px-3 py-1.5 rounded-lg">
                    {time}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                💡 {platform.tip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
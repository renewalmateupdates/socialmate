'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Analytics() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')

  const platformCounts = posts.reduce((acc: Record<string, number>, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1
    return acc
  }, {})

  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('default', { weekday: 'short' })
    const count = posts.filter(p => {
      const pd = new Date(p.created_at)
      return pd.toDateString() === d.toDateString()
    }).length
    return { label, count }
  })

  const maxCount = Math.max(...last7Days.map(d => d.count), 1)

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
            { icon: "📊", label: "Analytics", href: "/analytics", active: true },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your content performance.</p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Posts", value: posts.length, icon: "📝" },
            { label: "Scheduled", value: scheduled.length, icon: "📅" },
            { label: "Drafts", value: drafts.length, icon: "📂" },
            { label: "Top Platform", value: topPlatform ? topPlatform[0].split(' ')[0] : '—', icon: "🏆" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                <span className="text-base">{stat.icon}</span>
              </div>
              <div className="text-3xl font-extrabold tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* POSTS THIS WEEK BAR CHART */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-extrabold text-base tracking-tight mb-6">Posts Created — Last 7 Days</h2>
            {posts.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">No posts yet</div>
            ) : (
              <div className="flex items-end gap-3 h-32">
                {last7Days.map(day => (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-semibold text-gray-500">{day.count > 0 ? day.count : ''}</div>
                    <div
                      className="w-full rounded-t-lg bg-black transition-all"
                      style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px', opacity: day.count > 0 ? 1 : 0.1 }}
                    />
                    <div className="text-xs text-gray-400">{day.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PLATFORM BREAKDOWN */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-extrabold text-base tracking-tight mb-6">Posts by Platform</h2>
            {Object.keys(platformCounts).length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">No posts yet</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-gray-700 truncate">{platform.split(' ')[0]}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${(count / posts.length) * 100}%`, backgroundColor: getPlatformColor(platform) }}
                      />
                    </div>
                    <div className="text-sm font-semibold text-gray-500 w-6 text-right">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATUS BREAKDOWN */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-extrabold text-base tracking-tight mb-6">Post Status Breakdown</h2>
          {posts.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">No posts yet — <Link href="/compose" className="text-black font-semibold">create your first post</Link></div>
          ) : (
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Scheduled: <span className="font-bold text-black">{scheduled.length}</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-600">Drafts: <span className="font-bold text-black">{drafts.length}</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-black"></div>
                <span className="text-sm text-gray-600">Total: <span className="font-bold text-black">{posts.length}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
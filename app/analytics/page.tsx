'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

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
    if (post.platform) acc[post.platform] = (acc[post.platform] || 0) + 1
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

  const last4Weeks = Array.from({ length: 4 }).map((_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7 - 6)
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7)
    const count = posts.filter(p => {
      const pd = new Date(p.created_at)
      return pd >= weekStart && pd <= weekEnd
    }).length
    return { label: `Wk ${i + 1}`, count }
  })

  const maxCount = Math.max(...last7Days.map(d => d.count), 1)
  const maxWeekCount = Math.max(...last4Weeks.map(d => d.count), 1)

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

  const scheduledThisWeek = posts.filter(p => {
    if (!p.scheduled_at) return false
    const d = new Date(p.scheduled_at)
    const now = new Date()
    const weekOut = new Date()
    weekOut.setDate(now.getDate() + 7)
    return d >= now && d <= weekOut
  }).length

  const mostActiveDay = (() => {
    const dayCounts: Record<string, number> = {}
    posts.forEach(p => {
      const day = new Date(p.created_at).toLocaleDateString('default', { weekday: 'long' })
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })
    const top = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]
    return top ? top[0] : '—'
  })()

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
            <p className="text-sm text-gray-400 mt-0.5">Track your content activity and planning.</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            📊 Engagement data unlocks when platforms connect
          </div>
        </div>

        {/* STAT CARDS */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Posts", value: posts.length, sub: "all time", icon: "📝" },
              { label: "Scheduled", value: scheduled.length, sub: "upcoming", icon: "📅" },
              { label: "This Week", value: scheduledThisWeek, sub: "scheduled next 7 days", icon: "🗓️" },
              { label: "Top Platform", value: topPlatform ? topPlatform[0].split(' ')[0] : '—', sub: topPlatform ? `${topPlatform[1]} posts` : 'no posts yet', icon: "🏆" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* POSTS THIS WEEK */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-extrabold text-base tracking-tight mb-1">Posts Created — Last 7 Days</h2>
            <p className="text-xs text-gray-400 mb-6">How many posts you created each day</p>
            {loading ? (
              <SkeletonBox className="h-32 w-full" />
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <div className="text-3xl mb-2">📭</div>
                No posts yet — <Link href="/compose" className="text-black font-semibold">create one</Link>
              </div>
            ) : (
              <div className="flex items-end gap-3 h-32">
                {last7Days.map(day => (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-semibold text-gray-500">{day.count > 0 ? day.count : ''}</div>
                    <div
                      className="w-full rounded-t-lg bg-black transition-all"
                      style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px', opacity: day.count > 0 ? 1 : 0.08 }}
                    />
                    <div className="text-xs text-gray-400">{day.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PLATFORM BREAKDOWN */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-extrabold text-base tracking-tight mb-1">Posts by Platform</h2>
            <p className="text-xs text-gray-400 mb-6">Which platforms you post to most</p>
            {loading ? (
              <SkeletonBox className="h-32 w-full" />
            ) : Object.keys(platformCounts).length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <div className="text-3xl mb-2">📭</div>
                No posts yet
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-medium text-gray-700 truncate">{platform.split(' ')[0]}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${(count / posts.length) * 100}%`, backgroundColor: getPlatformColor(platform) }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-500 w-6 text-right">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* WEEKLY TREND */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-extrabold text-base tracking-tight mb-1">Weekly Activity</h2>
            <p className="text-xs text-gray-400 mb-6">Posts created over the last 4 weeks</p>
            {loading ? (
              <SkeletonBox className="h-28 w-full" />
            ) : (
              <div className="flex items-end gap-4 h-28">
                {last4Weeks.map(week => (
                  <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-semibold text-gray-500">{week.count > 0 ? week.count : ''}</div>
                    <div
                      className="w-full rounded-t-lg bg-gray-800 transition-all"
                      style={{ height: `${(week.count / maxWeekCount) * 100}%`, minHeight: week.count > 0 ? '8px' : '2px', opacity: week.count > 0 ? 1 : 0.08 }}
                    />
                    <div className="text-xs text-gray-400">{week.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSIGHTS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-extrabold text-base tracking-tight mb-1">Quick Insights</h2>
            <p className="text-xs text-gray-400 mb-6">Patterns from your posting activity</p>
            {loading ? (
              <SkeletonBox className="h-28 w-full" />
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-6">No data yet</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Most active day</span>
                  <span className="text-xs font-bold text-black">{mostActiveDay}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Draft to scheduled ratio</span>
                  <span className="text-xs font-bold text-black">
                    {posts.length > 0 ? `${Math.round((scheduled.length / posts.length) * 100)}% scheduled` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Platforms used</span>
                  <span className="text-xs font-bold text-black">{Object.keys(platformCounts).length} of 7</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Avg posts per week</span>
                  <span className="text-xs font-bold text-black">
                    {(last4Weeks.reduce((a, b) => a + b.count, 0) / 4).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRO TEASER */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-sm mb-1">Want real engagement analytics?</div>
            <div className="text-gray-400 text-xs max-w-md">Connect your social accounts to unlock reach, impressions, follower growth, and best performing posts — all in one place.</div>
          </div>
          <Link href="/accounts" className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-6">
            Connect Accounts →
          </Link>
        </div>
      </div>
    </div>
  )
}
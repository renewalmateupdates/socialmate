'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Post = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string
  status: string
  created_at: string
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷', whatsapp: '💚',
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function timeFromNow(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (diff < 0) return 'Overdue'
  if (mins < 60) return `in ${mins}m`
  if (hours < 24) return `in ${hours}h`
  return `in ${days}d`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      setPosts(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const now = new Date()
  const todayStr = now.toDateString()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')
  const published = posts.filter(p => p.status === 'published')
  const overdue = scheduled.filter(p => p.scheduled_at && new Date(p.scheduled_at) < now)
  const upcoming = scheduled.filter(p => p.scheduled_at && new Date(p.scheduled_at) >= now).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const todayPosts = scheduled.filter(p => p.scheduled_at && new Date(p.scheduled_at).toDateString() === todayStr)
  const thisWeekPosts = posts.filter(p => p.created_at && new Date(p.created_at) >= weekStart)
  const recentActivity = posts.slice(0, 8)

  const platformCounts = scheduled.reduce((acc, post) => {
    post.platforms?.forEach(pl => { acc[pl] = (acc[pl] || 0) + 1 })
    return acc
  }, {} as Record<string, number>)
  const topPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const count = scheduled.filter(p => p.scheduled_at && new Date(p.scheduled_at).toDateString() === d.toDateString()).length
    return { day: DAYS_OF_WEEK[d.getDay()], date: d.getDate(), count, isToday: d.toDateString() === todayStr }
  })

  const maxWeekCount = Math.max(...weekDays.map(d => d.count), 1)

  const userName = user?.email?.split('@')[0] || 'there'

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
            { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
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
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
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

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {loading ? (
              <SkeletonBox className="h-8 w-48 mb-2" />
            ) : (
              <h1 className="text-2xl font-extrabold tracking-tight">
                {greeting}, {userName} 👋
              </h1>
            )}
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? '' : `${todayPosts.length} post${todayPosts.length !== 1 ? 's' : ''} scheduled today · ${upcoming.length} coming up`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/bulk-scheduler" className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
              📆 Bulk Schedule
            </Link>
            <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              ✏️ Compose
            </Link>
          </div>
        </div>

        {/* OVERDUE BANNER */}
        {!loading && overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-red-700">{overdue.length} overdue post{overdue.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500">These posts missed their scheduled time</p>
              </div>
            </div>
            <Link href="/queue" className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
              View Queue →
            </Link>
          </div>
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))
          ) : (
            [
              { label: 'Scheduled', value: scheduled.length, icon: '📅', sub: 'posts queued', color: 'text-blue-600', href: '/queue' },
              { label: 'Drafts', value: drafts.length, icon: '📂', sub: 'in progress', color: 'text-gray-500', href: '/drafts' },
              { label: 'This Week', value: thisWeekPosts.length, icon: '📈', sub: 'posts created', color: 'text-purple-600', href: '/analytics' },
              { label: 'Published', value: published.length, icon: '✅', sub: 'all time', color: 'text-green-600', href: '/analytics' },
            ].map(stat => (
              <Link key={stat.label} href={stat.href} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </Link>
            ))
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* LEFT COL */}
          <div className="col-span-2 space-y-6">

            {/* THIS WEEK CHART */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">This Week</h2>
                <Link href="/calendar" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">View Calendar →</Link>
              </div>
              {loading ? (
                <SkeletonBox className="h-20" />
              ) : (
                <div className="flex items-end gap-2 h-20">
                  {weekDays.map(day => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: '56px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all ${day.isToday ? 'bg-black' : day.count > 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
                          style={{ height: day.count > 0 ? `${Math.max((day.count / maxWeekCount) * 100, 15)}%` : '8px' }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${day.isToday ? 'text-black' : 'text-gray-400'}`}>{day.day}</span>
                      {day.count > 0 && <span className="text-xs text-gray-400">{day.count}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UPCOMING POSTS */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">Upcoming Posts</h2>
                <Link href="/queue" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3">
                      <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-3 w-3/4" />
                        <SkeletonBox className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm text-gray-400 mb-3">No upcoming posts scheduled</p>
                  <Link href="/compose" className="text-xs font-semibold bg-black text-white px-4 py-2 rounded-xl hover:opacity-80 transition-all">
                    Create Your First Post →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map(post => {
                    const t = timeFromNow(post.scheduled_at)
                    const isOverdue = t === 'Overdue'
                    return (
                      <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                          {post.platforms?.[0] ? PLATFORM_ICONS[post.platforms[0]] : '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-800">{post.content?.slice(0, 60)}{post.content?.length > 60 ? '...' : ''}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-0.5">
                              {post.platforms?.slice(0, 3).map(pl => (
                                <span key={pl} className="text-xs">{PLATFORM_ICONS[pl]}</span>
                              ))}
                              {post.platforms?.length > 3 && <span className="text-xs text-gray-400">+{post.platforms.length - 3}</span>}
                            </div>
                            <span className="text-xs text-gray-400">·</span>
                            <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>{t}</span>
                          </div>
                        </div>
                        <Link href={`/compose?edit=${post.id}`} className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-gray-400 hover:text-black transition-all flex-shrink-0">
                          Edit
                        </Link>
                      </div>
                    )
                  })}
                  {upcoming.length > 5 && (
                    <Link href="/queue" className="block text-center text-xs font-semibold text-gray-400 hover:text-black py-2 transition-colors">
                      +{upcoming.length - 5} more posts →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">Recent Activity</h2>
                <Link href="/drafts" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">View Drafts →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3">
                      <SkeletonBox className="w-8 h-8 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBox className="h-3 w-3/4" />
                        <SkeletonBox className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map(post => (
                    <div key={post.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${post.status === 'scheduled' ? 'bg-blue-400' : post.status === 'published' ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <p className="text-xs text-gray-600 flex-1 truncate">{post.content?.slice(0, 50)}{post.content?.length > 50 ? '...' : ''}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(post.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-6">

            {/* QUICK ACTIONS */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { icon: '✏️', label: 'Write a post', sub: 'Compose & schedule', href: '/compose', primary: true },
                  { icon: '📆', label: 'Bulk schedule', sub: 'Schedule many at once', href: '/bulk-scheduler' },
                  { icon: '📅', label: 'View calendar', sub: 'See all scheduled posts', href: '/calendar' },
                  { icon: '📝', label: 'Use a template', sub: 'Start from a saved format', href: '/templates' },
                  { icon: '🖼️', label: 'Upload media', sub: 'Add to your library', href: '/media' },
                  { icon: '🔗', label: 'Edit link in bio', sub: 'Update your bio page', href: '/link-in-bio' },
                ].map(action => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${action.primary ? 'bg-black text-white hover:opacity-80' : 'hover:bg-gray-50 border border-gray-100 hover:border-gray-300'}`}
                  >
                    <span className="text-base">{action.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${action.primary ? 'text-white' : 'text-gray-700'}`}>{action.label}</p>
                      <p className={`text-xs ${action.primary ? 'text-white/70' : 'text-gray-400'}`}>{action.sub}</p>
                    </div>
                    <span className={`text-xs ${action.primary ? 'text-white/50' : 'text-gray-300'}`}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* TOP PLATFORMS */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Top Platforms</h2>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <SkeletonBox key={i} className="h-6" />)}
                </div>
              ) : topPlatforms.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400">No scheduled posts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlatforms.map(([platform, count]) => (
                    <div key={platform} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{PLATFORM_ICONS[platform] || '📱'}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold capitalize">{platform}</span>
                          <span className="text-xs text-gray-400">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-black h-1.5 rounded-full" style={{ width: `${(count / (topPlatforms[0]?.[1] || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TODAY'S POSTS */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">Today</h2>
                <span className="text-xs font-semibold text-gray-400">{now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {loading ? (
                <SkeletonBox className="h-20" />
              ) : todayPosts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 mb-2">Nothing scheduled today</p>
                  <Link href="/compose" className="text-xs font-semibold text-black underline">Schedule something →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayPosts.map(post => (
                    <div key={post.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                      <span className="text-sm">{post.platforms?.[0] ? PLATFORM_ICONS[post.platforms[0]] : '📝'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">{post.content?.slice(0, 35)}...</p>
                        <p className="text-xs text-gray-400">{new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
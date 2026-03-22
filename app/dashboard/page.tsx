'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

const PLATFORM_ICONS: Record<string, string> = {
  discord: '💬', bluesky: '🦋', telegram: '✈️', mastodon: '🐘',
  linkedin: '💼', youtube: '▶️', pinterest: '📌', reddit: '🤖',
  instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '📘',
}

type Post = {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduled_at: string
  created_at: string
}

type DashStats = {
  scheduled: number
  drafts: number
  thisWeek: number
  published: number
  todayCount: number
  upcomingCount: number
}

function CreditSuccessModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-extrabold mb-2">Credits Added!</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          Your AI credits have been added and are ready to use right now.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Thank you for supporting SocialMate 🙏
        </p>
        <button onClick={onDismiss}
          className="w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
          Let's go! →
        </button>
      </div>
    </div>
  )
}

function DashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [stats, setStats] = useState<DashStats>({
    scheduled: 0, drafts: 0, thisWeek: 0, published: 0, todayCount: 0, upcomingCount: 0,
  })
  const [upcomingPosts, setUpcomingPosts] = useState<Post[]>([])
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [weekCounts, setWeekCounts] = useState<number[]>([0,0,0,0,0,0,0])
  const [streak, setStreak] = useState(0)
  const { plan, credits } = useWorkspace()

  useEffect(() => {
    if (searchParams.get('credits') === 'added') setShowCreditModal(true)
  }, [searchParams])

  const handleCreditModalDismiss = () => {
    setShowCreditModal(false)
    window.location.href = '/dashboard'
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarding_completed) { router.push('/onboarding'); return }

      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, platforms, status, scheduled_at, created_at')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true })

      if (posts) {
        const now       = new Date()
        const weekAgo   = new Date(now); weekAgo.setDate(now.getDate() - 7)
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
        const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)

        setStats({
          scheduled:     posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
          drafts:        posts.filter(p => p.status === 'draft').length,
          thisWeek:      posts.filter(p => new Date(p.created_at) >= weekAgo).length,
          published:     posts.filter(p => p.status === 'published').length,
          todayCount:    posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) >= todayStart && new Date(p.scheduled_at) <= todayEnd).length,
          upcomingCount: posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
        })

        setUpcomingPosts(posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).slice(0, 4))
        setRecentPosts(
          posts
            .filter(p => p.status === 'draft' || p.status === 'published')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
        )

        const counts = [0,0,0,0,0,0,0]
        posts.forEach(p => {
          const d = new Date(p.created_at)
          if (d >= weekAgo) counts[d.getDay()]++
        })
        setWeekCounts(counts)
      }

      // Load posting streak
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('current_streak')
        .eq('user_id', user.id)
        .single()
      if (settingsData?.current_streak) setStreak(settingsData.current_streak)

      setUser(user)
      setProfile(profile)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const displayName  = profile?.display_name || user?.email?.split('@')[0] || 'there'
  const hour         = new Date().getHours()
  const greeting     = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const planConfig   = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const todayDayIdx  = new Date().getDay()
  const DAYS         = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const maxWeekCount = Math.max(...weekCounts, 1)

  // Credits display — use bank capacity so 2500/3000 makes sense
  const bankCap      = planConfig?.creditBank ?? 150
  const creditPct    = Math.min((credits / bankCap) * 100, 100)
  const creditColor  = creditPct > 50 ? 'bg-green-500' : creditPct > 20 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="flex min-h-screen bg-theme">
      {showCreditModal && <CreditSuccessModal onDismiss={handleCreditModalDismiss} />}
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{greeting}, {displayName} 👋</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {stats.todayCount > 0
                  ? `${stats.todayCount} post${stats.todayCount !== 1 ? 's' : ''} scheduled today · ${stats.upcomingCount} coming up`
                  : 'Nothing scheduled today — want to change that?'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link href="/bulk-scheduler"
                className="px-3 py-2 border border-gray-200 bg-white dark:bg-gray-800 dark:text-white rounded-xl text-xs font-semibold hover:border-gray-400 transition-all">
                📅 Bulk Schedule
              </Link>
              <Link href="/compose"
                className="px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:opacity-80 transition-all">
                ✏️ Compose
              </Link>
            </div>
          </div>

          {/* TOP STRIP — Plan + Credits + Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">

            {/* Plan card */}
            <div className={`col-span-2 rounded-2xl px-4 py-3 border flex items-center justify-between ${
              plan === 'free'   ? 'bg-gray-50 border-gray-200'   :
              plan === 'pro'    ? 'bg-blue-50 border-blue-100'   :
              'bg-purple-50 border-purple-100'
            }`}>
              <div>
                <p className={`text-xs font-extrabold ${
                  plan === 'agency' ? 'text-purple-700' : plan === 'pro' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {plan === 'free' && '🔓 Free Plan'}
                  {plan === 'pro'  && '⚡ Pro Plan'}
                  {plan === 'agency' && '🏢 Agency Plan'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {planConfig?.accountsPerPlatform} acct/platform · {planConfig?.seats} seats
                </p>
              </div>
              {plan === 'free' && (
                <Link href="/settings?tab=Plan"
                  className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                  Upgrade
                </Link>
              )}
            </div>

            {/* Credits card */}
            <div className="col-span-2 bg-surface border border-theme rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">AI Credits</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{credits.toLocaleString()} remaining</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full transition-all ${creditColor}`} style={{ width: `${creditPct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">banks up to {bankCap.toLocaleString()}</p>
                {creditPct < 20 && (
                  <Link href="/settings?tab=Plan" className="text-xs font-bold text-blue-600 hover:underline">
                    Get more →
                  </Link>
                )}
              </div>
            </div>

            {/* Stat cards */}
            {[
              { label: 'Scheduled', value: stats.scheduled,  icon: '📅', color: 'text-blue-600'   },
              { label: 'Drafts',    value: stats.drafts,     icon: '📁', color: 'text-yellow-600' },
              { label: 'Published', value: stats.published,  icon: '✅', color: 'text-green-600'  },
              { label: 'This Week', value: stats.thisWeek,   icon: '✏️', color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-theme rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{s.label}</span>
                  <span className="text-sm">{s.icon}</span>
                </div>
                <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
              </div>
            ))}

            {/* Streak card */}
            <div className="col-span-2 bg-surface border border-theme rounded-2xl p-3 flex items-center gap-3">
              <div className="text-2xl">🔥</div>
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Posting Streak</div>
                <div className="text-xl font-extrabold text-orange-500">
                  {streak} day{streak !== 1 ? 's' : ''}
                </div>
              </div>
              {streak >= 7 && (
                <div className="ml-auto text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                  🏆 On fire!
                </div>
              )}
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT — 2 cols */}
            <div className="lg:col-span-2 space-y-5">

              {/* WEEK ACTIVITY */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">This Week's Activity</h2>
                  <Link href="/analytics" className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-all">Full analytics →</Link>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day, i) => {
                    const isToday = i === todayDayIdx
                    const count   = weekCounts[i]
                    const pct     = count > 0 ? Math.max((count / maxWeekCount) * 100, 12) : 0
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '48px' }}>
                          {count > 0
                            ? <div className={`w-full rounded-t-lg ${isToday ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${pct}%` }} />
                            : <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded" />}
                        </div>
                        <span className={`text-xs font-semibold ${isToday ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{day}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{count > 0 ? count : ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* UPCOMING POSTS */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">Upcoming Posts</h2>
                  <Link href="/queue" className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-all">View all →</Link>
                </div>
                {upcomingPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Queue is empty</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Schedule posts to build your content pipeline.</p>
                    <Link href="/compose" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                      Write a post →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                            {post.content?.slice(0, 100)}{post.content?.length > 100 ? '…' : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {post.platforms?.slice(0, 4).map(p => (
                              <span key={p} className="text-xs">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">Scheduled</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">Recent Activity</h2>
                  <Link href="/drafts" className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-all">View drafts →</Link>
                </div>
                {recentPosts.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Your drafts and published posts appear here.</p>
                ) : (
                  <div className="space-y-2">
                    {recentPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 border border-gray-50 dark:border-gray-700 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                            {post.content?.slice(0, 80)}{post.content?.length > 80 ? '…' : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {post.platforms?.slice(0, 3).map(p => (
                              <span key={p} className="text-xs">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT — 1 col */}
            <div className="space-y-5">

              {/* QUICK ACTIONS */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <h2 className="text-sm font-extrabold mb-3">Quick Actions</h2>
                <div className="space-y-1">
                  {[
                    { label: 'Write a post',    sub: 'Compose & schedule',      href: '/compose',        icon: '✏️', featured: true  },
                    { label: 'Bulk schedule',   sub: 'Schedule many at once',   href: '/bulk-scheduler', icon: '📅', featured: false },
                    { label: 'View calendar',   sub: 'See all scheduled posts', href: '/calendar',       icon: '🗓️', featured: false },
                    { label: 'Use a template',  sub: 'Start from a saved format', href: '/templates',    icon: '📋', featured: false },
                    { label: 'Explore AI tools',sub: '12 tools available',      href: '/ai-features',    icon: '🤖', featured: false },
                    { label: 'Connect accounts',sub: 'Add social platforms',    href: '/accounts',       icon: '📱', featured: false },
                  ].map(a => (
                    <Link key={a.href} href={a.href}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        a.featured ? 'bg-black text-white hover:opacity-80 dark:bg-gray-800 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      <span className="text-base">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${a.featured ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{a.label}</p>
                        <p className={`text-xs truncate ${a.featured ? 'text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{a.sub}</p>
                      </div>
                      <span className={`text-xs ${a.featured ? 'text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* SM-PULSE PROMO */}
              <div className="bg-black rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Featured Tool</p>
                    <h2 className="text-sm font-extrabold">SM-Pulse</h2>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Scan Reddit & YouTube for trending topics in your niche before they peak.
                    </p>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>
                <Link href="/sm-pulse"
                  className="text-xs font-bold px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl hover:opacity-80 transition-all inline-block">
                  Try SM-Pulse — 20 cr
                </Link>
              </div>

              {/* REFERRAL NUDGE — pro/agency only */}
              {plan !== 'free' && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Earn free credits</p>
                  <p className="text-sm font-extrabold mb-1">Invite a friend</p>
                  <div className="space-y-1 mb-4 mt-2">
                    {[
                      { event: 'First post',      credits: '+10 cr' },
                      { event: 'Upgrade to Pro',  credits: '+50 cr' },
                      { event: 'Upgrade to Agency', credits: '+100 cr' },
                    ].map(r => (
                      <div key={r.event} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{r.event}</span>
                        <span className="font-bold">{r.credits}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/settings?tab=Referrals"
                    className="text-xs font-bold px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl hover:opacity-80 transition-all inline-block w-full text-center">
                    Get your referral link →
                  </Link>
                </div>
              )}

              {/* COMING SOON */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-2">🔜 Coming very soon</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'LinkedIn',  icon: '💼' },
                    { name: 'YouTube',   icon: '▶️' },
                    { name: 'Pinterest', icon: '📌' },
                    { name: 'Reddit',    icon: '🤖' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                      <span>{p.icon}</span>{p.name}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-500 mt-2">Awaiting platform approval.</p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
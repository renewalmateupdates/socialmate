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

function CreditMeter({ credits, plan }: { credits: number; plan: string }) {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const max = config?.credits ?? 100
  const bankCap = config?.creditBank ?? 150
  const pct = Math.min((credits / max) * 100, 100)
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">AI Credits</span>
        <span className="text-xs font-bold text-gray-600">{credits} / {max}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Resets monthly · banks up to {bankCap}</p>
        {pct < 20 && (
          <Link href="/settings?tab=Plan" className="text-xs font-bold text-blue-600 hover:underline">
            Get more →
          </Link>
        )}
      </div>
    </div>
  )
}

function CreditSuccessModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-extrabold mb-2">Credits Added!</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          Your AI credits have been added and are ready to use right now.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Thank you for supporting SocialMate — every purchase helps keep the lights on. 🙏
        </p>
        <button onClick={onDismiss}
          className="w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
          Let's go! →
        </button>
      </div>
    </div>
  )
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
        const now = new Date()
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

        setStats({
          scheduled:     posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
          drafts:        posts.filter(p => p.status === 'draft').length,
          thisWeek:      posts.filter(p => new Date(p.created_at) >= weekAgo).length,
          published:     posts.filter(p => p.status === 'published').length,
          todayCount:    posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) >= todayStart && new Date(p.scheduled_at) <= todayEnd).length,
          upcomingCount: posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
        })

        const upcoming = posts
          .filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now)
          .slice(0, 5)
        setUpcomingPosts(upcoming)

        const recent = posts
          .filter(p => p.status === 'draft' || p.status === 'published')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
        setRecentPosts(recent)

        // Build week day counts (Sun=0 through Sat=6)
        const counts = [0,0,0,0,0,0,0]
        posts.forEach(p => {
          const d = new Date(p.created_at)
          if (d >= weekAgo) counts[d.getDay()]++
        })
        setWeekCounts(counts)
      }

      setUser(user)
      setProfile(profile)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const todayDayIndex = new Date().getDay()
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const maxWeekCount = Math.max(...weekCounts, 1)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showCreditModal && <CreditSuccessModal onDismiss={handleCreditModalDismiss} />}
      <Sidebar />
      <main className="md:ml-56 flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                {greeting}, {displayName} 👋
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {stats.todayCount > 0
                  ? `${stats.todayCount} post${stats.todayCount !== 1 ? 's' : ''} scheduled today · ${stats.upcomingCount} coming up`
                  : 'Nothing scheduled yet today — want to change that?'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/bulk-scheduler"
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-xl text-xs font-semibold hover:border-gray-400 transition-all">
                📅 Bulk Schedule
              </Link>
              <Link href="/compose"
                className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:opacity-80 transition-all">
                ✏️ Compose
              </Link>
            </div>
          </div>

          {/* PLAN + CREDITS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className={`rounded-2xl px-5 py-3 border flex items-center justify-between ${
              plan === 'free'   ? 'bg-gray-50 border-gray-200'      :
              plan === 'pro'    ? 'bg-blue-50 border-blue-100'       :
              'bg-purple-50 border-purple-100'
            }`}>
              <div>
                <p className={`text-xs font-extrabold ${
                  plan === 'agency' ? 'text-purple-700' :
                  plan === 'pro'    ? 'text-blue-700'   : 'text-gray-700'
                }`}>
                  {plan === 'free'   && '🔓 Free Plan'}
                  {plan === 'pro'    && '⚡ Pro Plan'}
                  {plan === 'agency' && '🏢 Agency Plan'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {planConfig?.accountsPerPlatform} account{planConfig?.accountsPerPlatform !== 1 ? 's' : ''} per platform · {planConfig?.seats} team seat{planConfig?.seats !== 1 ? 's' : ''}
                </p>
              </div>
              {plan === 'free' && (
                <Link href="/settings?tab=Plan"
                  className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                  Upgrade
                </Link>
              )}
            </div>
            <div className="sm:col-span-2">
              <CreditMeter credits={credits} plan={plan} />
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Scheduled', value: stats.scheduled, sub: 'posts queued',  icon: '📅', color: 'text-blue-600'   },
              { label: 'Drafts',    value: stats.drafts,    sub: 'in progress',   icon: '📁', color: 'text-yellow-600' },
              { label: 'This Week', value: stats.thisWeek,  sub: 'posts created', icon: '✏️', color: 'text-purple-600' },
              { label: 'Published', value: stats.published, sub: 'all time',      icon: '✅', color: 'text-green-600'  },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base md:text-lg">{stat.icon}</span>
                </div>
                <div className={`text-2xl md:text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* WEEK ACTIVITY */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-gray-900">This Week's Activity</h2>
                  <Link href="/analytics" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                    Full analytics →
                  </Link>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day, i) => {
                    const isToday = i === todayDayIndex
                    const count = weekCounts[i]
                    const heightPct = count > 0 ? Math.max((count / maxWeekCount) * 100, 15) : 0
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '48px' }}>
                          {count > 0 ? (
                            <div
                              className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-black' : 'bg-gray-200'}`}
                              style={{ height: `${heightPct}%` }}
                            />
                          ) : (
                            <div className="w-full h-1 bg-gray-100 rounded" />
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${isToday ? 'text-black font-bold' : 'text-gray-400'}`}>
                          {day}
                        </span>
                        <span className="text-xs text-gray-400">{count > 0 ? count : ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* UPCOMING POSTS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-gray-900">Upcoming Posts</h2>
                  <Link href="/queue" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                    View all →
                  </Link>
                </div>
                {upcomingPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm font-bold text-gray-700 mb-1">No posts scheduled yet</p>
                    <p className="text-xs text-gray-400 mb-4">Start building your content queue to stay consistent.</p>
                    <Link href="/compose"
                      className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                      Write your first post →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                            {post.content?.slice(0, 120)}{post.content?.length > 120 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {post.platforms?.slice(0, 4).map(p => (
                              <span key={p} className="text-sm">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400">
                              {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' '}at{' '}
                              {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">Scheduled</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT POSTS / DRAFTS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-gray-900">Recent Activity</h2>
                  <Link href="/drafts" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                    View drafts →
                  </Link>
                </div>
                {recentPosts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No posts yet — your drafts and published posts will appear here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 border border-gray-50 rounded-xl hover:border-gray-200 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                            {post.content?.slice(0, 80)}{post.content?.length > 80 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {post.platforms?.slice(0, 3).map(p => (
                              <span key={p} className="text-xs">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400">
                              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI SPOTLIGHT */}
              <div className="bg-black rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Featured Tool</p>
                    <h2 className="text-sm font-extrabold mb-1">SM-Pulse — Trend Scanner</h2>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Discover what's trending in your niche right now. SM-Pulse scans real Reddit and YouTube data to surface content opportunities before they peak.
                    </p>
                  </div>
                  <span className="text-3xl flex-shrink-0">🔥</span>
                </div>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Link href="/sm-pulse"
                    className="text-xs font-bold px-4 py-2 bg-white text-black rounded-xl hover:opacity-80 transition-all">
                    Try SM-Pulse — 10 credits
                  </Link>
                  <Link href="/ai-features"
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-all">
                    See all 12 AI tools →
                  </Link>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">

              {/* QUICK ACTIONS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-extrabold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-1.5">
                  {[
                    { label: 'Write a post',        sub: 'Compose & schedule',        href: '/compose',          icon: '✏️', featured: true  },
                    { label: 'Bulk schedule',        sub: 'Schedule many at once',     href: '/bulk-scheduler',   icon: '📅', featured: false },
                    { label: 'View calendar',        sub: 'See all scheduled posts',   href: '/calendar',         icon: '🗓️', featured: false },
                    { label: 'Use a template',       sub: 'Start from a saved format', href: '/templates',        icon: '📋', featured: false },
                    { label: 'Upload media',         sub: 'Add to your library',       href: '/media',            icon: '🖼️', featured: false },
                    { label: 'Edit link in bio',     sub: 'Update your bio page',      href: '/link-in-bio',      icon: '🔗', featured: false },
                    { label: 'Explore AI tools',     sub: '12 tools available',        href: '/ai-features',      icon: '🤖', featured: false },
                    { label: 'Connect accounts',     sub: 'Add social platforms',      href: '/accounts',         icon: '📱', featured: false },
                  ].map(action => (
                    <Link key={action.href} href={action.href}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        action.featured ? 'bg-black text-white hover:opacity-80' : 'hover:bg-gray-50'
                      }`}>
                      <span className="text-base">{action.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${action.featured ? 'text-white' : 'text-gray-900'}`}>
                          {action.label}
                        </div>
                        <div className={`text-xs truncate ${action.featured ? 'text-gray-300' : 'text-gray-400'}`}>
                          {action.sub}
                        </div>
                      </div>
                      <span className={`text-xs ${action.featured ? 'text-gray-400' : 'text-gray-300'}`}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CONNECTED PLATFORMS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-gray-900">Connected Platforms</h2>
                  <Link href="/accounts" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                    Manage →
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-xs font-bold text-gray-700 mb-1">No platforms connected yet</p>
                  <p className="text-xs text-gray-400 mb-3">Connect your social accounts to start scheduling.</p>
                  <Link href="/accounts"
                    className="text-xs font-bold px-3 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                    Connect accounts →
                  </Link>
                </div>
              </div>

              {/* REFERRAL NUDGE */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Earn free credits</p>
                <p className="text-sm font-extrabold mb-1">Invite a friend</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Refer someone and earn credits when they sign up and upgrade — up to +100 credits per referral.
                </p>
                <div className="space-y-1 mb-4">
                  {[
                    { event: 'They publish first post', credits: '+10 credits' },
                    { event: 'They upgrade to Pro',     credits: '+50 credits' },
                    { event: 'They upgrade to Agency',  credits: '+100 credits' },
                  ].map(r => (
                    <div key={r.event} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{r.event}</span>
                      <span className="font-bold text-white">{r.credits}</span>
                    </div>
                  ))}
                </div>
                <Link href="/settings?tab=Referrals"
                  className="text-xs font-bold px-4 py-2 bg-white text-black rounded-xl hover:opacity-80 transition-all inline-block w-full text-center">
                  Get your referral link →
                </Link>
              </div>

              {/* PLATFORM COMING SOON */}
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
                <p className="text-xs text-blue-500 mt-2">Awaiting platform approval — launching soon.</p>
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
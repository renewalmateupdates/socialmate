'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

const NEW_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'TikTok',    icon: '🎵' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Threads',   icon: '🧵' },
]

function CreditMeter({ credits, plan }: { credits: number; plan: string }) {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const max = config?.credits ?? 50
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
          <Link href="/settings?tab=Referrals" className="text-xs font-bold text-blue-600 hover:underline">
            Earn more →
          </Link>
        )}
      </div>
    </div>
  )
}

function PlatformNotificationBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">🚀</span>
        <div>
          <p className="text-xs font-extrabold text-blue-800">New platforms coming soon</p>
          <p className="text-xs text-blue-600 mt-0.5">
            {NEW_PLATFORMS.map(p => `${p.icon} ${p.name}`).join(' · ')} — developer approvals in progress.
            We'll notify you the moment each one goes live.
          </p>
        </div>
      </div>
      <button onClick={() => setDismissed(true)}
        className="text-xs font-bold text-blue-400 hover:text-blue-700 transition-all flex-shrink-0 ml-4">
        Dismiss
      </button>
    </div>
  )
}

type DashStats = {
  scheduled: number
  drafts: number
  thisWeek: number
  published: number
  todayCount: number
  upcomingCount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashStats>({
    scheduled: 0, drafts: 0, thisWeek: 0, published: 0, todayCount: 0, upcomingCount: 0,
  })
  const { plan, credits } = useWorkspace()

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
        .select('id, status, scheduled_at, created_at')
        .eq('user_id', user.id)

      if (posts) {
        const now = new Date()
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

        setStats({
          scheduled:    posts.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
          drafts:       posts.filter(p => p.status === 'draft').length,
          thisWeek:     posts.filter(p => new Date(p.created_at) >= weekAgo).length,
          published:    posts.filter(p => p.status === 'published').length,
          todayCount:   posts.filter(p =>
            p.status === 'scheduled' &&
            new Date(p.scheduled_at) >= todayStart &&
            new Date(p.scheduled_at) <= todayEnd
          ).length,
          upcomingCount: posts.filter(p =>
            p.status === 'scheduled' && new Date(p.scheduled_at) > now
          ).length,
        })
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

  // Fixed: was profile?.full_name — column is display_name
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-56 flex-1 overflow-y-auto">
        <div className="p-8">

          <PlatformNotificationBanner />

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                {greeting}, {displayName} 👋
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {stats.todayCount} post{stats.todayCount !== 1 ? 's' : ''} scheduled today · {stats.upcomingCount} coming up
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/bulk-scheduler"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold hover:border-gray-400 transition-all">
                📅 Bulk Schedule
              </Link>
              <Link href="/compose"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-all">
                ✏️ Compose
              </Link>
            </div>
          </div>

          {/* PLAN + CREDIT BAR */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`rounded-2xl px-5 py-3 border flex items-center justify-between ${
              plan === 'free'   ? 'bg-gray-50 border-gray-200' :
              plan === 'pro'    ? 'bg-blue-50 border-blue-100' :
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
                  {planConfig?.label} · {planConfig?.accountsPerPlatform} account{planConfig?.accountsPerPlatform !== 1 ? 's' : ''} per platform
                </p>
              </div>
              {plan === 'free' && (
                <Link href="/pricing"
                  className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                  Upgrade
                </Link>
              )}
            </div>
            <div className="col-span-2">
              <CreditMeter credits={credits} plan={plan} />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Scheduled', value: stats.scheduled, sub: 'posts queued',  icon: '📅', color: 'text-blue-600'   },
              { label: 'Drafts',    value: stats.drafts,    sub: 'in progress',   icon: '📁', color: 'text-yellow-600' },
              { label: 'This Week', value: stats.thisWeek,  sub: 'posts created', icon: '✏️', color: 'text-purple-600' },
              { label: 'Published', value: stats.published, sub: 'all time',      icon: '✅', color: 'text-green-600'  },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="col-span-2 space-y-6">

              {/* WEEK VIEW */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-gray-900">This Week</h2>
                  <Link href="/calendar" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                    View Calendar →
                  </Link>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
                    const isToday = day === today
                    return (
                      <div key={day} className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isToday ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'
                      }`}>
                        {day}
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
                    View All →
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm font-bold text-gray-700 mb-1">No upcoming posts scheduled</p>
                  <p className="text-xs text-gray-400 mb-4">Start building your content queue to stay consistent.</p>
                  <Link href="/compose"
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                    Create Your First Post →
                  </Link>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-gray-900">Recent Activity</h2>
                  <Link href="/drafts" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                    View Drafts →
                  </Link>
                </div>
                <p className="text-xs text-gray-400 text-center py-6">No activity yet — your posts and drafts will show up here.</p>
              </div>

              {/* AI FEATURE SPOTLIGHT */}
              <div className="bg-black rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Featured Tool</p>
                    <h2 className="text-sm font-extrabold mb-1">SM-Pulse — Trend Scanner</h2>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Discover what's trending in your niche right now. SM-Pulse scans viral patterns across platforms and surfaces content opportunities before they peak.
                    </p>
                  </div>
                  <span className="text-3xl flex-shrink-0">🔥</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Link href="/ai-features"
                    className="text-xs font-bold px-4 py-2 bg-white text-black rounded-xl hover:opacity-80 transition-all">
                    Try SM-Pulse — 5 credits
                  </Link>
                  <Link href="/ai-features"
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-all">
                    See all AI tools →
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* QUICK ACTIONS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-extrabold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Write a post',     sub: 'Compose & schedule',        href: '/compose',        icon: '✏️', featured: true },
                    { label: 'Bulk schedule',    sub: 'Schedule many at once',     href: '/bulk-scheduler', icon: '📅' },
                    { label: 'View calendar',    sub: 'See all scheduled posts',   href: '/calendar',       icon: '🗓️' },
                    { label: 'Use a template',   sub: 'Start from a saved format', href: '/templates',      icon: '📋' },
                    { label: 'Upload media',     sub: 'Add to your library',       href: '/media',          icon: '🖼️' },
                    { label: 'Edit link in bio', sub: 'Update your bio page',      href: '/link-in-bio',    icon: '🔗' },
                    { label: 'Explore AI tools', sub: 'Credits, features & more',  href: '/ai-features',    icon: '🤖' },
                  ].map(action => (
                    <Link key={action.href} href={action.href}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        action.featured ? 'bg-black text-white hover:opacity-80' : 'hover:bg-gray-50'
                      }`}>
                      <span className="text-lg">{action.icon}</span>
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
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-xs font-bold text-gray-700 mb-1">No platforms connected yet</p>
                  <p className="text-xs text-gray-400 mb-3">Connect your social accounts to start scheduling.</p>
                  <Link href="/accounts"
                    className="text-xs font-bold px-3 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                    Connect Accounts →
                  </Link>
                </div>
              </div>

              {/* REFERRAL NUDGE — fixed: goes to settings referral tab */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Earn more credits</p>
                <p className="text-sm font-extrabold mb-1">Invite a friend</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  You and a friend both earn 25 AI credits when they connect a platform and publish their first post.
                </p>
                <Link href="/settings?tab=Referrals"
                  className="text-xs font-bold px-4 py-2 bg-white text-black rounded-xl hover:opacity-80 transition-all inline-block">
                  Get your referral link →
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
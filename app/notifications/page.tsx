'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Notification = {
  id: string
  type: 'post_scheduled' | 'post_published' | 'post_failed' | 'team_invite' | 'referral' | 'tip' | 'milestone'
  title: string
  message: string
  read: boolean
  created_at: string
  href?: string
}

const TYPE_ICONS: Record<string, string> = {
  post_scheduled: '📅',
  post_published: '✅',
  post_failed: '❌',
  team_invite: '👥',
  referral: '🎁',
  tip: '💡',
  milestone: '🏆',
}

const MOCK_NOTIFICATIONS: Omit<Notification, 'id'>[] = [
  { type: 'tip', title: 'Pro tip: Bulk scheduling', message: 'Did you know you can schedule 50 posts at once? Save hours every week with the Bulk Scheduler.', read: false, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), href: '/bulk-scheduler' },
  { type: 'milestone', title: 'Welcome to SocialMate! 🎉', message: "You've joined thousands of creators scheduling smarter. Explore the dashboard to get started.", read: false, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), href: '/dashboard' },
  { type: 'tip', title: 'Set up your Link in Bio', message: 'Replace Linktree with your free SocialMate bio page. Takes 2 minutes to set up.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), href: '/link-in-bio' },
  { type: 'tip', title: 'Connect your first account', message: 'Head to Accounts to connect Instagram, Twitter, LinkedIn and 13 more platforms — all free.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), href: '/accounts' },
  { type: 'tip', title: 'Invite your team', message: 'SocialMate includes free team collaboration. Invite colleagues and work together on content.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), href: '/team' },
  { type: 'referral', title: 'Earn free AI credits', message: 'Share your referral link and earn 5 AI credits for every friend who signs up.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), href: '/referral' },
  { type: 'tip', title: 'Save hashtag collections', message: 'Create hashtag groups and insert them into any post in one click. Huge time saver.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), href: '/hashtags' },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Notifications() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await new Promise(r => setTimeout(r, 400))
      const stored = localStorage.getItem(`notifications_${user.id}`)
      if (stored) {
        setNotifications(JSON.parse(stored))
      } else {
        const seeded = MOCK_NOTIFICATIONS.map((n, i) => ({ ...n, id: `mock_${i}` }))
        setNotifications(seeded)
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(seeded))
      }
      setLoading(false)
    }
    getData()
  }, [])

  const save = (updated: Notification[]) => {
    setNotifications(updated)
    if (user) localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
  }

  const markRead = (id: string) => {
    save(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    save(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    save(notifications.filter(n => n.id !== id))
  }

  const clearAll = () => save([])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

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
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
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
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications", active: true },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {'active' in item && item.active && unreadCount > 0 && (
                <span className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
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
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-400">
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-3 py-2 border border-gray-200 rounded-xl hover:border-red-200">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit">
            {(['all', 'unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
              >
                {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {/* LIST */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">{filter === 'unread' ? '✅' : '🔔'}</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h2>
              <p className="text-gray-400 text-sm">
                {filter === 'unread' ? 'No unread notifications.' : 'Notifications will appear here as you use SocialMate.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(notif => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all group ${
                    !notif.read ? 'bg-white border-gray-200' : 'bg-white border-gray-100 opacity-70'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${!notif.read ? 'bg-gray-50' : 'bg-gray-50'}`}>
                    {TYPE_ICONS[notif.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${!notif.read ? 'text-black' : 'text-gray-600'}`}>
                        {notif.title}
                        {!notif.read && <span className="ml-2 inline-block w-2 h-2 bg-black rounded-full align-middle" />}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {notif.href && (
                        <Link
                          href={notif.href}
                          onClick={() => markRead(notif.id)}
                          className="text-xs font-bold text-black hover:underline"
                        >
                          View →
                        </Link>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="text-xs text-gray-400 hover:text-black transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
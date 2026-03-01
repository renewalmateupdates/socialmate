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
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

const NOTIF_ICONS: Record<string, string> = {
  scheduled: '📅',
  published: '✅',
  draft: '📂',
  account: '🔗',
  team: '👥',
  ai: '🤖',
  warning: '⚠️',
  info: '💡',
  referral: '🎁',
  queue: '⏳',
}

const NOTIF_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 border-blue-100',
  published: 'bg-green-50 border-green-100',
  draft: 'bg-gray-50 border-gray-100',
  account: 'bg-purple-50 border-purple-100',
  team: 'bg-yellow-50 border-yellow-100',
  ai: 'bg-indigo-50 border-indigo-100',
  warning: 'bg-red-50 border-red-100',
  info: 'bg-blue-50 border-blue-100',
  referral: 'bg-pink-50 border-pink-100',
  queue: 'bg-orange-50 border-orange-100',
}

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

// Seed some demo notifications if none exist
async function seedNotifications(userId: string) {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) > 0) return

  const demos = [
    { type: 'info', title: 'Welcome to SocialMate! 🎉', message: 'Your account is set up and ready to go. Connect your first social account to get started.' },
    { type: 'info', title: 'Free plan activated', message: 'You have access to all 16 platforms, unlimited scheduling, and 15 AI credits per month — completely free.' },
    { type: 'referral', title: 'Share SocialMate, earn rewards', message: 'Invite friends and earn bonus AI credits for every signup. Check your referral page.' },
  ]

  await supabase.from('notifications').insert(
    demos.map(d => ({ ...d, user_id: userId }))
  )
}

export default function Notifications() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
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

      await seedNotifications(user.id)

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    showToast('All notifications marked as read', 'success')
  }

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    showToast('Notification dismissed', 'success')
  }

  const clearAll = async () => {
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
    showToast('All notifications cleared', 'success')
  }

  const unread = notifications.filter(n => !n.read)
  const filtered = filter === 'unread' ? unread : notifications

  // Group notifications by date
  const grouped = filtered.reduce((acc, notif) => {
    const date = new Date(notif.created_at)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    let label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (date.toDateString() === now.toDateString()) label = 'Today'
    else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday'

    if (!acc[label]) acc[label] = []
    acc[label].push(notif)
    return acc
  }, {} as Record<string, Notification[]>)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
            { icon: "🔔", label: "Notifications", href: "/notifications" },
{ icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}

          {/* Notifications with unread badge */}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Activity</div>
          <Link href="/notifications" className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-black transition-all">
            <div className="flex items-center gap-2.5">
              <span>🔔</span>Notifications
            </div>
            {unread.length > 0 && (
              <span className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unread.length}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
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
            <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading...' : `${unread.length} unread · ${notifications.length} total`}
            </p>
          </div>
          {!loading && notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unread.length > 0 && (
                <button onClick={markAllRead} className="text-sm font-semibold px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  Mark all read
                </button>
              )}
              <button onClick={clearAll} className="text-sm font-semibold px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:border-red-400 transition-all">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))
          ) : (
            [
              { label: "Total", value: notifications.length.toString(), sub: "all time", icon: "🔔" },
              { label: "Unread", value: unread.length.toString(), sub: "need attention", icon: "🔴" },
              { label: "Today", value: notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length.toString(), sub: "received today", icon: "📅" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </div>
            ))
          )}
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
            >
              {f === 'all' ? `All (${notifications.length})` : `Unread (${unread.length})`}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
                <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBox className="h-3 w-1/2" />
                  <SkeletonBox className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{filter === 'unread' ? '✅' : '🔔'}</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {filter === 'unread'
                ? 'You have no unread notifications. Nice work staying on top of things.'
                : 'Activity from your posts, accounts, and team will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, notifs]) => (
              <div key={dateLabel}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">{dateLabel}</div>
                <div className="space-y-2">
                  {notifs.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.read && markRead(notif.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                        notif.read
                          ? 'bg-white border-gray-100'
                          : `${NOTIF_COLORS[notif.type] || 'bg-blue-50 border-blue-100'}`
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${notif.read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                        {NOTIF_ICONS[notif.type] || '🔔'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notif.read && (
                              <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-1" />
                            )}
                            <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notif.created_at)}</span>
                          </div>
                        </div>
                        {notif.message && (
                          <p className={`text-xs mt-0.5 ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notif.message}
                          </p>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

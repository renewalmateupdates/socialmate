'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

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
  link?: string
}

const NOTIF_ICONS: Record<string, string> = {
  post_scheduled: '📅',
  post_published: '✅',
  post_overdue: '⚠️',
  team_invite: '👥',
  ai_credits_low: '✨',
  referral_signup: '🎁',
  weekly_report: '📊',
  system: '🔔',
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

export default function Notifications() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const SAMPLE_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'post_scheduled', title: 'Post Scheduled', message: 'Your Instagram post is scheduled for tomorrow at 9:00 AM', read: false, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), link: '/queue' },
    { id: '2', type: 'ai_credits_low', title: 'AI Credits Running Low', message: 'You have 3 AI credits remaining. Upgrade to get more.', read: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), link: '/pricing' },
    { id: '3', type: 'weekly_report', title: 'Weekly Report Ready', message: 'You posted 5 times this week — up 25% from last week!', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), link: '/analytics' },
    { id: '4', type: 'post_overdue', title: 'Overdue Post', message: 'A LinkedIn post missed its scheduled time. Reschedule it now.', read: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), link: '/queue' },
    { id: '5', type: 'referral_signup', title: 'Referral Signed Up!', message: 'Someone used your referral link and signed up. Keep it up!', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), link: '/referral' },
    { id: '6', type: 'system', title: 'Welcome to SocialMate', message: 'Thanks for joining! Start by connecting your accounts or composing your first post.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), link: '/dashboard' },
  ]

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data && data.length > 0 ? data : SAMPLE_NOTIFICATIONS)
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    showToast('All notifications marked as read', 'success')
  }

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = async () => {
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
    showToast('All notifications cleared', 'success')
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  ✅ Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit">
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-4">
                  <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-3 w-2/3" />
                    <SkeletonBox className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h2>
              <p className="text-gray-400 text-sm">
                {filter === 'unread' ? "You're all caught up!" : "Notifications about your posts and activity will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(notif => (
                <div key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${!notif.read ? 'bg-white border-gray-200 shadow-sm' : 'bg-white border-gray-100'}`}
                  onClick={() => { if (!notif.read) markAsRead(notif.id) }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${!notif.read ? 'bg-black/5' : 'bg-gray-50'}`}>
                    {NOTIF_ICONS[notif.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-semibold text-gray-700'}`}>{notif.title}</p>
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-0.5" />}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <Link href={notif.link} onClick={e => e.stopPropagation()}
                        className="text-xs font-semibold text-black underline mt-1.5 inline-block hover:opacity-70 transition-all">
                        View →
                      </Link>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                    className="text-gray-300 hover:text-gray-500 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 text-lg leading-none mt-0.5">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
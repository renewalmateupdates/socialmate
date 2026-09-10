'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Bell, CheckCircle2, Gift, Megaphone, Users, XCircle, Zap, X as CloseIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

type NotifType = 'post_published' | 'post_failed' | 'credit_low' | 'team' | 'referral' | 'system'

const TYPE_CONFIG: Record<NotifType, { icon: LucideIcon; color: string }> = {
  post_published: { icon: CheckCircle2, color: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900'     },
  post_failed:    { icon: XCircle, color: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900'             },
  credit_low:     { icon: Zap, color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900'     },
  team:           { icon: Users, color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900'           },
  referral:       { icon: Gift, color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900'    },
  system:         { icon: Megaphone, color: 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700'       },
}

const PLACEHOLDER_NOTIFS = [
  {
    id: 'p1', type: 'system', read: false,
    title: 'Welcome to SocialMate!',
    body: 'Your account is set up and ready to go. Connect a platform to activate your 50 AI credits.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2', type: 'credit_low', read: false,
    title: 'Activate your AI credits',
    body: 'Connect one platform and publish your first post to unlock 50 monthly AI credits.',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [toast, setToast] = useState<string | null>(null)
  const router = useRouter()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      const real = data || []
      // Only show placeholders if user has no real notifications yet
      const combined = real.length > 0 ? real : [...real, ...PLACEHOLDER_NOTIFS]
      setNotifications(combined)
      setLoading(false)
    }
    load()
  }, [router])

  const markRead = async (id: string) => {
    if (id.startsWith('p')) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      return
    }
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.read && !n.id.startsWith('p')).map(n => n.id)
    if (ids.length) {
      await supabase.from('notifications').update({ read: true }).in('id', ids)
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    showToast('All marked as read')
  }

  const deleteNotif = async (id: string) => {
    if (!id.startsWith('p')) {
      await supabase.from('notifications').delete().eq('id', id)
    }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const formatTime = (ts: string) => {
    const diff  = Date.now() - new Date(ts).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days  = Math.floor(hours / 24)
    if (mins < 1)   return 'Just now'
    if (mins < 60)  return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filtered    = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="self-start sm:self-auto text-xs font-bold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                Mark all read
              </button>
            )}
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1 mb-6 w-fit">
            {[
              { id: 'all',    label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})`       },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.id ? 'bg-black text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="text-sm font-bold mb-1">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : 'Post updates, credit alerts, and team activity will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(n => {
                const config = TYPE_CONFIG[n.type as NotifType] || TYPE_CONFIG.system
                return (
                  <div key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`border rounded-2xl p-4 transition-all cursor-pointer ${config.color} ${
                      !n.read ? 'opacity-100' : 'opacity-60'
                    }`}>
                    <div className="flex items-start gap-3">
                      <config.icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700 dark:text-gray-300" strokeWidth={1.75} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-xs font-extrabold truncate text-gray-900 dark:text-gray-100">{n.title}</p>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-black dark:bg-white flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatTime(n.created_at)}</span>
                            {/* Always visible delete — not hover-only */}
                            <button
                              onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                              className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-all flex-shrink-0 px-1">
                              <CloseIcon className="w-3 h-3" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{n.body}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg bg-black text-white">
          ✅ {toast}
        </div>
      )}
    </div>
  )
}
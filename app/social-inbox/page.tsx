'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
type NotifType = 'mention' | 'reply' | 'like' | 'repost' | 'follow'

type Notification = {
  id: string
  platform: 'bluesky' | 'mastodon'
  type: NotifType
  actor_handle: string
  actor_display_name: string
  content?: string
  created_at: string
  read: boolean
}

type FilterTab = 'all' | 'mentions' | 'likes' | 'follows'

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  mastodon: '🐘',
}

const TYPE_LABELS: Record<NotifType, { label: string; color: string }> = {
  mention: { label: 'mention',  color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  reply:   { label: 'reply',    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'         },
  like:    { label: 'like',     color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'         },
  repost:  { label: 'repost',   color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'     },
  follow:  { label: 'follow',   color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
}

const LS_KEY = 'socialmate_read_notifications'

function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids))) } catch {}
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="bg-surface border border-theme rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SocialInbox() {
  const router = useRouter()

  const [loading, setLoading]         = useState(true)
  const [fetching, setFetching]       = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [filter, setFilter]           = useState<FilterTab>('all')
  const [readIds, setReadIds]         = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // ── Auth gate ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else {
        setReadIds(getReadIds())
        setLoading(false)
      }
    })
  }, [router])

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/inbox/notifications', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      const incoming: Notification[] = (data.notifications || [])
      const readSet = getReadIds()

      // Merge platform read state with localStorage
      const merged = incoming.map((n: Notification) => ({
        ...n,
        read: n.read || readSet.has(n.id),
      }))

      setNotifications(merged)
      setConnectedPlatforms(data.platforms || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Inbox fetch error:', err)
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (!loading) fetchNotifications()
  }, [loading, fetchNotifications])

  // ── Read state ───────────────────────────────────────────────────────────
  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setReadIds(prev => {
      const next = new Set(prev)
      notifications.forEach(n => next.add(n.id))
      saveReadIds(next)
      return next
    })
  }, [notifications])

  // ── Derived ──────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = notifications.filter(n => {
    if (filter === 'mentions') return n.type === 'mention' || n.type === 'reply'
    if (filter === 'likes')    return n.type === 'like' || n.type === 'repost'
    if (filter === 'follows')  return n.type === 'follow'
    return true
  })

  const hasNoAccounts = !loading && connectedPlatforms.length === 0 && !fetching && notifications.length === 0

  // ── Initial load skeleton ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <main className="md:ml-56 flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-3 pt-4">
            {[1,2,3,4,5].map(i => <NotifSkeleton key={i} />)}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📬</span>
                <h1 className="text-2xl font-extrabold tracking-tight">Social Inbox</h1>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Mentions and notifications from Bluesky and Mastodon.
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Updated {formatTime(lastUpdated.toISOString())}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Mark all read
                </button>
              )}
              <button onClick={fetchNotifications} disabled={fetching}
                className="text-xs font-bold bg-surface border border-theme px-3 py-1.5 rounded-xl hover:border-gray-300 transition-all disabled:opacity-50 flex items-center gap-1.5">
                {fetching
                  ? <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Refreshing</>
                  : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* ── NO ACCOUNTS ─────────────────────────────────────────────── */}
          {hasNoAccounts ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                No platforms connected yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
                Connect your Bluesky 🦋 or Mastodon 🐘 accounts to see your mentions, likes, and follows here.
              </p>
              <Link href="/accounts"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Connect accounts →
              </Link>
            </div>
          ) : (
            <>
              {/* ── FILTER TABS ─────────────────────────────────────────── */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1">
                  {(['all', 'mentions', 'likes', 'follows'] as FilterTab[]).map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        filter === tab
                          ? 'bg-black text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}>
                      {tab === 'all'      ? `All${notifications.length ? ` (${notifications.length})` : ''}` : null}
                      {tab === 'mentions' ? 'Mentions' : null}
                      {tab === 'likes'    ? 'Likes' : null}
                      {tab === 'follows'  ? 'Follows' : null}
                    </button>
                  ))}
                </div>

                {/* Platform badges */}
                <div className="flex items-center gap-1.5 ml-auto">
                  {connectedPlatforms.includes('bluesky') && (
                    <span className="text-xs font-semibold bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 px-2.5 py-1 rounded-xl">
                      🦋 Bluesky
                    </span>
                  )}
                  {connectedPlatforms.includes('mastodon') && (
                    <span className="text-xs font-semibold bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded-xl">
                      🐘 Mastodon
                    </span>
                  )}
                </div>
              </div>

              {/* ── NOTIFICATIONS ───────────────────────────────────────── */}
              {fetching && notifications.length === 0 ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <NotifSkeleton key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {notifications.length === 0 ? 'No notifications yet' : 'Nothing matches this filter'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {notifications.length === 0
                      ? 'When people mention, like, or follow you, it will show up here.'
                      : 'Try a different filter above.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(notif => {
                    const typeInfo = TYPE_LABELS[notif.type]
                    return (
                      <div
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`bg-surface border rounded-2xl p-4 cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 ${
                          !notif.read ? 'border-black dark:border-white' : 'border-theme'
                        }`}>
                        <div className="flex items-start gap-3">
                          {/* Platform icon */}
                          <div className="w-9 h-9 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                            {PLATFORM_ICONS[notif.platform] || '📱'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-extrabold truncate max-w-[140px]">
                                {notif.actor_display_name}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                                {notif.actor_handle}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
                                {formatTime(notif.created_at)}
                              </span>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-black dark:bg-white rounded-full flex-shrink-0" />
                              )}
                            </div>

                            {notif.content && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                {notif.content}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                                {notif.platform}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── FOOTER ──────────────────────────────────────────────── */}
              {!fetching && notifications.length > 0 && (
                <div className="mt-6 bg-surface border border-theme rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
                    Showing notifications from connected accounts. More platform integrations coming soon.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import type { InboxItem } from '@/app/api/inbox/route'
import { useI18n } from '@/contexts/I18nContext'

// ── Constants ─────────────────────────────────────────────────────────────────
const LS_KEY = 'sm_inbox_read_ids'

type Platform = 'all' | 'bluesky' | 'mastodon' | 'telegram' | 'discord'

const PLATFORM_META: Record<string, { icon: string; label: string; color: string }> = {
  bluesky:  { icon: '🦋', label: 'Bluesky',  color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'             },
  mastodon: { icon: '🐘', label: 'Mastodon', color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  telegram: { icon: '✈️', label: 'Telegram', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'         },
  discord:  { icon: '💬', label: 'Discord',  color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  mention: { label: 'mention', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  reply:   { label: 'reply',   color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'         },
  like:    { label: 'like',    color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'         },
  repost:  { label: 'repost',  color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'     },
  follow:  { label: 'follow',  color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  message: { label: 'message', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'           },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
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
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function InboxSkeleton() {
  return (
    <div className="bg-surface border border-theme rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded-full ml-auto" />
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [authLoading, setAuthLoading]           = useState(true)
  const [fetching, setFetching]                 = useState(false)
  const [items, setItems]                       = useState<InboxItem[]>([])
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [activePlatform, setActivePlatform]     = useState<Platform>('all')
  const [readIds, setReadIds]                   = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated]           = useState<Date | null>(null)

  // Auth gate
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login?redirect=/inbox')
      else {
        setReadIds(getReadIds())
        setAuthLoading(false)
      }
    })
  }, [router])

  // Fetch
  const fetchInbox = useCallback(async (platform: Platform = 'all') => {
    setFetching(true)
    try {
      const url = platform === 'all'
        ? '/api/inbox'
        : `/api/inbox?platform=${platform}`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()

      const readSet = getReadIds()
      const merged: InboxItem[] = (data.items || []).map((item: InboxItem) => ({
        ...item,
        read: item.read || readSet.has(item.id),
      }))

      setItems(merged)
      setConnectedPlatforms(data.connectedPlatforms || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Inbox fetch error:', err)
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchInbox(activePlatform)
  }, [authLoading, fetchInbox, activePlatform])

  // Mark read
  const markRead = useCallback((id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    setReadIds(prev => {
      const next = new Set(prev)
      items.forEach(n => next.add(n.id))
      saveReadIds(next)
      return next
    })
  }, [items])

  // Switch platform tab
  const switchPlatform = useCallback((platform: Platform) => {
    setActivePlatform(platform)
  }, [])

  // Derived counts per tab
  function countFor(platform: Platform) {
    if (platform === 'all') return items.filter(i => !i.read).length
    return items.filter(i => i.platform === platform && !i.read).length
  }

  const unreadTotal = items.filter(i => !i.read).length

  const filteredItems = activePlatform === 'all'
    ? items
    : items.filter(i => i.platform === activePlatform)

  const PLATFORM_TABS: Platform[] = ['all', 'bluesky', 'mastodon', 'telegram', 'discord']

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <main className="md:ml-56 flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-3 pt-4">
            {[1,2,3,4,5].map(i => <InboxSkeleton key={i} />)}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 flex flex-col" style={{ minHeight: 0 }}>
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-4 md:p-8" style={{ minHeight: 0 }}>

          {/* ── HEADER ────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📬</span>
                <h1 className="text-2xl font-extrabold tracking-tight">{t('app_notifications.title')}</h1>
                {unreadTotal > 0 && (
                  <span className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">
                    {unreadTotal}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Mentions, replies, and messages from your connected platforms.
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Updated {formatTime(lastUpdated.toISOString())}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {unreadTotal > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  {t('app_notifications.mark_all_read')}
                </button>
              )}
              <button
                onClick={() => fetchInbox(activePlatform)}
                disabled={fetching}
                className="text-xs font-bold bg-surface border border-theme px-3 py-1.5 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all disabled:opacity-50 flex items-center gap-1.5">
                {fetching
                  ? <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Refreshing</>
                  : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* ── TWO COLUMN LAYOUT ─────────────────────────────────────── */}
          <div className="flex gap-4 flex-1 min-h-0">

            {/* ── LEFT: Platform tabs ─────────────────────────────────── */}
            <div className="flex-shrink-0 w-44 hidden md:flex flex-col gap-1">
              {PLATFORM_TABS.map(tab => {
                const meta  = tab !== 'all' ? PLATFORM_META[tab] : null
                const count = countFor(tab)
                const isConnected = tab === 'all' || connectedPlatforms.includes(tab)
                const isActive  = activePlatform === tab
                return (
                  <button
                    key={tab}
                    onClick={() => isConnected && switchPlatform(tab)}
                    disabled={tab !== 'all' && !isConnected}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all w-full ${
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : isConnected
                          ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'text-gray-400 dark:text-gray-600 cursor-default opacity-60'
                    }`}>
                    <span className="text-base leading-none">
                      {tab === 'all' ? '📬' : meta?.icon}
                    </span>
                    <span className="flex-1 truncate">
                      {tab === 'all' ? 'All' : meta?.label}
                    </span>
                    {count > 0 && isConnected && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : 'bg-black dark:bg-white text-white dark:text-black'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}

              {/* X/Twitter coming soon */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 dark:text-gray-600 opacity-60 cursor-default select-none mt-1">
                <span className="text-base leading-none">🔒</span>
                <span className="flex-1 truncate">X / Twitter</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 px-3 pb-1 leading-snug">
                X requires a paid API upgrade — coming soon.
              </p>
            </div>

            {/* ── LEFT: Mobile tab strip ──────────────────────────────── */}
            <div className="md:hidden w-full mb-4 overflow-x-auto flex gap-1 pb-1">
              {PLATFORM_TABS.map(tab => {
                const meta  = tab !== 'all' ? PLATFORM_META[tab] : null
                const count = countFor(tab)
                const isConnected = tab === 'all' || connectedPlatforms.includes(tab)
                const isActive  = activePlatform === tab
                return (
                  <button
                    key={tab}
                    onClick={() => isConnected && switchPlatform(tab)}
                    disabled={tab !== 'all' && !isConnected}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : isConnected
                          ? 'bg-surface border border-theme text-gray-600 dark:text-gray-400'
                          : 'bg-surface border border-theme text-gray-400 opacity-50'
                    }`}>
                    {tab === 'all' ? '📬' : meta?.icon}
                    {tab === 'all' ? 'All' : meta?.label}
                    {count > 0 && isConnected && (
                      <span className="bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── RIGHT: Feed ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              {fetching && items.length === 0 ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <InboxSkeleton key={i} />)}
                </div>
              ) : filteredItems.length === 0 ? (
                <EmptyState
                  platform={activePlatform}
                  connectedPlatforms={connectedPlatforms}
                  fetching={fetching}
                />
              ) : (
                <div className="space-y-2 pb-8">
                  {filteredItems.map(item => (
                    <InboxItemCard
                      key={item.id}
                      item={item}
                      onRead={markRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── InboxItemCard ─────────────────────────────────────────────────────────────
const REPLY_MAX = 300

function canReply(item: InboxItem) {
  return (
    (item.type === 'mention' || item.type === 'reply') &&
    (item.platform === 'bluesky' || item.platform === 'mastodon')
  )
}

function InboxItemCard({ item, onRead }: { item: InboxItem; onRead: (id: string) => void }) {
  const { t } = useI18n()
  const platformMeta = PLATFORM_META[item.platform]
  const typeMeta     = TYPE_META[item.type] ?? TYPE_META.message

  const [replyOpen, setReplyOpen]   = useState(false)
  const [replyText, setReplyText]   = useState('')
  const [sending, setSending]       = useState(false)
  const [sent, setSent]             = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const textareaRef                 = useRef<HTMLTextAreaElement>(null)

  function handleCardClick(e: React.MouseEvent | React.KeyboardEvent) {
    // Don't navigate if a reply-UI element was clicked
    const target = e.target as HTMLElement
    if (target.closest('[data-reply-zone]')) return
    onRead(item.id)
    if (item.post_url) window.open(item.post_url, '_blank', 'noopener,noreferrer')
  }

  function openReply(e: React.MouseEvent) {
    e.stopPropagation()
    onRead(item.id)
    setReplyOpen(true)
    setReplyText('')
    setSent(false)
    setReplyError(null)
    setTimeout(() => textareaRef.current?.focus(), 60)
  }

  function cancelReply(e: React.MouseEvent) {
    e.stopPropagation()
    setReplyOpen(false)
    setReplyText('')
    setReplyError(null)
  }

  async function sendReply(e: React.MouseEvent) {
    e.stopPropagation()
    const text = replyText.trim()
    if (!text || sending) return
    setSending(true)
    setReplyError(null)

    try {
      const body: Record<string, unknown> = {
        platform: item.platform,
        reply_text: text,
      }
      if (item.platform === 'bluesky') {
        body.parent_uri = item.parent_uri
        body.parent_cid = item.parent_cid
        body.root_uri   = item.root_uri
        body.root_cid   = item.root_cid
      } else {
        body.in_reply_to_id = item.in_reply_to_id
        body.instance       = item.instance
      }

      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reply failed')

      setSent(true)
      setReplyText('')
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Reply failed. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const replyable = canReply(item)
  const charsLeft = REPLY_MAX - replyText.length

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleCardClick(e)}
      className={`bg-surface border rounded-2xl p-4 cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.99] ${
        !item.read ? 'border-black dark:border-white' : 'border-theme'
      }`}>
      <div className="flex items-start gap-3">

        {/* Avatar / platform icon */}
        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative">
          {item.from_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.from_avatar}
              alt={item.from_name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <span className="text-xl">{platformMeta?.icon || '📱'}</span>
          )}
          {/* Small platform badge on avatar */}
          {item.from_avatar && (
            <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none bg-white dark:bg-gray-900 rounded-full p-0.5">
              {platformMeta?.icon}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: name, handle, type badge, time, unread dot */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-extrabold truncate max-w-[120px]">
              {item.from_name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
              {item.from_handle}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeMeta.color}`}>
              {typeMeta.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
              {formatTime(item.timestamp)}
            </span>
            {!item.read && (
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full flex-shrink-0" />
            )}
          </div>

          {/* Row 2: content preview */}
          {item.content ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
              {item.content}
            </p>
          ) : null}

          {/* Row 3: platform label + reply button */}
          <div className="flex items-center gap-1 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${platformMeta?.color ?? ''}`}>
              {platformMeta?.icon} {platformMeta?.label}
            </span>
            {item.post_url && (
              <span className="text-xs text-gray-400 dark:text-gray-500">↗</span>
            )}
            {replyable && !replyOpen && !sent && (
              <button
                data-reply-zone="true"
                onClick={openReply}
                className="ml-auto text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                ↩ Reply
              </button>
            )}
            {sent && (
              <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Replied
              </span>
            )}
          </div>

          {/* Reply composer */}
          {replyOpen && !sent && (
            <div
              data-reply-zone="true"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              className="mt-3 flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                rows={3}
                maxLength={REPLY_MAX}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${item.from_handle}…`}
                className="w-full text-sm bg-gray-50 dark:bg-gray-800/60 border border-theme rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              {replyError && (
                <p className="text-xs text-red-500 dark:text-red-400">{replyError}</p>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-xs flex-1 ${charsLeft < 20 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {charsLeft} chars left
                </span>
                <button
                  onClick={cancelReply}
                  className="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  {t('app_common.cancel')}
                </button>
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending || charsLeft < 0}
                  className="text-xs font-bold bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 flex items-center gap-1.5">
                  {sending
                    ? <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Sending</>
                    : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({
  platform,
  connectedPlatforms,
  fetching,
}: {
  platform: Platform
  connectedPlatforms: string[]
  fetching: boolean
}) {
  const { t } = useI18n()
  if (fetching) return null

  const isConnected = platform === 'all' || connectedPlatforms.includes(platform)

  if (platform !== 'all' && !isConnected) {
    const meta = PLATFORM_META[platform]
    return (
      <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">{meta?.icon}</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          {meta?.label} not connected
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
          Connect your {meta?.label} account to see messages here.
        </p>
        <Link href="/accounts"
          className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
          Connect accounts →
        </Link>
      </div>
    )
  }

  if (connectedPlatforms.length === 0) {
    return (
      <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          {t('app_accounts.no_accounts')}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
          {t('app_accounts.no_accounts_sub')}
        </p>
        <Link href="/accounts"
          className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
          Connect accounts →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
      <div className="text-3xl mb-2">📭</div>
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
        {t('app_notifications.no_notifications_sub')}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {t('app_notifications.no_notifications')}
      </p>
    </div>
  )
}

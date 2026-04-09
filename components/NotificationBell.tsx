'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  message: string
  action_url: string | null
  read: boolean
  created_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function typeIcon(type: string): string {
  if (type === 'post_published') return '✅'
  if (type === 'post_failed')    return '❌'
  if (type === 'clip_quota')     return '⚠️'
  return '🔔'
}

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(false)
  const [marking, setMarking]             = useState(false)
  const panelRef                          = useRef<HTMLDivElement>(null)
  const buttonRef                         = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const { notifications: data } = await res.json()
        setNotifications(data ?? [])
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount, then every 60 s
  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const markAllRead = async () => {
    if (marking) return
    setMarking(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch { /* silent */ } finally {
      setMarking(false)
    }
  }

  const markOneRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => { setOpen(o => !o); if (!open) load() }}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-extrabold text-white px-1" style={{ background: '#ef4444' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-10 w-80 rounded-2xl shadow-xl z-50 overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-mid)' }}>
            <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={marking}
                className="text-xs font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ color: 'var(--accent, #7c3aed)' }}
              >
                {marking ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm" style={{ color: 'var(--text-faint)' }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-3xl">🔔</span>
                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const Inner = (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) markOneRead(n.id) }}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-80 ${!n.read ? 'opacity-100' : 'opacity-60'}`}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <span className="text-base shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug" style={{ color: 'var(--text)', fontWeight: n.read ? 400 : 600 }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent, #7c3aed)' }} />
                    )}
                  </div>
                )
                return n.action_url ? (
                  <Link key={n.id} href={n.action_url} onClick={() => { setOpen(false); if (!n.read) markOneRead(n.id) }}>
                    {Inner}
                  </Link>
                ) : (
                  <div key={n.id}>{Inner}</div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

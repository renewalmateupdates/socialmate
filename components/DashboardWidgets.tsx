'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ── Types ────────────────────────────────────────────────────────────────────

type WidgetId = 'recent-activity' | 'credits-remaining' | 'top-platform' | 'streak-widget' | 'upcoming-posts'

type WidgetDef = {
  id: WidgetId
  title: string
  defaultVisible: boolean
}

type WidgetData = {
  streak: number
  top_platform: { platform: string; count: number } | null
  upcoming: { id: string; content: string; scheduled_at: string; platforms: string[] }[]
  credits: { remaining: number; monthly_reset_date: string; days_until_reset: number }
  recent_activity: { id: string; event_type: string; actor_email: string; description: string; created_at: string }[]
}

// ── Config ───────────────────────────────────────────────────────────────────

const WIDGET_DEFS: WidgetDef[] = [
  { id: 'recent-activity',   title: 'Recent Activity',    defaultVisible: true  },
  { id: 'credits-remaining', title: 'Credits Remaining',  defaultVisible: true  },
  { id: 'top-platform',      title: 'Top Platform',       defaultVisible: true  },
  { id: 'streak-widget',     title: 'Posting Streak',     defaultVisible: false },
  { id: 'upcoming-posts',    title: 'Upcoming Posts',     defaultVisible: false },
]

const LS_KEY = 'dashboard_card_config'

const PLATFORM_ICONS: Record<string, string> = {
  discord: '💬', bluesky: '🦋', telegram: '✈️', mastodon: '🐘',
  linkedin: '💼', youtube: '▶️', pinterest: '📌', reddit: '🤖',
  instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '📘',
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ── Individual widget cards ──────────────────────────────────────────────────

function RecentActivityCard({ data }: { data: WidgetData['recent_activity'] }) {
  if (!data.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet — your workspace events will appear here.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {data.map(event => (
        <div key={event.id} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-1.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{event.description}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{relativeTime(event.created_at)}</p>
          </div>
        </div>
      ))}
      <Link href="/activity" className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors mt-1 inline-block">
        View all →
      </Link>
    </div>
  )
}

function CreditsRemainingCard({ data }: { data: WidgetData['credits'] }) {
  return (
    <div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-4xl font-extrabold text-gray-900 dark:text-white leading-none">
          {data.remaining.toLocaleString()}
        </span>
        <span className="text-sm text-gray-400 dark:text-gray-500 mb-0.5">credits</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Monthly reset in{' '}
        <span className="font-semibold text-gray-600 dark:text-gray-300">{data.days_until_reset} day{data.days_until_reset !== 1 ? 's' : ''}</span>
      </p>
      <Link href="/settings?tab=Plan" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
        Get more credits →
      </Link>
    </div>
  )
}

function TopPlatformCard({ data }: { data: WidgetData['top_platform'] }) {
  if (!data) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 dark:text-gray-500">Schedule posts to see your top platform this month.</p>
      </div>
    )
  }
  const icon = PLATFORM_ICONS[data.platform] ?? '📱'
  const name = data.platform.charAt(0).toUpperCase() + data.platform.slice(1)
  return (
    <div className="flex items-center gap-4">
      <span className="text-4xl">{icon}</span>
      <div>
        <p className="text-lg font-extrabold text-gray-900 dark:text-white">{name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {data.count} post{data.count !== 1 ? 's' : ''} scheduled this month
        </p>
      </div>
    </div>
  )
}

function StreakWidgetCard({ data }: { data: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl">{data > 0 ? '🔥' : '💤'}</span>
      <div>
        <p className="text-3xl font-extrabold text-orange-500 leading-none">{data}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">day{data !== 1 ? 's' : ''} streak</p>
      </div>
      <Link href="/streak" className="ml-auto text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors">
        View →
      </Link>
    </div>
  )
}

function UpcomingPostsCard({ data }: { data: WidgetData['upcoming'] }) {
  if (!data.length) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 dark:text-gray-500">No upcoming posts.</p>
        <Link href="/compose" className="text-xs font-bold text-black dark:text-white mt-1 inline-block hover:underline">
          Schedule one →
        </Link>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {data.map(post => {
        const d = new Date(post.scheduled_at)
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' +
          d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        return (
          <div key={post.id} className="flex items-start gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
              {(post.platforms ?? []).slice(0, 2).map(p => (
                <span key={p} className="text-xs">{PLATFORM_ICONS[p] ?? '📱'}</span>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                {post.content || '(no content)'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        )
      })}
      <Link href="/queue" className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors mt-1 inline-block">
        View all →
      </Link>
    </div>
  )
}

// ── Customize panel ──────────────────────────────────────────────────────────

function CustomizePanel({
  visible,
  onToggle,
  onClose,
}: {
  visible: WidgetId[]
  onToggle: (id: WidgetId) => void
  onClose: () => void
}) {
  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Widgets</p>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          aria-label="Close"
        >×</button>
      </div>
      <div className="space-y-1">
        {WIDGET_DEFS.map(def => {
          const isVisible = visible.includes(def.id)
          return (
            <label
              key={def.id}
              className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isVisible
                    ? 'bg-black dark:bg-white border-black dark:border-white'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => onToggle(def.id)}
              >
                {isVisible && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-white dark:text-black" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 select-none" onClick={() => onToggle(def.id)}>
                {def.title}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ── Main exported component ──────────────────────────────────────────────────

export default function DashboardWidgets() {
  const [mounted, setMounted]               = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>([])
  const [panelOpen, setPanelOpen]           = useState(false)
  const [widgetData, setWidgetData]         = useState<WidgetData | null>(null)
  const [loading, setLoading]               = useState(true)

  // Initialise from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const config = JSON.parse(saved) as { visible: WidgetId[] }
        setVisibleWidgets(config.visible ?? WIDGET_DEFS.filter(d => d.defaultVisible).map(d => d.id))
      } else {
        setVisibleWidgets(WIDGET_DEFS.filter(d => d.defaultVisible).map(d => d.id))
      }
    } catch {
      setVisibleWidgets(WIDGET_DEFS.filter(d => d.defaultVisible).map(d => d.id))
    }
  }, [])

  // Fetch widget data
  useEffect(() => {
    if (!mounted) return
    fetch('/api/dashboard/widgets')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setWidgetData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [mounted])

  const toggleWidget = useCallback((id: WidgetId) => {
    setVisibleWidgets(prev => {
      const next = prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
      try { localStorage.setItem(LS_KEY, JSON.stringify({ visible: next })) } catch {}
      return next
    })
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-customize-panel]')) setPanelOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [panelOpen])

  if (!mounted) return null

  // Nothing visible and no customize button needed if all hidden — still render the button
  const hasVisibleWidgets = visibleWidgets.length > 0

  return (
    <div className="mb-6">
      {/* Section header with Customize button */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Dashboard Widgets
        </h2>
        <div className="relative" data-customize-panel>
          <button
            onClick={() => setPanelOpen(p => !p)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-xl transition-all"
            aria-label="Customize dashboard"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Customize
          </button>
          {panelOpen && (
            <CustomizePanel
              visible={visibleWidgets}
              onToggle={toggleWidget}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Widget grid — only renders visible widgets */}
      {hasVisibleWidgets && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WIDGET_DEFS.filter(def => visibleWidgets.includes(def.id)).map(def => (
            <div
              key={def.id}
              className="bg-surface border border-theme rounded-2xl p-4"
            >
              <h3 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                {def.title}
              </h3>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-500 animate-spin" />
                  <span className="text-xs text-gray-400">Loading…</span>
                </div>
              ) : widgetData ? (
                <>
                  {def.id === 'recent-activity'   && <RecentActivityCard data={widgetData.recent_activity} />}
                  {def.id === 'credits-remaining'  && <CreditsRemainingCard data={widgetData.credits} />}
                  {def.id === 'top-platform'       && <TopPlatformCard data={widgetData.top_platform} />}
                  {def.id === 'streak-widget'      && <StreakWidgetCard data={widgetData.streak} />}
                  {def.id === 'upcoming-posts'     && <UpcomingPostsCard data={widgetData.upcoming} />}
                </>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500">Unable to load widget data.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

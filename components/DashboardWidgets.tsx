'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import PlatformIcon from '@/components/landing/PlatformIcon'
import { useI18n } from '@/contexts/I18nContext'
import { localeToBCP47 } from '@/lib/i18n'
import { Check, Flame, Inbox, Moon, Settings2, X } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type WidgetId = 'recent-activity' | 'credits-remaining' | 'top-platform' | 'streak-widget' | 'upcoming-posts'

type T = (key: string, params?: Record<string, string | number>) => string

type WidgetDef = {
  id: WidgetId
  /** i18n key, resolved at render — NOT a baked English string, which is what
      left the widget titles untranslated while the greeting above them wasn't. */
  titleKey: string
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
  { id: 'recent-activity',   titleKey: 'app_dashboard.w_recent_activity',   defaultVisible: true  },
  { id: 'credits-remaining', titleKey: 'app_dashboard.w_credits_remaining', defaultVisible: true  },
  { id: 'top-platform',      titleKey: 'app_dashboard.w_top_platform',      defaultVisible: true  },
  { id: 'streak-widget',     titleKey: 'app_dashboard.w_streak',            defaultVisible: false },
  { id: 'upcoming-posts',    titleKey: 'app_dashboard.w_upcoming',          defaultVisible: false },
]

const LS_KEY = 'dashboard_card_config'

// `twitter` is the stored platform value; PlatformIcon indexes that mark as `x`.
const ICON_KEY: Record<string, string> = { twitter: 'x' }

function relativeTime(dateStr: string, t: T): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)   return t('app_dashboard.time_just_now')
  if (mins < 60)  return t('app_dashboard.time_m_ago', { n: mins })
  if (hours < 24) return t('app_dashboard.time_h_ago', { n: hours })
  return t('app_dashboard.time_d_ago', { n: days })
}

// ── Shared chrome — same primitives the dashboard page uses ──────────────────

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] text-app-muted ${className}`}>
      {children}
    </span>
  )
}

function Readout({ value, className = '' }: { value: string | number; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{value}</span>
}

// ── Individual widget cards ──────────────────────────────────────────────────

function RecentActivityCard({ data, t }: { data: WidgetData['recent_activity']; t: T }) {
  if (!data.length) {
    return <p className="text-xs text-app-faint py-4">{t('app_dashboard.w_no_activity')}</p>
  }
  return (
    <div className="space-y-2.5">
      {data.map(event => (
        <div key={event.id} className="flex items-start gap-2.5">
          <div className="w-1 h-1 rounded-full bg-amber/60 flex-shrink-0 mt-2" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-app-ink line-clamp-1">{event.description}</p>
            <Readout value={relativeTime(event.created_at, t)} className="text-[10px] text-app-faint mt-0.5 block" />
          </div>
        </div>
      ))}
      <Link href="/activity" className="text-[11px] text-app-muted hover:text-theme transition-colors mt-1 inline-block">
        {t('app_common.view_all')} →
      </Link>
    </div>
  )
}

function CreditsRemainingCard({ data, t }: { data: WidgetData['credits']; t: T }) {
  return (
    <div>
      <div className="flex items-end gap-1.5 mb-2">
        <Readout value={data.remaining.toLocaleString()} className="text-4xl font-semibold text-theme leading-none" />
        <span className="text-xs text-app-faint mb-1">{t('app_dashboard.w_credits')}</span>
      </div>
      <p className="text-[11px] text-app-faint">
        {t('app_dashboard.w_reset_in')}{' '}
        <Readout value={data.days_until_reset} className="text-app-ink font-semibold" />{' '}
        {data.days_until_reset === 1 ? t('app_dashboard.w_day') : t('app_dashboard.w_days')}
      </p>
      <Link href="/settings?tab=Plan" className="text-[11px] font-semibold text-violet-ink hover:underline mt-2.5 inline-block">
        {t('app_dashboard.get_more_credits')} →
      </Link>
    </div>
  )
}

function TopPlatformCard({ data, t }: { data: WidgetData['top_platform']; t: T }) {
  if (!data) {
    return <p className="text-xs text-app-faint py-4">{t('app_dashboard.w_no_top_platform')}</p>
  }
  const name = data.platform.charAt(0).toUpperCase() + data.platform.slice(1)
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-xl bg-app-raised border border-theme flex items-center justify-center flex-shrink-0">
        <PlatformIcon name={ICON_KEY[data.platform] ?? data.platform} size={20} mono className="text-theme" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-theme">{name}</p>
        <p className="text-[11px] text-app-faint">
          {t('app_dashboard.w_posts_this_month', { count: data.count })}
        </p>
      </div>
    </div>
  )
}

function StreakWidgetCard({ data, t }: { data: number; t: T }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
        data > 0 ? 'bg-amber/12 border-amber/30' : 'bg-app-raised border-theme'
      }`}>
        {data > 0 ? <Flame className="w-5 h-5 text-amber-ink" /> : <Moon className="w-5 h-5 text-app-faint" />}
      </div>
      <div>
        <Readout value={data} className={`text-3xl font-semibold leading-none ${data > 0 ? 'text-amber-ink' : 'text-app-faint'}`} />
        <Label className="block mt-1">
          {data === 1 ? t('app_dashboard.streak_unit_one') : t('app_dashboard.streak_unit_other')}
        </Label>
      </div>
      <Link href="/streak" className="ml-auto text-[11px] text-app-muted hover:text-theme transition-colors">
        {t('app_dashboard.w_view')} →
      </Link>
    </div>
  )
}

function UpcomingPostsCard({ data, t, bcp47 }: { data: WidgetData['upcoming']; t: T; bcp47: string }) {
  if (!data.length) {
    return (
      <div className="py-3">
        <p className="text-xs text-app-faint">{t('app_dashboard.w_no_upcoming')}</p>
        <Link href="/compose" className="text-[11px] font-semibold text-amber-ink mt-1.5 inline-block hover:opacity-80">
          {t('app_dashboard.w_schedule_one')} →
        </Link>
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      {data.map(post => {
        const d = new Date(post.scheduled_at)
        const label =
          new Intl.DateTimeFormat(bcp47, { month: 'short', day: 'numeric' }).format(d) + ' · ' +
          new Intl.DateTimeFormat(bcp47, { hour: 'numeric', minute: '2-digit' }).format(d)
        return (
          <div key={post.id} className="flex items-start gap-2.5 p-2.5 bg-app-raised border border-theme rounded-xl">
            <div className="flex gap-1 flex-shrink-0 mt-0.5">
              {(post.platforms ?? []).slice(0, 2).map(p => (
                <PlatformIcon key={p} name={ICON_KEY[p] ?? p} size={11} mono className="text-app-faint" />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-app-ink line-clamp-1">
                {post.content || t('app_dashboard.w_no_content')}
              </p>
              <Readout value={label} className="text-[10px] text-app-faint mt-0.5 block" />
            </div>
          </div>
        )
      })}
      <Link href="/queue" className="text-[11px] text-app-muted hover:text-theme transition-colors mt-1 inline-block">
        {t('app_common.view_all')} →
      </Link>
    </div>
  )
}

// ── Customize panel ──────────────────────────────────────────────────────────

function CustomizePanel({
  visible,
  onToggle,
  onClose,
  t,
}: {
  visible: WidgetId[]
  onToggle: (id: WidgetId) => void
  onClose: () => void
  t: T
}) {
  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-60 bg-surface border border-theme-md rounded-2xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Label>{t('app_dashboard.widgets')}</Label>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-app-faint hover:text-theme transition-colors rounded-lg hover:bg-app-fill"
          aria-label={t('app_common.close')}
        ><X className="w-3 h-3" /></button>
      </div>
      <div className="space-y-0.5">
        {WIDGET_DEFS.map(def => {
          const isVisible = visible.includes(def.id)
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => onToggle(def.id)}
              aria-pressed={isVisible}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-app-raised transition-colors text-left"
            >
              <span
                className={`w-4 h-4 rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-all ${
                  isVisible ? 'bg-amber border-amber' : 'border-theme-md'
                }`}
              >
                {isVisible && <Check className="w-2.5 h-2.5 text-void" strokeWidth={3.5} />}
              </span>
              <span className="text-xs font-medium text-app-ink select-none">{t(def.titleKey)}</span>
            </button>
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
  const { t, locale } = useI18n()
  const bcp47 = localeToBCP47(locale)

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

  const hasVisibleWidgets = visibleWidgets.length > 0

  return (
    <div className="mb-7">
      {/* Section header with Customize button */}
      <div className="flex items-center justify-between mb-3">
        <Label>{t('app_dashboard.widgets_title')}</Label>
        <div className="relative" data-customize-panel>
          <button
            onClick={() => setPanelOpen(p => !p)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-app-muted hover:text-theme border border-theme hover:border-theme-md px-3 py-1.5 rounded-xl transition-all"
            aria-label={t('app_dashboard.customize')}
            aria-expanded={panelOpen}
          >
            <Settings2 className="w-3.5 h-3.5" />
            {t('app_dashboard.customize')}
          </button>
          {panelOpen && (
            <CustomizePanel
              visible={visibleWidgets}
              onToggle={toggleWidget}
              onClose={() => setPanelOpen(false)}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Widget grid — only renders visible widgets */}
      {hasVisibleWidgets ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WIDGET_DEFS.filter(def => visibleWidgets.includes(def.id)).map(def => (
            <div
              key={def.id}
              className="bg-surface border border-theme rounded-2xl p-5"
            >
              <Label className="block mb-3.5">{t(def.titleKey)}</Label>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-app-fill border-t-amber animate-spin" />
                  <span className="text-xs text-app-faint">{t('app_common.loading')}</span>
                </div>
              ) : widgetData ? (
                <>
                  {def.id === 'recent-activity'   && <RecentActivityCard  data={widgetData.recent_activity} t={t} />}
                  {def.id === 'credits-remaining' && <CreditsRemainingCard data={widgetData.credits}        t={t} />}
                  {def.id === 'top-platform'      && <TopPlatformCard      data={widgetData.top_platform}   t={t} />}
                  {def.id === 'streak-widget'     && <StreakWidgetCard     data={widgetData.streak}         t={t} />}
                  {def.id === 'upcoming-posts'    && <UpcomingPostsCard    data={widgetData.upcoming}       t={t} bcp47={bcp47} />}
                </>
              ) : (
                <p className="text-xs text-app-faint">{t('app_dashboard.w_unable_load')}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-theme border-dashed rounded-2xl p-6 text-center">
          <Inbox className="w-6 h-6 text-app-ghost mx-auto mb-2.5" strokeWidth={1.5} />
          <p className="text-xs text-app-faint">{t('app_dashboard.w_none_visible')}</p>
        </div>
      )}
    </div>
  )
}

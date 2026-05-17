'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { useI18n } from '@/contexts/I18nContext'

interface ActivityEvent {
  id: string
  workspace_id: string
  actor_email: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

const ACTION_ICONS: Record<string, string> = {
  post_published:    '📤',
  post_scheduled:    '📅',
  post_drafted:      '📝',
  post_deleted:      '🗑️',
  post_approved:     '✅',
  post_rejected:     '❌',
  member_invited:    '👋',
  member_removed:    '🚪',
  member_role_changed: '🎭',
  workspace_updated: '⚙️',
  template_created:  '📋',
  template_deleted:  '🗑️',
}

function actionIcon(action: string) {
  return ACTION_ICONS[action] ?? '📌'
}

function actionLabel(action: string) {
  return action.replace(/_/g, ' ')
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useI18n()

  useEffect(() => {
    fetch('/api/workspace/activity')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEvents(d.events ?? []))
      .catch(() => setError('Failed to load activity'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="md:ml-56 p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{t('app_activity.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
            Recent actions across your workspace — last 50 events.
          </p>
        </div>

        {loading && (
          <div className="text-sm py-12 text-center" style={{ color: 'var(--text-faint)' }}>Loading…</div>
        )}

        {!loading && error && (
          <div className="text-sm text-red-500 py-4">{error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{ borderColor: 'var(--border-mid)', color: 'var(--text-faint)' }}
          >
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-semibold">{t('app_activity.no_activity')}</p>
            <p className="text-xs mt-1">{t('app_activity.no_activity_sub')}</p>
          </div>
        )}

        {events.length > 0 && (
          <div
            className="rounded-2xl border divide-y"
            style={{ borderColor: 'var(--border-mid)', background: 'var(--surface)' }}
          >
            {events.map(ev => (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-3.5">
                <span className="text-lg mt-0.5 flex-shrink-0">{actionIcon(ev.action)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--fg)' }}>
                    {actionLabel(ev.action)}
                    {ev.entity_type && (
                      <span className="font-normal text-xs ml-1.5" style={{ color: 'var(--text-faint)' }}>
                        · {ev.entity_type}
                      </span>
                    )}
                  </p>
                  {ev.actor_email && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      {ev.actor_email}
                    </p>
                  )}
                  {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-faint)' }}>
                      {Object.entries(ev.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  {relativeTime(ev.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

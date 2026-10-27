'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Toast from '@/components/Toast'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { CAMPAIGN_PLATFORMS, PAID_ONLY_PLATFORMS } from '@/lib/campaigns'
import { DEFAULT_TEMPLATE, renderAlert } from '@/lib/live-alerts'
import { Radio, Trash2, X } from 'lucide-react'
import { PLATFORM_NAMES } from '../campaigns/shared'

type Alert = {
  id: string
  twitch_login: string
  twitch_name: string
  platforms: string[]
  template: string
  enabled: boolean
  last_alert_at: string | null
  last_error: string | null
}

const SAMPLE = { title: 'Ranked grind to Diamond', game: 'League of Legends' }
const FIELDS = ['{name}', '{title}', '{game}', '{url}']

function preview(template: string, login: string, name?: string) {
  const handle = login || 'yourchannel'
  return renderAlert(template || DEFAULT_TEMPLATE, { name: name || handle, ...SAMPLE, url: `https://twitch.tv/${handle}` })
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item]
}

function PlatformPicker({ connected, selected, onChange, plan }: {
  connected: string[]; selected: string[]; onChange: (p: string[]) => void; plan: string
}) {
  if (!connected.length) {
    return <p className="text-sm text-muted">Connect an account first on the <Link href="/accounts" className="text-amber-500 underline">Accounts page</Link>. Alerts post to Discord, Bluesky, Telegram, Mastodon, LinkedIn and X.</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {connected.map(p => {
        const locked = plan === 'free' && PAID_ONLY_PLATFORMS.includes(p)
        const on = selected.includes(p)
        return (
          <button
            key={p}
            type="button"
            disabled={locked}
            aria-pressed={on}
            title={locked ? 'Posting to X needs the Pro plan' : undefined}
            onClick={() => onChange(toggle(selected, p))}
            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all disabled:opacity-40 ${on ? 'bg-amber-400 border-amber-400 text-black' : 'border-theme text-theme hover:border-amber-400'}`}
          >
            {PLATFORM_NAMES[p] ?? p}{locked ? ' (Pro)' : ''}
          </button>
        )
      })}
    </div>
  )
}

function AlertCard({ alert, connected, plan, onChanged, flash }: {
  alert: Alert; connected: string[]; plan: string; onChanged: () => void; flash: (m: string, ok?: boolean) => void
}) {
  const [platforms, setPlatforms] = useState(alert.platforms)
  const [template,  setTemplate]  = useState(alert.template)
  const [busy,      setBusy]      = useState(false)
  const [confirm,   setConfirm]   = useState<'test' | 'delete' | null>(null)
  const dirty = template !== alert.template || platforms.slice().sort().join() !== alert.platforms.slice().sort().join()

  async function patch(body: Record<string, unknown>, done: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/live-alerts/${alert.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { flash(d.error || 'That did not work. Try again.', false); return }
      flash(done)
      setConfirm(null)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    try {
      const res = await fetch(`/api/live-alerts/${alert.id}`, { method: 'DELETE' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { flash(d.error || 'Could not delete the alert.', false); return }
      flash('Alert deleted.')
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-surface border border-theme rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a href={`https://twitch.tv/${alert.twitch_login}`} target="_blank" rel="noopener noreferrer" className="font-black text-theme hover:underline">
            twitch.tv/{alert.twitch_login}
          </a>
          <p className="text-xs text-muted mt-0.5">
            {alert.last_alert_at
              ? `Last alert ${new Date(alert.last_alert_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
              : 'No alerts yet. It posts the next time this channel goes live.'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-theme cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={alert.enabled}
            disabled={busy}
            onChange={e => patch({ enabled: e.target.checked }, e.target.checked ? 'Alert turned on.' : 'Alert turned off.')}
            className="accent-amber-500 w-4 h-4"
          />
          {alert.enabled ? 'On' : 'Off'}
        </label>
      </div>

      {alert.last_error && <p className="text-sm text-amber-600 dark:text-amber-400">{alert.last_error}</p>}

      <div>
        <span className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Post to</span>
        <PlatformPicker connected={connected} selected={platforms} onChange={setPlatforms} plan={plan} />
      </div>

      <div>
        <label htmlFor={`tpl-${alert.id}`} className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">Message</label>
        <textarea
          id={`tpl-${alert.id}`}
          value={template}
          onChange={e => setTemplate(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full bg-theme border border-theme rounded-xl px-3 py-2 text-sm text-theme focus:outline-none focus:border-amber-400 resize-y"
        />
        <p className="text-xs text-muted mt-1 whitespace-pre-line">Looks like: {preview(template, alert.twitch_login, alert.twitch_name)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {dirty && (
          <button disabled={busy} onClick={() => patch({ platforms, template }, 'Saved.')}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-4 py-2 rounded-xl text-sm">
            Save changes
          </button>
        )}
        {confirm === 'test' ? (
          <>
            <span className="text-sm text-theme">Post it now to {alert.platforms.map(p => PLATFORM_NAMES[p] ?? p).join(', ')}?</span>
            <button disabled={busy} onClick={() => patch({ action: 'test' }, 'Test alert sent. It shows in Queue until it posts.')}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-4 py-2 rounded-xl text-sm">Yes, post it</button>
            <button onClick={() => setConfirm(null)} className="text-sm text-muted hover:text-theme px-2">Cancel</button>
          </>
        ) : confirm === 'delete' ? (
          <>
            <span className="text-sm text-theme">Delete this alert?</span>
            <button disabled={busy} onClick={remove} className="bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm">Yes, delete</button>
            <button onClick={() => setConfirm(null)} className="text-sm text-muted hover:text-theme px-2">Keep it</button>
          </>
        ) : (
          <>
            <button disabled={busy || dirty} onClick={() => setConfirm('test')} title={dirty ? 'Save your changes first' : undefined}
              className="border border-theme hover:border-amber-400 text-theme font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
              Send a test post
            </button>
            <button disabled={busy} onClick={() => setConfirm('delete')} aria-label="Delete alert"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-red-500 font-semibold px-3 py-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function LiveAlertsPage() {
  const { plan, activeWorkspaceId } = useWorkspace()
  const [alerts,    setAlerts]    = useState<Alert[]>([])
  const [loading,   setLoading]   = useState(true)
  const [connected, setConnected] = useState<string[]>([])
  const [showForm,  setShowForm]  = useState(false)
  const [channel,   setChannel]   = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [template,  setTemplate]  = useState(DEFAULT_TEMPLATE)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [toast,     setToast]     = useState<{ message: string; ok: boolean } | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/live-alerts')
      const d = await res.json().catch(() => ({}))
      setAlerts(res.ok ? d.alerts ?? [] : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    fetch('/api/accounts/connected')
      .then(r => r.ok ? r.json() : { platforms: [] })
      .then(d => {
        const usable = (d.platforms ?? []).filter((p: string) => (CAMPAIGN_PLATFORMS as readonly string[]).includes(p))
        setConnected(usable)
        setPlatforms(usable.filter((p: string) => !PAID_ONLY_PLATFORMS.includes(p)))
      })
      .catch(() => setConnected([]))
  }, [])

  function flash(message: string, ok = true) {
    setToast({ message, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function create() {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/live-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, platforms, template, workspaceId: activeWorkspaceId }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not create the alert.'); return }
      setShowForm(false)
      setChannel('')
      setTemplate(DEFAULT_TEMPLATE)
      flash(`Alert on. SocialMate will post the next time ${d.alert?.twitch_name ?? 'the channel'} goes live.`)
      await load()
    } catch {
      setError('Could not reach SocialMate. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const loginGuess = channel.trim().replace(/^@/, '').replace(/.*twitch\.tv\//i, '').split(/[/?#]/)[0].toLowerCase()

  return (
    <div className="flex min-h-screen bg-theme">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-6 md:p-10">
       <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-theme">Go-Live Alerts</h1>
            <p className="text-muted text-sm mt-1">When your Twitch stream starts, SocialMate posts it everywhere you pick, on its own.</p>
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setError('') }}
              className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm transition-all">
              + New alert
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-surface border border-amber-400 rounded-2xl p-6 mb-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-theme">New go-live alert</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="text-muted hover:text-theme"><X className="w-4 h-4" /></button>
            </div>

            <div>
              <label htmlFor="alert-channel" className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">Twitch channel</label>
              <div className="flex items-center bg-theme border border-theme rounded-xl focus-within:border-amber-400">
                <span className="pl-4 text-sm text-muted">twitch.tv/</span>
                <input
                  id="alert-channel"
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  placeholder="yourchannel"
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-transparent px-1 py-2.5 text-sm text-theme placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <p className="text-xs text-muted mt-1">No Twitch login needed. Any public channel works.</p>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Post to</span>
              <PlatformPicker connected={connected} selected={platforms} onChange={setPlatforms} plan={plan} />
            </div>

            <div>
              <label htmlFor="alert-template" className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">Message</label>
              <textarea
                id="alert-template"
                value={template}
                onChange={e => setTemplate(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-theme border border-theme rounded-xl px-3 py-2 text-sm text-theme focus:outline-none focus:border-amber-400 resize-y"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {FIELDS.map(f => (
                  <button key={f} type="button" onClick={() => setTemplate(t => `${t}${t.endsWith(' ') || !t ? '' : ' '}${f}`)}
                    className="text-xs font-mono px-2 py-1 rounded-md border border-theme text-muted hover:text-theme hover:border-amber-400">
                    {f}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-theme bg-theme px-3 py-2">
                <p className="text-xs font-bold text-muted mb-1">Preview, with a sample stream title</p>
                <p className="text-sm text-theme whitespace-pre-line">{preview(template, loginGuess)}</p>
              </div>
            </div>

            <p className="text-xs text-muted">One post per stream, and none within 30 minutes of the last, so a dropped stream that restarts doesn&apos;t post twice. Alerts count toward your monthly post limit.</p>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button onClick={create} disabled={saving || !channel.trim() || !platforms.length}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-5 py-2.5 rounded-xl text-sm">
                {saving ? 'Turning on…' : 'Turn on alert'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-theme text-muted hover:text-theme px-5 py-2.5 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          !showForm && (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <Radio className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="font-bold text-theme mb-1">No alerts yet</p>
              <p className="text-sm text-muted mb-4">Type your Twitch channel once. Every time you go live, SocialMate posts it to Discord, Bluesky, Telegram, X and more.</p>
              <button onClick={() => setShowForm(true)} className="bg-amber-400 hover:bg-amber-300 text-black font-black px-5 py-2.5 rounded-xl text-sm">
                Set up your first alert
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {alerts.map(a => (
              <AlertCard key={`${a.id}-${a.template}-${a.platforms.join()}`} alert={a} connected={connected} plan={plan} onChanged={load} flash={flash} />
            ))}
          </div>
        )}
       </div>
      </main>
      <Toast message={toast?.message ?? ''} type={toast ? (toast.ok ? 'success' : 'error') : undefined} />
    </div>
  )
}

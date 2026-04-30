'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

type FeedEntry = { url: string; label: string }

type Settings = {
  enabled:     boolean
  feed_urls:   FeedEntry[]
  platforms:   string[]
  max_per_day: number
  tone_hint:   string
  mode:        'draft' | 'auto'
  last_ran_at: string | null
}

const PLATFORMS = [
  { id: 'bluesky',  label: 'Bluesky' },
  { id: 'mastodon', label: 'Mastodon' },
  { id: 'twitter',  label: 'X / Twitter' },
  { id: 'discord',  label: 'Discord' },
  { id: 'telegram', label: 'Telegram' },
]

export default function CaptionAgentPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()

  const [settings, setSettings] = useState<Settings>({
    enabled: false, feed_urls: [], platforms: [], max_per_day: 3, tone_hint: '', mode: 'draft', last_ran_at: null,
  })
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [feedInput,  setFeedInput]  = useState({ url: '', label: '' })
  const [toast,      setToast]      = useState('')
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/caption?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.settings) setSettings({ ...settings, ...d.settings }) })
      .finally(() => setLoading(false))
  }, [workspaceId])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function addFeed() {
    const url = feedInput.url.trim()
    if (!url || !url.startsWith('http')) { setError('Enter a valid RSS URL starting with http.'); return }
    if (settings.feed_urls.find(f => f.url === url)) { setError('Feed already added.'); return }
    setSettings(s => ({ ...s, feed_urls: [...s.feed_urls, { url, label: feedInput.label.trim() || url }] }))
    setFeedInput({ url: '', label: '' })
    setError('')
  }

  function removeFeed(url: string) {
    setSettings(s => ({ ...s, feed_urls: s.feed_urls.filter(f => f.url !== url) }))
  }

  function togglePlatform(id: string) {
    setSettings(s => ({
      ...s,
      platforms: s.platforms.includes(id)
        ? s.platforms.filter(p => p !== id)
        : [...s.platforms, id],
    }))
  }

  async function save() {
    if (!workspaceId) return
    if (settings.feed_urls.length === 0 && settings.enabled) {
      setError('Add at least one RSS feed before enabling.'); return
    }
    setSaving(true)
    const res = await fetch('/api/agents/caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: workspaceId, ...settings }),
    })
    setSaving(false)
    if (res.ok) { showToast('Settings saved!'); setError('') }
    else {
      const d = await res.json()
      setError(d.error || 'Failed to save.')
    }
  }

  const isAgency = plan === 'agency'

  if (!isAgency) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">✍️</span>
        <h1 className="text-2xl font-black text-primary">Caption Agent</h1>
        <p className="text-secondary text-sm max-w-md">
          Point it at any RSS feed — news sites, blogs, YouTube channels — and it auto-drafts platform-ready posts every day.
          Available on the Agency plan.
        </p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm">Upgrade to Agency →</Link>
        <Link href="/agents" className="text-xs text-secondary hover:text-primary">← Back to Agents</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/agents" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Back to Agents</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">✍️</span>
          <h1 className="text-2xl font-black text-primary">Caption Agent</h1>
          <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Agency</span>
        </div>
        <p className="text-secondary text-sm">
          Every day at 11am UTC, this agent checks your RSS feeds for new articles and auto-generates platform-ready social posts — dropped into drafts for your approval.
        </p>
        {settings.last_ran_at && (
          <p className="text-xs text-secondary mt-1">Last ran: {new Date(settings.last_ran_at).toLocaleDateString()}</p>
        )}
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="space-y-5">
          {/* Enable toggle */}
          <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Enable Caption Agent</p>
              <p className="text-xs text-secondary mt-0.5">Runs daily at 11am UTC — free, no credits charged</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* RSS Feeds */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-1">RSS Feeds</p>
            <p className="text-xs text-secondary mb-3">Add any RSS feed — blogs, news sites, YouTube channels, podcasts.</p>
            <div className="space-y-2 mb-3">
              <input
                type="url"
                value={feedInput.url}
                onChange={e => setFeedInput(f => ({ ...f, url: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addFeed()}
                placeholder="https://example.com/feed.xml"
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={feedInput.label}
                  onChange={e => setFeedInput(f => ({ ...f, label: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addFeed()}
                  placeholder="Label (optional)"
                  className="flex-1 bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
                />
                <button onClick={addFeed} className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm">Add</button>
              </div>
            </div>
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {settings.feed_urls.map(feed => (
                <div key={feed.url} className="flex items-center justify-between bg-background border border-theme rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary truncate">{feed.label}</p>
                    <p className="text-xs text-secondary truncate">{feed.url}</p>
                  </div>
                  <button onClick={() => removeFeed(feed.url)} className="ml-3 text-gray-400 hover:text-red-400 text-xs shrink-0">Remove</button>
                </div>
              ))}
              {settings.feed_urls.length === 0 && (
                <p className="text-xs text-secondary text-center py-2">No feeds added yet</p>
              )}
            </div>
          </div>

          {/* Target platforms */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Target platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const active = settings.platforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      active
                        ? 'bg-amber-400 border-amber-400 text-black'
                        : 'border-theme bg-background text-secondary hover:border-amber-400/50'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-secondary mt-2">Posts will target these platforms. Leave empty to create unplatformed drafts.</p>
          </div>

          {/* Max per day */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-1">Max drafts per day</p>
            <p className="text-xs text-secondary mb-3">Cap how many new posts the agent generates each run.</p>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setSettings(s => ({ ...s, max_per_day: n }))}
                  className={`w-12 h-12 rounded-xl font-black text-sm border transition-all ${
                    settings.max_per_day === n
                      ? 'bg-amber-400 border-amber-400 text-black'
                      : 'border-theme bg-background text-secondary hover:border-amber-400/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Tone hint */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-secondary mb-1">
              Tone guidance <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={settings.tone_hint}
              onChange={e => setSettings(s => ({ ...s, tone_hint: e.target.value }))}
              placeholder="e.g. casual and punchy, avoid jargon"
              className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Mode */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Output mode</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'draft', label: 'Draft', desc: 'Added to Drafts for your review' },
                { id: 'auto',  label: 'Auto Schedule', desc: 'Queued automatically to your schedule' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSettings(s => ({ ...s, mode: m.id as 'draft' | 'auto' }))}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    settings.mode === m.id
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-theme bg-background hover:border-amber-400/50'
                  }`}
                >
                  <p className="font-bold text-sm text-primary">{m.label}</p>
                  <p className="text-xs text-secondary mt-1">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-3 rounded-xl text-sm transition-all"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  )
}

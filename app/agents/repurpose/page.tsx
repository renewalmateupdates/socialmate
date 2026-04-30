'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

type Settings = {
  enabled: boolean
  formats: string[]
  mode: 'draft' | 'auto'
  last_ran_at: string | null
}

const ALL_FORMATS = [
  { id: 'thread',        label: 'Thread',               desc: '5-7 part tweet/post thread' },
  { id: 'caption',       label: 'Caption',               desc: 'Short punchy caption + hashtags' },
  { id: 'linkedin_post', label: 'LinkedIn Post',         desc: 'Professional 150-250 word post' },
  { id: 'email',         label: 'Email Snippet',         desc: 'Newsletter-ready section' },
  { id: 'short_hook',    label: 'Short Hook',            desc: 'One-liner under 140 chars' },
]

export default function RepurposeAgentPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()

  const [settings,  setSettings]  = useState<Settings>({ enabled: false, formats: ['thread', 'caption'], mode: 'draft', last_ran_at: null })
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/repurpose?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.settings) setSettings({ ...settings, ...d.settings }) })
      .finally(() => setLoading(false))
  }, [workspaceId])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function toggleFormat(id: string) {
    setSettings(s => ({
      ...s,
      formats: s.formats.includes(id)
        ? s.formats.filter(f => f !== id)
        : [...s.formats, id],
    }))
  }

  async function save() {
    if (!workspaceId) return
    if (settings.formats.length === 0) { setError('Pick at least one format.'); return }
    setSaving(true)
    const res = await fetch('/api/agents/repurpose', {
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

  const isPro = plan !== 'free'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">♻️</span>
        <h1 className="text-2xl font-black text-primary">Repurpose Agent</h1>
        <p className="text-secondary text-sm max-w-md">Automatically repurpose your best posts into new formats every week. Available on Pro and Agency plans.</p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm">Upgrade to Pro →</Link>
        <Link href="/agents" className="text-xs text-secondary hover:text-primary">← Back to Agents</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/agents" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Back to Agents</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">♻️</span>
          <h1 className="text-2xl font-black text-primary">Repurpose Agent</h1>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pro+</span>
        </div>
        <p className="text-secondary text-sm">
          Every Wednesday, your best recent post is automatically repurposed into the formats you choose — dropped into your drafts for review or scheduled directly.
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
              <p className="font-bold text-primary">Enable Repurpose Agent</p>
              <p className="text-xs text-secondary mt-0.5">Runs every Wednesday at 9am UTC — free, no credits charged</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* How it works */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">How it works</p>
            <ul className="text-sm text-secondary space-y-1">
              <li>✓ Picks your best post from the past week</li>
              <li>✓ Generates a new version in each selected format</li>
              <li>✓ Drops them into your Drafts queue</li>
              <li>✓ You review, edit, and schedule when ready</li>
            </ul>
          </div>

          {/* Format picker */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">
              Formats to generate <span className="font-normal normal-case text-amber-500">({settings.formats.length} selected)</span>
            </p>
            <div className="space-y-2">
              {ALL_FORMATS.map(fmt => {
                const active = settings.formats.includes(fmt.id)
                return (
                  <button
                    key={fmt.id}
                    onClick={() => toggleFormat(fmt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      active
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-theme bg-background hover:border-amber-400/50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-primary">{fmt.label}</p>
                      <p className="text-xs text-secondary mt-0.5">{fmt.desc}</p>
                    </div>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      active ? 'bg-amber-400 text-black' : 'border border-theme text-transparent'
                    }`}>✓</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mode */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Output mode</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'draft', label: 'Draft', desc: 'Dropped into Drafts for your review' },
                { id: 'auto',  label: 'Auto Schedule', desc: 'Scheduled automatically to your queue' },
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

          {error && <p className="text-xs text-red-500">{error}</p>}

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
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  )
}

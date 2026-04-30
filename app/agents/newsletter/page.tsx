'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

type Settings = {
  enabled: boolean
  mode: 'draft' | 'auto'
  subscriber_emails: string[]
  subject_prefix: string
  custom_intro: string
  last_sent_at: string | null
}

type Send = {
  id: string
  subject: string
  subscriber_count: number
  mode: string
  sent_at: string
}

export default function NewsletterAgentPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()

  const [settings,      setSettings]      = useState<Settings>({
    enabled: false, mode: 'draft', subscriber_emails: [], subject_prefix: '', custom_intro: '', last_sent_at: null,
  })
  const [sends,         setSends]         = useState<Send[]>([])
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [emailInput,    setEmailInput]    = useState('')
  const [toast,         setToast]         = useState('')
  const [error,         setError]         = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/newsletter?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.settings) setSettings({ ...settings, ...d.settings })
        if (d?.sends) setSends(d.sends)
      })
      .finally(() => setLoading(false))
  }, [workspaceId])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function addEmail() {
    const email = emailInput.trim().toLowerCase()
    if (!email || !email.includes('@')) { setError('Enter a valid email.'); return }
    if (settings.subscriber_emails.includes(email)) { setError('Already added.'); return }
    setSettings(s => ({ ...s, subscriber_emails: [...s.subscriber_emails, email] }))
    setEmailInput('')
    setError('')
  }

  function removeEmail(email: string) {
    setSettings(s => ({ ...s, subscriber_emails: s.subscriber_emails.filter(e => e !== email) }))
  }

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    const res = await fetch('/api/agents/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: workspaceId, ...settings }),
    })
    setSaving(false)
    if (res.ok) showToast('Settings saved!')
    else {
      const d = await res.json()
      setError(d.error || 'Failed to save.')
    }
  }

  const isPro = plan !== 'free'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">📰</span>
        <h1 className="text-2xl font-black text-primary">Newsletter Agent</h1>
        <p className="text-secondary text-sm max-w-md">Available on Pro and Agency plans.</p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm">Upgrade →</Link>
        <Link href="/agents" className="text-xs text-secondary hover:text-primary">← Back to Agents</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/agents" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Back to Agents</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📰</span>
          <h1 className="text-2xl font-black text-primary">Newsletter Agent</h1>
        </div>
        <p className="text-secondary text-sm">
          Every Sunday, your week's posts are turned into a newsletter — automatically drafted or sent to your list.
        </p>
        {settings.last_sent_at && (
          <p className="text-xs text-secondary mt-1">Last ran: {new Date(settings.last_sent_at).toLocaleDateString()}</p>
        )}
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="space-y-5">
          {/* Enable toggle */}
          <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Enable Newsletter Agent</p>
              <p className="text-xs text-secondary mt-0.5">Runs every Sunday at 9am UTC</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Mode */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Mode</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'draft', label: 'Draft', desc: 'You get notified and review before sending' },
                { id: 'auto',  label: 'Auto Send', desc: 'Sends automatically to your subscriber list' },
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

          {/* Subject prefix */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-secondary mb-1">Subject prefix <span className="font-normal normal-case">(optional)</span></label>
            <input
              type="text"
              value={settings.subject_prefix}
              onChange={e => setSettings(s => ({ ...s, subject_prefix: e.target.value }))}
              placeholder="e.g. The Weekly Drop"
              className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-secondary mt-1">Prepended to the AI-generated subject: "The Weekly Drop: ..."</p>
          </div>

          {/* Custom intro */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-secondary mb-1">Custom intro note <span className="font-normal normal-case">(optional)</span></label>
            <textarea
              value={settings.custom_intro}
              onChange={e => setSettings(s => ({ ...s, custom_intro: e.target.value }))}
              rows={2}
              placeholder="e.g. Hey fam, big week this week..."
              className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Subscriber list */}
          {settings.mode === 'auto' && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">
                Subscriber List ({settings.subscriber_emails.length})
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEmail()}
                  placeholder="subscriber@email.com"
                  className="flex-1 bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
                />
                <button onClick={addEmail} className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm">Add</button>
              </div>
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {settings.subscriber_emails.map(email => (
                  <div key={email} className="flex items-center justify-between bg-background border border-theme rounded-lg px-3 py-2">
                    <span className="text-sm text-primary">{email}</span>
                    <button onClick={() => removeEmail(email)} className="text-gray-400 hover:text-red-400 text-xs">Remove</button>
                  </div>
                ))}
                {settings.subscriber_emails.length === 0 && (
                  <p className="text-xs text-secondary text-center py-3">No subscribers yet</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-3 rounded-xl text-sm transition-all"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>

          {/* Send history */}
          {sends.length > 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">History</p>
              <div className="space-y-2">
                {sends.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-background border border-theme rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-primary truncate max-w-xs">{s.subject}</p>
                      <p className="text-xs text-secondary mt-0.5">{new Date(s.sent_at).toLocaleDateString()} · {s.mode === 'auto' ? `${s.subscriber_count} sent` : 'Draft'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  )
}

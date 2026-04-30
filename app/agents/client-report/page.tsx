'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

type Settings = {
  enabled: boolean
  recipient_emails: string[]
  last_sent_at: string | null
}

export default function ClientReportPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()

  const [settings,   setSettings]   = useState<Settings>({ enabled: false, recipient_emails: [], last_sent_at: null })
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [toast,      setToast]      = useState('')
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/client-report?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.settings) setSettings({ ...settings, ...d.settings }) })
      .finally(() => setLoading(false))
  }, [workspaceId])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function addEmail() {
    const email = emailInput.trim().toLowerCase()
    if (!email || !email.includes('@')) { setError('Enter a valid email.'); return }
    if (settings.recipient_emails.includes(email)) { setError('Already added.'); return }
    setSettings(s => ({ ...s, recipient_emails: [...s.recipient_emails, email] }))
    setEmailInput('')
    setError('')
  }

  function removeEmail(email: string) {
    setSettings(s => ({ ...s, recipient_emails: s.recipient_emails.filter(e => e !== email) }))
  }

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    const res = await fetch('/api/agents/client-report', {
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

  const isAgency = plan === 'agency' || plan === 'agency_annual'

  if (!isAgency) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">📊</span>
        <h1 className="text-2xl font-black text-primary">Client Report Agent</h1>
        <p className="text-secondary text-sm max-w-md">Auto-generated weekly client reports are an Agency plan feature.</p>
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
          <span className="text-3xl">📊</span>
          <h1 className="text-2xl font-black text-primary">Client Report Agent</h1>
          <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Agency</span>
        </div>
        <p className="text-secondary text-sm">
          Every Monday morning, a performance summary for your workspace is automatically emailed — posts published, scheduled ahead, active platforms.
        </p>
        {settings.last_sent_at && (
          <p className="text-xs text-secondary mt-1">Last sent: {new Date(settings.last_sent_at).toLocaleDateString()}</p>
        )}
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="space-y-5">
          {/* Enable toggle */}
          <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Enable Client Report Agent</p>
              <p className="text-xs text-secondary mt-0.5">Runs every Monday at 9am UTC — sent to you + any recipients below</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* What's included */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">Report includes</p>
            <ul className="text-sm text-secondary space-y-1">
              <li>✓ Posts published this week</li>
              <li>✓ Posts scheduled for next week</li>
              <li>✓ Active platforms</li>
              <li>✓ Link to full analytics</li>
            </ul>
          </div>

          {/* Recipient emails */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-1">
              Additional recipients <span className="font-normal normal-case">(optional)</span>
            </p>
            <p className="text-xs text-secondary mb-3">Report always goes to you. Add client emails to CC them directly.</p>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEmail()}
                placeholder="client@company.com"
                className="flex-1 bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
              <button onClick={addEmail} className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm">Add</button>
            </div>
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <div className="space-y-1">
              {settings.recipient_emails.map(email => (
                <div key={email} className="flex items-center justify-between bg-background border border-theme rounded-lg px-3 py-2">
                  <span className="text-sm text-primary">{email}</span>
                  <button onClick={() => removeEmail(email)} className="text-gray-400 hover:text-red-400 text-xs">Remove</button>
                </div>
              ))}
              {settings.recipient_emails.length === 0 && (
                <p className="text-xs text-secondary text-center py-2">Only you will receive the report</p>
              )}
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

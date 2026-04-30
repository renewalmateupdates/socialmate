'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

type Draft = {
  id:              string
  platform:        string
  mention_text:    string
  mention_author:  string
  mention_url:     string | null
  suggested_reply: string
  reply_metadata:  Record<string, string>
  created_at:      string
}

type Settings = { enabled: boolean; tone_hint: string; last_ran_at: string | null }

export default function InboxAgentPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()

  const [settings,  setSettings]  = useState<Settings>({ enabled: false, tone_hint: '', last_ran_at: null })
  const [drafts,    setDrafts]    = useState<Draft[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [sending,   setSending]   = useState<string | null>(null)
  const [toast,     setToast]     = useState('')
  const [error,     setError]     = useState('')
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editText,  setEditText]  = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/inbox-agent?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.settings) setSettings({ ...settings, ...d.settings })
        if (d?.drafts)   setDrafts(d.drafts)
      })
      .finally(() => setLoading(false))
  }, [workspaceId])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    const res = await fetch('/api/agents/inbox-agent', {
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

  async function dismiss(id: string) {
    await fetch('/api/agents/inbox-agent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'dismissed' }),
    })
    setDrafts(ds => ds.filter(d => d.id !== id))
  }

  async function sendReply(draft: Draft) {
    const replyText = editId === draft.id ? editText : draft.suggested_reply
    if (!replyText.trim()) return
    setSending(draft.id)
    const body: Record<string, string> = {
      platform:   draft.platform,
      reply_text: replyText,
      ...draft.reply_metadata,
    }
    const res = await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSending(null)
    if (res.ok) {
      await fetch('/api/agents/inbox-agent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draft.id, status: 'sent' }),
      })
      setDrafts(ds => ds.filter(d => d.id !== draft.id))
      showToast('Reply sent!')
    } else {
      const d = await res.json()
      showToast(d.error || 'Send failed — try from Inbox directly.')
    }
  }

  const isPro = plan !== 'free'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">💬</span>
        <h1 className="text-2xl font-black text-primary">Inbox Agent</h1>
        <p className="text-secondary text-sm max-w-md">Never leave a mention on read. AI-drafted replies to your Bluesky and Mastodon mentions — review and send with one click. Available on Pro and Agency.</p>
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
          <span className="text-3xl">💬</span>
          <h1 className="text-2xl font-black text-primary">Inbox Agent</h1>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pro+</span>
        </div>
        <p className="text-secondary text-sm">
          Every 2 hours, the agent checks your Bluesky and Mastodon mentions for new replies and drafts smart, on-brand responses. Review, edit, and send without leaving SocialMate.
        </p>
        {settings.last_ran_at && (
          <p className="text-xs text-secondary mt-1">Last ran: {new Date(settings.last_ran_at).toLocaleString()}</p>
        )}
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="space-y-5">
          {/* Enable toggle */}
          <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Enable Inbox Agent</p>
              <p className="text-xs text-secondary mt-0.5">Checks mentions every 2 hours — free, no credits charged</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Tone hint */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-secondary mb-1">
              Reply tone <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={settings.tone_hint}
              onChange={e => setSettings(s => ({ ...s, tone_hint: e.target.value }))}
              placeholder="e.g. friendly, direct, a bit witty — never formal"
              className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-3 rounded-xl text-sm transition-all"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>

          {/* Reply drafts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                Pending Replies {drafts.length > 0 && <span className="text-amber-500">({drafts.length})</span>}
              </p>
              {drafts.length > 0 && (
                <Link href="/inbox" className="text-xs text-amber-500 hover:underline">Open Inbox →</Link>
              )}
            </div>

            {drafts.length === 0 ? (
              <div className="bg-surface border border-theme rounded-2xl p-6 text-center">
                <p className="text-secondary text-sm">No pending reply drafts</p>
                <p className="text-xs text-secondary mt-1">Enable the agent above — first drafts will appear within 2 hours.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map(draft => (
                  <div key={draft.id} className="bg-surface border border-theme rounded-2xl p-4">
                    {/* Mention */}
                    <div className="mb-3 pb-3 border-b border-theme">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-secondary uppercase">{draft.platform}</span>
                        <span className="text-xs text-secondary">·</span>
                        <span className="text-xs font-semibold text-primary">{draft.mention_author}</span>
                        {draft.mention_url && (
                          <a href={draft.mention_url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-500 hover:underline ml-auto">View →</a>
                        )}
                      </div>
                      <p className="text-sm text-secondary italic">"{draft.mention_text}"</p>
                    </div>

                    {/* Suggested reply */}
                    <p className="text-xs font-bold text-secondary mb-1">Suggested reply</p>
                    {editId === draft.id ? (
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        className="w-full bg-background border border-amber-400 rounded-xl px-3 py-2 text-sm text-primary focus:outline-none resize-none mb-3"
                      />
                    ) : (
                      <p className="text-sm text-primary mb-3">{draft.suggested_reply}</p>
                    )}

                    <div className="flex gap-2">
                      {editId === draft.id ? (
                        <>
                          <button
                            onClick={() => sendReply(draft)}
                            disabled={sending === draft.id}
                            className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-2 rounded-xl text-xs"
                          >
                            {sending === draft.id ? 'Sending…' : 'Send Edited Reply'}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-3 py-2 rounded-xl text-xs border border-theme text-secondary hover:text-primary"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => sendReply(draft)}
                            disabled={sending === draft.id}
                            className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-2 rounded-xl text-xs"
                          >
                            {sending === draft.id ? 'Sending…' : 'Send Reply'}
                          </button>
                          <button
                            onClick={() => { setEditId(draft.id); setEditText(draft.suggested_reply) }}
                            className="px-3 py-2 rounded-xl text-xs border border-theme text-secondary hover:text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => dismiss(draft.id)}
                            className="px-3 py-2 rounded-xl text-xs border border-theme text-secondary hover:text-red-400"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  )
}

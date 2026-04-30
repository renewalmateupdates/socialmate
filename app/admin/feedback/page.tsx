'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FeedbackItem {
  id: string
  user_id: string | null
  email: string | null
  type: string
  message: string
  created_at: string
  replied_at: string | null
  reply_message: string | null
}

type TypeFilter   = 'all' | 'bug' | 'feature' | 'general'
type StatusFilter = 'all' | 'new' | 'reviewed' | 'resolved'

const TYPE_BADGE: Record<string, string> = {
  bug:     'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  feature: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  general: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [noTable, setNoTable] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<FeedbackItem | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/feedback')
      if (res.status === 403) { setForbidden(true); return }
      if (!res.ok) { setNoTable(true); return }
      const json = await res.json()
      if (json.error && json.error.toLowerCase().includes('does not exist')) {
        setNoTable(true); return
      }
      setFeedback(json.feedback || [])
    } catch {
      setNoTable(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleReply() {
    if (!selected || !replyMessage.trim()) return
    setReplyLoading(true)
    try {
      const res = await fetch('/api/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_id: selected.id, reply_message: replyMessage.trim() }),
      })
      if (res.ok) {
        setReplySuccess(true)
        setReplyMessage('')
        showToast('Reply sent!')
        await load()
      } else {
        showToast('Failed to send reply', false)
      }
    } finally {
      setReplyLoading(false)
    }
  }

  const filtered = feedback.filter(item => {
    const matchType   = typeFilter   === 'all' || item.type === typeFilter
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'resolved' && !!item.replied_at)
      || (statusFilter === 'new'      && !item.replied_at)
      || (statusFilter === 'reviewed' && !item.replied_at) // placeholder — same as "new" until a reviewed flag exists
    return matchType && matchStatus
  })

  const unreplied = feedback.filter(f => !f.replied_at).length
  const typeCounts: Record<string, number> = {}
  for (const f of feedback) { typeCounts[f.type] = (typeCounts[f.type] || 0) + 1 }

  if (forbidden) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Access denied</p>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-black dark:hover:text-white mt-4 transition-colors">← Dashboard</button>
      </div>
    </div>
  )

  if (noTable) return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback</h1>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>
        <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">No feedback yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-sm mx-auto">
            To start collecting feedback, add a feedback button to your app that calls the{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">/api/feedback</code>{' '}
            POST endpoint.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left max-w-sm mx-auto">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payload shape</div>
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">{`POST /api/feedback
{
  "type": "bug" | "feature" | "general",
  "message": "Your message here"
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {loading ? 'Loading…' : `${feedback.length} total · ${unreplied} unreplied`}
            </p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {/* Type filter */}
          <div className="flex gap-1">
            {(['all', 'bug', 'feature', 'general'] as TypeFilter[]).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  typeFilter === t ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t !== 'all' && (
                  <span className={`ml-1.5 text-xs px-1 py-0.5 rounded-full ${typeFilter === t ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {typeCounts[t] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex gap-1">
            {(['all', 'new', 'resolved'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {s === 'new' ? 'Unreplied' : s === 'resolved' ? 'Replied' : 'All status'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading feedback…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No feedback matches these filters.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id}
                onClick={() => { setSelected(item); setReplyMessage(''); setReplySuccess(false) }}
                className={`bg-surface border border-theme rounded-2xl p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all ${item.replied_at ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[item.type] || TYPE_BADGE.general}`}>
                        {item.type}
                      </span>
                      {item.replied_at
                        ? <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Replied</span>
                        : <span className="text-xs text-orange-500 font-semibold">Unreplied</span>}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{item.message}</p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-right shrink-0">
                    <div>{item.email || 'Anonymous'}</div>
                    <div>{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Reply modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Feedback Detail</h2>
                <button onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-black dark:hover:text-white text-2xl leading-none">×</button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[selected.type] || TYPE_BADGE.general}`}>
                    {selected.type}
                  </span>
                  <span className="text-xs text-gray-400">{selected.email || 'Anonymous'}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selected.message}
                </div>
              </div>

              {selected.replied_at && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3">
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                    Previous reply · {new Date(selected.replied_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{selected.reply_message}</div>
                </div>
              )}

              {!selected.email ? (
                <div className="text-sm text-gray-400 text-center py-4">Anonymous feedback — no email to reply to.</div>
              ) : replySuccess ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">Reply sent to {selected.email}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    placeholder={`Reply to ${selected.email}…`}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
                  />
                  <button onClick={handleReply} disabled={replyLoading || !replyMessage.trim()}
                    className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                    {replyLoading ? 'Sending…' : 'Send Reply'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.ok ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

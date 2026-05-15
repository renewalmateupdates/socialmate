'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface WLRequest {
  user_id: string
  email: string
  plan: string | null
  white_label_status: string
  white_label_tier: string | null
  white_label_requested_at: string | null
  white_label_active: boolean
}

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminWhiteLabelPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<WLRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [acting, setActing] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/white-label?status=${statusFilter}`)
      if (res.status === 401 || res.status === 403) { setForbidden(true); return }
      const json = await res.json()
      if (json.error) { setError(json.error); return }
      setRequests(json.requests ?? [])
    } catch {
      setError('Failed to load white label requests.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    const label = action === 'approve' ? 'Approve' : 'Reject'
    const confirmed = window.confirm(`${label} white label for this user?`)
    if (!confirmed) return

    setActing(userId)
    try {
      const res = await fetch('/api/admin/white-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action }),
      })
      const json = await res.json()
      if (!res.ok) {
        showToast(`Error: ${json.error ?? 'Unknown error'}`)
        return
      }
      showToast(action === 'approve' ? 'Approved — user notified.' : 'Rejected — user notified + refund instructions sent.')
      setRequests(prev => prev.filter(r => r.user_id !== userId))
    } catch {
      showToast('Network error. Try again.')
    } finally {
      setActing(null)
    }
  }

  if (forbidden) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Access denied</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">Admin access required</p>
        <button onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">White Label Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Review and approve White Label subscriptions before they activate.
            </p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            Admin Hub
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['pending', 'active', 'rejected', 'all'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                statusFilter === s
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        ) : requests.length === 0 ? (
          <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No {statusFilter} requests</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All clear.</p>
          </div>
        ) : (
          <>
            {/* Table — desktop */}
            <div className="hidden md:block bg-surface border border-theme rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-theme bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">WL Tier</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Requested</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r, i) => (
                      <tr key={r.user_id}
                        className={`transition-colors ${i < requests.length - 1 ? 'border-b border-theme' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/40`}>
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[240px]">{r.email}</div>
                          <code className="text-xs text-gray-400 font-mono">{r.user_id.slice(0, 8)}…</code>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">{r.plan || 'free'}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">{r.white_label_tier || '—'}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[r.white_label_status] || 'bg-gray-100 text-gray-500'}`}>
                            {r.white_label_status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(r.white_label_requested_at)}
                        </td>
                        <td className="px-5 py-3">
                          {r.white_label_status === 'pending' && (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleAction(r.user_id, 'approve')}
                                disabled={acting === r.user_id}
                                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[36px]">
                                {acting === r.user_id ? '…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleAction(r.user_id, 'reject')}
                                disabled={acting === r.user_id}
                                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[36px]">
                                {acting === r.user_id ? '…' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden space-y-3">
              {requests.map(r => (
                <div key={r.user_id} className="bg-surface border border-theme rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{r.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="capitalize">{r.plan || 'free'}</span>
                        {r.white_label_tier && <span> · WL {r.white_label_tier}</span>}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_BADGE[r.white_label_status] || 'bg-gray-100 text-gray-500'}`}>
                      {r.white_label_status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{formatDate(r.white_label_requested_at)}</p>
                  {r.white_label_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r.user_id, 'approve')}
                        disabled={acting === r.user_id}
                        className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]">
                        {acting === r.user_id ? '…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(r.user_id, 'reject')}
                        disabled={acting === r.user_id}
                        className="flex-1 text-sm font-semibold py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]">
                        {acting === r.user_id ? '…' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl z-50 max-w-sm"
          style={{ bottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  user_id: string
  status: string
  full_name: string
  website_url: string
  platforms: string[]
  audience_size: string
  promotion_plan: string
  why_good_fit: string
  applied_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  active_referral_count: number
  total_earnings: number
}

const STATUS_BADGE: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-700',
  active:         'bg-green-100 text-green-700',
  rejected:       'bg-red-100 text-red-600',
  inactive:       'bg-gray-100 text-gray-500',
  suspended:      'bg-orange-100 text-orange-600',
}

export default function AdminAffiliatesClient() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Application | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'active' | 'rejected'>('pending_review')

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/stats?admin=true')
      const json = await res.json()
      if (json.forbidden) {
        router.push('/dashboard')
        return
      }
      setApplications(json.applications || [])
    } catch {
      console.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: 'approve' | 'reject') {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/affiliate/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: selected.id,
          action,
          rejection_reason: rejectionReason || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSelected(null)
        setRejectionReason('')
        await fetchApplications()
      }
    } catch {
      console.error('Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter)

  const counts = {
    all: applications.length,
    pending_review: applications.filter(a => a.status === 'pending_review').length,
    active: applications.filter(a => a.status === 'active').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-theme p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Applications</h1>
            <p className="text-gray-500 text-sm mt-1">Review and manage affiliate program applicants</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-black transition-all">
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(['pending_review', 'active', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}>
              {f === 'pending_review' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No {filter === 'pending_review' ? 'pending' : filter} applications.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-gray-300 transition-all"
                onClick={() => setSelected(app)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{app.full_name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[app.status]}`}>
                        {app.status === 'pending_review' ? 'Pending Review' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-0.5">
                      {app.website_url && <div>🌐 {app.website_url}</div>}
                      {app.platforms?.length > 0 && <div>📱 {app.platforms.join(', ')}</div>}
                      {app.audience_size && <div>👥 Audience: {app.audience_size}</div>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    <div>Applied {new Date(app.applied_at).toLocaleDateString()}</div>
                    {app.status === 'active' && (
                      <div className="mt-1 text-green-600 font-semibold">
                        {app.active_referral_count} referrals · ${(app.total_earnings ?? 0).toFixed(2)} earned
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">{selected.full_name}</h2>
                  <button onClick={() => { setSelected(null); setRejectionReason('') }}
                    className="text-gray-400 hover:text-black text-xl leading-none">×</button>
                </div>

                <div className="space-y-4 text-sm">
                  {selected.website_url && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Website</div>
                      <a href={selected.website_url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:underline">{selected.website_url}</a>
                    </div>
                  )}

                  {selected.platforms?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Platforms</div>
                      <div className="flex flex-wrap gap-2">
                        {selected.platforms.map(p => (
                          <span key={p} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.audience_size && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Audience Size</div>
                      <div className="text-gray-700">{selected.audience_size}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Promotion Plan</div>
                    <div className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">{selected.promotion_plan}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Why They're a Good Fit</div>
                    <div className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">{selected.why_good_fit}</div>
                  </div>

                  {selected.status === 'rejected' && selected.rejection_reason && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <div className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Rejection Reason</div>
                      <div className="text-red-700 text-sm">{selected.rejection_reason}</div>
                    </div>
                  )}
                </div>

                {selected.status === 'pending_review' && (
                  <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                    <textarea
                      placeholder="Rejection reason (optional — only needed if rejecting)"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction('approve')}
                        disabled={actionLoading}
                        className="flex-1 bg-black text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                        {actionLoading ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading}
                        className="flex-1 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition-all disabled:opacity-60">
                        {actionLoading ? 'Processing...' : '✕ Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
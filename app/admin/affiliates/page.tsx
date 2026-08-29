'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AffiliateRow {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  referral_code: string | null
  status: string
  commission_rate: number
  active_referral_count: number
  total_earnings: number
  applied_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  meets_minimum: boolean
  auto_rejected: boolean
  can_reapply_at: string | null
  website_url: string | null
  platforms: string[]
  audience_size: string | null
  content_type: string | null
  social_handles: string | null
  monthly_reach: string | null
  engagement_rate: string | null
  promotion_plan: string
  why_good_fit: string
}

type AffiliateAction = 'approve' | 'reject' | 'suspend' | 'reactivate'

const STATUS_BADGE: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:       'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  inactive:       'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  suspended:      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function AdminAffiliatesPage() {
  const router = useRouter()
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'active' | 'suspended' | 'rejected'>('pending_review')
  const [selected, setSelected] = useState<AffiliateRow | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/stats?admin=true')
      if (res.status === 403) { setForbidden(true); return }
      const json = await res.json()
      if (json.forbidden) { setForbidden(true); return }
      setAffiliates(json.applications || [])
    } catch {
      console.error('Failed to load affiliates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const ACTION_TOAST: Record<AffiliateAction, string> = {
    approve:    'Approved',
    reject:     'Rejected',
    suspend:    'Suspended — referral link and commissions are off',
    reactivate: 'Reactivated',
  }

  async function handleAction(action: AffiliateAction) {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/affiliate/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliate_id: selected.id, action, rejection_reason: rejectionReason || null }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(ACTION_TOAST[action])
        setSelected(null); setRejectionReason('')
        await load()
      } else {
        showToast(json.error || 'Action failed', false)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = filter === 'all' ? affiliates : affiliates.filter(a => a.status === filter)
  const counts = {
    all: affiliates.length,
    pending_review: affiliates.filter(a => a.status === 'pending_review').length,
    active: affiliates.filter(a => a.status === 'active').length,
    suspended: affiliates.filter(a => a.status === 'suspended').length,
    rejected: affiliates.filter(a => a.status === 'rejected').length,
  }

  if (forbidden) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Access denied</p>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-black dark:hover:text-white mt-4 transition-colors">← Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Affiliates</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Applications and access. Payouts live in{' '}
              <a href="/admin/partners" className="underline hover:text-gray-700 dark:hover:text-gray-200">Partners</a>.
            </p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['pending_review', 'active', 'suspended', 'rejected', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}>
              {f === 'pending_review' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No {filter === 'pending_review' ? 'pending' : filter} affiliates.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(aff => (
              <div key={aff.id}
                className="bg-surface border border-theme rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setSelected(aff); setRejectionReason('') }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{aff.full_name || aff.email || 'Unknown'}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[aff.status] || ''}`}>
                        {aff.status === 'pending_review' ? 'Pending' : aff.status.charAt(0).toUpperCase() + aff.status.slice(1)}
                      </span>
                      {aff.status === 'pending_review' && aff.meets_minimum && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">✓ Meets min.</span>
                      )}
                      {aff.auto_rejected && <span className="text-xs text-gray-400 italic">auto-rejected</span>}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                      {aff.email && <div>{aff.email}</div>}
                      {aff.referral_code && <div>Code: <span className="font-mono">{aff.referral_code}</span></div>}
                      {aff.website_url && <div>{aff.website_url}</div>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <div className="text-xs text-gray-400">Applied {new Date(aff.applied_at).toLocaleDateString()}</div>
                    {aff.status === 'active' && (
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {aff.active_referral_count} refs · ${(aff.total_earnings ?? 0).toFixed(2)} earned
                      </div>
                    )}
                    {aff.status === 'suspended' && (
                      <div className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        Referral link off
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selected.full_name || selected.email}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[selected.status] || ''}`}>
                      {selected.status === 'pending_review' ? 'Pending Review' : selected.status}
                    </span>
                    {selected.meets_minimum && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">✓ Meets minimum</span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setSelected(null); setRejectionReason('') }}
                  className="text-gray-400 hover:text-black dark:hover:text-white text-2xl leading-none ml-4">×</button>
              </div>

              <div className="space-y-4 text-sm">
                {selected.email && <InfoRow label="Email">{selected.email}</InfoRow>}
                {selected.referral_code && <InfoRow label="Referral code"><code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">{selected.referral_code}</code></InfoRow>}
                {selected.website_url && (
                  <InfoRow label="Website">
                    <a href={selected.website_url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selected.website_url}</a>
                  </InfoRow>
                )}
                {selected.social_handles && <InfoRow label="Social handles">{selected.social_handles}</InfoRow>}
                {selected.platforms?.length > 0 && (
                  <InfoRow label="Platforms">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.platforms.map(p => (
                        <span key={p} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-lg">{p}</span>
                      ))}
                    </div>
                  </InfoRow>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {selected.audience_size    && <InfoRow label="Audience">{selected.audience_size}</InfoRow>}
                  {selected.monthly_reach    && <InfoRow label="Monthly reach">{selected.monthly_reach}</InfoRow>}
                  {selected.engagement_rate  && <InfoRow label="Engagement">{selected.engagement_rate}</InfoRow>}
                  {selected.content_type     && <InfoRow label="Content type">{selected.content_type}</InfoRow>}
                </div>
                <InfoRow label="Promotion plan">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">{selected.promotion_plan}</div>
                </InfoRow>
                <InfoRow label="Why good fit">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">{selected.why_good_fit}</div>
                </InfoRow>
                {selected.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">
                      {selected.status === 'suspended' ? 'Suspension reason' : 'Rejection reason'}
                    </div>
                    <div className="text-red-700 dark:text-red-400">{selected.rejection_reason}</div>
                  </div>
                )}
              </div>

              {selected.status === 'pending_review' && (
                <div className="mt-6 space-y-3 border-t border-theme pt-5">
                  <textarea
                    placeholder="Rejection reason (optional)"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleAction('approve')} disabled={actionLoading}
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                      {actionLoading ? 'Processing…' : '✓ Approve'}
                    </button>
                    <button onClick={() => handleAction('reject')} disabled={actionLoading}
                      className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition-all disabled:opacity-60">
                      {actionLoading ? 'Processing…' : '✕ Reject'}
                    </button>
                  </div>
                </div>
              )}
              {(selected.status === 'active' || selected.status === 'suspended') && (
                <div className="mt-6 space-y-3 border-t border-theme pt-5">
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{selected.active_referral_count} referrals</span>
                    <span>${(selected.total_earnings ?? 0).toFixed(2)} total earned</span>
                  </div>

                  {selected.status === 'active' ? (
                    <>
                      <textarea
                        placeholder="Reason for suspending (optional, internal only)"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
                      />
                      <button onClick={() => handleAction('suspend')} disabled={actionLoading}
                        className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all disabled:opacity-60">
                        {actionLoading ? 'Processing…' : 'Suspend affiliate'}
                      </button>
                      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                        Stops their referral link, blocks new commissions, and removes them
                        from the partner leaderboard. Earnings already accrued are kept —
                        settle those in{' '}
                        <a href="/admin/partners" className="underline hover:text-gray-600 dark:hover:text-gray-300">
                          Partners
                        </a>. No email is sent.
                      </p>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAction('reactivate')} disabled={actionLoading}
                        className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                        {actionLoading ? 'Processing…' : 'Reactivate affiliate'}
                      </button>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Turns their referral link and commission accrual back on.
                      </p>
                    </>
                  )}
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

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )
}

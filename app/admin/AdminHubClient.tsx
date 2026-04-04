'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  user_id: string
  status: string
  full_name: string
  website_url: string | null
  platforms: string[]
  audience_size: string | null
  promotion_plan: string
  why_good_fit: string
  applied_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  active_referral_count: number
  total_earnings: number
  content_type: string | null
  social_handles: string | null
  monthly_reach: string | null
  engagement_rate: string | null
  meets_minimum: boolean
  can_reapply_at: string | null
  auto_rejected: boolean
}

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

type Tab = 'overview' | 'affiliates' | 'feedback'

const STATUS_BADGE: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:       'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  inactive:       'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  suspended:      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function AdminHubClient() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  // Affiliates state
  const [selected, setSelected] = useState<Application | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [appFilter, setAppFilter] = useState<'all' | 'pending_review' | 'active' | 'rejected'>('pending_review')

  // Feedback state
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [appsRes, feedbackRes] = await Promise.all([
        fetch('/api/affiliate/stats?admin=true'),
        fetch('/api/feedback'),
      ])
      const appsJson = await appsRes.json()
      if (appsJson.forbidden) return  // stay on page, don't redirect admin out
      setApplications(appsJson.applications || [])
      if (feedbackRes.ok) {
        const fJson = await feedbackRes.json()
        setFeedback(fJson.feedback || [])
      }
    } catch {
      console.error('Failed to load admin data')
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
        body: JSON.stringify({ affiliate_id: selected.id, action, rejection_reason: rejectionReason || null }),
      })
      const json = await res.json()
      if (json.success) { setSelected(null); setRejectionReason(''); await loadAll() }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReply() {
    if (!selectedFeedback || !replyMessage.trim()) return
    setReplyLoading(true)
    try {
      const res = await fetch('/api/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_id: selectedFeedback.id, reply_message: replyMessage.trim() }),
      })
      if (res.ok) { setReplySuccess(true); setReplyMessage(''); await loadAll() }
    } finally {
      setReplyLoading(false)
    }
  }

  const pendingCount     = applications.filter(a => a.status === 'pending_review').length
  const activeCount      = applications.filter(a => a.status === 'active').length
  const meetsMinCount    = applications.filter(a => a.status === 'pending_review' && a.meets_minimum).length
  const unreplied        = feedback.filter(f => !f.replied_at).length
  const filteredApps     = appFilter === 'all' ? applications : applications.filter(a => a.status === appFilter)
  const appCounts = {
    all: applications.length,
    pending_review: pendingCount,
    active: activeCount,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  if (loading) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading admin hub...</div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Hub</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">SocialMate control panel</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/partners" className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Partners portal →
            </a>
            <button onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface border border-theme rounded-xl p-1 w-fit">
          {([
            { key: 'overview',   label: 'Overview' },
            { key: 'affiliates', label: `Affiliates${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
            { key: 'feedback',   label: `Feedback${unreplied > 0 ? ` (${unreplied})` : ''}` },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending Review',    value: pendingCount,  color: 'text-yellow-600 dark:text-yellow-400', sub: pendingCount > 0 ? 'Needs action' : 'All clear'    },
                { label: 'Meets Minimum',     value: meetsMinCount, color: 'text-green-600 dark:text-green-400',  sub: 'Ready to approve'                                   },
                { label: 'Active Affiliates', value: activeCount,   color: 'text-blue-600 dark:text-blue-400',    sub: 'Earning commissions'                                },
                { label: 'Unreplied',         value: unreplied,     color: 'text-purple-600 dark:text-purple-400', sub: unreplied > 0 ? 'Needs reply' : 'All caught up'    },
              ].map((c, i) => (
                <div key={i} className="bg-surface border border-theme rounded-2xl p-5">
                  <div className={`text-3xl font-black mb-1 ${c.color}`}>{c.value}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{c.label}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setTab('affiliates')}
                className="bg-surface border border-theme rounded-2xl p-5 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Review Applications</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{pendingCount} pending · {meetsMinCount} meet minimum requirements</div>
              </button>
              <button onClick={() => setTab('feedback')}
                className="bg-surface border border-theme rounded-2xl p-5 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">User Feedback</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{feedback.length} total · {unreplied} unreplied</div>
              </button>
              <a href="/admin/partners"
                className="bg-surface border border-theme rounded-2xl p-5 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all block">
                <div className="text-2xl mb-2">🎬</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Partners + Studio Stax</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Listings, payouts, revenue</div>
              </a>
            </div>
          </div>
        )}

        {/* ── AFFILIATES ── */}
        {tab === 'affiliates' && (
          <>
            <div className="flex gap-2 mb-5 flex-wrap">
              {(['pending_review', 'active', 'rejected', 'all'] as const).map(f => (
                <button key={f} onClick={() => setAppFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    appFilter === f ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}>
                  {f === 'pending_review' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${appFilter === f ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    {appCounts[f]}
                  </span>
                </button>
              ))}
            </div>
            {filteredApps.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-sm">No {appFilter === 'pending_review' ? 'pending' : appFilter} applications.</div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map(app => (
                  <div key={app.id} onClick={() => { setSelected(app); setRejectionReason('') }}
                    className="bg-surface rounded-2xl border border-theme p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">{app.full_name}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-500'}`}>
                            {app.status === 'pending_review' ? 'Pending' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          {app.status === 'pending_review' && app.meets_minimum && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">✓ Meets min.</span>
                          )}
                          {app.status === 'pending_review' && !app.meets_minimum && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">Below min.</span>
                          )}
                          {app.auto_rejected && (
                            <span className="text-xs text-gray-400 italic">auto-rejected</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                          {app.website_url && <div>🌐 {app.website_url}</div>}
                          {app.social_handles && <div>📲 {app.social_handles}</div>}
                          {app.platforms?.length > 0 && <div>📱 {app.platforms.join(', ')}</div>}
                          {app.audience_size && <span className="mr-3">👥 {app.audience_size}</span>}
                          {app.content_type && <span>🎯 {app.content_type}</span>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 text-right shrink-0">
                        <div>{new Date(app.applied_at).toLocaleDateString()}</div>
                        {app.status === 'active' && (
                          <div className="mt-1 text-green-600 dark:text-green-400 font-semibold">{app.active_referral_count} refs · ${(app.total_earnings ?? 0).toFixed(2)}</div>
                        )}
                        {app.can_reapply_at && (
                          <div className="mt-1 text-orange-500">Reapply: {new Date(app.can_reapply_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FEEDBACK ── */}
        {tab === 'feedback' && (
          <div className="space-y-3">
            {feedback.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-sm">No feedback yet.</div>
            ) : feedback.map(item => (
              <div key={item.id}
                onClick={() => { setSelectedFeedback(item); setReplyMessage(''); setReplySuccess(false) }}
                className={`bg-surface rounded-2xl border shadow-sm p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all ${item.replied_at ? 'border-theme opacity-60' : 'border-theme'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{item.type}</span>
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

      {/* ── Affiliate Review Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selected.full_name}</h2>
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
                {selected.website_url && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Website</div>
                    <a href={selected.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selected.website_url}</a>
                  </div>
                )}
                {selected.social_handles && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Social Handles</div>
                    <div className="text-gray-700 dark:text-gray-300">{selected.social_handles}</div>
                  </div>
                )}
                {selected.platforms?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Platforms</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.platforms.map(p => (
                        <span key={p} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-lg">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {selected.audience_size && <div><div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Audience Size</div><div className="text-gray-700 dark:text-gray-300">{selected.audience_size}</div></div>}
                  {selected.monthly_reach && <div><div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Monthly Reach</div><div className="text-gray-700 dark:text-gray-300">{selected.monthly_reach}</div></div>}
                  {selected.engagement_rate && <div><div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Engagement Rate</div><div className="text-gray-700 dark:text-gray-300">{selected.engagement_rate}</div></div>}
                  {selected.content_type && <div><div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Content Type</div><div className="text-gray-700 dark:text-gray-300">{selected.content_type}</div></div>}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Promotion Plan</div>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-3">{selected.promotion_plan}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Why They're a Good Fit</div>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-3">{selected.why_good_fit}</div>
                </div>
                {selected.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Rejection Reason</div>
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
                      {actionLoading ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button onClick={() => handleAction('reject')} disabled={actionLoading}
                      className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition-all disabled:opacity-60">
                      {actionLoading ? 'Processing...' : '✕ Reject'}
                    </button>
                  </div>
                </div>
              )}
              {selected.status === 'active' && (
                <div className="mt-4 pt-4 border-t border-theme flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{selected.active_referral_count} active referrals</span>
                  <span>${(selected.total_earnings ?? 0).toFixed(2)} earned</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback Reply Modal ── */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Reply to Feedback</h2>
                <button onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-black dark:hover:text-white text-2xl leading-none">×</button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{selectedFeedback.type}</span>
                  <span className="text-xs text-gray-400">{selectedFeedback.email || 'Anonymous'}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedFeedback.message}
                </div>
              </div>

              {selectedFeedback.replied_at && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3">
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Previous Reply</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{selectedFeedback.reply_message}</div>
                </div>
              )}

              {!selectedFeedback.email ? (
                <div className="text-sm text-gray-400 text-center py-4">Anonymous feedback — no email address to reply to.</div>
              ) : replySuccess ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">Reply sent to {selectedFeedback.email}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    placeholder={`Reply to ${selectedFeedback.email}...`}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
                  />
                  <button onClick={handleReply} disabled={replyLoading || !replyMessage.trim()}
                    className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                    {replyLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

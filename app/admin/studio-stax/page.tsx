'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Listing {
  id: string
  name: string
  tagline: string | null
  url: string | null
  category: string | null
  status: string
  applicant_name: string | null
  applicant_email: string | null
  mission_statement: string | null
  why_apply: string | null
  smgive_donated_cents: number
  admin_notes: string | null
  admin_featured: boolean
  admin_featured_note: string | null
  created_at: string
  checkout_token: string | null
  checkout_token_expires: string | null
  plan_tier: string | null
  renewal_date: string | null
  rank: number | null
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  active:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  rejected:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  expired:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const ALL_STATUSES = ['all', 'pending', 'approved', 'active', 'suspended', 'expired', 'rejected'] as const
type StatusFilter = typeof ALL_STATUSES[number]

export default function AdminStudioStaxPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<Listing | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/listings/admin')
      if (res.status === 403) { setForbidden(true); return }
      const json = await res.json()
      setListings(json.listings || [])
    } catch {
      console.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(id: string, status: string, notes?: string) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/listings/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, admin_notes: notes || null }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(`Listing ${status}`)
        setSelected(null)
        await load()
      } else {
        showToast(json.error || 'Action failed', false)
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendPaymentLink(id: string, notes?: string) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/listings/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'send_payment_link', admin_notes: notes || null }),
      })
      const json = await res.json()
      if (json.success) {
        showToast('Payment link sent!')
        setSelected(null)
        await load()
      } else {
        showToast(json.error || 'Failed to send link', false)
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleToggleFeatured(id: string, currentlyFeatured: boolean, note?: string) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/listings/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          admin_featured: !currentlyFeatured,
          admin_featured_note: note || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(currentlyFeatured ? 'Removed from featured' : '⭐ Marked as featured')
        setSelected(null)
        await load()
      } else {
        showToast(json.error || 'Action failed', false)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const featuredCount = listings.filter(l => l.admin_featured).length
  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter)

  const statusCounts: Record<string, number> = {}
  for (const l of listings) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1
  }

  // Revenue: active listings — rough estimate based on known tier pricing
  const activeCount = listings.filter(l => l.status === 'active').length
  const totalSmGiveCents = listings.reduce((sum, l) => sum + (l.smgive_donated_cents || 0), 0)

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
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Studio Stax</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage all listings in the directory</p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">{activeCount}</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active listings</div>
            <div className="text-xs text-gray-400 mt-0.5">Live in directory</div>
          </div>
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-1">{statusCounts['pending'] || 0}</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pending review</div>
            <div className="text-xs text-gray-400 mt-0.5">Awaiting decision</div>
          </div>
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
              ${(totalSmGiveCents / 100).toFixed(0)}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total SM-Give</div>
            <div className="text-xs text-gray-400 mt-0.5">Donated across all listings</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">
              {featuredCount} <span className="text-lg">/ 5</span>
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">⭐ Editor's Picks</div>
            <div className="text-xs text-gray-400 mt-0.5">Always rank first</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {statusCounts[s] || 0}
                </span>
              )}
              {s === 'all' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {listings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading listings…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No {filter !== 'all' ? filter : ''} listings.</div>
        ) : (
          <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Studio</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Featured</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">SM-Give</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Renewal</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Applied</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((listing, i) => (
                    <tr key={listing.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${i < filtered.length - 1 ? 'border-b border-theme' : ''}`}>
                      <td className="px-5 py-3 cursor-pointer" onClick={() => { setSelected(listing); setAdminNotes(listing.admin_notes || '') }}>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{listing.name}</div>
                        {listing.tagline && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{listing.tagline}</div>}
                        {listing.applicant_email && <div className="text-xs text-gray-400">{listing.applicant_email}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[listing.status] || ''}`}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleFeatured(listing.id, listing.admin_featured)}
                          disabled={actionLoading || (!listing.admin_featured && featuredCount >= 5)}
                          title={!listing.admin_featured && featuredCount >= 5 ? 'Max 5 featured slots' : ''}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-all disabled:opacity-40 ${
                            listing.admin_featured
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-amber-300 hover:text-amber-600'
                          }`}>
                          {listing.admin_featured ? '⭐ Featured' : '☆ Pin'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        {listing.smgive_donated_cents > 0 ? `$${(listing.smgive_donated_cents / 100).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {listing.renewal_date ? new Date(listing.renewal_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {listing.status === 'pending' && (
                            <button
                              onClick={() => { setSelected(listing); setAdminNotes(listing.admin_notes || '') }}
                              className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-all">
                              Review
                            </button>
                          )}
                          {listing.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(listing.id, 'suspended')}
                              disabled={actionLoading}
                              className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-lg font-semibold hover:bg-orange-200 transition-colors disabled:opacity-60">
                              Suspend
                            </button>
                          )}
                          {listing.status === 'suspended' && (
                            <button
                              onClick={() => handleStatusChange(listing.id, 'active')}
                              disabled={actionLoading}
                              className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1 rounded-lg font-semibold hover:bg-green-200 transition-colors disabled:opacity-60">
                              Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Listing detail / review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[selected.status] || ''}`}>
                      {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                    </span>
                    {selected.category && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{selected.category}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-black dark:hover:text-white text-2xl leading-none ml-4">×</button>
              </div>

              <div className="space-y-4 text-sm">
                {selected.tagline && <ListingRow label="Tagline">{selected.tagline}</ListingRow>}
                {selected.url && (
                  <ListingRow label="URL">
                    <a href={selected.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selected.url}</a>
                  </ListingRow>
                )}
                {selected.applicant_name && <ListingRow label="Applicant">{selected.applicant_name}</ListingRow>}
                {selected.applicant_email && <ListingRow label="Email">{selected.applicant_email}</ListingRow>}
                {selected.mission_statement && (
                  <ListingRow label="Mission">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">{selected.mission_statement}</div>
                  </ListingRow>
                )}
                {selected.why_apply && (
                  <ListingRow label="Why apply">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">{selected.why_apply}</div>
                  </ListingRow>
                )}
                <ListingRow label="SM-Give donated">
                  ${(selected.smgive_donated_cents / 100).toFixed(2)}
                </ListingRow>
                {selected.renewal_date && (
                  <ListingRow label="Renewal date">{new Date(selected.renewal_date).toLocaleDateString()}</ListingRow>
                )}

                {/* Editor's Pick toggle */}
                {selected.status === 'active' && (
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    selected.admin_featured
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">⭐ Editor's Pick</p>
                      <p className="text-xs text-gray-400 mt-0.5">Pinned listings always rank first ({featuredCount}/5 slots used)</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(selected.id, selected.admin_featured, adminNotes)}
                      disabled={actionLoading || (!selected.admin_featured && featuredCount >= 5)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40 ${
                        selected.admin_featured
                          ? 'bg-amber-500 text-white hover:opacity-80'
                          : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                      }`}>
                      {selected.admin_featured ? 'Unpin' : 'Pin as featured'}
                    </button>
                  </div>
                )}

                {/* Admin notes */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Admin notes</div>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Internal notes (optional)"
                    rows={2}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-2 border-t border-theme pt-5">
                {selected.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleSendPaymentLink(selected.id, adminNotes)}
                      disabled={actionLoading}
                      className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                      {actionLoading ? 'Processing…' : '✓ Approve + Send payment link'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id, 'rejected', adminNotes)}
                      disabled={actionLoading}
                      className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition-all disabled:opacity-60">
                      {actionLoading ? 'Processing…' : '✕ Reject'}
                    </button>
                  </>
                )}
                {selected.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(selected.id, 'suspended', adminNotes)}
                    disabled={actionLoading}
                    className="w-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-orange-100 transition-all disabled:opacity-60">
                    {actionLoading ? 'Processing…' : 'Suspend listing'}
                  </button>
                )}
                {selected.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(selected.id, 'active', adminNotes)}
                    disabled={actionLoading}
                    className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-green-100 transition-all disabled:opacity-60">
                    {actionLoading ? 'Processing…' : 'Reinstate listing'}
                  </button>
                )}
                {/* Save notes only */}
                {!['pending', 'active', 'suspended'].includes(selected.status) && (
                  <button
                    onClick={() => handleStatusChange(selected.id, selected.status, adminNotes)}
                    disabled={actionLoading}
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-60">
                    {actionLoading ? 'Saving…' : 'Save notes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.ok ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function ListingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  )
}

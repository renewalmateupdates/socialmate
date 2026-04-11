'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AffiliateProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  status: string
  commission_rate: number
  active_referral_count: number
  total_earnings_cents: number
  available_balance_cents: number
  paid_out_cents: number
  lifetime_earnings_cents: number
  w9_required: boolean
  w9_submitted: boolean
  onboarding_completed: boolean
  created_at: string
  notes: string | null
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  terminated:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500',
}

function cents(n: number) { return `$${(n / 100).toFixed(2)}` }

export default function AdminAffiliatesClient() {
  const router = useRouter()
  const [affiliates, setAffiliates]   = useState<AffiliateProfile[]>([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<AffiliateProfile | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes]             = useState('')
  const [filter, setFilter]           = useState<'all' | 'pending' | 'active' | 'suspended'>('pending')
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/partners/stats?admin=true')
      if (res.status === 403) { router.push('/dashboard'); return }
      const json = await res.json()
      setAffiliates(json.affiliates ?? [])
    } catch {
      console.error('Failed to load affiliates')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(true)
    const res = await fetch('/api/partners/stats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes }),
    })
    const json = await res.json()
    if (json.success) {
      showToast(`Status updated to ${status}`)
      setSelected(null)
      setNotes('')
      await load()
    } else {
      showToast(json.error || 'Failed to update', false)
    }
    setActionLoading(false)
  }

  async function generatePromos(affiliate: AffiliateProfile) {
    setActionLoading(true)
    const emailBase = affiliate.email.split('@')[0]
    const res = await fetch('/api/partners/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_all_promos',
        affiliate_id: affiliate.id,
        email_prefix: emailBase,
      }),
    })
    const json = await res.json()
    showToast(json.success ? `Created ${json.created} codes (${json.skipped} skipped)` : json.error, json.success)
    setActionLoading(false)
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    const res = await fetch('/api/partners/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    })
    const json = await res.json()
    if (res.ok) {
      showToast(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
    } else {
      showToast(json.error || 'Failed', false)
    }
    setInviteLoading(false)
  }

  const filtered = filter === 'all' ? affiliates : affiliates.filter(a => a.status === filter)
  const counts = {
    all:       affiliates.length,
    pending:   affiliates.filter(a => a.status === 'pending').length,
    active:    affiliates.filter(a => a.status === 'active').length,
    suspended: affiliates.filter(a => a.status === 'suspended').length,
  }

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Affiliates</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Applications, payouts, and commissions</p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Quick invite */}
        <div className="bg-surface border border-theme rounded-2xl p-5 mb-6 flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Quick Invite</label>
            <input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendInvite()}
              placeholder="creator@example.com"
              type="email"
              className="w-full px-3 py-2 rounded-xl border border-theme bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <button
            onClick={sendInvite}
            disabled={inviteLoading || !inviteEmail.trim()}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition disabled:opacity-40"
          >
            {inviteLoading ? 'Sending...' : 'Send Invite'}
          </button>
          <p className="w-full text-xs text-gray-400 -mt-1">
            Or use <a href="/admin/invites" className="underline">Admin → Invites & VIP</a> for Studio Stax invites and VIP codes.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['pending', 'active', 'suspended', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-surface text-gray-500 dark:text-gray-400 border border-theme hover:border-gray-400'
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No {filter === 'all' ? '' : filter} affiliates.
            {filter === 'pending' && <p className="mt-2 text-xs text-gray-300 dark:text-gray-600">Use Quick Invite above to bring in new partners.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a.id}
                onClick={() => { setSelected(a); setNotes(a.notes || '') }}
                className="bg-surface border border-theme rounded-2xl p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {a.full_name || a.email}
                      </span>
                      {a.full_name && (
                        <span className="text-xs text-gray-400">{a.email}</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {a.status}
                      </span>
                      {a.w9_required && !a.w9_submitted && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          W-9 needed
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 space-x-3">
                      <span>Joined {new Date(a.created_at).toLocaleDateString()}</span>
                      <span>{a.active_referral_count} referrals</span>
                      <span>{cents(a.total_earnings_cents)} earned</span>
                      <span>{cents(a.available_balance_cents)} available</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                      {a.active_referral_count >= 100 ? '40%' : '30%'} rate
                    </div>
                    <div>{cents(a.paid_out_cents)} paid out</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setNotes('') } }}>
            <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-theme">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selected.full_name || selected.email}
                  </h2>
                  <button onClick={() => { setSelected(null); setNotes('') }}
                    className="text-gray-400 hover:text-black dark:hover:text-white text-xl leading-none transition-colors">×</button>
                </div>

                <div className="space-y-3 text-sm mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Email',      value: selected.email },
                      { label: 'Status',     value: selected.status },
                      { label: 'Referrals',  value: selected.active_referral_count },
                      { label: 'Rate',       value: selected.active_referral_count >= 100 ? '40%' : '30%' },
                      { label: 'Earned',     value: cents(selected.total_earnings_cents) },
                      { label: 'Available',  value: cents(selected.available_balance_cents) },
                      { label: 'Paid Out',   value: cents(selected.paid_out_cents) },
                      { label: 'W-9',        value: selected.w9_submitted ? 'Submitted' : selected.w9_required ? '⚠️ Required' : 'Not required' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-0.5">{label}</div>
                        <div className="text-gray-800 dark:text-gray-200 font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Admin Notes</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Internal notes (not visible to affiliate)"
                      className="w-full border border-theme dark:bg-gray-900 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-theme pt-4">
                  {selected.status !== 'active' && (
                    <button onClick={() => updateStatus(selected.id, 'active')}
                      disabled={actionLoading}
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition disabled:opacity-50">
                      {actionLoading ? '...' : '✓ Activate'}
                    </button>
                  )}
                  {selected.status !== 'suspended' && (
                    <button onClick={() => updateStatus(selected.id, 'suspended')}
                      disabled={actionLoading}
                      className="flex-1 bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition disabled:opacity-50">
                      {actionLoading ? '...' : 'Suspend'}
                    </button>
                  )}
                  <button onClick={() => generatePromos(selected)}
                    disabled={actionLoading}
                    className="flex-1 bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition disabled:opacity-50">
                    {actionLoading ? '...' : '🎁 Gen Promo Codes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.ok ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  )
}

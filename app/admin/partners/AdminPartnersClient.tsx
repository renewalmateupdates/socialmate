'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ─────────────────────────────────────────────────────────────────

interface AffiliateProfile {
  id: string
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
  w9_forfeiture_deadline: string | null
  w9_funds_forfeited: boolean
  stripe_account_id: string | null
  stripe_account_status: string | null
  tos_agreed: boolean
  onboarding_completed: boolean
  notes: string | null
  created_at: string
}

interface PayoutRequest {
  id: string
  affiliate_id: string
  amount_cents: number
  status: string
  requested_at: string
  affiliate_email?: string
}

interface FeedbackItem {
  id: string
  user_id: string | null
  type: string
  message: string
  email: string | null
  created_at: string
}

interface RevenueStats {
  gross_revenue_cents: number
  total_commissions_cents: number
  net_to_joshua_cents: number
  pending_payouts_cents: number
  forfeited_cents: number
  sm_give_cents: number
}

interface ListingItem {
  id: string
  name: string
  tagline: string
  url: string
  category: string
  status: string
  applicant_name: string
  applicant_email: string
  mission_statement: string | null
  why_apply: string | null
  smgive_donated_cents: number
  admin_notes: string | null
  created_at: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function cents(n: number) { return `$${(n / 100).toFixed(2)}` }

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  active:     { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  suspended:  { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  terminated: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  requested:  { bg: 'rgba(124,58,237,0.15)', color: '#7C3AED' },
  approved:   { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  paid:       { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  rejected:   { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' }
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}

const dark    = '#0a0a0a'
const surface = '#111111'
const border  = '#222222'
const muted   = '#6b7280'
const gold    = '#F59E0B'
const purple  = '#7C3AED'

// ─── Component ─────────────────────────────────────────────────────────────

export default function AdminPartnersClient() {
  const router = useRouter()

  const [affiliates, setAffiliates]     = useState<AffiliateProfile[]>([])
  const [payouts, setPayouts]           = useState<PayoutRequest[]>([])
  const [stats, setStats]               = useState<RevenueStats | null>(null)
  const [feedback, setFeedback]         = useState<FeedbackItem[]>([])
  const [listings, setListings]         = useState<ListingItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [listingActionLoading, setListingActionLoading] = useState(false)
  const [activeTab, setActiveTab]       = useState<'affiliates' | 'payouts' | 'revenue' | 'invite' | 'feedback' | 'listings'>('affiliates')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected]         = useState<AffiliateProfile | null>(null)

  // Invite form
  const [inviteEmail, setInviteEmail]     = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult]   = useState<string | null>(null)

  // Action
  const [actionLoading, setActionLoading] = useState(false)
  const [actionNote, setActionNote]       = useState('')

  // Launch email
  const [launchEmailSending, setLaunchEmailSending] = useState(false)
  const [launchEmailResult, setLaunchEmailResult]   = useState<{ sent: number; failed: number } | null>(null)

  // Promo code gen
  const [promoCode, setPromoCode]             = useState('')
  const [promoDiscount, setPromoDiscount]     = useState('20')
  const [promoMonths, setPromoMonths]         = useState('3')
  const [promoLoading, setPromoLoading]       = useState(false)
  const [allPromosLoading, setAllPromosLoading] = useState(false)
  const [allPromosResult, setAllPromosResult] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [a, p, s, f, l] = await Promise.all([
      fetch('/api/partners/stats?admin=true').then(r => r.json()),
      fetch('/api/partners/payout?admin=true').then(r => r.json()),
      fetch('/api/partners/stats?admin=true&type=revenue').then(r => r.json()),
      fetch('/api/feedback').then(r => r.json()).catch(() => ({ feedback: [] })),
      fetch('/api/listings/admin').then(r => r.json()).catch(() => ({ listings: [] })),
    ])
    if (a.forbidden) { router.push('/dashboard'); return }
    setAffiliates(a.affiliates ?? [])
    setPayouts(p.payouts ?? [])
    setStats(s.revenue ?? null)
    setFeedback(f.feedback ?? [])
    setListings(l.listings ?? [])
    setLoading(false)
  }

  async function updateListingStatus(id: string, status: string, admin_notes?: string) {
    setListingActionLoading(true)
    await fetch('/api/listings/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_notes }),
    })
    await fetchAll()
    setListingActionLoading(false)
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteResult(null)
    const res = await fetch('/api/partners/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    })
    const json = await res.json()
    setInviteResult(res.ok ? `✓ Invite sent to ${inviteEmail}` : `Error: ${json.error}`)
    if (res.ok) setInviteEmail('')
    setInviteLoading(false)
  }

  async function updateAffiliateStatus(id: string, status: string) {
    setActionLoading(true)
    const res = await fetch('/api/partners/stats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes: actionNote }),
    })
    if (res.ok) { setSelected(null); setActionNote(''); await fetchAll() }
    setActionLoading(false)
  }

  async function approvePayout(id: string) {
    setActionLoading(true)
    await fetch('/api/partners/payout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'approve' }),
    })
    await fetchAll()
    setActionLoading(false)
  }

  async function rejectPayout(id: string) {
    setActionLoading(true)
    await fetch('/api/partners/payout', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reject' }),
    })
    await fetchAll()
    setActionLoading(false)
  }

  function extractBase(email: string): string {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
  }

  async function generatePromoCode() {
    if (!selected) return
    setPromoLoading(true)
    await fetch('/api/partners/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_promo',
        affiliate_id: selected.id,
        code: promoCode,
        discount_value: Number(promoDiscount),
        duration_months: Number(promoMonths),
      }),
    })
    setPromoLoading(false)
    setPromoCode('')
    await fetchAll()
  }

  async function generateAllPromos() {
    if (!selected) return
    setAllPromosLoading(true)
    setAllPromosResult(null)
    const res = await fetch('/api/partners/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_all_promos',
        affiliate_id: selected.id,
        email_prefix: extractBase(selected.email),
      }),
    })
    const json = await res.json()
    if (res.ok) {
      setAllPromosResult(`✓ Created ${json.created} codes${json.skipped > 0 ? `, ${json.skipped} already existed` : ''} — Stripe promotion codes generated`)
    } else {
      setAllPromosResult(`Error: ${json.error}`)
    }
    setAllPromosLoading(false)
    await fetchAll()
  }

  const handleSendLaunchEmail = async () => {
    if (!confirm('Send the launch day email to ALL users? This cannot be undone.')) return
    setLaunchEmailSending(true)
    try {
      const res = await fetch('/api/newsletter/launch', { method: 'POST' })
      const data = await res.json()
      setLaunchEmailResult({ sent: data.sent, failed: data.failed })
    } catch {
      alert('Failed to send launch email')
    } finally {
      setLaunchEmailSending(false)
    }
  }

  const filtered = filterStatus === 'all'
    ? affiliates
    : affiliates.filter(a => a.status === filterStatus)

  const counts = {
    all:        affiliates.length,
    pending:    affiliates.filter(a => a.status === 'pending').length,
    active:     affiliates.filter(a => a.status === 'active').length,
    suspended:  affiliates.filter(a => a.status === 'suspended').length,
    terminated: affiliates.filter(a => a.status === 'terminated').length,
  }

  const pendingPayouts = payouts.filter(p => p.status === 'requested')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: dark }}>

      {/* Header */}
      <header style={{ background: surface, borderBottom: `1px solid ${border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f1f1f1', letterSpacing: '-0.02em' }}>Partner Admin</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: muted }}>Manage affiliates, payouts, and invites</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {pendingPayouts.length > 0 && (
            <span style={{ background: 'rgba(245,158,11,0.15)', color: gold, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: `1px solid rgba(245,158,11,0.3)` }}>
              {pendingPayouts.length} payout{pendingPayouts.length > 1 ? 's' : ''} pending
            </span>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Launch email */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleSendLaunchEmail}
            disabled={launchEmailSending}
            style={{ padding: '8px 16px', background: '#ff6154', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: launchEmailSending ? 'not-allowed' : 'pointer', opacity: launchEmailSending ? 0.6 : 1 }}
          >
            {launchEmailSending ? 'Sending...' : '📧 Send Launch Email to All Users'}
          </button>
          {launchEmailResult && (
            <span style={{ fontSize: 12, color: '#4ade80' }}>
              ✅ Sent to {launchEmailResult.sent} users ({launchEmailResult.failed} failed)
            </span>
          )}
        </div>

        {/* Revenue overview */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Gross Revenue',     value: cents(stats.gross_revenue_cents),      color: '#f1f1f1' },
              { label: 'Affiliate Payouts', value: cents(stats.total_commissions_cents),   color: gold },
              { label: 'Net to Joshua',     value: cents(stats.net_to_joshua_cents),       color: '#22c55e' },
              { label: 'Pending Payouts',   value: cents(stats.pending_payouts_cents),     color: purple },
              { label: 'SM-Give Allocation',value: cents(stats.sm_give_cents),             color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#0a0a0a', borderRadius: 12, padding: 4, marginBottom: 28, width: 'fit-content' }}>
          {[
            { key: 'affiliates', label: `Affiliates (${affiliates.length})` },
            { key: 'payouts',    label: `Payouts${pendingPayouts.length > 0 ? ` (${pendingPayouts.length})` : ''}` },
            { key: 'revenue',    label: 'Revenue' },
            { key: 'feedback',   label: `Feedback${feedback.length > 0 ? ` (${feedback.length})` : ''}` },
            { key: 'listings',   label: `Listings${listings.filter(l => l.status === 'pending').length > 0 ? ` (${listings.filter(l => l.status === 'pending').length})` : ''}` },
            { key: 'invite',     label: 'Send Invite' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                background: activeTab === tab.key ? '#1a1a1a' : 'transparent',
                color: activeTab === tab.key ? '#f1f1f1' : muted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AFFILIATES TAB */}
        {activeTab === 'affiliates' && (
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {Object.entries(counts).map(([k, n]) => (
                <button
                  key={k}
                  onClick={() => setFilterStatus(k)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: `1px solid ${filterStatus === k ? gold : border}`,
                    background: filterStatus === k ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: filterStatus === k ? gold : muted,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {k} ({n})
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    {['Affiliate', 'Status', 'Referrals', 'Lifetime', 'Available', 'W-9', 'Stripe', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} style={{ borderTop: `1px solid ${border}` }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#f1f1f1', fontSize: 13 }}>{a.full_name || '(no name)'}</div>
                        <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>{a.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><StatusBadge status={a.status} /></td>
                      <td style={{ padding: '14px 16px', color: '#d1d5db' }}>{a.active_referral_count}</td>
                      <td style={{ padding: '14px 16px', color: gold, fontWeight: 700 }}>{cents(a.lifetime_earnings_cents)}</td>
                      <td style={{ padding: '14px 16px', color: '#22c55e' }}>{cents(a.available_balance_cents)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {a.w9_submitted
                          ? <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓ Filed</span>
                          : a.w9_required
                          ? <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>⚠ Required</span>
                          : <span style={{ fontSize: 11, color: muted }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {a.stripe_account_status
                          ? <StatusBadge status={a.stripe_account_status} />
                          : <span style={{ fontSize: 11, color: muted }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => setSelected(a)}
                          style={{
                            padding: '5px 10px', borderRadius: 6, border: `1px solid ${border}`,
                            background: 'transparent', color: muted, fontSize: 11,
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: muted, fontSize: 13 }}>No affiliates found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYOUTS TAB */}
        {activeTab === 'payouts' && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['Affiliate', 'Amount', 'Status', 'Requested', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${border}` }}>
                    <td style={{ padding: '14px 16px', color: '#d1d5db' }}>{p.affiliate_email ?? p.affiliate_id.slice(0, 8)}</td>
                    <td style={{ padding: '14px 16px', color: gold, fontWeight: 700 }}>{cents(p.amount_cents)}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: '14px 16px', color: muted }}>{new Date(p.requested_at).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.status === 'requested' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => approvePayout(p.id)}
                            disabled={actionLoading}
                            style={{
                              padding: '5px 10px', borderRadius: 6, border: 'none',
                              background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectPayout(p.id)}
                            disabled={actionLoading}
                            style={{
                              padding: '5px 10px', borderRadius: 6, border: 'none',
                              background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: muted, fontSize: 13 }}>No payout requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 28 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>Revenue Breakdown</h3>
              {[
                { label: 'Gross Revenue (all subscriptions)',  value: cents(stats.gross_revenue_cents),     color: '#f1f1f1' },
                { label: 'Total Affiliate Commissions',        value: `−${cents(stats.total_commissions_cents)}`, color: '#f87171' },
                { label: 'Net Revenue to Gilgamesh LLC',       value: cents(stats.net_to_joshua_cents),     color: '#22c55e' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: 13, color: muted }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 28 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>Unclaimed / Forfeited Funds</h3>
              {[
                { label: 'Pending Payouts (in queue)',    value: cents(stats.pending_payouts_cents), color: purple },
                { label: 'SM-Give Allocation (forfeited)', value: cents(stats.sm_give_cents),        color: '#60a5fa' },
                { label: 'Gilgamesh Share (forfeited)',    value: cents(stats.forfeited_cents / 2),  color: '#9ca3af' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: 13, color: muted }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f1f1f1' }}>
                User Feedback Inbox
              </h3>
              <span style={{ fontSize: 12, color: muted }}>{feedback.length} message{feedback.length !== 1 ? 's' : ''}</span>
            </div>
            {feedback.length === 0 ? (
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                <p style={{ fontSize: 14, color: muted, margin: 0 }}>No feedback yet. The pink bubble on every page sends messages here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {feedback.map(item => {
                  const typeColor: Record<string, string> = {
                    bug: '#f87171', feature: '#60a5fa', general: '#a3a3a3',
                  }
                  const typeEmoji: Record<string, string> = {
                    bug: '🐛', feature: '💡', general: '💬',
                  }
                  return (
                    <div key={item.id} style={{
                      background: surface, border: `1px solid ${border}`,
                      borderRadius: 12, padding: '16px 20px',
                      borderLeft: `3px solid ${typeColor[item.type] ?? '#4b5563'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{typeEmoji[item.type] ?? '💬'}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', color: typeColor[item.type] ?? muted,
                          }}>{item.type}</span>
                          {item.email && (
                            <span style={{ fontSize: 12, color: muted }}>from {item.email}</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#4b5563' }}>
                          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#d1d5db', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.message}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>Curated Listing Applications</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: muted }}>Review and approve tool applications for the public directory</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(245,158,11,0.15)', color: gold, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                  {listings.filter(l => l.status === 'pending').length} pending
                </span>
                <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                  {listings.filter(l => l.status === 'approved').length} approved
                </span>
              </div>
            </div>
            {listings.length === 0 ? (
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 48, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: muted }}>No applications yet. Share the listings page to get your first applicants.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {listings.map(listing => (
                  <div key={listing.id} style={{ background: surface, border: `1px solid ${listing.status === 'pending' ? 'rgba(245,158,11,0.4)' : border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#f1f1f1' }}>{listing.name}</span>
                          <StatusBadge status={listing.status} />
                          <span style={{ fontSize: 11, color: muted, background: '#1a1a1a', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{listing.category}</span>
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>{listing.tagline}</p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: muted }}>
                          <span>By: <span style={{ color: '#d1d5db', fontWeight: 600 }}>{listing.applicant_name}</span></span>
                          <span>{listing.applicant_email}</span>
                          <a href={listing.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>{listing.url}</a>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {listing.status !== 'approved' && (
                          <button
                            onClick={() => updateListingStatus(listing.id, 'approved')}
                            disabled={listingActionLoading}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: listingActionLoading ? 0.6 : 1 }}
                          >
                            Approve
                          </button>
                        )}
                        {listing.status !== 'rejected' && (
                          <button
                            onClick={() => updateListingStatus(listing.id, 'rejected')}
                            disabled={listingActionLoading}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: listingActionLoading ? 0.6 : 1 }}
                          >
                            Reject
                          </button>
                        )}
                        {listing.status !== 'pending' && (
                          <button
                            onClick={() => updateListingStatus(listing.id, 'pending')}
                            disabled={listingActionLoading}
                            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', color: muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: listingActionLoading ? 0.6 : 1 }}
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    {(listing.mission_statement || listing.why_apply) && (
                      <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {listing.mission_statement && (
                          <div>
                            <p style={{ margin: '0 0 3px', fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#d1d5db', lineHeight: 1.6 }}>{listing.mission_statement}</p>
                          </div>
                        )}
                        {listing.why_apply && (
                          <div>
                            <p style={{ margin: '0 0 3px', fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why Apply</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#d1d5db', lineHeight: 1.6 }}>{listing.why_apply}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p style={{ margin: '10px 0 0', fontSize: 11, color: muted }}>Applied {new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INVITE TAB */}
        {activeTab === 'invite' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 32 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>Send Affiliate Invite</h3>
              <p style={{ fontSize: 13, color: muted, margin: '0 0 24px', lineHeight: 1.6 }}>
                Type any email address to send a branded invite. They'll receive an Accept/Decline email with a 7-day expiry link.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendInvite()}
                  placeholder="partner@example.com"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    background: '#0a0a0a', border: `1px solid ${border}`,
                    color: '#f1f1f1', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={sendInvite}
                  disabled={inviteLoading || !inviteEmail.trim()}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${gold}, ${purple})`,
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: inviteEmail ? 'pointer' : 'not-allowed',
                    opacity: inviteLoading ? 0.6 : 1, flexShrink: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
              {inviteResult && (
                <p style={{
                  marginTop: 14, fontSize: 13, fontWeight: 600,
                  color: inviteResult.startsWith('✓') ? '#22c55e' : '#f87171',
                }}>
                  {inviteResult}
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── AFFILIATE MANAGEMENT DRAWER ─────────────────────────── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          zIndex: 50,
        }} onClick={() => setSelected(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 440, height: '100vh', background: '#0f0f0f',
              borderLeft: `1px solid ${border}`, overflowY: 'auto',
              padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>Manage Affiliate</h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: muted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>

            {/* Profile info */}
            <div style={{ background: surface, borderRadius: 12, padding: 18, marginBottom: 20, border: `1px solid ${border}` }}>
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#f1f1f1' }}>{selected.full_name || '(no name)'}</p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: muted }}>{selected.email}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatusBadge status={selected.status} />
                {selected.w9_required && !selected.w9_submitted && <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: 6 }}>W-9 Required</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                {[
                  { label: 'Lifetime', value: cents(selected.lifetime_earnings_cents) },
                  { label: 'Available', value: cents(selected.available_balance_cents) },
                  { label: 'Referrals', value: selected.active_referral_count },
                  { label: 'Rate', value: `${(selected.commission_rate * 100).toFixed(0)}%` },
                ].map(s => (
                  <div key={s.label} style={{ background: '#0a0a0a', borderRadius: 8, padding: '10px 12px', border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: gold }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status actions */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Update Status</p>
              <textarea
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                placeholder="Admin note (optional)"
                rows={2}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  background: '#0a0a0a', border: `1px solid ${border}`,
                  color: '#f1f1f1', fontSize: 13, resize: 'vertical',
                  boxSizing: 'border-box', marginBottom: 10, fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { status: 'active',     label: 'Activate',   bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
                  { status: 'suspended',  label: 'Suspend',    bg: 'rgba(249,115,22,0.15)',  color: '#f97316' },
                  { status: 'terminated', label: 'Terminate',  bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
                ].map(a => (
                  <button
                    key={a.status}
                    onClick={() => updateAffiliateStatus(selected.id, a.status)}
                    disabled={actionLoading || selected.status === a.status}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: 'none',
                      background: a.bg, color: a.color, fontSize: 12, fontWeight: 700,
                      cursor: selected.status === a.status ? 'not-allowed' : 'pointer',
                      opacity: selected.status === a.status ? 0.4 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate promo codes */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Promo Codes</p>

              {/* Generate all standard codes */}
              <div style={{ background: 'rgba(124,58,237,0.06)', border: `1px solid rgba(124,58,237,0.2)`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: purple }}>Standard Code Set</p>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: muted, lineHeight: 1.5 }}>
                  Generates 8 codes ({extractBase(selected.email)}1M, 3M, 6M, 1Y, CR1, CR2, WLB, WLP) and creates matching Stripe promotion codes.
                </p>
                <button
                  onClick={generateAllPromos}
                  disabled={allPromosLoading}
                  style={{
                    width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                    background: `rgba(124,58,237,0.2)`, color: purple,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    opacity: allPromosLoading ? 0.6 : 1,
                  }}
                >
                  {allPromosLoading ? 'Generating...' : 'Generate All Standard Codes'}
                </button>
                {allPromosResult && (
                  <p style={{
                    margin: '8px 0 0', fontSize: 12, fontWeight: 600,
                    color: allPromosResult.startsWith('✓') ? '#22c55e' : '#f87171',
                  }}>
                    {allPromosResult}
                  </p>
                )}
              </div>

              {/* Manual single code */}
              <p style={{ fontSize: 11, color: muted, fontWeight: 600, margin: '0 0 8px' }}>Custom Single Code</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO20"
                  style={{ padding: '9px 12px', borderRadius: 8, background: '#0a0a0a', border: `1px solid ${border}`, color: '#f1f1f1', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)}
                    placeholder="Discount %"
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: '#0a0a0a', border: `1px solid ${border}`, color: '#f1f1f1', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <input
                    type="number" value={promoMonths} onChange={e => setPromoMonths(e.target.value)}
                    placeholder="Months"
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: '#0a0a0a', border: `1px solid ${border}`, color: '#f1f1f1', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <button
                  onClick={generatePromoCode}
                  disabled={promoLoading || !promoCode.trim()}
                  style={{
                    padding: '9px', borderRadius: 8, border: 'none',
                    background: `rgba(245,158,11,0.15)`, color: gold,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    opacity: promoLoading || !promoCode.trim() ? 0.6 : 1,
                  }}
                >
                  {promoLoading ? 'Generating...' : 'Generate Code'}
                </button>
              </div>
            </div>

            {/* W-9 info */}
            {selected.w9_required && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 10, padding: 16 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: gold }}>W-9 Status</p>
                <p style={{ margin: 0, fontSize: 12, color: muted, lineHeight: 1.6 }}>
                  {selected.w9_submitted
                    ? 'W-9 submitted. Review in Supabase Storage under affiliate-tax-docs.'
                    : `Not submitted. Deadline: ${selected.w9_forfeiture_deadline ? new Date(selected.w9_forfeiture_deadline).toLocaleDateString() : 'N/A'}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

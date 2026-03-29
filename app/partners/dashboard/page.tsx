'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PartnersHeader from '@/components/partners/PartnersHeader'

const gold   = '#F59E0B'
const purple = '#7C3AED'
const dark   = '#0a0a0a'
const surface = '#111111'
const border  = '#222222'
const muted   = '#6b7280'

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
  w9_withholding_started_at: string | null
  w9_forfeiture_deadline: string | null
  tos_agreed: boolean
  onboarding_completed: boolean
}

interface PromoCode {
  id: string
  code: string
  discount_value: number
  duration_months: number
  description: string
  times_used: number
}

interface Conversion {
  id: string
  referred_user_email: string | null
  event_type: string
  plan: string | null
  amount_cents: number
  commission_cents: number
  status: string
  converted_at: string
  hold_until: string | null
}

interface Payout {
  id: string
  amount_cents: number
  status: string
  requested_at: string
  paid_at: string | null
}

interface DashboardData {
  profile: AffiliateProfile
  referral_link: string
  promo_codes: PromoCode[]
  conversions: Conversion[]
  payouts: Payout[]
  commission_label: string
  next_tier: { rate: string; remaining: number } | null
  notifications: { id: string; type: string; subject: string; sent_at: string; read_at: string | null }[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`
}

function statusBadge(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    holding:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    available: { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    paid:      { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    reversed:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    forfeited: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    requested: { bg: 'rgba(124,58,237,0.12)', color: '#7C3AED' },
    approved:  { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    rejected:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  }
  const s = styles[status] ?? { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function PartnersDashboardPage() {
  const router = useRouter()
  const [data, setData]           = useState<DashboardData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [userEmail, setUserEmail] = useState<string | undefined>()
  const [copied, setCopied]       = useState<string | null>(null)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutError, setPayoutError]     = useState<string | null>(null)
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'conversions' | 'payouts'>('conversions')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/partners'); return }
      setUserEmail(user.email ?? undefined)

      const res = await fetch('/api/partners/stats')
      if (!res.ok) { router.push('/partners'); return }
      const json = await res.json()

      if (!json.profile) { router.push('/partners/access-denied'); return }
      if (!json.profile.onboarding_completed) { router.push('/partners/onboarding'); return }
      if (json.profile.status === 'terminated') { router.push('/partners/access-denied'); return }

      setData(json)
      setLoading(false)
    }
    init()
  }, [router])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function requestPayout() {
    if (!data) return
    setPayoutLoading(true)
    setPayoutError(null)
    const res = await fetch('/api/partners/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request' }),
    })
    const json = await res.json()
    if (!res.ok) {
      setPayoutError(json.error || 'Failed to request payout')
    } else {
      setPayoutSuccess(true)
      // Refresh
      const r2 = await fetch('/api/partners/stats')
      if (r2.ok) setData(await r2.json())
    }
    setPayoutLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!data) return null

  const { profile, referral_link, promo_codes, conversions, payouts, commission_label, next_tier, notifications } = data
  const tierProgress   = next_tier ? Math.min((profile.active_referral_count / 100) * 100, 100) : 100
  const canRequestPayout = profile.available_balance_cents >= 2500
  const unread = notifications?.filter(n => !n.read_at) ?? []

  return (
    <div style={{ minHeight: '100vh', background: dark }}>
      <PartnersHeader email={userEmail} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Suspended banner */}
        {profile.status === 'suspended' && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f87171' }}>Account Suspended</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: muted }}>
                Your affiliate account has been suspended. Contact hello@socialmate.studio to resolve this.
              </p>
            </div>
          </div>
        )}

        {/* W-9 alert */}
        {profile.w9_required && !profile.w9_submitted && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.3)`,
            borderRadius: 12, padding: '14px 20px', marginBottom: 28,
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: gold }}>W-9 Required</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13, color: muted }}>
                Your lifetime earnings have reached $599. You must submit a W-9 form within 60 days to avoid forfeiture of funds.
                {profile.w9_forfeiture_deadline && ` Deadline: ${new Date(profile.w9_forfeiture_deadline).toLocaleDateString()}`}
              </p>
              <a href="#w9-section" style={{ fontSize: 13, color: gold, fontWeight: 700, textDecoration: 'none' }}>
                Submit W-9 →
              </a>
            </div>
          </div>
        )}

        {/* Unread notifications */}
        {unread.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            {unread.map(n => (
              <div key={n.id} style={{
                background: 'rgba(124,58,237,0.08)', border: `1px solid rgba(124,58,237,0.2)`,
                borderRadius: 12, padding: '12px 16px', marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 14 }}>🔔</span>
                <span style={{ fontSize: 13, color: '#c4b5fd' }}>{n.subject}</span>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f1f1', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {profile.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Partner Dashboard'}
          </h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>
            Commission rate: <span style={{ color: gold, fontWeight: 700 }}>{commission_label} recurring</span>
            {profile.status === 'active' && <span style={{ marginLeft: 12, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>Active</span>}
          </p>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Pending',   value: cents(profile.total_earnings_cents - profile.available_balance_cents - profile.paid_out_cents < 0 ? 0 : profile.total_earnings_cents - profile.available_balance_cents - profile.paid_out_cents), sub: '60-day hold', icon: '⏳' },
            { label: 'Available', value: cents(profile.available_balance_cents), sub: 'Ready for payout', icon: '✅' },
            { label: 'Paid Out',  value: cents(profile.paid_out_cents), sub: 'Total disbursed', icon: '💳' },
            { label: 'Lifetime',  value: cents(profile.lifetime_earnings_cents), sub: 'All-time earnings', icon: '🏆' },
            { label: 'Active Referrals', value: profile.active_referral_count, sub: commission_label + ' commission', icon: '👥' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 14, padding: '20px 20px 16px',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: muted, marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Tier progress */}
        {next_tier && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>Progress to 40% Tier</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: muted }}>
                  {profile.active_referral_count} / 100 active referrals — {next_tier.remaining} more needed
                </p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: purple }}>
                Currently {commission_label}
              </span>
            </div>
            <div style={{ height: 8, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 8,
                background: `linear-gradient(90deg, ${gold}, ${purple})`,
                width: `${tierProgress}%`, transition: 'width 0.6s ease',
              }} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: muted }}>
              Reach <strong style={{ color: gold }}>100 active referrals</strong> to unlock <strong style={{ color: gold }}>40% recurring commission</strong>
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Referral link */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Referral Link</h3>
            <div style={{ background: '#0a0a0a', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {referral_link}
            </div>
            <button
              onClick={() => copy(referral_link, 'link')}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: `1px solid ${copied === 'link' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                background: copied === 'link' ? 'rgba(34,197,94,0.15)' : `rgba(245,158,11,0.1)`,
                color: copied === 'link' ? '#22c55e' : gold,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {copied === 'link' ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Promo codes */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Promo Codes</h3>
            {promo_codes.length === 0 ? (
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Promo codes will appear here after account setup.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {promo_codes.map(code => (
                  <div key={code.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: gold, letterSpacing: '0.05em' }}>
                        {code.code}
                      </div>
                      <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>
                        {code.description} · Used {code.times_used}x
                      </div>
                    </div>
                    <button
                      onClick={() => copy(code.code, code.id)}
                      style={{
                        padding: '5px 12px', borderRadius: 8, border: `1px solid ${border}`,
                        background: 'transparent', color: copied === code.id ? '#22c55e' : muted,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                        fontFamily: 'inherit',
                      }}
                    >
                      {copied === code.id ? '✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payout section */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>Request Payout</h3>
              <p style={{ margin: 0, fontSize: 13, color: muted, lineHeight: 1.6 }}>
                Available balance: <strong style={{ color: '#f1f1f1' }}>{cents(profile.available_balance_cents)}</strong>
                {' '}· Minimum $25.00 · 60-day hold on new earnings
              </p>
              {!canRequestPayout && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#4b5563' }}>
                  {profile.available_balance_cents < 2500
                    ? `Need ${cents(2500 - profile.available_balance_cents)} more to reach the $25 minimum`
                    : 'Earnings still in 60-day hold period'}
                </p>
              )}
              {payoutError && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#f87171' }}>{payoutError}</p>
              )}
              {payoutSuccess && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#22c55e' }}>Payout requested! You will receive a confirmation email.</p>
              )}
            </div>
            <button
              onClick={requestPayout}
              disabled={!canRequestPayout || payoutLoading || profile.status !== 'active'}
              style={{
                padding: '11px 24px', borderRadius: 10, border: 'none',
                background: canRequestPayout && profile.status === 'active'
                  ? `linear-gradient(135deg, ${gold}, ${purple})`
                  : '#1a1a1a',
                color: canRequestPayout && profile.status === 'active' ? '#fff' : muted,
                fontSize: 14, fontWeight: 700, cursor: canRequestPayout ? 'pointer' : 'not-allowed',
                opacity: payoutLoading ? 0.6 : 1, flexShrink: 0,
                fontFamily: 'inherit',
              }}
            >
              {payoutLoading ? 'Requesting...' : 'Request Payout'}
            </button>
          </div>
        </div>

        {/* W-9 section */}
        {(profile.w9_required || profile.lifetime_earnings_cents >= 50000) && (
          <div id="w9-section" style={{ background: surface, border: `1px solid ${profile.w9_required && !profile.w9_submitted ? 'rgba(245,158,11,0.3)' : border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>
              W-9 Tax Form {profile.w9_submitted ? <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, marginLeft: 8 }}>Submitted</span> : ''}
            </h3>
            {!profile.w9_submitted ? (
              <>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: muted, lineHeight: 1.6 }}>
                  IRS regulations require a W-9 form when lifetime earnings reach $599. Upload your completed W-9 below.
                  {profile.w9_forfeiture_deadline && (
                    <span style={{ color: '#f87171' }}> Deadline: {new Date(profile.w9_forfeiture_deadline).toLocaleDateString()}. Failure to submit will result in forfeiture of withheld funds.</span>
                  )}
                </p>
                <W9UploadForm affiliateId={profile.id} onSuccess={() => window.location.reload()} />
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: '#22c55e' }}>
                Your W-9 has been submitted. Submitted on {profile.w9_withholding_started_at ? new Date(profile.w9_withholding_started_at).toLocaleDateString() : 'file'}.
              </p>
            )}
          </div>
        )}

        {/* Conversions / Payouts tabs */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}` }}>
            {(['conversions', 'payouts'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 24px', border: 'none', background: 'transparent',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  color: activeTab === tab ? gold : muted,
                  borderBottom: activeTab === tab ? `2px solid ${gold}` : '2px solid transparent',
                  marginBottom: -1,
                  textTransform: 'capitalize',
                }}
              >
                {tab} {tab === 'conversions' ? `(${conversions.length})` : `(${payouts.length})`}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {activeTab === 'conversions' && (
              conversions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: 14, color: muted, margin: 0 }}>No conversions yet. Share your referral link to get started!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ textAlign: 'left', padding: '0 0 12px', fontWeight: 700 }}>User</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px', fontWeight: 700 }}>Event</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px', fontWeight: 700 }}>Plan</th>
                        <th style={{ textAlign: 'right', padding: '0 0 12px', fontWeight: 700 }}>Revenue</th>
                        <th style={{ textAlign: 'right', padding: '0 0 12px', fontWeight: 700 }}>Commission</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px 16px', fontWeight: 700 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px 16px', fontWeight: 700 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversions.map(c => (
                        <tr key={c.id} style={{ borderTop: `1px solid ${border}` }}>
                          <td style={{ padding: '12px 0', color: '#d1d5db' }}>
                            {c.referred_user_email
                              ? c.referred_user_email.replace(/(.{2}).*(@.*)/, '$1***$2')
                              : '—'}
                          </td>
                          <td style={{ padding: '12px 0', color: '#d1d5db', textTransform: 'capitalize' }}>{c.event_type}</td>
                          <td style={{ padding: '12px 0', color: '#9ca3af' }}>{c.plan ?? '—'}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', color: '#d1d5db' }}>{cents(c.amount_cents)}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', color: gold, fontWeight: 700 }}>{cents(c.commission_cents)}</td>
                          <td style={{ padding: '12px 16px', }}>{statusBadge(c.status)}</td>
                          <td style={{ padding: '12px 16px', color: '#6b7280' }}>{new Date(c.converted_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'payouts' && (
              payouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: 14, color: muted, margin: 0 }}>No payouts yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ textAlign: 'left', padding: '0 0 12px', fontWeight: 700 }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px', fontWeight: 700 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px 16px', fontWeight: 700 }}>Requested</th>
                        <th style={{ textAlign: 'left', padding: '0 0 12px 16px', fontWeight: 700 }}>Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map(p => (
                        <tr key={p.id} style={{ borderTop: `1px solid ${border}` }}>
                          <td style={{ padding: '12px 0', color: gold, fontWeight: 700 }}>{cents(p.amount_cents)}</td>
                          <td style={{ padding: '12px 0' }}>{statusBadge(p.status)}</td>
                          <td style={{ padding: '12px 16px', color: '#6b7280' }}>{new Date(p.requested_at).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px', color: '#6b7280' }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: `1px solid ${border}`, marginTop: 40 }}>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
          © {new Date().getFullYear()} Gilgamesh Enterprise LLC · SocialMate Partner Program ·{' '}
          <a href="mailto:hello@socialmate.studio" style={{ color: muted, textDecoration: 'none' }}>Support</a>
        </p>
      </footer>
    </div>
  )
}

// ─── W-9 upload sub-component ──────────────────────────────────────────────

function W9UploadForm({ affiliateId, onSuccess }: { affiliateId: string; onSuccess: () => void }) {
  const [legalName, setLegalName]     = useState('')
  const [address, setAddress]         = useState('')
  const [city, setCity]               = useState('')
  const [state, setState]             = useState('')
  const [zip, setZip]                 = useState('')
  const [taxIdLast4, setTaxIdLast4]   = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const border = '#222222'
  const muted  = '#6b7280'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!legalName || !taxIdLast4 || !file) { setError('Fill in all required fields and upload your W-9'); return }
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('legal_name', legalName)
    formData.append('address', address)
    formData.append('city', city)
    formData.append('state', state)
    formData.append('zip', zip)
    formData.append('tax_id_last4', taxIdLast4)
    formData.append('file', file)

    const res = await fetch('/api/partners/w9', { method: 'POST', body: formData })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Upload failed'); setLoading(false); return }
    onSuccess()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: '#0a0a0a', border: `1px solid ${border}`,
    color: '#f1f1f1', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal Name *</label>
        <input value={legalName} onChange={e => setLegalName(e.target.value)} style={inputStyle} placeholder="Full legal name" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last 4 of SSN/EIN *</label>
        <input value={taxIdLast4} onChange={e => setTaxIdLast4(e.target.value.replace(/\D/, '').slice(0,4))} style={inputStyle} placeholder="XXXX" maxLength={4} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</label>
        <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="Street address" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</label>
        <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>State</label>
        <input value={state} onChange={e => setState(e.target.value)} style={inputStyle} placeholder="CA" maxLength={2} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ZIP</label>
        <input value={zip} onChange={e => setZip(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>W-9 PDF Upload *</label>
        <input
          type="file" accept="application/pdf,.pdf"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ ...inputStyle, padding: '8px 12px' }}
        />
      </div>
      {error && <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: 13, color: '#f87171' }}>{error}</p>}
      <button
        type="submit" disabled={loading}
        style={{
          gridColumn: '1 / -1', padding: '10px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, #F59E0B, #7C3AED)`,
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
        }}
      >
        {loading ? 'Uploading...' : 'Submit W-9'}
      </button>
    </form>
  )
}

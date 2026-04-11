'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PartnersHeader from '@/components/partners/PartnersHeader'

// ── Design tokens ────────────────────────────────────────────────────────────

const gold    = '#F59E0B'
const purple  = '#7C3AED'
const dark    = '#0a0a0a'
const surface = '#111111'
const surf2   = '#161616'
const border  = '#222222'
const muted   = '#6b7280'
const green   = '#22c55e'

// ── Confetti (pre-computed to avoid render-time randomness) ──────────────────

const CONFETTI = Array.from({ length: 64 }, (_, i) => ({
  color: ['#F59E0B', '#7C3AED', '#22c55e', '#ef4444', '#3b82f6', '#f97316'][i % 6],
  left:     (i * 1.58) % 100,
  duration: 1.2 + (i % 4) * 0.35,
  delay:    i * 0.045,
  size:     6 + (i % 3) * 3,
  isCircle: i % 3 !== 0,
}))

// ── Milestones ───────────────────────────────────────────────────────────────

const MILESTONES = [
  { id: 'first_conversion', label: 'First Win',    icon: '🎉', desc: 'First paying referral',      check: (p: AffiliateProfile) => p.lifetime_earnings_cents > 0 },
  { id: 'earn_10',          label: '$10 Earned',   icon: '💰', desc: 'Earned your first $10',       check: (p: AffiliateProfile) => p.lifetime_earnings_cents >= 1000 },
  { id: 'earn_50',          label: '$50 Club',     icon: '🌟', desc: 'Hit $50 lifetime',            check: (p: AffiliateProfile) => p.lifetime_earnings_cents >= 5000 },
  { id: 'earn_100',         label: '$100 Badge',   icon: '🚀', desc: 'Triple digits!',              check: (p: AffiliateProfile) => p.lifetime_earnings_cents >= 10000 },
  { id: 'earn_500',         label: '$500 Club',    icon: '💎', desc: 'Half-grand earner',           check: (p: AffiliateProfile) => p.lifetime_earnings_cents >= 50000 },
  { id: 'earn_1000',        label: '$1K Legend',   icon: '👑', desc: 'Four-figure earner',          check: (p: AffiliateProfile) => p.lifetime_earnings_cents >= 100000 },
  { id: 'refs_5',           label: '5 Referrals',  icon: '🤝', desc: '5 active paying referrals',  check: (p: AffiliateProfile) => p.active_referral_count >= 5 },
  { id: 'refs_25',          label: '25 Referrals', icon: '⭐', desc: '25 active referrals',         check: (p: AffiliateProfile) => p.active_referral_count >= 25 },
  { id: 'refs_50',          label: '50 Referrals', icon: '🔥', desc: '50 referrals — on fire',     check: (p: AffiliateProfile) => p.active_referral_count >= 50 },
  { id: 'refs_100',         label: 'Elite Tier',   icon: '🏆', desc: '100 refs = 40% commission',  check: (p: AffiliateProfile) => p.active_referral_count >= 100 },
]

// ── Tour steps ───────────────────────────────────────────────────────────────

const TOUR_STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Partner HQ',
    body: "You're in the right place. Earn 30%–40% recurring commission on every referral across SocialMate, Enki, and every product we launch. Let's show you around.",
  },
  {
    emoji: '📊',
    title: 'Track Your Earnings',
    body: 'Pending = in your 60-day hold period. Available = ready to cash out right now. All commissions calculate on the post-discount price your referrals actually paid.',
  },
  {
    emoji: '🏅',
    title: 'Earn Milestone Badges',
    body: 'Hit milestones as you grow. Each one unlocks a badge — and confetti. Keep going until you hit the $1K Legend and the Elite Tier.',
  },
  {
    emoji: '🔗',
    title: 'Your Referral Link',
    body: 'This is your main weapon. Drop it in your bio, content, socials, everywhere. Every person who signs up and subscribes through your link earns you recurring commission.',
  },
  {
    emoji: '🎁',
    title: 'Your Promo Codes',
    body: 'Six codes, each with a different discount duration. Your audience saves money — you earn commission on every renewal. Win-win.',
  },
  {
    emoji: '📈',
    title: 'The 40% Elite Tier',
    body: 'Once you hit 100 active referrals, your commission jumps from 30% to 40% — permanently. That one milestone pays for itself for the life of your account.',
  },
  {
    emoji: '🏅',
    title: 'The Leaderboard',
    body: 'Opt in to see how you rank against other partners. Toggle anonymous mode if you want to compete without showing your name.',
  },
  {
    emoji: '🚀',
    title: "You're Ready. Let's Get It.",
    body: "That's the full tour. Your dashboard updates in real time. Share your link, rack up conversions, and watch the balance grow. The door is open — go build.",
  },
]

// ── Types ────────────────────────────────────────────────────────────────────

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
  tour_completed: boolean
  leaderboard_opt_in: boolean
  leaderboard_anonymous: boolean
}

interface PromoCode {
  id: string
  code: string
  discount_value: number
  duration_months: number | null
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

interface LeaderboardEntry {
  rank: number
  name: string
  total_earnings_cents: number
  active_referral_count: number
  is_me: boolean
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
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
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' }
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
      {status}
    </span>
  )
}

// ── Confetti blast ───────────────────────────────────────────────────────────

function ConfettiBlast({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      <style>{`
        @keyframes cfall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {CONFETTI.map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: c.size, height: c.size,
          borderRadius: c.isCircle ? '50%' : 3,
          background: c.color,
          left: `${c.left}%`, top: 0,
          animation: `cfall ${c.duration}s ${c.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

// ── Tour overlay ─────────────────────────────────────────────────────────────

function TourOverlay({
  step, onNext, onPrev, onSkip, onFinish,
}: {
  step: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onFinish: () => void
}) {
  const current = TOUR_STEPS[step]
  const isLast  = step === TOUR_STEPS.length - 1
  const isFirst = step === 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.78)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 20px 44px',
      backdropFilter: 'blur(4px)',
    }}>
      <style>{`
        @keyframes tourUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        background: surface, border: `1px solid rgba(245,158,11,0.25)`,
        borderRadius: 20, padding: '28px 32px',
        maxWidth: 560, width: '100%',
        boxShadow: '0 0 60px rgba(245,158,11,0.12)',
        animation: 'tourUp 0.3s ease',
      }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
          {TOUR_STEPS.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 4,
              background: i <= step ? gold : '#2a2a2a',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div style={{ fontSize: 38, marginBottom: 10 }}>{current.emoji}</div>
        <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, color: '#f1f1f1', letterSpacing: '-0.02em' }}>
          {current.title}
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: muted, lineHeight: 1.75 }}>
          {current.body}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            onClick={onSkip}
            style={{ background: 'none', border: 'none', color: '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {!isFirst && (
              <button
                onClick={onPrev}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  border: `1px solid ${border}`, background: 'transparent',
                  color: '#f1f1f1', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={isLast ? onFinish : onNext}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${gold}, ${purple})`,
                color: '#fff', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isLast ? "Let's Go! 🚀" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ on, onChange, activeColor = gold, disabled = false }: {
  on: boolean
  onChange: (v: boolean) => void
  activeColor?: string
  disabled?: boolean
}) {
  return (
    <div
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? activeColor : '#2a2a2a',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }} />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PartnersDashboardPage() {
  const router = useRouter()

  const [data, setData]             = useState<DashboardData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [userEmail, setUserEmail]   = useState<string | undefined>()
  const [copied, setCopied]         = useState<string | null>(null)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutError, setPayoutError]     = useState<string | null>(null)
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [activeTab, setActiveTab]   = useState<'conversions' | 'payouts'>('conversions')

  const [showTour, setShowTour]     = useState(false)
  const [tourStep, setTourStep]     = useState(0)
  const [confetti, setConfetti]     = useState(false)

  const [leaderboard, setLeaderboard]           = useState<LeaderboardEntry[]>([])
  const [lbLoading, setLbLoading]               = useState(false)
  const [lbOptIn, setLbOptIn]                   = useState(false)
  const [lbAnonymous, setLbAnonymous]           = useState(true)
  const [lbSaving, setLbSaving]                 = useState(false)

  // ── Init ──────────────────────────────────────────────────────────────────

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
      setLbOptIn(json.profile.leaderboard_opt_in ?? false)
      setLbAnonymous(json.profile.leaderboard_anonymous ?? true)

      if (!json.profile.tour_completed) {
        setTimeout(() => setShowTour(true), 600)
      }

      setLoading(false)
    }
    init()
  }, [router])

  // ── Milestone confetti ────────────────────────────────────────────────────

  useEffect(() => {
    if (!data?.profile) return
    const profile = data.profile
    const key = `affiliate_milestones_${profile.id}`
    const seen = new Set<string>(JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem(key) ?? '[]') : '[]'))
    const newOnes = MILESTONES.filter(m => m.check(profile) && !seen.has(m.id))
    if (newOnes.length > 0) {
      newOnes.forEach(m => seen.add(m.id))
      localStorage.setItem(key, JSON.stringify(Array.from(seen)))
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4500)
    }
  }, [data?.profile])

  // ── Load leaderboard when opt-in ──────────────────────────────────────────

  useEffect(() => {
    if (!lbOptIn || leaderboard.length > 0) return
    setLbLoading(true)
    fetch('/api/partners/leaderboard')
      .then(r => r.json())
      .then(j => { setLeaderboard(j.leaderboard ?? []); setLbLoading(false) })
      .catch(() => setLbLoading(false))
  }, [lbOptIn, leaderboard.length])

  // ── Actions ───────────────────────────────────────────────────────────────

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
      const r2 = await fetch('/api/partners/stats')
      if (r2.ok) setData(await r2.json())
    }
    setPayoutLoading(false)
  }

  async function completeTour() {
    setShowTour(false)
    await fetch('/api/partners/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tour_completed: true }),
    })
  }

  async function saveLbSettings(optIn: boolean, anonymous: boolean) {
    setLbSaving(true)
    setLbOptIn(optIn)
    setLbAnonymous(anonymous)
    await fetch('/api/partners/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaderboard_opt_in: optIn, leaderboard_anonymous: anonymous }),
    })
    setLbSaving(false)
    if (optIn) {
      setLeaderboard([])
      setLbLoading(true)
      const r = await fetch('/api/partners/leaderboard')
      const j = await r.json()
      setLeaderboard(j.leaderboard ?? [])
      setLbLoading(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (!data) return null

  const { profile, referral_link, promo_codes, conversions, payouts, commission_label, next_tier, notifications } = data
  const tierProgress    = next_tier ? Math.min((profile.active_referral_count / 100) * 100, 100) : 100
  const canRequestPayout = profile.available_balance_cents >= 2500
  const unread          = notifications?.filter(n => !n.read_at) ?? []
  const pendingCents    = Math.max(0, profile.total_earnings_cents - profile.available_balance_cents - profile.paid_out_cents)

  const seenMilestones = typeof window !== 'undefined'
    ? new Set<string>(JSON.parse(localStorage.getItem(`affiliate_milestones_${profile.id}`) ?? '[]'))
    : new Set<string>()

  return (
    <div style={{ minHeight: '100vh', background: dark }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .stat-card { animation: fadeUp 0.4s ease both; }
        .stat-card:nth-child(1) { animation-delay: 0.04s; }
        .stat-card:nth-child(2) { animation-delay: 0.09s; }
        .stat-card:nth-child(3) { animation-delay: 0.14s; }
        .stat-card:nth-child(4) { animation-delay: 0.19s; }
        .stat-card:nth-child(5) { animation-delay: 0.24s; }
        .milestone-badge { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .milestone-badge:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .code-row { transition: background 0.15s; }
        .code-row:hover { background: #161616 !important; }
        .partner-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        @media (max-width: 680px) { .partner-2col { grid-template-columns: 1fr; } }
      `}</style>

      {showTour && (
        <TourOverlay
          step={tourStep}
          onNext={() => setTourStep(s => s + 1)}
          onPrev={() => setTourStep(s => s - 1)}
          onSkip={completeTour}
          onFinish={completeTour}
        />
      )}

      <ConfettiBlast active={confetti} />

      <PartnersHeader email={userEmail} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Suspended banner ── */}
        {profile.status === 'suspended' && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f87171' }}>Account Suspended</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: muted }}>Your account has been suspended. Contact hello@socialmate.studio to resolve this.</p>
            </div>
          </div>
        )}

        {/* ── W-9 alert ── */}
        {profile.w9_required && !profile.w9_submitted && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 12, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: gold }}>W-9 Required</p>
              <p style={{ margin: '4px 0 8px', fontSize: 13, color: muted }}>
                Your earnings have reached $599. Submit a W-9 within 60 days to avoid forfeiture.
                {profile.w9_forfeiture_deadline && ` Deadline: ${new Date(profile.w9_forfeiture_deadline).toLocaleDateString()}`}
              </p>
              <a href="#w9-section" style={{ fontSize: 13, color: gold, fontWeight: 700, textDecoration: 'none' }}>Submit W-9 →</a>
            </div>
          </div>
        )}

        {/* ── Unread notifications ── */}
        {unread.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            {unread.map(n => (
              <div key={n.id} style={{ background: 'rgba(124,58,237,0.08)', border: `1px solid rgba(124,58,237,0.2)`, borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14 }}>🔔</span>
                <span style={{ fontSize: 13, color: '#c4b5fd' }}>{n.subject}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              {profile.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]} 👋` : 'Partner Dashboard'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: muted }}>Commission rate:</span>
              <span style={{
                background: `linear-gradient(135deg, rgba(245,158,11,0.18), rgba(124,58,237,0.18))`,
                border: `1px solid rgba(245,158,11,0.35)`,
                borderRadius: 20, padding: '3px 14px',
                fontSize: 13, fontWeight: 800, color: gold,
              }}>
                {commission_label} recurring
              </span>
              {profile.status === 'active' && (
                <span style={{ background: 'rgba(34,197,94,0.12)', color: green, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  ● Active
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => { setTourStep(0); setShowTour(true) }}
            style={{
              padding: '8px 16px', borderRadius: 10,
              border: `1px solid ${border}`, background: surf2,
              color: muted, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            🗺️ Retake Tour
          </button>
        </div>

        {/* ── Stats cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Pending',          value: cents(pendingCents),                      sub: '60-day hold',             icon: '⏳', accent: gold },
            { label: 'Available',        value: cents(profile.available_balance_cents),   sub: 'Ready to cash out',       icon: '✅', accent: green },
            { label: 'Paid Out',         value: cents(profile.paid_out_cents),            sub: 'Total disbursed',         icon: '💳', accent: '#60a5fa' },
            { label: `${new Date().getFullYear()} Earnings`, value: cents(profile.lifetime_earnings_cents), sub: 'W-9 required at $600', icon: '📅', accent: '#e879f9' },
            { label: 'Active Referrals', value: String(profile.active_referral_count),   sub: `${commission_label}/renewal`, icon: '👥', accent: purple },
          ].map(stat => (
            <div key={stat.label} className="stat-card" style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 16, padding: '20px 20px 16px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stat.accent, opacity: 0.7, borderRadius: '16px 16px 0 0' }} />
              <div style={{ fontSize: 22, marginBottom: 10 }}>{stat.icon}</div>
              <div style={{ fontSize: 23, fontWeight: 900, color: '#f1f1f1', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginTop: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Milestones ── */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#f1f1f1' }}>Milestone Badges</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: muted }}>
                {MILESTONES.filter(m => m.check(profile)).length} / {MILESTONES.length} unlocked
              </p>
            </div>
            <div style={{ fontSize: 22 }}>🏅</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {MILESTONES.map(m => {
              const unlocked = m.check(profile)
              return (
                <div key={m.id} className="milestone-badge" style={{
                  background: unlocked
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(124,58,237,0.1))'
                    : '#0d0d0d',
                  border: `1px solid ${unlocked ? 'rgba(245,158,11,0.25)' : border}`,
                  borderRadius: 12, padding: '12px 14px',
                  opacity: unlocked ? 1 : 0.35,
                  minWidth: 108,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{unlocked ? m.icon : '🔒'}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: unlocked ? '#f1f1f1' : muted, lineHeight: 1.3 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 3 }}>{m.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Tier progress ── */}
        {next_tier && (
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#f1f1f1' }}>Progress to 40% Elite Tier</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: muted }}>
                  {profile.active_referral_count} / 100 active referrals — {next_tier.remaining} more to go
                </p>
              </div>
              <span style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(245,158,11,0.18))',
                border: `1px solid rgba(124,58,237,0.3)`,
                borderRadius: 20, padding: '4px 14px',
                fontSize: 13, fontWeight: 800, color: purple,
              }}>
                Currently {commission_label}
              </span>
            </div>
            <div style={{ height: 10, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 8,
                background: `linear-gradient(90deg, ${gold}, ${purple})`,
                width: `${tierProgress}%`, transition: 'width 1.2s ease',
                boxShadow: `0 0 14px rgba(245,158,11,0.35)`,
              }} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: muted }}>
              Hit <strong style={{ color: gold }}>100 active referrals</strong> → unlock <strong style={{ color: gold }}>40% recurring commission — forever</strong>
            </p>
          </div>
        )}

        {/* ── Referral link + SocialMate promo codes ── */}
        <div className="partner-2col">

          {/* Referral link */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>🔗</span>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Referral Link</h3>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 11, color: '#4b5563' }}>
              Earns {commission_label} on every signup that subscribes — monthly, 3mo, 6mo, or 12mo.
            </p>
            <div style={{ background: '#080808', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {referral_link}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => copy(referral_link, 'link')}
                style={{
                  padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${copied === 'link' ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.3)'}`,
                  background: copied === 'link' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.08)',
                  color: copied === 'link' ? green : gold,
                  fontSize: 13, fontWeight: 700,
                }}
              >
                {copied === 'link' ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: 'SocialMate', url: referral_link })
                  } else {
                    copy(referral_link, 'link')
                  }
                }}
                style={{
                  padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid rgba(124,58,237,0.3)`,
                  background: `rgba(124,58,237,0.08)`,
                  color: '#c4b5fd',
                  fontSize: 13, fontWeight: 700,
                }}
              >
                🚀 Share
              </button>
            </div>
          </div>

          {/* SocialMate promo codes */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>🎁</span>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>SocialMate Codes</h3>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 11, color: '#4b5563' }}>Share for discounts. You earn on every sub and renewal they make.</p>
            {promo_codes.length === 0 ? (
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Promo codes appear here after setup. Contact support if missing.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {promo_codes.map(code => (
                  <div key={code.id} className="code-row" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    background: '#0a0a0a', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 12px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: gold, letterSpacing: '0.05em' }}>
                          {code.code}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', background: '#1a1a1a', border: `1px solid ${border}`, padding: '1px 6px', borderRadius: 4 }}>
                          {code.description}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>
                        {code.times_used > 0 ? `Used ${code.times_used}× · earning on renewals` : 'Share it to start earning'}
                      </div>
                    </div>
                    <button
                      onClick={() => copy(code.code, code.id)}
                      style={{
                        padding: '5px 12px', borderRadius: 8, flexShrink: 0, fontFamily: 'inherit',
                        border: `1px solid ${copied === code.id ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.3)'}`,
                        background: copied === code.id ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.07)',
                        color: copied === code.id ? green : gold,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
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

        {/* ── Enki promo codes (Coming Soon) ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(245,158,11,0.05))',
          border: `1px solid rgba(124,58,237,0.2)`,
          borderRadius: 16, padding: 24, marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#f1f1f1' }}>Enki Promo Codes</h3>
                <span style={{
                  background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                  borderRadius: 20, padding: '2px 12px',
                  fontSize: 10, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.06em',
                }}>
                  COMING SOON
                </span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: muted, lineHeight: 1.75, maxWidth: 560 }}>
                When Enki launches, your affiliate account automatically covers it — same dashboard, same commission structure.
                You'll get dedicated Enki promo codes right here covering Commander and Emperor subscriptions.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { tier: 'Citizen',   color: '#10b981', sub: 'Free · No promo needed',   icon: '🆓' },
                  { tier: 'Commander', color: gold,      sub: '30%–40% commission',        icon: '⚔️' },
                  { tier: 'Emperor',   color: purple,    sub: '30%–40% commission',        icon: '👑' },
                ].map(t => (
                  <div key={t.tier} style={{
                    background: '#0a0a0a', border: `1px solid ${border}`,
                    borderRadius: 10, padding: '8px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: 0.65,
                  }}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: t.color }}>{t.tier}</div>
                      <div style={{ fontSize: 10, color: '#4b5563' }}>{t.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>🏅</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#f1f1f1' }}>Partner Leaderboard</h3>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: muted }}>Opt in to appear and see how you rank. Anonymous mode hides your name.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>Show on Leaderboard</span>
                <Toggle
                  on={lbOptIn}
                  onChange={v => saveLbSettings(v, lbAnonymous)}
                  activeColor={gold}
                  disabled={lbSaving}
                />
              </div>
              {lbOptIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>Stay Anonymous</span>
                  <Toggle
                    on={lbAnonymous}
                    onChange={v => saveLbSettings(lbOptIn, v)}
                    activeColor={purple}
                    disabled={lbSaving}
                  />
                </div>
              )}
            </div>
          </div>

          {!lbOptIn ? (
            <div style={{ textAlign: 'center', padding: '32px 0', background: '#0a0a0a', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
              <p style={{ fontSize: 14, color: muted, margin: '0 0 4px' }}>You're not on the leaderboard yet.</p>
              <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>Toggle "Show on Leaderboard" above. You can stay anonymous.</p>
            </div>
          ) : lbLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', background: '#0a0a0a', borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>No entries yet — you might be first on the board!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: entry.is_me ? 'rgba(245,158,11,0.07)' : '#0a0a0a',
                  border: `1px solid ${entry.is_me ? 'rgba(245,158,11,0.25)' : border}`,
                  borderRadius: 12, padding: '12px 16px',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 900, minWidth: 28, textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{ color: muted }}>#{entry.rank}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: entry.is_me ? gold : '#f1f1f1' }}>
                      {entry.name} {entry.is_me && <span style={{ fontSize: 11, color: gold, fontWeight: 600 }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: muted }}>{entry.active_referral_count} active referrals</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: green }}>{cents(entry.total_earnings_cents)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Payout ── */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>💳</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#f1f1f1' }}>Request Payout</h3>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: muted, lineHeight: 1.6 }}>
                Available: <strong style={{ color: green }}>{cents(profile.available_balance_cents)}</strong>
                {' '}· Minimum $25.00 · 60-day hold on new earnings
              </p>
              {!canRequestPayout && profile.available_balance_cents < 2500 && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#374151' }}>
                  {cents(2500 - profile.available_balance_cents)} more to reach the $25 minimum
                </p>
              )}
              {payoutError   && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#f87171' }}>{payoutError}</p>}
              {payoutSuccess && <p style={{ margin: '8px 0 0', fontSize: 13, color: green }}>✓ Payout requested! Confirmation email on the way.</p>}
            </div>
            <button
              onClick={requestPayout}
              disabled={!canRequestPayout || payoutLoading || profile.status !== 'active'}
              style={{
                padding: '12px 28px', borderRadius: 12, border: 'none', flexShrink: 0, fontFamily: 'inherit',
                background: canRequestPayout && profile.status === 'active'
                  ? `linear-gradient(135deg, ${gold}, ${purple})`
                  : '#1a1a1a',
                color: canRequestPayout && profile.status === 'active' ? '#fff' : muted,
                fontSize: 14, fontWeight: 700,
                cursor: canRequestPayout ? 'pointer' : 'not-allowed',
                opacity: payoutLoading ? 0.6 : 1,
              }}
            >
              {payoutLoading ? 'Requesting...' : 'Request Payout'}
            </button>
          </div>
        </div>

        {/* ── W-9 ── */}
        {(profile.w9_required || profile.lifetime_earnings_cents >= 50000) && (
          <div id="w9-section" style={{
            background: surface,
            border: `1px solid ${profile.w9_required && !profile.w9_submitted ? 'rgba(245,158,11,0.3)' : border}`,
            borderRadius: 16, padding: 24, marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>📋</span>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#f1f1f1' }}>W-9 Tax Form</h3>
              {profile.w9_submitted && (
                <span style={{ background: 'rgba(34,197,94,0.12)', color: green, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                  Submitted ✓
                </span>
              )}
            </div>
            {!profile.w9_submitted ? (
              <>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: muted, lineHeight: 1.6 }}>
                  IRS regulations require a W-9 when lifetime earnings reach $599. Upload yours below.
                  {profile.w9_forfeiture_deadline && (
                    <span style={{ color: '#f87171' }}> Deadline: {new Date(profile.w9_forfeiture_deadline).toLocaleDateString()}. Missing it forfeits withheld funds.</span>
                  )}
                </p>
                <W9UploadForm affiliateId={profile.id} onSuccess={() => window.location.reload()} />
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: green }}>
                ✓ W-9 on file since {profile.w9_withholding_started_at ? new Date(profile.w9_withholding_started_at).toLocaleDateString() : 'submission'}.
              </p>
            )}
          </div>
        )}

        {/* ── Conversions / Payouts tabs ── */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
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
                }}
              >
                {tab === 'conversions' ? `💰 Conversions (${conversions.length})` : `💳 Payouts (${payouts.length})`}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {activeTab === 'conversions' && (
              conversions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
                  <p style={{ fontSize: 14, color: muted, margin: '0 0 4px' }}>No conversions yet.</p>
                  <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>Share your referral link to start earning!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {['User', 'Event', 'Plan', 'Revenue', 'Commission', 'Status', 'Date'].map((h, i) => (
                          <th key={h} style={{ textAlign: i >= 3 && i <= 4 ? 'right' : 'left', padding: `0 ${i >= 5 ? 16 : 0}px 12px`, fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {conversions.map(c => (
                        <tr key={c.id} style={{ borderTop: `1px solid ${border}` }}>
                          <td style={{ padding: '12px 0', color: '#d1d5db' }}>
                            {c.referred_user_email ? c.referred_user_email.replace(/(.{2}).*(@.*)/, '$1***$2') : '—'}
                          </td>
                          <td style={{ padding: '12px 0', color: '#d1d5db', textTransform: 'capitalize' }}>{c.event_type}</td>
                          <td style={{ padding: '12px 0', color: '#9ca3af' }}>{c.plan ?? '—'}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', color: '#d1d5db' }}>{cents(c.amount_cents)}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', color: gold, fontWeight: 700 }}>{cents(c.commission_cents)}</td>
                          <td style={{ padding: '12px 16px' }}>{statusBadge(c.status)}</td>
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
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
                  <p style={{ fontSize: 14, color: muted, margin: 0 }}>No payouts yet — keep building that balance!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {['Amount', 'Status', 'Requested', 'Paid'].map((h, i) => (
                          <th key={h} style={{ textAlign: 'left', padding: `0 ${i >= 2 ? 16 : 0}px 12px`, fontWeight: 700 }}>{h}</th>
                        ))}
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

      <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: `1px solid ${border}` }}>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
          © {new Date().getFullYear()} Gilgamesh Enterprise LLC · SocialMate Partner Program ·{' '}
          <a href="mailto:hello@socialmate.studio" style={{ color: muted, textDecoration: 'none' }}>Support</a>
        </p>
      </footer>
    </div>
  )
}

// ── W-9 upload sub-component ─────────────────────────────────────────────────

function W9UploadForm({ affiliateId, onSuccess }: { affiliateId: string; onSuccess: () => void }) {
  const [legalName, setLegalName]   = useState('')
  const [address, setAddress]       = useState('')
  const [city, setCity]             = useState('')
  const [state, setState]           = useState('')
  const [zip, setZip]               = useState('')
  const [taxIdLast4, setTaxIdLast4] = useState('')
  const [file, setFile]             = useState<File | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: '#0a0a0a', border: `1px solid ${border}`,
    color: '#f1f1f1', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, color: muted, marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  }

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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelStyle}>Legal Name *</label>
        <input value={legalName} onChange={e => setLegalName(e.target.value)} style={inputStyle} placeholder="Full legal name" />
      </div>
      <div>
        <label style={labelStyle}>Last 4 of SSN/EIN *</label>
        <input value={taxIdLast4} onChange={e => setTaxIdLast4(e.target.value.replace(/\D/, '').slice(0, 4))} style={inputStyle} placeholder="XXXX" maxLength={4} />
      </div>
      <div>
        <label style={labelStyle}>Address</label>
        <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="Street address" />
      </div>
      <div>
        <label style={labelStyle}>City</label>
        <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>State</label>
        <input value={state} onChange={e => setState(e.target.value)} style={inputStyle} placeholder="CA" maxLength={2} />
      </div>
      <div>
        <label style={labelStyle}>ZIP</label>
        <input value={zip} onChange={e => setZip(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelStyle}>W-9 PDF *</label>
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
          background: `linear-gradient(135deg, ${gold}, ${purple})`,
          color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
        }}
      >
        {loading ? 'Uploading...' : 'Submit W-9'}
      </button>
    </form>
  )
}

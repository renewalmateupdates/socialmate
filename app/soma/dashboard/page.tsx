'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ── Types ────────────────────────────────────────────────────────────────────

interface SomaProject {
  id: string
  name: string
  platforms: string[]
  mode: 'safe' | 'autopilot' | 'full_send'
  posts_per_day: number
  content_window_days: number
  runs_this_month: number
  last_generated_at: string | null
}

interface SomaCredits {
  monthly: number
  used: number
  purchased: number
  remaining: number
  plan: string
  autopilot_enabled: boolean
  mode: 'safe' | 'autopilot' | 'full_send'
}

interface IdentityProfile {
  id: string
  interview_completed: boolean
  last_updated: string
}

interface WeeklyIngestion {
  id: string
  week_label: string
  key_themes: string[]
  post_count: number
  created_at: string
}

interface DraftPost {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  metadata: Record<string, string> | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeSlotIcon(scheduledAt: string | null): string {
  if (!scheduledAt) return '📋'
  const h = new Date(scheduledAt).getHours()
  if (h < 12) return '🌅'
  if (h < 17) return '☀️'
  return '🌙'
}

function dayLabel(scheduledAt: string | null): string {
  if (!scheduledAt) return 'Unscheduled'
  return new Date(scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter:  'bg-sky-900/60 text-sky-300 border-sky-700/40',
  bluesky:  'bg-blue-900/60 text-blue-300 border-blue-700/40',
  mastodon: 'bg-purple-900/60 text-purple-300 border-purple-700/40',
  discord:  'bg-indigo-900/60 text-indigo-300 border-indigo-700/40',
  telegram: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/40',
}

function PlatformBadge({ platform }: { platform: string }) {
  const cls = PLATFORM_COLORS[platform.toLowerCase()] ?? 'bg-gray-800 text-gray-300 border-gray-700/40'
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls}`}>
      {platform}
    </span>
  )
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────

const SOMA_AUTOPILOT_PRICE_ID  = 'price_1TP8rU7OMwDowUuUYLBNAVux'
const SOMA_FULL_SEND_PRICE_ID  = 'price_1TPlGE7OMwDowUuUWS0QUnLw'

const TIERS = [
  {
    id:       'autopilot',
    priceId:  SOMA_AUTOPILOT_PRICE_ID,
    icon:     '⚡',
    name:     'Autopilot',
    price:    '$10/mo',
    color:    'border-violet-500/50 bg-violet-900/20',
    badge:    'text-violet-300',
    btn:      'from-violet-500 to-violet-400',
    features: [
      'Posts auto-schedule — no review required per post',
      'You get a notification batch to approve or skip',
      '8 generation runs/month',
      'Up to 5 posts/day, 14-day windows',
    ],
  },
  {
    id:       'full_send',
    priceId:  SOMA_FULL_SEND_PRICE_ID,
    icon:     '🚀',
    name:     'Full Send',
    price:    '$20/mo',
    color:    'border-amber-500/50 bg-amber-900/20',
    badge:    'text-amber-300',
    btn:      'from-amber-500 to-yellow-400',
    features: [
      'Fully autonomous — posts go live with zero review',
      'Maximum 12 generation runs/month',
      'Up to 10 posts/day, 14-day windows',
      'Priority Gemini processing',
    ],
  },
]

function AutopilotModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const handleUpgrade = async (priceId: string, tierId: string) => {
    setLoading(tierId)
    setErr('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) { setErr(data.error || 'Could not start checkout.'); setLoading(null); return }
      window.location.href = data.url
    } catch {
      setErr('Network error. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-amber-400 to-amber-500" />
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-white mb-1">Unlock SOMA Automation</h2>
            <p className="text-gray-400 text-sm">Choose how autonomous you want SOMA to be.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {TIERS.map(tier => (
              <div key={tier.id} className={`rounded-xl border p-4 flex flex-col ${tier.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <p className={`text-sm font-extrabold ${tier.badge}`}>{tier.name}</p>
                    <p className="text-xs text-gray-400">{tier.price}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-300">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(tier.priceId, tier.id)}
                  disabled={loading !== null}
                  className={`w-full bg-gradient-to-r ${tier.btn} text-gray-900 font-extrabold text-xs px-4 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading === tier.id ? 'Redirecting…' : `Get ${tier.name} →`}
                </button>
              </div>
            ))}
          </div>

          {err && <p className="text-xs text-red-400 text-center mb-3">{err}</p>}

          <p className="text-center text-xs text-gray-600 mb-3">
            Safe Mode (free) stays available. You can downgrade anytime from Settings.
          </p>
          <button onClick={onClose} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1">
            Stay on Safe Mode
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function SomaDashboardPage() {
  const router = useRouter()

  const [loading, setLoading]                 = useState(true)
  const [credits, setCredits]                 = useState<SomaCredits | null>(null)
  const [identity, setIdentity]               = useState<IdentityProfile | null>(null)
  const [identityChecked, setIdentityChecked] = useState(false)
  const [ingestion, setIngestion]             = useState<WeeklyIngestion | null>(null)
  const [drafts, setDrafts]                   = useState<DraftPost[]>([])
  const [currentMode, setCurrentMode]         = useState<'safe' | 'autopilot' | 'full_send'>('safe')
  const [showAutopilotModal, setShowAutopilotModal] = useState(false)
  const [approvingAll, setApprovingAll]       = useState(false)
  const [actionLoading, setActionLoading]     = useState<Record<string, boolean>>({})
  const [ledger, setLedger]                   = useState<{ id: string; action_type: string; credits_used: number; balance_after: number; created_at: string }[]>([])
  const [showLedger, setShowLedger]           = useState(false)
  const [ledgerLoading, setLedgerLoading]     = useState(false)
  const [projects, setProjects]               = useState<SomaProject[]>([])
  const [projectLimit, setProjectLimit]       = useState(1)

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/soma/dashboard'); return }

      // Fetch credits + mode
      const creditsRes = await fetch('/api/soma/credits')
      if (creditsRes.ok) {
        const c = await creditsRes.json() as SomaCredits
        setCredits(c)
        setCurrentMode(c.mode)

        // Redirect free plan users — Pro/Agency always get through (credits auto-provision)
        const normalizedPlan = c.plan?.replace('_annual', '') ?? 'free'
        if (normalizedPlan === 'free') {
          router.push('/soma/upgrade')
          return
        }
      }

      // Identity profile — use server API route (cookie-based auth, reliable in SSR)
      const identityRes = await fetch('/api/soma/identity')
      if (identityRes.ok) {
        const identityData = await identityRes.json()
        setIdentity(identityData.profile ?? null)
      }
      setIdentityChecked(true)

      // Latest ingestion
      const ingRes = await fetch('/api/soma/ingestion/latest')
      if (ingRes.ok) {
        const ingData = await ingRes.json()
        setIngestion(ingData.ingestion ?? null)
      }

      // Projects
      const projectsRes = await fetch('/api/soma/projects')
      if (projectsRes.ok) {
        const pd = await projectsRes.json()
        setProjects(pd.projects ?? [])
        setProjectLimit(pd.limit ?? 1)
      }

      // SOMA-generated drafts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, platforms, scheduled_at, metadata')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('scheduled_at', { ascending: true, nullsFirst: false })

      const somaPosts = (posts ?? []).filter(
        (p: any) => p.metadata?.source === 'soma'
      )
      setDrafts(somaPosts)

    } catch (err) {
      console.error('SOMA dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const loadLedger = async () => {
    if (ledgerLoading) return
    setLedgerLoading(true)
    try {
      const res = await fetch('/api/soma/credit-history')
      if (res.ok) {
        const d = await res.json()
        setLedger(d.entries ?? [])
      }
    } finally {
      setLedgerLoading(false)
    }
  }

  const toggleLedger = () => {
    if (!showLedger && ledger.length === 0) loadLedger()
    setShowLedger(p => !p)
  }

  // ── Mode toggle ─────────────────────────────────────────────────────────────

  const handleModeToggle = async (mode: 'safe' | 'autopilot' | 'full_send') => {
    if (mode === currentMode) return

    // Autopilot requires purchase
    if (mode === 'autopilot' && !credits?.autopilot_enabled) {
      setShowAutopilotModal(true)
      return
    }

    // Full Send requires purchase — only available if already on full_send mode
    if (mode === 'full_send' && credits?.mode !== 'full_send') {
      setShowAutopilotModal(true)
      return
    }

    const res = await fetch('/api/soma/mode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    if (res.ok) setCurrentMode(mode)
  }

  // ── Post actions ─────────────────────────────────────────────────────────────

  const approvePost = async (id: string) => {
    setActionLoading(p => ({ ...p, [id]: true }))
    await supabase.from('posts').update({ status: 'scheduled' }).eq('id', id)
    setDrafts(p => p.filter(d => d.id !== id))
    setActionLoading(p => ({ ...p, [id]: false }))
  }

  const skipPost = async (id: string) => {
    setActionLoading(p => ({ ...p, [id]: true }))
    await supabase
      .from('posts')
      .update({ status: 'failed', metadata: { source: 'soma', skip_reason: 'User skipped from SOMA queue' } })
      .eq('id', id)
    setDrafts(p => p.filter(d => d.id !== id))
    setActionLoading(p => ({ ...p, [id]: false }))
  }

  const approveAll = async () => {
    if (drafts.length === 0) return
    setApprovingAll(true)
    const ids = drafts.map(d => d.id)
    await supabase.from('posts').update({ status: 'scheduled' }).in('id', ids)
    setDrafts([])
    setApprovingAll(false)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const creditsBar = credits && credits.monthly > 0
    ? Math.min(100, ((credits.monthly - credits.used) / credits.monthly) * 100)
    : 0
  const creditsBarColor = creditsBar < 15 ? '#f87171' : creditsBar < 30 ? '#facc15' : '#f59e0b'

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      {showAutopilotModal && <AutopilotModal onClose={() => setShowAutopilotModal(false)} />}

      <main className="flex-1 md:ml-56 p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              <span className="text-white">SOMA</span>
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Self-Optimizing Media Agent</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-900 border border-gray-800 self-start sm:self-auto">
            <button
              onClick={() => handleModeToggle('safe')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentMode === 'safe'
                  ? 'bg-green-900/70 text-green-300 border border-green-700/50 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>🟢</span> Safe
            </button>
            <button
              onClick={() => handleModeToggle('autopilot')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentMode === 'autopilot'
                  ? 'bg-amber-900/70 text-amber-300 border border-amber-700/50 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>⚡</span> Autopilot
              {!credits?.autopilot_enabled && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-800/60 text-amber-400 border border-amber-700/40 ml-0.5">
                  $10
                </span>
              )}
            </button>
            <button
              onClick={() => handleModeToggle('full_send')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                currentMode === 'full_send'
                  ? 'bg-purple-900/70 text-purple-300 border border-purple-700/50 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>🚀</span> Full Send
              {credits?.mode !== 'full_send' && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-purple-800/60 text-purple-400 border border-purple-700/40 ml-0.5">
                  $20
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── TOP CARDS ROW ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Credits Card */}
          <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">SOMA Credits</h2>
              <Link
                href="/settings?tab=plan"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                + Add Credits
              </Link>
            </div>

            {loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-extrabold text-white">
                    {credits?.remaining ?? 0}
                  </span>
                  <span className="text-gray-500 text-sm font-medium">
                    / {credits?.monthly ?? 0} monthly
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-800 mb-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${creditsBar}%`, background: creditsBarColor }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{Math.round(creditsBar)}% remaining</span>
                  {(credits?.purchased ?? 0) > 0 && (
                    <span className="text-amber-400/80">+{credits!.purchased} purchased</span>
                  )}
                </div>

                {/* Credit history toggle */}
                <button
                  onClick={toggleLedger}
                  className="mt-3 text-xs text-amber-400/60 hover:text-amber-400 transition-colors font-medium"
                >
                  {showLedger ? '▲ Hide history' : '▼ View credit history'}
                </button>

                {showLedger && (
                  <div className="mt-3 border-t border-gray-800 pt-3 space-y-2">
                    {ledgerLoading && (
                      <div className="text-xs text-gray-500 py-2 text-center">Loading…</div>
                    )}
                    {!ledgerLoading && ledger.length === 0 && (
                      <div className="text-xs text-gray-500 py-2 text-center">No credit activity yet.</div>
                    )}
                    {!ledgerLoading && ledger.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-gray-300 capitalize">
                            {entry.action_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-gray-600 ml-2">
                            {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-red-400 font-bold">−{entry.credits_used}</span>
                          <span className="text-gray-600">{entry.balance_after} left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Identity Card */}
          <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-3">Identity Status</h2>

            {!identityChecked || loading ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : !identity || !identity.interview_completed ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-yellow-300">⚠️ Voice profile not set up</p>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  SOMA needs to learn your voice before it can generate content that sounds like you.
                </p>
                <Link
                  href="/soma/onboarding"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Setup now →
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-300">✅ Voice profile active</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Last updated{' '}
                  {new Date(identity.last_updated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <Link
                  href="/soma/onboarding"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Edit profile →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── WEEKLY INGESTION CARD ──────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">📋 This Week's Ingestion</h2>
            <Link
              href="/soma/weekly"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              + New Ingestion →
            </Link>
          </div>

          {loading ? (
            <div className="h-10 bg-gray-800 rounded animate-pulse" />
          ) : !ingestion ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">No ingestion this week yet.</p>
                <p className="text-xs text-gray-500 mt-0.5">Run an ingestion to give SOMA fresh material to work with.</p>
              </div>
              <Link
                href="/soma/weekly"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all whitespace-nowrap"
              >
                Start this week →
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{ingestion.week_label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ingestion.post_count ?? 0} posts generated
                  </p>
                </div>
                <Link
                  href="/soma/weekly"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all whitespace-nowrap self-start sm:self-auto"
                >
                  New ingestion →
                </Link>
              </div>

              {/* Key themes pills */}
              {ingestion.key_themes && ingestion.key_themes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingestion.key_themes.slice(0, 6).map((theme: string) => (
                    <span
                      key={theme}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-900/30 border border-amber-800/40 text-amber-300/80"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CONTENT QUEUE ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Content Queue</h2>
              <p className="text-xs text-gray-500 mt-0.5">SOMA-generated drafts awaiting your approval</p>
            </div>
            {drafts.length > 0 && (
              <button
                onClick={approveAll}
                disabled={approvingAll}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-green-900/50 border border-green-700/40 text-green-300 hover:bg-green-900/70 transition-all disabled:opacity-60"
              >
                {approvingAll ? 'Approving…' : `Approve All (${drafts.length})`}
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl mb-3 block">✅</span>
              <p className="text-sm font-semibold text-gray-300">Queue is clear</p>
              <p className="text-xs text-gray-500 mt-1">Run a weekly ingestion to generate new content.</p>
              <Link
                href="/soma/weekly"
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                Run ingestion →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map(post => (
                <div
                  key={post.id}
                  className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 hover:border-amber-500/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base flex-shrink-0">{timeSlotIcon(post.scheduled_at)}</span>
                        <span className="text-xs font-semibold text-gray-400">{dayLabel(post.scheduled_at)}</span>
                        <div className="flex gap-1 flex-wrap">
                          {(post.platforms ?? []).map((p: string) => (
                            <PlatformBadge key={p} platform={p} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                        {post.content?.slice(0, 140)}{(post.content?.length ?? 0) > 140 ? '…' : ''}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => approvePost(post.id)}
                        disabled={!!actionLoading[post.id]}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-900/50 border border-green-700/40 text-green-300 hover:bg-green-900/70 transition-all disabled:opacity-60 whitespace-nowrap"
                      >
                        {actionLoading[post.id] ? '…' : 'Approve'}
                      </button>
                      <Link
                        href={`/compose?edit=${post.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all whitespace-nowrap"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => skipPost(post.id)}
                        disabled={!!actionLoading[post.id]}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-800/40 text-red-400 hover:bg-red-900/50 transition-all disabled:opacity-60 whitespace-nowrap"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PROJECTS ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">SOMA Projects</h2>
              <p className="text-xs text-gray-500 mt-0.5">Named pipelines — each with their own master doc and settings</p>
            </div>
            {projects.length < projectLimit && (
              <Link
                href="/soma/projects/new"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all whitespace-nowrap"
              >
                + New Project
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-gray-300 mb-1">No projects yet</p>
              <p className="text-xs text-gray-500 mb-4">Create a project to start your master doc pipeline.</p>
              <Link
                href="/soma/projects/new"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                Create your first project →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(p => (
                <Link
                  key={p.id}
                  href={`/soma/projects/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950/60 p-4 hover:border-amber-500/30 transition-all group"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.platforms.join(' · ')} · {p.posts_per_day}/day · {p.content_window_days}-day window · <span className="capitalize">{p.mode.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {p.last_generated_at && (
                      <span className="text-[10px] text-gray-500">
                        Generated {new Date(p.last_generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className="text-gray-600 group-hover:text-amber-400 transition-colors text-sm">→</span>
                  </div>
                </Link>
              ))}
              {projects.length >= projectLimit && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  {projectLimit} project limit on your plan.{' '}
                  <Link href="/pricing" className="text-amber-400 hover:text-amber-300">Upgrade for more →</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/soma/onboarding"
            className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-amber-500/30 hover:bg-gray-900/80 transition-all p-4 group"
          >
            <span className="text-xl">🧠</span>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Setup Voice Profile</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Teach SOMA how you speak</p>
            </div>
            <span className="ml-auto text-gray-600 group-hover:text-amber-400 transition-colors text-sm">→</span>
          </Link>

          <Link
            href="/soma/weekly"
            className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-amber-500/30 hover:bg-gray-900/80 transition-all p-4 group"
          >
            <span className="text-xl">📋</span>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">This Week's Ingestion</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Feed SOMA fresh content ideas</p>
            </div>
            <span className="ml-auto text-gray-600 group-hover:text-amber-400 transition-colors text-sm">→</span>
          </Link>

          <Link
            href="/drafts"
            className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-amber-500/30 hover:bg-gray-900/80 transition-all p-4 group"
          >
            <span className="text-xl">📂</span>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">View All Drafts</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Everything in draft status</p>
            </div>
            <span className="ml-auto text-gray-600 group-hover:text-amber-400 transition-colors text-sm">→</span>
          </Link>
        </div>

      </main>
    </div>
  )
}

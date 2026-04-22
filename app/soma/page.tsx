'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ── Types ────────────────────────────────────────────────────────────────────

interface SomaCredits {
  monthly: number
  used: number
  purchased: number
  remaining: number
  autopilot_enabled: boolean
  mode: 'safe' | 'autopilot'
}

interface IdentityProfile {
  id: string
  interview_completed: boolean
  updated_at: string
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

// ── Autopilot Upgrade Modal ───────────────────────────────────────────────────

function AutopilotModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-gray-900 shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-4xl">🔥</span>
            <h2 className="text-xl font-extrabold text-white mt-2 mb-1">SOMA Autopilot</h2>
            <p className="text-gray-400 text-sm">Unlock fully automated content scheduling.</p>
          </div>

          <ul className="space-y-2.5 mb-6">
            {[
              'Auto-schedules generated posts',
              'Continuously optimizes based on performance',
              'Runs ingestion + generation weekly',
              'Priority Gemini processing',
            ].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                <span className="text-green-400 flex-shrink-0">✅</span>
                {f}
              </li>
            ))}
          </ul>

          <p className="text-center text-amber-400 font-bold text-lg mb-5">$10/month add-on</p>

          <div className="flex flex-col gap-3">
            {/* TODO: SOMA_AUTOPILOT_PRICE_ID env var — set Stripe price ID when created */}
            <Link
              href="/settings?tab=plan"
              className="block w-full text-center bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-extrabold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
            >
              Upgrade to Autopilot →
            </Link>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-200 transition-colors py-2"
            >
              Stay on Safe Mode
            </button>
          </div>
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
  const [currentMode, setCurrentMode]         = useState<'safe' | 'autopilot'>('safe')
  const [showAutopilotModal, setShowAutopilotModal] = useState(false)
  const [approvingAll, setApprovingAll]       = useState(false)
  const [actionLoading, setActionLoading]     = useState<Record<string, boolean>>({})

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/soma'); return }

      // Fetch credits + mode
      const creditsRes = await fetch('/api/soma/credits')
      if (creditsRes.ok) {
        const c = await creditsRes.json() as SomaCredits
        setCredits(c)
        setCurrentMode(c.mode)

        // Redirect free users (no soma credits)
        if (c.monthly === 0) {
          router.push('/soma/upgrade')
          return
        }
      }

      // Identity profile
      const { data: profile } = await supabase
        .from('soma_identity_profiles')
        .select('id, interview_completed, updated_at')
        .eq('user_id', user.id)
        .maybeSingle()

      setIdentity(profile)
      setIdentityChecked(true)

      // Latest ingestion
      const { data: ing } = await supabase
        .from('soma_weekly_ingestion')
        .select('id, week_label, key_themes, post_count, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setIngestion(ing)

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

  // ── Mode toggle ─────────────────────────────────────────────────────────────

  const handleModeToggle = async (mode: 'safe' | 'autopilot') => {
    if (mode === currentMode) return

    if (mode === 'autopilot' && !credits?.autopilot_enabled) {
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                currentMode === 'safe'
                  ? 'bg-green-900/70 text-green-300 border border-green-700/50 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>🟢</span> Safe Mode
            </button>
            <button
              onClick={() => handleModeToggle('autopilot')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                currentMode === 'autopilot'
                  ? 'bg-amber-900/70 text-amber-300 border border-amber-700/50 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>🔥</span> Autopilot
              {!credits?.autopilot_enabled && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-800/60 text-amber-400 border border-amber-700/40 ml-0.5">
                  $10/mo
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
                  {new Date(identity.updated_at).toLocaleDateString('en-US', {
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

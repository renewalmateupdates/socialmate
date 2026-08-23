'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, CircleDollarSign, Plug, TrendingDown, UserPlus, Users,
} from 'lucide-react'

/**
 * The page that answers the questions nothing was counting.
 *
 * Deliberately split into two halves. Ground truth is computed from the tables
 * and is true all the way back to March. Recorded steps come from usage_events
 * and only exist from the day instrumentation shipped, so the page says so
 * rather than rendering an empty state that reads like a real zero.
 */

type Funnel = {
  windowDays: number
  recordedEvents: number
  groundTruth: {
    accounts: number; connected: number; published: number; paying: number
    neverConnected: number; connectedNeverPublished: number
  }
  platformCounts: { platform: string; count: number }[]
  steps: { step: string; users: number; fires: number }[]
  connectByPlatform: { platform: string; clicked: number; succeeded: number }[]
  failures: { reason: string; count: number }[]
  onboardingSteps: { step: string; fires: number }[]
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{children}</span>
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-edge bg-panel ${className}`}>{children}</div>
}

/** One rung of the funnel, with the drop from the rung above it. */
function Rung({
  icon: Icon, label, value, total, prev, tone = 'neutral',
}: {
  icon: typeof Users; label: string; value: number; total: number
  prev?: number; tone?: 'neutral' | 'good' | 'bad'
}) {
  const pctOfTotal = total > 0 ? (value / total) * 100 : 0
  const drop = prev !== undefined && prev > 0 ? ((prev - value) / prev) * 100 : null
  const colour = tone === 'good' ? 'text-jade' : tone === 'bad' ? 'text-alert' : 'text-ink-high'
  const bar    = tone === 'good' ? 'bg-jade' : tone === 'bad' ? 'bg-alert' : 'bg-amber'
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-edge last:border-b-0">
      <Icon className={`h-4 w-4 shrink-0 ${colour}`} strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-ink-high">{label}</div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-raised">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(pctOfTotal, value > 0 ? 1.5 : 0)}%` }} />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className={`font-mono text-2xl font-semibold tabular-nums ${colour}`}>{value.toLocaleString()}</div>
        {drop !== null && drop > 0 && (
          <div className="font-mono text-[10px] tabular-nums text-alert">&minus;{drop.toFixed(0)}%</div>
        )}
      </div>
    </div>
  )
}

function Bars({ rows, empty }: { rows: { label: string; a: number; b?: number }[]; empty: string }) {
  if (!rows.length) return <p className="px-5 py-4 text-xs text-ink-faint">{empty}</p>
  const max = Math.max(...rows.map(r => r.a), 1)
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      {rows.map(r => (
        <div key={r.label} className="grid grid-cols-[minmax(90px,150px)_1fr_auto] items-center gap-3">
          <span className="truncate text-xs capitalize text-ink-body">{r.label}</span>
          <span className="relative h-2 overflow-hidden rounded-full bg-raised">
            <span className="absolute inset-y-0 left-0 rounded-full bg-amber/35" style={{ width: `${(r.a / max) * 100}%` }} />
            {r.b !== undefined && (
              <span className="absolute inset-y-0 left-0 rounded-full bg-jade" style={{ width: `${(r.b / max) * 100}%` }} />
            )}
          </span>
          <span className="font-mono text-xs tabular-nums text-ink-muted">
            {r.b !== undefined ? `${r.b}/${r.a}` : r.a}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminFunnelPage() {
  const [data, setData]   = useState<Funnel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays]   = useState(30)

  useEffect(() => {
    setData(null); setError(null)
    fetch(`/api/admin/funnel?days=${days}`)
      .then(async r => (r.ok ? r.json() : Promise.reject(new Error((await r.json()).error ?? r.statusText))))
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [days])

  const g = data?.groundTruth

  return (
    <div className="min-h-dvh bg-void px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink-high">
          <ArrowLeft className="h-3.5 w-3.5" /> Admin
        </Link>

        <div className="mb-8">
          <Label>Activation</Label>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-high">Funnel</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Ground truth is computed from the tables and covers every account. Recorded steps come
            from instrumentation and only exist from the day it shipped.
          </p>
        </div>

        {error && (
          <Panel className="mb-6 border-alert/40 bg-alert/[0.07] p-5">
            <p className="text-sm text-alert">Could not load: {error}</p>
          </Panel>
        )}

        {!data && !error && <p className="text-sm text-ink-faint">Loading…</p>}

        {data && g && (
          <div className="flex flex-col gap-5">

            {/* ── Ground truth ─────────────────────────────────────────── */}
            <Panel>
              <div className="border-b border-edge px-5 py-3.5">
                <Label>Ground truth · all time</Label>
              </div>
              <Rung icon={UserPlus}        label="Created an account"     value={g.accounts}  total={g.accounts} />
              <Rung icon={Plug}            label="Connected a platform"   value={g.connected} total={g.accounts} prev={g.accounts}  tone={g.connected / Math.max(g.accounts, 1) < 0.3 ? 'bad' : 'neutral'} />
              <Rung icon={CheckCircle2}    label="Published a post"       value={g.published} total={g.accounts} prev={g.connected} tone={g.published < 5 ? 'bad' : 'good'} />
              <Rung icon={CircleDollarSign} label="Paying"                value={g.paying}    total={g.accounts} prev={g.published} tone={g.paying > 0 ? 'good' : 'neutral'} />
            </Panel>

            <div className="grid gap-5 sm:grid-cols-2">
              <Panel className="p-5">
                <Label>Stuck before connecting</Label>
                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-alert">{g.neverConnected}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Signed up, never linked a platform. This is the reactivation audience —
                  <code className="ml-1 font-mono text-[11px] text-ink-body">POST /api/admin/reactivate</code>
                </p>
              </Panel>
              <Panel className="p-5">
                <Label>Connected, never posted</Label>
                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-amber">{g.connectedNeverPublished}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Got through the hard part and stopped anyway. Worth an email before anyone else.
                </p>
              </Panel>
            </div>

            <Panel>
              <div className="border-b border-edge px-5 py-3.5">
                <Label>Connected accounts by platform</Label>
              </div>
              <Bars
                rows={data.platformCounts.map(p => ({ label: p.platform, a: p.count }))}
                empty="No connected accounts yet."
              />
            </Panel>

            {/* ── Recorded ─────────────────────────────────────────────── */}
            <div className="mt-4 flex items-center justify-between">
              <Label>Recorded steps · last {data.windowDays} days</Label>
              <div className="flex gap-1.5">
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-all ${
                      days === d ? 'border-amber/40 bg-amber/15 text-amber' : 'border-edge text-ink-muted hover:text-ink-high'
                    }`}
                  >{d}d</button>
                ))}
              </div>
            </div>

            {data.recordedEvents === 0 ? (
              <Panel className="p-5">
                <p className="text-sm text-ink-body">Nothing recorded yet.</p>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Instrumentation shipped today, so this fills in from here. The ground truth above
                  is unaffected and covers every account since March.
                </p>
              </Panel>
            ) : (
              <>
                <Panel>
                  <div className="border-b border-edge px-5 py-3.5">
                    <Label>Connect: clicked vs succeeded</Label>
                  </div>
                  <Bars
                    rows={data.connectByPlatform.map(p => ({ label: p.platform, a: p.clicked, b: p.succeeded }))}
                    empty="No connect attempts recorded in this window."
                  />
                  <p className="border-t border-edge px-5 py-3 text-[11px] text-ink-faint">
                    Amber is intent, jade is outcome. The gap is people who clicked Connect and never came back.
                  </p>
                </Panel>

                {data.failures.length > 0 && (
                  <Panel>
                    <div className="border-b border-edge px-5 py-3.5"><Label>Why connects failed</Label></div>
                    <div className="flex flex-col">
                      {data.failures.map(f => (
                        <div key={f.reason} className="flex items-center justify-between border-b border-edge px-5 py-2.5 last:border-b-0">
                          <span className="font-mono text-xs text-ink-body">{f.reason}</span>
                          <span className="font-mono text-xs tabular-nums text-alert">{f.count}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {data.onboardingSteps.length > 0 && (
                  <Panel>
                    <div className="border-b border-edge px-5 py-3.5 flex items-center gap-2">
                      <TrendingDown className="h-3.5 w-3.5 text-ink-faint" />
                      <Label>Onboarding drop-off by step</Label>
                    </div>
                    <Bars rows={data.onboardingSteps.map(s => ({ label: `Step ${s.step}`, a: s.fires }))} empty="" />
                  </Panel>
                )}

                <Panel>
                  <div className="border-b border-edge px-5 py-3.5"><Label>All steps · distinct users</Label></div>
                  <div className="flex flex-col">
                    {data.steps.map(s => (
                      <div key={s.step} className="flex items-center justify-between border-b border-edge px-5 py-2.5 last:border-b-0">
                        <span className="font-mono text-xs text-ink-body">{s.step}</span>
                        <span className="font-mono text-xs tabular-nums text-ink-muted">
                          <span className="text-ink-high">{s.users}</span> users · {s.fires} fires
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

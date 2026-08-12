'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Bot, AlertTriangle, MessageSquare, ChevronDown } from 'lucide-react'

interface ToolRow { tool: string; runs: number; credits: number; users: number }
interface ErrorRow { platform: string; message: string; count: number }
interface UsageData {
  windowDays: number
  aiTools: ToolRow[]
  agents: ToolRow[]
  totals: { aiRuns: number; aiCredits: number; agentRuns: number; failedPosts: number; feedback: number }
  topErrors: ErrorRow[]
}

function Panel({
  icon: Icon, title, sub, count, children, defaultOpen = true,
}: {
  icon: typeof Sparkles; title: string; sub: string; count: number
  children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-edge bg-panel overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-raised transition-colors"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-edge bg-raised text-amber">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ink-high">{title}</div>
          <div className="text-xs text-ink-muted mt-0.5">{sub}</div>
        </div>
        <span className="font-display text-2xl font-semibold text-amber tabular-nums">{count}</span>
        <ChevronDown className={`h-4 w-4 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-edge px-5 py-4">{children}</div>}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-faint py-2">{children}</p>
}

function ToolTable({ rows, unit }: { rows: ToolRow[]; unit: string }) {
  if (rows.length === 0) {
    return <Empty>Nothing recorded yet. Usage started being tracked when this shipped, so this fills in from here.</Empty>
  }
  const max = Math.max(...rows.map(r => r.runs))
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.tool} className="flex items-center gap-3">
          <div className="w-40 shrink-0 truncate text-xs font-medium text-ink-body">{r.tool}</div>
          <div className="flex-1 h-2 rounded-full bg-raised overflow-hidden">
            <div className="h-full rounded-full bg-amber/70" style={{ width: `${Math.max(4, (r.runs / max) * 100)}%` }} />
          </div>
          <div className="w-14 shrink-0 text-right text-xs tabular-nums text-ink-high">{r.runs}</div>
          <div className="w-24 shrink-0 text-right text-xs tabular-nums text-ink-faint">
            {r.credits > 0 ? `${r.credits} cr` : `${r.users} ${unit}`}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminUsagePage() {
  const router = useRouter()
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/usage')
      .then(r => r.json())
      .then(j => { if (j.error) setErr(j.error); else setData(j) })
      .catch(() => setErr('Could not load usage'))
      .finally(() => setLoading(false))
  }, [])

  const t = data?.totals

  return (
    <div className="dark min-h-dvh bg-void">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber to-transparent opacity-60" />
      <div className="max-w-5xl mx-auto px-6 py-10 md:px-8 md:py-14">

        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber mb-2">
              Last {data?.windowDays ?? 30} days
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-high tracking-tight">
              Usage &amp; Errors
            </h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-edge px-4 py-2 text-sm text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Hub
          </button>
        </div>

        {loading && <p className="text-sm text-ink-muted">Loading…</p>}
        {err && <p className="text-sm text-red-400">{err}</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'AI runs',      value: t!.aiRuns,      tone: 'text-violet'   },
                { label: 'Credits spent', value: t!.aiCredits,  tone: 'text-violet'   },
                { label: 'Agent runs',   value: t!.agentRuns,   tone: 'text-amber'    },
                { label: 'Failed posts', value: t!.failedPosts, tone: t!.failedPosts > 0 ? 'text-red-400' : 'text-jade' },
              ].map(c => (
                <div key={c.label} className="rounded-2xl border border-edge bg-panel p-5">
                  <div className={`font-display text-4xl font-semibold tracking-tight mb-1 ${c.tone}`}>{c.value}</div>
                  <div className="text-sm font-medium text-ink-body">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Panel icon={Sparkles} title="AI tools" sub="Which tools people actually use, and what they cost" count={data.aiTools.length}>
                <ToolTable rows={data.aiTools} unit="users" />
              </Panel>

              <Panel icon={Bot} title="Agents" sub="Runs per agent — the ones at zero are candidates to cut" count={data.agents.length}>
                <ToolTable rows={data.agents} unit="users" />
              </Panel>

              <Panel icon={AlertTriangle} title="Top errors" sub="Grouped by what the platform actually said" count={data.topErrors.length} defaultOpen={data.topErrors.length > 0}>
                {data.topErrors.length === 0
                  ? <Empty>No publish failures in this window.</Empty>
                  : (
                    <div className="space-y-2">
                      {data.topErrors.map((e, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-edge bg-raised p-3">
                          <span className="shrink-0 rounded-md border border-edge px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber">
                            {e.platform}
                          </span>
                          <p className="flex-1 text-xs leading-relaxed text-ink-body break-words">{e.message}</p>
                          <span className="shrink-0 text-xs tabular-nums text-ink-high">×{e.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </Panel>

              <Panel icon={MessageSquare} title="Feedback" sub="Reports submitted in this window" count={t!.feedback} defaultOpen={false}>
                <a href="/admin/feedback" className="text-xs text-amber hover:underline">Open the feedback inbox →</a>
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

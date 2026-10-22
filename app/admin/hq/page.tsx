'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, ArrowLeft, ArrowRight, CircleDollarSign, CreditCard, Heart, Inbox,
  MessageSquare, Plug, RefreshCw, ShoppingBag, Users, Webhook,
} from 'lucide-react'

/**
 * HQ: money, problems and what's waiting on Joshua, across the ventures he runs
 * solo (SocialMate and the Gilgamesh Enterprise Stripe account, the Gilgamesh
 * shop, RenewalMate). Data: /api/admin/hq. Sources that aren't connected say
 * so instead of rendering a zero that looks real.
 */

type Group = { group: string; cents: number; count: number }
type HQ = {
  days: number
  generatedAt: string
  totalCents: number
  sources: { name: string; status: 'ok' | 'not_connected' | 'error'; detail?: string }[]
  stripe: {
    grossCents: number; refundedCents: number; netCents: number; byGroup: Group[]
    mrrCents: number; mrrByGroup: { group: string; cents: number }[]; activeSubscriptions: number
    recent: { at: string; label: string; group: string; cents: number; email: string | null }[]
    failedPayments: { at: string; cents: number; email: string | null; reason: string }[]
    webhookFailures: { total: number; byType: { type: string; count: number }[] }
    truncated: boolean
  } | null
  shopify: { grossCents: number; orders: number; smGiveOwedCents: number; recent: { at: string; name: string; cents: number; status: string }[] } | null
  renewalmate: { users: number; newUsers: number; paying: number; plans: { plan: string; count: number }[] } | null
  renewalmateRevenue: { cents: number; mrrCents: number } | null
  socialmate: {
    waiting: { label: string; count: number; href: string | null }[]
    feedback: { open: number; recent: { type: string; message: string; email: string | null; at: string }[] }
    publishFailures: { failed: number; partial: number; topErrors: { platform: string; reason: string; posts: number }[] }
    newSignups: number
    smGiveCents: number
  } | null
  smGive: { recordedCents: number; shopifyOwedCents: number }
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const day = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{children}</span>
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-edge bg-panel ${className}`}>{children}</div>
}

function PanelHead({ icon: Icon, title, right }: { icon: typeof Inbox; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
        <span className="text-sm font-semibold text-ink-high">{title}</span>
      </div>
      {right}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink-high">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  )
}

function NotConnected({ text }: { text: string }) {
  return <p className="text-xs leading-relaxed text-ink-faint">{text}</p>
}

export default function AdminHQPage() {
  const [data, setData]   = useState<HQ | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays]   = useState(30)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    setData(null); setError(null)
    fetch(`/api/admin/hq?days=${days}`)
      .then(async r => (r.ok ? r.json() : Promise.reject(new Error((await r.json().catch(() => ({}))).error ?? r.statusText))))
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [days, nonce])

  const s = data?.stripe
  const sm = data?.socialmate
  const problems =
    (s?.failedPayments.length ?? 0) + (s?.webhookFailures.total ?? 0) +
    (sm?.publishFailures.failed ?? 0) + (sm?.feedback.open ?? 0)
  const waitingTotal = sm?.waiting.reduce((n, w) => n + w.count, 0) ?? 0

  return (
    <div className="min-h-dvh bg-void px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">

        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink-high">
          <ArrowLeft className="h-3.5 w-3.5" /> Admin
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label>Command center</Label>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-high">HQ</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Money, problems and what&apos;s waiting on you, across SocialMate, the Gilgamesh shop and RenewalMate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                  days === d ? 'border-amber/50 bg-amber/10 text-amber' : 'border-edge text-ink-muted hover:text-ink-high'
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={() => setNonce(n => n + 1)}
              aria-label="Refresh"
              className="rounded-lg border border-edge p-1.5 text-ink-muted transition-colors hover:text-ink-high"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <Panel className="mb-6 border-alert/40 bg-alert/[0.07] p-5">
            <p className="text-sm text-alert">Could not load: {error}</p>
          </Panel>
        )}

        {!data && !error && <p className="text-sm text-ink-faint">Loading from Stripe, Shopify and the databases…</p>}

        {data && (
          <div className="flex flex-col gap-5">

            {/* ── Headline ─────────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Panel className="p-5">
                <Label>Came in, last {data.days} days</Label>
                <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-jade">{usd(data.totalCents)}</div>
                <div className="mt-1 text-xs text-ink-muted">After refunds, before tax. Stripe (SocialMate and RenewalMate) plus the shop.</div>
              </Panel>
              <Panel className="p-5">
                <Label>Waiting on you</Label>
                <div className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${waitingTotal ? 'text-amber' : 'text-ink-high'}`}>{waitingTotal}</div>
                <div className="mt-1 text-xs text-ink-muted">Applications, payouts, requests, feedback.</div>
              </Panel>
              <Panel className="p-5">
                <Label>Problems</Label>
                <div className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${problems ? 'text-alert' : 'text-ink-high'}`}>{problems}</div>
                <div className="mt-1 text-xs text-ink-muted">Failed payments, webhook misses, failed posts, open feedback.</div>
              </Panel>
            </div>

            {/* ── Revenue by venture ───────────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-3">
              <Panel>
                <PanelHead icon={CircleDollarSign} title="Stripe · every product" />
                <div className="grid grid-cols-2 gap-4 p-5">
                  {s ? (
                    <>
                      <Stat label="Net" value={usd(s.netCents)} sub={s.refundedCents ? `${usd(s.refundedCents)} refunded` : undefined} />
                      <Stat label="MRR" value={usd(s.mrrCents)} sub={`${s.activeSubscriptions} active subscription${s.activeSubscriptions === 1 ? '' : 's'}`} />
                    </>
                  ) : <NotConnected text="Stripe didn't load. See Sources below." />}
                </div>
              </Panel>
              <Panel>
                <PanelHead icon={ShoppingBag} title="Gilgamesh shop" />
                <div className="grid grid-cols-2 gap-4 p-5">
                  {data.shopify ? (
                    <>
                      <Stat label="Sales" value={usd(data.shopify.grossCents)} sub={`${data.shopify.orders} paid order${data.shopify.orders === 1 ? '' : 's'}`} />
                      <Stat label="Owed to SM-Give" value={usd(data.shopify.smGiveOwedCents)} sub="25% of sales" />
                    </>
                  ) : <div className="col-span-2"><NotConnected text="Not connected yet. Needs the Shopify order webhook (see Sources)." /></div>}
                </div>
              </Panel>
              <Panel>
                <PanelHead icon={Users} title="RenewalMate" />
                <div className="grid grid-cols-2 gap-4 p-5">
                  {data.renewalmate ? (
                    <>
                      <Stat label="Users" value={String(data.renewalmate.users)} sub={`${data.renewalmate.newUsers} new`} />
                      <Stat
                        label="Paying"
                        value={String(data.renewalmate.paying)}
                        sub={data.renewalmateRevenue ? `${usd(data.renewalmateRevenue.cents)} in · ${usd(data.renewalmateRevenue.mrrCents)} MRR` : undefined}
                      />
                    </>
                  ) : <div className="col-span-2"><NotConnected text="Not connected yet. Needs RenewalMate's Supabase keys (see Sources)." /></div>}
                </div>
              </Panel>
            </div>

            {/* ── Where the money came from ────────────────────────────── */}
            {s && (
              <div className="grid gap-4 md:grid-cols-2">
                <Panel>
                  <PanelHead icon={CircleDollarSign} title="By product" />
                  {s.byGroup.length === 0 ? (
                    <p className="px-5 py-4 text-xs text-ink-faint">No payments in this window.</p>
                  ) : (
                    <div className="flex flex-col gap-3 px-5 py-4">
                      {s.byGroup.map(g => {
                        const max = Math.max(...s.byGroup.map(x => x.cents), 1)
                        return (
                          <div key={g.group} className="grid grid-cols-[minmax(100px,150px)_1fr_auto] items-center gap-3">
                            <span className="truncate text-xs text-ink-body">{g.group}</span>
                            <span className="relative h-2 overflow-hidden rounded-full bg-raised">
                              <span className="absolute inset-y-0 left-0 rounded-full bg-jade" style={{ width: `${(g.cents / max) * 100}%` }} />
                            </span>
                            <span className="font-mono text-xs tabular-nums text-ink-muted">{usd(g.cents)} · {g.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Panel>
                <Panel>
                  <PanelHead icon={CreditCard} title="Latest payments" />
                  {s.recent.length === 0 && !data.shopify?.recent.length ? (
                    <p className="px-5 py-4 text-xs text-ink-faint">No payments in this window.</p>
                  ) : (
                    <ul className="divide-y divide-edge">
                      {s.recent.map((p, i) => (
                        <li key={`s${i}`} className="flex items-center justify-between gap-3 px-5 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-xs text-ink-high">{p.label}</div>
                            <div className="truncate text-[11px] text-ink-faint">{day(p.at)}{p.email ? ` · ${p.email}` : ''}</div>
                          </div>
                          <span className="font-mono text-xs tabular-nums text-jade">{usd(p.cents)}</span>
                        </li>
                      ))}
                      {data.shopify?.recent.map((o, i) => (
                        <li key={`o${i}`} className="flex items-center justify-between gap-3 px-5 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-xs text-ink-high">Shop order {o.name}</div>
                            <div className="truncate text-[11px] text-ink-faint">{day(o.at)} · {o.status}</div>
                          </div>
                          <span className="font-mono text-xs tabular-nums text-jade">{usd(o.cents)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            )}

            {/* ── Waiting on you ──────────────────────────────────────── */}
            {sm && (
              <Panel>
                <PanelHead icon={Inbox} title="Waiting on you" right={<span className="text-xs text-ink-faint">{sm.newSignups} new SocialMate signups</span>} />
                <ul className="divide-y divide-edge">
                  {sm.waiting.map(w => {
                    const row = (
                      <div className="flex items-center justify-between gap-3 px-5 py-3">
                        <span className={`text-sm ${w.count ? 'text-ink-high' : 'text-ink-muted'}`}>{w.label}</span>
                        <span className="flex items-center gap-2">
                          <span className={`font-mono text-sm tabular-nums ${w.count ? 'text-amber' : 'text-ink-faint'}`}>{w.count}</span>
                          {w.href && <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />}
                        </span>
                      </div>
                    )
                    return <li key={w.label}>{w.href ? <Link href={w.href} className="block transition-colors hover:bg-raised">{row}</Link> : row}</li>
                  })}
                </ul>
              </Panel>
            )}

            {/* ── Problems ────────────────────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-2">
              <Panel>
                <PanelHead icon={CreditCard} title="Failed payments" right={<span className="font-mono text-xs text-ink-faint">{s?.failedPayments.length ?? 0}</span>} />
                {!s?.failedPayments.length ? (
                  <p className="px-5 py-4 text-xs text-ink-faint">None in this window.</p>
                ) : (
                  <ul className="divide-y divide-edge">
                    {s.failedPayments.map((f, i) => (
                      <li key={i} className="px-5 py-2.5">
                        <div className="flex justify-between gap-3 text-xs">
                          <span className="truncate text-ink-high">{f.email ?? 'Unknown customer'}</span>
                          <span className="font-mono tabular-nums text-alert">{usd(f.cents)}</span>
                        </div>
                        <div className="truncate text-[11px] text-ink-faint">{day(f.at)} · {f.reason}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel>
                <PanelHead icon={Webhook} title="Stripe webhook misses" right={<span className="font-mono text-xs text-ink-faint">{s?.webhookFailures.total ?? 0}</span>} />
                {!s?.webhookFailures.total ? (
                  <p className="px-5 py-4 text-xs text-ink-faint">Every event in this window reached SocialMate.</p>
                ) : (
                  <ul className="divide-y divide-edge">
                    {s.webhookFailures.byType.map(t => (
                      <li key={t.type} className="flex justify-between gap-3 px-5 py-2.5 text-xs">
                        <span className="truncate font-mono text-ink-high">{t.type}</span>
                        <span className="font-mono tabular-nums text-alert">{t.count}</span>
                      </li>
                    ))}
                    <li className="px-5 py-2.5 text-[11px] text-ink-faint">
                      Stripe retries for 3 days. Check Workbench → Webhooks → Event deliveries.
                    </li>
                  </ul>
                )}
              </Panel>

              {sm && (
                <Panel>
                  <PanelHead
                    icon={AlertTriangle}
                    title="Failed posts"
                    right={<span className="font-mono text-xs text-ink-faint">{sm.publishFailures.failed} failed · {sm.publishFailures.partial} partial</span>}
                  />
                  {!sm.publishFailures.topErrors.length ? (
                    <p className="px-5 py-4 text-xs text-ink-faint">No publish errors in this window.</p>
                  ) : (
                    <ul className="divide-y divide-edge">
                      {sm.publishFailures.topErrors.map((e, i) => (
                        <li key={i} className="px-5 py-2.5">
                          <div className="flex justify-between gap-3 text-xs">
                            <span className="capitalize text-ink-high">{e.platform}</span>
                            <span className="font-mono tabular-nums text-alert">{e.posts}</span>
                          </div>
                          <div className="text-[11px] leading-snug text-ink-faint">{e.reason}</div>
                        </li>
                      ))}
                      <li className="px-5 py-2.5">
                        <Link href="/admin/failure-log" className="text-[11px] text-ink-muted hover:text-ink-high">Open the failure log →</Link>
                      </li>
                    </ul>
                  )}
                </Panel>
              )}

              {sm && (
                <Panel>
                  <PanelHead icon={MessageSquare} title="Unanswered feedback" right={<span className="font-mono text-xs text-ink-faint">{sm.feedback.open}</span>} />
                  {!sm.feedback.recent.length ? (
                    <p className="px-5 py-4 text-xs text-ink-faint">Nothing waiting for a reply.</p>
                  ) : (
                    <ul className="divide-y divide-edge">
                      {sm.feedback.recent.map((f, i) => (
                        <li key={i} className="px-5 py-2.5">
                          <div className="flex justify-between gap-3 text-[11px] text-ink-faint">
                            <span className="uppercase tracking-wider">{f.type}</span>
                            <span>{day(f.at)}</span>
                          </div>
                          <p className="mt-1 text-xs leading-snug text-ink-body">{f.message}</p>
                          {f.email && <div className="mt-0.5 text-[11px] text-ink-faint">{f.email}</div>}
                        </li>
                      ))}
                      <li className="px-5 py-2.5">
                        <Link href="/admin/feedback" className="text-[11px] text-ink-muted hover:text-ink-high">Reply in the feedback inbox →</Link>
                      </li>
                    </ul>
                  )}
                </Panel>
              )}
            </div>

            {/* ── SM-Give ─────────────────────────────────────────────── */}
            <Panel>
              <PanelHead icon={Heart} title="SM-Give" />
              <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
                <Stat label="Recorded" value={usd(data.smGive.recordedCents)} sub="From SocialMate payments" />
                <Stat label="Owed from the shop" value={usd(data.smGive.shopifyOwedCents)} sub={data.shopify ? '25% of shop sales, record by hand' : 'Shop not connected'} />
                <Stat label="Total" value={usd(data.smGive.recordedCents + data.smGive.shopifyOwedCents)} />
              </div>
            </Panel>

            {/* ── Sources ─────────────────────────────────────────────── */}
            <Panel>
              <PanelHead icon={Plug} title="Sources" />
              <ul className="divide-y divide-edge">
                {data.sources.map(src => (
                  <li key={src.name} className="flex flex-wrap items-start justify-between gap-2 px-5 py-3">
                    <span className="text-sm text-ink-high">{src.name}</span>
                    <span className="flex flex-col items-end gap-0.5 text-right">
                      <span className={`font-mono text-[11px] uppercase tracking-wider ${
                        src.status === 'ok' ? 'text-jade' : src.status === 'error' ? 'text-alert' : 'text-ink-faint'
                      }`}>
                        {src.status === 'ok' ? 'Connected' : src.status === 'error' ? 'Error' : 'Not connected'}
                      </span>
                      {src.detail && <span className="max-w-md text-[11px] text-ink-faint">{src.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {s?.truncated && (
                <p className="border-t border-edge px-5 py-3 text-[11px] text-ink-faint">
                  Stripe returned more than 500 items for one list in this window; totals cover the newest 500.
                </p>
              )}
              <p className="border-t border-edge px-5 py-3 text-[11px] text-ink-faint">
                Updated {new Date(data.generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Not included on purpose: HereNow, RJ&apos;s Tree Care, Raid Ready Labs.
              </p>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}

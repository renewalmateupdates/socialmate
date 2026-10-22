import type Stripe from 'stripe'
import { CREATOR_HUB_TYPES, priceInfo, sessionInfo, type RevenueGroup } from '@/lib/stripe-catalog'

// Money for /admin/hq, read straight from Stripe rather than estimated from
// plan counts (which is what /admin/overview does).
//
// Subscriptions are counted from paid invoices (first payment, renewals,
// upgrades). One-time purchases are counted from completed Checkout Sessions in
// payment mode, so nothing is counted twice. Creator Hub money is left out: it
// passes through to the creator. Amounts exclude sales tax.
//
// Field access goes through `any` on purpose: lib/stripe.ts pins API
// 2024-06-20, while the SDK's types describe a newer version.

export interface Payment { at: string; label: string; group: RevenueGroup; cents: number; email: string | null }

export interface StripeSummary {
  grossCents: number
  refundedCents: number
  netCents: number
  byGroup: { group: RevenueGroup; cents: number; count: number }[]
  mrrCents: number
  activeSubscriptions: number
  recent: Payment[]
  failedPayments: { at: string; cents: number; email: string | null; reason: string }[]
  webhookFailures: { total: number; byType: { type: string; count: number }[] }
  truncated: boolean
}

const MAX_ITEMS = 500

async function collect<T>(iter: AsyncIterable<T>): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = []
  for await (const item of iter) {
    items.push(item)
    if (items.length >= MAX_ITEMS) return { items, truncated: true }
  }
  return { items, truncated: false }
}

const iso = (sec: number) => new Date(sec * 1000).toISOString()

function monthlyCents(price: any, quantity: number): number {
  const amount = (price?.unit_amount ?? 0) * (quantity || 1)
  const every  = price?.recurring?.interval_count || 1
  switch (price?.recurring?.interval) {
    case 'year':  return amount / 12 / every
    case 'week':  return (amount * 52) / 12 / every
    case 'day':   return (amount * 365) / 12 / every
    default:      return amount / every
  }
}

export async function stripeSummary(stripe: Stripe, sinceSec: number): Promise<StripeSummary> {
  const created = { gte: sinceSec }
  const [invoices, sessions, refunds, charges, events, subs] = await Promise.all([
    collect(stripe.invoices.list({ status: 'paid', created, limit: 100 } as any) as any),
    collect(stripe.checkout.sessions.list({ status: 'complete', created, limit: 100 } as any) as any),
    collect(stripe.refunds.list({ created, limit: 100 }) as any),
    collect(stripe.charges.list({ created, limit: 100 }) as any),
    collect(stripe.events.list({ created, delivery_success: false, limit: 100 } as any) as any),
    collect(stripe.subscriptions.list({ status: 'all', limit: 100 } as any) as any),
  ])

  const payments: Payment[] = []

  for (const inv of invoices.items as any[]) {
    const tax  = typeof inv.tax === 'number' ? inv.tax : (inv.total_taxes ?? []).reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
    const cents = Math.max(0, (inv.amount_paid ?? 0) - tax)
    if (cents <= 0) continue
    const subMeta = inv.subscription_details?.metadata ?? inv.parent?.subscription_details?.metadata ?? {}
    if (CREATOR_HUB_TYPES.has(subMeta.type)) continue
    const lines: any[] = inv.lines?.data ?? []
    const info = lines.map(l => priceInfo(l.price?.id ?? l.pricing?.price_details?.price)).find(Boolean)
    payments.push({
      at: iso(inv.created), cents, email: inv.customer_email ?? null,
      label: info?.label ?? 'Other subscription', group: info?.group ?? 'Other',
    })
  }

  for (const s of sessions.items as any[]) {
    if (s.mode !== 'payment' || s.payment_status !== 'paid') continue
    if (CREATOR_HUB_TYPES.has(s.metadata?.type)) continue
    const cents = Math.max(0, (s.amount_total ?? 0) - (s.total_details?.amount_tax ?? 0))
    if (cents <= 0) continue
    const info = sessionInfo(s.metadata)
    payments.push({
      at: iso(s.created), cents, email: s.customer_details?.email ?? null,
      label: info?.label ?? 'Other one-time payment', group: info?.group ?? 'Other',
    })
  }

  payments.sort((a, b) => b.at.localeCompare(a.at))

  const groups = new Map<RevenueGroup, { cents: number; count: number }>()
  for (const p of payments) {
    const g = groups.get(p.group) ?? { cents: 0, count: 0 }
    g.cents += p.cents; g.count += 1
    groups.set(p.group, g)
  }

  const grossCents    = payments.reduce((s, p) => s + p.cents, 0)
  const refundedCents = (refunds.items as any[]).filter(r => r.status === 'succeeded').reduce((s, r) => s + (r.amount ?? 0), 0)

  let mrr = 0
  let activeSubscriptions = 0
  for (const sub of subs.items as any[]) {
    if (sub.status !== 'active' && sub.status !== 'past_due') continue
    if (CREATOR_HUB_TYPES.has(sub.metadata?.type)) continue
    activeSubscriptions += 1
    for (const item of sub.items?.data ?? []) mrr += monthlyCents(item.price, item.quantity)
  }

  const failedPayments = (charges.items as any[])
    .filter(c => c.status === 'failed')
    .map(c => ({
      at: iso(c.created), cents: c.amount ?? 0,
      email: c.billing_details?.email ?? c.receipt_email ?? null,
      reason: c.failure_message ?? c.outcome?.seller_message ?? 'Declined',
    }))

  const byType = new Map<string, number>()
  for (const e of events.items as any[]) byType.set(e.type, (byType.get(e.type) ?? 0) + 1)

  return {
    grossCents,
    refundedCents,
    netCents: grossCents - refundedCents,
    byGroup: Array.from(groups.entries()).map(([group, v]) => ({ group, ...v })).sort((a, b) => b.cents - a.cents),
    mrrCents: Math.round(mrr),
    activeSubscriptions,
    recent: payments.slice(0, 12),
    failedPayments: failedPayments.slice(0, 10),
    webhookFailures: {
      total: events.items.length,
      byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
    },
    truncated: [invoices, sessions, refunds, charges, events, subs].some(r => r.truncated),
  }
}

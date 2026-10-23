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
  mrrByGroup: { group: RevenueGroup; cents: number }[]
  activeSubscriptions: number
  // Still active but set to cancel: paid through, not coming back. Kept out of
  // MRR, which is what will renew.
  endingSubscriptions: { count: number; mrrCents: number; nextEndsAt: string | null }
  recent: Payment[]
  // blocked: Radar refused it as likely fraud. Nothing was charged and nobody
  // is waiting on a fix, so it is not a problem to act on.
  failedPayments: { at: string; cents: number; email: string | null; reason: string; blocked: boolean }[]
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
    const info = lines
      .map(l => priceInfo(l.price?.id ?? l.pricing?.price_details?.price, l.price?.product ?? l.pricing?.price_details?.product))
      .find(Boolean)
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
  const mrrGroups = new Map<RevenueGroup, number>()
  const ending = { count: 0, mrr: 0, ends: [] as number[] }
  for (const sub of subs.items as any[]) {
    if (sub.status !== 'active' && sub.status !== 'past_due') continue
    if (CREATOR_HUB_TYPES.has(sub.metadata?.type)) continue
    const subCents = (sub.items?.data ?? []).reduce((s: number, item: any) => s + monthlyCents(item.price, item.quantity), 0)
    // The first paying customer cancelled in August and kept their paid year,
    // so Stripe still lists them as active until Aug 2027. Counting that as
    // MRR showed $6.67 a month that will never renew.
    if (sub.cancel_at_period_end || sub.cancel_at) {
      ending.count += 1
      ending.mrr += subCents
      const endsAt = sub.cancel_at ?? sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end
      if (endsAt) ending.ends.push(endsAt)
      continue
    }
    activeSubscriptions += 1
    for (const item of sub.items?.data ?? []) {
      const cents = monthlyCents(item.price, item.quantity)
      const group = priceInfo(item.price?.id, item.price?.product)?.group ?? 'Other'
      mrr += cents
      mrrGroups.set(group, (mrrGroups.get(group) ?? 0) + cents)
    }
  }

  // Radar blocks show the customer a generic "card was declined", and that is
  // also what failure_message says. outcome.type is what tells them apart.
  const failedPayments = (charges.items as any[])
    .filter(c => c.status === 'failed')
    .map(c => {
      const blocked = c.outcome?.type === 'blocked'
      return {
        at: iso(c.created), cents: c.amount ?? 0,
        email: c.billing_details?.email ?? c.receipt_email ?? null,
        reason: blocked
          ? `Blocked by Stripe Radar as likely fraud (risk: ${c.outcome?.risk_level ?? 'elevated'}). Nothing was charged.`
          : c.failure_message ?? c.outcome?.seller_message ?? 'Declined',
        blocked,
      }
    })

  const byType = new Map<string, number>()
  for (const e of events.items as any[]) byType.set(e.type, (byType.get(e.type) ?? 0) + 1)

  return {
    grossCents,
    refundedCents,
    netCents: grossCents - refundedCents,
    byGroup: Array.from(groups.entries()).map(([group, v]) => ({ group, ...v })).sort((a, b) => b.cents - a.cents),
    mrrCents: Math.round(mrr),
    mrrByGroup: Array.from(mrrGroups.entries()).map(([group, cents]) => ({ group, cents: Math.round(cents) })),
    activeSubscriptions,
    endingSubscriptions: {
      count: ending.count,
      mrrCents: Math.round(ending.mrr),
      nextEndsAt: ending.ends.length ? iso(Math.min(...ending.ends)) : null,
    },
    recent: payments.slice(0, 12),
    failedPayments: failedPayments.slice(0, 10),
    webhookFailures: {
      total: events.items.length,
      byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
    },
    truncated: [invoices, sessions, refunds, charges, events, subs].some(r => r.truncated),
  }
}

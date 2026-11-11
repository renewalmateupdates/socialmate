import type { SupabaseClient } from '@supabase/supabase-js'
import { selectAll } from '@/lib/admin-metrics'
import { COUNTED_STATUSES } from '@/lib/shop-orders'

// The Gilgamesh Enterprise Shopify store (shop.gilgameshenterprise.com) for
// /admin/hq: orders, revenue, and the 25% of every guide sale promised to
// SM-Give. Shopify sales never reach sm_give_allocations, so this is the only
// place that number is computed.
//
// Read from shop_orders, which /api/shopify/orders-webhook fills as Shopify
// sends each order. Pulling from Shopify's API isn't workable for a single
// store any more: admin-made apps are gone, and Dev Dashboard tokens need the
// store inside a developer organization, with access that lapses after 90 days
// of no logins there. Connected once SHOPIFY_WEBHOOK_SECRET is set.

export interface ShopifySummary {
  grossCents: number
  orders: number
  smGiveOwedCents: number
  recent: { at: string; name: string; cents: number; status: string }[]
}

export function shopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_WEBHOOK_SECRET)
}

const SM_GIVE_SHARE = 0.25

export async function shopifySummary(db: SupabaseClient, sinceIso: string): Promise<ShopifySummary> {
  // Every order in the window, newest first, read 1,000 at a time (one
  // request never returns more, so revenue would be understated past that).
  type OrderRow = { order_name: string | null; financial_status: string | null; subtotal_cents: number | null; ordered_at: string; cancelled: boolean | null }
  const rows = await selectAll<OrderRow>('shop_orders', () => db
    .from('shop_orders')
    .select('order_name, financial_status, subtotal_cents, ordered_at, cancelled')
    .eq('test', false)
    .gte('ordered_at', sinceIso)
    .order('ordered_at', { ascending: false })
    .order('shopify_order_id', { ascending: true }))
  const counted = rows.filter(o => !o.cancelled && COUNTED_STATUSES.includes(o.financial_status ?? ''))
  const grossCents = counted.reduce((s, o) => s + (o.subtotal_cents ?? 0), 0)

  return {
    grossCents,
    orders: counted.length,
    smGiveOwedCents: Math.round(grossCents * SM_GIVE_SHARE),
    recent: rows.slice(0, 8).map(o => ({
      at: o.ordered_at,
      name: o.order_name ?? '',
      cents: o.subtotal_cents ?? 0,
      status: o.cancelled ? 'cancelled' : String(o.financial_status ?? '').replace(/_/g, ' '),
    })),
  }
}

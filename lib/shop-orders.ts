import crypto from 'crypto'

// Shopify order webhooks for the Gilgamesh shop. See
// supabase/migrations/20261022000002_shop_orders.sql for why it's a webhook.

// Shopify signs the raw body with the store's webhook signing key (shown on
// Settings > Notifications > Webhooks) and sends it base64 in
// X-Shopify-Hmac-Sha256.
export function verifyShopifyHmac(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest()
  let given: Buffer
  try {
    given = Buffer.from(header, 'base64')
  } catch {
    return false
  }
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

const toCents = (value: unknown) => {
  const n = Number.parseFloat(String(value ?? '0'))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

export interface ShopOrderRow {
  shopify_order_id: string
  order_name: string | null
  financial_status: string | null
  subtotal_cents: number
  total_cents: number
  currency: string | null
  test: boolean
  cancelled: boolean
  ordered_at: string
  updated_at: string
  source: 'webhook'
}

// The totals from an order webhook payload, and nothing about the customer.
export function shopOrderRow(order: any): ShopOrderRow | null {
  if (!order || order.id == null || !order.created_at) return null
  return {
    shopify_order_id: String(order.id),
    order_name:       order.name ?? null,
    financial_status: order.financial_status ?? null,
    subtotal_cents:   toCents(order.current_subtotal_price ?? order.subtotal_price),
    total_cents:      toCents(order.current_total_price ?? order.total_price),
    currency:         order.currency ?? null,
    test:             Boolean(order.test),
    cancelled:        Boolean(order.cancelled_at),
    ordered_at:       order.created_at,
    updated_at:       new Date().toISOString(),
    source:           'webhook',
  }
}

// Statuses that are real money in: paid, or paid with a partial refund (the
// current subtotal already reflects the refund).
export const COUNTED_STATUSES = ['paid', 'partially_refunded']

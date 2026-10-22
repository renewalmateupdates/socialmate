export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { shopOrderRow, verifyShopifyHmac } from '@/lib/shop-orders'

// POST /api/shopify/orders-webhook
// Shopify sends the Gilgamesh shop's order events here (Settings >
// Notifications > Webhooks: Order payment, Order update, Order cancellation),
// and /admin/hq adds them up. The body must carry a valid signature from the
// store's webhook signing key (SHOPIFY_WEBHOOK_SECRET); anything else is
// refused. A failed save returns 500 so Shopify retries the delivery.
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const raw = await req.text()
  if (!verifyShopifyHmac(raw, req.headers.get('x-shopify-hmac-sha256'), secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const topic = req.headers.get('x-shopify-topic') ?? ''
  if (!topic.startsWith('orders/')) return NextResponse.json({ ignored: topic })

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const row = shopOrderRow(payload)
  if (!row) return NextResponse.json({ ignored: 'not an order' })

  const { error } = await getSupabaseAdmin()
    .from('shop_orders')
    .upsert(row, { onConflict: 'shopify_order_id' })
  if (error) {
    console.error('[shopify/orders-webhook] save failed:', error.message)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

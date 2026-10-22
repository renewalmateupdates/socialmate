// The Gilgamesh Enterprise Shopify store (shop.gilgameshenterprise.com) for
// /admin/hq: orders, revenue, and the 25% of every guide sale promised to
// SM-Give. Shopify sales never reach sm_give_allocations, so this is the only
// place that number is computed.
//
// Needs two env vars from a Shopify app with the read_orders scope:
//   SHOPIFY_STORE_DOMAIN  e.g. tvmfct-ew.myshopify.com
//   SHOPIFY_ADMIN_TOKEN   the app's Admin API access token
//
// API 2025-10: when Shopify retires a version it serves the oldest supported
// one instead, so this keeps working.

export interface ShopifySummary {
  grossCents: number
  orders: number
  smGiveOwedCents: number
  recent: { at: string; name: string; cents: number; status: string }[]
}

export function shopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN)
}

const COUNTED = new Set(['PAID', 'PARTIALLY_REFUNDED'])
const SM_GIVE_SHARE = 0.25

export async function shopifySummary(sinceIso: string): Promise<ShopifySummary> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const query = `{
    orders(first: 100, sortKey: CREATED_AT, reverse: true, query: "created_at:>=${sinceIso.slice(0, 10)}") {
      nodes {
        name
        createdAt
        displayFinancialStatus
        currentSubtotalPriceSet { shopMoney { amount } }
      }
    }
  }`

  const res = await fetch(`https://${domain}/admin/api/2025-10/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN! },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json || json.errors) {
    const detail = json?.errors ? JSON.stringify(json.errors).slice(0, 200) : `HTTP ${res.status}`
    throw new Error(`Shopify: ${detail}`)
  }

  const nodes: any[] = json.data?.orders?.nodes ?? []
  const counted = nodes.filter(o => COUNTED.has(o.displayFinancialStatus))
  const cents = (o: any) => Math.round(Number(o.currentSubtotalPriceSet?.shopMoney?.amount ?? 0) * 100)
  const grossCents = counted.reduce((s, o) => s + cents(o), 0)

  return {
    grossCents,
    orders: counted.length,
    smGiveOwedCents: Math.round(grossCents * SM_GIVE_SHARE),
    recent: nodes.slice(0, 8).map(o => ({
      at: o.createdAt, name: o.name, cents: cents(o), status: String(o.displayFinancialStatus ?? '').toLowerCase().replace(/_/g, ' '),
    })),
  }
}

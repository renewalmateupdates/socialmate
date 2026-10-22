// The Gilgamesh Enterprise Shopify store (shop.gilgameshenterprise.com) for
// /admin/hq: orders, revenue, and the 25% of every guide sale promised to
// SM-Give. Shopify sales never reach sm_give_allocations, so this is the only
// place that number is computed.
//
// Needs a Shopify app with the read_orders scope, installed on the store:
//   SHOPIFY_STORE_DOMAIN   e.g. tvmfct-ew.myshopify.com
//   SHOPIFY_CLIENT_ID      the app's Client ID (Dev Dashboard > app > Settings)
//   SHOPIFY_CLIENT_SECRET  the app's Client secret
// Since Jan 2026 Shopify only creates apps in its Dev Dashboard. Those don't
// get a permanent token: the server trades the client ID and secret for one
// that lasts 24 hours (client credentials grant, which works because the app
// and the store are in the same Shopify organization). A legacy permanent
// token in SHOPIFY_ADMIN_TOKEN is still accepted instead.
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
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN &&
    (process.env.SHOPIFY_ADMIN_TOKEN || (process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET)),
  )
}

// The token lasts 24 hours; keep it for 23 within a warm server instance.
let cached: { token: string; expires: number } | null = null

async function accessToken(domain: string): Promise<string> {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN
  if (cached && cached.expires > Date.now()) return cached.token

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     process.env.SHOPIFY_CLIENT_ID!,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET!,
    }),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.access_token) {
    throw new Error(`Shopify token: ${json?.error_description ?? json?.error ?? `HTTP ${res.status}`}`)
  }
  cached = { token: json.access_token, expires: Date.now() + 23 * 3_600_000 }
  return json.access_token
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
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await accessToken(domain) },
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

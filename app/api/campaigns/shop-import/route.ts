export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { fetchDocText } from '@/lib/soma-fetch-doc'
import { normalizeStoreUrl, parseShopifyProducts } from '@/lib/campaigns'

const MAX_PRODUCTS = 50

// Reads a Shopify store's public product list (every Shopify store serves
// /products.json without a key) so a campaign can start from its products.
// The fetch goes through SOMA's public-only fetcher, so a typed address can
// never reach this server's own network.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { store } = await req.json().catch(() => ({ store: null }))
  const origin = normalizeStoreUrl(store)
  if (!origin) return NextResponse.json({ error: 'Type your store address, like yourstore.com.' }, { status: 400 })

  const fetched = await fetchDocText(`${origin}/products.json?limit=250`)
  if (!fetched.ok) {
    return NextResponse.json({ error: "Couldn't read products from that address. Make sure it's a Shopify store, like yourstore.com." }, { status: 400 })
  }

  let body: unknown
  try { body = JSON.parse(fetched.text) } catch {
    return NextResponse.json({ error: "That address doesn't look like a Shopify store." }, { status: 400 })
  }

  const products = parseShopifyProducts(body, origin).slice(0, MAX_PRODUCTS)
  if (!products.length) return NextResponse.json({ error: 'No products for sale were found at that store.' }, { status: 404 })
  return NextResponse.json({ store: origin, products })
}

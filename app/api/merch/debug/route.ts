import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.PRINTIFY_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'PRINTIFY_API_KEY env var is not set' }, { status: 500 })
  }

  const headers = { Authorization: `Bearer ${key}` }

  try {
    // Step 1: get real shop list
    const shopsRes = await fetch('https://api.printify.com/v1/shops.json', { headers, cache: 'no-store' })
    const shopsText = await shopsRes.text()
    let shops: unknown
    try { shops = JSON.parse(shopsText) } catch { shops = shopsText }

    if (!shopsRes.ok) {
      return NextResponse.json({ step: 'shops', status: shopsRes.status, ok: false, body: shops })
    }

    const shopList = shops as Array<{ id: number; title: string }>
    const shopId = shopList?.[0]?.id

    if (!shopId) {
      return NextResponse.json({ step: 'shops', shops, error: 'No shops found on this account' })
    }

    // Step 2: get products from real shop ID
    const prodRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, { headers, cache: 'no-store' })
    const prodText = await prodRes.text()
    let products: unknown
    try { products = JSON.parse(prodText) } catch { products = prodText }

    return NextResponse.json({ shopId, shops, productsStatus: prodRes.status, products })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

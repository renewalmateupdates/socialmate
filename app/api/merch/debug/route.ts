import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.PRINTIFY_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'PRINTIFY_API_KEY env var is not set' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.printify.com/v1/shops/1/products.json', {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    const text = await res.text()
    let json: unknown
    try { json = JSON.parse(text) } catch { json = text }
    return NextResponse.json({ status: res.status, ok: res.ok, body: json })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

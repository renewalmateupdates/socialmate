export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/gifs/search?q=query
// Proxies Giphy API so the key stays server-side.
// Returns { results: [{ id, url, preview_url, title }] }
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.GIPHY_API_KEY

  // No key configured — return empty gracefully
  if (!apiKey) {
    return NextResponse.json({ results: [], missing_key: true })
  }

  try {
    const url = new URL('https://api.giphy.com/v1/gifs/search')
    url.searchParams.set('q', q)
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('limit', '12')
    url.searchParams.set('rating', 'g')
    url.searchParams.set('lang', 'en')

    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Giphy request failed', results: [] }, { status: 502 })
    }

    const data = await res.json()

    const results = (data.data ?? []).map((item: any) => ({
      id:          item.id,
      title:       item.title || '',
      url:         item.images?.original?.url || item.images?.fixed_height?.url || '',
      preview_url: item.images?.fixed_width_small?.url || item.images?.fixed_width?.url || '',
    })).filter((r: any) => r.url)

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('[gifs/search] error:', err?.message)
    return NextResponse.json({ error: 'GIF search failed', results: [] }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/gifs/search?q=query
// Proxies Tenor API so the key stays server-side.
// Returns { results: [{ id, url, preview_url, title }] }
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.TENOR_API_KEY

  // No key configured — return empty gracefully
  if (!apiKey) {
    return NextResponse.json({ results: [], missing_key: true })
  }

  try {
    const url = new URL('https://tenor.googleapis.com/v2/search')
    url.searchParams.set('q', q)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('limit', '12')
    url.searchParams.set('media_filter', 'gif,tinygif')
    url.searchParams.set('contentfilter', 'medium')

    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Tenor request failed', results: [] }, { status: 502 })
    }

    const data = await res.json()

    const results = (data.results ?? []).map((item: any) => {
      const gif     = item.media_formats?.gif
      const tinygif = item.media_formats?.tinygif
      return {
        id:          item.id,
        title:       item.title || '',
        url:         gif?.url || tinygif?.url || '',
        preview_url: tinygif?.url || gif?.url || '',
      }
    }).filter((r: any) => r.url)

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('[gifs/search] error:', err?.message)
    return NextResponse.json({ error: 'GIF search failed', results: [] }, { status: 500 })
  }
}

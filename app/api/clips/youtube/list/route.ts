export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

interface YTVideo {
  id: string
  title: string
  thumbnail_url: string
  url: string
  published_at: string
}

function parseYouTubeRSS(xml: string): YTVideo[] {
  const entries: YTVideo[] = []

  // Extract all <entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let entryMatch: RegExpExecArray | null

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1]

    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const titleMatch   = entry.match(/<title>([^<]+)<\/title>/)
    const pubMatch     = entry.match(/<published>([^<]+)<\/published>/)

    if (!videoIdMatch) continue

    const videoId   = videoIdMatch[1].trim()
    const title     = titleMatch    ? titleMatch[1].trim()   : 'Untitled'
    const published = pubMatch      ? pubMatch[1].trim()     : ''

    entries.push({
      id:            videoId,
      title,
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url:           `https://www.youtube.com/watch?v=${videoId}`,
      published_at:  published,
    })
  }

  return entries
}

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch user's YouTube connection
  const { data: connection } = await supabase
    .from('clip_connections')
    .select('channel_id, channel_name')
    .eq('user_id', user.id)
    .eq('platform', 'youtube')
    .single()

  if (!connection) {
    return NextResponse.json({ connected: false, videos: [] })
  }

  // Fetch RSS feed
  try {
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${connection.channel_id}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SocialMate/1.0)' } }
    )

    if (!rssRes.ok) {
      return NextResponse.json({ connected: true, channelName: connection.channel_name, videos: [] })
    }

    const xml = await rssRes.text()
    const videos = parseYouTubeRSS(xml)

    return NextResponse.json({
      connected: true,
      channelName: connection.channel_name,
      channelId: connection.channel_id,
      videos,
    })
  } catch (err) {
    console.error('YouTube RSS fetch error:', err)
    return NextResponse.json({ connected: true, channelName: connection.channel_name, videos: [] })
  }
}

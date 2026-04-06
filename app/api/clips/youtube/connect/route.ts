export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function resolveChannelId(channelUrl: string): Promise<{ channelId: string; channelName: string } | null> {
  const url = channelUrl.trim()

  // Pattern: youtube.com/channel/{ID}
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/)
  if (channelMatch) {
    return { channelId: channelMatch[1], channelName: '' }
  }

  // Pattern: youtube.com/@{handle}
  const handleMatch = url.match(/youtube\.com\/@([A-Za-z0-9_.-]+)/)
  if (handleMatch) {
    const handle = handleMatch[1]
    try {
      const res = await fetch(`https://www.youtube.com/@${handle}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SocialMate/1.0)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })
      if (!res.ok) return null
      const html = await res.text()
      const match = html.match(/"channelId":"(UC[^"]+)"/)
      if (match) {
        return { channelId: match[1], channelName: handle }
      }
    } catch {
      return null
    }
  }

  return null
}

async function fetchChannelNameFromRSS(channelId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SocialMate/1.0)' } }
    )
    if (!res.ok) return ''
    const xml = await res.text()
    const nameMatch = xml.match(/<name>([^<]+)<\/name>/)
    return nameMatch ? nameMatch[1].trim() : ''
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { channelUrl } = body

  if (!channelUrl?.trim()) {
    return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 })
  }

  const resolved = await resolveChannelId(channelUrl)
  if (!resolved) {
    return NextResponse.json(
      { error: 'Could not resolve channel ID from that URL. Try youtube.com/channel/{ID} or youtube.com/@handle' },
      { status: 422 }
    )
  }

  // Verify channel exists via RSS
  const rssRes = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${resolved.channelId}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SocialMate/1.0)' } }
  )
  if (!rssRes.ok) {
    return NextResponse.json({ error: 'Channel not found or has no public videos' }, { status: 404 })
  }

  // Get channel name from RSS if not already set
  let channelName = resolved.channelName
  if (!channelName) {
    channelName = await fetchChannelNameFromRSS(resolved.channelId)
  }

  // Upsert into clip_connections
  const { error } = await supabase.from('clip_connections').upsert(
    {
      user_id: user.id,
      platform: 'youtube',
      channel_id: resolved.channelId,
      channel_name: channelName || resolved.channelId,
    },
    { onConflict: 'user_id,platform' }
  )

  if (error) {
    console.error('clip_connections upsert error:', error)
    return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    channelName: channelName || resolved.channelId,
    channelId: resolved.channelId,
  })
}

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
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

  // Fetch Twitch connection
  const { data: conn, error: connError } = await supabase
    .from('clip_connections')
    .select('channel_id, access_token')
    .eq('user_id', user.id)
    .eq('platform', 'twitch')
    .maybeSingle()

  if (connError || !conn) {
    return NextResponse.json({ error: 'Twitch not connected' }, { status: 404 })
  }

  // Fetch clips from Twitch Helix API
  const clipsRes = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${conn.channel_id}&first=20`,
    {
      headers: {
        'Client-Id':   process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${conn.access_token}`,
      },
    }
  )

  if (!clipsRes.ok) {
    const err = await clipsRes.json().catch(() => ({}))
    console.error('[Twitch Clips] Fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch clips' }, { status: 502 })
  }

  const { data: rawClips } = await clipsRes.json()

  const clips = (rawClips || []).map((c: any) => ({
    id:            c.id,
    title:         c.title,
    thumbnail_url: c.thumbnail_url,
    url:           c.url,
    view_count:    c.view_count,
    duration:      c.duration,
    created_at:    c.created_at,
  }))

  return NextResponse.json({ clips })
}

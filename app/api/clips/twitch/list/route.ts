export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function refreshTwitchToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.access_token) return null
    return { access_token: data.access_token, refresh_token: data.refresh_token || refreshToken }
  } catch {
    return null
  }
}

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

  // Fetch Twitch connection (include refresh_token for recovery)
  const { data: conn, error: connError } = await supabase
    .from('clip_connections')
    .select('channel_id, access_token, refresh_token')
    .eq('user_id', user.id)
    .eq('platform', 'twitch')
    .maybeSingle()

  if (connError || !conn) {
    return NextResponse.json({ error: 'Twitch not connected' }, { status: 404 })
  }

  // Helper: fetch clips with a given access token
  async function fetchClips(accessToken: string) {
    return fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${conn!.channel_id}&first=20`,
      {
        headers: {
          'Client-Id':   process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
  }

  let clipsRes = await fetchClips(conn.access_token)

  // Handle 401 — attempt token refresh
  if (clipsRes.status === 401) {
    if (!conn.refresh_token) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 })
    }

    const refreshed = await refreshTwitchToken(conn.refresh_token)
    if (!refreshed) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 })
    }

    // Persist the new tokens
    await supabase
      .from('clip_connections')
      .update({
        access_token:  refreshed.access_token,
        refresh_token: refreshed.refresh_token,
      })
      .eq('user_id', user.id)
      .eq('platform', 'twitch')
      .eq('channel_id', conn.channel_id)

    // Retry with new token
    clipsRes = await fetchClips(refreshed.access_token)

    // If still 401 after refresh, the token is truly expired
    if (clipsRes.status === 401) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 })
    }
  }

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

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Monthly quota limits per plan
const QUOTA: Record<string, number | null> = {
  free:   100,
  pro:    1000,
  agency: null, // unlimited
}

// Get an app-level client_credentials token — no user auth needed
async function getAppToken(): Promise<string | null> {
  try {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        grant_type:    'client_credentials',
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
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

  const channelName = request.nextUrl.searchParams.get('channel')?.trim().replace(/^@/, '')
  if (!channelName) return NextResponse.json({ error: 'channel param required' }, { status: 400 })

  // ── Quota check ────────────────────────────────────────────────────────────
  const { data: settings } = await supabase
    .from('user_settings')
    .select('plan')
    .eq('user_id', user.id)
    .single()
  const plan = settings?.plan ?? 'free'
  const limit = QUOTA[plan]

  if (limit !== null) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'twitch_clip_lookup')
      .gte('created_at', startOfMonth.toISOString())

    const used = count ?? 0
    if (used >= limit) {
      return NextResponse.json({
        error:   `Monthly limit reached (${limit} lookups/${plan} plan)`,
        quota:   { used, limit, plan },
        upgrade: plan !== 'agency',
      }, { status: 429 })
    }
  }

  // ── Get app token ──────────────────────────────────────────────────────────
  const token = await getAppToken()
  if (!token) {
    return NextResponse.json({ error: 'Twitch API unavailable — check TWITCH_CLIENT_ID/SECRET env vars' }, { status: 503 })
  }

  const twitchHeaders = {
    'Client-Id':   process.env.TWITCH_CLIENT_ID!,
    Authorization: `Bearer ${token}`,
  }

  // ── Resolve channel name → broadcaster_id ─────────────────────────────────
  const userRes = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(channelName)}`,
    { headers: twitchHeaders }
  )
  if (!userRes.ok) {
    return NextResponse.json({ error: 'Failed to look up channel' }, { status: 502 })
  }
  const { data: users } = await userRes.json()
  if (!users?.length) {
    return NextResponse.json({ error: `Channel "${channelName}" not found` }, { status: 404 })
  }
  const broadcaster = users[0]

  // ── Fetch clips ────────────────────────────────────────────────────────────
  const clipsRes = await fetch(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcaster.id}&first=20`,
    { headers: twitchHeaders }
  )
  if (!clipsRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch clips' }, { status: 502 })
  }
  const { data: rawClips } = await clipsRes.json()

  // ── Record usage event ─────────────────────────────────────────────────────
  // Non-fatal — don't block the response if this fails
  getSupabaseAdmin()
    .from('usage_events')
    .insert({ user_id: user.id, event_type: 'twitch_clip_lookup', metadata: { channel: channelName } })
    .then(({ error }) => { if (error) console.warn('[usage_events] insert failed (non-fatal):', error.message) })

  // ── Return quota info so the UI can show the counter ──────────────────────
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const { count: usedAfter } = await supabase
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('event_type', 'twitch_clip_lookup')
    .gte('created_at', startOfMonth.toISOString())

  const clips = (rawClips || []).map((c: any) => ({
    id:            c.id,
    title:         c.title,
    thumbnail_url: c.thumbnail_url,
    url:           c.url,
    view_count:    c.view_count,
    duration:      c.duration,
    created_at:    c.created_at,
  }))

  return NextResponse.json({
    clips,
    channel: {
      id:          broadcaster.id,
      name:        broadcaster.display_name,
      avatar:      broadcaster.profile_image_url,
    },
    quota: {
      used:  (usedAfter ?? 0),
      limit: limit,
      plan,
    },
  })
}

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookieStore).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookieStore
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Fetch in parallel
  const [postsResult, settingsResult, activityResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id, content, platforms, status, scheduled_at, created_at, published_at')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('user_settings')
      .select('plan, credits_monthly, credits_earned, credits_paid')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('workspace_activity')
      .select('id, event_type, actor_email, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const posts = postsResult.data ?? []
  const settings = settingsResult.data

  // ── Streak ──────────────────────────────────────────────────────────────────
  const publishedDays = new Set<string>()
  for (const p of posts) {
    if ((p.status === 'published' || p.status === 'partial') && p.published_at) {
      publishedDays.add(p.published_at.slice(0, 10))
    }
    // Also count scheduled posts created today (so same-day scheduling counts)
    if (p.status === 'scheduled' && p.created_at) {
      publishedDays.add(p.created_at.slice(0, 10))
    }
  }

  const todayStr = now.toISOString().slice(0, 10)
  let streak = 0
  const cur = new Date(now)
  // If nothing today, start from yesterday so existing streak stays visible
  if (!publishedDays.has(todayStr)) cur.setDate(cur.getDate() - 1)
  while (true) {
    const dayStr = cur.toISOString().slice(0, 10)
    if (publishedDays.has(dayStr)) {
      streak++
      cur.setDate(cur.getDate() - 1)
    } else {
      break
    }
  }

  // ── Top platform ─────────────────────────────────────────────────────────────
  const platformCounts: Record<string, number> = {}
  for (const p of posts) {
    if (p.status === 'scheduled' && new Date(p.scheduled_at) > now && new Date(p.scheduled_at) >= startOfMonth) {
      for (const platform of (p.platforms ?? [])) {
        platformCounts[platform] = (platformCounts[platform] ?? 0) + 1
      }
    }
  }
  const topPlatformEntry = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]
  const top_platform = topPlatformEntry
    ? { platform: topPlatformEntry[0], count: topPlatformEntry[1] }
    : null

  // ── Upcoming posts (next 3) ───────────────────────────────────────────────────
  const upcoming = posts
    .filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now)
    .slice(0, 3)
    .map(p => ({
      id:           p.id,
      content:      (p.content ?? '').slice(0, 80),
      scheduled_at: p.scheduled_at,
      platforms:    p.platforms ?? [],
    }))

  // ── Credits ──────────────────────────────────────────────────────────────────
  const monthly = settings?.credits_monthly ?? 0
  const earned  = settings?.credits_earned ?? 0
  const paid    = settings?.credits_paid ?? 0
  const remaining = monthly + earned + paid

  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysUntilReset = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // ── Recent activity ──────────────────────────────────────────────────────────
  const recent_activity = (activityResult.data ?? []).map((a: any) => ({
    id:          a.id,
    event_type:  a.event_type,
    actor_email: a.actor_email,
    description: a.description,
    created_at:  a.created_at,
  }))

  return NextResponse.json({
    streak,
    top_platform,
    upcoming,
    credits: {
      remaining,
      monthly_reset_date: nextReset.toISOString(),
      days_until_reset:   daysUntilReset,
    },
    recent_activity,
  })
}

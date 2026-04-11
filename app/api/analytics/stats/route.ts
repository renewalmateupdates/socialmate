export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all posts for this user
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content, platforms, status, created_at, scheduled_at, published_at')
    .eq('user_id', user.id)
    .order('published_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const allPosts = posts ?? []

  // ── Overview counts ─────────────────────────────────────────────────────────
  const total_published = allPosts.filter(p => p.status === 'published').length
  const total_scheduled = allPosts.filter(p => p.status === 'scheduled').length
  const total_failed    = allPosts.filter(p => p.status === 'failed').length
  const total_drafts    = allPosts.filter(p => p.status === 'draft').length

  // ── This month vs last month ─────────────────────────────────────────────────
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  const publishedPosts = allPosts.filter(p => p.status === 'published')

  const published_this_month = publishedPosts.filter(p => {
    const d = new Date(p.published_at ?? p.created_at)
    return d >= thisMonthStart
  }).length

  const published_last_month = publishedPosts.filter(p => {
    const d = new Date(p.published_at ?? p.created_at)
    return d >= lastMonthStart && d <= lastMonthEnd
  }).length

  // ── By platform (all published posts) ───────────────────────────────────────
  const platformMap: Record<string, number> = {}
  for (const post of publishedPosts) {
    const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : []
    for (const p of platforms) {
      platformMap[p] = (platformMap[p] || 0) + 1
    }
  }
  const by_platform = Object.entries(platformMap)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => ({ platform, count }))

  // ── By day of week and hour (last 90 days) ───────────────────────────────────
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(now.getDate() - 90)

  const recentPublished = publishedPosts.filter(p => {
    const d = new Date(p.published_at ?? p.created_at)
    return d >= ninetyDaysAgo
  })

  const dayMap: number[] = Array.from({ length: 7 }, () => 0)
  const hourMap: number[] = Array.from({ length: 24 }, () => 0)

  for (const post of recentPublished) {
    const d = new Date(post.published_at ?? post.created_at)
    dayMap[d.getDay()]++
    hourMap[d.getHours()]++
  }

  const by_day_of_week = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    label: DAY_LABELS[i],
    count: dayMap[i],
  }))

  const by_hour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourMap[i],
  }))

  // ── Recent posts (last 20 published) ────────────────────────────────────────
  const recent_posts = publishedPosts.slice(0, 20).map(p => ({
    id:              p.id,
    content_preview: (p.content ?? '').slice(0, 80),
    platforms:       Array.isArray(p.platforms) ? p.platforms : [],
    published_at:    p.published_at ?? p.created_at,
    status:          p.status,
  }))

  // ── Streaks ──────────────────────────────────────────────────────────────────
  // Collect unique calendar days with at least 1 published post
  const publishedDaySet = new Set<string>()
  for (const post of publishedPosts) {
    const d = new Date(post.published_at ?? post.created_at)
    d.setHours(0, 0, 0, 0)
    publishedDaySet.add(d.toISOString().slice(0, 10))
  }

  const todayMidnight = new Date(now)
  todayMidnight.setHours(0, 0, 0, 0)

  let current_streak = 0
  let longest_streak = 0
  let tempStreak     = 0
  let currentDone    = false

  for (let i = 0; i < 365; i++) {
    const d = new Date(todayMidnight)
    d.setDate(todayMidnight.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const hasPost = publishedDaySet.has(key)

    if (hasPost) {
      tempStreak++
      if (tempStreak > longest_streak) longest_streak = tempStreak
      if (!currentDone) current_streak = tempStreak
    } else {
      if (!currentDone) currentDone = true
      tempStreak = 0
    }
  }

  // ── Avg posts per week (last 8 weeks) ────────────────────────────────────────
  const eightWeeksAgo = new Date(now)
  eightWeeksAgo.setDate(now.getDate() - 56)

  const recentEight = publishedPosts.filter(p => {
    const d = new Date(p.published_at ?? p.created_at)
    return d >= eightWeeksAgo
  }).length

  const avg_posts_per_week = Math.round((recentEight / 8) * 10) / 10

  return NextResponse.json({
    total_published,
    total_scheduled,
    total_failed,
    total_drafts,
    published_this_month,
    published_last_month,
    by_platform,
    by_day_of_week,
    by_hour,
    recent_posts,
    current_streak,
    longest_streak,
    avg_posts_per_week,
  })
}

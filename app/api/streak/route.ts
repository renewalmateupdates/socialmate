export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { selectAll } from '@/lib/admin-metrics'
import { connectionRowsFor, streakDayMap, type ScopeWorkspace, type StreakPost } from '@/lib/connected-platforms'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // The past 365 days
  const since = new Date()
  since.setDate(since.getDate() - 364)
  const sinceIso = since.toISOString()

  // Posts that went out, and scheduled ones, so SOMA users who schedule a full
  // week in one session get streak credit for those days. Windowed on every
  // time a post can count by (streakTimeOf): this used to filter on
  // scheduled_at alone, and a Post Now post has none, so none ever counted.
  // Paged, because PostgREST returns at most 1,000 rows a request and one
  // account had 1,733 posts in the window (Nov 26, 2026).
  let posts: StreakPost[]
  try {
    posts = await selectAll<StreakPost>('[streak] posts', () => admin
      .from('posts')
      .select('id, status, published_at, scheduled_at, created_at, platforms, workspace_id')
      .eq('user_id', user.id)
      .in('status', ['published', 'partial', 'scheduled'])
      .or(`scheduled_at.gte.${sinceIso},published_at.gte.${sinceIso},created_at.gte.${sinceIso}`)
      .order('id', { ascending: true }))
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not load your posts' }, { status: 500 })
  }

  // A scheduled post that names a platform with nothing connected fails at its
  // time, so it doesn't keep the streak (lib/connected-platforms.ts, the same
  // check as the Dashboard's). If either read fails, scheduled posts count as
  // they did before the check.
  const [rows, ownedRes] = await Promise.all([
    connectionRowsFor(admin, user.id),
    admin.from('workspaces').select('id, is_personal').eq('owner_id', user.id),
  ])
  if (ownedRes.error) console.warn('[streak] workspaces lookup failed:', ownedRes.error.message)
  const owned = ownedRes.error ? null : ((ownedRes.data ?? []) as ScopeWorkspace[])

  // Posts per UTC day (YYYY-MM-DD): the day a post was due (a scheduled one
  // only if it can go out), or the day a Post Now post went out.
  const dayMap = streakDayMap(posts, rows, owned, since)

  // Calculate current streak (consecutive days going back from today)
  const todayStr = new Date().toISOString().slice(0, 10)
  let currentStreak = 0
  const cur = new Date()
  while (true) {
    const dayStr = cur.toISOString().slice(0, 10)
    if (dayMap[dayStr]) {
      currentStreak++
      cur.setDate(cur.getDate() - 1)
    } else if (dayStr === todayStr) {
      // today hasn't been posted yet — don't break the streak, just don't count today
      cur.setDate(cur.getDate() - 1)
    } else {
      break
    }
  }

  // Calculate longest streak in the window
  let longestStreak = 0
  let runStreak = 0
  const start = new Date(since)
  for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const dStr = d.toISOString().slice(0, 10)
    if (dayMap[dStr]) {
      runStreak++
      longestStreak = Math.max(longestStreak, runStreak)
    } else {
      runStreak = 0
    }
  }

  // The posts that counted, not every row read.
  const totalPosts = Object.values(dayMap).reduce((sum, n) => sum + n, 0)
  const activeDays = Object.keys(dayMap).length

  return NextResponse.json({
    day_map: dayMap,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_posts: totalPosts,
    active_days: activeDays,
  })
}

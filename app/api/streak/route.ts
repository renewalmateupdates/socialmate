export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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

  // Fetch all published post dates for the past 365 days
  const since = new Date()
  since.setDate(since.getDate() - 364)

  const { data: posts, error } = await admin
    .from('posts')
    .select('published_at, platforms')
    .eq('user_id', user.id)
    .in('status', ['published', 'partial'])
    .not('published_at', 'is', null)
    .gte('published_at', since.toISOString())
    .order('published_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Count posts per calendar day (user's local date via UTC — good enough for this use case)
  const dayMap: Record<string, number> = {}
  for (const p of posts ?? []) {
    const day = p.published_at.slice(0, 10) // YYYY-MM-DD
    dayMap[day] = (dayMap[day] ?? 0) + 1
  }

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

  const totalPosts = (posts ?? []).length
  const activeDays = Object.keys(dayMap).length

  return NextResponse.json({
    day_map: dayMap,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_posts: totalPosts,
    active_days: activeDays,
  })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  // Authenticate via JWT from Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabaseUser = createClient(url, anonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const workspace_id: string | undefined = body?.workspace_id

  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 })
  }

  // Fetch all posts for this user + workspace
  const { data: posts } = await getSupabaseAdmin()
    .from('posts')
    .select('created_at, status')
    .eq('user_id', user.id)
    .eq('workspace_id', workspace_id)

  const allPosts = posts || []

  // Compute streaks (scan 365 days back from today)
  let currentStreak = 0, longestStreak = 0, tempStreak = 0
  let currentStreakDone = false
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayMidnight); d.setDate(todayMidnight.getDate() - i)
    const hasPost = allPosts.some(p => {
      const pd = new Date(p.created_at); pd.setHours(0, 0, 0, 0)
      return pd.getTime() === d.getTime()
    })
    if (hasPost) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
      if (!currentStreakDone) currentStreak = tempStreak
    } else {
      if (!currentStreakDone) currentStreakDone = true
      tempStreak = 0
    }
  }
  const lastPostDate = allPosts.length > 0
    ? allPosts.map(p => p.created_at).sort().reverse()[0].slice(0, 10)
    : null

  const streakUpdatedAt = new Date().toISOString()

  // Upsert into user_streaks (admin bypasses RLS for writes)
  const { error } = await getSupabaseAdmin()
    .from('user_streaks')
    .upsert(
      {
        user_id: user.id,
        workspace_id,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_post_date: lastPostDate,
        streak_updated_at: streakUpdatedAt,
      },
      { onConflict: 'user_id,workspace_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ current_streak: currentStreak, longest_streak: longestStreak, last_post_date: lastPostDate, streak_updated_at: streakUpdatedAt })
}

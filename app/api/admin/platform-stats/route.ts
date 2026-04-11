export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  const now = new Date()
  const todayStart = new Date(now); todayStart.setUTCHours(0, 0, 0, 0)
  const weekStart  = new Date(now); weekStart.setUTCDate(now.getUTCDate() - 7); weekStart.setUTCHours(0, 0, 0, 0)
  const monthStart = new Date(now); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0)

  // Fetch all published posts with platforms, user_id, created_at
  const { data: posts, error } = await db
    .from('posts')
    .select('user_id, platforms, status, created_at')
    .in('status', ['published', 'failed'])
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const allPosts = posts ?? []

  // Per-platform aggregation
  const platformStats: Record<string, { total: number; failed: number }> = {}
  for (const post of allPosts) {
    const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : []
    for (const p of platforms) {
      if (!platformStats[p]) platformStats[p] = { total: 0, failed: 0 }
      platformStats[p].total++
      if (post.status === 'failed') platformStats[p].failed++
    }
  }

  // Time-range counts (published only)
  const published = allPosts.filter(p => p.status === 'published')
  const postsToday = published.filter(p => new Date(p.created_at) >= todayStart).length
  const postsWeek  = published.filter(p => new Date(p.created_at) >= weekStart).length
  const postsMonth = published.filter(p => new Date(p.created_at) >= monthStart).length

  // Top posting users
  const userCount: Record<string, number> = {}
  for (const p of published) {
    userCount[p.user_id] = (userCount[p.user_id] || 0) + 1
  }
  const topUserIds = Object.entries(userCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(e => e[0])

  // Fetch emails for top users from auth.users
  const emailMap: Record<string, string> = {}
  if (topUserIds.length > 0) {
    const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
    for (const u of authData?.users ?? []) {
      if (topUserIds.includes(u.id) && u.email) emailMap[u.id] = u.email
    }
  }

  const topUsers = topUserIds.map(uid => ({
    user_id: uid,
    email: emailMap[uid] || uid,
    post_count: userCount[uid],
  }))

  return NextResponse.json({
    platform_stats: platformStats,
    posts_today: postsToday,
    posts_week:  postsWeek,
    posts_month: postsMonth,
    top_users:   topUsers,
    total_published: published.length,
    total_failed:    allPosts.filter(p => p.status === 'failed').length,
  })
}

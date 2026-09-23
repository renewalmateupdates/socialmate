export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { internalIdsFrom } from '@/lib/internal-accounts'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  const now = new Date()
  const todayStart = new Date(now); todayStart.setUTCHours(0, 0, 0, 0)
  const weekStart  = new Date(now); weekStart.setUTCDate(now.getUTCDate() - 7); weekStart.setUTCHours(0, 0, 0, 0)
  const monthStart = new Date(now); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0)

  // Unlike every other admin dashboard, this route had no internal-account
  // exclusion at all — socialmatehq's own SOMA/HERMES automation volume was
  // counted as real user activity in every number below.
  const { data: allProfiles, error: profilesError } = await db.from('profiles').select('id, email')
  if (profilesError) console.warn('[admin/platform-stats] profiles lookup failed:', profilesError.message)
  const internalIds = internalIdsFrom(allProfiles ?? [])
  internalIds.add(admin.id)
  const notInternal = `(${Array.from(internalIds).join(',')})`

  // Fetch all published/partial/failed posts with platforms, user_id, and
  // published_at. Time-range counts key off published_at (when it went live),
  // not created_at: scheduled/SOMA posts are created days earlier and would
  // undercount otherwise. 'partial' (published to some but not all selected
  // platforms) used to be excluded from this fetch entirely — not just from a
  // derived count — so a post that succeeded on 2 of 3 platforms vanished from
  // every number here, platform breakdown included, even for the platforms it
  // actually reached.
  const { data: posts, error } = await db
    .from('posts')
    .select('user_id, platforms, status, created_at, published_at')
    .in('status', ['published', 'partial', 'failed'])
    .not('user_id', 'in', notInternal)
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

  // Time-range counts, keyed off published_at. Includes 'partial' — a post
  // that reached some but not all selected platforms is still a real publish,
  // not a no-op, and used to be invisible here entirely (see the fetch above).
  const published = allPosts.filter(p => p.status === 'published' || p.status === 'partial')
  const publishedOn = (p: { published_at: string | null }, since: Date) =>
    !!p.published_at && new Date(p.published_at) >= since
  const postsToday = published.filter(p => publishedOn(p, todayStart)).length
  const postsWeek  = published.filter(p => publishedOn(p, weekStart)).length
  const postsMonth = published.filter(p => publishedOn(p, monthStart)).length

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

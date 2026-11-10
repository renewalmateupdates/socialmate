export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import {
  internalIdsOf, listAllAuthUsers, oldestFirst, platformOutcome, postWentOut, postWentOutSince, selectAll,
} from '@/lib/admin-metrics'

type PostRow = {
  user_id: string; platforms: string[] | null; status: string | null
  published_at: string | null; platform_post_ids: Record<string, unknown> | null
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  // Customers only: our own automation volume is not user activity. Every
  // post is read, 1,000 at a time (lib/admin-metrics.ts); this used to ask for
  // 5,000 and silently get the first 1,000.
  const loaded = await (async () => {
    const users = await listAllAuthUsers(db)
    const internalIds = internalIdsOf(users)
    internalIds.add(admin.id)
    const notInternal = `(${Array.from(internalIds).join(',')})`
    const posts = await selectAll<PostRow>('posts', () => oldestFirst(db
      .from('posts')
      .select('user_id, platforms, status, published_at, platform_post_ids')
      .in('status', ['published', 'partial', 'failed'])
      .not('user_id', 'in', notInternal)))
    return { users, posts }
  })().catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
  if (loaded instanceof Error) {
    console.error('[admin/platform-stats]', loaded.message)
    return NextResponse.json({ error: loaded.message }, { status: 500 })
  }
  const { users, posts } = loaded

  // Per platform. A partial post reached only the platforms it has a post id
  // for: it used to count as a success on every platform it named.
  const platformStats: Record<string, { total: number; failed: number }> = {}
  for (const post of posts) {
    for (const p of Array.isArray(post.platforms) ? post.platforms : []) {
      const outcome = platformOutcome(post, p)
      if (outcome === 'other') continue
      platformStats[p] ??= { total: 0, failed: 0 }
      platformStats[p].total++
      if (outcome === 'failed') platformStats[p].failed++
    }
  }

  // Rolling windows, keyed off published_at (when it went live, not when it
  // was written). Calendar "today" and "this month" were UTC, which starts
  // the day at 7 or 8 PM the evening before in Indiana.
  const ago = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()
  const published = posts.filter(postWentOut)
  const posts24h = published.filter(p => postWentOutSince(p, ago(1))).length
  const posts7d  = published.filter(p => postWentOutSince(p, ago(7))).length
  const posts30d = published.filter(p => postWentOutSince(p, ago(30))).length

  // Top posting customers.
  const userCount: Record<string, number> = {}
  for (const p of published) userCount[p.user_id] = (userCount[p.user_id] || 0) + 1
  const emailMap = new Map(users.map(u => [u.id, u.email ?? '']))
  const topUsers = Object.entries(userCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([uid, count]) => ({ user_id: uid, email: emailMap.get(uid) || uid, post_count: count }))

  return NextResponse.json({
    platform_stats:  platformStats,
    posts_24h:       posts24h,
    posts_7d:        posts7d,
    posts_30d:       posts30d,
    top_users:       topUsers,
    total_published: published.length,
    total_failed:    posts.filter(p => p.status === 'failed').length,
  })
}

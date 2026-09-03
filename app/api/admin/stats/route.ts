export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { internalIdsFrom } from '@/lib/internal-accounts'

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  // Today start (UTC). "Posts today" means posts that PUBLISHED today, so it must
  // filter on published_at — not created_at. Scheduled/SOMA/recurring posts are
  // created days earlier (and SOMA rows can have a NULL created_at, which .gte()
  // silently drops), so a created_at filter undercounts to zero. published_at is
  // stamped on every publish path and matches the Overview's 24h panel.
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const since = todayStart.toISOString()

  // Our own four accounts are not customers, and on this endpoint they were the
  // entire signal. Every one of the 147 posts published in the seven days to 3
  // September came from socialmatehq's own SOMA runs, so "Posts Today" read as
  // product usage while measuring nothing but our own automation — the number
  // most likely to produce false confidence on the page it headlines.
  //
  // Same correction as #611 made to /admin/overview. `.neq` only excludes one
  // value, so this is a `not.in` list.
  const { data: allProfiles, error: profilesError } = await db.from('profiles').select('id, email')
  if (profilesError) console.warn('[admin/stats] profiles lookup failed:', profilesError.message)
  const internalIds = internalIdsFrom(allProfiles ?? [])
  internalIds.add(user.id)
  const notInternal = `(${Array.from(internalIds).join(',')})`

  const [
    usersRes,
    postsRes,
    oursRes,
    affiliatesRes,
    listingsRes,
  ] = await Promise.allSettled([
    // Every account, ours included. This is a raw account count, and it has to
    // match the number the public counter shows. Activation ratios are the
    // opposite case and still exclude us — see /admin/overview.
    db.from('user_settings').select('user_id', { count: 'exact', head: true }),
    db.from('posts').select('id', { count: 'exact', head: true })
      .gte('published_at', since)
      .eq('status', 'published')
      .not('user_id', 'in', notInternal),
    // Kept, not discarded. Knowing our own posting still went out is useful; it
    // just must not be added to the number labelled as users.
    db.from('posts').select('id', { count: 'exact', head: true })
      .gte('published_at', since)
      .eq('status', 'published')
      .in('user_id', Array.from(internalIds)),
    db.from('affiliate_profiles').select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    db.from('curated_listings').select('id', { count: 'exact', head: true })
      .eq('status', 'approved'),
  ])

  // A settled promise is not a successful query. PostgREST answers an unknown
  // column with an error and a null count, which reads here as a real zero — the
  // exact shape that hid nine dead features in August. Surface it instead.
  type Settled = PromiseSettledResult<{ count: number | null; error: { message: string } | null }>
  const count = (name: string, res: Settled): number => {
    if (res.status === 'rejected') {
      console.warn(`[admin/stats] ${name} threw:`, res.reason)
      return 0
    }
    if (res.value.error) {
      console.warn(`[admin/stats] ${name} failed:`, res.value.error.message)
      return 0
    }
    return res.value.count ?? 0
  }

  return NextResponse.json({
    total_users:          count('total_users', usersRes),
    posts_today:          count('posts_today', postsRes),
    posts_today_internal: count('posts_today_internal', oursRes),
    active_affiliates:    count('active_affiliates', affiliatesRes),
    stax_listings:        count('stax_listings', listingsRes),
  })
}

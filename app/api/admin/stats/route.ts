export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { internalIdsOf, listAllAuthUsers } from '@/lib/admin-metrics'

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  // Every account, from auth. This counted user_settings rows, and two real
  // accounts have none, so the hub read 259 while /admin/users read 261.
  let users
  try {
    users = await listAllAuthUsers(db)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[admin/stats] auth users:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Our own four accounts are not customers, and on this endpoint they were the
  // entire signal: every post published in the seven days to 3 September came
  // from socialmatehq's own SOMA runs. `.neq` only excludes one value, so this
  // is a `not.in` list.
  const internalIds = internalIdsOf(users)
  internalIds.add(user.id)
  const notInternal = `(${Array.from(internalIds).join(',')})`

  // The last 24 hours, the same window as /admin/overview's pipeline. "Today"
  // used UTC midnight, which is 7 or 8 PM the evening before in Indiana, so
  // the morning number covered a different day than it said.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [
    postsRes,
    oursRes,
    affiliatesRes,
    listingsRes,
  ] = await Promise.allSettled([
    // 'partial' (published to some but not all selected platforms) is still a
    // real publish. Matches lib/admin-metrics.ts postWentOut().
    db.from('posts').select('id', { count: 'exact', head: true })
      .gte('published_at', since)
      .in('status', ['published', 'partial'])
      .not('user_id', 'in', notInternal),
    // Kept, not discarded. Knowing our own posting still went out is useful; it
    // just must not be added to the number labelled as users.
    db.from('posts').select('id', { count: 'exact', head: true })
      .gte('published_at', since)
      .in('status', ['published', 'partial'])
      .in('user_id', Array.from(internalIds)),
    // Partners who are customers. One of the two active partner profiles on
    // Nov 10, 2026 was our own account.
    db.from('affiliate_profiles').select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .not('user_id', 'in', notInternal),
    // 'active'/'live' are the paid-and-confirmed states; the webhook writes
    // the literal 'live', not 'active' -- see the isLiveListing() comment on
    // app/admin/studio-stax/page.tsx.
    db.from('curated_listings').select('id', { count: 'exact', head: true })
      .in('status', ['approved', 'active', 'live']),
  ])

  // A settled promise is not a successful query. PostgREST answers an unknown
  // column with an error and a null count, which reads here as a real zero — the
  // exact shape that hid nine dead features in August. Report it as null, which
  // the hub shows as "—".
  type Settled = PromiseSettledResult<{ count: number | null; error: { message: string } | null }>
  const count = (name: string, res: Settled): number | null => {
    if (res.status === 'rejected') {
      console.warn(`[admin/stats] ${name} threw:`, res.reason)
      return null
    }
    if (res.value.error) {
      console.warn(`[admin/stats] ${name} failed:`, res.value.error.message)
      return null
    }
    return res.value.count ?? 0
  }

  return NextResponse.json({
    total_users:        users.length,
    customers:          users.filter(u => !internalIds.has(u.id)).length,
    posts_24h:          count('posts_24h', postsRes),
    posts_24h_internal: count('posts_24h_internal', oursRes),
    active_affiliates:  count('active_affiliates', affiliatesRes),
    stax_listings:      count('stax_listings', listingsRes),
  })
}

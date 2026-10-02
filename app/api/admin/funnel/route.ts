export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { internalIdsFrom } from '@/lib/internal-accounts'

/**
 * The funnel, counted.
 *
 * Two sources, deliberately, because they answer different questions:
 *
 *   - Ground truth, from the tables themselves. How many accounts exist, how
 *     many have ever connected a platform, how many have ever published. These
 *     work retroactively and cover every account back to March.
 *   - Recorded steps, from usage_events. The intermediate steps no table can
 *     reconstruct: who reached the connect screen, which platform they clicked,
 *     where onboarding lost them. These only exist from the day this shipped.
 *
 * The split matters. Ground truth says 62 of 74 never connected. Only the
 * recorded steps can say why.
 */

/**
 * PostgREST silently caps any response at 1000 rows. posts passed that long ago
 * (1,600+ published alone), so an unpaged `select` returned an arbitrary 1000
 * and "who has published" depended on which 1000 the database happened to pick.
 * The first external publisher's post could simply be missing. Page through.
 */
async function fetchAllPosts(db: ReturnType<typeof getSupabaseAdmin>) {
  const PAGE = 1000
  const rows: { user_id: string; status: string; published_at: string | null }[] = []
  for (let from = 0; from < 100_000; from += PAGE) {
    const { data, error } = await db
      .from('posts')
      .select('user_id, status, published_at')
      .order('created_at', { ascending: true, nullsFirst: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) return { data: null, error }
    rows.push(...(data ?? []))
    if ((data?.length ?? 0) < PAGE) break
  }
  return { data: rows, error: null }
}

type Row = { user_id: string; event_type: string; metadata: Record<string, unknown> | null; created_at: string }

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get('days') ?? 30)))
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const db = getSupabaseAdmin()

  // ── Ground truth ─────────────────────────────────────────────────────────
  const [profilesRes, accountsRes, postsRes, workspacesRes] = await Promise.all([
    db.from('profiles').select('id, created_at, email'),
    db.from('connected_accounts').select('user_id, platform'),
    fetchAllPosts(db),
    db.from('workspaces').select('owner_id, plan').neq('plan', 'free'),
  ])

  for (const [name, res] of Object.entries({
    profiles: profilesRes, connected_accounts: accountsRes, posts: postsRes, workspaces: workspacesRes,
  })) {
    // Never discard a Supabase error. A query naming a column that does not
    // exist returns null data, and the whole page would just read zero.
    if (res.error) {
      console.error(`[admin/funnel] ${name} query failed:`, res.error.message)
      return NextResponse.json({ error: `${name}: ${res.error.message}` }, { status: 500 })
    }
  }

  // Exclude every account of ours, not just the admin one.
  //
  // This previously filtered only `admin.id`, which left four other internal
  // accounts in the numbers — including the one that made "1 user has ever
  // published" true. With all five out, no external user has ever published.
  const allProfiles = profilesRes.data ?? []
  const internalIds = internalIdsFrom(allProfiles)
  internalIds.add(admin.id)
  const profiles = allProfiles.filter(p => !internalIds.has(p.id))
  const accounts = accountsRes.data ?? []
  const posts    = postsRes.data ?? []

  const connectedUsers = new Set(accounts.map(a => a.user_id))
  const publishedUsers = new Set(
    posts.filter(p => p.status === 'published' || p.published_at).map(p => p.user_id)
  )
  const payingOwners = new Set((workspacesRes.data ?? []).map(w => w.owner_id))

  const totalAccounts = profiles.length
  const connected     = profiles.filter(p => connectedUsers.has(p.id)).length
  const published     = profiles.filter(p => publishedUsers.has(p.id)).length
  const paying        = profiles.filter(p => payingOwners.has(p.id)).length

  // Platform popularity among people who actually got through. Ground truth
  // above already excludes internal ids from `profiles`, but `accounts` itself
  // was never filtered, so this used to count every connection any of our own
  // accounts made too — disagreeing with /admin/overview's platformDist, which
  // does exclude them, for the same conceptual "connected accounts by
  // platform" number on a different page.
  const externalAccounts = accounts.filter(a => !internalIds.has(a.user_id))
  const platformCounts: Record<string, number> = {}
  for (const a of externalAccounts) platformCounts[a.platform] = (platformCounts[a.platform] ?? 0) + 1

  // ── Recorded steps ───────────────────────────────────────────────────────
  const { data: eventRows, error: eventErr } = await db
    .from('usage_events')
    .select('user_id, event_type, metadata, created_at')
    .like('event_type', 'funnel_%')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20000)

  if (eventErr) {
    console.error('[admin/funnel] usage_events query failed:', eventErr.message)
    return NextResponse.json({ error: eventErr.message }, { status: 500 })
  }

  // Same exclusion as everything above. Without it, our own testing shows up
  // as real activity — a single internal account clicking through Compose
  // repeatedly while testing a feature was recording as "1 user published,
  // 143 times" in the last 30 days on this exact page, directly under a Ground
  // Truth panel reading "Published a post: 0" for the same window.
  const events = (eventRows ?? []).filter(e => !internalIds.has(e.user_id)) as Row[]

  // Distinct users per step, not raw fires. "How many people" is the question;
  // raw counts just reward whoever refreshed the most.
  const usersByStep: Record<string, Set<string>> = {}
  const firesByStep: Record<string, number> = {}
  for (const e of events) {
    const step = e.event_type.replace(/^funnel_/, '')
    ;(usersByStep[step] ??= new Set()).add(e.user_id)
    firesByStep[step] = (firesByStep[step] ?? 0) + 1
  }

  // Connect intent vs outcome, per platform. The gap between these two is the
  // single most useful number this endpoint produces.
  const clicked: Record<string, Set<string>> = {}
  const succeeded: Record<string, Set<string>> = {}
  const failures: Record<string, number> = {}
  for (const e of events) {
    const platform = String(e.metadata?.platform ?? 'unknown')
    if (e.event_type === 'funnel_connect_clicked')   (clicked[platform] ??= new Set()).add(e.user_id)
    if (e.event_type === 'funnel_connect_succeeded') (succeeded[platform] ??= new Set()).add(e.user_id)
    if (e.event_type === 'funnel_connect_failed') {
      const reason = String(e.metadata?.reason ?? 'unknown')
      failures[`${platform}: ${reason}`] = (failures[`${platform}: ${reason}`] ?? 0) + 1
    }
  }

  const connectByPlatform = Array.from(new Set([...Object.keys(clicked), ...Object.keys(succeeded)]))
    .map(platform => ({
      platform,
      clicked: clicked[platform]?.size ?? 0,
      succeeded: succeeded[platform]?.size ?? 0,
    }))
    .sort((a, b) => b.clicked - a.clicked)

  // Onboarding drop-off by step number.
  //
  // Distinct users per step, not raw fires — same rule as every other count
  // here, and it matters more at this step than anywhere else. Someone stuck at
  // the connect step bounces: one real session went 1 → 2 → 1 → 2 → 3 → 2,
  // which as raw fires reads as heavy engagement with step 2 when it is
  // actually one confused person walking backwards out of step 3.
  const onboardingUsers: Record<string, Set<string>> = {}
  for (const e of events) {
    if (e.event_type !== 'funnel_onboarding_step') continue
    const step = String(e.metadata?.step ?? '?')
    ;(onboardingUsers[step] ??= new Set()).add(e.user_id)
  }
  const onboardingSteps: Record<string, number> = Object.fromEntries(
    Object.entries(onboardingUsers).map(([step, users]) => [step, users.size])
  )

  // ── Publish failures, from the posts themselves ──────────────────────────
  //
  // Why posts are failing, per platform, in plain words. A Discord permission
  // problem sat unseen until one user emailed because nothing aggregated
  // platform_errors. Numbers and ids are stripped so the same reason groups.
  const { data: failedRows, error: failedErr } = await db
    .from('posts')
    .select('user_id, platforms, platform_errors, created_at')
    .in('status', ['failed', 'partial'])
    .gte('created_at', since)
    .limit(5000)
  if (failedErr) console.warn('[admin/funnel] failed-posts query failed (non-fatal):', failedErr.message)

  const failureGroups: Record<string, { platform: string; reason: string; posts: number; users: Set<string> }> = {}
  for (const row of failedRows ?? []) {
    if (internalIds.has(row.user_id)) continue
    const errs = (row.platform_errors ?? {}) as Record<string, unknown>
    // Rows written before failures were saved on Post Now have no reason.
    const entries = Object.keys(errs).length > 0
      ? Object.entries(errs)
      : (row.platforms ?? []).map((pl: string) => [pl, 'No reason recorded'] as [string, unknown])
    for (const [platform, raw] of entries) {
      const reason = String(raw).replace(/\d{6,}/g, '#').replace(/\s+/g, ' ').slice(0, 140)
      const key = `${platform}|${reason}`
      const g = (failureGroups[key] ??= { platform, reason, posts: 0, users: new Set() })
      g.posts++
      g.users.add(row.user_id)
    }
  }
  const publishFailures = Object.values(failureGroups)
    .map(g => ({ platform: g.platform, reason: g.reason, posts: g.posts, users: g.users.size }))
    .sort((a, b) => b.users - a.users || b.posts - a.posts)
    .slice(0, 15)

  return NextResponse.json({
    publishFailures,
    windowDays: days,
    // Since instrumentation only starts now, the UI needs to say so rather
    // than present an empty recorded funnel as a real zero.
    recordedEvents: events.length,
    groundTruth: {
      accounts: totalAccounts,
      connected,
      published,
      paying,
      neverConnected: totalAccounts - connected,
      connectedNeverPublished: connected - published,
      // Stated explicitly so nobody re-derives an activation rate that quietly
      // counts our own accounts as customers.
      internalExcluded: internalIds.size,
    },
    platformCounts: Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count),
    steps: Object.entries(usersByStep)
      .map(([step, set]) => ({ step, users: set.size, fires: firesByStep[step] ?? 0 }))
      .sort((a, b) => b.users - a.users),
    connectByPlatform,
    failures: Object.entries(failures).map(([k, v]) => ({ reason: k, count: v })).sort((a, b) => b.count - a.count),
    onboardingSteps: Object.entries(onboardingSteps)
      .map(([step, fires]) => ({ step, fires }))
      .sort((a, b) => Number(a.step) - Number(b.step)),
  })
}

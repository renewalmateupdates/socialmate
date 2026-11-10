export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { loadAccountFacts, oldestFirst, selectAll } from '@/lib/admin-metrics'

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
 * PostgREST silently caps any response at 1000 rows. Every read below goes
 * through lib/admin-metrics.ts, which pages. Until Nov 10, 2026 the recorded
 * steps did not: the 30-day window held 1,014 funnel events and the 90-day
 * one 2,500, and the page showed the newest 1,000 of either.
 */

type Row = { user_id: string; event_type: string; metadata: Record<string, unknown> | null; created_at: string }

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get('days') ?? 30)))
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const db = getSupabaseAdmin()

  // ── Ground truth ─────────────────────────────────────────────────────────
  //
  // Accounts come from auth, not profiles: two real accounts have no profile
  // row, so this page said 255 customers while /admin/users said 257.
  // "Connected" and "published" mean ever, from the rows and the events that
  // outlive them, the same as /admin/users and /admin/overview.
  type AccountRow = { user_id: string; platform: string }
  const loaded = await Promise.all([
    loadAccountFacts(db),
    selectAll<AccountRow>('connected_accounts', () => oldestFirst(db.from('connected_accounts').select('user_id, platform'))),
    selectAll<{ owner_id: string }>('workspaces', () => oldestFirst(db.from('workspaces').select('owner_id').neq('plan', 'free'))),
  ]).catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
  if (loaded instanceof Error) {
    // Never render a failed read as zero. A query naming a column that does
    // not exist returns null data, and the whole page would just read zero.
    console.error('[admin/funnel] ground truth failed:', loaded.message)
    return NextResponse.json({ error: loaded.message }, { status: 500 })
  }
  const [facts, accounts, paidWorkspaces] = loaded

  // Exclude every account of ours, not just the admin one
  // (lib/internal-accounts.ts).
  const internalIds = new Set(facts.internalIds)
  internalIds.add(admin.id)
  const customers = facts.users.filter(u => !internalIds.has(u.id))
  const payingOwners = new Set(paidWorkspaces.map(w => w.owner_id))

  const totalAccounts = customers.length
  const connected     = customers.filter(u => facts.connected.has(u.id)).length
  const published     = customers.filter(u => facts.published.has(u.id)).length
  const paying        = customers.filter(u => payingOwners.has(u.id)).length
  // Counted apart so the page can say where those people came from.
  const connectedEarlier = customers.filter(u => facts.connectedEarlier.has(u.id)).length
  const publishedDeleted = customers.filter(u => facts.publishedDeleted.has(u.id)).length

  // Platform popularity among people who actually got through. `accounts` is
  // every connection, ours included, so filter it the same way: this used to
  // count our own connections too and disagreed with /admin/overview's
  // platformDist for the same "connected accounts by platform" number.
  const externalAccounts = accounts.filter(a => !internalIds.has(a.user_id))
  const platformCounts: Record<string, number> = {}
  for (const a of externalAccounts) platformCounts[a.platform] = (platformCounts[a.platform] ?? 0) + 1

  // ── Recorded steps ───────────────────────────────────────────────────────
  let eventRows: Row[]
  try {
    eventRows = await selectAll<Row>('usage_events', () => oldestFirst(db
      .from('usage_events')
      .select('user_id, event_type, metadata, created_at')
      .like('event_type', 'funnel_%')
      .gte('created_at', since)))
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[admin/funnel] usage_events query failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Same exclusion as everything above. Without it, our own testing shows up
  // as real activity — a single internal account clicking through Compose
  // repeatedly while testing a feature was recording as "1 user published,
  // 143 times" in the last 30 days on this exact page, directly under a Ground
  // Truth panel reading "Published a post: 0" for the same window.
  const events = eventRows.filter(e => !internalIds.has(e.user_id))

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

  // Where signups came from. signup_completed carries landing, referrer_host
  // and utm_source from PR #698 (deployed Oct 15, 2026 00:45 UTC) onward.
  // Earlier ones carry only the provider, so they are counted apart rather
  // than reported as "no source", which would read like a real answer.
  const SOURCES_RECORDED_FROM = Date.parse('2026-10-15T00:45:00Z')
  const sourceUsers: Record<string, Set<string>> = {}
  const landingUsers: Record<string, Set<string>> = {}
  let signupsBeforeSourceTracking = 0
  for (const e of events) {
    if (e.event_type !== 'funnel_signup_completed') continue
    if (Date.parse(e.created_at) < SOURCES_RECORDED_FROM) { signupsBeforeSourceTracking++; continue }
    const m = e.metadata ?? {}
    const source = m.utm_source ? `utm: ${String(m.utm_source)}` : m.referrer_host ? String(m.referrer_host) : '(no referrer)'
    ;(sourceUsers[source] ??= new Set()).add(e.user_id)
    ;(landingUsers[m.landing ? String(m.landing) : '(unknown)'] ??= new Set()).add(e.user_id)
  }
  const ranked = (sets: Record<string, Set<string>>) =>
    Object.entries(sets)
      .map(([label, users]) => ({ label, users: users.size }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 12)

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
  //
  // Windowed on updated_at, when the post failed, like /admin/hq and the
  // failure log. created_at missed a post scheduled weeks ahead that failed
  // today.
  type FailedRow = { user_id: string; platforms: string[] | null; platform_errors: Record<string, unknown> | null; status: string }
  let failedRows: FailedRow[] = []
  let publishFailuresError: string | null = null
  try {
    failedRows = await selectAll<FailedRow>('posts (failed)', () => oldestFirst(db
      .from('posts')
      .select('user_id, status, platforms, platform_errors')
      .in('status', ['failed', 'partial'])
      .gte('updated_at', since)))
  } catch (e) {
    publishFailuresError = e instanceof Error ? e.message : String(e)
    console.warn('[admin/funnel] failed-posts query failed (non-fatal):', publishFailuresError)
  }

  const failureGroups: Record<string, { platform: string; reason: string; posts: number; users: Set<string> }> = {}
  for (const row of failedRows) {
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
    publishFailuresError,
    signupSources:  ranked(sourceUsers),
    signupLandings: ranked(landingUsers),
    signupsBeforeSourceTracking,
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
      // People who published without a connection today are still published,
      // so count the connected ones who did not publish, never a subtraction
      // that can go negative.
      connectedNeverPublished: customers.filter(u => facts.connected.has(u.id) && !facts.published.has(u.id)).length,
      connectedEarlier,
      publishedDeleted,
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

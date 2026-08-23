export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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

type Row = { user_id: string; event_type: string; metadata: Record<string, unknown> | null; created_at: string }

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get('days') ?? 30)))
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const db = getSupabaseAdmin()

  // ── Ground truth ─────────────────────────────────────────────────────────
  const [profilesRes, accountsRes, postsRes, workspacesRes] = await Promise.all([
    db.from('profiles').select('id, created_at'),
    db.from('connected_accounts').select('user_id, platform'),
    db.from('posts').select('user_id, status, published_at'),
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

  const adminEmailId = admin.id
  const profiles = (profilesRes.data ?? []).filter(p => p.id !== adminEmailId)
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

  // Platform popularity among people who actually got through.
  const platformCounts: Record<string, number> = {}
  for (const a of accounts) platformCounts[a.platform] = (platformCounts[a.platform] ?? 0) + 1

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

  const events = (eventRows ?? []) as Row[]

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
  const onboardingSteps: Record<string, number> = {}
  for (const e of events) {
    if (e.event_type !== 'funnel_onboarding_step') continue
    const step = String(e.metadata?.step ?? '?')
    onboardingSteps[step] = (onboardingSteps[step] ?? 0) + 1
  }

  return NextResponse.json({
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

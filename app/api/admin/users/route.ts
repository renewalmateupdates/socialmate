export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { normalizePlan } from '@/lib/plan'
import { isInternalEmail } from '@/lib/internal-accounts'
import {
  CONNECTED_EVENT, PUBLISHED_EVENT, isPersonActivity, latestIso, listAllAuthUsers, oldestFirst,
  platformOutcome, postWentOut, selectAll,
} from '@/lib/admin-metrics'

// Every account with what it has done.
//
// Until Nov 10, 2026 this read posts with `.limit(20000)`. The database returns
// at most 1,000 rows per request whatever the limit says, posts had 1,817, and
// every user whose posts sat past row 1,000 showed "0 pub": the page listed 2
// customers as ever having published when 5 had. Everything is now read in
// full through lib/admin-metrics.ts, and counted with the same definitions
// /admin/funnel and /admin/overview use.

type SettingsRow = {
  user_id: string; plan: string | null; last_active: string | null; display_name: string | null
  is_admin: boolean | null; login_count: number | null; onboarding_completed: boolean | null
}
type PostRow = {
  user_id: string; status: string | null; published_at: string | null
  platforms: string[] | null; platform_post_ids: Record<string, unknown> | null
}
type EventRow = { user_id: string; event_type: string; created_at: string }

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const plan   = searchParams.get('plan')   || ''

  // Secondary reads (badges and activity) do not take the page down when they
  // fail, but they are reported on it rather than rendering as a quiet zero.
  const warnings: string[] = []
  const soft = <T,>(p: Promise<T[]>): Promise<T[]> => p.catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('[admin/users]', message)
    warnings.push(message)
    return []
  })

  const loaded = await Promise.all([
    listAllAuthUsers(db),
    selectAll<SettingsRow>('user_settings', () => oldestFirst(db.from('user_settings')
      .select('user_id, plan, last_active, display_name, is_admin, login_count, onboarding_completed'))),
    selectAll<{ owner_id: string; plan: string | null; is_personal: boolean | null }>('workspaces', () =>
      oldestFirst(db.from('workspaces').select('owner_id, plan, is_personal'))),
    selectAll<{ user_id: string; platform: string }>('connected_accounts', () =>
      oldestFirst(db.from('connected_accounts').select('user_id, platform'))),
    selectAll<PostRow>('posts', () =>
      oldestFirst(db.from('posts').select('user_id, status, published_at, platforms, platform_post_ids'))),
    soft(selectAll<EventRow>('usage_events', () =>
      oldestFirst(db.from('usage_events').select('user_id, event_type, created_at').like('event_type', 'funnel_%')))),
    soft(selectAll<{ user_id: string; status: string | null }>('affiliate_profiles', () =>
      oldestFirst(db.from('affiliate_profiles').select('user_id, status')))),
    // curated_listings has no user_id: applications are matched by the email
    // the applicant typed.
    soft(selectAll<{ applicant_email: string | null; status: string | null }>('curated_listings', () =>
      oldestFirst(db.from('curated_listings').select('applicant_email, status')))),
    // Team members post to the workspace owner's accounts, so an Editor with
    // posts and no connected platform is normal, not a bug. Matched by email,
    // the same way lib/team-workspaces.ts resolves access.
    soft(selectAll<{ owner_id: string; email: string | null; role: string | null }>('team_members', () =>
      oldestFirst(db.from('team_members').select('owner_id, email, role').eq('status', 'active')))),
  ]).catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
  if (loaded instanceof Error) {
    console.error('[admin/users]', loaded.message)
    return NextResponse.json({ error: loaded.message }, { status: 500 })
  }
  const [authUsers, settings, workspaces, accounts, posts, events, affiliates, listings, teams] = loaded

  const settingsMap = new Map(settings.map(s => [s.user_id, s]))

  // The plan the app actually enforces. user_settings.plan alone is the split
  // that left the first paying customer on free limits for their whole
  // session. resolveWorkspacePlan() is one query per user, so apply the same
  // precedence in memory: the personal workspace's plan, then user_settings.
  const wsPlanMap = new Map<string, string>()
  for (const w of workspaces) {
    if (w.is_personal && w.plan) wsPlanMap.set(w.owner_id, w.plan)
  }

  const accountMap = new Map<string, string[]>()
  for (const a of accounts) {
    const list = accountMap.get(a.user_id) ?? []
    if (!list.includes(a.platform)) list.push(a.platform)
    accountMap.set(a.user_id, list)
  }

  // `published` counts every post that went out, partial included (it reached
  // some platforms). `partial` is broken out so the page can still flag them.
  type PostStats = { published: number; partial: number; failed: number; scheduled: number; drafts: number }
  type PlatformStats = Record<string, { published: number; failed: number }>
  const postStats = new Map<string, PostStats>()
  const platformStats = new Map<string, PlatformStats>()
  for (const p of posts) {
    const s = postStats.get(p.user_id) ?? { published: 0, partial: 0, failed: 0, scheduled: 0, drafts: 0 }
    postStats.set(p.user_id, s)
    if (postWentOut(p)) s.published++
    if (p.status === 'partial') s.partial++
    else if (p.status === 'failed') s.failed++
    else if (p.status === 'scheduled') s.scheduled++
    else if (p.status === 'draft') s.drafts++

    const ps = platformStats.get(p.user_id) ?? {}
    platformStats.set(p.user_id, ps)
    for (const platform of Array.isArray(p.platforms) ? p.platforms : []) {
      const outcome = platformOutcome(p, platform)
      if (outcome === 'other') continue
      ps[platform] ??= { published: 0, failed: 0 }
      ps[platform][outcome]++
    }
  }

  // Events outlive rows: a deleted post or a removed connection still happened.
  const publishEvents = new Map<string, number>()
  const connectedEver = new Set<string>()
  const lastSeen = new Map<string, string>()
  for (const e of events) {
    if (e.event_type === PUBLISHED_EVENT) publishEvents.set(e.user_id, (publishEvents.get(e.user_id) ?? 0) + 1)
    if (e.event_type === CONNECTED_EVENT) connectedEver.add(e.user_id)
    if (isPersonActivity(e.event_type)) {
      const cur = lastSeen.get(e.user_id)
      if (!cur || Date.parse(e.created_at) > Date.parse(cur)) lastSeen.set(e.user_id, e.created_at)
    }
  }

  const affiliateMap = new Map<string, string>()
  for (const a of affiliates) affiliateMap.set(a.user_id, a.status ?? 'active')

  const emailById = new Map(authUsers.map(u => [u.id, u.email ?? '']))
  const teamByEmail = new Map<string, { owner_id: string; owner_email: string; role: string }>()
  for (const t of teams) {
    if (!t.email) continue
    teamByEmail.set(t.email.toLowerCase(), {
      owner_id: t.owner_id,
      owner_email: emailById.get(t.owner_id) ?? '',
      role: t.role ?? 'member',
    })
  }

  // Only live listings. The webhook writes the literal 'live', not 'active';
  // see isLiveListing() in app/admin/studio-stax/page.tsx.
  const staxSet = new Set<string>()
  for (const l of listings) {
    if (l.applicant_email && (l.status === 'approved' || l.status === 'active' || l.status === 'live')) {
      staxSet.add(l.applicant_email.toLowerCase())
    }
  }

  let users = authUsers.map(u => {
    const s = settingsMap.get(u.id)
    const settingsPlan = s?.plan ?? null
    const wsPlan = wsPlanMap.get(u.id) ?? null
    const stats = postStats.get(u.id) ?? { published: 0, partial: 0, failed: 0, scheduled: 0, drafts: 0 }
    const connected = accountMap.get(u.id) ?? []
    const published_events = publishEvents.get(u.id) ?? 0
    return {
      user_id:      u.id,
      email:        u.email ?? '',
      created_at:   u.created_at,
      plan:         normalizePlan(wsPlan ?? settingsPlan),
      // The bug class that has cost this project three outages, visible in the
      // list rather than only after someone complains.
      plan_disagrees: !!settingsPlan && !!wsPlan && normalizePlan(settingsPlan) !== normalizePlan(wsPlan),
      // user_settings.last_active is only written when someone uses the login
      // page, and sessions persist, so on Nov 10 it was older than the
      // person's real activity for 71 of 257 customers. Take the latest of
      // that, the last sign-in, and the last thing they did in the app.
      last_active:  latestIso(s?.last_active, u.last_sign_in_at, lastSeen.get(u.id)),
      display_name: s?.display_name ?? null,
      is_admin:     s?.is_admin ?? false,
      // Ours, not a customer (lib/internal-accounts.ts).
      is_internal:  isInternalEmail(u.email),
      login_count:  s?.login_count ?? 0,
      onboarding_completed: s?.onboarding_completed ?? false,
      connected_platforms: connected,
      // Connected at some point, including people whose connection is gone.
      ever_connected: connected.length > 0 || connectedEver.has(u.id),
      post_stats:     stats,
      platform_stats: platformStats.get(u.id) ?? {},
      // Publishes recorded as they happened, so a post deleted later still counts.
      published_events,
      ever_published: stats.published > 0 || published_events > 0,
      affiliate_status: affiliateMap.get(u.id) ?? null,
      // Whose workspace they post into as a team member, if anyone's.
      team_of: (u.email && teamByEmail.get(u.email.toLowerCase())) || null,
      is_stax:          !!u.email && staxSet.has(u.email.toLowerCase()),
    }
  })

  if (search) {
    const lower = search.toLowerCase()
    users = users.filter(u => u.email.toLowerCase().includes(lower))
  }
  if (plan) users = users.filter(u => u.plan === plan)
  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json({
    users,
    meta: {
      warnings,
      postRowsRead: posts.length,
      accountsRead: authUsers.length,
    },
  })
}

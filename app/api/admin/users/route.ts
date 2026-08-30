export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { normalizePlan } from '@/lib/plan'
import { isInternalEmail } from '@/lib/internal-accounts'

const POSTS_CAP = 20000

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const plan   = searchParams.get('plan')   || ''

  // Primary source: auth.admin.listUsers — has email + created_at for everyone
  const { data: authData, error: authErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  const authUsers = authData?.users ?? []

  // Secondary: user_settings for plan/display_name/is_admin
  const { data: settings, error: settingsErr } = await db
    .from('user_settings')
    .select('user_id, plan, last_active, display_name, is_admin, login_count, onboarding_completed')
    .limit(2000)
  if (settingsErr) console.warn('[admin/users] user_settings:', settingsErr.message)

  const settingsMap: Record<string, typeof settings extends (infer T)[] | null ? T : never> = {}
  for (const s of settings ?? []) {
    settingsMap[s.user_id] = s
  }

  // The plan the app actually enforces.
  //
  // This used to read user_settings.plan alone. That is the exact split that
  // left the first paying customer on free limits for their whole session: the
  // Stripe webhook writes user_settings.plan, while ~20 enforcement sites read
  // workspaces.plan. resolveWorkspacePlan() is the correct reader but it is one
  // query per user, which is 100+ round trips for a list. So fetch every
  // workspace once and apply the same precedence in memory: a personal
  // workspace's own plan wins, then user_settings, then free.
  const { data: allWorkspaces, error: wsErr } = await db
    .from('workspaces')
    .select('owner_id, plan, is_personal')
    .limit(5000)
  if (wsErr) console.warn('[admin/users] workspaces:', wsErr.message)

  const wsPlanMap: Record<string, string> = {}
  for (const w of allWorkspaces ?? []) {
    if (!w.is_personal || !w.plan) continue
    wsPlanMap[w.owner_id] = w.plan
  }

  // Merge — auth is the source of truth for identity
  let merged = authUsers.map(u => {
    const settingsPlan = settingsMap[u.id]?.plan ?? null
    const wsPlan       = wsPlanMap[u.id] ?? null
    return {
      user_id:      u.id,
      email:        u.email ?? '',
      created_at:   u.created_at,
      plan:         normalizePlan(wsPlan ?? settingsPlan),
      // Surfaced so the one bug class that has cost this project three outages
      // is visible in the list rather than only after someone complains.
      plan_disagrees: !!settingsPlan && !!wsPlan && normalizePlan(settingsPlan) !== normalizePlan(wsPlan),
      last_active:  settingsMap[u.id]?.last_active ?? null,
      display_name: settingsMap[u.id]?.display_name ?? null,
      is_admin:     settingsMap[u.id]?.is_admin ?? false,
      // Ours, not a customer. Five of these were being counted in every
      // activation number this project has quoted since March.
      is_internal:  isInternalEmail(u.email),
      login_count:  settingsMap[u.id]?.login_count ?? 0,
      onboarding_completed: settingsMap[u.id]?.onboarding_completed ?? false,
    }
  })

  // Apply filters
  if (search) {
    const lower = search.toLowerCase()
    merged = merged.filter(u => u.email.toLowerCase().includes(lower))
  }
  if (plan) merged = merged.filter(u => u.plan === plan)

  // Sort newest first
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const userIds = merged.map(u => u.user_id)
  const emails  = merged.map(u => u.email).filter(Boolean)

  // Connected accounts, post counts, affiliate profiles, stax listings — all in parallel
  const [accountsRes, postsRes, affiliateRes, staxRes] = await Promise.allSettled([
    db.from('connected_accounts')
      .select('user_id, platform')
      .in('user_id', userIds.length ? userIds : ['none']),
    // POSTS_CAP is a real ceiling, not a page size. At 1,636 rows today there
    // is headroom, but one admin account generates ~30/day, so this will be
    // reached. Crossing it silently would understate every user's post count
    // with no indication anything was dropped, which is precisely the failure
    // shape this codebase keeps paying for — so the response says when it hits.
    db.from('posts')
      .select('user_id, status, platforms')
      .in('user_id', userIds.length ? userIds : ['none'])
      .limit(POSTS_CAP),
    db.from('affiliate_profiles')
      .select('user_id, status')
      .in('user_id', userIds.length ? userIds : ['none']),
    // curated_listings has no user_id — applications are matched by the email
    // the applicant typed. Selecting user_id 400'd, so the listings column on
    // /admin/users has always been empty.
    db.from('curated_listings')
      .select('applicant_email, status')
      .in('applicant_email', emails.length ? emails : ['none']),
  ])

  const accountMap: Record<string, string[]> = {}
  if (accountsRes.status === 'fulfilled') {
    for (const acc of accountsRes.value.data ?? []) {
      if (!accountMap[acc.user_id]) accountMap[acc.user_id] = []
      accountMap[acc.user_id].push(acc.platform)
    }
  }

  type PostStats = { published: number; failed: number; partial: number; scheduled: number }
  type PlatformStats = Record<string, { published: number; failed: number }>

  const postStatsMap: Record<string, PostStats> = {}
  const platformStatsMap: Record<string, PlatformStats> = {}
  const postCountMap: Record<string, number> = {} // kept for backwards compat

  if (postsRes.status === 'fulfilled') {
    for (const p of postsRes.value.data ?? []) {
      const uid = p.user_id
      if (!postStatsMap[uid]) postStatsMap[uid] = { published: 0, failed: 0, partial: 0, scheduled: 0 }
      if (!platformStatsMap[uid]) platformStatsMap[uid] = {}

      const s = p.status as string
      if (s === 'published') { postStatsMap[uid].published++; postCountMap[uid] = (postCountMap[uid] || 0) + 1 }
      else if (s === 'failed') postStatsMap[uid].failed++
      else if (s === 'partial') postStatsMap[uid].partial++
      else if (s === 'scheduled') postStatsMap[uid].scheduled++

      const platforms = p.platforms as string[] | null
      if (Array.isArray(platforms)) {
        for (const platform of platforms) {
          if (!platformStatsMap[uid][platform]) platformStatsMap[uid][platform] = { published: 0, failed: 0 }
          if (s === 'published') platformStatsMap[uid][platform].published++
          else if (s === 'failed' || s === 'partial') platformStatsMap[uid][platform].failed++
        }
      }
    }
  }

  // affiliate: any row = they're in the program; capture status
  const affiliateMap: Record<string, string> = {}
  if (affiliateRes.status === 'fulfilled') {
    for (const a of affiliateRes.value.data ?? []) {
      affiliateMap[a.user_id] = a.status ?? 'active'
    }
  }

  // stax: only count approved listings
  const staxSet = new Set<string>()
  if (staxRes.status === 'fulfilled') {
    for (const s of staxRes.value.data ?? []) {
      if (s.status === 'approved') staxSet.add(s.applicant_email)
    }
  }

  const enriched = merged.map(u => ({
    ...u,
    connected_platforms: accountMap[u.user_id] ?? [],
    posts_count:         postCountMap[u.user_id] ?? 0,
    post_stats:          postStatsMap[u.user_id] ?? { published: 0, failed: 0, partial: 0, scheduled: 0 },
    platform_stats:      platformStatsMap[u.user_id] ?? {},
    affiliate_status:    affiliateMap[u.user_id] ?? null,
    is_stax:             staxSet.has(u.email),
  }))

  const postRowsRead = postsRes.status === 'fulfilled' ? (postsRes.value.data?.length ?? 0) : 0

  return NextResponse.json({
    users: enriched,
    meta: {
      // Every hard ceiling in this route, reported rather than hidden. If any
      // of these flips true the numbers above are understated.
      postsTruncated: postRowsRead >= POSTS_CAP,
      authTruncated:  authUsers.length >= 1000,
      settingsTruncated: (settings?.length ?? 0) >= 2000,
      postRowsRead,
    },
  })
}

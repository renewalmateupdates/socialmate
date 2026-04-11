export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'

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
  const { data: settings } = await db
    .from('user_settings')
    .select('user_id, plan, last_active, display_name, is_admin')
    .limit(2000)

  const settingsMap: Record<string, typeof settings extends (infer T)[] | null ? T : never> = {}
  for (const s of settings ?? []) {
    settingsMap[s.user_id] = s
  }

  // Merge — auth is the source of truth
  let merged = authUsers.map(u => ({
    user_id:      u.id,
    email:        u.email ?? '',
    created_at:   u.created_at,
    plan:         settingsMap[u.id]?.plan ?? 'free',
    last_active:  settingsMap[u.id]?.last_active ?? null,
    display_name: settingsMap[u.id]?.display_name ?? null,
    is_admin:     settingsMap[u.id]?.is_admin ?? false,
  }))

  // Apply filters
  if (search) {
    const lower = search.toLowerCase()
    merged = merged.filter(u => u.email.toLowerCase().includes(lower))
  }
  if (plan) merged = merged.filter(u => u.plan === plan)

  // Sort newest first
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const userIds = merged.map(u => u.user_id)

  // Connected accounts, post counts, affiliate profiles, stax listings — all in parallel
  const [accountsRes, postsRes, affiliateRes, staxRes] = await Promise.allSettled([
    db.from('connected_accounts')
      .select('user_id, platform')
      .in('user_id', userIds.length ? userIds : ['none']),
    db.from('posts')
      .select('user_id')
      .in('user_id', userIds.length ? userIds : ['none'])
      .eq('status', 'published'),
    db.from('affiliate_profiles')
      .select('user_id, status')
      .in('user_id', userIds.length ? userIds : ['none']),
    db.from('curated_listings')
      .select('user_id, status')
      .in('user_id', userIds.length ? userIds : ['none']),
  ])

  const accountMap: Record<string, string[]> = {}
  if (accountsRes.status === 'fulfilled') {
    for (const acc of accountsRes.value.data ?? []) {
      if (!accountMap[acc.user_id]) accountMap[acc.user_id] = []
      accountMap[acc.user_id].push(acc.platform)
    }
  }

  const postCountMap: Record<string, number> = {}
  if (postsRes.status === 'fulfilled') {
    for (const p of postsRes.value.data ?? []) {
      postCountMap[p.user_id] = (postCountMap[p.user_id] || 0) + 1
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
      if (s.status === 'approved') staxSet.add(s.user_id)
    }
  }

  const enriched = merged.map(u => ({
    ...u,
    connected_platforms: accountMap[u.user_id] ?? [],
    posts_count:         postCountMap[u.user_id] ?? 0,
    affiliate_status:    affiliateMap[u.user_id] ?? null,
    is_stax:             staxSet.has(u.user_id),
  }))

  return NextResponse.json({ users: enriched })
}

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

  // Get auth users list (has email + created_at)
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users ?? []

  // Build email + created_at map keyed by user_id
  const authMap: Record<string, { email: string; created_at: string }> = {}
  for (const u of authUsers) {
    authMap[u.id] = { email: u.email ?? '', created_at: u.created_at }
  }

  // Get user_settings for plan, display_name, is_admin
  let query = db
    .from('user_settings')
    .select('user_id, plan, last_active, display_name, is_admin')
    .order('user_id')
    .limit(500)

  if (plan) query = query.eq('plan', plan)

  const { data: settings, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Merge and apply search filter
  let merged = (settings ?? []).map(s => ({
    user_id:     s.user_id,
    email:       authMap[s.user_id]?.email ?? '',
    created_at:  authMap[s.user_id]?.created_at ?? '',
    plan:        s.plan,
    last_active: s.last_active,
    display_name: s.display_name,
    is_admin:    s.is_admin ?? false,
  }))

  if (search) {
    const lower = search.toLowerCase()
    merged = merged.filter(u => u.email.toLowerCase().includes(lower))
  }

  // Sort by created_at desc
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const userIds = merged.map(u => u.user_id)

  // Connected accounts + post counts
  const [accountsRes, postsRes] = await Promise.allSettled([
    db.from('connected_accounts').select('user_id, platform').in('user_id', userIds.length ? userIds : ['none']),
    db.from('posts').select('user_id').in('user_id', userIds.length ? userIds : ['none']).eq('status', 'published'),
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

  const enriched = merged.map(u => ({
    ...u,
    connected_platforms: accountMap[u.user_id] ?? [],
    posts_count: postCountMap[u.user_id] ?? 0,
  }))

  return NextResponse.json({ users: enriched })
}

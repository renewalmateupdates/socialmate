export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: settings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  return settings?.is_admin ? user : null
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const plan   = searchParams.get('plan')   || ''

  let query = db
    .from('user_settings')
    .select('user_id, email, plan, created_at, last_active, display_name, is_admin')
    .order('created_at', { ascending: false })
    .limit(200)

  if (search) query = query.ilike('email', `%${search}%`)
  if (plan)   query = query.eq('plan', plan)

  const { data: users, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get connected account counts per user
  const userIds = (users ?? []).map(u => u.user_id)
  const { data: accounts } = await db
    .from('connected_accounts')
    .select('user_id, platform')
    .in('user_id', userIds.length ? userIds : ['none'])

  // Get post counts per user
  const { data: postCounts } = await db
    .from('posts')
    .select('user_id')
    .in('user_id', userIds.length ? userIds : ['none'])
    .eq('status', 'published')

  const accountMap: Record<string, string[]> = {}
  for (const acc of accounts ?? []) {
    if (!accountMap[acc.user_id]) accountMap[acc.user_id] = []
    accountMap[acc.user_id].push(acc.platform)
  }

  const postCountMap: Record<string, number> = {}
  for (const p of postCounts ?? []) {
    postCountMap[p.user_id] = (postCountMap[p.user_id] || 0) + 1
  }

  const enriched = (users ?? []).map(u => ({
    ...u,
    connected_platforms: accountMap[u.user_id] ?? [],
    posts_count: postCountMap[u.user_id] ?? 0,
  }))

  return NextResponse.json({ users: enriched })
}

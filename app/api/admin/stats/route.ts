export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
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

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  // Today start (UTC)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const [
    usersRes,
    postsRes,
    affiliatesRes,
    listingsRes,
  ] = await Promise.allSettled([
    db.from('user_settings').select('user_id', { count: 'exact', head: true }),
    db.from('posts').select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .eq('status', 'published'),
    db.from('affiliates').select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    db.from('curated_listings').select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  return NextResponse.json({
    total_users:      usersRes.status === 'fulfilled' ? (usersRes.value.count ?? 0) : 0,
    posts_today:      postsRes.status === 'fulfilled' ? (postsRes.value.count ?? 0) : 0,
    active_affiliates: affiliatesRes.status === 'fulfilled' ? (affiliatesRes.value.count ?? 0) : 0,
    stax_listings:    listingsRes.status === 'fulfilled' ? (listingsRes.value.count ?? 0) : 0,
  })
}

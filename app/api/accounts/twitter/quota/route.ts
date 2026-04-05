export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count } = await getSupabaseAdmin()
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .contains('platforms', ['twitter'])
    .eq('status', 'published')
    .gte('published_at', monthStart.toISOString())

  const { data: ws } = await getSupabaseAdmin()
    .from('workspaces')
    .select('plan')
    .eq('owner_id', user.id)
    .maybeSingle()

  const plan = ws?.plan ?? 'free'
  const limits: Record<string, number> = { free: 50, pro: 200, agency: 500 }
  const limit = limits[plan] ?? 50

  return NextResponse.json({ used: count ?? 0, limit, plan })
}

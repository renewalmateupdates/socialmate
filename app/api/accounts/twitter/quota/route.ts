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
    .eq('is_personal', true)
    .maybeSingle()

  const { data: userSettings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('twitter_booster_balance')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = ws?.plan ?? 'free'
  const limits: Record<string, number> = { free: 28, pro: 150, agency: 400 }

  // Admin has no quota cap — return a high ceiling so UI shows unlimited
  const ADMIN_EMAIL = 'socialmatehq@gmail.com'
  const limit = user.email === ADMIN_EMAIL ? 999999 : (limits[plan] ?? 28)
  const boosterBalance = userSettings?.twitter_booster_balance ?? 0

  return NextResponse.json({ used: count ?? 0, limit, plan, boosterBalance })
}

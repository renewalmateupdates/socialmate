export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getSupabaseAdmin()

  // Total clicks all time
  const { count: totalClicks } = await db
    .from('bio_link_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Clicks per link for last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentClicks } = await db
    .from('bio_link_clicks')
    .select('link_id')
    .eq('user_id', user.id)
    .gte('clicked_at', since)

  // Group by link_id
  const byLink: Record<string, number> = {}
  for (const row of (recentClicks ?? [])) {
    byLink[row.link_id] = (byLink[row.link_id] ?? 0) + 1
  }

  return NextResponse.json({
    total_clicks: totalClicks ?? 0,
    by_link: byLink,
  })
}

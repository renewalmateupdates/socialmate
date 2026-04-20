export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const { data: posts } = await getSupabaseAdmin()
    .from('posts')
    .select('id, status, platforms, platform_post_ids, scheduled_at, content, user_id')
    .in('status', ['partial', 'failed'])
    .gte('scheduled_at', since.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20)

  const summary = (posts ?? []).map(p => ({
    id: p.id,
    status: p.status,
    scheduled_at: p.scheduled_at,
    platforms: p.platforms,
    platform_post_ids: p.platform_post_ids,
    succeeded: Object.keys(p.platform_post_ids ?? {}).join(', ') || 'none',
    failed: (p.platforms ?? []).filter((pl: string) => !p.platform_post_ids?.[pl]).join(', ') || 'none',
    preview: (p.content ?? '').slice(0, 60),
  }))

  return NextResponse.json({ count: summary.length, posts: summary })
}

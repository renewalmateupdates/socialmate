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

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '7', 10)
  const since = new Date()
  since.setDate(since.getDate() - Math.min(days, 30))
  since.setHours(0, 0, 0, 0)

  const { data: posts } = await getSupabaseAdmin()
    .from('posts')
    .select('id, status, platforms, platform_post_ids, platform_errors, scheduled_at, content, user_id')
    .in('status', ['partial', 'failed'])
    .gte('scheduled_at', since.toISOString())
    .order('scheduled_at', { ascending: false })
    .limit(50)

  const summary = (posts ?? []).map(p => {
    const failedPlatforms = (p.platforms ?? []).filter((pl: string) => !p.platform_post_ids?.[pl])
    const errors: Record<string, string> = {}
    for (const pl of failedPlatforms) {
      errors[pl] = p.platform_errors?.[pl] ?? 'No error message recorded'
    }
    return {
      id: p.id,
      status: p.status,
      scheduled_at: p.scheduled_at,
      platforms: p.platforms,
      succeeded: Object.keys(p.platform_post_ids ?? {}).join(', ') || 'none',
      failed: failedPlatforms.join(', ') || 'none',
      errors,
      // Array.from splits on full code points, so slicing never cuts an emoji
      // surrogate pair in half (which would render as U+FFFD "�").
      preview: Array.from((p.content ?? '') as string).slice(0, 80).join(''),
    }
  })

  // Aggregate error messages by platform for a quick summary
  const errorSummary: Record<string, Record<string, number>> = {}
  for (const p of summary) {
    for (const [pl, msg] of Object.entries(p.errors)) {
      if (!errorSummary[pl]) errorSummary[pl] = {}
      const key = (msg as string).slice(0, 80)
      errorSummary[pl][key] = (errorSummary[pl][key] ?? 0) + 1
    }
  }

  return NextResponse.json({
    since: since.toISOString(),
    count: summary.length,
    error_summary: errorSummary,
    posts: summary,
  })
}

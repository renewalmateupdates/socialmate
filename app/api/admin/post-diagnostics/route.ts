export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { internalIdsOf, listAllAuthUsers, oldestFirst, selectAll } from '@/lib/admin-metrics'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

// The failure log. Until Nov 10, 2026 it windowed on scheduled_at, which a
// Post Now failure does not have (4 of 119 failures were invisible), stopped
// at 50 posts without saying so, and built its error summary from those 50.
// It now windows on updated_at (when the post failed, the same as /admin/hq),
// summarises every failure in the window, and lists the newest LIST_LIMIT.
const LIST_LIMIT = 100

type FailedRow = {
  id: string; status: string; platforms: string[] | null
  platform_post_ids: Record<string, unknown> | null; platform_errors: Record<string, string> | null
  scheduled_at: string | null; updated_at: string; content: string | null; user_id: string
}

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

  const days = Math.min(30, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '7', 10) || 7))
  // Rolling: "1 day" is the last 24 hours, not since the server's midnight.
  const since = new Date(Date.now() - days * 86_400_000)

  const db = getSupabaseAdmin()
  const loaded = await Promise.all([
    listAllAuthUsers(db),
    selectAll<FailedRow>('posts', () => oldestFirst(db
      .from('posts')
      .select('id, status, platforms, platform_post_ids, platform_errors, scheduled_at, updated_at, content, user_id')
      .in('status', ['partial', 'failed'])
      .gte('updated_at', since.toISOString()))),
  ]).catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
  if (loaded instanceof Error) {
    console.error('[admin/post-diagnostics]', loaded.message)
    return NextResponse.json({ error: loaded.message }, { status: 500 })
  }
  const [users, rows] = loaded
  const internalIds = internalIdsOf(users)

  rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  const summary = rows.map(p => {
    const failedPlatforms = (p.platforms ?? []).filter((pl: string) => !p.platform_post_ids?.[pl])
    const errors: Record<string, string> = {}
    for (const pl of failedPlatforms) {
      errors[pl] = p.platform_errors?.[pl] ?? 'No error message recorded'
    }
    return {
      id: p.id,
      status: p.status,
      // When it failed. Post Now failures have no scheduled_at at all.
      failed_at: p.updated_at,
      scheduled_at: p.scheduled_at,
      // One of our own accounts (lib/internal-accounts.ts), not a customer.
      internal: internalIds.has(p.user_id),
      platforms: p.platforms,
      succeeded: Object.keys(p.platform_post_ids ?? {}).join(', ') || 'none',
      failed: failedPlatforms.join(', ') || 'none',
      errors,
      // Array.from splits on full code points, so slicing never cuts an emoji
      // surrogate pair in half (which would render as U+FFFD "�").
      preview: Array.from((p.content ?? '') as string).slice(0, 80).join(''),
    }
  })

  // Aggregate error messages by platform over every failure in the window.
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
    ours: summary.filter(p => p.internal).length,
    error_summary: errorSummary,
    posts: summary.slice(0, LIST_LIMIT),
  })
}

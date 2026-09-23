export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Cancels a TikTok post that is still waiting on the scheduled-post cron.
// Scoped to `scheduled` only -- a post already publishing/published/failed
// has either already gone out or is mid-flight at TikTok, and cancelling the
// DB row at that point would just make it untrackable, not actually stop it.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getSupabaseAdmin()

  const { data: row, error: rowErr } = await db
    .from('tiktok_posts')
    .select('id, status, video_storage_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (rowErr) return NextResponse.json({ error: 'Could not read that post.' }, { status: 500 })
  if (!row) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (row.status !== 'scheduled') {
    return NextResponse.json({ error: `Can't cancel a post that is already ${row.status}.` }, { status: 400 })
  }

  const { error: delErr } = await db.from('tiktok_posts').delete().eq('id', id)
  if (delErr) return NextResponse.json({ error: 'Could not cancel that post.' }, { status: 500 })

  // Scheduling incremented tiktok_videos_this_month immediately (before the
  // video was ever actually sent) -- cancelling should give that slot back,
  // or a schedule-then-cancel loop quietly burns a user's monthly quota on
  // videos that never posted.
  const { data: ws } = await db
    .from('workspaces')
    .select('tiktok_videos_this_month')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()
  if (ws) {
    await db
      .from('workspaces')
      .update({ tiktok_videos_this_month: Math.max(0, (ws.tiktok_videos_this_month ?? 0) - 1) })
      .eq('owner_id', user.id)
      .eq('is_personal', true)
  }

  // Best-effort storage cleanup -- non-fatal, the row is already gone either way.
  if (row.video_storage_path) {
    const { error: storageErr } = await db.storage.from('media').remove([row.video_storage_path])
    if (storageErr) console.warn('[tiktok/scheduled] storage cleanup failed:', storageErr.message)
  }

  return NextResponse.json({ success: true })
}

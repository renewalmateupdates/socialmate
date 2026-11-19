export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getValidAccessToken } from '@/lib/tiktok-auth'
import { syncTiktokPublishToPosts } from '@/lib/tiktok-post-sync'
import { fetchTiktokPublishStatus, recordTiktokPublishCheck } from '@/lib/tiktok-publish-status'

/**
 * Did TikTok actually publish it?
 *
 * TikTok's Content Posting API is asynchronous. Uploading the file is not
 * publishing: TikTok takes the bytes, returns 200, and then processes the video
 * on its own time. The outcome is only available by polling
 * post/publish/status/fetch with the publish_id.
 *
 * Nothing polled it. confirm-upload wrote `status: 'publishing'` and that was
 * the last word on every TikTok post ever made — the studio showed a success
 * screen the moment the bytes landed, and if TikTok rejected the video for
 * length, format, copyrighted audio or anything else, the creator was never
 * told and neither were we. The row stayed 'publishing' forever.
 *
 * The Studio polls this for two minutes while the creator watches. The check
 * and the write live in lib/tiktok-publish-status.ts, shared with the Inngest
 * follow-up that keeps checking after they leave (settleTiktokPublishes).
 *
 * POST { publish_id } — checks once, writes the outcome through, returns it.
 */

export async function POST(request: NextRequest) {
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

  const { publish_id } = await request.json().catch(() => ({ publish_id: null }))
  if (!publish_id) return NextResponse.json({ error: 'publish_id required' }, { status: 400 })

  // Scope the lookup to this user so a publish_id cannot be used to read or
  // mutate somebody else's post.
  const { data: row, error: rowErr } = await getSupabaseAdmin()
    .from('tiktok_posts')
    .select('id, status, workspace_id, post_caption')
    .eq('tiktok_post_id', publish_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (rowErr) {
    console.warn('[tiktok/publish-status] row lookup failed:', rowErr.message)
    return NextResponse.json({ error: 'Could not read that post.' }, { status: 500 })
  }
  if (!row) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Already settled (by an earlier poll or by the follow-up job): no reason to
  // ask TikTok again.
  if (row.status === 'published' || row.status === 'failed' || row.status === 'in_drafts') {
    return NextResponse.json({ status: row.status, settled: true })
  }

  const auth = await getValidAccessToken(user.id)
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: 400 })

  const check = await fetchTiktokPublishStatus(publish_id, auth.token)

  if (check.kind === 'unchecked') {
    console.warn('[tiktok/publish-status] fetch failed:', check.httpStatus)
    // Deliberately does not mark the post failed. A status check that could not
    // run says nothing about whether the video published.
    return NextResponse.json({ status: row.status, settled: false, checked: false }, { status: 200 })
  }

  // Still processing (PROCESSING_UPLOAD, PROCESSING_DOWNLOAD).
  if (check.kind === 'processing') {
    return NextResponse.json({
      status: 'publishing',
      settled: false,
      checked: true,
      tiktokStatus: check.tiktokStatus,
    })
  }

  const result = await recordTiktokPublishCheck(
    getSupabaseAdmin(),
    { id: row.id, user_id: user.id, workspace_id: row.workspace_id ?? null, post_caption: row.post_caption ?? null },
    check,
    auth.openId,
    syncTiktokPublishToPosts,
  )

  // Reported to the creator either way: TikTok's answer stands even if our own
  // bookkeeping refused the write (recorded: false).
  return NextResponse.json({
    status: result.status,
    settled: true,
    recorded: result.recorded,
    ...(result.status === 'failed' ? { reason: result.reason } : {}),
  })
}

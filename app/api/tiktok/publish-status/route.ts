export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getValidAccessToken } from '@/lib/tiktok-auth'

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
 * POST { publish_id } — checks once, writes the outcome through, returns it.
 */

// TikTok's documented terminal and in-flight states.
const TERMINAL_OK   = 'PUBLISH_COMPLETE'
const TERMINAL_FAIL = 'FAILED'
// For an inbox upload this is the finish line, not a staging step: the video is
// sitting in the creator's TikTok drafts waiting for them to open the app.
const TERMINAL_INBOX = 'SEND_TO_USER_INBOX'

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
    .select('id, status')
    .eq('tiktok_post_id', publish_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (rowErr) {
    console.warn('[tiktok/publish-status] row lookup failed:', rowErr.message)
    return NextResponse.json({ error: 'Could not read that post.' }, { status: 500 })
  }
  if (!row) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Already settled — no reason to ask TikTok again.
  if (row.status === 'published' || row.status === 'failed' || row.status === 'in_drafts') {
    return NextResponse.json({ status: row.status, settled: true })
  }

  const auth = await getValidAccessToken(user.id)
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: 400 })

  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${auth.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ publish_id }),
  })

  const payload = await res.json().catch(() => null)
  if (!res.ok || !payload) {
    console.warn('[tiktok/publish-status] fetch failed:', res.status)
    // Deliberately does not mark the post failed. A status check that could not
    // run says nothing about whether the video published.
    return NextResponse.json({ status: row.status, settled: false, checked: false }, { status: 200 })
  }

  const tikTokStatus: string | undefined = payload?.data?.status
  const failReason:  string | undefined = payload?.data?.fail_reason
  const publiclyAvailable: string[] | undefined = payload?.data?.publicaly_available_post_id
    ?? payload?.data?.publicly_available_post_id

  if (tikTokStatus === TERMINAL_OK) {
    await getSupabaseAdmin()
      .from('tiktok_posts')
      .update({
        status: 'published',
        error_message: null,
        // TikTok returns the real post id here once it exists. Keep it — it is
        // the only link between our row and the video on their side.
        tiktok_account_open_id: auth.openId,
        video_url: Array.isArray(publiclyAvailable) && publiclyAvailable.length
          ? `https://www.tiktok.com/@/video/${publiclyAvailable[0]}`
          : undefined,
      })
      .eq('id', row.id)
    return NextResponse.json({ status: 'published', settled: true })
  }

  if (tikTokStatus === TERMINAL_FAIL) {
    await getSupabaseAdmin()
      .from('tiktok_posts')
      .update({
        status: 'failed',
        error_message: failReason || 'TikTok rejected the video without giving a reason.',
      })
      .eq('id', row.id)
    return NextResponse.json({
      status: 'failed',
      settled: true,
      reason: failReason || null,
    })
  }

  if (tikTokStatus === TERMINAL_INBOX) {
    await getSupabaseAdmin()
      .from('tiktok_posts')
      .update({ status: 'in_drafts', error_message: null })
      .eq('id', row.id)
    return NextResponse.json({ status: 'in_drafts', settled: true })
  }

  // Still processing (PROCESSING_UPLOAD, PROCESSING_DOWNLOAD).
  return NextResponse.json({
    status: 'publishing',
    settled: false,
    checked: true,
    tiktokStatus: tikTokStatus ?? null,
  })
}

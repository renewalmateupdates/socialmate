export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getValidAccessToken } from '@/lib/tiktok-auth'

const PLAN_TIKTOK_QUOTA: Record<string, number> = {
  free:           20,
  pro:            60,
  pro_annual:     60,
  agency:         200,
  agency_annual:  200,
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    video_url,
    video_storage_path,
    video_size_bytes,
    video_duration_seconds,
    post_caption      = '',
    hashtags          = [],
    caption_overlay   = '',
    caption_position  = 'bottom',
    caption_color     = '#ffffff',
    active_filter     = 'None',
    sound_id,
    sound_name,
    privacy_level     = 'PUBLIC_TO_EVERYONE',
    disable_duet      = false,
    disable_comment   = false,
    disable_stitch    = false,
    scheduled_at,
    workspace_id,
  } = body

  if (!video_url || !video_storage_path) {
    return NextResponse.json({ error: 'video_url and video_storage_path are required' }, { status: 400 })
  }

  // Check quota
  const { data: settings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan      = settings?.plan || 'free'
  const quota     = PLAN_TIKTOK_QUOTA[plan] ?? 5

  const { data: ws } = await getSupabaseAdmin()
    .from('workspaces')
    .select('tiktok_videos_this_month, tiktok_booster_credits, tiktok_quota_reset_at')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()

  let videosThisMonth  = ws?.tiktok_videos_this_month ?? 0
  let boosterCredits   = ws?.tiktok_booster_credits ?? 0

  // Reset monthly counter if needed
  const resetAt = ws?.tiktok_quota_reset_at
    ? new Date(ws.tiktok_quota_reset_at)
    : new Date(0)
  const now = new Date()
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    videosThisMonth = 0
    await getSupabaseAdmin()
      .from('workspaces')
      .update({ tiktok_videos_this_month: 0, tiktok_quota_reset_at: now.toISOString().slice(0, 10) })
      .eq('owner_id', user.id)
      .eq('is_personal', true)
  }

  const remaining = quota - videosThisMonth + boosterCredits
  if (remaining <= 0) {
    return NextResponse.json({
      error: `TikTok video quota reached (${quota}/month on ${plan} plan). Purchase a TikTok Booster pack to continue.`,
      quota_exhausted: true,
    }, { status: 429 })
  }

  // Build the full caption with hashtags
  const hashtagStr = (hashtags as string[]).map(t => `#${t.replace(/^#/, '')}`).join(' ')
  const fullCaption = [post_caption, hashtagStr].filter(Boolean).join('\n\n').slice(0, 2200)

  // Create tiktok_posts record
  const { data: tikPost, error: insertErr } = await getSupabaseAdmin()
    .from('tiktok_posts')
    .insert({
      user_id:               user.id,
      workspace_id:          workspace_id || null,
      video_storage_path,
      video_url,
      video_size_bytes:      video_size_bytes || null,
      video_duration_seconds: video_duration_seconds || null,
      post_caption:          fullCaption,
      hashtags,
      caption_overlay,
      caption_position,
      caption_color,
      active_filter,
      sound_id:              sound_id || null,
      sound_name:            sound_name || null,
      privacy_level,
      disable_duet,
      disable_comment,
      disable_stitch,
      scheduled_at:          scheduled_at || null,
      status:                scheduled_at ? 'scheduled' : 'publishing',
    })
    .select('id')
    .single()

  if (insertErr || !tikPost) {
    return NextResponse.json({ error: 'Failed to create post record' }, { status: 500 })
  }

  // If scheduled, return immediately — Inngest cron will publish at the right time
  if (scheduled_at) {
    await getSupabaseAdmin()
      .from('workspaces')
      .update({ tiktok_videos_this_month: videosThisMonth + 1 })
      .eq('owner_id', user.id)
      .eq('is_personal', true)

    return NextResponse.json({ success: true, tiktok_post_id: tikPost.id, scheduled: true })
  }

  // Publish now — call TikTok API via PULL_FROM_URL
  const auth = await getValidAccessToken(user.id)
  if (!auth.ok) {
    await getSupabaseAdmin()
      .from('tiktok_posts')
      .update({ status: 'failed', error_message: auth.message })
      .eq('id', tikPost.id)
    return NextResponse.json({ error: auth.message }, { status: 400 })
  }

  const postBody: Record<string, unknown> = {
    post_info: {
      title:                fullCaption,
      privacy_level,
      disable_duet,
      disable_comment,
      disable_stitch,
      video_cover_timestamp_ms: 0,
    },
    source_info: {
      source:    'PULL_FROM_URL',
      video_url,
    },
  }

  if (sound_id && sound_id !== 'original') {
    (postBody.post_info as Record<string, unknown>).music_id = sound_id
  }

  const tikRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${auth.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(postBody),
  })

  const tikData = await tikRes.json().catch(() => ({}))

  if (!tikRes.ok) {
    const errMsg = tikData?.error?.message || `TikTok API error ${tikRes.status}`
    await getSupabaseAdmin()
      .from('tiktok_posts')
      .update({ status: 'failed', error_message: errMsg })
      .eq('id', tikPost.id)
    return NextResponse.json({ error: errMsg }, { status: 502 })
  }

  const publishId   = tikData?.data?.publish_id
  const tiktokPostId = tikData?.data?.publicaly_available_post_id?.[0] || publishId

  await getSupabaseAdmin()
    .from('tiktok_posts')
    .update({
      status:               'published',
      tiktok_post_id:       tiktokPostId,
      tiktok_account_open_id: auth.openId,
    })
    .eq('id', tikPost.id)

  // Increment quota usage
  await getSupabaseAdmin()
    .from('workspaces')
    .update({ tiktok_videos_this_month: videosThisMonth + 1 })
    .eq('owner_id', user.id)
    .eq('is_personal', true)

  return NextResponse.json({
    success:        true,
    tiktok_post_id: tiktokPostId,
    publish_id:     publishId,
  })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const PLAN_TIKTOK_QUOTA: Record<string, number> = {
  free:          20,
  pro:           60,
  pro_annual:    60,
  agency:        200,
  agency_annual: 200,
}

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

  const body = await request.json()
  const {
    publish_id,
    open_id,
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
    full_caption,
  } = body

  if (!publish_id) return NextResponse.json({ error: 'publish_id required' }, { status: 400 })

  // Check quota
  const { data: settings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan  = settings?.plan || 'free'
  const quota = PLAN_TIKTOK_QUOTA[plan] ?? 5

  const { data: ws } = await getSupabaseAdmin()
    .from('workspaces')
    .select('tiktok_videos_this_month, tiktok_booster_credits, tiktok_quota_reset_at')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()

  let videosThisMonth = ws?.tiktok_videos_this_month ?? 0
  const boosterCredits = ws?.tiktok_booster_credits ?? 0

  const resetAt = ws?.tiktok_quota_reset_at ? new Date(ws.tiktok_quota_reset_at) : new Date(0)
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

  const captionToStore = full_caption || post_caption

  // The error here was discarded, and the route returned success regardless.
  // video_storage_path and video_url are both NOT NULL, and FILE_UPLOAD has
  // neither — TikTok holds the bytes, we never do — so every insert since the
  // switch away from PULL_FROM_URL on 5 May was rejected and every caller was
  // told it worked. tiktok_posts stopped gaining rows that day and nobody
  // found out, because the upload itself genuinely succeeds.
  const { error: insertError } = await getSupabaseAdmin()
    .from('tiktok_posts')
    .insert({
      user_id:                user.id,
      workspace_id:           workspace_id || null,
      video_storage_path:     null,
      video_url:              null,
      video_size_bytes:       video_size_bytes || null,
      video_duration_seconds: video_duration_seconds || null,
      post_caption:           captionToStore,
      hashtags,
      caption_overlay,
      caption_position,
      caption_color,
      active_filter,
      sound_id:               sound_id || null,
      sound_name:             sound_name || null,
      privacy_level,
      disable_duet,
      disable_comment,
      disable_stitch,
      scheduled_at:           scheduled_at || null,
      status:                 scheduled_at ? 'scheduled' : 'publishing',
      tiktok_post_id:         publish_id,
      tiktok_account_open_id: open_id || null,
    })

  // Deliberately not a 500. The video is already at TikTok by this point, so
  // reporting failure would be a lie in the other direction. But the row is
  // what publish-status polls, so without it the post is untrackable and the
  // studio can never say whether TikTok accepted it. Say so.
  if (insertError) {
    console.error('[tiktok/confirm-upload] could not record the post:', insertError.message)
  }

  const { error: quotaError } = await getSupabaseAdmin()
    .from('workspaces')
    .update({ tiktok_videos_this_month: videosThisMonth + 1 })
    .eq('owner_id', user.id)
    .eq('is_personal', true)
  if (quotaError) console.warn('[tiktok/confirm-upload] quota increment failed:', quotaError.message)

  return NextResponse.json({
    success: true,
    publish_id,
    recorded: !insertError,
    ...(insertError ? { warning: 'The video reached TikTok but we could not record it, so its status cannot be tracked here.' } : {}),
  })
}

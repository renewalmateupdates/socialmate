export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function getValidAccessToken(userId: string): Promise<{ token: string; openId: string } | null> {
  const { data: account } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, expires_at, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (!account) return null

  let token = account.access_token

  if (account.expires_at) {
    const expiresAt = new Date(account.expires_at)
    if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000 && account.refresh_token) {
      const clientKey    = process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY!
      const clientSecret = process.env.TIKTOK_SANDBOX_CLIENT_SECRET || process.env.TIKTOK_CLIENT_SECRET!
      const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientKey, client_secret: clientSecret,
          grant_type: 'refresh_token', refresh_token: account.refresh_token,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const expires_at = data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : null
        await getSupabaseAdmin()
          .from('connected_accounts')
          .update({ access_token: data.access_token, refresh_token: data.refresh_token, expires_at })
          .eq('id', account.id)
        token = data.access_token
      }
    }
  }

  return { token, openId: account.platform_user_id }
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
    video_size,
    post_caption    = '',
    hashtags        = [],
    privacy_level   = 'PUBLIC_TO_EVERYONE',
    disable_duet    = false,
    disable_comment = false,
    disable_stitch  = false,
    sound_id,
  } = body

  if (!video_size) return NextResponse.json({ error: 'video_size required' }, { status: 400 })

  const auth = await getValidAccessToken(user.id)
  if (!auth) return NextResponse.json({ error: 'TikTok account not connected' }, { status: 400 })

  const hashtagStr = (hashtags as string[]).map((t: string) => `#${t.replace(/^#/, '')}`).join(' ')
  const fullCaption = [post_caption, hashtagStr].filter(Boolean).join('\n\n').slice(0, 2200)

  // Unaudited (pre-production-approval) apps can only post as SELF_ONLY.
  // Once the TikTok app review passes, remove this override.
  const effectivePrivacy = 'SELF_ONLY'

  const postInfo: Record<string, unknown> = {
    title:                    fullCaption,
    privacy_level:            effectivePrivacy,
    disable_duet,
    disable_comment,
    disable_stitch,
    video_cover_timestamp_ms: 0,
  }
  if (sound_id && sound_id !== 'original') postInfo.music_id = sound_id

  // FILE_UPLOAD: client will PUT the blob directly to TikTok's upload URL
  // No domain verification needed — avoids PULL_FROM_URL domain issues entirely
  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${auth.token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info:   postInfo,
      source_info: {
        source:             'FILE_UPLOAD',
        video_size:         video_size,
        chunk_size:         video_size,   // single chunk
        total_chunk_count:  1,
      },
    }),
  })

  const initData = await initRes.json().catch(() => ({}))

  if (!initRes.ok) {
    const errMsg = initData?.error?.message || `TikTok init error ${initRes.status}`
    console.error('[tiktok/init-upload]', errMsg, initData)
    return NextResponse.json({ error: errMsg }, { status: 502 })
  }

  const { publish_id, upload_url } = initData?.data ?? {}
  if (!upload_url) return NextResponse.json({ error: 'No upload URL from TikTok' }, { status: 502 })

  return NextResponse.json({ upload_url, publish_id, open_id: auth.openId, full_caption: fullCaption })
}

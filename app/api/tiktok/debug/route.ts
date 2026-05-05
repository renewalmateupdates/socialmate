export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: account } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, expires_at, scope')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (!account) return NextResponse.json({ error: 'No TikTok account connected' })

  const clientKey = process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY!

  // Test 1: creator_info (requires video.publish scope)
  const creatorRes  = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
    method:  'POST',
    headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body:    JSON.stringify({}),
  })
  const creatorData = await creatorRes.json().catch(() => ({}))

  // Test 2: minimal init call
  const initRes  = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method:  'POST',
    headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body:    JSON.stringify({
      post_info:   { title: 'test', privacy_level: 'SELF_ONLY', disable_duet: true, disable_comment: true, disable_stitch: true, video_cover_timestamp_ms: 0 },
      source_info: { source: 'FILE_UPLOAD', video_size: 1000000, chunk_size: 1000000, total_chunk_count: 1 },
    }),
  })
  const initData = await initRes.json().catch(() => ({}))

  return NextResponse.json({
    token_expires_at: account.expires_at,
    token_expired:    account.expires_at ? new Date(account.expires_at) < new Date() : false,
    stored_scope:     account.scope,
    client_key_prefix: clientKey?.slice(0, 10) + '...',
    creator_info: {
      http_status: creatorRes.status,
      error_code:  creatorData?.error?.code,
      error_msg:   creatorData?.error?.message,
      data:        creatorData?.data,
    },
    init_test: {
      http_status: initRes.status,
      error_code:  initData?.error?.code,
      error_msg:   initData?.error?.message,
      data:        initData?.data,
    },
  })
}

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Temporary diagnostic route — remove after TikTok posting is confirmed working
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
    .select('id, access_token, refresh_token, expires_at, platform_user_id, scope')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (!account) return NextResponse.json({ error: 'No TikTok account connected' })

  const tokenExpiry   = account.expires_at ? new Date(account.expires_at).toISOString() : 'unknown'
  const tokenExpired  = account.expires_at ? new Date(account.expires_at) < new Date() : false
  const storedScope   = account.scope || 'not stored'

  // Test creator_info endpoint (requires video.publish scope)
  const creatorRes = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${account.access_token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({}),
  })
  const creatorData = await creatorRes.json().catch(() => ({}))

  // Test a minimal init call to see the exact TikTok error
  const clientKey    = process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY!
  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${account.access_token}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title:                    'test',
        privacy_level:            'SELF_ONLY',
        disable_duet:             true,
        disable_comment:          true,
        disable_stitch:           true,
        video_cover_timestamp_ms: 0,
      },
      source_info: {
        source:            'FILE_UPLOAD',
        video_size:        1000000,
        chunk_size:        1000000,
        total_chunk_count: 1,
      },
    }),
  })
  const initData = await initRes.json().catch(() => ({}))

  return NextResponse.json({
    token_expires_at: tokenExpiry,
    token_expired:    tokenExpired,
    stored_scope:     storedScope,
    client_key_used:  clientKey?.slice(0, 8) + '...',
    creator_info: {
      status:     creatorRes.status,
      ok:         creatorRes.ok,
      error_code: creatorData?.error?.code,
      error_msg:  creatorData?.error?.message,
      data:       creatorData?.data,
    },
    init_test: {
      status:     initRes.status,
      ok:         initRes.ok,
      error_code: initData?.error?.code,
      error_msg:  initData?.error?.message,
      data:       initData?.data,
    },
  })
}

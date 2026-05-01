export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function refreshTokenIfNeeded(accountId: string, refreshToken: string) {
  const clientKey    = process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY!
  const clientSecret = process.env.TIKTOK_SANDBOX_CLIENT_SECRET || process.env.TIKTOK_CLIENT_SECRET!

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key:    clientKey,
      client_secret: clientSecret,
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()

  const expires_at = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null

  await getSupabaseAdmin()
    .from('connected_accounts')
    .update({ access_token: data.access_token, refresh_token: data.refresh_token, expires_at })
    .eq('id', accountId)

  return data.access_token as string
}

export async function GET() {
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
  if (!user) return NextResponse.json({ connected: false })

  const { data: account } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, account_name, profile_image_url, platform_user_id, access_token, refresh_token, expires_at')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (!account) return NextResponse.json({ connected: false })

  // Refresh token if expired or expiring in < 5 min
  let accessToken = account.access_token
  if (account.expires_at) {
    const expiresAt = new Date(account.expires_at)
    if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000 && account.refresh_token) {
      accessToken = await refreshTokenIfNeeded(account.id, account.refresh_token) ?? accessToken
    }
  }

  // Fetch creator info from TikTok (max video duration, etc.)
  let creatorInfo: Record<string, unknown> = {}
  try {
    const res = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
      {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({}),
      }
    )
    if (res.ok) {
      const data = await res.json()
      creatorInfo = data?.data ?? {}
    }
  } catch (err) {
    console.error('[TikTok creator-info] fetch failed (non-fatal):', err)
  }

  return NextResponse.json({
    connected:       true,
    account_name:    account.account_name,
    avatar_url:      account.profile_image_url,
    open_id:         account.platform_user_id,
    creator_info:    creatorInfo,
  })
}

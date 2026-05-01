export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL!
  const clientKey  = process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY!
  const clientSecret = process.env.TIKTOK_SANDBOX_CLIENT_SECRET || process.env.TIKTOK_CLIENT_SECRET!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=tiktok_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('tiktok_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=tiktok_invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key:    clientKey,
      client_secret: clientSecret,
      code,
      grant_type:    'authorization_code',
      redirect_uri:  `${appUrl}/api/tiktok/callback`,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}))
    console.error('[TikTok OAuth] Token exchange failed:', err)
    return NextResponse.redirect(`${appUrl}/accounts?error=tiktok_token_failed`)
  }

  const {
    access_token,
    refresh_token,
    expires_in,
    open_id,
    scope,
  } = await tokenRes.json()

  const expires_at = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null

  // Fetch TikTok user info
  const userRes = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username',
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  let displayName    = 'TikTok Account'
  let avatarUrl: string | null = null
  let username: string | null  = null

  if (userRes.ok) {
    const userData = await userRes.json()
    displayName = userData?.data?.user?.display_name || 'TikTok Account'
    avatarUrl   = userData?.data?.user?.avatar_url   || null
    username    = userData?.data?.user?.username      || null
  }

  const account_name = username ? `@${username}` : displayName

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
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  const platformUserId = open_id as string

  // Upsert connected_account
  const { data: existing } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .eq('platform_user_id', platformUserId)
    .maybeSingle()

  if (existing) {
    await getSupabaseAdmin()
      .from('connected_accounts')
      .update({ access_token, refresh_token, expires_at, account_name, profile_image_url: avatarUrl })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await getSupabaseAdmin()
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'tiktok',
        platform_user_id: platformUserId,
        account_name,
        profile_image_url: avatarUrl,
        access_token,
        refresh_token:    refresh_token || null,
        expires_at,
        scope:            scope || 'user.info.basic,video.publish,video.upload',
      })

    if (dbError) {
      console.error('[TikTok OAuth] DB insert error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=tiktok_db_error`)
    }
  }

  cookieStore.delete('tiktok_oauth_state')

  return NextResponse.redirect(`${appUrl}/tiktok/studio?connected=1`)
}

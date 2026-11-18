export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { checkAccountSlot } from '@/lib/account-limits'
import { appUrl } from '@/lib/meta'
import { YOUTUBE_SCOPES } from '@/lib/youtube'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const base = appUrl()

  if (error || !code) {
    return NextResponse.redirect(`${base}/accounts?error=youtube_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('youtube_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${base}/accounts?error=youtube_invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: `${base}/api/accounts/youtube/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    console.error('[YouTube OAuth] token exchange failed:', tokenRes.status, await tokenRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=youtube_token_failed`)
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json()
  const expires_at = new Date(Date.now() + Number(expires_in || 3600) * 1000).toISOString()

  // The channel the person signed in with (youtube.readonly).
  const channelRes = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!channelRes.ok) {
    console.error('[YouTube OAuth] channel lookup failed:', channelRes.status, await channelRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=youtube_token_failed`)
  }

  const channelData = await channelRes.json()
  const channel = channelData.items?.[0]

  if (!channel) {
    return NextResponse.redirect(`${base}/accounts?error=youtube_no_channel`)
  }

  const account_name = channel.snippet.title || 'YouTube Channel'
  const profile_image_url = channel.snippet.thumbnails?.default?.url || null
  const platform_user_id = channel.id

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${base}/login`)

  const { data: existing, error: existingError } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'youtube')
    .eq('platform_user_id', platform_user_id)
    .maybeSingle()
  if (existingError) console.warn('[YouTube OAuth] existing-account lookup failed:', existingError.message)

  // Plan cap on connected accounts per platform. Reconnecting an account this
  // workspace already holds is a token refresh, not a new slot, so it passes.
  if (!existing) {
    const slot = await checkAccountSlot(user.id, 'youtube', null, platform_user_id)
    if (!slot.allowed) {
      return NextResponse.redirect(
        `${base}/accounts?error=youtube_plan_limit&limit=${slot.limit}&plan=${slot.plan}`
      )
    }
  }

  const scope = YOUTUBE_SCOPES.map(s => s.split('/').pop()).join(' ')

  if (existing) {
    // Google only returns a refresh token on consent; keep the stored one if this exchange had none.
    const update: Record<string, unknown> = { access_token, expires_at, account_name, profile_image_url, scope, is_active: true }
    if (refresh_token) update.refresh_token = refresh_token
    const { error: updateError } = await supabase
      .from('connected_accounts')
      .update(update)
      .eq('id', existing.id)
    if (updateError) {
      console.error('[YouTube OAuth] update failed:', updateError)
      return NextResponse.redirect(`${base}/accounts?error=youtube_db_error`)
    }
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        platform: 'youtube',
        platform_user_id,
        account_name,
        profile_image_url,
        access_token,
        refresh_token,
        expires_at,
        scope,
      })

    if (dbError) {
      console.error('[YouTube OAuth] insert failed:', dbError)
      return NextResponse.redirect(`${base}/accounts?error=youtube_db_error`)
    }
  }

  cookieStore.delete('youtube_oauth_state')
  return NextResponse.redirect(`${base}/accounts?success=youtube_connected`)
}

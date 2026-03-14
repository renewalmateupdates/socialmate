import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=youtube_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('youtube_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=youtube_invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}/api/accounts/youtube/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=youtube_token_failed`)
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json()
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()

  // Get YouTube channel info
  const channelRes = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!channelRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=youtube_token_failed`)
  }

  const channelData = await channelRes.json()
  const channel = channelData.items?.[0]

  if (!channel) {
    return NextResponse.redirect(`${appUrl}/accounts?error=youtube_no_channel`)
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
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'youtube')
    .eq('platform_user_id', platform_user_id)
    .single()

  if (existing) {
    await supabase
      .from('connected_accounts')
      .update({ access_token, refresh_token, expires_at, account_name, profile_image_url })
      .eq('id', existing.id)
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
        scope: 'youtube.readonly youtube.upload',
      })

    if (dbError) {
      console.error('YouTube DB error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=youtube_db_error`)
    }
  }

  cookieStore.delete('youtube_oauth_state')
  return NextResponse.redirect(`${appUrl}/accounts?success=youtube_connected`)
}
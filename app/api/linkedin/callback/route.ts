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
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL!
  const clientId     = process.env.LINKEDIN_CLIENT_ID!
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('linkedin_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_invalid_state`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  `${appUrl}/api/linkedin/callback`,
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}))
    console.error('[LinkedIn OAuth] Token exchange failed:', err)
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_token_failed`)
  }

  const { access_token, expires_in } = await tokenRes.json()
  const expires_at = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null

  // Fetch LinkedIn user profile via OpenID Connect userinfo endpoint
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    console.error('[LinkedIn OAuth] Userinfo fetch failed:', await userRes.text())
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_token_failed`)
  }

  const userInfo = await userRes.json()
  const platformUserId = userInfo.sub as string
  const displayName    = [userInfo.given_name, userInfo.family_name].filter(Boolean).join(' ') || 'LinkedIn User'
  const avatarUrl      = userInfo.picture || null
  const email          = userInfo.email   || null

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
  if (!user) return NextResponse.redirect(`${appUrl}/login?redirect=/accounts`)

  // Upsert connected_account
  const { data: existing } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'linkedin')
    .eq('platform_user_id', platformUserId)
    .maybeSingle()

  if (existing) {
    await getSupabaseAdmin()
      .from('connected_accounts')
      .update({
        access_token,
        expires_at,
        account_name:       displayName,
        profile_image_url:  avatarUrl,
      })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await getSupabaseAdmin()
      .from('connected_accounts')
      .insert({
        user_id:           user.id,
        platform:          'linkedin',
        platform_user_id:  platformUserId,
        account_name:      displayName,
        profile_image_url: avatarUrl,
        access_token,
        refresh_token:     null, // LinkedIn doesn't issue refresh tokens on basic plan
        expires_at,
        scope:             'openid profile email w_member_social',
        metadata:          email ? { email } : null,
      })

    if (dbError) {
      console.error('[LinkedIn OAuth] DB insert error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_db_error`)
    }
  }

  cookieStore.delete('linkedin_oauth_state')
  return NextResponse.redirect(`${appUrl}/accounts?success=linkedin_connected`)
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { checkAccountSlot } from '@/lib/account-limits'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('linkedin_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_invalid_state`)
  }

  // Exchange code for token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl}/api/accounts/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_token_failed`)
  }

  const { access_token, expires_in } = await tokenRes.json()
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()

  // Get user info via OpenID userinfo endpoint
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_token_failed`)
  }

  const linkedinUser = await userRes.json()
  const account_name = linkedinUser.name || linkedinUser.email || 'LinkedIn Account'
  const profile_image_url = linkedinUser.picture || null
  const platform_user_id = linkedinUser.sub

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
    .eq('platform', 'linkedin')
    .eq('platform_user_id', platform_user_id)
    .single()

  // Plan cap on connected accounts per platform. Reconnecting an account this
  // workspace already holds is a token refresh, not a new slot, so it passes.
  if (!existing) {
    const slot = await checkAccountSlot(user.id, 'linkedin', null, platform_user_id)
    if (!slot.allowed) {
      return NextResponse.redirect(
        `${appUrl}/accounts?error=linkedin_plan_limit&limit=${slot.limit}&plan=${slot.plan}`
      )
    }
  }

  if (existing) {
    await supabase
      .from('connected_accounts')
      .update({ access_token, expires_at, account_name, profile_image_url })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        platform: 'linkedin',
        platform_user_id,
        account_name,
        profile_image_url,
        access_token,
        refresh_token: null,
        expires_at,
        scope: 'openid profile email w_member_social',
      })

    if (dbError) {
      console.error('LinkedIn DB error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=linkedin_db_error`)
    }
  }

  cookieStore.delete('linkedin_oauth_state')
  return NextResponse.redirect(`${appUrl}/accounts?success=linkedin_connected`)
}
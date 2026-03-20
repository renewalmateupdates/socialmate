export const dynamic = 'force-dynamic'
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
    return NextResponse.redirect(`${appUrl}/accounts?error=pinterest_denied`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('pinterest_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=pinterest_invalid_state`)
  }

  // Exchange code for token
  const credentials = Buffer.from(
    `${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`
  ).toString('base64')

  const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl}/api/accounts/pinterest/callback`,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=pinterest_token_failed`)
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json()
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()

  // Get user info
  const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=pinterest_token_failed`)
  }

  const pinterestUser = await userRes.json()
  const account_name = pinterestUser.username || pinterestUser.business_name || 'Pinterest Account'
  const profile_image_url = pinterestUser.profile_image || null
  const platform_user_id = pinterestUser.username

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
    .eq('platform', 'pinterest')
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
        platform: 'pinterest',
        platform_user_id,
        account_name,
        profile_image_url,
        access_token,
        refresh_token,
        expires_at,
        scope: 'boards:read,pins:read,pins:write',
      })

    if (dbError) {
      console.error('Pinterest DB error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=pinterest_db_error`)
    }
  }

  cookieStore.delete('pinterest_oauth_state')
  return NextResponse.redirect(`${appUrl}/accounts?success=pinterest_connected`)
}
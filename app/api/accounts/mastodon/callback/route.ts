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
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_denied`)
  }

  const cookieStore = await cookies()
  const raw = cookieStore.get('mastodon_oauth')?.value

  if (!raw) {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_invalid_state`)
  }

  let oauthData: { state: string; instance: string; clientId: string; clientSecret: string }
  try {
    oauthData = JSON.parse(raw)
  } catch {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_invalid_state`)
  }

  if (oauthData.state !== state) {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_invalid_state`)
  }

  const { instance, clientId, clientSecret } = oauthData
  const redirectUri = `${appUrl}/api/accounts/mastodon/callback`

  // Exchange code for token
  const tokenRes = await fetch(`https://${instance}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code,
      scope: 'read write',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_token_failed`)
  }

  const { access_token } = await tokenRes.json()

  // Get user info
  const userRes = await fetch(`https://${instance}/api/v1/accounts/verify_credentials`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_token_failed`)
  }

  const mastodonUser = await userRes.json()
  const account_name = mastodonUser.acct || mastodonUser.username
  const profile_image_url = mastodonUser.avatar || null
  const platform_user_id = `${mastodonUser.id}@${instance}`

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
    .eq('platform', 'mastodon')
    .eq('platform_user_id', platform_user_id)
    .single()

  if (existing) {
    await supabase
      .from('connected_accounts')
      .update({ access_token, account_name, profile_image_url })
      .eq('id', existing.id)
  } else {
    const pendingWorkspaceId = cookieStore.get('pending_workspace_id')?.value ?? null
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'mastodon',
        platform_user_id,
        account_name,
        profile_image_url,
        access_token,
        refresh_token:    null,
        scope:            'read write',
        workspace_id:     pendingWorkspaceId || null,
      })

    if (dbError) {
      console.error('Mastodon DB error:', dbError)
      return NextResponse.redirect(`${appUrl}/accounts?error=mastodon_db_error`)
    }
  }

  cookieStore.delete('mastodon_oauth')
  cookieStore.delete('pending_workspace_id')
  return NextResponse.redirect(`${appUrl}/accounts?success=mastodon_connected`)
}
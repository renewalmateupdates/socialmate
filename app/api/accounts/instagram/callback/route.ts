export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAccountSlot } from '@/lib/account-limits'
import { checkOAuthState, isRepeatOfFreshConnect } from '@/lib/oauth-state'
import { IG_GRAPH, INSTAGRAM_SCOPES, appUrl } from '@/lib/meta'

// Instagram Login callback: code -> short-lived token -> 60-day token -> profile
// -> one connected_accounts row per Instagram professional account.
//
// Row shape (connected_accounts, all existing columns):
//   platform           'instagram'
//   platform_user_id   the professional account id used for publishing (/me user_id)
//   access_token       the long-lived (60 day) Instagram user token
//   expires_at         when that token lapses; lib/publish/instagram.ts refreshes it
//   metadata           { username, account_type, app_scoped_id }
//                      app_scoped_id is the id Meta's deletion callbacks send.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const base  = appUrl()

  if (error || !code) {
    return NextResponse.redirect(`${base}/accounts?error=instagram_denied`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${base}/login?redirect=/accounts`)

  const stateCheck = checkOAuthState(cookieStore.get('instagram_oauth_state')?.value, state)
  if (!stateCheck.ok) {
    // A second hit on the callback (double tap, reload) after a connect that
    // worked is not a failure: show success if the row was just written.
    const { data: latest, error: latestErr } = await getSupabaseAdmin()
      .from('connected_accounts')
      .select('updated_at, created_at')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latestErr) console.warn('[Instagram OAuth] repeat check failed:', latestErr.message)
    if (isRepeatOfFreshConnect(latest?.updated_at ?? latest?.created_at)) {
      return NextResponse.redirect(`${base}/accounts?success=instagram_connected`)
    }
    return NextResponse.redirect(`${base}/accounts?error=instagram_${stateCheck.reason}`)
  }

  const clientId     = process.env.INSTAGRAM_APP_ID
  const clientSecret = process.env.INSTAGRAM_APP_SECRET
  if (!clientId || !clientSecret) {
    console.error('[Instagram OAuth] INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET not set')
    return NextResponse.redirect(`${base}/accounts?error=instagram_not_configured`)
  }

  // 1. Code -> short-lived token (one hour).
  const shortRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'authorization_code',
      redirect_uri:  `${base}/api/accounts/instagram/callback`,
      code,
    }),
  })
  if (!shortRes.ok) {
    console.error('[Instagram OAuth] code exchange failed:', await shortRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const shortBody = await shortRes.json().catch(() => ({}))
  // The response is either flat or wrapped in data[] depending on API version.
  const shortToken: string | undefined = shortBody.access_token ?? shortBody.data?.[0]?.access_token
  if (!shortToken) {
    console.error('[Instagram OAuth] no short-lived token in response')
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }

  // 2. Short-lived -> long-lived (60 days).
  const longParams = new URLSearchParams({
    grant_type:    'ig_exchange_token',
    client_secret: clientSecret,
    access_token:  shortToken,
  })
  const longRes = await fetch(`https://graph.instagram.com/access_token?${longParams.toString()}`)
  if (!longRes.ok) {
    console.error('[Instagram OAuth] long-lived exchange failed:', await longRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const longBody = await longRes.json().catch(() => ({}))
  const accessToken: string | undefined = longBody.access_token
  const expiresIn = Number(longBody.expires_in || 0)
  if (!accessToken) {
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

  // 3. Who is this?
  const meParams = new URLSearchParams({
    fields:       'id,user_id,username,name,profile_picture_url,account_type',
    access_token: accessToken,
  })
  const meRes = await fetch(`${IG_GRAPH}/me?${meParams.toString()}`)
  if (!meRes.ok) {
    console.error('[Instagram OAuth] profile fetch failed:', await meRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const me = await meRes.json().catch(() => ({}))
  const platformUserId = String(me.user_id ?? me.id ?? '')
  if (!platformUserId) {
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const accountType = String(me.account_type ?? '')
  if (accountType && accountType !== 'BUSINESS' && accountType !== 'MEDIA_CREATOR') {
    return NextResponse.redirect(`${base}/accounts?error=instagram_not_professional`)
  }

  const username    = me.username ? String(me.username) : null
  const accountName = username ?? (me.name ? String(me.name) : 'Instagram account')
  const avatarUrl   = me.profile_picture_url ? String(me.profile_picture_url) : null
  const metadata    = {
    username,
    account_type:  accountType || null,
    app_scoped_id: me.id ? String(me.id) : null,
  }

  const db = getSupabaseAdmin()
  const { data: existing, error: existingErr } = await db
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'instagram')
    .eq('platform_user_id', platformUserId)
    .maybeSingle()
  if (existingErr) console.warn('[Instagram OAuth] existing lookup failed:', existingErr.message)

  // Plan cap on accounts per platform. A reconnect of an account already held
  // is a token refresh, not a new slot.
  if (!existing) {
    const slot = await checkAccountSlot(user.id, 'instagram', null, platformUserId)
    if (!slot.allowed) {
      return NextResponse.redirect(
        `${base}/accounts?error=instagram_plan_limit&limit=${slot.limit}&plan=${slot.plan}`,
      )
    }
  }

  if (existing) {
    const { error: updateErr } = await db
      .from('connected_accounts')
      .update({
        access_token:      accessToken,
        expires_at:        expiresAt,
        account_name:      accountName,
        profile_image_url: avatarUrl,
        metadata,
        is_active:         true,
        updated_at:        new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (updateErr) {
      console.error('[Instagram OAuth] update failed:', updateErr)
      return NextResponse.redirect(`${base}/accounts?error=instagram_db_error`)
    }
  } else {
    const { error: insertErr } = await db
      .from('connected_accounts')
      .insert({
        user_id:           user.id,
        platform:          'instagram',
        platform_user_id:  platformUserId,
        account_name:      accountName,
        profile_image_url: avatarUrl,
        access_token:      accessToken,
        refresh_token:     null, // Instagram refreshes the access token itself
        expires_at:        expiresAt,
        scope:             INSTAGRAM_SCOPES.join(','),
        metadata,
      })
    if (insertErr) {
      console.error('[Instagram OAuth] insert failed:', insertErr)
      return NextResponse.redirect(`${base}/accounts?error=instagram_db_error`)
    }
  }

  cookieStore.delete('instagram_oauth_state')
  return NextResponse.redirect(`${base}/accounts?success=instagram_connected`)
}

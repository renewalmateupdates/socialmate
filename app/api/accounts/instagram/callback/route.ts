export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAccountSlot } from '@/lib/account-limits'
import { checkOAuthState, isRepeatOfFreshConnect } from '@/lib/oauth-state'
import { FB_GRAPH, INSTAGRAM_SCOPES, appUrl } from '@/lib/meta'

// Instagram API with Unified Login callback:
//   code -> Business Integration System User token (server to server)
//   -> /me/assigned_instagram_accounts (the Instagram account(s) the login shared)
//   -> one connected_accounts row per Instagram account.
//
// Row shape (connected_accounts, all existing columns):
//   platform           'instagram'
//   platform_user_id   the Instagram account id used for publishing
//   access_token       the system-user token. The configuration sets it to never
//                      expire; it stops working if the person removes SocialMate
//                      from their business portfolio or moves the account.
//   expires_at         only if Meta returns an expiry
//   metadata           { username, auth: 'unified_login', system_user_id }

type IgAccount = {
  id?: string
  username?: string
  name?: string
  profile_picture_url?: string
}

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

  const db = getSupabaseAdmin()

  const stateCheck = checkOAuthState(cookieStore.get('instagram_oauth_state')?.value, state)
  if (!stateCheck.ok) {
    // A second hit on the callback (double tap, reload) after a connect that
    // worked is not a failure: show success if the row was just written.
    const { data: latest, error: latestErr } = await db
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

  const clientId     = process.env.META_APP_ID
  const clientSecret = process.env.META_APP_SECRET
  if (!clientId || !clientSecret) {
    console.error('[Instagram OAuth] META_APP_ID / META_APP_SECRET not set')
    return NextResponse.redirect(`${base}/accounts?error=instagram_not_configured`)
  }

  // 1. Code -> system-user token.
  const tokenRes = await fetch(`${FB_GRAPH}/oauth/access_token?${new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    redirect_uri:  `${base}/api/accounts/instagram/callback`,
    code,
  })}`)
  if (!tokenRes.ok) {
    console.error('[Instagram OAuth] code exchange failed:', await tokenRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const tokenBody = await tokenRes.json().catch(() => ({}))
  const accessToken: string | undefined = tokenBody.access_token
  if (!accessToken) return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  const expiresIn = Number(tokenBody.expires_in || 0)
  const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

  // 2. The system user the token belongs to (kept for deletion requests).
  const meRes = await fetch(`${FB_GRAPH}/me?${new URLSearchParams({ fields: 'id', access_token: accessToken })}`)
  const systemUserId = meRes.ok ? String((await meRes.json().catch(() => ({}))).id ?? '') || null : null

  // 3. The Instagram account(s) the person shared at login.
  const listRes = await fetch(`${FB_GRAPH}/me/assigned_instagram_accounts?${new URLSearchParams({
    fields:       'id,username,name,profile_picture_url',
    limit:        '50',
    access_token: accessToken,
  })}`)
  if (!listRes.ok) {
    console.error('[Instagram OAuth] account list failed:', await listRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=instagram_token_failed`)
  }
  const listed: IgAccount[] = ((await listRes.json().catch(() => ({}))).data ?? []) as IgAccount[]

  // Some API versions return ids only on this edge; fill in the profile per account.
  const accounts: IgAccount[] = []
  for (const acc of listed) {
    if (!acc.id) continue
    if (acc.username) { accounts.push(acc); continue }
    const profRes = await fetch(`${FB_GRAPH}/${acc.id}?${new URLSearchParams({
      fields:       'id,username,name,profile_picture_url',
      access_token: accessToken,
    })}`)
    accounts.push(profRes.ok ? { ...acc, ...(await profRes.json().catch(() => ({}))) } : acc)
  }

  if (accounts.length === 0) {
    return NextResponse.redirect(`${base}/accounts?error=instagram_no_accounts`)
  }

  let saved = 0
  let refusedByPlan: { limit: number; plan: string } | null = null

  for (const acc of accounts) {
    const igId = String(acc.id)
    const { data: existing, error: existingErr } = await db
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .eq('platform_user_id', igId)
      .maybeSingle()
    if (existingErr) console.warn('[Instagram OAuth] existing lookup failed:', existingErr.message)

    const row = {
      account_name:      acc.username || acc.name || 'Instagram account',
      profile_image_url: acc.profile_picture_url ?? null,
      access_token:      accessToken,
      expires_at:        expiresAt,
      metadata:          { username: acc.username ?? null, auth: 'unified_login', system_user_id: systemUserId },
    }

    if (existing) {
      const { error: updateErr } = await db
        .from('connected_accounts')
        .update({ ...row, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (updateErr) console.error('[Instagram OAuth] update failed:', updateErr)
      else saved++
      continue
    }

    // Plan cap on accounts per platform. A reconnect is a token refresh, not a new slot.
    const slot = await checkAccountSlot(user.id, 'instagram', null, igId)
    if (!slot.allowed) {
      refusedByPlan = { limit: slot.limit, plan: slot.plan }
      continue
    }

    const { error: insertErr } = await db
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'instagram',
        platform_user_id: igId,
        refresh_token:    null,
        scope:            INSTAGRAM_SCOPES.join(','),
        ...row,
      })
    if (insertErr) console.error('[Instagram OAuth] insert failed:', insertErr)
    else saved++
  }

  cookieStore.delete('instagram_oauth_state')

  if (saved === 0 && refusedByPlan) {
    return NextResponse.redirect(
      `${base}/accounts?error=instagram_plan_limit&limit=${refusedByPlan.limit}&plan=${refusedByPlan.plan}`,
    )
  }
  if (saved === 0) return NextResponse.redirect(`${base}/accounts?error=instagram_db_error`)
  return NextResponse.redirect(`${base}/accounts?success=instagram_connected`)
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkReconnect, markConnected } from '@/lib/platform-jail'
import { checkAccountSlot } from '@/lib/account-limits'
import { checkOAuthState, isRepeatOfFreshConnect } from '@/lib/oauth-state'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL!
  const clientKey    = process.env.TIKTOK_CLIENT_KEY!
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/accounts?error=tiktok_denied`)
  }

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

  const stateCheck = checkOAuthState(cookieStore.get('tiktok_oauth_state')?.value, state)
  if (!stateCheck.ok) {
    // Most of these were a second hit on this callback seconds after a connect
    // that worked (lib/oauth-state.ts). If this person's TikTok row was just
    // written, show them the success they missed. Nothing is linked here.
    const { data: { user: maybeUser } } = await supabase.auth.getUser()
    if (maybeUser) {
      const { data: latest, error: latestErr } = await getSupabaseAdmin()
        .from('connected_accounts')
        .select('updated_at')
        .eq('user_id', maybeUser.id)
        .eq('platform', 'tiktok')
        .order('updated_at', { ascending: false })
        .limit(1)
      if (latestErr) console.warn('[TikTok OAuth] recent-connect lookup failed:', latestErr.message)
      if (isRepeatOfFreshConnect(latest?.[0]?.updated_at)) {
        return NextResponse.redirect(`${appUrl}/accounts?success=tiktok_connected`)
      }
    }
    return NextResponse.redirect(`${appUrl}/accounts?error=tiktok_${stateCheck.reason}`)
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

  // Fetch TikTok user info.
  //
  // Only ask for fields `user.info.basic` actually grants. `username` belongs to
  // `user.info.profile`, which this app has never held, and TikTok rejects the
  // *entire* request with 400 when any single requested field is out of scope.
  // That is why every TikTok row in production is named the literal placeholder
  // "TikTok Account": the call has failed for every user since launch, and the
  // failure looked exactly like a user with no display name.
  const BASIC_FIELDS = 'open_id,union_id,avatar_url,display_name'
  const userRes = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=${BASIC_FIELDS}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  let displayName    = 'TikTok Account'
  let avatarUrl: string | null = null

  if (userRes.ok) {
    const userData = await userRes.json()
    displayName = userData?.data?.user?.display_name || 'TikTok Account'
    avatarUrl   = userData?.data?.user?.avatar_url   || null
  } else {
    // Keep the reason visible. If TikTok ever changes what basic grants, this
    // silently reverts to unnamed accounts and nothing else would say so.
    const detail = await userRes.text().catch(() => '')
    console.warn(`[TikTok OAuth] user/info failed (${userRes.status}):`, detail.slice(0, 300))
  }

  const account_name = displayName

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  const platformUserId = open_id as string

  // One owner per TikTok account, and a 45-day pause before a different
  // SocialMate user can pick it up. Reconnecting your own is always allowed.
  const verdict = await checkReconnect('tiktok', platformUserId, user.id)
  if (!verdict.allowed) {
    cookieStore.delete('tiktok_oauth_state')
    return NextResponse.redirect(
      verdict.reason === 'already_connected'
        ? `${appUrl}/accounts?error=tiktok_already_connected`
        : `${appUrl}/accounts?error=tiktok_in_cooldown&until=${encodeURIComponent(verdict.until)}`
    )
  }

  // Upsert connected_account
  const { data: existing } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .eq('platform_user_id', platformUserId)
    .maybeSingle()

  // Plan cap. Reconnects of an account already held pass through; only a NEW
  // open_id consumes a slot. This callback in particular never had a cap and
  // never returned the user to /accounts, so the page's own client-side check
  // never saw the connection either — which is how a free workspace ended up
  // with two TikTok accounts.
  if (!existing) {
    const slot = await checkAccountSlot(user.id, 'tiktok', null, platformUserId)
    if (!slot.allowed) {
      cookieStore.delete('tiktok_oauth_state')
      return NextResponse.redirect(
        `${appUrl}/accounts?error=tiktok_plan_limit&limit=${slot.limit}&plan=${slot.plan}`
      )
    }
  }

  if (existing) {
    await getSupabaseAdmin()
      .from('connected_accounts')
      // updated_at is set explicitly: it is what tells a repeat hit on this
      // callback from a real failure (see the state check above).
      .update({ access_token, refresh_token, expires_at, account_name, profile_image_url: avatarUrl, updated_at: new Date().toISOString() })
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

  await markConnected('tiktok', platformUserId, user.id)

  cookieStore.delete('tiktok_oauth_state')

  // Land on /accounts, not straight into the studio. Every other callback
  // returns here with ?success=<platform>_connected, and app/accounts/page.tsx
  // is the one place connect outcomes are recorded for /admin/funnel. Skipping
  // it meant TikTok connects — successes and failures both — were invisible in
  // the funnel that exists to explain why 62 of 74 accounts never connect
  // anything. That page records the connect, then forwards TikTok on to the
  // studio by itself.
  return NextResponse.redirect(`${appUrl}/accounts?success=tiktok_connected`)
}

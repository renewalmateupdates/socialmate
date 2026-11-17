export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAccountSlot } from '@/lib/account-limits'
import { checkOAuthState, isRepeatOfFreshConnect } from '@/lib/oauth-state'
import { THREADS_GRAPH, THREADS_SCOPES, appUrl } from '@/lib/meta'

// Threads callback: code -> short-lived token (1 hour) -> long-lived (60 days)
// -> profile -> one connected_accounts row.
//
// Row shape (connected_accounts, all existing columns):
//   platform           'threads'
//   platform_user_id   the Threads user id (also the id Meta's deletion callbacks send)
//   access_token       the long-lived token; lib/publish/threads.ts refreshes it
//   expires_at         when that token lapses
//   metadata           { username }
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const base  = appUrl()

  if (error || !code) {
    return NextResponse.redirect(`${base}/accounts?error=threads_denied`)
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

  const stateCheck = checkOAuthState(cookieStore.get('threads_oauth_state')?.value, state)
  if (!stateCheck.ok) {
    const { data: latest, error: latestErr } = await db
      .from('connected_accounts')
      .select('updated_at, created_at')
      .eq('user_id', user.id)
      .eq('platform', 'threads')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latestErr) console.warn('[Threads OAuth] repeat check failed:', latestErr.message)
    if (isRepeatOfFreshConnect(latest?.updated_at ?? latest?.created_at)) {
      return NextResponse.redirect(`${base}/accounts?success=threads_connected`)
    }
    return NextResponse.redirect(`${base}/accounts?error=threads_${stateCheck.reason}`)
  }

  const clientId     = process.env.THREADS_APP_ID
  const clientSecret = process.env.THREADS_APP_SECRET
  if (!clientId || !clientSecret) {
    console.error('[Threads OAuth] THREADS_APP_ID / THREADS_APP_SECRET not set')
    return NextResponse.redirect(`${base}/accounts?error=threads_not_configured`)
  }

  // 1. Code -> short-lived token.
  const shortRes = await fetch('https://graph.threads.net/oauth/access_token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'authorization_code',
      redirect_uri:  `${base}/api/accounts/threads/callback`,
      code,
    }),
  })
  if (!shortRes.ok) {
    console.error('[Threads OAuth] code exchange failed:', await shortRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=threads_token_failed`)
  }
  const shortToken: string | undefined = (await shortRes.json().catch(() => ({}))).access_token
  if (!shortToken) return NextResponse.redirect(`${base}/accounts?error=threads_token_failed`)

  // 2. Short-lived -> long-lived (60 days).
  const longRes = await fetch(`https://graph.threads.net/access_token?${new URLSearchParams({
    grant_type:    'th_exchange_token',
    client_secret: clientSecret,
    access_token:  shortToken,
  })}`)
  if (!longRes.ok) {
    console.error('[Threads OAuth] long-lived exchange failed:', await longRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=threads_token_failed`)
  }
  const longBody = await longRes.json().catch(() => ({}))
  const accessToken: string | undefined = longBody.access_token
  if (!accessToken) return NextResponse.redirect(`${base}/accounts?error=threads_token_failed`)
  const expiresIn = Number(longBody.expires_in || 0)
  const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

  // 3. Who is this?
  const meRes = await fetch(`${THREADS_GRAPH}/me?${new URLSearchParams({
    fields:       'id,username,name,threads_profile_picture_url',
    access_token: accessToken,
  })}`)
  if (!meRes.ok) {
    console.error('[Threads OAuth] profile fetch failed:', await meRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=threads_token_failed`)
  }
  const me = await meRes.json().catch(() => ({}))
  const platformUserId = me.id ? String(me.id) : ''
  if (!platformUserId) return NextResponse.redirect(`${base}/accounts?error=threads_token_failed`)

  const username    = me.username ? String(me.username) : null
  const accountName = username ?? (me.name ? String(me.name) : 'Threads account')
  const avatarUrl   = me.threads_profile_picture_url ? String(me.threads_profile_picture_url) : null

  const { data: existing, error: existingErr } = await db
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'threads')
    .eq('platform_user_id', platformUserId)
    .maybeSingle()
  if (existingErr) console.warn('[Threads OAuth] existing lookup failed:', existingErr.message)

  if (!existing) {
    const slot = await checkAccountSlot(user.id, 'threads', null, platformUserId)
    if (!slot.allowed) {
      return NextResponse.redirect(
        `${base}/accounts?error=threads_plan_limit&limit=${slot.limit}&plan=${slot.plan}`,
      )
    }
  }

  const row = {
    account_name:      accountName,
    profile_image_url: avatarUrl,
    access_token:      accessToken,
    expires_at:        expiresAt,
    metadata:          { username },
  }

  if (existing) {
    const { error: updateErr } = await db
      .from('connected_accounts')
      .update({ ...row, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (updateErr) {
      console.error('[Threads OAuth] update failed:', updateErr)
      return NextResponse.redirect(`${base}/accounts?error=threads_db_error`)
    }
  } else {
    const { error: insertErr } = await db
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'threads',
        platform_user_id: platformUserId,
        refresh_token:    null, // Threads refreshes the access token itself
        scope:            THREADS_SCOPES.join(','),
        ...row,
      })
    if (insertErr) {
      console.error('[Threads OAuth] insert failed:', insertErr)
      return NextResponse.redirect(`${base}/accounts?error=threads_db_error`)
    }
  }

  cookieStore.delete('threads_oauth_state')
  return NextResponse.redirect(`${base}/accounts?success=threads_connected`)
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAccountSlot } from '@/lib/account-limits'
import { checkOAuthState, isRepeatOfFreshConnect } from '@/lib/oauth-state'
import { FB_GRAPH, FACEBOOK_SCOPES, appUrl } from '@/lib/meta'

// Facebook Login callback. One login can hand back several Pages; each Page the
// person can post to becomes its own connected_accounts row, as far as their
// plan's per-platform cap allows.
//
// Row shape (connected_accounts, all existing columns):
//   platform           'facebook'
//   platform_user_id   the Page id
//   access_token       the Page access token. Derived from a long-lived user
//                      token, so it does not expire on a timer (it stops working
//                      if the person removes the app or loses the Page role).
//   expires_at         null
//   metadata           { fb_user_id, category }
//                      fb_user_id is the id Meta's deletion callbacks send.

type FbPage = {
  id: string
  name?: string
  access_token?: string
  category?: string
  tasks?: string[]
  picture?: { data?: { url?: string } }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const base  = appUrl()

  if (error || !code) {
    return NextResponse.redirect(`${base}/accounts?error=facebook_denied`)
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

  const stateCheck = checkOAuthState(cookieStore.get('facebook_oauth_state')?.value, state)
  if (!stateCheck.ok) {
    const { data: latest, error: latestErr } = await db
      .from('connected_accounts')
      .select('updated_at, created_at')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latestErr) console.warn('[Facebook OAuth] repeat check failed:', latestErr.message)
    if (isRepeatOfFreshConnect(latest?.updated_at ?? latest?.created_at)) {
      return NextResponse.redirect(`${base}/accounts?success=facebook_connected`)
    }
    return NextResponse.redirect(`${base}/accounts?error=facebook_${stateCheck.reason}`)
  }

  const clientId     = process.env.META_APP_ID
  const clientSecret = process.env.META_APP_SECRET
  if (!clientId || !clientSecret) {
    console.error('[Facebook OAuth] META_APP_ID / META_APP_SECRET not set')
    return NextResponse.redirect(`${base}/accounts?error=facebook_not_configured`)
  }

  // 1. Code -> short-lived user token.
  const tokenParams = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    redirect_uri:  `${base}/api/accounts/facebook/callback`,
    code,
  })
  const tokenRes = await fetch(`${FB_GRAPH}/oauth/access_token?${tokenParams.toString()}`)
  if (!tokenRes.ok) {
    console.error('[Facebook OAuth] code exchange failed:', await tokenRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=facebook_token_failed`)
  }
  const shortToken: string | undefined = (await tokenRes.json().catch(() => ({}))).access_token
  if (!shortToken) return NextResponse.redirect(`${base}/accounts?error=facebook_token_failed`)

  // 2. Short-lived -> long-lived user token, so the Page tokens below don't expire.
  const longParams = new URLSearchParams({
    grant_type:        'fb_exchange_token',
    client_id:         clientId,
    client_secret:     clientSecret,
    fb_exchange_token: shortToken,
  })
  const longRes = await fetch(`${FB_GRAPH}/oauth/access_token?${longParams.toString()}`)
  const userToken: string = longRes.ok
    ? ((await longRes.json().catch(() => ({}))).access_token ?? shortToken)
    : shortToken
  if (!longRes.ok) console.warn('[Facebook OAuth] long-lived exchange failed:', await longRes.text().catch(() => ''))

  // 3. Who logged in (the app-scoped id Meta's deletion callbacks refer to).
  const meRes = await fetch(`${FB_GRAPH}/me?${new URLSearchParams({ fields: 'id,name', access_token: userToken })}`)
  const me = meRes.ok ? await meRes.json().catch(() => ({})) : {}
  const fbUserId = me.id ? String(me.id) : null

  // 4. The Pages they manage, each with its own Page token.
  const pagesRes = await fetch(`${FB_GRAPH}/me/accounts?${new URLSearchParams({
    fields:       'id,name,access_token,category,tasks,picture{url}',
    limit:        '100',
    access_token: userToken,
  })}`)
  if (!pagesRes.ok) {
    console.error('[Facebook OAuth] pages fetch failed:', await pagesRes.text().catch(() => ''))
    return NextResponse.redirect(`${base}/accounts?error=facebook_token_failed`)
  }
  const pages: FbPage[] = ((await pagesRes.json().catch(() => ({}))).data ?? []) as FbPage[]
  // Only Pages this person may publish to. `tasks` is absent for some Page types;
  // those are kept and the publisher reports a refusal if there is one.
  const postable = pages.filter(p =>
    p.id && p.access_token && (!p.tasks || p.tasks.includes('CREATE_CONTENT') || p.tasks.includes('MANAGE')),
  )
  if (postable.length === 0) {
    return NextResponse.redirect(`${base}/accounts?error=facebook_no_pages`)
  }

  let saved = 0
  let refusedByPlan: { limit: number; plan: string } | null = null

  for (const page of postable) {
    const { data: existing, error: existingErr } = await db
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .eq('platform_user_id', page.id)
      .maybeSingle()
    if (existingErr) console.warn('[Facebook OAuth] existing lookup failed:', existingErr.message)

    const row = {
      account_name:      page.name || 'Facebook Page',
      profile_image_url: page.picture?.data?.url ?? null,
      access_token:      page.access_token!,
      expires_at:        null,
      metadata:          { fb_user_id: fbUserId, category: page.category ?? null },
    }

    if (existing) {
      const { error: updateErr } = await db
        .from('connected_accounts')
        .update({ ...row, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (updateErr) console.error('[Facebook OAuth] update failed:', updateErr)
      else saved++
      continue
    }

    const slot = await checkAccountSlot(user.id, 'facebook', null, page.id)
    if (!slot.allowed) {
      refusedByPlan = { limit: slot.limit, plan: slot.plan }
      continue
    }

    const { error: insertErr } = await db
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'facebook',
        platform_user_id: page.id,
        refresh_token:    null,
        scope:            FACEBOOK_SCOPES.join(','),
        ...row,
      })
    if (insertErr) console.error('[Facebook OAuth] insert failed:', insertErr)
    else saved++
  }

  cookieStore.delete('facebook_oauth_state')

  if (saved === 0 && refusedByPlan) {
    return NextResponse.redirect(
      `${base}/accounts?error=facebook_plan_limit&limit=${refusedByPlan.limit}&plan=${refusedByPlan.plan}`,
    )
  }
  if (saved === 0) {
    return NextResponse.redirect(`${base}/accounts?error=facebook_db_error`)
  }
  return NextResponse.redirect(`${base}/accounts?success=facebook_connected`)
}

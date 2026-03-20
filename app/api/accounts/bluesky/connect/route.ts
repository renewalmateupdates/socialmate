export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { handle, appPassword } = body

  if (!handle || !appPassword) {
    return NextResponse.json({ error: 'Handle and app password are required' }, { status: 400 })
  }

  const normalizedHandle = handle.startsWith('@') ? handle.slice(1) : handle

  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: normalizedHandle,
      password: appPassword,
    }),
  })

  if (!sessionRes.ok) {
    const err = await sessionRes.json().catch(() => ({}))
    const message = err.message || 'Invalid handle or app password'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const session = await sessionRes.json()
  const { accessJwt, refreshJwt, did, handle: resolvedHandle } = session

  const profileRes = await fetch(
    `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${did}`,
    { headers: { Authorization: `Bearer ${accessJwt}` } }
  )

  let account_name = resolvedHandle
  let profile_image_url: string | null = null

  if (profileRes.ok) {
    const profile = await profileRes.json()
    account_name = profile.displayName || resolvedHandle
    profile_image_url = profile.avatar || null
  }

  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'bluesky')
    .eq('platform_user_id', did)
    .single()

  if (existing) {
    await supabase
      .from('connected_accounts')
      .update({
        access_token: accessJwt,
        refresh_token: refreshJwt,
        account_name,
        profile_image_url,
      })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user.id,
        platform: 'bluesky',
        platform_user_id: did,
        account_name,
        profile_image_url,
        access_token: accessJwt,
        refresh_token: refreshJwt,
        scope: 'atproto',
      })

    if (dbError) {
      console.error('Bluesky DB error:', dbError)
      return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, handle: resolvedHandle, displayName: account_name })
}
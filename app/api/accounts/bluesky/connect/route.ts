export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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
  const { handle, appPassword, workspaceId } = body

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

  // --- Platform Jail: check if this Bluesky DID is in cooldown ---
  const { data: registryRecord } = await getSupabaseAdmin()
    .from('platform_account_registry')
    .select('id, status, connected_to_user, cooling_until')
    .eq('platform', 'bluesky')
    .eq('platform_account_id', did)
    .maybeSingle()

  if (registryRecord) {
    if (registryRecord.status === 'active' && registryRecord.connected_to_user !== user.id) {
      return NextResponse.json({ error: 'This Bluesky account is already connected to another SocialMate account.' }, { status: 409 })
    }
    if (registryRecord.status === 'cooling' && registryRecord.cooling_until) {
      const coolingUntil = new Date(registryRecord.cooling_until)
      if (coolingUntil > new Date()) {
        const until = coolingUntil.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return NextResponse.json({
          error: `This account was recently disconnected. You can reconnect it on ${until}. This protects against abuse.`,
          cooldown_until: registryRecord.cooling_until,
        }, { status: 429 })
      }
    }
  }
  // ----------------------------------------------------------------

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

  // Check for existing account in THIS workspace (or personal if no workspaceId)
  let existingQuery = supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'bluesky')
    .eq('platform_user_id', did)

  if (workspaceId) {
    existingQuery = existingQuery.eq('workspace_id', workspaceId) as typeof existingQuery
  } else {
    existingQuery = existingQuery.is('workspace_id', null) as typeof existingQuery
  }

  const { data: existing } = await existingQuery.single()

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
        user_id:          user.id,
        platform:         'bluesky',
        platform_user_id: did,
        account_name,
        profile_image_url,
        access_token:     accessJwt,
        refresh_token:    refreshJwt,
        scope:            'atproto',
        workspace_id:     workspaceId ?? null,
      })

    if (dbError) {
      console.error('Bluesky DB error:', dbError)
      return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
    }
  }

  // Register in jail registry (upsert — marks as active, owned by this user)
  await getSupabaseAdmin()
    .from('platform_account_registry')
    .upsert(
      {
        platform: 'bluesky',
        platform_account_id: did,
        connected_to_user: user.id,
        status: 'active',
        disconnected_at: null,
        cooling_until: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'platform,platform_account_id' }
    )

  return NextResponse.json({ success: true, handle: resolvedHandle, displayName: account_name })
}
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
  const { botToken, workspaceId } = body

  if (!botToken) {
    return NextResponse.json({ error: 'Bot token is required' }, { status: 400 })
  }

  // Verify token against Telegram API
  const verifyRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)

  if (!verifyRes.ok) {
    return NextResponse.json({ error: 'Invalid bot token. Check it and try again.' }, { status: 400 })
  }

  const { ok, result } = await verifyRes.json()

  if (!ok || !result) {
    return NextResponse.json({ error: 'Invalid bot token. Check it and try again.' }, { status: 400 })
  }

  const { id, username, first_name } = result
  const account_name = username || first_name || 'Telegram Bot'
  const platform_user_id = String(id)

  // Check for existing account in THIS workspace (or personal if no workspaceId)
  let existingQuery = supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'telegram')
    .eq('platform_user_id', platform_user_id)

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
        access_token: botToken,
        account_name,
      })
      .eq('id', existing.id)
  } else {
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id:          user.id,
        platform:         'telegram',
        platform_user_id,
        account_name,
        profile_image_url: null,
        access_token:     botToken,
        refresh_token:    null,
        scope:            'bot',
        workspace_id:     workspaceId ?? null,
      })

    if (dbError) {
      console.error('Telegram DB error:', dbError)
      return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, username: account_name })
}
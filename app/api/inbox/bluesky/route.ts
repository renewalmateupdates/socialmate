import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, refresh_token, platform_user_id')
    .eq('user_id', user.id)
    .eq('platform', 'bluesky')
    .single()

  if (!account) return NextResponse.json({ messages: [] })

  try {
    let accessJwt = account.access_token
    const refreshRes = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.refresh_token}` },
    })
    if (refreshRes.ok) {
      const session = await refreshRes.json()
      accessJwt = session.accessJwt
      await supabaseAdmin
        .from('connected_accounts')
        .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
        .eq('user_id', user.id)
        .eq('platform', 'bluesky')
    }

    const notifRes = await fetch(
      'https://bsky.social/xrpc/app.bsky.notification.listNotifications?limit=30',
      { headers: { Authorization: `Bearer ${accessJwt}` } }
    )

    if (!notifRes.ok) return NextResponse.json({ messages: [] })

    const { notifications } = await notifRes.json()

    const messages = (notifications || [])
      .filter((n: any) => ['mention', 'reply', 'quote'].includes(n.reason))
      .map((n: any) => ({
        id:          n.uri,
        platform:    'bluesky',
        type:        n.reason === 'mention' ? 'mention' : 'reply',
        author:      n.author?.handle ? `@${n.author.handle}` : 'Unknown',
        content:     n.record?.text || '',
        post_url:    n.uri
          ? `https://bsky.app/profile/${n.author?.handle}/post/${n.uri.split('/').pop()}`
          : undefined,
        received_at: n.indexedAt,
        read:        n.isRead,
      }))

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('Bluesky inbox error:', err)
    return NextResponse.json({ messages: [] })
  }
}
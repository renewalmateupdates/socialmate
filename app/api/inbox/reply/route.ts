export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

type ReplyBody = {
  platform: 'bluesky' | 'mastodon'
  reply_text: string
  // Bluesky threading refs
  parent_uri?: string
  parent_cid?: string
  root_uri?: string
  root_cid?: string
  // Mastodon
  in_reply_to_id?: string
  instance?: string
}

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) =>
          s.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: ReplyBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { platform, reply_text } = body
  if (!platform || !reply_text?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields: platform, reply_text' },
      { status: 400 }
    )
  }
  if (!['bluesky', 'mastodon'].includes(platform)) {
    return NextResponse.json(
      { error: 'Unsupported platform. Only bluesky and mastodon support replies.' },
      { status: 400 }
    )
  }

  // ── Fetch connected account ──────────────────────────────────────────────────
  const { data: account, error: accountError } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token, refresh_token, platform_user_id, instance_url')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (accountError || !account) {
    return NextResponse.json(
      { error: `No ${platform} account connected.` },
      { status: 400 }
    )
  }

  // ── Bluesky reply ────────────────────────────────────────────────────────────
  if (platform === 'bluesky') {
    const { parent_uri, parent_cid, root_uri, root_cid } = body

    if (!parent_uri || !parent_cid) {
      return NextResponse.json(
        { error: 'Bluesky replies require parent_uri and parent_cid' },
        { status: 400 }
      )
    }

    // Refresh session
    let accessJwt = account.access_token
    let did = account.platform_user_id

    try {
      const refreshRes = await fetch(
        'https://bsky.social/xrpc/com.atproto.server.refreshSession',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${account.refresh_token}` },
        }
      )
      if (refreshRes.ok) {
        const session = await refreshRes.json()
        accessJwt = session.accessJwt
        did = session.did
        // Persist refreshed tokens
        await getSupabaseAdmin()
          .from('connected_accounts')
          .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
          .eq('user_id', user.id)
          .eq('platform', 'bluesky')
      } else if (refreshRes.status === 401) {
        return NextResponse.json(
          { error: 'Bluesky session expired. Please reconnect your Bluesky account.' },
          { status: 401 }
        )
      }
    } catch {
      // Fall through and attempt with existing token
    }

    // Build reply record — root falls back to parent if not provided (top-level reply)
    const effectiveRoot = root_uri && root_cid
      ? { uri: root_uri, cid: root_cid }
      : { uri: parent_uri, cid: parent_cid }

    const postRes = await fetch(
      'https://bsky.social/xrpc/com.atproto.repo.createRecord',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: did,
          collection: 'app.bsky.feed.post',
          record: {
            $type: 'app.bsky.feed.post',
            text: reply_text,
            reply: {
              root: effectiveRoot,
              parent: { uri: parent_uri, cid: parent_cid },
            },
            createdAt: new Date().toISOString(),
          },
        }),
      }
    )

    if (!postRes.ok) {
      const errBody = await postRes.json().catch(() => ({}))
      const detail = errBody.message || errBody.error || `HTTP ${postRes.status}`
      if (postRes.status === 401) {
        return NextResponse.json(
          { error: 'Bluesky authentication failed. Please reconnect your account.' },
          { status: 401 }
        )
      }
      if (postRes.status === 429) {
        return NextResponse.json(
          { error: 'Bluesky rate limit hit. Please wait a few minutes and try again.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: `Bluesky reply failed: ${detail}` },
        { status: 500 }
      )
    }

    const post = await postRes.json()
    return NextResponse.json({ success: true, uri: post.uri })
  }

  // ── Mastodon reply ───────────────────────────────────────────────────────────
  if (platform === 'mastodon') {
    const { in_reply_to_id } = body

    if (!in_reply_to_id) {
      return NextResponse.json(
        { error: 'Mastodon replies require in_reply_to_id' },
        { status: 400 }
      )
    }

    // Derive instance from platform_user_id ("userid@instance.tld") or instance_url column
    let instanceHost =
      account.instance_url ||
      ''

    if (!instanceHost && account.platform_user_id?.includes('@')) {
      const parts = account.platform_user_id.split('@')
      instanceHost = `https://${parts[parts.length - 1]}`
    }
    if (!instanceHost) instanceHost = 'https://mastodon.social'

    const base = instanceHost.replace(/\/$/, '')

    const statusRes = await fetch(`${base}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: reply_text,
        in_reply_to_id,
        visibility: 'public',
      }),
    })

    if (!statusRes.ok) {
      const errBody = await statusRes.json().catch(() => ({}))
      const detail = errBody.error || `HTTP ${statusRes.status}`
      if (statusRes.status === 401) {
        return NextResponse.json(
          { error: 'Mastodon token expired. Please reconnect your account.' },
          { status: 401 }
        )
      }
      if (statusRes.status === 429) {
        return NextResponse.json(
          { error: 'Mastodon rate limit hit. Please wait a few minutes and try again.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: `Mastodon reply failed: ${detail}` },
        { status: 500 }
      )
    }

    const status = await statusRes.json()
    return NextResponse.json({ success: true, id: status.id, url: status.url })
  }

  // Should be unreachable
  return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
}

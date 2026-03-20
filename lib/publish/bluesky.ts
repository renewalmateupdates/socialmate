import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_BLUESKY_LENGTH = 300

export async function publishToBluesky(userId: string, content: string): Promise<string> {
  const { data: account, error: accountError } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token, refresh_token, platform_user_id, account_name')
    .eq('user_id', userId)
    .eq('platform', 'bluesky')
    .single()

  if (accountError || !account) {
    throw new Error('No Bluesky account connected. Go to Accounts to connect your Bluesky account.')
  }

  if (!account.refresh_token) {
    throw new Error('Bluesky session expired. Please reconnect your account in Accounts → Bluesky.')
  }

  // Enforce character limit
  if (content.length > MAX_BLUESKY_LENGTH) {
    throw new Error(`Post exceeds Bluesky's ${MAX_BLUESKY_LENGTH} character limit (${content.length} chars). Please shorten your post.`)
  }

  // Refresh session to get a fresh access token
  let accessJwt = account.access_token
  let did = account.platform_user_id

  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.refresh_token}`,
      'Content-Type': 'application/json',
    },
  })

  if (sessionRes.ok) {
    const session = await sessionRes.json()
    accessJwt = session.accessJwt
    did = session.did

    // Persist refreshed tokens
    await getSupabaseAdmin()
      .from('connected_accounts')
      .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
      .eq('user_id', userId)
      .eq('platform', 'bluesky')
  } else {
    // Token refresh failed — try with existing token, log warning
    const errBody = await sessionRes.json().catch(() => ({}))
    console.warn('[Bluesky] Token refresh failed, using existing token:', errBody)

    if (sessionRes.status === 401) {
      throw new Error('Bluesky session expired and could not be refreshed. Please reconnect your Bluesky account.')
    }
  }

  // Create the post
  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record: {
        $type:     'app.bsky.feed.post',
        text:      content,
        createdAt: new Date().toISOString(),
      },
    }),
  })

  if (!postRes.ok) {
    const errBody = await postRes.json().catch(() => ({}))
    const detail  = errBody.message || errBody.error || `HTTP ${postRes.status}`
    console.error('[Bluesky] Post creation failed:', errBody)

    if (postRes.status === 401) {
      throw new Error('Bluesky authentication failed. Please reconnect your account in Accounts → Bluesky.')
    }
    if (postRes.status === 429) {
      throw new Error('Bluesky rate limit hit. Please wait a few minutes and try again.')
    }
    throw new Error(`Bluesky post failed: ${detail}`)
  }

  const post = await postRes.json()

  // Derive public URL from AT URI  (at://did:xxx/app.bsky.feed.post/rkey → https://bsky.app/profile/handle/post/rkey)
  const rkey = post.uri?.split('/').pop()
  const handle = account.account_name || did
  if (rkey && handle) {
    console.log(`[Bluesky] Published: https://bsky.app/profile/${handle}/post/${rkey}`)
  }

  return post.uri
}

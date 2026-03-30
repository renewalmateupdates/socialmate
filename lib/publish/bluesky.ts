import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_BLUESKY_LENGTH = 300

export async function publishToBluesky(
  userId:     string,
  content:    string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[]
): Promise<string> {
  // If a specific account ID was selected, query by it directly
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, platform_user_id, account_name')
    .eq('user_id', userId)
    .eq('platform', 'bluesky')

  if (accountId) {
    query = query.eq('id', accountId)
  } else if (workspaceId) {
    query = query.eq('workspace_id', workspaceId)
  } else {
    query = query.is('workspace_id', null)
  }

  const { data: account, error: accountError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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

    await getSupabaseAdmin()
      .from('connected_accounts')
      .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
      .eq('id', account.id)
  } else {
    const errBody = await sessionRes.json().catch(() => ({}))
    console.warn('[Bluesky] Token refresh failed, using existing token:', errBody)

    if (sessionRes.status === 401) {
      throw new Error('Bluesky session expired and could not be refreshed. Please reconnect your Bluesky account.')
    }
  }

  // Upload images to Bluesky blob store (max 4 images, 1MB each)
  // Note: Bluesky video upload uses a separate async service — images only for now
  let embed: Record<string, unknown> | undefined

  if (mediaUrls && mediaUrls.length > 0) {
    const imageUrls = mediaUrls.filter(u => !u.match(/\.(mp4|mov|avi|webm)/i))
    if (imageUrls.length > 0) {
      const imageBlobs: Array<{ alt: string; image: unknown }> = []

      for (const url of imageUrls.slice(0, 4)) {
        try {
          const mediaRes  = await fetch(url)
          const buffer    = await mediaRes.arrayBuffer()
          const cType     = mediaRes.headers.get('content-type') || 'image/jpeg'

          const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
            method:  'POST',
            headers: {
              Authorization:  `Bearer ${accessJwt}`,
              'Content-Type': cType,
            },
            body: Buffer.from(buffer),
          })

          if (blobRes.ok) {
            const blobData = await blobRes.json()
            if (blobData.blob) {
              imageBlobs.push({ alt: '', image: blobData.blob })
            }
          } else {
            console.warn('[Bluesky] Blob upload failed for', url, await blobRes.text())
          }
        } catch (err) {
          console.warn('[Bluesky] Failed to fetch/upload media:', err)
        }
      }

      if (imageBlobs.length > 0) {
        embed = { $type: 'app.bsky.embed.images', images: imageBlobs }
      }
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
      repo:       did,
      collection: 'app.bsky.feed.post',
      record: {
        $type:     'app.bsky.feed.post',
        text:      content,
        createdAt: new Date().toISOString(),
        ...(embed ? { embed } : {}),
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

  const rkey   = post.uri?.split('/').pop()
  const handle = account.account_name || did
  if (rkey && handle) {
    console.log(`[Bluesky] Published: https://bsky.app/profile/${handle}/post/${rkey}`)
  }

  return post.uri
}

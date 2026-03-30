import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_MASTODON_LENGTH = 500

export async function publishToMastodon(
  userId:       string,
  content:      string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[]
): Promise<string> {
  // Enforce 500 character limit (Mastodon default; some instances allow more)
  if (content.length > MAX_MASTODON_LENGTH) {
    throw new Error(`Post exceeds Mastodon's ${MAX_MASTODON_LENGTH} character limit (${content.length} chars). Please shorten your post.`)
  }

  // Build workspace-scoped query — personal accounts have workspace_id = null
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'mastodon')

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
    throw new Error('No Mastodon account connected. Go to Accounts to connect your Mastodon account.')
  }

  // platform_user_id is stored as "userId@instance"
  const parts    = account.platform_user_id.split('@')
  const instance = parts.slice(1).join('@')

  if (!instance) {
    throw new Error('Could not determine Mastodon instance. Please reconnect your account.')
  }

  // Upload media attachments first if present
  const mediaIds: string[] = []

  if (mediaUrls && mediaUrls.length > 0) {
    for (const url of mediaUrls.slice(0, 4)) {
      try {
        const mediaFetch  = await fetch(url)
        const buffer      = await mediaFetch.arrayBuffer()
        const contentType = mediaFetch.headers.get('content-type') || 'image/jpeg'
        const ext         = contentType.split('/')[1]?.split(';')[0] || 'jpg'

        const form = new FormData()
        form.append('file', new Blob([buffer], { type: contentType }), `media.${ext}`)

        const uploadRes = await fetch(`https://${instance}/api/v2/media`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${account.access_token}` },
          body:    form,
        })

        if (uploadRes.ok) {
          const mediaData = await uploadRes.json()
          if (mediaData.id) {
            mediaIds.push(mediaData.id)
            // If async processing (206), wait briefly for it to finish
            if (uploadRes.status === 206) {
              await new Promise(r => setTimeout(r, 1500))
            }
          }
        } else {
          console.warn(`[Mastodon] Media upload failed: ${uploadRes.status}`, await uploadRes.text())
        }
      } catch (err) {
        console.warn('[Mastodon] Failed to upload media:', err)
      }
    }
  }

  const res = await fetch(`https://${instance}/api/v1/statuses`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status:     content,
      visibility: 'public',
      ...(mediaIds.length > 0 ? { media_ids: mediaIds } : {}),
    }),
  })

  if (!res.ok) {
    const err    = await res.json().catch(() => ({}))
    const detail = err.error || `HTTP ${res.status}`
    console.error(`[Mastodon] Post failed on instance ${instance}:`, err)

    if (res.status === 401) {
      throw new Error('Mastodon: Token expired or revoked. Please reconnect your Mastodon account.')
    }
    if (res.status === 422 && err.error?.includes('characters')) {
      throw new Error(`Mastodon: Your instance has a shorter character limit than ${MAX_MASTODON_LENGTH}. Please shorten your post.`)
    }
    if (res.status === 429) {
      throw new Error('Mastodon: Rate limit hit. Please wait a few minutes and try again.')
    }
    throw new Error(`Mastodon post failed on ${instance}: ${detail}`)
  }

  const data = await res.json()
  console.log(`[Mastodon] Published post ${data.id} on ${instance}`)
  return data.id
}

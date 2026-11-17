import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { THREADS_GRAPH, metaError } from '@/lib/meta'
import { VIDEO_WAIT_MS, VideoStillProcessing, firstVideo, isVideoUrl, sleep } from './video'

/**
 * Threads publishing (Threads API, Nov 2026).
 *
 * Same two steps as Instagram: create a container, then publish it. Unlike
 * Instagram, Threads takes text-only posts, and photos may be JPEG or PNG.
 *   text only        media_type TEXT
 *   one photo        media_type IMAGE, image_url
 *   a video          media_type VIDEO, video_url
 *   2 to 20 photos   one IMAGE child per photo (is_carousel_item), then CAROUSEL
 */

const MAX_TEXT = 500
const MAX_CAROUSEL = 20
const IMAGE_WAIT_MS = 30_000
/** Refresh the 60-day token when it has less than this left. */
const REFRESH_WITHIN_MS = 7 * 24 * 60 * 60 * 1000

type ThreadsAccount = {
  id: string
  access_token: string | null
  platform_user_id: string | null
  expires_at: string | null
}

async function freshToken(account: ThreadsAccount): Promise<string> {
  const token = account.access_token
  if (!token) throw new Error('Threads connection is missing its token. Reconnect Threads on the Accounts page.')
  if (!account.expires_at) return token

  const expiresAt = new Date(account.expires_at).getTime()
  if (expiresAt <= Date.now()) {
    throw new Error('Threads connection expired (Threads tokens last 60 days without use). Reconnect Threads on the Accounts page.')
  }
  if (expiresAt - Date.now() > REFRESH_WITHIN_MS) return token

  const res = await fetch(`https://graph.threads.net/refresh_access_token?${new URLSearchParams({
    grant_type:   'th_refresh_token',
    access_token: token,
  })}`)
  if (!res.ok) {
    console.warn('[Threads] token refresh failed:', await res.text().catch(() => ''))
    return token
  }
  const body = await res.json().catch(() => ({}))
  if (!body.access_token) return token

  const newExpiry = body.expires_in
    ? new Date(Date.now() + Number(body.expires_in) * 1000).toISOString()
    : account.expires_at
  const { error } = await getSupabaseAdmin()
    .from('connected_accounts')
    .update({ access_token: body.access_token, expires_at: newExpiry, updated_at: new Date().toISOString() })
    .eq('id', account.id)
  if (error) console.warn('[Threads] saving refreshed token failed:', error.message)
  return String(body.access_token)
}

async function createContainer(userId: string, token: string, fields: Record<string, string>): Promise<string> {
  const res = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ ...fields, access_token: token }),
  })
  if (!res.ok) throw await metaError(res, 'Threads')
  const body = await res.json().catch(() => ({}))
  if (!body.id) throw new Error('Threads did not return a media container.')
  return String(body.id)
}

async function waitForContainer(containerId: string, token: string, deadline: number): Promise<boolean> {
  while (Date.now() < deadline) {
    const res = await fetch(`${THREADS_GRAPH}/${containerId}?${new URLSearchParams({
      fields:       'status,error_message',
      access_token: token,
    })}`)
    if (!res.ok) throw await metaError(res, 'Threads')
    const body = await res.json().catch(() => ({}))
    const status = String(body.status ?? '')
    if (status === 'FINISHED' || status === 'PUBLISHED') return true
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Threads could not process this media (${body.error_message || status}).`)
    }
    await sleep(2500)
  }
  return false
}

export async function publishToThreads(
  userId:       string,
  content:      string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[],
): Promise<string> {
  if (content.length > MAX_TEXT) {
    throw new Error(`Post exceeds Threads' ${MAX_TEXT} character limit (${content.length} chars). Please shorten it.`)
  }

  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, platform_user_id, expires_at')
    .eq('user_id', userId)
    .eq('platform', 'threads')
  if (accountId) query = query.eq('id', accountId)
  else if (workspaceId) query = query.eq('workspace_id', workspaceId)
  else query = query.is('workspace_id', null)

  const { data: account, error: accountError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (accountError) console.warn('[Threads] account lookup failed:', accountError.message)
  if (!account || !account.platform_user_id) {
    throw new Error('No Threads account connected. Go to Accounts to connect Threads.')
  }

  const token = await freshToken(account as ThreadsAccount)
  const threadsUserId = String(account.platform_user_id)
  const media = (mediaUrls ?? []).filter(u => typeof u === 'string' && u.startsWith('http'))

  let containerId: string
  const videoUrl = firstVideo(media)
  const photos = media.filter(u => !isVideoUrl(u)).slice(0, MAX_CAROUSEL)

  if (videoUrl) {
    containerId = await createContainer(threadsUserId, token, { media_type: 'VIDEO', video_url: videoUrl, text: content })
    if (!(await waitForContainer(containerId, token, Date.now() + VIDEO_WAIT_MS))) {
      throw new VideoStillProcessing('Threads')
    }
  } else if (photos.length === 1) {
    containerId = await createContainer(threadsUserId, token, { media_type: 'IMAGE', image_url: photos[0], text: content })
    if (!(await waitForContainer(containerId, token, Date.now() + IMAGE_WAIT_MS))) {
      throw new Error('Threads is still processing this photo. Press Retry on the post in a minute.')
    }
  } else if (photos.length > 1) {
    const children: string[] = []
    for (const url of photos) {
      children.push(await createContainer(threadsUserId, token, { media_type: 'IMAGE', image_url: url, is_carousel_item: 'true' }))
    }
    const deadline = Date.now() + IMAGE_WAIT_MS
    for (const child of children) {
      if (!(await waitForContainer(child, token, deadline))) {
        throw new Error('Threads is still processing these photos. Press Retry on the post in a minute.')
      }
    }
    containerId = await createContainer(threadsUserId, token, {
      media_type: 'CAROUSEL',
      children:   children.join(','),
      text:       content,
    })
    if (!(await waitForContainer(containerId, token, Date.now() + IMAGE_WAIT_MS))) {
      throw new Error('Threads is still processing these photos. Press Retry on the post in a minute.')
    }
  } else {
    if (!content.trim()) throw new Error('Threads needs text, a photo or a video.')
    containerId = await createContainer(threadsUserId, token, { media_type: 'TEXT', text: content })
  }

  const pubRes = await fetch(`${THREADS_GRAPH}/${threadsUserId}/threads_publish`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ creation_id: containerId, access_token: token }),
  })
  if (!pubRes.ok) throw await metaError(pubRes, 'Threads')
  const published = await pubRes.json().catch(() => ({}))
  if (!published.id) throw new Error('Threads accepted the post but returned no id.')
  console.log(`[Threads] Published ${published.id}`)
  return String(published.id)
}

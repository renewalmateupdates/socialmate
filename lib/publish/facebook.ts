import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { FB_GRAPH, metaError } from '@/lib/meta'
import { firstVideo, isVideoUrl } from './video'

/**
 * Facebook Page publishing (Nov 2026). Posts as the Page with its Page token.
 *
 *   text only        POST /{page}/feed     message
 *   one photo        POST /{page}/photos   url + caption
 *   several photos   POST /{page}/photos   published=false for each, then
 *                    POST /{page}/feed     message + attached_media
 *   a video          POST /{page}/videos   file_url + description
 *                    (Facebook finishes processing on its side; no wait needed)
 *
 * Facebook downloads media from the public URL itself, in any common format.
 */

const MAX_MESSAGE = 63206
const MAX_PHOTOS = 10

async function post(path: string, token: string, fields: Record<string, string>): Promise<Record<string, unknown>> {
  const res = await fetch(`${FB_GRAPH}/${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ ...fields, access_token: token }),
  })
  if (!res.ok) throw await metaError(res, 'Facebook')
  return (await res.json().catch(() => ({}))) as Record<string, unknown>
}

export async function publishToFacebook(
  userId:       string,
  content:      string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[],
): Promise<string> {
  if (content.length > MAX_MESSAGE) {
    throw new Error(`Post exceeds Facebook's ${MAX_MESSAGE} character limit (${content.length} chars). Please shorten it.`)
  }

  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'facebook')
  if (accountId) query = query.eq('id', accountId)
  else if (workspaceId) query = query.eq('workspace_id', workspaceId)
  else query = query.is('workspace_id', null)

  const { data: account, error: accountError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (accountError) console.warn('[Facebook] account lookup failed:', accountError.message)
  if (!account || !account.platform_user_id || !account.access_token) {
    throw new Error('No Facebook Page connected. Go to Accounts to connect a Facebook Page.')
  }

  const pageId = String(account.platform_user_id)
  const token  = String(account.access_token)
  const media  = (mediaUrls ?? []).filter(u => typeof u === 'string' && u.startsWith('http'))

  const videoUrl = firstVideo(media)
  if (videoUrl) {
    const body = await post(`${pageId}/videos`, token, { file_url: videoUrl, description: content })
    if (!body.id) throw new Error('Facebook accepted the video but returned no id.')
    console.log(`[Facebook] Published video ${body.id}`)
    return String(body.id)
  }

  const photos = media.filter(u => !isVideoUrl(u)).slice(0, MAX_PHOTOS)

  if (photos.length === 1) {
    const body = await post(`${pageId}/photos`, token, { url: photos[0], caption: content })
    const id = body.post_id ?? body.id
    if (!id) throw new Error('Facebook accepted the photo but returned no id.')
    console.log(`[Facebook] Published photo post ${id}`)
    return String(id)
  }

  const fields: Record<string, string> = { message: content }
  if (photos.length > 1) {
    const ids: string[] = []
    for (const url of photos) {
      const body = await post(`${pageId}/photos`, token, { url, published: 'false' })
      if (body.id) ids.push(String(body.id))
    }
    ids.forEach((id, i) => { fields[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id }) })
  } else if (!content.trim()) {
    throw new Error('Facebook needs text, a photo or a video.')
  }

  const body = await post(`${pageId}/feed`, token, fields)
  if (!body.id) throw new Error('Facebook accepted the post but returned no id.')
  console.log(`[Facebook] Published post ${body.id}`)
  return String(body.id)
}

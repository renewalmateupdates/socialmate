import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { IG_GRAPH, metaError } from '@/lib/meta'
import { VIDEO_WAIT_MS, VideoStillProcessing, firstVideo, isVideoUrl, sleep } from './video'

/**
 * Instagram publishing through "Instagram API with Instagram Login" (Nov 2026).
 *
 * Instagram has no text-only posts: every post is a photo, a carousel of up to
 * 10 photos, or a Reel. Publishing is two steps: create a media container from a
 * public URL (Instagram downloads the file itself), wait for it to be FINISHED,
 * then publish it. Photos must be JPEG; Instagram refuses PNG and WebP.
 */

const MAX_CAPTION = 2200
const MAX_CAROUSEL = 10
/** Photos are usually ready in a second or two. */
const IMAGE_WAIT_MS = 20_000
/** Refresh the 60-day token when it has less than this left. */
const REFRESH_WITHIN_MS = 7 * 24 * 60 * 60 * 1000

type IgAccount = {
  id: string
  access_token: string | null
  platform_user_id: string | null
  expires_at: string | null
}

function isJpeg(url: string): boolean {
  return /\.(jpe?g)$/i.test(String(url).split('?')[0])
}

/** Keeps the 60-day token alive. Instagram only refreshes a token that is still valid. */
async function freshToken(account: IgAccount): Promise<string> {
  const token = account.access_token
  if (!token) throw new Error('Instagram connection is missing its token. Reconnect Instagram on the Accounts page.')
  if (!account.expires_at) return token

  const expiresAt = new Date(account.expires_at).getTime()
  if (expiresAt <= Date.now()) {
    throw new Error('Instagram connection expired (Instagram tokens last 60 days without use). Reconnect Instagram on the Accounts page.')
  }
  if (expiresAt - Date.now() > REFRESH_WITHIN_MS) return token

  const params = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: token })
  const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`)
  if (!res.ok) {
    // The old token still works until it expires; post with it and log.
    console.warn('[Instagram] token refresh failed:', await res.text().catch(() => ''))
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
  if (error) console.warn('[Instagram] saving refreshed token failed:', error.message)
  return String(body.access_token)
}

async function createContainer(igUserId: string, token: string, fields: Record<string, string>): Promise<string> {
  const res = await fetch(`${IG_GRAPH}/${igUserId}/media`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ ...fields, access_token: token }),
  })
  if (!res.ok) throw await metaError(res, 'Instagram')
  const body = await res.json().catch(() => ({}))
  if (!body.id) throw new Error('Instagram did not return a media container.')
  return String(body.id)
}

/** Waits for a container to finish processing. Returns false if the deadline passes first. */
async function waitForContainer(containerId: string, token: string, deadline: number): Promise<boolean> {
  while (Date.now() < deadline) {
    const params = new URLSearchParams({ fields: 'status_code,status', access_token: token })
    const res = await fetch(`${IG_GRAPH}/${containerId}?${params.toString()}`)
    if (!res.ok) throw await metaError(res, 'Instagram')
    const body = await res.json().catch(() => ({}))
    const status = String(body.status_code ?? '')
    if (status === 'FINISHED' || status === 'PUBLISHED') return true
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Instagram could not process this media (${body.status || status}). Photos must be JPEG; videos MP4 or MOV.`)
    }
    await sleep(2500)
  }
  return false
}

export async function publishToInstagram(
  userId:       string,
  content:      string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[],
): Promise<string> {
  if (content.length > MAX_CAPTION) {
    throw new Error(`Post exceeds Instagram's ${MAX_CAPTION} character caption limit (${content.length} chars). Please shorten it.`)
  }

  const media = (mediaUrls ?? []).filter(u => typeof u === 'string' && u.startsWith('http'))
  if (media.length === 0) {
    throw new Error('Instagram needs a photo or video. Add one to this post to send it to Instagram.')
  }

  // Same account choice as LinkedIn/Bluesky: an explicit pick, else the most
  // recently connected account in this workspace.
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, platform_user_id, expires_at')
    .eq('user_id', userId)
    .eq('platform', 'instagram')
  if (accountId) query = query.eq('id', accountId)
  else if (workspaceId) query = query.eq('workspace_id', workspaceId)
  else query = query.is('workspace_id', null)

  const { data: account, error: accountError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (accountError) console.warn('[Instagram] account lookup failed:', accountError.message)
  if (!account || !account.platform_user_id) {
    throw new Error('No Instagram account connected. Go to Accounts to connect Instagram.')
  }

  const token = await freshToken(account as IgAccount)
  const igUserId = String(account.platform_user_id)

  let containerId: string
  let ready: boolean

  const videoUrl = firstVideo(media)
  if (videoUrl) {
    // A video goes up as a Reel. Instagram doesn't mix a Reel with photos.
    containerId = await createContainer(igUserId, token, {
      media_type:    'REELS',
      video_url:     videoUrl,
      caption:       content,
      share_to_feed: 'true',
    })
    ready = await waitForContainer(containerId, token, Date.now() + VIDEO_WAIT_MS)
    if (!ready) throw new VideoStillProcessing('Instagram')
  } else {
    const images = media.filter(u => !isVideoUrl(u)).slice(0, MAX_CAROUSEL)
    const notJpeg = images.filter(u => !isJpeg(u))
    if (notJpeg.length > 0) {
      throw new Error('Instagram only accepts JPEG photos. Save the image as .jpg and attach it again.')
    }

    if (images.length === 1) {
      containerId = await createContainer(igUserId, token, { image_url: images[0], caption: content })
    } else {
      const children: string[] = []
      for (const url of images) {
        children.push(await createContainer(igUserId, token, { image_url: url, is_carousel_item: 'true' }))
      }
      const childDeadline = Date.now() + IMAGE_WAIT_MS
      for (const child of children) {
        if (!(await waitForContainer(child, token, childDeadline))) {
          throw new Error('Instagram is still processing these photos. Press Retry on the post in a minute.')
        }
      }
      containerId = await createContainer(igUserId, token, {
        media_type: 'CAROUSEL',
        children:   children.join(','),
        caption:    content,
      })
    }
    ready = await waitForContainer(containerId, token, Date.now() + IMAGE_WAIT_MS)
    if (!ready) throw new Error('Instagram is still processing this photo. Press Retry on the post in a minute.')
  }

  const pubRes = await fetch(`${IG_GRAPH}/${igUserId}/media_publish`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ creation_id: containerId, access_token: token }),
  })
  if (!pubRes.ok) throw await metaError(pubRes, 'Instagram')
  const published = await pubRes.json().catch(() => ({}))
  if (!published.id) throw new Error('Instagram accepted the post but returned no id.')
  console.log(`[Instagram] Published media ${published.id}`)
  return String(published.id)
}

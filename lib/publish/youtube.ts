import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { youtubeDescription, youtubeTitle } from '@/lib/youtube'
import { RetryablePublishError } from './retry'
import { fetchVideo, firstVideo } from './video'

/**
 * YouTube publishing (Nov 2026): uploads the post's video to the connected
 * channel with videos.insert (resumable upload). The post's first line is the
 * title and the whole post is the description.
 *
 * This replaces a publisher that posted to /youtube/v3/communityPosts, an
 * endpoint the YouTube Data API does not have, so YouTube posting had never
 * worked. YouTube has no text-only posts through the API: every post needs a
 * video.
 *
 * Until the Google project passes the YouTube API Services audit, YouTube
 * itself locks uploads to Private. Each upload costs 1,600 of the project's
 * 10,000 daily quota units.
 */

type YtAccount = {
  id: string
  access_token: string | null
  refresh_token: string | null
  expires_at: string | null
}

const UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status'

async function refreshToken(account: YtAccount): Promise<string> {
  if (!account.refresh_token) {
    throw new Error('YouTube sign-in expired. Reconnect your YouTube account on the Accounts page.')
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: account.refresh_token,
      grant_type:    'refresh_token',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[YouTube] token refresh failed:', res.status, err)
    if (res.status >= 500) throw new RetryablePublishError('Google sign-in is temporarily unavailable. SocialMate will try again.')
    throw new Error('YouTube sign-in expired. Reconnect your YouTube account on the Accounts page.')
  }
  const data = await res.json()
  const expiresAt = new Date(Date.now() + Number(data.expires_in || 3600) * 1000).toISOString()
  const { error } = await getSupabaseAdmin()
    .from('connected_accounts')
    .update({ access_token: data.access_token, expires_at: expiresAt })
    .eq('id', account.id)
  if (error) console.warn('[YouTube] could not save the refreshed token:', error.message)
  return String(data.access_token)
}

/** Turns a YouTube API error response into a message people can act on. */
async function youtubeError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => ({}))
  const reason: string = body?.error?.errors?.[0]?.reason || ''
  const message: string = body?.error?.message || `HTTP ${res.status}`
  console.error('[YouTube] upload failed:', res.status, reason, message)

  if (res.status === 401) {
    return new Error('YouTube sign-in expired. Reconnect your YouTube account on the Accounts page.')
  }
  if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
    return new Error("SocialMate has used today's YouTube upload allowance. Press Retry tomorrow.")
  }
  if (reason === 'uploadLimitExceeded') {
    return new Error('Your YouTube channel has reached its upload limit for now. Press Retry later.')
  }
  if (reason === 'youtubeSignupRequired') {
    return new Error('This Google account has no YouTube channel. Create one on YouTube, then reconnect.')
  }
  if (res.status === 429 || res.status >= 500) {
    return new RetryablePublishError('YouTube is busy right now. SocialMate will try the upload again.')
  }
  return new Error(`YouTube upload failed: ${message}`)
}

export async function publishToYouTube(
  userId:       string,
  content:      string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[],
): Promise<string> {
  const videoUrl = firstVideo((mediaUrls ?? []).filter(u => typeof u === 'string' && u.startsWith('http')))
  if (!videoUrl) {
    throw new Error('YouTube needs a video. Attach an MP4 or MOV to this post to send it to YouTube.')
  }

  // Same account choice as Instagram: an explicit pick, else the most recently
  // connected account in this workspace.
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('platform', 'youtube')
  if (accountId) query = query.eq('id', accountId)
  else if (workspaceId) query = query.eq('workspace_id', workspaceId)
  else query = query.is('workspace_id', null)

  const { data: account, error: accountError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (accountError) console.warn('[YouTube] account lookup failed:', accountError.message)
  if (!account) {
    throw new Error('No YouTube account connected. Go to Accounts to connect YouTube.')
  }

  const acct = account as YtAccount
  let token = acct.access_token
  const expiresAt = acct.expires_at ? new Date(acct.expires_at).getTime() : 0
  if (!token || expiresAt - Date.now() < 60_000) token = await refreshToken(acct)

  const video = await fetchVideo(videoUrl)

  // 1. Start a resumable upload with the video's details.
  const startRes = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization:             `Bearer ${token}`,
      'Content-Type':            'application/json; charset=UTF-8',
      'X-Upload-Content-Type':   video.contentType,
      'X-Upload-Content-Length': String(video.bytes.byteLength),
    },
    body: JSON.stringify({
      snippet: {
        title:       youtubeTitle(content),
        description: youtubeDescription(content),
        // 22 = People & Blogs, YouTube's general-purpose category.
        categoryId:  '22',
      },
      status: { privacyStatus: 'public' },
    }),
  })
  if (!startRes.ok) throw await youtubeError(startRes)
  const uploadUrl = startRes.headers.get('location')
  if (!uploadUrl) throw new Error('YouTube did not return an upload address. Press Retry on the post.')

  // 2. Send the file.
  const putRes = await fetch(uploadUrl, {
    method:  'PUT',
    headers: {
      Authorization:    `Bearer ${token}`,
      'Content-Type':   video.contentType,
      'Content-Length': String(video.bytes.byteLength),
    },
    body: video.bytes,
  })
  if (!putRes.ok) throw await youtubeError(putRes)

  const uploaded = await putRes.json().catch(() => ({}))
  if (!uploaded.id) throw new Error('YouTube accepted the upload but returned no video id.')
  console.log(`[YouTube] Uploaded video ${uploaded.id}`)
  return String(uploaded.id)
}

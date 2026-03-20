import { getSupabaseAdmin } from '@/lib/supabase-admin'


async function refreshYouTubeToken(userId: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[YouTube] Token refresh failed:', err)
    throw new Error('YouTube token refresh failed. Please reconnect your YouTube account.')
  }

  const data      = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await getSupabaseAdmin()
    .from('connected_accounts')
    .update({ access_token: data.access_token, expires_at: expiresAt })
    .eq('user_id', userId)
    .eq('platform', 'youtube')

  return data.access_token
}

export async function publishToYouTube(userId: string, content: string): Promise<string> {
  const { data: account, error: accountError } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token, refresh_token, expires_at, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'youtube')
    .single()

  if (accountError || !account) {
    throw new Error('No YouTube account connected. Go to Accounts to connect your YouTube account.')
  }

  // Refresh token if expired (or within 60 seconds of expiry)
  let accessToken = account.access_token
  const expiresAt = account.expires_at ? new Date(account.expires_at) : null
  const bufferMs  = 60 * 1000 // 60 second buffer

  if (!expiresAt || expiresAt.getTime() - Date.now() < bufferMs) {
    if (!account.refresh_token) {
      throw new Error('YouTube token expired and no refresh token found. Please reconnect your YouTube account.')
    }
    accessToken = await refreshYouTubeToken(userId, account.refresh_token)
  }

  // Post as a YouTube Community post
  // NOTE: Community posts require the channel to have 500+ subscribers
  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/communityPosts?part=snippet',
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          type:                'textPost',
          textOriginalContent: content,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[YouTube] Community post failed:', err)

    const errMsg = err.error?.message || err.error?.errors?.[0]?.message || `HTTP ${res.status}`

    if (res.status === 401) {
      throw new Error('YouTube authentication failed. Please reconnect your YouTube account.')
    }
    if (res.status === 403) {
      const reason = err.error?.errors?.[0]?.reason || ''
      if (reason === 'commentsDisabled' || errMsg.includes('community')) {
        throw new Error('YouTube Community Posts require your channel to have at least 500 subscribers. This feature is not available for smaller channels.')
      }
      if (reason === 'forbidden') {
        throw new Error('YouTube API permission denied. Your app may need the youtube.force-ssl scope approved.')
      }
      throw new Error(`YouTube API access denied: ${errMsg}`)
    }
    if (res.status === 429) {
      throw new Error('YouTube API quota exceeded. Please try again tomorrow or contact support.')
    }
    throw new Error(`YouTube post failed: ${errMsg}`)
  }

  const data = await res.json()
  console.log(`[YouTube] Published community post: ${data.id}`)
  return data.id
}

/*
 * ─── YOUTUBE API APPROVAL REQUIREMENTS ────────────────────────────────────
 *
 * To use YouTube Community Posts, you need:
 *
 * 1. Create a project at https://console.cloud.google.com/
 *
 * 2. Enable the YouTube Data API v3:
 *    → https://console.cloud.google.com/apis/library/youtube.googleapis.com
 *
 * 3. Create OAuth 2.0 credentials (Web application type):
 *    → Authorized redirect URIs: https://socialmate.studio/api/accounts/youtube/callback
 *
 * 4. Set env vars:
 *    - YOUTUBE_CLIENT_ID
 *    - YOUTUBE_CLIENT_SECRET
 *
 * 5. Request YouTube Data API v3 production access:
 *    → https://support.google.com/youtube/contact/yt_api_form
 *    → Default quota: 10,000 units/day (free)
 *    → Community posts use ~50 units each
 *
 * Required OAuth Scopes:
 *   - https://www.googleapis.com/auth/youtube.force-ssl
 *   - https://www.googleapis.com/auth/youtube
 *
 * IMPORTANT USER REQUIREMENT:
 *   - YouTube Community Posts require the user's channel to have 500+ subscribers
 *   - Channels with fewer subscribers will get a 403 error
 *   - Display this limitation clearly in the accounts/connect UI
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

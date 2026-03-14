import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function refreshYouTubeToken(userId: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh YouTube token')

  const data = await res.json()
  const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await supabaseAdmin
    .from('connected_accounts')
    .update({ access_token: data.access_token, expires_at })
    .eq('user_id', userId)
    .eq('platform', 'youtube')

  return data.access_token
}

export async function publishToYouTube(userId: string, content: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, refresh_token, expires_at, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'youtube')
    .single()

  if (!account) throw new Error('No YouTube account connected')

  // Refresh token if expired
  let accessToken = account.access_token
  if (account.expires_at && new Date(account.expires_at) < new Date()) {
    accessToken = await refreshYouTubeToken(userId, account.refresh_token)
  }

  // Post as a YouTube Community post
  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/communityPosts?part=snippet',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          type: 'textPost',
          textOriginalContent: content,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Failed to post to YouTube')
  }

  const data = await res.json()
  return data.id
}
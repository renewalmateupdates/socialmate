import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_PINTEREST_DESCRIPTION = 500

export async function publishToPinterest(
  userId: string,
  content: string,
  destinationId?: string
): Promise<string> {
  if (content.length > MAX_PINTEREST_DESCRIPTION) {
    throw new Error(`Post exceeds Pinterest's ${MAX_PINTEREST_DESCRIPTION} character description limit (${content.length} chars). Please shorten your post.`)
  }

  const { data: account, error: accountError } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token, refresh_token, platform_user_id, expires_at')
    .eq('user_id', userId)
    .eq('platform', 'pinterest')
    .single()

  if (accountError || !account) {
    throw new Error('No Pinterest account connected. Go to Accounts to connect your Pinterest account.')
  }

  // Refresh token if expired
  let accessToken = account.access_token
  if (account.expires_at && new Date(account.expires_at) < new Date()) {
    try {
      accessToken = await refreshPinterestToken(userId, account.refresh_token)
    } catch {
      throw new Error('Pinterest token expired. Please reconnect your Pinterest account.')
    }
  }

  // Get board ID from destinations if specified
  let boardId: string | null = null
  if (destinationId) {
    const { data: dest } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('destination_id')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .single()
    boardId = dest?.destination_id || null
  }

  // Fall back to first saved Pinterest board destination
  if (!boardId) {
    const { data: dest } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('destination_id')
      .eq('user_id', userId)
      .eq('platform', 'pinterest')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    boardId = dest?.destination_id || null
  }

  if (!boardId) {
    throw new Error(
      'No Pinterest board configured. Go to Accounts → Destinations to select a board.'
    )
  }

  // Create a Pin using Pinterest v5 API
  const res = await fetch('https://api-sandbox.pinterest.com/v5/pins', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id:   boardId,
      description: content,
      media_source: {
        source_type: 'image_url',
        url:         'https://socialmate.studio/og-image.png', // Placeholder — replace with actual image
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[Pinterest] Pin creation failed:', err)

    const detail = err.message || `HTTP ${res.status}`

    if (res.status === 401) {
      throw new Error('Pinterest token expired. Please reconnect your Pinterest account.')
    }
    if (res.status === 403) {
      throw new Error('Pinterest API permission denied. Please reconnect your account with the required permissions.')
    }
    if (res.status === 404) {
      throw new Error(`Pinterest board not found. The board ID "${boardId}" may be invalid. Check your destination configuration.`)
    }
    throw new Error(`Pinterest pin creation failed: ${detail}`)
  }

  const data = await res.json()
  console.log(`[Pinterest] Created pin: ${data.id} on board ${boardId}`)
  return data.id
}

async function refreshPinterestToken(userId: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:  `Basic ${Buffer.from(`${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error('Pinterest token refresh failed')

  const data      = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await getSupabaseAdmin()
    .from('connected_accounts')
    .update({ access_token: data.access_token, expires_at: expiresAt })
    .eq('user_id', userId)
    .eq('platform', 'pinterest')

  return data.access_token
}

/*
 * ─── PINTEREST API APPROVAL REQUIREMENTS ──────────────────────────────────
 *
 * 1. Create an app at https://developers.pinterest.com/apps/
 *
 * 2. Request the following scopes:
 *    - boards:read    (list user boards)
 *    - boards:write   (create boards)
 *    - pins:read      (read pins)
 *    - pins:write     (create pins)
 *
 * 3. Set env vars:
 *    - PINTEREST_CLIENT_ID
 *    - PINTEREST_CLIENT_SECRET
 *
 * 4. Register redirect URI:
 *    - https://socialmate.studio/api/accounts/pinterest/callback
 *
 * 5. For production (non-sandbox) access, you must apply for API access:
 *    → https://developers.pinterest.com/docs/getting-started/connect-app/
 *    → Submit the "Pinterest Developer Application" form
 *    → Approval typically takes 1-2 weeks
 *
 * NOTE: Change the fetch URL from api-sandbox.pinterest.com to
 *       api.pinterest.com when you receive production API access.
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

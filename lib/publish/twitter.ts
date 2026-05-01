import { getSupabaseAdmin } from '@/lib/supabase-admin'

// X (Twitter) API v2
// Required env vars: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
// Free tier: 1500 tweets/month per app (write) — enforced at quota level in WorkspaceContext

const MAX_TWEET_LENGTH = 280

export async function refreshTwitterToken(
  refreshToken: string,
  accountId: string
): Promise<string> {
  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     process.env.TWITTER_CLIENT_ID!,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Twitter token refresh failed: ${err.error_description || res.status}`)
  }

  const { access_token, refresh_token: new_refresh_token, expires_in } = await res.json()
  const expires_at = expires_in
    ? new Date(Date.now() + expires_in * 1000).toISOString()
    : null

  // Persist refreshed tokens
  await getSupabaseAdmin()
    .from('connected_accounts')
    .update({
      access_token,
      refresh_token: new_refresh_token || refreshToken,
      ...(expires_at ? { expires_at } : {}),
    })
    .eq('id', accountId)

  return access_token
}

export async function publishToTwitter(
  userId:       string,
  content:      string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[]
): Promise<string> {
  // Feature kill switch — check admin flags table
  const { data: flags } = await getSupabaseAdmin()
    .from('feature_flags')
    .select('enabled')
    .eq('flag', 'twitter_posting')
    .maybeSingle()

  if (flags && flags.enabled === false) {
    throw new Error('X posting is temporarily paused. Please try again later.')
  }

  // Fetch connected account
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, platform_user_id, account_name, expires_at')
    .eq('user_id', userId)
    .eq('platform', 'twitter')

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
    throw new Error('No X account connected. Go to Accounts to connect your X account.')
  }

  // ─── Admin bypass ─────────────────────────────────────────────────────────
  const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(userId)
  const ADMIN_EMAIL = 'socialmatehq@gmail.com'
  if (authUser?.user?.email === ADMIN_EMAIL) {
    // Admin account has no X quota restrictions
  } else {
  // ─── Per-workspace X quota enforcement ──────────────────────────────────
  // Free tier API cap: 1,500 tweets/month per app (write).
  // Per-workspace monthly limits:
  //   Free   → 28   · Pro → 150   · Agency → 400
  const TWITTER_QUOTA: Record<string, number> = { free: 5, pro: 150, agency: 400 }

  // Fetch workspace plan — use owner_id fallback when workspaceId is null (personal workspace)
  let wsData: { plan: string | null } | null = null
  if (workspaceId) {
    const { data } = await getSupabaseAdmin()
      .from('workspaces')
      .select('plan')
      .eq('id', workspaceId)
      .maybeSingle()
    wsData = data
  } else {
    const { data } = await getSupabaseAdmin()
      .from('workspaces')
      .select('plan')
      .eq('owner_id', userId)
      .eq('is_personal', true)
      .maybeSingle()
    wsData = data
  }
  const plan = (wsData?.plan as string | null) ?? 'free'
  const monthlyLimit = TWITTER_QUOTA[plan] ?? TWITTER_QUOTA.free

  // Count tweets published this calendar month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  let tweetCountQuery = getSupabaseAdmin()
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .contains('platforms', ['twitter'])
    .eq('status', 'published')
    .gte('published_at', monthStart.toISOString())

  if (workspaceId) {
    tweetCountQuery = tweetCountQuery.eq('workspace_id', workspaceId)
  }

  const { count: tweetCount } = await tweetCountQuery

  if ((tweetCount ?? 0) >= monthlyLimit) {
    // Base quota exhausted — check X Booster balance before blocking
    const { data: userSettings } = await getSupabaseAdmin()
      .from('user_settings')
      .select('twitter_booster_balance')
      .eq('user_id', userId)
      .maybeSingle()

    const boosterBalance = userSettings?.twitter_booster_balance ?? 0
    if (boosterBalance > 0) {
      // Consume one booster post
      await getSupabaseAdmin()
        .from('user_settings')
        .update({ twitter_booster_balance: boosterBalance - 1 })
        .eq('user_id', userId)
      // Allow the tweet to proceed
    } else {
      throw new Error(
        `You've reached your X posting limit for this month (${monthlyLimit} tweets). ` +
        `Upgrade your plan, purchase an X Booster pack, or wait until next month.`
      )
    }
  }
  } // end quota enforcement (skipped for admin)
  // ──────────────────────────────────────────────────────────────────────────

  // Enforce character limit (unicode-safe)
  const tweetText = content.length > MAX_TWEET_LENGTH
    ? content.slice(0, MAX_TWEET_LENGTH - 1) + '…'
    : content

  // Refresh token if expired or expiring within 5 minutes
  let accessToken = account.access_token
  const expiresAt = account.expires_at ? new Date(account.expires_at) : null
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000)

  if (account.refresh_token && expiresAt && expiresAt < fiveMinFromNow) {
    try {
      accessToken = await refreshTwitterToken(account.refresh_token, account.id)
    } catch (e) {
      throw new Error('X session expired. Please reconnect your X account in Accounts → X.')
    }
  }

  // Handle media uploads if present (images only for now — video requires async upload)
  const mediaIds: string[] = []
  const imageUrls = (mediaUrls || []).filter(u =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(u.split('?')[0])
  ).slice(0, 4) // X allows max 4 images

  for (const imageUrl of imageUrls) {
    try {
      // Download the image
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) continue
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg'

      // Upload to Twitter v1.1 media upload endpoint
      const uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          media_data: imgBuffer.toString('base64'),
          media_type: contentType,
        }),
      })

      if (uploadRes.ok) {
        const { media_id_string } = await uploadRes.json()
        if (media_id_string) mediaIds.push(media_id_string)
      }
    } catch {
      // Non-fatal — post text even if media upload fails
    }
  }

  // Post the tweet
  const tweetBody: Record<string, unknown> = { text: tweetText }
  if (mediaIds.length > 0) {
    tweetBody.media = { media_ids: mediaIds }
  }

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetBody),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[Twitter] Post failed:', err)

    if (res.status === 401) {
      throw new Error('X token expired. Please reconnect your X account in Accounts → X.')
    }
    if (res.status === 403) {
      const detail = err?.detail || ''
      if (detail.includes('duplicate')) {
        throw new Error('X rejected this post as a duplicate. Please change the text slightly.')
      }
      throw new Error(`X API permission denied. Check your app's tweet.write scope.`)
    }
    if (res.status === 429) {
      throw new Error('X posting rate limit reached. Please wait and try again.')
    }
    const detail = err?.detail || err?.errors?.[0]?.message || `HTTP ${res.status}`
    throw new Error(`X post failed: ${detail}`)
  }

  const { data } = await res.json()
  console.log(`[Twitter] Published tweet: ${data.id}`)
  return data.id
}

/*
 * ─── X (TWITTER) API SETUP ─────────────────────────────────────────────────
 *
 * 1. Create app at https://developer.twitter.com/en/portal/projects-and-apps
 * 2. Enable OAuth 2.0 with PKCE
 * 3. Set Type of App: "Web App, Automated App or Bot"
 * 4. Add callback URL: https://socialmate.studio/api/accounts/twitter/callback
 * 5. Add required scopes: tweet.read tweet.write users.read offline.access
 * 6. Save Client ID + Client Secret to env vars:
 *    TWITTER_CLIENT_ID=...
 *    TWITTER_CLIENT_SECRET=...
 *
 * API Tier:
 * - Free tier: 1,500 tweets/month per app (write-only)
 * - Basic ($100/month): 10,000 tweets/month
 * - Enforce per-workspace quota in the app (see WorkspaceContext) to stay within free tier
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

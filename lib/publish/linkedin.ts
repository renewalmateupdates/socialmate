import { getSupabaseAdmin } from '@/lib/supabase-admin'


// LinkedIn UGC posts max length
const MAX_LINKEDIN_LENGTH = 3000

export async function publishToLinkedIn(
  userId:     string,
  content:    string,
  workspaceId?: string | null,
  accountId?:   string
): Promise<string> {
  if (content.length > MAX_LINKEDIN_LENGTH) {
    throw new Error(`Post exceeds LinkedIn's ${MAX_LINKEDIN_LENGTH} character limit (${content.length} chars). Please shorten your post.`)
  }

  // connected_accounts rows for LinkedIn are never workspace-scoped today (the
  // OAuth callback doesn't set workspace_id), but Pro/Agency plans explicitly
  // sell up to 5-10 connected LinkedIn accounts per platform. This used to be
  // .single() with no filter at all, which throws "multiple rows" the moment a
  // user connects a second account -- every LinkedIn post then failed with a
  // misleading "No LinkedIn account connected." Mirrors the Bluesky/Mastodon/
  // Twitter pattern: honor an explicit account pick, else fall back to the most
  // recently connected one instead of erroring.
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'linkedin')

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
    throw new Error('No LinkedIn account connected. Go to Accounts to connect your LinkedIn account.')
  }

  // LinkedIn access tokens expire after 60 days — no automatic refresh available without refresh token
  if (!account.access_token) {
    throw new Error('LinkedIn token missing. Please reconnect your LinkedIn account.')
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method:  'POST',
    headers: {
      Authorization:               `Bearer ${account.access_token}`,
      'Content-Type':              'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author:            `urn:li:person:${account.platform_user_id}`,
      lifecycleState:    'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary:     { text: content },
          shareMediaCategory:  'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[LinkedIn] Post failed:', err)

    if (res.status === 401) {
      throw new Error('LinkedIn token expired (LinkedIn tokens last 60 days). Please reconnect your LinkedIn account.')
    }
    if (res.status === 403) {
      throw new Error('LinkedIn API permission denied. Your app may not have the r/w_member_social scope approved. See /accounts for details.')
    }
    if (res.status === 422) {
      throw new Error(`LinkedIn rejected the post: ${err.message || 'invalid content format'}`)
    }
    const detail = err.message || `HTTP ${res.status}`
    throw new Error(`LinkedIn post failed: ${detail}`)
  }

  const data = await res.json()
  console.log(`[LinkedIn] Published post: ${data.id}`)
  return data.id
}

/*
 * ─── LINKEDIN API APPROVAL REQUIREMENTS ────────────────────────────────────
 *
 * To use LinkedIn publishing, your app needs these API products approved:
 *
 * 1. Sign in with LinkedIn using OpenID Connect
 *    → Required for OAuth login
 *    → URL: https://www.linkedin.com/developers/apps/{appId}/products
 *
 * 2. Share on LinkedIn
 *    → Required for posting content (r/w_member_social scope)
 *    → Requires application review and approval
 *    → Apply at: https://www.linkedin.com/developers/apps/{appId}/products
 *    → Select "Share on LinkedIn" product and click "Request Access"
 *    → Review typically takes 3-5 business days
 *
 * Required OAuth Scopes:
 *   - openid (Sign in with LinkedIn)
 *   - profile (user profile data)
 *   - email (user email)
 *   - w_member_social (post on behalf of members)
 *
 * Redirect URI to register:
 *   - https://socialmate.studio/api/accounts/linkedin/callback
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin'


// LinkedIn UGC posts max length
const MAX_LINKEDIN_LENGTH = 3000

// Registers an upload slot with LinkedIn's Assets API, PUTs the image bytes
// to it, and returns the resulting asset URN to reference in the post.
// Resilient by design: any failure here is caught by the caller and the post
// still goes out, just without that image -- matching how Bluesky/Mastodon's
// media upload already behaves, rather than failing the whole post over one
// bad image URL.
async function uploadLinkedInImage(
  accessToken: string,
  personUrn: string,
  imageUrl: string,
): Promise<string | null> {
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: personUrn,
        serviceRelationships: [
          { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' },
        ],
      },
    }),
  })
  if (!registerRes.ok) {
    console.warn('[LinkedIn] Asset registration failed for', imageUrl, await registerRes.text().catch(() => ''))
    return null
  }

  const registerData = await registerRes.json()
  const uploadUrl: string | undefined =
    registerData?.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
  const asset: string | undefined = registerData?.value?.asset
  if (!uploadUrl || !asset) {
    console.warn('[LinkedIn] Asset registration returned no upload URL for', imageUrl)
    return null
  }

  const mediaRes = await fetch(imageUrl)
  if (!mediaRes.ok) {
    console.warn('[LinkedIn] Could not fetch media for upload:', imageUrl)
    return null
  }
  const buffer = await mediaRes.arrayBuffer()

  const putRes = await fetch(uploadUrl, {
    method:  'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body:    Buffer.from(buffer),
  })
  if (!putRes.ok) {
    console.warn('[LinkedIn] Image PUT failed for', imageUrl, await putRes.text().catch(() => ''))
    return null
  }

  return asset
}

export async function publishToLinkedIn(
  userId:     string,
  content:    string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[],
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

  const personUrn = `urn:li:person:${account.platform_user_id}`

  // Media was never passed to this publisher at all -- publishToAll forwarded
  // it to every other platform, so an image attached to a post that included
  // LinkedIn was silently dropped for that platform only, with no error shown
  // to the user. LinkedIn requires each image registered and uploaded as a
  // separate asset before the post itself can reference it.
  const shareContent: Record<string, unknown> = {
    shareCommentary:    { text: content },
    shareMediaCategory: 'NONE',
  }

  if (mediaUrls && mediaUrls.length > 0) {
    const imageUrls = mediaUrls.filter(u => !u.match(/\.(mp4|mov|avi|webm)/i)).slice(0, 9)
    const assets: string[] = []
    for (const url of imageUrls) {
      const asset = await uploadLinkedInImage(account.access_token, personUrn, url)
      if (asset) assets.push(asset)
    }
    if (assets.length > 0) {
      shareContent.shareMediaCategory = 'IMAGE'
      shareContent.media = assets.map(asset => ({ status: 'READY', media: asset }))
    }
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method:  'POST',
    headers: {
      Authorization:               `Bearer ${account.access_token}`,
      'Content-Type':              'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author:            personUrn,
      lifecycleState:    'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': shareContent,
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

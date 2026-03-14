import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToLinkedIn(userId: string, content: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'linkedin')
    .single()

  if (!account) throw new Error('No LinkedIn account connected')

  // Post a text share via LinkedIn UGC API
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${account.platform_user_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to post to LinkedIn')
  }

  const data = await res.json()
  return data.id
}
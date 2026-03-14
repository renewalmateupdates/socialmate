import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToMastodon(userId: string, content: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'mastodon')
    .single()

  if (!account) throw new Error('No Mastodon account connected')

  // platform_user_id is stored as "userId@instance"
  const instance = account.platform_user_id.split('@').slice(1).join('@')

  if (!instance) throw new Error('Could not determine Mastodon instance')

  const res = await fetch(`https://${instance}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: content,
      visibility: 'public',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to post to Mastodon')
  }

  const data = await res.json()
  return data.id
}
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToBluesky(userId: string, content: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, refresh_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'bluesky')
    .single()

  if (!account) throw new Error('No Bluesky account connected')

  // Refresh session to get fresh token
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.refresh_token}`,
      'Content-Type': 'application/json',
    },
  })

  let accessJwt = account.access_token
  let did = account.platform_user_id

  if (sessionRes.ok) {
    const session = await sessionRes.json()
    accessJwt = session.accessJwt
    did = session.did

    // Update tokens in DB
    await supabaseAdmin
      .from('connected_accounts')
      .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
      .eq('user_id', userId)
      .eq('platform', 'bluesky')
  }

  // Create post
  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record: {
        text: content,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post',
      },
    }),
  })

  if (!postRes.ok) throw new Error('Failed to post to Bluesky')

  const post = await postRes.json()
  return post.uri
}
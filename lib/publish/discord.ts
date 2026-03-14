import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToDiscord(userId: string, content: string): Promise<string> {
  // Get user's connected Discord account
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'discord')
    .single()

  if (!account) throw new Error('No Discord account connected')

  // Get the user's DM channel (posts to own DM as a test/default)
  // In Phase 3 we'll add server/channel selection
  const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: account.platform_user_id }),
  })

  if (!dmRes.ok) throw new Error('Failed to open Discord DM channel')

  const { id: channelId } = await dmRes.json()

  // Send message
  const msgRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  })

  if (!msgRes.ok) throw new Error('Failed to send Discord message')

  const msg = await msgRes.json()
  return msg.id
}
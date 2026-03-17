import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToTelegram(
  userId: string,
  content: string,
  destinationId?: string
): Promise<string> {
  // Get the bot token from connected_accounts
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token')
    .eq('user_id', userId)
    .eq('platform', 'telegram')
    .single()

  if (!account?.access_token) {
    throw new Error('No Telegram account connected')
  }

  const botToken = account.access_token

  // Get the chat ID from destinations
  let chatId: string | null = null

  if (destinationId) {
    const { data: dest } = await supabaseAdmin
      .from('post_destinations')
      .select('destination_id')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .single()
    chatId = dest?.destination_id || null
  }

  // Fall back to first saved Telegram destination
  if (!chatId) {
    const { data: dest } = await supabaseAdmin
      .from('post_destinations')
      .select('destination_id')
      .eq('user_id', userId)
      .eq('platform', 'telegram')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    chatId = dest?.destination_id || null
  }

  if (!chatId) {
    throw new Error(
      'No Telegram destination configured. Go to Accounts → Destinations to add a Telegram channel or group.'
    )
  }

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: content,
        parse_mode: 'HTML',
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.description || 'Failed to send Telegram message')
  }

  const data = await res.json()
  return String(data.result.message_id)
}
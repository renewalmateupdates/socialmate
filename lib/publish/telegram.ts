import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToTelegram(userId: string, content: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'telegram')
    .single()

  if (!account) throw new Error('No Telegram account connected')

  const botToken = account.access_token
  const chatId = account.platform_user_id

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: content,
      parse_mode: 'HTML',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.description || 'Failed to send Telegram message')
  }

  const data = await res.json()
  return String(data.result.message_id)
}
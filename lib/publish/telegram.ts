import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_TELEGRAM_LENGTH      = 4096
const MAX_TELEGRAM_CAPTION_LEN = 1024

export async function publishToTelegram(
  userId:        string,
  content:       string,
  destinationId?: string,
  mediaUrls?:    string[],
  accountId?:    string
): Promise<string> {
  // Enforce 4096 character limit
  if (content.length > MAX_TELEGRAM_LENGTH) {
    throw new Error(`Post exceeds Telegram's ${MAX_TELEGRAM_LENGTH} character limit (${content.length} chars). Please shorten your post.`)
  }

  // Get the bot token from connected_accounts. This was .single() with no cap
  // and no account filter -- fine for one bot, but Pro/Agency plans sell up to
  // 5-10 connected accounts per platform, and a second connected Telegram bot
  // made .single() throw "multiple rows", failing every Telegram post with a
  // misleading "No Telegram account connected." An explicit accountId (same as
  // Bluesky/Mastodon/Twitter/LinkedIn) picks the right bot; otherwise fall back
  // to the most recently connected one instead of erroring.
  let acctQuery = getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token')
    .eq('user_id', userId)
    .eq('platform', 'telegram')

  if (accountId) acctQuery = acctQuery.eq('id', accountId)

  const { data: account, error: accountError } = await acctQuery
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (accountError || !account?.access_token) {
    throw new Error('No Telegram account connected. Go to Accounts to connect your Telegram bot.')
  }

  const botToken = account.access_token

  // Get the chat ID from destinations
  let chatId: string | null = null

  if (destinationId) {
    const { data: dest, error: destErr } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('destination_id')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .maybeSingle()
    if (destErr) console.warn('[Telegram] destination lookup failed:', destErr.message)
    chatId = dest?.destination_id || null
  }

  // Fall back to first saved Telegram destination
  if (!chatId) {
    const { data: dest, error: fallbackErr } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('destination_id')
      .eq('user_id', userId)
      .eq('platform', 'telegram')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (fallbackErr) console.warn('[Telegram] fallback destination lookup failed:', fallbackErr.message)
    chatId = dest?.destination_id || null
  }

  if (!chatId) {
    throw new Error(
      'No Telegram destination configured. Go to Accounts → Destinations to add your Telegram channel or group chat ID.'
    )
  }

  // If media attached, use sendPhoto / sendVideo / sendMediaGroup
  if (mediaUrls && mediaUrls.length > 0) {
    const isVideo   = (url: string) => /\.(mp4|mov|avi|webm)/i.test(url.split('?')[0])
    const caption   = content.slice(0, MAX_TELEGRAM_CAPTION_LEN)

    if (mediaUrls.length === 1) {
      // Single media — sendPhoto or sendVideo
      const url      = mediaUrls[0]
      const endpoint = isVideo(url) ? 'sendVideo' : 'sendPhoto'
      const field    = isVideo(url) ? 'video'     : 'photo'

      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/${endpoint}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id:    chatId,
            [field]:    url,
            caption,
            parse_mode: 'HTML',
          }),
        }
      )

      if (!res.ok) {
        const err    = await res.json().catch(() => ({}))
        const detail = err.description || `HTTP ${res.status}`
        console.error('[Telegram] Media send failed:', err)
        throw new Error(`Telegram post failed: ${detail}`)
      }

      const data = await res.json()
      const messageId = String(data.result?.message_id || Date.now())
      console.log(`[Telegram] Published media message ${messageId} to chat ${chatId}`)
      return messageId

    } else {
      // Multiple media — sendMediaGroup (up to 10)
      const mediaGroup = mediaUrls.slice(0, 10).map((url, i) => ({
        type:       isVideo(url) ? 'video' : 'photo',
        media:      url,
        ...(i === 0 ? { caption, parse_mode: 'HTML' } : {}),
      }))

      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMediaGroup`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, media: mediaGroup }),
        }
      )

      if (!res.ok) {
        const err    = await res.json().catch(() => ({}))
        const detail = err.description || `HTTP ${res.status}`
        throw new Error(`Telegram media group failed: ${detail}`)
      }

      const data      = await res.json()
      const messageId = String(data.result?.[0]?.message_id || Date.now())
      console.log(`[Telegram] Published media group, first message ${messageId} to chat ${chatId}`)
      return messageId
    }
  }

  // Text-only post
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    chatId,
        text:       content,
        parse_mode: 'HTML',
      }),
    }
  )

  if (!res.ok) {
    const err    = await res.json().catch(() => ({}))
    const detail = err.description || `HTTP ${res.status}`
    console.error('[Telegram] Send failed:', err)

    if (res.status === 400 && err.description?.includes('chat not found')) {
      throw new Error(`Telegram: Chat not found. Verify the chat ID "${chatId}" is correct and the bot has been added to the chat.`)
    }
    if (res.status === 403) {
      throw new Error('Telegram: Bot was kicked from the chat or lacks permission to post. Re-add the bot and grant it admin rights.')
    }
    if (res.status === 401) {
      throw new Error('Telegram: Invalid bot token. Please reconnect your Telegram account.')
    }
    throw new Error(`Telegram post failed: ${detail}`)
  }

  const data      = await res.json()
  const messageId = String(data.result.message_id)
  console.log(`[Telegram] Published message ${messageId} to chat ${chatId}`)
  return messageId
}

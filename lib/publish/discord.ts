import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_DISCORD_LENGTH = 2000

/** Discord snowflakes are numeric strings; webhook targets are full URLs. */
function isChannelId(target: string): boolean {
  return /^\d{15,25}$/.test(target)
}

/**
 * Build the request for whichever kind of target we have.
 *
 * Both paths take the same body — content plus optional attachments — and differ
 * only in URL and auth, so the media handling below is written once.
 */
async function buildBody(content: string, mediaUrls?: string[]): Promise<{ body: BodyInit; headers: Record<string, string> }> {
  if (mediaUrls && mediaUrls.length > 0) {
    const form = new FormData()
    form.append('payload_json', JSON.stringify({ content }))

    for (let i = 0; i < Math.min(mediaUrls.length, 10); i++) {
      try {
        const mediaRes = await fetch(mediaUrls[i])
        const blob     = await mediaRes.blob()
        const ext      = mediaUrls[i].split('?')[0].split('.').pop() || 'jpg'
        form.append(`files[${i}]`, blob, `attachment_${i}.${ext}`)
      } catch (fetchErr) {
        console.warn(`[Discord] Failed to fetch media ${i}:`, fetchErr)
      }
    }
    // Let fetch set the multipart boundary itself.
    return { body: form, headers: {} }
  }

  return {
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' },
  }
}

export async function publishToDiscord(
  userId: string,
  content: string,
  destinationId?: string,
  mediaUrls?: string[]
): Promise<string> {
  // Enforce 2000 character limit
  if (content.length > MAX_DISCORD_LENGTH) {
    throw new Error(`Post exceeds Discord's ${MAX_DISCORD_LENGTH} character limit (${content.length} chars). Please shorten your post.`)
  }

  // The target is either a webhook URL (how Discord destinations were made
  // before the bot could see channels) or a channel id picked from the server.
  // Both stay supported indefinitely — a working webhook is not worth breaking
  // to tidy this up.
  let target: string | null = null

  if (destinationId) {
    const { data: dest, error } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('webhook_url, destination_id')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) console.warn('[Discord] destination lookup failed:', error.message)
    target = dest?.webhook_url || dest?.destination_id || null
  }

  // Fall back to first saved Discord destination for this user
  if (!target) {
    const { data: dest, error } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('webhook_url, destination_id')
      .eq('user_id', userId)
      .eq('platform', 'discord')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) console.warn('[Discord] fallback destination lookup failed:', error.message)
    target = dest?.webhook_url || dest?.destination_id || null
  }

  if (!target) {
    throw new Error(
      'No Discord channel picked yet. Go to Accounts and choose which channel to post into.'
    )
  }

  const viaBot = isChannelId(target)

  if (!viaBot &&
      !target.includes('discord.com/api/webhooks/') &&
      !target.includes('discordapp.com/api/webhooks/')) {
    throw new Error('Invalid Discord destination. Please pick your channel again on the Accounts page.')
  }

  const token = process.env.DISCORD_BOT_TOKEN
  if (viaBot && !token) {
    // Loudly, because this is a configuration fault on our side and the user
    // can do nothing about it. Silence here would look like a dead feature.
    console.error('[Discord] DISCORD_BOT_TOKEN is not set — cannot post to a channel')
    throw new Error('Discord posting is temporarily unavailable. We have been notified.')
  }

  const url = viaBot
    ? `https://discord.com/api/v10/channels/${target}/messages`
    : target

  const { body, headers } = await buildBody(content, mediaUrls)
  const res = await fetch(url, {
    method: 'POST',
    headers: viaBot ? { ...headers, Authorization: `Bot ${token}` } : headers,
    body,
  })

  // Webhooks answer 204 No Content; the bot endpoint returns the message.
  if (res.status === 204 || res.ok) {
    let messageId = `discord-${Date.now()}`
    if (viaBot) {
      try {
        const msg = await res.json()
        if (msg?.id) messageId = msg.id
      } catch { /* id is a nicety, not worth failing a sent post over */ }
      console.log(`[Discord] Published to channel ${target}`)
    } else {
      console.log(`[Discord] Published to webhook (${target.split('/').slice(-2, -1)[0]})`)
    }
    return messageId
  }

  // Parse error body for actionable message
  const errText = await res.text().catch(() => '')
  let errDetail = `HTTP ${res.status}`

  try {
    const errJson = JSON.parse(errText)
    errDetail = errJson.message || errDetail
  } catch {
    if (errText.length < 200) errDetail = errText || errDetail
  }

  console.error(`[Discord] ${viaBot ? 'Channel post' : 'Webhook'} failed (${res.status}):`, errText.slice(0, 500))

  if (res.status === 404) {
    throw new Error(viaBot
      ? 'That Discord channel no longer exists. Pick a different channel on the Accounts page.'
      : 'Discord webhook not found. It may have been deleted. Please update your destination configuration.')
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(viaBot
      ? 'SocialMate cannot post in that channel. Give the SocialMate bot permission to send messages there, or pick another channel.'
      : 'Discord webhook unauthorized. Please check the webhook URL and recreate it if needed.')
  }
  if (res.status === 429) {
    throw new Error('Discord rate limit hit. Please wait a few seconds and try again.')
  }

  throw new Error(`Discord post failed: ${errDetail}`)
}

import { getSupabaseAdmin } from '@/lib/supabase-admin'


const MAX_DISCORD_LENGTH = 2000

export async function publishToDiscord(
  userId: string,
  content: string,
  destinationId?: string
): Promise<string> {
  // Enforce 2000 character limit
  if (content.length > MAX_DISCORD_LENGTH) {
    throw new Error(`Post exceeds Discord's ${MAX_DISCORD_LENGTH} character limit (${content.length} chars). Please shorten your post.`)
  }

  // Get webhook URL from a specific destination or first saved one
  let webhookUrl: string | null = null

  if (destinationId) {
    const { data: dest } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('webhook_url, destination_id')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .single()
    webhookUrl = dest?.webhook_url || dest?.destination_id || null
  }

  // Fall back to first saved Discord destination for this user
  if (!webhookUrl) {
    const { data: dest } = await getSupabaseAdmin()
      .from('post_destinations')
      .select('webhook_url, destination_id')
      .eq('user_id', userId)
      .eq('platform', 'discord')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    webhookUrl = dest?.webhook_url || dest?.destination_id || null
  }

  if (!webhookUrl) {
    throw new Error(
      'No Discord webhook configured. Go to Accounts → Destinations to add a Discord webhook URL.'
    )
  }

  // Validate it looks like a Discord webhook URL
  if (!webhookUrl.includes('discord.com/api/webhooks/') && !webhookUrl.includes('discordapp.com/api/webhooks/')) {
    throw new Error('Invalid Discord webhook URL. Please check your destination configuration.')
  }

  const res = await fetch(webhookUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ content }),
  })

  // Discord returns 204 No Content on success
  if (res.status === 204 || res.ok) {
    // Discord doesn't return the message ID on webhook posts (204 No Content)
    const messageId = `discord-${Date.now()}`
    console.log(`[Discord] Published to webhook (${webhookUrl.split('/').slice(-2, -1)[0]})`)
    return messageId
  }

  // Parse error body for actionable message
  const errText = await res.text().catch(() => '')
  let errDetail = `HTTP ${res.status}`

  try {
    const errJson = JSON.parse(errText)
    errDetail = errJson.message || errDetail
  } catch {
    // Not JSON, use text snippet
    if (errText.length < 200) errDetail = errText || errDetail
  }

  console.error(`[Discord] Webhook failed (${res.status}):`, errText.slice(0, 500))

  if (res.status === 404) {
    throw new Error('Discord webhook not found. It may have been deleted. Please update your destination configuration.')
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error('Discord webhook unauthorized. Please check the webhook URL and recreate it if needed.')
  }
  if (res.status === 429) {
    throw new Error('Discord rate limit hit. Please wait a few seconds and try again.')
  }

  throw new Error(`Discord webhook failed: ${errDetail}`)
}

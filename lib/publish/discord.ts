import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function publishToDiscord(
  userId: string,
  content: string,
  destinationId?: string
): Promise<string> {
  // If a specific destination is provided, use its webhook URL
  let webhookUrl: string | null = null

  if (destinationId) {
    const { data: dest } = await supabaseAdmin
      .from('post_destinations')
      .select('webhook_url, destination_id')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .single()
    webhookUrl = dest?.webhook_url || dest?.destination_id || null
  }

  // Fall back to first saved Discord destination for this user
  if (!webhookUrl) {
    const { data: dest } = await supabaseAdmin
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
      'No Discord destination configured. Go to Accounts → Destinations to add a Discord webhook.'
    )
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error')
    throw new Error(`Discord webhook failed: ${err}`)
  }

  // Discord webhooks return 204 No Content on success
  // Return a timestamp-based ID since there's no message ID in the response
  return `discord-${Date.now()}`
}
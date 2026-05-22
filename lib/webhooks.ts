import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * Dispatches an outbound webhook to all active endpoints registered for this user + event.
 * Signed with HMAC-SHA256. Non-fatal — catches all errors so publish flow never breaks.
 */
export async function dispatchWebhook(userId: string, event: string, payload: object): Promise<void> {
  try {
    const db = getSupabaseAdmin()
    const { data: webhooks, error } = await db
      .from('user_webhooks')
      .select('id, url, secret, events')
      .eq('user_id', userId)
      .eq('active', true)
      .contains('events', [event])

    if (error) {
      console.warn('[webhooks] Failed to fetch webhooks:', error.message)
      return
    }

    if (!webhooks || webhooks.length === 0) return

    const body = JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString(),
    })

    await Promise.allSettled(
      webhooks.map(async (wh) => {
        try {
          const sig = createHmac('sha256', wh.secret)
            .update(body)
            .digest('hex')

          const res = await fetch(wh.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-SocialMate-Signature': `sha256=${sig}`,
              'X-SocialMate-Event': event,
            },
            body,
            // 10-second timeout — don't hold up the publish flow
            signal: AbortSignal.timeout(10_000),
          })

          if (!res.ok) {
            console.warn(`[webhooks] Endpoint ${wh.url} returned ${res.status} for event "${event}"`)
          }
        } catch (err) {
          console.warn(`[webhooks] Failed to deliver to ${wh.url}:`, (err as Error).message)
        }
      })
    )
  } catch (err) {
    // Top-level catch — webhooks must NEVER break the publish flow
    console.warn('[webhooks] dispatchWebhook fatal catch:', (err as Error).message)
  }
}

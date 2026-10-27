export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'
import { verifyTwitchMessage } from '@/lib/twitch-verify'
import { WAITING_NOTE } from '@/lib/live-alerts'
import { eventsubSecret } from '@/lib/twitch'

// Twitch EventSub webhook for go-live alerts.
//
// Twitch expects an answer within a few seconds, so a stream start is handed to
// the live-alert job (lib/inngest-live-alerts.ts) and acknowledged at once.
// Every message is checked against our signing secret first; anything that
// fails the check is refused without being read.
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const ok = verifyTwitchMessage(
    {
      id:        req.headers.get('twitch-eventsub-message-id'),
      timestamp: req.headers.get('twitch-eventsub-message-timestamp'),
      signature: req.headers.get('twitch-eventsub-message-signature'),
    },
    raw,
    eventsubSecret(),
    new Date(),
  )
  if (!ok) return new NextResponse('Invalid signature', { status: 403 })

  let body: {
    challenge?: string
    subscription?: { id?: string; type?: string; status?: string; condition?: { broadcaster_user_id?: string } }
    event?: { id?: string; broadcaster_user_id?: string; broadcaster_user_login?: string; broadcaster_user_name?: string; started_at?: string }
  }
  try { body = JSON.parse(raw) } catch { return new NextResponse('Bad body', { status: 400 }) }

  const type = req.headers.get('twitch-eventsub-message-type')

  // Twitch's check when a subscription is created: echo the challenge as plain
  // text. Reaching here proves Twitch can reach us and signs with our secret,
  // so the alerts on this channel stop showing "waiting".
  if (type === 'webhook_callback_verification' && body.challenge) {
    const broadcaster = body.subscription?.condition?.broadcaster_user_id
    if (broadcaster) {
      const { error } = await getSupabaseAdmin().from('live_alerts')
        .update({ last_error: null })
        .eq('twitch_user_id', broadcaster)
        .eq('last_error', WAITING_NOTE)
      if (error) console.warn('[twitch-eventsub] clearing waiting note failed:', error.message)
    }
    return new NextResponse(body.challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  // Twitch stopped the subscription (channel banned or deleted, too many failed deliveries).
  if (type === 'revocation' && body.subscription?.id) {
    const { error } = await getSupabaseAdmin().from('live_alerts')
      .update({
        eventsub_id: null,
        last_error:  `Twitch stopped sending updates for this channel (${body.subscription.status ?? 'revoked'}). Turn the alert off and on to try again.`,
        updated_at:  new Date().toISOString(),
      })
      .eq('eventsub_id', body.subscription.id)
    if (error) console.warn('[twitch-eventsub] revocation update failed:', error.message)
    return new NextResponse(null, { status: 204 })
  }

  if (type === 'notification' && body.subscription?.type === 'stream.online' && body.event?.broadcaster_user_id) {
    try {
      await inngest.send({
        name: 'live-alert/online',
        // Twitch can deliver the same message more than once; the stream id
        // makes the job's idempotency key, so a resend never posts twice.
        id:   `live-alert-${body.event.id ?? req.headers.get('twitch-eventsub-message-id')}`,
        data: {
          broadcasterId: body.event.broadcaster_user_id,
          login:         body.event.broadcaster_user_login ?? '',
          name:          body.event.broadcaster_user_name ?? '',
          streamId:      body.event.id ?? null,
          startedAt:     body.event.started_at ?? null,
        },
      })
    } catch (err) {
      console.error('[twitch-eventsub] could not queue the alert:', err instanceof Error ? err.message : err)
      // A non-2xx makes Twitch retry the delivery.
      return new NextResponse('Queue unavailable', { status: 503 })
    }
  }

  return new NextResponse(null, { status: 204 })
}

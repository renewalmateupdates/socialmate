import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { COOLDOWN_MINUTES, shouldAlert } from '@/lib/live-alerts'
import { postLiveAlert, type LiveAlertRow } from '@/lib/live-alert-run'
import { channelInfo } from '@/lib/twitch'

// A Twitch channel went live (sent by app/api/twitch/eventsub): post every
// alert that follows it.
//
// Each alert is claimed before it posts: the row is only updated if this
// stream has not alerted yet and the last alert is older than the cooldown, so
// a duplicate delivery or a quick restart can never post twice.
export const liveAlertFire = inngest.createFunction(
  { id: 'live-alert-fire', name: 'Go-Live Alert', retries: 2 },
  { event: 'live-alert/online' },
  async ({ event, step }) => {
    const { broadcasterId, login, name, streamId } = event.data as {
      broadcasterId: string; login: string; name: string; streamId: string | null
    }
    const stream = streamId || `start-${Date.now()}`

    const alerts = await step.run('find-alerts', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('live_alerts')
        .select('*')
        .eq('twitch_user_id', broadcasterId)
        .eq('enabled', true)
      if (error) throw new Error(`live alerts lookup failed: ${error.message}`)
      return (data ?? []) as LiveAlertRow[]
    })
    if (!alerts.length) return { posted: 0, reason: 'no alerts follow this channel' }

    const info = await step.run('channel-info', async () => channelInfo(broadcasterId))

    let posted = 0
    for (const alert of alerts) {
      const result = await step.run(`alert-${alert.id}`, async () => {
        const now = new Date()
        if (!shouldAlert(alert, stream, now)) return { posted: false, reason: 'already alerted for this stream' }

        const db = getSupabaseAdmin()
        const cutoff = new Date(now.getTime() - COOLDOWN_MINUTES * 60_000).toISOString()
        const { data: claimed, error: claimErr } = await db.from('live_alerts')
          .update({ last_stream_id: stream, last_alert_at: now.toISOString(), updated_at: now.toISOString() })
          .eq('id', alert.id)
          .or(`last_stream_id.is.null,last_stream_id.neq."${stream}"`)
          .or(`last_alert_at.is.null,last_alert_at.lt."${cutoff}"`)
          .select('id')
        if (claimErr) throw new Error(`claiming alert ${alert.id} failed: ${claimErr.message}`)
        if (!claimed?.length) return { posted: false, reason: 'claimed by another run' }

        const res = await postLiveAlert(db, alert, {
          name:  alert.twitch_name || name || login,
          title: info?.title ?? '',
          game:  info?.game ?? '',
          url:   `https://twitch.tv/${alert.twitch_login || login}`,
        }, async items => {
          await inngest.send(items.map(p => ({ name: 'post/scheduled', data: p })))
        }, { streamId: stream, test: false })

        const { error: noteErr } = await db.from('live_alerts')
          .update({ last_error: res.ok ? null : res.error })
          .eq('id', alert.id)
        if (noteErr) console.warn('[live-alerts] saving result failed:', noteErr.message)
        return { posted: res.ok, reason: res.ok ? null : res.error }
      })
      if (result.posted) posted++
    }
    return { posted, alerts: alerts.length }
  },
)

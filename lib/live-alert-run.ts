// Posting a go-live alert, and keeping each channel's Twitch subscription in
// step with the alerts that need it.
//
// The alert is an ordinary post in `posts`, scheduled for now, so it goes
// through the normal publish pipeline: per-platform results, retries, failure
// notices, and the monthly cap.

import type { SupabaseClient } from '@supabase/supabase-js'
import { PAID_ONLY_PLATFORMS } from './campaigns'
import { WAITING_NOTE, renderAlert, type AlertVars } from './live-alerts'
import { postLimitFor, postsUsedThisMonth } from './post-limits'
import { resolveWorkspacePlan } from './plan'
import { deleteSub, ensureStreamOnlineSub } from './twitch'

export interface LiveAlertRow {
  id:             string
  user_id:        string
  workspace_id:   string | null
  twitch_user_id: string
  twitch_login:   string
  twitch_name:    string
  platforms:      string[]
  template:       string
  enabled:        boolean
  eventsub_id:    string | null
  last_stream_id: string | null
  last_alert_at:  string | null
  last_error:     string | null
}

export type Enqueue = (items: { postId: string; scheduledAt: string }[]) => Promise<void>

export type PostResult = { ok: true; postId: string } | { ok: false; error: string }

export async function postLiveAlert(
  db: SupabaseClient,
  alert: LiveAlertRow,
  vars: AlertVars,
  enqueue: Enqueue,
  meta: { streamId: string | null; test: boolean },
): Promise<PostResult> {
  const plan = await resolveWorkspacePlan(db, alert.user_id, alert.workspace_id)
  // X is Pro and up; a plan that changed since the alert was made drops it.
  const platforms = alert.platforms.filter(p => plan !== 'free' || !PAID_ONLY_PLATFORMS.includes(p))
  if (!platforms.length) return { ok: false, error: 'None of this alert\'s platforms are on your plan.' }

  if (await postsUsedThisMonth(db, alert.user_id) >= postLimitFor(plan)) {
    return { ok: false, error: 'This month\'s post limit is used up, so the alert was not posted.' }
  }

  const now = new Date().toISOString()
  const { data: post, error } = await db.from('posts').insert({
    user_id:      alert.user_id,
    workspace_id: alert.workspace_id,
    content:      renderAlert(alert.template, vars),
    platforms,
    status:       'scheduled',
    scheduled_at: now,
    destinations: {},
    metadata: {
      source:    'live_alert',
      alert_id:  alert.id,
      stream_id: meta.streamId,
      test:      meta.test,
    },
  }).select('id').single()
  if (error || !post) {
    console.error('[live-alerts] post insert failed:', alert.id, error?.message)
    return { ok: false, error: 'Could not save the alert post.' }
  }

  try {
    await enqueue([{ postId: post.id, scheduledAt: now }])
  } catch (err) {
    console.error('[live-alerts] could not queue post:', err instanceof Error ? err.message : err)
  }
  return { ok: true, postId: post.id }
}

/**
 * Makes Twitch's subscription for a channel match its alerts: subscribed while
 * any alert on it is on, unsubscribed once none are. Every alert row for the
 * channel gets the subscription id (or loses it). `knownSubIds` carries the id
 * of an alert that was just deleted, whose row can no longer be read.
 */
export async function syncChannelSubscription(
  db: SupabaseClient,
  twitchUserId: string,
  knownSubIds: (string | null)[] = [],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: rows, error } = await db.from('live_alerts')
    .select('id, enabled, eventsub_id')
    .eq('twitch_user_id', twitchUserId)
  if (error) {
    console.warn('[live-alerts] channel lookup failed:', error.message)
    return { ok: false, error: 'Could not check this channel. Try again.' }
  }
  const alerts = rows ?? []
  const wanted = alerts.some(a => a.enabled)

  try {
    if (wanted) {
      const sub = await ensureStreamOnlineSub(twitchUserId)
      const { error: upErr } = await db.from('live_alerts')
        .update({ eventsub_id: sub.id, updated_at: new Date().toISOString() })
        .eq('twitch_user_id', twitchUserId)
      if (upErr) console.warn('[live-alerts] saving subscription id failed:', upErr.message)
      // A subscription Twitch already confirmed sends no new confirmation call,
      // so the waiting note is cleared here instead of by the webhook.
      if (!sub.fresh && sub.status === 'enabled') {
        const { error: noteErr } = await db.from('live_alerts')
          .update({ last_error: null })
          .eq('twitch_user_id', twitchUserId)
          .eq('last_error', WAITING_NOTE)
        if (noteErr) console.warn('[live-alerts] clearing waiting note failed:', noteErr.message)
      }
    } else {
      const ids = Array.from(new Set(alerts.map(a => a.eventsub_id).concat(knownSubIds).filter((x): x is string => !!x)))
      for (const id of ids) await deleteSub(id)
      if (alerts.length) {
        const { error: upErr } = await db.from('live_alerts')
          .update({ eventsub_id: null, updated_at: new Date().toISOString() })
          .eq('twitch_user_id', twitchUserId)
        if (upErr) console.warn('[live-alerts] clearing subscription id failed:', upErr.message)
      }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[live-alerts] Twitch subscription sync failed:', twitchUserId, message)
    return { ok: false, error: 'Twitch did not accept the alert right now. Try again in a minute.' }
  }
}

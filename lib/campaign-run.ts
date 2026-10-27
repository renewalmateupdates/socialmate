// Turns a campaign's next week into ordinary scheduled posts.
//
// Posts are made a week ahead rather than all at once, so a long campaign stays
// inside every plan's scheduling window and monthly post cap, and a change to
// the campaign takes effect within a week. Each post is a normal row in
// `posts`: Queue, Calendar, editing and the publish pipeline all just work, and
// deleting one post skips that one slot.
//
// Called when a campaign is created or resumed, and once a day by the
// campaign-top-up job (lib/inngest-campaigns.ts). Running it twice is safe:
// slots up to materialized_until are never made again, and a slot that already
// has a post is skipped even if two runs overlap.

import type { SupabaseClient } from '@supabase/supabase-js'
import { TOP_UP_DAYS, campaignSlots, localDayKey, pickContent, type CampaignMessage } from './campaigns'
import { postLimitFor, postsUsedThisMonth, scheduleWeeksFor } from './post-limits'
import { resolveWorkspacePlan } from './plan'

const DAY_MS = 86_400_000

export interface CampaignRow {
  id:                 string
  user_id:            string
  workspace_id:       string | null
  name:               string
  status:             'active' | 'paused' | 'ended'
  platforms:          string[]
  days:               number[]
  times:              string[]
  timezone:           string
  start_date:         string
  end_date:           string
  messages:           CampaignMessage[]
  materialized_until: string | null
  last_note:          string | null
}

export type Enqueue = (items: { postId: string; scheduledAt: string }[]) => Promise<void>

export interface TopUpResult { created: number; note: string | null; ended: boolean }

export async function topUpCampaign(db: SupabaseClient, campaign: CampaignRow, now: Date, enqueue: Enqueue): Promise<TopUpResult> {
  if (campaign.status !== 'active') return { created: 0, note: null, ended: false }

  const plan    = await resolveWorkspacePlan(db, campaign.user_id, campaign.workspace_id)
  const horizon = new Date(Math.min(now.getTime() + TOP_UP_DAYS * DAY_MS, now.getTime() + scheduleWeeksFor(plan) * 7 * DAY_MS))
  const doneTo  = campaign.materialized_until ? new Date(campaign.materialized_until) : null
  const after   = doneTo && doneTo > now ? doneTo : now

  // Past its last day with nothing left to make: the campaign is over.
  if (localDayKey(now, campaign.timezone) > campaign.end_date) {
    const { error } = await db.from('campaigns')
      .update({ status: 'ended', updated_at: now.toISOString() })
      .eq('id', campaign.id)
    if (error) console.warn('[campaigns] could not mark ended:', campaign.id, error.message)
    return { created: 0, note: null, ended: true }
  }

  let slots = campaignSlots(campaign, after, horizon)
  if (!slots.length) {
    await saveProgress(db, campaign.id, horizon, null, now)
    return { created: 0, note: null, ended: false }
  }

  // Overlapping runs must not double a slot.
  const { data: existing, error: existingErr } = await db.from('posts')
    .select('metadata')
    .eq('metadata->>campaign_id', campaign.id)
    .gt('scheduled_at', after.toISOString())
  if (existingErr) {
    console.warn('[campaigns] existing posts lookup failed:', existingErr.message)
    return { created: 0, note: null, ended: false }
  }
  const taken = new Set((existing ?? []).map(r => (r.metadata as { campaign_slot?: string } | null)?.campaign_slot).filter(Boolean))
  slots = slots.filter(s => !taken.has(s.at.toISOString()))

  // Campaign posts count toward the monthly cap like any other post.
  const room = postLimitFor(plan) - await postsUsedThisMonth(db, campaign.user_id)
  let note: string | null = null
  if (room < slots.length) {
    note = room <= 0
      ? 'No new posts right now: this month\'s post limit is used up. They pick back up when it resets.'
      : `Only ${room} of ${slots.length} posts this week fit in this month's post limit.`
    slots = slots.slice(0, Math.max(0, room))
  }
  if (!slots.length) {
    await saveProgress(db, campaign.id, null, note, now)
    return { created: 0, note, ended: false }
  }

  const rows = slots.map(s => {
    const pick = pickContent(campaign.messages, s.ordinal)
    return {
      user_id:      campaign.user_id,
      workspace_id: campaign.workspace_id,
      content:      pick.text,
      platforms:    campaign.platforms,
      status:       'scheduled',
      scheduled_at: s.at.toISOString(),
      destinations: {},
      ...(pick.imageUrl ? { media_urls: [pick.imageUrl] } : {}),
      metadata: {
        source:        'campaign',
        campaign_id:   campaign.id,
        campaign_slot: s.at.toISOString(),
        message_index: pick.messageIndex,
        variant_index: pick.variantIndex,
      },
    }
  })

  const { data: inserted, error: insertErr } = await db.from('posts').insert(rows).select('id, scheduled_at')
  if (insertErr) {
    console.error('[campaigns] insert failed:', campaign.id, insertErr.message)
    return { created: 0, note: 'Could not save this week\'s posts. The next daily run will try again.', ended: false }
  }
  const created = (inserted ?? []) as { id: string; scheduled_at: string }[]

  try {
    await enqueue(created.map(c => ({ postId: c.id, scheduledAt: c.scheduled_at })))
  } catch (err) {
    // Saved as scheduled, so the publish sweep still finds them, late.
    console.error('[campaigns] could not queue posts:', err instanceof Error ? err.message : err)
  }

  // A cap cut the week short: stop at the last post made, so the rest are
  // tried again tomorrow. Otherwise the whole window is done.
  const doneUntil = note ? slots[slots.length - 1].at : horizon
  await saveProgress(db, campaign.id, doneUntil, note, now)
  return { created: created.length, note, ended: false }
}

async function saveProgress(db: SupabaseClient, id: string, doneUntil: Date | null, note: string | null, now: Date) {
  const patch: Record<string, unknown> = { last_note: note, updated_at: now.toISOString() }
  if (doneUntil) patch.materialized_until = doneUntil.toISOString()
  const { error } = await db.from('campaigns').update(patch).eq('id', id)
  if (error) console.warn('[campaigns] could not save progress:', id, error.message)
}

/** Removes a campaign's posts that have not gone out yet. Used by pause and end. */
export async function removeUpcomingPosts(db: SupabaseClient, campaignId: string): Promise<number> {
  const { data, error } = await db.from('posts')
    .delete()
    .eq('metadata->>campaign_id', campaignId)
    .eq('status', 'scheduled')
    .select('id')
  if (error) {
    console.warn('[campaigns] removing upcoming posts failed:', campaignId, error.message)
    return 0
  }
  return data?.length ?? 0
}

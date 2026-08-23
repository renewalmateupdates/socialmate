import type { SupabaseClient } from '@supabase/supabase-js'

// One place to record "this thing was used", so the admin usage view has real
// data instead of guesses.
//
// usage_events has existed since April with 'ai_credit' named in its own schema
// comment, but nothing except the Twitch clip lookup ever wrote to it. The
// lesson is that per-caller analytics gets forgotten, so both writers now go
// through helpers: AI spend via lib/ai-credits.ts, agents via here.
//
// Every write is fire-and-forget. Analytics must never fail or slow the thing
// it is measuring — by the time we record, the work is already done.

export function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
): void {
  if (!userId) return
  void supabase
    .from('usage_events')
    .insert({ user_id: userId, event_type: eventType, metadata })
    .then(({ error }: { error: { message: string } | null }) => {
      if (error) console.warn(`[usage_events] ${eventType} insert failed (non-fatal):`, error.message)
    })
}

// An agent did a unit of work for one workspace.
//
// Recorded per workspace rather than once per cron tick, because usage_events
// requires a user_id and because "which of my users does this agent serve" is
// the question worth answering. An agent that never appears here is a candidate
// to cut.
export function recordAgentRun(
  supabase: SupabaseClient,
  userId: string,
  agent: string,
  metadata: Record<string, unknown> = {},
): void {
  recordUsage(supabase, userId, 'agent_run', { agent, ...metadata })
}

// A funnel step recorded from the server, where there is no browser to run
// lib/analytics.ts.
//
// Two call sites need this: the auth callback, which is the only place that
// knows an account is brand new, and the publish pipeline, which runs in
// Inngest long after the tab that scheduled the post has closed. Everything
// else should go through track() on the client so it reaches GA4 too.
//
// The `funnel_` prefix matches what /api/track writes, so /admin/funnel reads
// one consistent namespace regardless of which side recorded the step.
export function recordFunnel(
  supabase: SupabaseClient,
  userId: string,
  event: string,
  metadata: Record<string, unknown> = {},
): void {
  recordUsage(supabase, userId, `funnel_${event}`, metadata)
}

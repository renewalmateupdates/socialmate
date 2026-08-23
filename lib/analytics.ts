/**
 * Funnel instrumentation.
 *
 * Background, because this file exists for a specific reason: CLAUDE.md has
 * recorded since 19 May (PRs #385–388) that GA4 was "wired in" with events for
 * onboarding_complete, platform_connected, post_published, upgrade_clicked and
 * ai_tool_used. None of those five ever existed. A grep for `gtag('event'`
 * across the codebase returned nothing — the component mounted, configured a
 * property, and sent page views. That is the whole reason ten separate
 * questions about the funnel had the answer "no way to tell".
 *
 * So this is deliberately not a wrapper around Google Analytics. It writes to
 * two places at once:
 *
 *   1. GA4, for acquisition and anonymous traffic (a blog reader has no
 *      user_id, so the DB cannot hold their step).
 *   2. usage_events in Supabase, via /api/track, for anything a logged-in user
 *      does. That is the copy we own, can query from /admin/funnel, and cannot
 *      lose to an ad blocker — roughly a third of this audience runs one, and
 *      they are exactly the technical users the product attracts.
 *
 * Every write is fire-and-forget. Instrumentation must never fail, block or
 * slow the thing it is measuring.
 */

/**
 * The funnel, in order. Adding a step here is the only way to get it recorded:
 * /api/track validates against this same list, so a typo drops the event at the
 * server rather than writing a step nobody will ever think to query.
 */
export const FUNNEL_EVENTS = [
  // ── Anonymous — GA4 only, no user_id exists yet ──────────────────────────
  'signup_viewed',        // reached /signup
  'signup_started',       // typed into the form or clicked an OAuth button
  'blog_cta_clicked',     // clicked through from a blog post

  // ── Account created ──────────────────────────────────────────────────────
  'signup_completed',     // first successful sign-in on a new account

  // ── Onboarding ───────────────────────────────────────────────────────────
  'onboarding_started',
  'onboarding_step',      // { step: 1..5 }
  'onboarding_skipped',
  'onboarding_completed',

  // ── The wall: 62 of 74 accounts never got past this ──────────────────────
  'connect_screen_viewed',
  'connect_clicked',      // { platform } — intent
  'connect_succeeded',    // { platform } — outcome
  'connect_failed',       // { platform, reason } — the gap between the two

  // ── First value ──────────────────────────────────────────────────────────
  'compose_opened',
  'post_scheduled',       // { platforms, count }
  'post_published',       // { platforms, count }

  // ── Money ────────────────────────────────────────────────────────────────
  'upgrade_viewed',       // reached /pricing or the plan tab
  'upgrade_clicked',      // { plan }
  'checkout_started',     // { plan }

  'ai_tool_used',         // { tool }
] as const

export type FunnelEvent = typeof FUNNEL_EVENTS[number]

export type TrackParams = Record<string, string | number | boolean>

type GtagWindow = Window & {
  gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void
}

/**
 * Record one funnel step.
 *
 * Safe to call from anywhere in client code, including render paths and effects
 * that may run before analytics has loaded. Never throws, never awaits.
 */
export function track(event: FunnelEvent, params?: TrackParams): void {
  if (typeof window === 'undefined') return

  // ── GA4 ────────────────────────────────────────────────────────────────
  try {
    const w = window as GtagWindow
    w.gtag?.('event', event, params)
  } catch {
    // GA is optional and frequently blocked. Never let it break the first-party
    // write below, which is the copy that actually matters.
  }

  // ── First-party ────────────────────────────────────────────────────────
  // sendBeacon survives the page unload that follows most of these events —
  // connect_clicked is immediately followed by a redirect to an OAuth consent
  // screen, and a plain fetch would be cancelled in flight roughly every time.
  try {
    const body = JSON.stringify({ event, params: params ?? {} })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Nothing to do. A dropped analytics event is not worth a broken flow.
  }
}

/**
 * Fire a step once per browser, ever.
 *
 * For steps that would otherwise inflate on refresh — connect_screen_viewed
 * fires on every visit to /accounts, which tells you how often someone returns
 * but not how many people ever arrived. Both numbers are useful, so the
 * once-only variant records a separate `_first` suffix rather than replacing
 * the repeatable one.
 */
export function trackOnce(event: FunnelEvent, params?: TrackParams): void {
  if (typeof window === 'undefined') return
  const key = `sm_tracked_${event}`
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    // Private mode with storage disabled. Fall through and record it; a
    // duplicate is a better failure than a hole.
  }
  track(event, { ...params, first: true })
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizePlan, PLAN_POST_LIMITS } from './plan'

// Monthly post quota — the single source of truth for how many posts a plan
// gets, how the month is counted, and what we tell someone who runs out.
//
// This lived as a copy-pasted block in app/api/posts/create and
// app/api/posts/draft. Two copies of a limit is how one of them gets raised and
// the other silently keeps rejecting people, which is the same failure mode the
// AI credit logic had before it was centralised in lib/ai-credits.ts (PR #535).
//
// These numbers must match app/pricing/page.tsx. PR #542 corrected 34 public
// pages that had drifted from them.
export { PLAN_POST_LIMITS }

// How far ahead each plan may schedule.
export const PLAN_SCHEDULE_WEEKS: Record<string, number> = {
  free:   2,
  pro:    4,
  agency: 12,
}

// Every helper here normalises its own argument. Callers pass whatever is in
// user_settings.plan, which is the billing SKU ('pro_annual'), and these tables
// are keyed by tier. Normalising at the boundary rather than at each call site
// means a new caller cannot reintroduce the bug by forgetting — which is
// exactly what happened between PR #543 and #545.
export function postLimitFor(plan: string): number {
  return PLAN_POST_LIMITS[normalizePlan(plan)] ?? PLAN_POST_LIMITS.free
}

// How far ahead this plan may schedule, and the phrase for it. Derived from one
// table so the number enforced and the number quoted cannot disagree.
export function scheduleWeeksFor(plan: string): number {
  return PLAN_SCHEDULE_WEEKS[normalizePlan(plan)] ?? PLAN_SCHEDULE_WEEKS.free
}

export function scheduleWindowLabel(plan: string): string {
  const weeks = scheduleWeeksFor(plan)
  if (weeks <= 2)  return '2 weeks'
  if (weeks <= 4)  return '1 month'
  return `${Math.round(weeks / 4)} months`
}

// Start of the current calendar month, in server-local time. The quota resets
// here, so it is also what the "N of 100 this month" counter is measured from.
export function startOfCurrentMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

// Posts this user has created this calendar month.
//
// Counted on posts.created_at, which is safe as of PR #534 — that migration
// added DEFAULT now() to the column and backfilled the NULLs left by SOMA
// inserts. Before it, a NULL created_at silently escaped this filter and the
// quota undercounted.
// Statuses that consume quota. A draft is private, unpublished, and costs
// nothing to hold, so it does not count — someone who writes 100 drafts and
// publishes none should not be locked out of publishing. The quota exists to
// bound what actually goes out.
//
// pending_approval counts: it is queued work awaiting a yes, and letting it
// through free would make the approval queue a way around the cap.
const QUOTA_STATUSES = ['scheduled', 'published', 'partial', 'failed', 'pending_approval']

// Whether creating a post in this status should be gated by the quota. Kept
// beside QUOTA_STATUSES so the check and the count can never disagree — gating
// on one set while counting another is how a cap starts rejecting people for
// rows it never counted.
export function countsAgainstQuota(status: string): boolean {
  return QUOTA_STATUSES.includes(status)
}

export async function postsUsedThisMonth(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', QUOTA_STATUSES)
    .gte('created_at', startOfCurrentMonth().toISOString())
  return count ?? 0
}

// The line shown to someone who just hit the wall. Kept here so the message and
// the number it quotes can never disagree.
export function upgradeCopyFor(plan: string): string | null {
  const tier = normalizePlan(plan)
  if (tier === 'agency') return null
  return tier === 'free'
    ? `Upgrade to Pro for ${PLAN_POST_LIMITS.pro.toLocaleString()} posts/month`
    : `Upgrade to Agency for ${PLAN_POST_LIMITS.agency.toLocaleString()} posts/month`
}

// The 403 body returned when the quota is spent. `upgrade` is the part the UI
// is expected to act on rather than discard — hitting this wall is the moment a
// free user is most likely to convert, so it carries a real next step.
export function postLimitReachedBody(plan: string) {
  return {
    error:   'Monthly post limit reached',
    limit:   postLimitFor(plan),
    // Report the tier, not the billing SKU, so `plan` and `limit` always agree.
    plan:    normalizePlan(plan),
    upgrade: upgradeCopyFor(plan),
    // Where the UI should send them. Explicit so every caller sends the same
    // place and no screen has to invent its own upgrade route.
    upgradeHref: '/pricing',
  }
}

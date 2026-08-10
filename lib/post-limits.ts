import type { SupabaseClient } from '@supabase/supabase-js'

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
export const PLAN_POST_LIMITS: Record<string, number> = {
  free:   100,
  pro:    1000,
  agency: 5000,
}

// How far ahead each plan may schedule.
export const PLAN_SCHEDULE_WEEKS: Record<string, number> = {
  free:   2,
  pro:    4,
  agency: 12,
}

export function postLimitFor(plan: string): number {
  return PLAN_POST_LIMITS[plan] ?? PLAN_POST_LIMITS.free
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
export async function postsUsedThisMonth(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfCurrentMonth().toISOString())
  return count ?? 0
}

// The line shown to someone who just hit the wall. Kept here so the message and
// the number it quotes can never disagree.
export function upgradeCopyFor(plan: string): string | null {
  if (plan === 'agency') return null
  return plan === 'free'
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
    plan,
    upgrade: upgradeCopyFor(plan),
    // Where the UI should send them. Explicit so every caller sends the same
    // place and no screen has to invent its own upgrade route.
    upgradeHref: '/pricing',
  }
}

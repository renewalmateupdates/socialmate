// Plan-string normalisation for SERVER code.
//
// `user_settings.plan` / `workspaces.plan` store the billing SKU, not the tier:
// an annual Pro subscriber is 'pro_annual', not 'pro'. Every quota table in this
// codebase is keyed by tier, so looking one up with the raw string misses:
//
//   PLAN_CREDITS['pro_annual']   → undefined → ?? 50   → free-tier credits
//   TWITTER_QUOTA['pro_annual']  → undefined → ?? 0    → X blocked entirely
//   QUOTA['pro_annual']          → undefined          → no cap at all
//
// The first two fail closed and short the customer who paid a year up front.
// The third fails open and hands out uncapped third-party API calls. Both are
// the same missing normalisation.
//
// contexts/WorkspaceContext.tsx has had this helper since April 2026 (it was
// added when annual plans crashed the dashboard), but it lives in a 'use client'
// file, so no server route could reach it. This is that same mapping, importable
// from anywhere. Keep the two in step.
//
// Always normalise BEFORE indexing a plan-keyed table.

export type PlanTier = 'free' | 'pro' | 'agency'

export function normalizePlan(raw: string | null | undefined): PlanTier {
  if (raw === 'pro_annual')    return 'pro'
  if (raw === 'agency_annual') return 'agency'
  if (raw === 'pro' || raw === 'agency') return raw
  return 'free'
}

// ─── Plan-keyed limits ──────────────────────────────────────────────────────
//
// These live here, in a dependency-free module, because both the browser and
// server routes need them. contexts/WorkspaceContext.tsx is 'use client', so
// anything defined there is unreachable from an OAuth callback — which is
// exactly how the connected-account cap came to be enforced only in the
// accounts page UI while every callback wrote whatever it was handed.
//
// Add a limit here and import it. Do not re-declare one next to its consumer.

// Connected accounts allowed per platform, per workspace. Matches /pricing.
export const PLAN_ACCOUNTS_PER_PLATFORM: Record<PlanTier, number> = {
  free:   1,
  pro:    5,
  agency: 10,
}

// Monthly post quota. Also re-exported from lib/post-limits.ts, which owns the
// counting and the messaging built on top of it.
export const PLAN_POST_LIMITS: Record<PlanTier, number> = {
  free:   250,
  pro:    1000,
  agency: 5000,
}

export function accountsPerPlatformFor(plan: string | null | undefined): number {
  return PLAN_ACCOUNTS_PER_PLATFORM[normalizePlan(plan)]
}

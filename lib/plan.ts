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

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

// ─── Resolving the plan a workspace actually gets ───────────────────────────
//
// This codebase stores the plan in TWO places and they disagreed for months.
//
//   user_settings.plan   written by the Stripe webhook. The only thing that has
//                        ever been maintained automatically.
//   workspaces.plan      read by ~20 enforcement sites: the connected-account
//                        cap, the X quota, all eight agents, Smart Queue, SOMA,
//                        Creator monetization.
//
// Nothing ever wrote workspaces.plan. On 2026-08-29 it was NULL for 83 of 86
// rows; the only non-null values were set by hand in SQL. So every feature
// gated on it treated every customer as free — including the first paying
// subscriber, who bought Pro Annual and then hit the free-tier account cap four
// times in the following hour.
//
// The webhook now writes both. This helper is the safety net for when it
// doesn't: a workspace with no plan of its own inherits its owner's, which is
// also the correct product semantics — a client workspace is covered by the
// subscription of the person who owns it.
//
// Read the plan through this, not with a bare select on either table.

import type { SupabaseClient } from '@supabase/supabase-js'

export async function resolveWorkspacePlan(
  db: SupabaseClient,
  userId: string,
  workspaceId?: string | null,
): Promise<PlanTier> {
  // The workspace's own plan wins when it has one.
  if (workspaceId) {
    const { data, error } = await db
      .from('workspaces')
      .select('plan, owner_id')
      .eq('id', workspaceId)
      .maybeSingle()
    if (error) console.warn('[plan] workspace lookup failed:', error.message)
    if (data?.plan) return normalizePlan(data.plan as string)
    // Fall through to the owner's plan — prefer the workspace's real owner over
    // the caller's id, since an Agency seat may be acting inside someone
    // else's workspace.
    userId = (data?.owner_id as string) || userId
  } else {
    const { data, error } = await db
      .from('workspaces')
      .select('plan')
      .eq('owner_id', userId)
      .eq('is_personal', true)
      .maybeSingle()
    if (error) console.warn('[plan] personal workspace lookup failed:', error.message)
    if (data?.plan) return normalizePlan(data.plan as string)
  }

  const { data: settings, error: sErr } = await db
    .from('user_settings')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle()
  if (sErr) console.warn('[plan] user_settings lookup failed:', sErr.message)

  return normalizePlan(settings?.plan as string | null)
}

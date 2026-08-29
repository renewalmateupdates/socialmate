import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { normalizePlan, accountsPerPlatformFor, type PlanTier } from '@/lib/plan'

// Server-side enforcement of the connected-accounts-per-platform cap.
//
// The cap was previously enforced in exactly one place: a `platformAccounts
// .length >= accountsPerPlatform` check inside the click handler on
// app/accounts/page.tsx. Every OAuth callback wrote whatever it was handed.
//
// That is not a cap, it is a suggestion. It is bypassed by hitting the connect
// route directly, by a stale accounts page that hasn't refetched, and — this is
// how it actually happened — by a platform whose callback redirects somewhere
// other than /accounts, so the page never learns a connection was made. A free
// user connected two TikTok accounts two minutes apart on 26 Aug 2026 and the
// server accepted both.
//
// Anything that writes to connected_accounts calls this first.

export type SlotCheck =
  | { allowed: true }
  | { allowed: false; reason: 'plan_limit'; limit: number; plan: PlanTier }

/**
 * Whether `userId` may connect one MORE account on `platform`.
 *
 * `platformUserId` is the account being connected. If a row for it already
 * exists in this workspace the connection is a reconnect — a token refresh,
 * not a new slot — and is always allowed regardless of the cap. Without this,
 * anyone already at their limit could never repair an expired token, which is
 * a worse bug than the one being fixed.
 *
 * Workspace scoping matches the callbacks and the accounts page: a null
 * workspaceId means the personal workspace, and personal accounts are stored
 * with `workspace_id IS NULL`. The cap is per workspace, not per user, because
 * that is what /pricing sells — an Agency plan gets 10 per platform in each of
 * its client workspaces.
 */
export async function checkAccountSlot(
  userId: string,
  platform: string,
  workspaceId: string | null,
  platformUserId: string | null
): Promise<SlotCheck> {
  const db = getSupabaseAdmin()

  // Resolve the plan off the workspace that will own the row. Mirrors the
  // lookup in lib/publish/twitter.ts: a null workspaceId is the personal
  // workspace, which is found by owner + is_personal, not by id.
  let planRaw: string | null = null
  if (workspaceId) {
    const { data, error } = await db
      .from('workspaces')
      .select('plan')
      .eq('id', workspaceId)
      .maybeSingle()
    if (error) console.warn('[account-limits] workspace plan lookup failed:', error.message)
    planRaw = data?.plan ?? null
  } else {
    const { data, error } = await db
      .from('workspaces')
      .select('plan')
      .eq('owner_id', userId)
      .eq('is_personal', true)
      .maybeSingle()
    if (error) console.warn('[account-limits] personal plan lookup failed:', error.message)
    planRaw = data?.plan ?? null
  }

  const plan  = normalizePlan(planRaw)
  const limit = accountsPerPlatformFor(planRaw)

  let query = db
    .from('connected_accounts')
    .select('id, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', platform)

  query = workspaceId
    ? query.eq('workspace_id', workspaceId)
    : query.is('workspace_id', null)

  const { data: rows, error } = await query

  // Fail OPEN on a read error, deliberately. A transient Supabase blip should
  // not strand someone mid-OAuth with an error page they can do nothing about;
  // the worst case is one extra row, which the admin can see and remove. Fail
  // CLOSED would turn a database hiccup into "SocialMate won't let me connect".
  if (error) {
    console.warn('[account-limits] slot count failed, allowing connect:', error.message)
    return { allowed: true }
  }

  const existing = rows ?? []

  // Reconnect of an account already held here — no new slot consumed.
  if (platformUserId && existing.some(r => r.platform_user_id === platformUserId)) {
    return { allowed: true }
  }

  if (existing.length >= limit) {
    return { allowed: false, reason: 'plan_limit', limit, plan }
  }

  return { allowed: true }
}

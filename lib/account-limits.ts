import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { resolveWorkspacePlan, PLAN_ACCOUNTS_PER_PLATFORM, type PlanTier } from '@/lib/plan'

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

  // Resolve through lib/plan.ts, which falls back to user_settings.plan when
  // the workspace has none. This function read workspaces.plan directly when it
  // shipped, and workspaces.plan was NULL for 83 of 86 rows — so the first
  // paying subscriber bought Pro Annual and was refused their second Mastodon
  // account four times in the following hour by this exact check.
  const plan  = await resolveWorkspacePlan(db, userId, workspaceId)
  const limit = PLAN_ACCOUNTS_PER_PLATFORM[plan]

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

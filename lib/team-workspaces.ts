import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlanTier } from '@/lib/plan'

// team_members is scoped by OWNER, not by workspace -- it has no
// workspace_id column. A member belongs to an owner (matched by email, the
// only identifier every write to this table actually uses -- see
// /api/team/accept, /api/team/invite) and therefore has
// access to all of that owner's workspaces, at their assigned role.
//
// One fact, one place: this lookup used to be duplicated inline with a
// column that was never written (`member_id`, which doesn't exist on this
// table) in more than one route -- the exact "two places drift" pattern this
// project has been burned by repeatedly. Use this everywhere a caller's
// accessible workspaces need to include ones they were invited into, not
// just ones they own.
export async function getTeamOwnerRoles(
  admin: SupabaseClient,
  email: string,
): Promise<Map<string, string>> {
  const { data: memberships } = await admin
    .from('team_members')
    .select('owner_id, role')
    .eq('email', email)
    .eq('status', 'active')

  return new Map((memberships ?? []).map(m => [m.owner_id as string, m.role as string]))
}

// ─── Whose accounts a workspace posts to, and what a role may do there ──────
//
// Connected accounts and Discord/Telegram destinations belong to the person
// who connected them, which is the workspace owner. Every publisher looks them
// up by user_id, and every publish path used to pass the id of whoever WROTE
// the post. For an owner that is the same person. For a team member it is not:
// an editor's post went looking for the editor's own LinkedIn, found nothing,
// and failed with "No LinkedIn account connected" (reported 1 Nov 2026 by a
// free-plan owner whose only team member could not post to her LinkedIn).
//
// So every publish path resolves the account owner from the post's workspace
// here, and compose lists the same owner's accounts. One fact, one place.


export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'client'

const TEAM_ROLES: TeamRole[] = ['owner', 'admin', 'editor', 'viewer', 'client']

function toRole(raw: unknown): TeamRole {
  return TEAM_ROLES.includes(raw as TeamRole) ? (raw as TeamRole) : 'viewer'
}

// WorkspaceContext falls back to this id when it can see no workspaces at all.
// It is never a real row; treat it as "the caller's personal workspace".
export function realWorkspaceId(id: string | null | undefined): string | null {
  return id && id !== 'personal' ? id : null
}

export type AccountScope = {
  // The user_id the connected_accounts / post_destinations rows live under.
  ownerId: string
  // connected_accounts.workspace_id to match: null for a personal workspace.
  accountWorkspaceId: string | null
}

export async function accountScopeFor(
  admin: SupabaseClient,
  workspaceId: string | null | undefined,
  fallbackUserId: string,
): Promise<AccountScope> {
  const wsId = realWorkspaceId(workspaceId)
  if (!wsId) return { ownerId: fallbackUserId, accountWorkspaceId: null }

  const { data, error } = await admin
    .from('workspaces')
    .select('owner_id, is_personal')
    .eq('id', wsId)
    .maybeSingle()
  if (error) console.warn('[account-scope] workspace lookup failed:', error.message)

  // Unknown workspace: keep the old behaviour (author's accounts, scoped to
  // the id we were given) rather than guess at someone else's.
  if (!data) return { ownerId: fallbackUserId, accountWorkspaceId: wsId }

  return {
    ownerId:            (data.owner_id as string) || fallbackUserId,
    accountWorkspaceId: data.is_personal ? null : wsId,
  }
}

export type WorkspaceAccess = AccountScope & {
  workspaceId: string
  isPersonal: boolean
  role: TeamRole
}

// The caller's access to a workspace: their role there, and whose accounts it
// posts to. null when they have none (not the owner, no active membership).
export async function resolveWorkspaceAccess(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  workspaceId: string,
): Promise<WorkspaceAccess | null> {
  const { data: ws, error } = await admin
    .from('workspaces')
    .select('id, owner_id, is_personal')
    .eq('id', workspaceId)
    .maybeSingle()
  if (error) console.warn('[workspace-access] workspace lookup failed:', error.message)
  if (!ws) return null

  const base = {
    workspaceId:        ws.id as string,
    ownerId:            ws.owner_id as string,
    isPersonal:         !!ws.is_personal,
    accountWorkspaceId: ws.is_personal ? null : (ws.id as string),
  }
  if (ws.owner_id === user.id) return { ...base, role: 'owner' }
  if (!user.email) return null

  const { data: membership, error: mErr } = await admin
    .from('team_members')
    .select('role')
    .eq('email', user.email)
    .eq('owner_id', ws.owner_id)
    .eq('status', 'active')
    .maybeSingle()
  if (mErr) console.warn('[workspace-access] membership lookup failed:', mErr.message)
  if (!membership) return null

  return { ...base, role: toRole(membership.role) }
}

// Viewers are "can view posts and analytics" on /team. Now that a team
// member's post really does reach the owner's accounts, that has to be
// enforced, not just described.
export function canCreatePosts(role: TeamRole): boolean {
  return role !== 'viewer'
}

// Editors and clients send posts to the owner for approval, but only where the
// owner can open the approval queue: /approvals is a paid feature. On Free the
// queue was a dead end the owner could never see, so an editor there could not
// post at all. /team describes an editor as "can create and schedule posts",
// and on Free that is what they do.
export function requiresApproval(role: TeamRole, plan: PlanTier): boolean {
  return (role === 'editor' || role === 'client') && plan !== 'free'
}

import type { SupabaseClient } from '@supabase/supabase-js'

// team_members is scoped by OWNER, not by workspace -- it has no
// workspace_id column. A member belongs to an owner (matched by email, the
// only identifier every write to this table actually uses -- see
// /api/team/accept, /api/team/my-role, /api/team/invite) and therefore has
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

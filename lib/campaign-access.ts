// Which workspace a campaign belongs to, and whether this person may run one there.
//
// A campaign publishes on its own for weeks, so it is limited to the people who
// can publish without approval: the workspace owner and team admins. Editors
// and clients submit posts for approval, and a campaign has no approval step.

import type { SupabaseClient } from '@supabase/supabase-js'

export type CampaignWorkspace =
  | { ok: true; workspaceId: string }
  | { ok: false; status: number; error: string }

export async function campaignWorkspace(
  db: SupabaseClient,
  user: { id: string; email?: string | null },
  requested: unknown,
): Promise<CampaignWorkspace> {
  if (typeof requested === 'string' && requested) {
    const { data: ws, error } = await db.from('workspaces').select('id, owner_id').eq('id', requested).maybeSingle()
    if (error) console.warn('[campaigns] workspace lookup failed:', error.message)
    if (!ws) return { ok: false, status: 404, error: 'That workspace was not found.' }
    if (ws.owner_id === user.id) return { ok: true, workspaceId: ws.id }

    const { data: member, error: memberErr } = await db.from('team_members')
      .select('role')
      .eq('email', user.email ?? '')
      .eq('owner_id', ws.owner_id)
      .eq('status', 'active')
      .maybeSingle()
    if (memberErr) console.warn('[campaigns] team lookup failed:', memberErr.message)
    if (!member) return { ok: false, status: 403, error: "You don't have access to this workspace." }
    if (member.role !== 'admin') return { ok: false, status: 403, error: 'Only the workspace owner or an admin can run campaigns.' }
    return { ok: true, workspaceId: ws.id }
  }

  const { data: personal, error } = await db.from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()
  if (error) console.warn('[campaigns] personal workspace lookup failed:', error.message)
  if (!personal) return { ok: false, status: 400, error: 'Open the dashboard once so your workspace is set up, then try again.' }
  return { ok: true, workspaceId: personal.id }
}

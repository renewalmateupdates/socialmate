export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getTeamOwnerRoles } from '@/lib/team-workspaces'

/**
 * GET /api/workspaces/accessible
 *
 * Every workspace the current user can actually use: the ones they own,
 * plus -- if they're an active team member for another owner -- all of
 * that owner's workspaces too, at the role they were invited as.
 *
 * WorkspaceContext previously only ever fetched `workspaces` where
 * `owner_id = user.id`, a plain client-side query. An invited Editor/
 * Viewer/Client role could accept an invite, land in the app, and never
 * see the owner's workspace anywhere -- team_members has no workspace_id
 * (membership is owner-wide, not per-workspace), so there was no way for
 * the client to even know which workspace to ask for, and RLS on
 * `workspaces` means a bare client query for someone else's row returns
 * nothing anyway. This route runs server-side with the admin client,
 * verifies the caller's membership itself, and returns the combined list.
 */
export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  const { data: ownWorkspaces, error: ownErr } = await admin
    .from('workspaces')
    .select('id, name, is_personal, client_name, owner_id')
    .eq('owner_id', user.id)
  if (ownErr) console.warn('[workspaces/accessible] own workspace lookup failed:', ownErr.message)

  const roleByOwner = user.email ? await getTeamOwnerRoles(admin, user.email) : new Map<string, string>()
  const ownerIds = Array.from(roleByOwner.keys())

  let memberWorkspaces: { id: string; name: string; is_personal: boolean; client_name: string | null; owner_id: string }[] = []
  if (ownerIds.length > 0) {
    const { data, error } = await admin
      .from('workspaces')
      .select('id, name, is_personal, client_name, owner_id')
      .in('owner_id', ownerIds)
    if (error) console.warn('[workspaces/accessible] member workspace lookup failed:', error.message)
    memberWorkspaces = data ?? []
  }

  const workspaces = [
    ...(ownWorkspaces ?? []).map(w => ({ ...w, role: 'owner' as const })),
    ...memberWorkspaces.map(w => ({ ...w, role: roleByOwner.get(w.owner_id) ?? 'viewer' })),
  ]

  return NextResponse.json({ workspaces })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * GET /api/workspace/activity
 * Returns the last 50 activity events for the current workspace.
 * Auth-gated — must be a workspace member or owner.
 */
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Resolve the user's active workspace — personal workspace first, then membership
  const { data: personalWs } = await admin
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()

  // Also look up workspaces where the user is a member (agency editors, etc.).
  //
  // This read `workspace_members`, which NOTHING writes. Every membership path —
  // team/invite, team/accept, team/remove, team/[id], user/delete — reads and
  // writes `team_members`. So this lookup has always returned nothing and an
  // invited editor has only ever seen their own personal workspace's activity.
  // Both tables are empty today because nobody has invited a teammate yet, which
  // is the only reason it has not been noticed; it would have surfaced as soon as
  // the first Agency customer added a seat.
  //
  // team_members is scoped by OWNER, not by workspace — it has no workspace_id.
  // The model is that a member belongs to an owner and therefore to all of that
  // owner's workspaces, so resolve owners first and then their workspaces.
  const { data: memberships, error: memberErr } = await admin
    .from('team_members')
    .select('owner_id')
    .eq('member_id', user.id)
    .eq('status', 'active')
  if (memberErr) console.warn('[workspace/activity] membership lookup failed:', memberErr.message)

  const ownerIds = Array.from(new Set((memberships ?? []).map(m => m.owner_id).filter(Boolean)))

  let memberWorkspaceIds: string[] = []
  if (ownerIds.length > 0) {
    const { data: ownerWs, error: wsErr } = await admin
      .from('workspaces')
      .select('id')
      .in('owner_id', ownerIds)
    if (wsErr) console.warn('[workspace/activity] owner workspace lookup failed:', wsErr.message)
    memberWorkspaceIds = (ownerWs ?? []).map(w => w.id)
  }

  const workspaceIds: string[] = []
  if (personalWs?.id) workspaceIds.push(personalWs.id)
  for (const id of memberWorkspaceIds) {
    if (!workspaceIds.includes(id)) workspaceIds.push(id)
  }

  if (workspaceIds.length === 0) {
    return NextResponse.json({ events: [] })
  }

  const { data: events, error } = await admin
    .from('workspace_activity')
    .select('id, workspace_id, user_id, actor_email, action, entity_type, entity_id, metadata, created_at')
    .in('workspace_id', workspaceIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events: events ?? [] })
}

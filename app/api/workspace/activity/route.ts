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

  // Also look up workspaces where the user is a member (agency editors, etc.)
  const { data: memberRows } = await admin
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)

  const workspaceIds: string[] = []
  if (personalWs?.id) workspaceIds.push(personalWs.id)
  if (memberRows) {
    for (const row of memberRows) {
      if (!workspaceIds.includes(row.workspace_id)) {
        workspaceIds.push(row.workspace_id)
      }
    }
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

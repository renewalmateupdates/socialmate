export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { logActivity } from '@/lib/workspace-activity'

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memberId    = req.nextUrl.searchParams.get('id')
  const memberEmail = req.nextUrl.searchParams.get('email')
  if (!memberId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const admin = getSupabaseAdmin()

  // Verify the member belongs to this owner
  const { data: member } = await admin
    .from('team_members')
    .select('id, email, role, owner_id')
    .eq('id', memberId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  const { error } = await admin
    .from('team_members')
    .delete()
    .eq('id', memberId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log to workspace activity (non-fatal)
  try {
    const { data: ws } = await admin
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()
    if (ws?.id) {
      await logActivity({
        workspace_id: ws.id,
        user_id:      user.id,
        action:       'member.removed',
        entity_type:  'team_member',
        entity_id:    memberId,
        metadata:     { email: member.email, role: member.role },
      })
    }
  } catch {}

  return NextResponse.json({ ok: true })
}

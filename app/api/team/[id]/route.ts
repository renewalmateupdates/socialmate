export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { logActivity } from '@/lib/workspace-activity'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the member to confirm ownership and capture email/role for logging
  const { data: member, error: fetchError } = await getSupabaseAdmin()
    .from('team_members')
    .select('id, email, role, owner_id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const { error: deleteError } = await getSupabaseAdmin()
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }

  // Log activity (non-fatal)
  Promise.resolve(
    getSupabaseAdmin()
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()
  ).then(({ data: ws }) => {
    if (ws?.id) {
      logActivity({
        workspace_id: ws.id,
        user_id:      user.id,
        action:       'member.removed',
        entity_type:  'team_member',
        entity_id:    id,
        metadata:     { email: member.email, role: member.role },
      })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true })
}

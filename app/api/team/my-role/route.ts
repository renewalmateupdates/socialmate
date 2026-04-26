export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

/**
 * GET /api/team/my-role
 * Returns the current user's role in any workspace where they are a team member.
 * If the user is the workspace owner: role = 'owner'
 * If the user is a team member: role = their assigned role
 * If not a team member in any workspace: role = 'owner' (solo user)
 */
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Check if this user is a team member of someone else's workspace
  const { data: membership } = await admin
    .from('team_members')
    .select('role, owner_id, status')
    .eq('email', user.email!)
    .eq('status', 'active')
    .maybeSingle()

  if (membership) {
    return NextResponse.json({
      role:     membership.role,
      owner_id: membership.owner_id,
      is_team_member: true,
    })
  }

  // No membership record — user is a standalone owner
  return NextResponse.json({
    role:           'owner',
    owner_id:       user.id,
    is_team_member: false,
  })
}

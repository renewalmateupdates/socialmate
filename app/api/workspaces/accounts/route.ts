export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { resolveWorkspacePlan } from '@/lib/plan'
import {
  canCreatePosts, realWorkspaceId, requiresApproval, resolveWorkspaceAccess, type TeamRole,
} from '@/lib/team-workspaces'

/**
 * GET /api/workspaces/accounts?workspaceId=<id>
 *
 * What compose can post to in this workspace: the owner's connected accounts
 * and Discord/Telegram destinations, plus the caller's role there.
 *
 * Compose used to read connected_accounts straight from the browser with
 * `user_id = me`. For an owner that is right. For a team member it listed
 * their own accounts (usually none) instead of the owner's, and RLS would hide
 * the owner's rows from a browser query anyway. This runs server-side, checks
 * the caller's access, and answers for the account owner.
 *
 * Never returns tokens: id, platform and display name only.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()
  const requested = realWorkspaceId(request.nextUrl.searchParams.get('workspaceId'))

  let ownerId = user.id
  let accountWorkspaceId: string | null = null
  let role: TeamRole = 'owner'

  if (requested) {
    const access = await resolveWorkspaceAccess(admin, user, requested)
    if (!access) {
      return NextResponse.json({ error: "You don't have access to this workspace." }, { status: 403 })
    }
    ownerId = access.ownerId
    accountWorkspaceId = access.accountWorkspaceId
    role = access.role
  }

  let accountsQuery = admin
    .from('connected_accounts')
    .select('id, platform, account_name, platform_user_id')
    .eq('user_id', ownerId)
  accountsQuery = accountWorkspaceId
    ? accountsQuery.eq('workspace_id', accountWorkspaceId)
    : accountsQuery.is('workspace_id', null)

  let destQuery = admin
    .from('post_destinations')
    .select('id, platform, label')
    .eq('user_id', ownerId)
    .order('created_at', { ascending: true })
  destQuery = accountWorkspaceId
    ? destQuery.eq('workspace_id', accountWorkspaceId)
    : destQuery.is('workspace_id', null)

  const [accountsRes, destRes, plan] = await Promise.all([
    accountsQuery,
    destQuery,
    resolveWorkspacePlan(admin, user.id, requested),
  ])
  if (accountsRes.error) console.warn('[workspaces/accounts] accounts lookup failed:', accountsRes.error.message)
  if (destRes.error) console.warn('[workspaces/accounts] destinations lookup failed:', destRes.error.message)

  return NextResponse.json({
    role,
    isShared:         ownerId !== user.id,
    canPost:          canCreatePosts(role),
    requiresApproval: requiresApproval(role, plan),
    accounts:         accountsRes.data ?? [],
    destinations:     destRes.data ?? [],
  })
}

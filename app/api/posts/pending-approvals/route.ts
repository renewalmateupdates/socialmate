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
 * GET /api/posts/pending-approvals
 * Returns posts with status = 'pending_approval' that belong to workspaces
 * owned by the current user, or workspaces where the current user is an admin.
 * Also returns the count for sidebar badge usage.
 *
 * ?include_history=1 — also returns approved/rejected posts (for the approvals page history tabs)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeHistory = searchParams.get('include_history') === '1'

  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Get all workspace IDs this user owns
  const { data: ownedWorkspaces } = await admin
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)

  const ownedIds = (ownedWorkspaces ?? []).map((w: any) => w.id)

  if (ownedIds.length === 0) {
    return NextResponse.json({ posts: [], count: 0 })
  }

  let query = admin
    .from('posts')
    .select('id, content, platforms, created_at, status, approval_status, rejection_reason, user_id, workspace_id, submitted_by_email, scheduled_at')
    .in('workspace_id', ownedIds)
    .order('created_at', { ascending: false })

  if (includeHistory) {
    // Return pending + approved + rejected (anything with an approval_status)
    query = query.not('approval_status', 'is', null)
  } else {
    query = query.eq('status', 'pending_approval')
  }

  const { data: posts, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with submitter email if not already stored
  const enriched = await Promise.all((posts ?? []).map(async (post: any) => {
    if (post.submitted_by_email) return post
    // Look up the email from auth
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(post.user_id)
      return { ...post, submitted_by_email: authUser?.user?.email ?? null }
    } catch {
      return post
    }
  }))

  return NextResponse.json({ posts: enriched, count: enriched.length })
}

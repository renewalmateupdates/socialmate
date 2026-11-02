export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publishToAll } from '@/lib/publish'
import { accountScopeFor, canManagePost } from '@/lib/team-workspaces'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth check via cookie session
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the post
  const { data: post, error: fetchError } = await getSupabaseAdmin()
    .from('posts')
    .select('id, user_id, platforms, platform_post_ids, content, scheduled_at, destinations, workspace_id')
    .eq('id', id)
    .single()

  if (fetchError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  // The author, or the workspace's owner or an admin, may retry it.
  if (!(await canManagePost(getSupabaseAdmin(), user, post))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Determine failed platforms: those where platform_post_ids has no entry
  const existingPostIds: Record<string, string> = post.platform_post_ids ?? {}
  const failedPlatforms: string[] = (post.platforms ?? []).filter(
    (p: string) => !existingPostIds[p]
  )

  if (failedPlatforms.length === 0) {
    return NextResponse.json({ error: 'No failed platforms to retry' }, { status: 400 })
  }

  // The workspace owner's accounts, not necessarily the author's (see
  // lib/team-workspaces.ts). Personal accounts have workspace_id = null.
  const { ownerId: accountOwnerId, accountWorkspaceId } =
    await accountScopeFor(getSupabaseAdmin(), post.workspace_id, user.id)

  const destinations: Record<string, string> = post.destinations ?? {}

  // Retry only the failed platforms
  const results = await publishToAll(
    accountOwnerId,
    failedPlatforms,
    post.content,
    destinations,
    accountWorkspaceId,
    {}
  )

  // Merge new successes into existing platform_post_ids
  const newPostIds = { ...existingPostIds }
  results.forEach(r => {
    if (r.success && r.postId) newPostIds[r.platform] = r.postId
  })

  // Determine new overall status
  const allPlatforms: string[] = post.platforms ?? []
  const allSucceeded = allPlatforms.every((p: string) => !!newPostIds[p])
  const anySucceeded = allPlatforms.some((p: string) => !!newPostIds[p])
  const newStatus = allSucceeded ? 'published' : anySucceeded ? 'partial' : 'failed'

  const updatePayload: Record<string, unknown> = {
    platform_post_ids: newPostIds,
    status: newStatus,
  }
  if (newStatus === 'published') {
    updatePayload.published_at = new Date().toISOString()
  }

  const { error: updateError } = await getSupabaseAdmin()
    .from('posts')
    .update(updatePayload)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ status: newStatus, results })
}

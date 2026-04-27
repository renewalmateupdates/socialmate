export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'
import { logActivity } from '@/lib/workspace-activity'

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
 * PATCH /api/posts/[id]/approve
 * Approves a pending_approval post.
 * Caller must be the workspace owner.
 * - If post has scheduled_at: sets status = 'scheduled', fires Inngest post/scheduled
 * - If no scheduled_at: sets status = 'draft' (owner can publish manually)
 * Sends in-app notification to post submitter.
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Fetch the post
  const { data: post, error: fetchError } = await admin
    .from('posts')
    .select('id, user_id, workspace_id, content, platforms, status, scheduled_at')
    .eq('id', id)
    .single()

  if (fetchError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (post.status !== 'pending_approval') {
    return NextResponse.json({ error: 'Post is not pending approval' }, { status: 400 })
  }

  // Verify caller is the workspace owner
  const { data: workspace } = await admin
    .from('workspaces')
    .select('owner_id')
    .eq('id', post.workspace_id)
    .single()

  if (!workspace || workspace.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden — only workspace owners can approve posts' }, { status: 403 })
  }

  // Determine new status
  const newStatus = post.scheduled_at ? 'scheduled' : 'draft'

  const { error: updateError } = await admin
    .from('posts')
    .update({ status: newStatus, approval_status: 'approved' })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Fire Inngest if now scheduled
  if (newStatus === 'scheduled' && post.scheduled_at) {
    try {
      await inngest.send({ name: 'post/scheduled', data: { postId: post.id, scheduledAt: post.scheduled_at } })
    } catch (err) {
      console.error('[approve] Failed to send post/scheduled event:', err)
    }
  }

  // Notify the submitter in-app
  if (post.user_id !== user.id) {
    try {
      const preview = (post.content || '').substring(0, 80) + ((post.content || '').length > 80 ? '...' : '')
      await admin.from('notifications').insert({
        user_id:    post.user_id,
        type:       'post_approved',
        title:      'Post approved ✓',
        message:    `Your post was approved and ${newStatus === 'scheduled' ? 'scheduled' : 'moved to drafts'}: "${preview}"`,
        is_read:    false,
        data:       { action_url: newStatus === 'scheduled' ? '/queue' : '/drafts', post_id: post.id },
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[approve] Failed to insert notification:', err)
    }
  }

  // Log to workspace activity feed
  await logActivity({
    workspace_id: post.workspace_id,
    user_id:      user.id,
    action:       'post.approved',
    entity_type:  'post',
    entity_id:    post.id,
    metadata:     { platforms: post.platforms, new_status: newStatus },
  })

  return NextResponse.json({ success: true, status: newStatus })
}

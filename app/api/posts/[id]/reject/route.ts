export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
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
 * PATCH /api/posts/[id]/reject
 * Rejects a pending_approval post.
 * Caller must be the workspace owner.
 * Sets status = 'draft' so the submitter can edit and resubmit.
 * Optional body: { reason?: string }
 * Sends in-app notification to post submitter with rejection reason.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const reason: string | undefined = body?.reason?.trim() || undefined

  const admin = getSupabaseAdmin()

  // Fetch the post
  const { data: post, error: fetchError } = await admin
    .from('posts')
    .select('id, user_id, workspace_id, content, status')
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
    return NextResponse.json({ error: 'Forbidden — only workspace owners can reject posts' }, { status: 403 })
  }

  const { error: updateError } = await admin
    .from('posts')
    .update({
      status:           'draft',
      approval_status:  'rejected',
      rejection_reason: reason ?? null,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Notify the submitter in-app
  if (post.user_id !== user.id) {
    try {
      const preview = (post.content || '').substring(0, 80) + ((post.content || '').length > 80 ? '...' : '')
      const message = reason
        ? `Post returned for edits: "${preview}" — Reason: ${reason}`
        : `Post returned for edits: "${preview}"`
      await admin.from('notifications').insert({
        user_id:    post.user_id,
        type:       'post_rejected',
        title:      'Post returned for edits',
        message,
        is_read:    false,
        data:       { action_url: '/drafts', post_id: post.id },
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[reject] Failed to insert notification:', err)
    }
  }

  return NextResponse.json({ success: true })
}

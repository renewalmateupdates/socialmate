export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { postLimitFor, postsUsedThisMonth, postLimitReachedBody, countsAgainstQuota } from '@/lib/post-limits'
import { resolveWorkspacePlan } from '@/lib/plan'
import { recordFunnel } from '@/lib/usage'
import { canCreatePosts, canManagePost, realWorkspaceId, resolveWorkspaceAccess } from '@/lib/team-workspaces'


export async function POST(request: NextRequest) {
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

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { content, platforms, postId, status: requestedStatus, scheduledAt, tags, poll_data, mediaUrls } = body
    const workspaceId = realWorkspaceId(body.workspaceId)
    const media: string[] = Array.isArray(mediaUrls) ? mediaUrls.filter((u: unknown) => typeof u === 'string') : []

    // Only allow 'draft' or 'pending_approval' as valid statuses via this route
    const allowedStatuses = ['draft', 'pending_approval']
    const insertStatus = allowedStatuses.includes(requestedStatus) ? requestedStatus : 'draft'

    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    if (postId) {
      const updateData: Record<string, unknown> = {
        content,
        platforms,
        updated_at: new Date().toISOString(),
        tags: Array.isArray(tags) && tags.length > 0 ? tags : null,
        poll_data: poll_data || null,
      }
      if (insertStatus === 'pending_approval') {
        updateData.status = 'pending_approval'
        updateData.approval_status = 'pending'
        if (scheduledAt) updateData.scheduled_at = scheduledAt
        if (media.length > 0) updateData.media_urls = media
      }
      // The author edits through RLS as before. The workspace owner or an admin
      // may also save a teammate's draft (Compose opens those now); RLS only
      // lets authors write their own rows, so that path checks canManagePost
      // and writes with the service role.
      const admin = getSupabaseAdmin()
      const { data: existing, error: lookupErr } = await admin
        .from('posts')
        .select('id, user_id, workspace_id')
        .eq('id', postId)
        .maybeSingle()
      if (lookupErr) console.warn('[draft] post lookup failed:', lookupErr.message)
      if (!existing) return NextResponse.json({ error: 'That draft no longer exists.' }, { status: 404 })
      const isAuthor = existing.user_id === user.id
      if (!isAuthor && !(await canManagePost(admin, user, existing))) {
        return NextResponse.json({ error: 'You can’t edit this draft.' }, { status: 403 })
      }
      const { data: updated, error } = await (isAuthor ? supabase : admin)
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .in('status', ['draft', 'pending_approval'])
        .select('id')
      if (error) {
        console.error('Draft update error:', error)
        return NextResponse.json({ error: 'Failed to update draft', detail: error.message }, { status: 500 })
      }
      // Zero rows means it was sent or scheduled in the meantime. Saying "saved"
      // there would lose the edit without a word.
      if (!updated?.length) {
        return NextResponse.json({ error: 'This post is no longer a draft, so the change was not saved.' }, { status: 409 })
      }

      // Notify workspace owner when submitting an existing post for approval (non-fatal)
      if (insertStatus === 'pending_approval') {
        try {
          const admin = getSupabaseAdmin()
          const { data: postRow } = await admin
            .from('posts')
            .select('workspace_id')
            .eq('id', postId)
            .single()
          if (postRow?.workspace_id) {
            const { data: ws } = await admin
              .from('workspaces')
              .select('owner_id')
              .eq('id', postRow.workspace_id)
              .single()
            if (ws?.owner_id && ws.owner_id !== user.id) {
              await admin.from('notifications').insert({
                user_id: ws.owner_id,
                type:    'approval_requested',
                title:   'Post pending approval',
                message: 'A team member submitted a post for your review.',
                data:    { post_id: postId, workspace_id: postRow.workspace_id },
                is_read: false,
              })
            }
          }
        } catch (e) {
          console.warn('[draft] approval notification failed (non-fatal):', e)
        }
      }

      return NextResponse.json({ success: true, postId })
    }

    // Use admin client to bypass RLS for workspace lookup
    let resolvedWorkspaceId = workspaceId
    if (!resolvedWorkspaceId) {
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: personalWs } = await adminSupabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .eq('is_personal', true)
        .single()

      if (personalWs) {
        resolvedWorkspaceId = personalWs.id
      } else {
        const { data: newWs, error: wsError } = await adminSupabase
          .from('workspaces')
          .insert({
            owner_id: user.id,
            name: 'Personal',
            is_personal: true,
            // See app/api/posts/create/route.ts.
            plan: await resolveWorkspacePlan(adminSupabase, user.id, null),
          })
          .select('id')
          .single()
        if (wsError) {
          console.error('Workspace create error:', wsError)
        } else {
          resolvedWorkspaceId = newWs?.id || null
        }
      }
    }

    if (!resolvedWorkspaceId) {
      return NextResponse.json({
        error: 'No workspace found. Please contact support.',
        detail: 'workspace_missing'
      }, { status: 400 })
    }

    // This route accepted any client-supplied workspaceId with only user_id
    // enforced on the row it writes, never verifying the caller has any
    // relationship to that workspace at all. Same check as posts/create.
    const access = await resolveWorkspaceAccess(getSupabaseAdmin(), user, resolvedWorkspaceId)
    if (!access) {
      return NextResponse.json({ error: "You don't have access to this workspace." }, { status: 403 })
    }
    if (!canCreatePosts(access.role)) {
      return NextResponse.json({ error: 'You have view-only access to this workspace.' }, { status: 403 })
    }

    // Resolved through the workspace this draft belongs to, not the calling
    // user's own user_settings — same bug class as posts/create (PR #579).
    const plan = await resolveWorkspacePlan(getSupabaseAdmin(), user.id, resolvedWorkspaceId)
    // Saving a draft is free — it is private and nothing goes out — so the
    // quota is only enforced for statuses that actually consume it. Submitting
    // for approval does, otherwise the approval queue becomes a way past the cap.
    if (countsAgainstQuota(insertStatus)
        && await postsUsedThisMonth(supabase, user.id) >= postLimitFor(plan)) {
      return NextResponse.json(postLimitReachedBody(plan), { status: 403 })
    }

    const insertPayload: Record<string, unknown> = {
      user_id:      user.id,
      workspace_id: resolvedWorkspaceId,
      content,
      platforms:    platforms || [],
      status:       insertStatus,
      tags:         Array.isArray(tags) && tags.length > 0 ? tags : null,
      poll_data:    poll_data || null,
    }
    if (insertStatus === 'pending_approval') {
      insertPayload.approval_status = 'pending'
      if (scheduledAt) insertPayload.scheduled_at = scheduledAt
      if (media.length > 0) insertPayload.media_urls = media
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert(insertPayload)
      .select()
      .single()

    if (error || !post) {
      console.error('Draft insert error:', { message: error?.message, code: error?.code, details: error?.details })
      return NextResponse.json({ error: 'Failed to save draft', detail: error?.message }, { status: 500 })
    }

    // Notify workspace owner when a post is submitted for approval (non-fatal)
    if (insertStatus === 'pending_approval' && resolvedWorkspaceId) {
      try {
        const admin = getSupabaseAdmin()
        const { data: ws } = await admin
          .from('workspaces')
          .select('owner_id')
          .eq('id', resolvedWorkspaceId)
          .single()
        if (ws?.owner_id && ws.owner_id !== user.id) {
          await admin.from('notifications').insert({
            user_id: ws.owner_id,
            type:    'approval_requested',
            title:   'Post pending approval',
            message: `A team member submitted a post for your review.`,
            data:    { post_id: post.id, workspace_id: resolvedWorkspaceId },
            is_read: false,
          })
        }
      } catch (e) {
        console.warn('[draft] approval notification failed (non-fatal):', e)
      }
    }

    // A new draft row exists. Updates to an existing draft return earlier and
    // are not counted, so this is "people who saved something", not saves.
    recordFunnel(getSupabaseAdmin(), user.id, 'draft_created', {})

    return NextResponse.json({ success: true, postId: post.id })

  } catch (err: any) {
    console.error('Draft route error:', err)
    return NextResponse.json({ error: 'Failed to save draft', detail: err?.message }, { status: 500 })
  }
}
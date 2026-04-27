export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const PLAN_POST_LIMITS: Record<string, number> = {
  free:   100,
  pro:    1000,
  agency: 5000,
}

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
    const { content, platforms, postId, workspaceId, status: requestedStatus, scheduledAt } = body

    // Only allow 'draft' or 'pending_approval' as valid statuses via this route
    const allowedStatuses = ['draft', 'pending_approval']
    const insertStatus = allowedStatuses.includes(requestedStatus) ? requestedStatus : 'draft'

    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    if (postId) {
      const updateData: Record<string, unknown> = { content, platforms, updated_at: new Date().toISOString() }
      if (insertStatus === 'pending_approval') {
        updateData.status = 'pending_approval'
        updateData.approval_status = 'pending'
        if (scheduledAt) updateData.scheduled_at = scheduledAt
      }
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id)
        .in('status', ['draft', 'pending_approval'])
      if (error) {
        console.error('Draft update error:', error)
        return NextResponse.json({ error: 'Failed to update draft', detail: error.message }, { status: 500 })
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

    const { data: settings } = await supabase
      .from('user_settings')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    const plan = settings?.plan || 'free'
    const limit = PLAN_POST_LIMITS[plan] ?? 100

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if ((count ?? 0) >= limit) {
      return NextResponse.json({
        error: 'Monthly post limit reached',
        limit,
        plan,
        upgrade: plan === 'free'
          ? 'Upgrade to Pro for 1,000 posts/month'
          : 'Upgrade to Agency for 5,000 posts/month',
      }, { status: 403 })
    }

    const insertPayload: Record<string, unknown> = {
      user_id:         user.id,
      workspace_id:    resolvedWorkspaceId,
      content,
      platforms:       platforms || [],
      status:          insertStatus,
    }
    if (insertStatus === 'pending_approval') {
      insertPayload.approval_status = 'pending'
      if (scheduledAt) insertPayload.scheduled_at = scheduledAt
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

    return NextResponse.json({ success: true, postId: post.id })

  } catch (err: any) {
    console.error('Draft route error:', err)
    return NextResponse.json({ error: 'Failed to save draft', detail: err?.message }, { status: 500 })
  }
}
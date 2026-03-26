export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publishToAll } from '@/lib/publish'
import { inngest } from '@/lib/inngest'

const PLAN_POST_LIMITS: Record<string, number> = {
  free:   100,
  pro:    1000,
  agency: 5000,
}

const PLAN_SCHEDULE_WEEKS: Record<string, number> = {
  free:   2,
  pro:    4,
  agency: 12,
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
    const { content, platforms, scheduledAt, destinations, draftId, workspaceId, selectedAccountIds } = body

    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    if (!platforms?.length) return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 })

    // Resolve workspace using admin client to bypass RLS
    let resolvedWorkspaceId = workspaceId || null
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
            owner_id:    user.id,
            name:        'Personal',
            is_personal: true,
          })
          .select('id')
          .single()

        if (wsError) {
          console.error('Failed to create personal workspace:', wsError)
          return NextResponse.json({ error: 'Failed to initialize workspace', detail: wsError.message }, { status: 500 })
        }

        resolvedWorkspaceId = newWs?.id || null
      }
    }

    if (!resolvedWorkspaceId) {
      return NextResponse.json({ error: 'No workspace found. Please contact support.' }, { status: 400 })
    }

    // Determine account workspace: personal accounts have workspace_id = null in connected_accounts
    const { data: wsInfo } = await getSupabaseAdmin()
      .from('workspaces')
      .select('is_personal')
      .eq('id', resolvedWorkspaceId)
      .maybeSingle()
    const accountWorkspaceId: string | null = wsInfo?.is_personal ? null : resolvedWorkspaceId

    // Get plan
    const { data: settings } = await supabase
      .from('user_settings')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    const plan = settings?.plan || 'free'

    // Scheduling window enforcement
    if (scheduledAt) {
      const scheduleDate  = new Date(scheduledAt)
      const now           = new Date()
      const scheduleWeeks = PLAN_SCHEDULE_WEEKS[plan] ?? 2
      const maxDate       = new Date(now.getTime() + scheduleWeeks * 7 * 24 * 60 * 60 * 1000)

      if (scheduleDate <= now) {
        return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 })
      }

      if (scheduleDate > maxDate) {
        const label = plan === 'free' ? '2 weeks' : plan === 'pro' ? '1 month' : '3 months'
        return NextResponse.json({
          error: `Your ${plan} plan can only schedule up to ${label} in advance`,
          upgrade: plan !== 'agency',
        }, { status: 403 })
      }
    }

    // Monthly post limit enforcement
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

    const isScheduled = !!scheduledAt

    // ── SCHEDULED PATH ─────────────────────────────────────────
    if (isScheduled) {
      const { data: post, error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id:      user.id,
          workspace_id: resolvedWorkspaceId,
          content,
          platforms,
          status:       'scheduled',
          scheduled_at: scheduledAt,
          destinations: destinations || {},
        })
        .select()
        .single()

      if (dbError || !post) {
        console.error('Scheduled post insert error:', { message: dbError?.message, code: dbError?.code })
        return NextResponse.json({ error: 'Failed to save post', detail: dbError?.message }, { status: 500 })
      }

      if (draftId) {
        await supabase.from('posts').delete().eq('id', draftId).eq('user_id', user.id)
      }

      try {
        await inngest.send({ name: 'post/scheduled', data: { postId: post.id, scheduledAt } })
      } catch (inngestErr) {
        console.error('Inngest send error (non-fatal):', inngestErr)
      }

      return NextResponse.json({ success: true, postId: post.id, status: 'scheduled' })
    }

    // ── POST NOW PATH ───────────────────────────────────────────
    // Publish to platforms first, then insert with the correct final status.
    // This eliminates the "insert as draft → update to published" race condition.
    const results    = await publishToAll(user.id, platforms, content, destinations || {}, accountWorkspaceId, selectedAccountIds || {})
    const allFailed  = results.every(r => !r.success)
    const someFailed = results.some(r => !r.success)
    const finalStatus = allFailed ? 'failed' : someFailed ? 'partial' : 'published'

    const platformPostIds: Record<string, string> = {}
    results.forEach(r => { if (r.success && r.postId) platformPostIds[r.platform] = r.postId })

    // Insert once with the correct status — no update step needed
    const { data: post, error: dbError } = await supabase
      .from('posts')
      .insert({
        user_id:      user.id,
        workspace_id: resolvedWorkspaceId,
        content,
        platforms,
        status:       finalStatus,
        published_at: allFailed ? null : new Date().toISOString(),
        destinations: destinations || {},
      })
      .select('id')
      .single()

    if (dbError || !post) {
      console.error('Post Now insert error:', { message: dbError?.message, code: dbError?.code })
      // Post was published on platforms but couldn't be tracked — still return success
      return NextResponse.json({ success: !allFailed, results, status: finalStatus })
    }

    console.log('[publish] Inserted post', post.id, '→', finalStatus)

    // Non-critical: save platform post IDs (column may not exist)
    if (Object.keys(platformPostIds).length > 0) {
      getSupabaseAdmin()
        .from('posts')
        .update({ platform_post_ids: platformPostIds })
        .eq('id', post.id)
        .then(({ error }) => {
          if (error) console.warn('[publish] platform_post_ids skipped (non-fatal):', error.message)
        })
    }

    if (draftId && !allFailed) {
      await supabase.from('posts').delete().eq('id', draftId).eq('user_id', user.id)
    }

    if (!allFailed && Object.keys(platformPostIds).length > 0) {
      await inngest.send({
        name: 'post/published',
        data: { postId: post.id, userId: user.id, platformPostIds },
      }).catch(err => console.error('Failed to send post/published event:', err))
    }

    // Send success email for Post Now (non-fatal)
    if (!allFailed) {
      try {
        const { data: notifSettings } = await getSupabaseAdmin()
          .from('user_settings')
          .select('notification_prefs')
          .eq('user_id', user.id)
          .single()
        const prefs = (notifSettings?.notification_prefs ?? {}) as Record<string, boolean>
        if (prefs.post_published !== false) {
          const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(user.id)
          if (authUser?.user?.email) {
            const Resend = (await import('resend')).Resend
            const resend = new Resend(process.env.RESEND_API_KEY!)
            const successfulPlatforms = (results as any[])
              .filter((r: any) => r.success)
              .map((r: any) => r.platform)
              .join(', ')
            const postPreview = (content || '').substring(0, 100) + ((content || '').length > 100 ? '...' : '')
            await resend.emails.send({
              from: 'SocialMate <notifications@socialmate.studio>',
              to: authUser.user.email,
              subject: `Your post is live ✓`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;"><div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:8px;margin-bottom:20px;"><h2 style="margin:0 0 8px;color:#15803d;font-size:18px;">Your post is live ✓</h2><p style="margin:0;color:#166534;font-size:14px;">Published to: <strong>${successfulPlatforms}</strong></p></div>${postPreview ? `<p style="color:#374151;font-size:14px;background:#f9fafb;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">"${postPreview}"</p>` : ''}<p style="color:#6b7280;font-size:13px;">💡 Tip: Engage with replies in the first 30 minutes — the algorithm rewards early engagement.</p><a href="https://socialmate.studio/drafts" style="display:inline-block;background:#000;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;margin-top:8px;">View in Drafts →</a><p style="color:#9ca3af;font-size:11px;margin-top:20px;">To disable these emails, go to Settings → Notifications.</p></div>`,
            }).catch(() => {})
          }
        }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      success: !allFailed,
      postId:  post.id,
      results,
      status:  finalStatus,
    })

  } catch (err: any) {
    console.error('Post create route error:', err)
    return NextResponse.json({ error: 'Failed to save post', detail: err?.message }, { status: 500 })
  }
}
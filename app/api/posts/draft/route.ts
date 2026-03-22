export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
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
    const { content, platforms, postId, workspaceId } = body
 
    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })
 
    // Updating an existing draft — no limit check, no workspace change needed
    if (postId) {
      const { error } = await supabase
        .from('posts')
        .update({ content, platforms, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id)
        .eq('status', 'draft')
      if (error) {
        console.error('Draft update error:', error)
        return NextResponse.json({ error: 'Failed to update draft', detail: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, postId })
    }
 
    // Try to resolve workspace_id — best effort, non-blocking
    // IMPORTANT: always validate via admin client; never trust the client-provided
    // workspaceId blindly (it may be a fake fallback value like the user's own auth UUID)
    let resolvedWorkspaceId: string | null = null
    try {
      const adminClient = getSupabaseAdmin()

      // If client sent a workspaceId, verify it actually belongs to this user
      if (workspaceId && workspaceId !== user.id && workspaceId !== '' && workspaceId !== 'personal') {
        const { data: verifiedWs } = await adminClient
          .from('workspaces')
          .select('id')
          .eq('id', workspaceId)
          .eq('owner_id', user.id)
          .maybeSingle()
        resolvedWorkspaceId = verifiedWs?.id ?? null
      }

      // If we still don't have one, look up their personal workspace
      if (!resolvedWorkspaceId) {
        const { data: personalWs } = await adminClient
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id)
          .eq('is_personal', true)
          .maybeSingle()
        resolvedWorkspaceId = personalWs?.id ?? null
      }
    } catch (wsErr) {
      console.error('[POST_DRAFT] workspace lookup failed (non-fatal):', wsErr)
      resolvedWorkspaceId = null
    }
    console.log('[POST_DRAFT] user:', user.id, 'workspace:', resolvedWorkspaceId)
 
    // Enforce monthly limit
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
 
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id:      user.id,
        workspace_id: resolvedWorkspaceId,
        content,
        platforms:    platforms || [],
        status:       'draft',
      })
      .select()
      .single()
 
    if (error || !post) {
      console.error('Draft insert error:', { 
        message: error?.message, 
        code: error?.code, 
        details: error?.details,
        hint: error?.hint 
      })
      return NextResponse.json({ 
        error: 'Failed to save draft', 
        detail: error?.message 
      }, { status: 500 })
    }
 
    return NextResponse.json({ success: true, postId: post.id })
 
  } catch (err: any) {
    console.error('Draft route unexpected error:', err)
    return NextResponse.json({ 
      error: 'Failed to save draft', 
      detail: err?.message 
    }, { status: 500 })
  }
}
 
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
 
    // New draft — resolve workspace using admin client to bypass RLS
    let resolvedWorkspaceId = workspaceId
    if (!resolvedWorkspaceId) {
      try {
        const adminSupabase = getSupabaseAdmin()
        const { data: personalWs, error: wsError } = await adminSupabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id)
          .eq('is_personal', true)
          .single()
 
        if (wsError || !personalWs) {
          // Auto-create personal workspace if missing
          const { data: newWs, error: createError } = await adminSupabase
            .from('workspaces')
            .insert({
              owner_id: user.id,
              name: 'Personal',
              is_personal: true,
            })
            .select('id')
            .single()
 
          if (createError) {
            console.error('Workspace create error:', createError)
          } else {
            resolvedWorkspaceId = newWs?.id || null
          }
        } else {
          resolvedWorkspaceId = personalWs.id
        }
      } catch (wsErr) {
        console.error('Workspace resolution error:', wsErr)
      }
    }
 
    if (!resolvedWorkspaceId) {
      return NextResponse.json({ 
        error: 'No workspace found. Please contact support.',
        detail: 'workspace_missing'
      }, { status: 400 })
    }
 
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
 
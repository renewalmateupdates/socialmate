import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { publishToAll } from '@/lib/publish'
import { inngest } from '@/lib/inngest'

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { content, platforms, scheduledAt, destinations, draftId } = body

  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  if (!platforms?.length) return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 })

  // Post limit enforcement
  const { data: settings } = await supabase
    .from('user_settings')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan  = settings?.plan || 'free'
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

  const { data: post, error: dbError } = await supabase
    .from('posts')
    .insert({
      user_id:      user.id,
      content,
      platforms,
      status:       isScheduled ? 'scheduled' : 'draft',
      scheduled_at: scheduledAt  || null,
      destinations: destinations || {},
    })
    .select()
    .single()

  if (dbError || !post) {
    console.error('Post insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
  }

  if (isScheduled) {
    // If publishing from an existing draft, delete the old draft
    if (draftId) {
      await supabase.from('posts').delete().eq('id', draftId).eq('user_id', user.id)
    }

    await inngest.send({
      name: 'post/scheduled',
      data: { postId: post.id, scheduledAt },
    })

    return NextResponse.json({ success: true, postId: post.id, status: 'scheduled' })
  }

  // Post Now — publish immediately
  const results    = await publishToAll(user.id, platforms, content, destinations || {})
  const allFailed  = results.every(r => !r.success)
  const someFailed = results.some(r => !r.success)

  const platformPostIds: Record<string, string> = {}
  results.forEach(r => { if (r.success && r.postId) platformPostIds[r.platform] = r.postId })

  const finalStatus = allFailed ? 'failed' : someFailed ? 'partial' : 'published'

  await supabase
    .from('posts')
    .update({
      status:            finalStatus,
      published_at:      allFailed ? null : new Date().toISOString(),
      platform_post_ids: platformPostIds,
    })
    .eq('id', post.id)

  // If publishing from an existing draft, delete the old draft
  if (draftId && !allFailed) {
    await supabase.from('posts').delete().eq('id', draftId).eq('user_id', user.id)
  }

  return NextResponse.json({
    success: !allFailed,
    postId:  post.id,
    results,
    status:  finalStatus,
  })
}
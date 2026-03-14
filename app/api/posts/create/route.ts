import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { publishToAll } from '@/lib/publish'
import { inngest } from '@/lib/inngest'

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
  const { content, platforms, scheduledAt } = body

  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  if (!platforms?.length) return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 })

  const isScheduled = !!scheduledAt
  const status = isScheduled ? 'scheduled' : 'publishing'

  // Save post to DB
  const { data: post, error: dbError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      platforms,
      status,
      scheduled_at: scheduledAt || null,
    })
    .select()
    .single()

  if (dbError || !post) {
    console.error('Post insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
  }

  if (isScheduled) {
    // Calculate delay in ms
    const scheduledTime = new Date(scheduledAt).getTime()
    const now = Date.now()
    const delay = Math.max(0, scheduledTime - now)

    // Send to Inngest for delayed publishing
    await inngest.send({
      name: 'post/scheduled',
      data: { postId: post.id, delay: `${Math.floor(delay / 1000)}s` },
    })

    return NextResponse.json({ success: true, postId: post.id, status: 'scheduled' })
  }

  // Publish Now — fire adapters immediately
  const results = await publishToAll(user.id, platforms, content)
  const allFailed = results.every(r => !r.success)
  const someFailed = results.some(r => !r.success)

  // Build platform_post_ids map
  const platformPostIds: Record<string, string> = {}
  results.forEach(r => { if (r.success && r.postId) platformPostIds[r.platform] = r.postId })

  // Update post status
  await supabase
    .from('posts')
    .update({
      status: allFailed ? 'failed' : someFailed ? 'partial' : 'published',
      published_at: allFailed ? null : new Date().toISOString(),
      platform_post_ids: platformPostIds,
    })
    .eq('id', post.id)

  return NextResponse.json({
    success: !allFailed,
    postId: post.id,
    results,
    status: allFailed ? 'failed' : someFailed ? 'partial' : 'published',
  })
}
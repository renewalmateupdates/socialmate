import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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
  const { content, platforms, postId } = body

  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  // If postId exists, update existing draft — no limit check needed
  if (postId) {
    const { error } = await supabase
      .from('posts')
      .update({ content, platforms, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('user_id', user.id)
      .eq('status', 'draft')

    if (error) return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
    return NextResponse.json({ success: true, postId })
  }

  // New draft — enforce monthly limit
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
      upgrade: plan === 'free' ? 'Upgrade to Pro for 1,000 posts/month' : 'Upgrade to Agency for 5,000 posts/month',
    }, { status: 403 })
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      platforms: platforms || [],
      status: 'draft',
    })
    .select()
    .single()

  if (error || !post) return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })

  return NextResponse.json({ success: true, postId: post.id })
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

  // If postId exists, update existing draft
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

  // Create new draft
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
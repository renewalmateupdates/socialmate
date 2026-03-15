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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { postId } = body

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, status, published_at, user_id')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (post.published_at) {
    return NextResponse.json({ error: 'Post is already published' }, { status: 409 })
  }

  const { error: updateError } = await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Publish error:', updateError)
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 })
  }

  // ── First-post credit trigger ──────────────────────────────────────────
  try {
    // Count how many published posts this user has (including this one)
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published')

    if (count === 1) {
      // This is their first published post — award +10 credits to the user
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('credits, referred_by')
        .eq('user_id', user.id)
        .single()

      if (userSettings) {
        // Award user +10 credits
        await supabase
          .from('user_settings')
          .update({ credits: (userSettings.credits ?? 0) + 10 })
          .eq('user_id', user.id)

        // If they were referred, award referrer +10 credits too
        if (userSettings.referred_by) {
          const { data: referrerSettings } = await supabase
            .from('user_settings')
            .select('credits')
            .eq('user_id', userSettings.referred_by)
            .single()

          if (referrerSettings) {
            await supabase
              .from('user_settings')
              .update({ credits: (referrerSettings.credits ?? 0) + 10 })
              .eq('user_id', userSettings.referred_by)
          }
        }
      }
    }
  } catch (creditErr) {
    // Non-blocking — don't fail the publish if credits fail
    console.error('First-post credit error:', creditErr)
  }
  // ──────────────────────────────────────────────────────────────────────

  // TODO (Phase 2): Call platform-specific publishing adapter here

  return NextResponse.json({ success: true, publishedAt: new Date().toISOString() })
}
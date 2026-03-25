export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publishToAll } from '@/lib/publish'
import { inngest } from '@/lib/inngest'


export async function POST(request: NextRequest) {
  const body = await request.json()
  const { postId, fromInngest } = body

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  // When called from Inngest, use service role (no session cookie)
  // When called directly, verify user session
  let userId: string

  if (fromInngest) {
    // Inngest call — fetch post directly with service role
    const { data: post, error } = await getSupabaseAdmin()
      .from('posts')
      .select('id, user_id, content, platforms, destinations, status, published_at')
      .eq('id', postId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.published_at) {
      return NextResponse.json({ error: 'Already published' }, { status: 409 })
    }

    userId = post.user_id

    // Actually publish to platforms
    const destinations = post.destinations || {}
    const results = await publishToAll(userId, post.platforms, post.content, destinations)
    const allFailed  = results.every(r => !r.success)
    const someFailed = results.some(r => !r.success)

    const platformPostIds: Record<string, string> = {}
    results.forEach(r => {
      if (r.success && r.postId) platformPostIds[r.platform] = r.postId
    })

    await getSupabaseAdmin()
      .from('posts')
      .update({
        status: allFailed ? 'failed' : someFailed ? 'partial' : 'published',
        published_at: allFailed ? null : new Date().toISOString(),
        platform_post_ids: platformPostIds,
      })
      .eq('id', postId)

    // First-post credit trigger + streak update
    await handleFirstPostCredits(userId)
    if (!allFailed) await updateStreak(userId)

    // Emit analytics fetch event for Bluesky/Mastodon posts
    if (!allFailed) {
      const analyticsPlatforms = results.filter(r => r.success && (r.platform === 'bluesky' || r.platform === 'mastodon'))
      if (analyticsPlatforms.length > 0) {
        await inngest.send({ name: 'post/published', data: { postId, userId, platformPostIds } }).catch(() => {})
      }
    }

    return NextResponse.json({
      success: !allFailed,
      results,
      status: allFailed ? 'failed' : someFailed ? 'partial' : 'published',
    })

  } else {
    // Direct call — verify session
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

    userId = user.id

    const { data: post, error } = await supabase
      .from('posts')
      .select('id, user_id, content, platforms, destinations, status, published_at')
      .eq('id', postId)
      .eq('user_id', userId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.published_at) {
      return NextResponse.json({ error: 'Already published' }, { status: 409 })
    }

    const destinations = post.destinations || {}
    const results = await publishToAll(userId, post.platforms, post.content, destinations)
    const allFailed  = results.every(r => !r.success)
    const someFailed = results.some(r => !r.success)

    const platformPostIds: Record<string, string> = {}
    results.forEach(r => {
      if (r.success && r.postId) platformPostIds[r.platform] = r.postId
    })

    const finalStatus = allFailed ? 'failed' : someFailed ? 'partial' : 'published'
    console.log('[publish] Updating post status to published:', postId)
    const { error: updateError } = await getSupabaseAdmin()
      .from('posts')
      .update({
        status: finalStatus,
        published_at: allFailed ? null : new Date().toISOString(),
        platform_post_ids: platformPostIds,
      })
      .eq('id', postId)
    if (updateError) console.error('[publish] Status update failed:', updateError)

    await handleFirstPostCredits(userId)
    if (!allFailed) await updateStreak(userId)

    // Emit analytics fetch event for Bluesky/Mastodon posts
    if (!allFailed) {
      const analyticsPlatforms = results.filter(r => r.success && (r.platform === 'bluesky' || r.platform === 'mastodon'))
      if (analyticsPlatforms.length > 0) {
        await inngest.send({ name: 'post/published', data: { postId, userId, platformPostIds } }).catch(() => {})
      }
    }

    return NextResponse.json({
      success: !allFailed,
      results,
      status: finalStatus,
    })
  }
}

async function updateStreak(userId: string) {
  try {
    const { data: settings } = await getSupabaseAdmin()
      .from('user_settings')
      .select('current_streak, longest_streak, last_post_date')
      .eq('user_id', userId)
      .single()

    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const lastDate       = settings?.last_post_date
    const currentStreak  = settings?.current_streak ?? 0
    const longestStreak  = settings?.longest_streak ?? 0

    if (lastDate === today) return // Already posted today — no change

    const newStreak = lastDate === yesterday ? currentStreak + 1 : 1
    const newLongest = Math.max(newStreak, longestStreak)

    await getSupabaseAdmin()
      .from('user_settings')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_post_date: today,
      })
      .eq('user_id', userId)
  } catch (err) {
    console.error('Streak update error:', err)
  }
}

async function handleFirstPostCredits(userId: string) {
  try {
    const { count } = await getSupabaseAdmin()
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published')

    if (count === 1) {
      const { data: userSettings } = await getSupabaseAdmin()
        .from('user_settings')
        .select('ai_credits_remaining, referred_by')
        .eq('user_id', userId)
        .single()

      if (userSettings) {
        await getSupabaseAdmin()
          .from('user_settings')
          .update({ ai_credits_remaining: (userSettings.ai_credits_remaining ?? 0) + 10 })
          .eq('user_id', userId)

        if (userSettings.referred_by) {
          const { data: referrerSettings } = await getSupabaseAdmin()
            .from('user_settings')
            .select('ai_credits_remaining')
            .eq('user_id', userSettings.referred_by)
            .single()

          if (referrerSettings) {
            await getSupabaseAdmin()
              .from('user_settings')
              .update({ ai_credits_remaining: (referrerSettings.ai_credits_remaining ?? 0) + 10 })
              .eq('user_id', userSettings.referred_by)
          }
        }
      }
    }
  } catch (err) {
    console.error('First-post credit error:', err)
  }
}
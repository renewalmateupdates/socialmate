export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publishToAll } from '@/lib/publish'
import { inngest } from '@/lib/inngest'
import { Resend } from 'resend'
import { logActivity } from '@/lib/workspace-activity'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}


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
      .select('id, user_id, content, platforms, destinations, status, published_at, workspace_id')
      .eq('id', postId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.published_at) {
      return NextResponse.json({ error: 'Already published' }, { status: 409 })
    }

    userId = post.user_id

    // Resolve account workspace: personal accounts have workspace_id = null in connected_accounts
    let accountWorkspaceId: string | null = null
    if (post.workspace_id) {
      const { data: wsInfo } = await getSupabaseAdmin()
        .from('workspaces')
        .select('is_personal')
        .eq('id', post.workspace_id)
        .maybeSingle()
      accountWorkspaceId = wsInfo?.is_personal ? null : post.workspace_id
    }

    // Actually publish to platforms
    const destinations = post.destinations || {}
    const results = await publishToAll(userId, post.platforms, post.content, destinations, accountWorkspaceId, {})
    const allFailed  = results.every(r => !r.success)
    const someFailed = results.some(r => !r.success)

    const platformPostIds: Record<string, string> = {}
    results.forEach(r => {
      if (r.success && r.postId) platformPostIds[r.platform] = r.postId
    })

    const finalStatusInngest = allFailed ? 'failed' : someFailed ? 'partial' : 'published'
    console.log('[STATUS-UPDATE] Setting post', postId, '→', finalStatusInngest)

    // Step 1: platform_post_ids FIRST (synchronous) — this is the idempotency key.
    // If a retry happens after this write, the inner guard will see these IDs and skip,
    // preventing double-posts even if the status update below fails.
    if (Object.keys(platformPostIds).length > 0) {
      const { error: pidError } = await getSupabaseAdmin()
        .from('posts')
        .update({ platform_post_ids: platformPostIds })
        .eq('id', postId)
      if (pidError) console.warn('[STATUS-UPDATE] platform_post_ids write failed (non-fatal):', pidError.message)
      else console.log('[STATUS-UPDATE] platform_post_ids saved for post', postId)
    }

    // Step 2: Update status with retries.
    // publishedOk=true tells Inngest the post was sent to the platform even if this returns 500,
    // so Inngest will NOT call the fail route.
    let statusError: Error | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { error } = await getSupabaseAdmin()
        .from('posts')
        .update({
          status:       finalStatusInngest,
          published_at: allFailed ? null : new Date().toISOString(),
        })
        .eq('id', postId)
      if (!error) {
        statusError = null
        console.log(`[STATUS-UPDATE] Status set → ${finalStatusInngest} for post ${postId} (attempt ${attempt})`)
        break
      }
      statusError = new Error(error.message)
      console.warn(`[STATUS-UPDATE] Attempt ${attempt} failed:`, error.message)
      if (attempt < 3) await new Promise(r => setTimeout(r, 300 * attempt))
    }

    if (statusError) {
      console.error('[STATUS-UPDATE] All 3 attempts failed for post', postId, statusError.message)
      // publishedOk: true tells Inngest the post was sent — do NOT mark as failed.
      // Inngest will retry; on retry the platform_post_ids guard will catch it and skip.
      return NextResponse.json({
        publishedOk: !allFailed,
        error: 'Status update failed after 3 attempts',
        detail: statusError.message,
        status: finalStatusInngest,
      }, { status: 500 })
    }

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

    // Send post published success email (non-fatal)
    if (!allFailed) {
      try {
        const { data: notifSettings } = await getSupabaseAdmin()
          .from('user_settings')
          .select('notification_prefs')
          .eq('user_id', userId)
          .single()

        const prefs = (notifSettings?.notification_prefs ?? {}) as Record<string, boolean>

        if (prefs.post_published !== false) {
          const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(userId)
          if (authUser?.user?.email) {
            const successfulPlatforms = results
              .filter(r => r.success)
              .map(r => r.platform)
              .join(', ')

            const postContent = post.content || ''
            const postPreview = postContent.substring(0, 100) + (postContent.length > 100 ? '...' : '')

            await getResend().emails.send({
              from: 'SocialMate <notifications@socialmate.studio>',
              to: authUser.user.email,
              subject: `Your post is live ✓`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 8px; color: #15803d; font-size: 18px;">Your post is live ✓</h2>
                    <p style="margin: 0; color: #166534; font-size: 14px;">Published to: <strong>${successfulPlatforms}</strong></p>
                  </div>
                  ${postPreview ? `<p style="color: #374151; font-size: 14px; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">"${postPreview}"</p>` : ''}
                  <p style="color: #6b7280; font-size: 13px;">💡 Tip: Engage with replies in the first 30 minutes — the algorithm rewards early engagement.</p>
                  <a href="https://socialmate.studio/queue" style="display: inline-block; background: #000; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 8px;">View in Queue →</a>
                  <p style="color: #9ca3af; font-size: 11px; margin-top: 20px;">To disable these emails, go to Settings → Notifications.</p>
                </div>
              `
            })
          }
        }
      } catch (emailErr) {
        console.error('[PUBLISH] post published email failed (non-fatal):', emailErr)
      }
    }

    if (!allFailed && post.workspace_id) {
      logActivity({
        workspace_id: post.workspace_id,
        user_id:      userId,
        action:       'post_published',
        entity_type:  'post',
        entity_id:    postId,
        metadata:     { platforms: post.platforms, status: allFailed ? 'failed' : someFailed ? 'partial' : 'published' },
      })
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
      .select('id, user_id, content, platforms, destinations, status, published_at, workspace_id')
      .eq('id', postId)
      .eq('user_id', userId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.published_at) {
      return NextResponse.json({ error: 'Already published' }, { status: 409 })
    }

    // Resolve account workspace: personal accounts have workspace_id = null in connected_accounts
    let accountWorkspaceId: string | null = null
    if (post.workspace_id) {
      const { data: wsInfo } = await getSupabaseAdmin()
        .from('workspaces')
        .select('is_personal')
        .eq('id', post.workspace_id)
        .maybeSingle()
      accountWorkspaceId = wsInfo?.is_personal ? null : post.workspace_id
    }

    const destinations = post.destinations || {}
    const results = await publishToAll(userId, post.platforms, post.content, destinations, accountWorkspaceId, {})
    const allFailed  = results.every(r => !r.success)
    const someFailed = results.some(r => !r.success)

    const platformPostIds: Record<string, string> = {}
    results.forEach(r => {
      if (r.success && r.postId) platformPostIds[r.platform] = r.postId
    })

    const finalStatus = allFailed ? 'failed' : someFailed ? 'partial' : 'published'
    console.log('[publish] Setting post', postId, '→', finalStatus)

    // Step 1: Status + published_at ONLY (critical — never mix with platform_post_ids)
    const { error: statusError } = await getSupabaseAdmin()
      .from('posts')
      .update({
        status:       finalStatus,
        published_at: allFailed ? null : new Date().toISOString(),
      })
      .eq('id', postId)

    if (statusError) {
      console.error('[publish] CRITICAL: status update failed:', statusError)
    } else {
      console.log('[publish] Status confirmed →', finalStatus, 'for post', postId)
    }

    // Step 2: platform_post_ids separately (non-critical, column may not exist)
    if (Object.keys(platformPostIds).length > 0) {
      getSupabaseAdmin()
        .from('posts')
        .update({ platform_post_ids: platformPostIds })
        .eq('id', postId)
        .then(({ error }) => {
          if (error) console.warn('[publish] platform_post_ids skipped (non-fatal):', error.message)
        })
    }

    await handleFirstPostCredits(userId)
    if (!allFailed) await updateStreak(userId)

    // Emit analytics fetch event for Bluesky/Mastodon posts
    if (!allFailed) {
      const analyticsPlatforms = results.filter(r => r.success && (r.platform === 'bluesky' || r.platform === 'mastodon'))
      if (analyticsPlatforms.length > 0) {
        await inngest.send({ name: 'post/published', data: { postId, userId, platformPostIds } }).catch(() => {})
      }
    }

    // Send post published success email for direct (Post Now) publishes
    if (!allFailed) {
      try {
        const { data: notifSettings } = await getSupabaseAdmin()
          .from('user_settings')
          .select('notification_prefs')
          .eq('user_id', userId)
          .single()

        const prefs = (notifSettings?.notification_prefs ?? {}) as Record<string, boolean>

        if (prefs.post_published !== false) {
          const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(userId)
          if (authUser?.user?.email) {
            const successfulPlatforms = results
              .filter(r => r.success)
              .map(r => r.platform)
              .join(', ')

            const postContent = post.content || ''
            const postPreview = postContent.substring(0, 100) + (postContent.length > 100 ? '...' : '')

            await getResend().emails.send({
              from: 'SocialMate <notifications@socialmate.studio>',
              to: authUser.user.email,
              subject: `Your post is live ✓`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="margin: 0 0 8px; color: #15803d; font-size: 18px;">Your post is live ✓</h2>
                    <p style="margin: 0; color: #166534; font-size: 14px;">Published to: <strong>${successfulPlatforms}</strong></p>
                  </div>
                  ${postPreview ? `<p style="color: #374151; font-size: 14px; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">"${postPreview}"</p>` : ''}
                  <p style="color: #6b7280; font-size: 13px;">💡 Tip: Engage with replies in the first 30 minutes — the algorithm rewards early engagement.</p>
                  <a href="https://socialmate.studio/queue" style="display: inline-block; background: #000; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 8px;">View in Queue →</a>
                  <p style="color: #9ca3af; font-size: 11px; margin-top: 20px;">To disable these emails, go to Settings → Notifications.</p>
                </div>
              `
            }).catch(emailErr => {
              console.error('[PUBLISH] post published email failed (non-fatal):', emailErr)
            })
          }
        }
      } catch (emailErr) {
        console.error('[PUBLISH] post published email failed (non-fatal):', emailErr)
      }
    }

    if (!allFailed && post.workspace_id) {
      logActivity({
        workspace_id: post.workspace_id,
        user_id:      userId,
        action:       'post_published',
        entity_type:  'post',
        entity_id:    postId,
        metadata:     { platforms: post.platforms, status: finalStatus },
      })
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
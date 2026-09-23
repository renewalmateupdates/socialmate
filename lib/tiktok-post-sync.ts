import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { recordFunnel } from '@/lib/usage'
import { handleFirstPostCredits, updateStreak } from '@/lib/post-activation'

// A TikTok publish used to live only in tiktok_posts -- invisible to the main
// posts table, which every admin dashboard, the funnel, Queue, Calendar,
// Analytics and the shared monthly post quota all read from instead. Call
// this once a TikTok post actually publishes (from any of the three places
// that can settle one: an immediate FILE_UPLOAD post whose status poll
// resolves, an immediate PULL_FROM_URL post, or the scheduled-post cron) so
// that success becomes visible everywhere a post from any other platform
// already is, including the first-post credit bonus and streak update.
//
// Deliberately does NOT run at schedule time, only at actual publish time.
// The generic scheduled-post pipeline (lib/inngest.ts's publishScheduledPost,
// triggered by a `post/scheduled` Inngest event) would pick up a 'scheduled'
// posts row with platforms=['tiktok'] and try to publish it through the
// multi-platform publishToAll path, which has no 'tiktok' case and would
// instant-fail it -- stepping on the real TikTok-specific scheduling this app
// already has. A pending TikTok post therefore still won't show in Queue or
// Calendar until it publishes; only the settled result is mirrored.
export async function syncTiktokPublishToPosts(tiktokPost: {
  id: string
  user_id: string
  workspace_id: string | null
  post_caption: string | null
}): Promise<void> {
  try {
    const db = getSupabaseAdmin()

    // Idempotency guard. publish-status already short-circuits before
    // re-checking TikTok once our own row says 'published', but the Inngest
    // cron's retry semantics make a defensive re-check here cheap insurance
    // against a duplicate mirrored row.
    const { data: existing } = await db
      .from('tiktok_posts')
      .select('synced_post_id')
      .eq('id', tiktokPost.id)
      .maybeSingle()
    if (existing?.synced_post_id) return

    const { data: post, error } = await db
      .from('posts')
      .insert({
        user_id:      tiktokPost.user_id,
        workspace_id: tiktokPost.workspace_id,
        content:      tiktokPost.post_caption || '',
        platforms:    ['tiktok'],
        status:       'published',
        published_at: new Date().toISOString(),
        destinations: {},
      })
      .select('id')
      .single()

    if (error || !post) {
      console.error('[tiktok-post-sync] could not mirror to posts:', error?.message)
      return
    }

    const { error: linkError } = await db
      .from('tiktok_posts')
      .update({ synced_post_id: post.id })
      .eq('id', tiktokPost.id)
    if (linkError) console.warn('[tiktok-post-sync] could not save synced_post_id:', linkError.message)

    recordFunnel(db, tiktokPost.user_id, 'post_published', {
      platforms: 'tiktok',
      count: 1,
      source: 'tiktok_studio',
    })
    await handleFirstPostCredits(tiktokPost.user_id)
    await updateStreak(tiktokPost.user_id)
  } catch (err) {
    console.error('[tiktok-post-sync] threw:', err)
  }
}

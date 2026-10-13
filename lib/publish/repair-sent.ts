import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { recordFunnel } from '@/lib/usage'
import { handleFirstPostCredits, updateStreak } from '@/lib/post-activation'

/**
 * A post that has platform_post_ids has already gone out. It must never be
 * sent again, and it must not keep reading "scheduled".
 *
 * platform_post_ids is written before the status precisely so a failed status
 * write can be repaired on the next pass instead of re-publishing. That only
 * works if every caller checks it. One did not: the Inngest function repaired,
 * while /api/posts/publish, which the GitHub Actions backstop calls directly,
 * went straight to publishToAll. In October 2026 a database trigger made the
 * status write fail for one user's first scheduled post, and the backstop
 * re-sent it to their LinkedIn on every pass for two days.
 *
 * One function, called from both, so the two cannot drift again.
 */

type SentPost = {
  id: string
  user_id: string
  platforms: string[] | null
  platform_post_ids: unknown
}

export function sentPlatformIds(post: { platform_post_ids: unknown }): Record<string, string> | null {
  const ids = post.platform_post_ids
  if (!ids || typeof ids !== 'object' || Array.isArray(ids)) return null
  return Object.keys(ids).length > 0 ? (ids as Record<string, string>) : null
}

export type RepairResult =
  | { ok: true; status: 'published' | 'partial'; changed: boolean }
  | { ok: false; error: string }

export async function repairSentPost(post: SentPost, source: string): Promise<RepairResult> {
  const sent = sentPlatformIds(post)
  if (!sent) return { ok: false, error: 'Post has no platform_post_ids to repair from' }

  const platforms = post.platforms ?? []
  const status = Object.keys(sent).length >= platforms.length ? 'published' : 'partial'
  const db = getSupabaseAdmin()

  // Only while still 'scheduled', so a post another caller already settled is
  // left alone. `.select` tells us whether this call was the one that changed it.
  let { data: rows, error } = await db
    .from('posts')
    .update({ status, published_at: new Date().toISOString() })
    .eq('id', post.id)
    .eq('status', 'scheduled')
    .select('id')

  if (error) {
    // Whatever is rejecting the full write, the post still has to leave
    // 'scheduled'. Status alone is the smallest write that does that.
    console.error(`[PUBLISH-REPAIR] status write failed for sent post ${post.id} (${source}):`, error.message)
    const fallback = await db
      .from('posts')
      .update({ status })
      .eq('id', post.id)
      .eq('status', 'scheduled')
      .select('id')
    if (fallback.error) {
      console.error(`[PUBLISH-REPAIR] status-only write also failed for post ${post.id}:`, fallback.error.message)
      return { ok: false, error: fallback.error.message }
    }
    console.error(`[PUBLISH-REPAIR] post ${post.id} set to ${status} without published_at. Fix the error above, then backfill it.`)
    rows = fallback.data
  }

  const changed = (rows?.length ?? 0) > 0
  if (changed) {
    console.log(`[PUBLISH-REPAIR] Post ${post.id} was already sent. Repaired status to ${status} (${source})`)
    recordFunnel(db, post.user_id, 'post_published', {
      platforms: platforms.join(','),
      count: platforms.length,
      source: 'scheduled_repair',
    })
    await handleFirstPostCredits(post.user_id)
    await updateStreak(post.user_id)
  }

  return { ok: true, status, changed }
}

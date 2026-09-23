export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// Auth: either Vercel cron secret OR the internal deploy token
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  if (auth === `Bearer ${process.env.INTERNAL_CRON_TOKEN}`) return true
  return false
}

// This used to be a second, fully independent scheduler: it polled for
// anything past its scheduled_at every 5 minutes and published it, running
// concurrently with -- not behind -- Inngest's own publishScheduledPost. The
// only thing preventing both from publishing the same post to every platform
// was a non-atomic read-then-act check in /api/posts/publish (now fixed to a
// real atomic claim, see that route). This route is now a true backstop: it
// only touches posts significantly overdue, which under normal operation
// means Inngest already handled them -- the atomic claim there is what
// actually keeps this safe even during the grace window, this grace period
// just keeps it from routinely competing with Inngest for fresh due posts.
const GRACE_PERIOD_MS = 10 * 60_000

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const graceThreshold = new Date(now.getTime() - GRACE_PERIOD_MS).toISOString()

  const { data: duePosts, error } = await getSupabaseAdmin()
    .from('posts')
    .select('id, scheduled_at')
    .eq('status', 'scheduled')
    .lt('scheduled_at', graceThreshold)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ published: 0, message: 'No posts overdue past the grace period' })
  }

  let published = 0
  let failed = 0
  let claimedByOther = 0

  for (const post of duePosts) {
    try {
      const res = await fetch(`${APP_URL}/api/posts/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, fromInngest: true }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        published++
      } else if (res.status === 409) {
        // Atomic claim already held by Inngest (or a previous run of this
        // same cron) -- not a failure, just not ours to publish.
        claimedByOther++
      } else if (data?.publishedOk) {
        // Sent to the platform, only the DB status write failed. Marking
        // this 'failed' would be a lie -- leave it for the next pass, which
        // will find platform_post_ids already set and repair the status
        // instead of re-publishing.
        console.warn('[cron/publish-scheduled] publishedOk but status write failed for', post.id)
      } else {
        await getSupabaseAdmin()
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', post.id)
          .eq('status', 'scheduled')
        failed++
      }
    } catch {
      // A network/fetch-level failure says nothing about whether the post
      // actually went out -- same reasoning as the publishedOk branch above.
      console.warn('[cron/publish-scheduled] request failed for', post.id, '-- leaving for next pass')
    }
  }

  console.log(`[cron/publish-scheduled] ${now.toISOString()} — published: ${published}, failed: ${failed}, claimedByOther: ${claimedByOther}, total: ${duePosts.length}`)
  return NextResponse.json({ published, failed, claimedByOther, total: duePosts.length, ran_at: now.toISOString() })
}

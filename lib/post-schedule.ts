import { supabase } from '@/lib/supabase'

// Browser-side: save a scheduled post's time so the scheduler actually hears
// about it.
//
// A post goes out on time only if a post/scheduled event was queued for it
// (lib/inngest.ts publishScheduledPost). Server routes queue one; a browser
// can't. Writing scheduled_at or status straight to the table from a page
// saves the row and nothing else, and the post then waits for the backstop
// sweep in .github/workflows/publish-scheduled.yml. That sweep is written as
// every 5 minutes, but GitHub throttles scheduled workflows: on Oct 22, 2026
// it ran at 00:09, 04:45, 09:40, 14:40, 18:51 and 21:59 UTC. Onboarding's
// starter post (a new user's first post) and SOMA's approve buttons both
// depended on it, so they went out hours after the time shown.
//
// PATCH /api/posts/[id] saves the time and, for a post whose status is
// already 'scheduled', queues the wake-up. Set the status first, then call
// this. Returns whether the wake-up was queued; on false the sweep is still
// there as the fallback, so callers only log it.
export async function setScheduledTime(postId: string, scheduledAt: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`/api/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ scheduled_at: scheduledAt }),
  }).catch(() => null)
  if (!res?.ok) console.warn('[schedule] time not saved through the API for', postId, res?.status ?? 'network error')
  return !!res?.ok
}

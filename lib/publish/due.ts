// Whether a scheduled post is due yet, at the moment something tries to publish it.
//
// A scheduled post's wake-up is queued once, as a post/scheduled event that
// sleeps until the time it carried. Moving the post afterwards changes
// scheduled_at and nothing else: the calendar's drag (PATCH /api/posts/[id]),
// the queue's reorder, the drafts editor and the SOMA approve button all write
// the column directly. The sleeping run never heard about it, woke at the old
// time, saw status 'scheduled' and published. A post moved to next week went
// out today.
//
// So the publish route asks this before sending. A post that is not due is left
// alone and gets a fresh wake-up for its real time.
//
// The tolerance absorbs clock skew and the second or two between a run waking
// and reaching the route. Nothing schedules to that precision.

export const DUE_TOLERANCE_MS = 60_000

export function notDueYet(scheduledAt: string | null | undefined, now: number = Date.now()): boolean {
  if (!scheduledAt) return false
  const at = new Date(scheduledAt).getTime()
  return Number.isFinite(at) && at > now + DUE_TOLERANCE_MS
}

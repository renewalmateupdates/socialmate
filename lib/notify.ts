import type { SupabaseClient } from '@supabase/supabase-js'

// One way to write an in-app notification.
//
// There were four dialects across 19 call sites, three of them wrong:
//
//   { user_id, type, title, message, data, is_read }   correct  (6 sites)
//   { user_id, type, title, body, action_url, read }   body and action_url
//                                                      do not exist  (4 sites)
//   { user_id, type, message, action_url }             action_url does not
//                                                      exist, and title is
//                                                      NOT NULL  (3 sites)
//   ...plus one-offs carrying `action`, `workspace_id` and `from`, none of
//      which are columns either.
//
// The real table is user_id / type / title / message / data / is_read /
// created_at / read, with user_id, type and title required. Postgres rejects
// the whole row when any column is unknown, and every one of these inserts
// discarded its error, so the notifications table is empty and the sidebar bell
// has always read zero.
//
// A link belongs in `data.href` — there has never been a column for it.
//
// Same reasoning as lib/usage.ts and lib/ai-credits.ts: one implementation, so
// a fifth dialect cannot drift in.

export interface NotificationInput {
  userId: string
  type: string
  /** Required by the table. A notification with no title is not renderable. */
  title: string
  message?: string
  /** In-app destination, e.g. '/drafts'. Stored as data.href. */
  href?: string
  data?: Record<string, unknown>
}

// Fire-and-forget by design: a notification must never fail the work that
// triggered it. It does log, because silence is what let this rot for months.
export async function createNotification(
  supabase: SupabaseClient,
  input: NotificationInput,
): Promise<boolean> {
  const { userId, type, title, message, href, data } = input
  if (!userId || !type || !title) {
    console.warn('[notify] refusing incomplete notification:', { userId, type, title })
    return false
  }

  const payload: Record<string, unknown> = { user_id: userId, type, title }
  if (message) payload.message = message
  if (href || data) payload.data = { ...(data ?? {}), ...(href ? { href } : {}) }

  const { error } = await supabase.from('notifications').insert(payload)
  if (error) {
    console.warn(`[notify] ${type} insert failed (non-fatal): ${error.message}`)
    return false
  }
  return true
}

// Same write for many users, one round trip. Skips incomplete rows rather than
// failing the batch.
export async function createNotifications(
  supabase: SupabaseClient,
  inputs: NotificationInput[],
): Promise<number> {
  const rows = inputs
    .filter(i => i.userId && i.type && i.title)
    .map(i => {
      const row: Record<string, unknown> = { user_id: i.userId, type: i.type, title: i.title }
      if (i.message) row.message = i.message
      if (i.href || i.data) row.data = { ...(i.data ?? {}), ...(i.href ? { href: i.href } : {}) }
      return row
    })
  if (rows.length === 0) return 0

  const { error } = await supabase.from('notifications').insert(rows)
  if (error) {
    console.warn(`[notify] batch of ${rows.length} failed (non-fatal): ${error.message}`)
    return 0
  }
  return rows.length
}

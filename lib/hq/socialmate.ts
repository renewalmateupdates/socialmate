import type { SupabaseClient } from '@supabase/supabase-js'
import { internalIdsOf, listAllAuthUsers, oldestFirst, selectAll } from '@/lib/admin-metrics'

// The SocialMate-database half of /admin/hq: what is waiting on Joshua, what
// users have reported, what is failing, and the SM-Give recorded.
//
// Every query's error is checked. A phantom column here would otherwise read
// as a calm zero, which on a page meant to surface problems is the worst
// possible failure.

// `note` flags what the window leaves out, so a 7-day view never hides work.
export interface WaitingItem { label: string; count: number; href: string | null; note?: string }

export interface SocialMateDbSummary {
  waiting: WaitingItem[]
  // `open` is unanswered feedback sent inside the window; `older` is unanswered
  // feedback from before it.
  feedback: { open: number; older: number; recent: { type: string; message: string; email: string | null; at: string }[] }
  // Customers' posts only. `ours` counts failures on our own accounts
  // (lib/internal-accounts.ts), shown apart and never as a problem.
  publishFailures: {
    failed: number; partial: number; ours: number
    topErrors: { platform: string; reason: string; posts: number; lastAt: string }[]
  }
  // New in the window and all time, both without our own accounts.
  newSignups: number
  totalUsers: number
  smGiveCents: number
}

function must<T>(name: string, res: { data: T | null; error: { message: string } | null; count?: number | null }) {
  if (res.error) throw new Error(`${name}: ${res.error.message}`)
  return res
}

export async function socialmateDbSummary(db: SupabaseClient, sinceIso: string): Promise<SocialMateDbSummary> {
  const head = { count: 'exact' as const, head: true }

  // Feedback follows the window like everything else (until Nov 9 it was fixed
  // at 90 days, so the 7-day view still counted month-old feedback). Unanswered
  // feedback from before the window is counted apart and shown as "+N older".
  // The four request queues stay "pending now, any age": a partner application
  // from two weeks ago is still waiting, whatever the window.
  type FailedRow = { user_id: string; status: string; platforms: string[] | null; platform_errors: Record<string, unknown> | null; updated_at: string }
  const [stax, applications, payouts, whiteLabel, enterprise, feedbackOpen, feedbackOlder, feedbackRecent, allFailed, users, give] = await Promise.all([
    db.from('curated_listings').select('id', head).eq('status', 'pending'),
    db.from('affiliates').select('id', head).eq('status', 'pending_review'),
    db.from('affiliate_payouts').select('id', head).eq('status', 'requested'),
    db.from('user_settings').select('user_id', head).eq('white_label_status', 'pending'),
    db.from('enterprise_inquiries').select('id', head).gte('created_at', sinceIso),
    db.from('feedback').select('id', head).is('replied_at', null).gte('created_at', sinceIso),
    db.from('feedback').select('id', head).is('replied_at', null).lt('created_at', sinceIso),
    db.from('feedback').select('type, message, email, created_at').is('replied_at', null).gte('created_at', sinceIso)
      .order('created_at', { ascending: false }).limit(8),
    // Every row, not the first 1,000 (lib/admin-metrics.ts). Throws on error.
    selectAll<FailedRow>('posts', () => oldestFirst(db.from('posts')
      .select('user_id, status, platforms, platform_errors, updated_at')
      .in('status', ['failed', 'partial']).gte('updated_at', sinceIso))),
    // Accounts from auth: two real accounts have no profile row, so counting
    // profiles left them out of signups and the total.
    listAllAuthUsers(db),
    selectAll<{ give_cents: number | null }>('sm_give_allocations', () => oldestFirst(db.from('sm_give_allocations')
      .select('give_cents').gte('created_at', sinceIso))),
  ])
  const olderFeedback = must('feedback (older)', feedbackOlder).count ?? 0

  const waiting: WaitingItem[] = [
    { label: 'Studio Stax applications',  count: must('curated_listings', stax).count ?? 0,         href: '/admin/studio-stax' },
    { label: 'Partner applications',      count: must('affiliates', applications).count ?? 0,       href: '/admin/affiliates' },
    { label: 'Partner payout requests',   count: must('affiliate_payouts', payouts).count ?? 0,     href: '/admin/partners' },
    { label: 'White label requests',      count: must('user_settings', whiteLabel).count ?? 0,      href: '/admin/white-label' },
    { label: 'Unanswered feedback',       count: must('feedback', feedbackOpen).count ?? 0,         href: '/admin/feedback',
      note: olderFeedback ? `+${olderFeedback} older` : undefined },
    { label: 'Enterprise inquiries (new)', count: must('enterprise_inquiries', enterprise).count ?? 0, href: null },
  ]

  // Our own accounts are neither signups nor customers' problems: on Oct 22
  // seven of the twelve "failed posts" were our own SOMA posts from Sept 26,
  // counted as problems for a month.
  const internal   = internalIdsOf(users)
  const customers  = users.filter(u => !internal.has(u.id))
  const failedRows = allFailed.filter(p => !internal.has(p.user_id))
  const errors = new Map<string, { platform: string; reason: string; posts: number; lastAt: string }>()
  const tally = (platform: string, reason: string, at: string) => {
    const key = `${platform}::${reason}`
    const cur = errors.get(key) ?? { platform, reason, posts: 0, lastAt: at }
    cur.posts += 1
    if (at > cur.lastAt) cur.lastAt = at
    errors.set(key, cur)
  }
  for (const p of failedRows) {
    const entries = Object.entries(p.platform_errors ?? {})
    // Post Now did not save its errors before Oct 13 (#691). Those posts still
    // failed, so they are listed rather than silently missing from the total.
    if (entries.length === 0) {
      tally((p.platforms ?? []).join(', ') || 'unknown', 'No error was saved for this post.', p.updated_at)
      continue
    }
    for (const [platform, message] of entries) tally(platform, String(message).slice(0, 140), p.updated_at)
  }

  return {
    waiting,
    feedback: {
      open: must('feedback', feedbackOpen).count ?? 0,
      older: olderFeedback,
      recent: ((must('feedback', feedbackRecent).data ?? []) as any[]).map(f => ({
        type: f.type ?? 'feedback', message: String(f.message ?? '').slice(0, 280), email: f.email ?? null, at: f.created_at,
      })),
    },
    publishFailures: {
      failed:  failedRows.filter(p => p.status === 'failed').length,
      partial: failedRows.filter(p => p.status === 'partial').length,
      ours:    allFailed.length - failedRows.length,
      topErrors: Array.from(errors.values()).sort((a, b) => b.posts - a.posts).slice(0, 6),
    },
    newSignups: customers.filter(u => Date.parse(u.created_at) >= Date.parse(sinceIso)).length,
    totalUsers: customers.length,
    smGiveCents: give.reduce((s, r) => s + (r.give_cents ?? 0), 0),
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { INTERNAL_EMAILS, internalIdsFrom } from '@/lib/internal-accounts'

// The SocialMate-database half of /admin/hq: what is waiting on Joshua, what
// users have reported, what is failing, and the SM-Give recorded.
//
// Every query's error is checked. A phantom column here would otherwise read
// as a calm zero, which on a page meant to surface problems is the worst
// possible failure.

export interface WaitingItem { label: string; count: number; href: string | null }

export interface SocialMateDbSummary {
  waiting: WaitingItem[]
  feedback: { open: number; recent: { type: string; message: string; email: string | null; at: string }[] }
  // Customers' posts only. `ours` counts failures on our own accounts
  // (lib/internal-accounts.ts), shown apart and never as a problem.
  publishFailures: {
    failed: number; partial: number; ours: number
    topErrors: { platform: string; reason: string; posts: number; lastAt: string }[]
  }
  newSignups: number
  smGiveCents: number
}

function must<T>(name: string, res: { data: T | null; error: { message: string } | null; count?: number | null }) {
  if (res.error) throw new Error(`${name}: ${res.error.message}`)
  return res
}

export async function socialmateDbSummary(db: SupabaseClient, sinceIso: string): Promise<SocialMateDbSummary> {
  const head = { count: 'exact' as const, head: true }
  const feedbackSince = new Date(Date.now() - 90 * 86_400_000).toISOString()

  const [stax, applications, payouts, whiteLabel, enterprise, feedbackOpen, feedbackRecent, posts, profiles, give, ourProfiles] = await Promise.all([
    db.from('curated_listings').select('id', head).eq('status', 'pending'),
    db.from('affiliates').select('id', head).eq('status', 'pending_review'),
    db.from('affiliate_payouts').select('id', head).eq('status', 'requested'),
    db.from('user_settings').select('user_id', head).eq('white_label_status', 'pending'),
    db.from('enterprise_inquiries').select('id', head).gte('created_at', sinceIso),
    db.from('feedback').select('id', head).is('replied_at', null).gte('created_at', feedbackSince),
    db.from('feedback').select('type, message, email, created_at').is('replied_at', null).gte('created_at', feedbackSince)
      .order('created_at', { ascending: false }).limit(8),
    db.from('posts').select('user_id, status, platforms, platform_errors, updated_at').in('status', ['failed', 'partial']).gte('updated_at', sinceIso).limit(2000),
    db.from('profiles').select('id, email, created_at').gte('created_at', sinceIso).limit(5000),
    db.from('sm_give_allocations').select('give_cents').gte('created_at', sinceIso).limit(5000),
    db.from('profiles').select('id, email').in('email', INTERNAL_EMAILS),
  ])

  const waiting: WaitingItem[] = [
    { label: 'Studio Stax applications',  count: must('curated_listings', stax).count ?? 0,         href: '/admin/studio-stax' },
    { label: 'Partner applications',      count: must('affiliates', applications).count ?? 0,       href: '/admin/affiliates' },
    { label: 'Partner payout requests',   count: must('affiliate_payouts', payouts).count ?? 0,     href: '/admin/partners' },
    { label: 'White label requests',      count: must('user_settings', whiteLabel).count ?? 0,      href: '/admin/white-label' },
    { label: 'Unanswered feedback',       count: must('feedback', feedbackOpen).count ?? 0,         href: '/admin/feedback' },
    { label: 'Enterprise inquiries (new)', count: must('enterprise_inquiries', enterprise).count ?? 0, href: null },
  ]

  // Our own accounts are neither signups nor customers' problems. Their ids come
  // from a lookup of every internal account, not just this window's signups:
  // on Oct 22 seven of the twelve "failed posts" were our own SOMA posts from
  // Sept 26, counted as problems for a month.
  const profileRows = (must('profiles', profiles).data ?? []) as { id: string; email: string | null }[]
  const ourRows     = (must('profiles (internal)', ourProfiles).data ?? []) as { id: string; email: string | null }[]
  const internal    = internalIdsFrom([...profileRows, ...ourRows])

  type FailedRow = { user_id: string; status: string; platforms: string[] | null; platform_errors: Record<string, unknown> | null; updated_at: string }
  const allFailed  = (must('posts', posts).data ?? []) as FailedRow[]
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
    newSignups: profileRows.filter(p => !internal.has(p.id)).length,
    smGiveCents: ((must('sm_give_allocations', give).data ?? []) as { give_cents: number | null }[])
      .reduce((s, r) => s + (r.give_cents ?? 0), 0),
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { internalIdsFrom } from '@/lib/internal-accounts'

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
  publishFailures: { failed: number; partial: number; topErrors: { platform: string; reason: string; posts: number }[] }
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

  const [stax, applications, payouts, whiteLabel, enterprise, feedbackOpen, feedbackRecent, posts, profiles, give] = await Promise.all([
    db.from('curated_listings').select('id', head).eq('status', 'pending'),
    db.from('affiliates').select('id', head).eq('status', 'pending_review'),
    db.from('affiliate_payouts').select('id', head).eq('status', 'requested'),
    db.from('user_settings').select('user_id', head).eq('white_label_status', 'pending'),
    db.from('enterprise_inquiries').select('id', head).gte('created_at', sinceIso),
    db.from('feedback').select('id', head).is('replied_at', null).gte('created_at', feedbackSince),
    db.from('feedback').select('type, message, email, created_at').is('replied_at', null).gte('created_at', feedbackSince)
      .order('created_at', { ascending: false }).limit(8),
    db.from('posts').select('status, platform_errors').in('status', ['failed', 'partial']).gte('updated_at', sinceIso).limit(2000),
    db.from('profiles').select('id, email, created_at').gte('created_at', sinceIso).limit(5000),
    db.from('sm_give_allocations').select('give_cents').gte('created_at', sinceIso).limit(5000),
  ])

  const waiting: WaitingItem[] = [
    { label: 'Studio Stax applications',  count: must('curated_listings', stax).count ?? 0,         href: '/admin/studio-stax' },
    { label: 'Partner applications',      count: must('affiliates', applications).count ?? 0,       href: '/admin/affiliates' },
    { label: 'Partner payout requests',   count: must('affiliate_payouts', payouts).count ?? 0,     href: '/admin/partners' },
    { label: 'White label requests',      count: must('user_settings', whiteLabel).count ?? 0,      href: '/admin/white-label' },
    { label: 'Unanswered feedback',       count: must('feedback', feedbackOpen).count ?? 0,         href: '/admin/feedback' },
    { label: 'Enterprise inquiries (new)', count: must('enterprise_inquiries', enterprise).count ?? 0, href: null },
  ]

  const failedRows = (must('posts', posts).data ?? []) as { status: string; platform_errors: Record<string, unknown> | null }[]
  const errors = new Map<string, { platform: string; reason: string; posts: number }>()
  for (const p of failedRows) {
    for (const [platform, message] of Object.entries(p.platform_errors ?? {})) {
      const reason = String(message).slice(0, 140)
      const key = `${platform}::${reason}`
      const cur = errors.get(key) ?? { platform, reason, posts: 0 }
      cur.posts += 1
      errors.set(key, cur)
    }
  }

  // Our own accounts are not signups (lib/internal-accounts.ts).
  const profileRows = (must('profiles', profiles).data ?? []) as { id: string; email: string | null }[]
  const internal = internalIdsFrom(profileRows)

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
      topErrors: Array.from(errors.values()).sort((a, b) => b.posts - a.posts).slice(0, 6),
    },
    newSignups: profileRows.filter(p => !internal.has(p.id)).length,
    smGiveCents: ((must('sm_give_allocations', give).data ?? []) as { give_cents: number | null }[])
      .reduce((s, r) => s + (r.give_cents ?? 0), 0),
  }
}

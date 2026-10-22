import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { stripeSummary } from '@/lib/hq/stripe'

// RenewalMate for /admin/hq. It runs on its own Supabase project (the
// gilgameshenterprisellc@ stack), so it needs its own keys here:
//   RENEWALMATE_SUPABASE_URL
//   RENEWALMATE_SUPABASE_SERVICE_ROLE_KEY
// and, only if RenewalMate Plus bills through a different Stripe account than
// SocialMate, RENEWALMATE_STRIPE_SECRET_KEY. On the same account its payments
// already appear under SocialMate's "Other", so it is not read twice.

export interface RenewalMateSummary {
  users: number
  newUsers: number
  paying: number
  plans: { plan: string; count: number }[]
  revenue: { netCents: number; mrrCents: number } | null
  revenueNote: string | null
}

export function renewalmateConfigured(): boolean {
  return Boolean(process.env.RENEWALMATE_SUPABASE_URL && process.env.RENEWALMATE_SUPABASE_SERVICE_ROLE_KEY)
}

export async function renewalmateSummary(sinceIso: string, sinceSec: number): Promise<RenewalMateSummary> {
  const db = createClient(process.env.RENEWALMATE_SUPABASE_URL!, process.env.RENEWALMATE_SUPABASE_SERVICE_ROLE_KEY!)

  const { data: settings, error } = await db.from('user_settings').select('plan')
  if (error) throw new Error(`RenewalMate user_settings: ${error.message}`)

  let users = 0
  let newUsers = 0
  for (let page = 1; page <= 20; page++) {
    const { data, error: authErr } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (authErr) throw new Error(`RenewalMate users: ${authErr.message}`)
    users += data.users.length
    newUsers += data.users.filter(u => u.created_at >= sinceIso).length
    if (data.users.length < 1000) break
  }

  const planCounts = new Map<string, number>()
  for (const s of settings ?? []) planCounts.set(s.plan ?? 'free', (planCounts.get(s.plan ?? 'free') ?? 0) + 1)
  const paying = Array.from(planCounts.entries()).filter(([p]) => p !== 'free').reduce((s, [, n]) => s + n, 0)

  const key = process.env.RENEWALMATE_STRIPE_SECRET_KEY
  let revenue: RenewalMateSummary['revenue'] = null
  let revenueNote: string | null = null
  if (key && key !== process.env.STRIPE_SECRET_KEY) {
    const s = await stripeSummary(new Stripe(key, { apiVersion: '2024-06-20' as any }), sinceSec)
    revenue = { netCents: s.netCents, mrrCents: s.mrrCents }
  } else if (key) {
    revenueNote = 'Same Stripe account as SocialMate: Plus payments are counted there, under Other.'
  } else {
    revenueNote = 'Add RENEWALMATE_STRIPE_SECRET_KEY if Plus bills through its own Stripe account.'
  }

  return {
    users, newUsers, paying,
    plans: Array.from(planCounts.entries()).map(([plan, count]) => ({ plan, count })).sort((a, b) => b.count - a.count),
    revenue, revenueNote,
  }
}

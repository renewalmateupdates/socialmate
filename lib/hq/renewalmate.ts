import { createClient } from '@supabase/supabase-js'

// RenewalMate users for /admin/hq. It runs on its own Supabase project (the
// gilgameshenterprisellc@ stack), so it needs its own keys here:
//   RENEWALMATE_SUPABASE_URL
//   RENEWALMATE_SUPABASE_SERVICE_ROLE_KEY
// Its money is not read here: Plus and Family bill through the same Stripe
// account as SocialMate (confirmed Oct 22, 2026), so lib/hq/stripe.ts already
// sees those payments and lib/stripe-catalog.ts labels them RenewalMate.

export interface RenewalMateSummary {
  users: number
  newUsers: number
  paying: number
  plans: { plan: string; count: number }[]
}

export function renewalmateConfigured(): boolean {
  return Boolean(process.env.RENEWALMATE_SUPABASE_URL && process.env.RENEWALMATE_SUPABASE_SERVICE_ROLE_KEY)
}

export async function renewalmateSummary(sinceIso: string): Promise<RenewalMateSummary> {
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

  return {
    users, newUsers, paying,
    plans: Array.from(planCounts.entries()).map(([plan, count]) => ({ plan, count })).sort((a, b) => b.count - a.count),
  }
}

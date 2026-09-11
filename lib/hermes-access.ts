import type { SupabaseClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

export type HermesTier = 'admin' | 'starter' | 'pro'

// Per-tier limits. sendsPerDay exists to protect the shared Resend/Hunter.io
// infrastructure HERMES sends through today — every customer sends from the
// same domain and the same API budget, so one runaway campaign can't be
// allowed to burn either for everyone else.
//
// prospectsPerMonth and discoverRunsPerMonth back the numbers quoted on
// /hermes ("75/400 prospects per month", "1 auto-discover run/month" vs
// "weekly auto-discover cron") — those were pure marketing copy with no
// enforcement anywhere until this was added. discoverRunsPerMonth gates the
// on-demand Discover button only; the weekly cron is Pro/admin-only by tier
// (see hermesAutoDiscoverCron in lib/inngest-hermes.ts) and is rate-limited
// by its own weekly schedule, not this counter.
// hunterLookupsPerMonth exists because /api/hermes/find-email calls Hunter.io
// directly with zero rate limiting of its own. Hunter bills against one
// account-wide quota shared by every HERMES user on SocialMate — a single
// customer hammering the lookup button can exhaust the whole month's credits
// (or the whole bill) by themselves, breaking the feature for everyone else
// in the process. These numbers are conservative defaults, not derived from
// a specific Hunter plan — tune them to whatever plan is actually active.
export const HERMES_LIMITS: Record<HermesTier, {
  campaigns: number
  sendsPerDay: number
  prospectsPerMonth: number
  discoverRunsPerMonth: number
  hunterLookupsPerMonth: number
}> = {
  admin:   { campaigns: Infinity, sendsPerDay: Infinity, prospectsPerMonth: Infinity, discoverRunsPerMonth: Infinity, hunterLookupsPerMonth: Infinity },
  starter: { campaigns: 3, sendsPerDay: 25, prospectsPerMonth: 75, discoverRunsPerMonth: 1, hunterLookupsPerMonth: 30 },
  pro:     { campaigns: 10, sendsPerDay: 50, prospectsPerMonth: 400, discoverRunsPerMonth: 4, hunterLookupsPerMonth: 100 },
}

export async function getHermesAccess(
  db: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<{ allowed: boolean; tier: HermesTier | null }> {
  if (email === ADMIN_EMAIL) return { allowed: true, tier: 'admin' }

  const { data } = await db
    .from('user_settings')
    .select('hermes_active, hermes_tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data?.hermes_active) return { allowed: false, tier: null }
  const tier = (data.hermes_tier === 'pro' ? 'pro' : 'starter') as HermesTier
  return { allowed: true, tier }
}

export async function sentTodayCount(db: SupabaseClient, userId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const { count } = await db
    .from('hermes_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'sent')
    .gte('sent_at', startOfDay.toISOString())
  return count ?? 0
}

function startOfMonthUTC(): Date {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export async function prospectsAddedThisMonth(db: SupabaseClient, userId: string): Promise<number> {
  const { count } = await db
    .from('hermes_prospects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonthUTC().toISOString())
  return count ?? 0
}

// Counts on-demand Discover clicks only — the weekly cron doesn't draw from
// this (see the HERMES_LIMITS comment above).
export async function discoverRunsThisMonth(db: SupabaseClient, userId: string): Promise<number> {
  const { count } = await db
    .from('hermes_discover_runs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'manual')
    .gte('created_at', startOfMonthUTC().toISOString())
  return count ?? 0
}

// Shares hermes_discover_runs (source = 'hunter_lookup') rather than a new
// table — same shape, same purpose: log an external-API-hitting action so a
// monthly cap has real rows to count.
export async function hunterLookupsThisMonth(db: SupabaseClient, userId: string): Promise<number> {
  const { count } = await db
    .from('hermes_discover_runs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'hunter_lookup')
    .gte('created_at', startOfMonthUTC().toISOString())
  return count ?? 0
}

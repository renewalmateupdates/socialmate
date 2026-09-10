import type { SupabaseClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

export type HermesTier = 'admin' | 'starter' | 'pro'

// Per-tier limits. sendsPerDay exists to protect the shared Resend/Hunter.io
// infrastructure HERMES sends through today — every customer sends from the
// same domain and the same API budget, so one runaway campaign can't be
// allowed to burn either for everyone else.
export const HERMES_LIMITS: Record<HermesTier, { campaigns: number; sendsPerDay: number }> = {
  admin:   { campaigns: Infinity, sendsPerDay: Infinity },
  starter: { campaigns: 3, sendsPerDay: 25 },
  pro:     { campaigns: 10, sendsPerDay: 50 },
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

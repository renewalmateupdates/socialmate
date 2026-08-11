import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Runtime kill-switch check. Server only — kept out of lib/feature-flags.ts so
// the registry stays importable from client components without dragging the
// service-role client into the browser bundle.
//
// FAILS OPEN, deliberately, in three ways:
//   • no row for this flag        → enabled
//   • the query itself errors     → enabled
//   • the table does not exist    → enabled
//
// A kill switch is a lever for a cost or outage emergency. If the mechanism
// that reads it breaks, the product must keep working rather than silently
// switch itself off — the failure mode of a broken switch should be "no
// protection", not "no product".
export async function isFeatureEnabled(flag: string): Promise<boolean> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('feature_flags')
      .select('enabled')
      .eq('flag', flag)
      .maybeSingle()
    return !data || data.enabled !== false
  } catch {
    return true
  }
}

// The message shown when a switch is off. Deliberately says "paused" rather
// than "failed": this is a deliberate act by an operator, not a bug, and the
// user should expect it to come back.
export function featurePausedMessage(what: string): string {
  return `${what} is temporarily paused. Try again shortly.`
}

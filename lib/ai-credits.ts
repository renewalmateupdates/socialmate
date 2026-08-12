import type { SupabaseClient } from '@supabase/supabase-js'

// Atomic three-pool AI credit deduction. Replaces the read-modify-write that was
// copy-pasted across every AI route (which could double-spend under concurrent
// requests). Backed by the deduct_ai_credits / refund_ai_credits Postgres RPCs
// (see supabase/migrations/20260726000002_atomic_ai_credits.sql), which do the
// check-and-deduct inside a single row-locked transaction.
//
// Deploy order: the SQL migration MUST be applied before this code ships, or the
// rpc call 404s and every AI tool breaks.

export type CreditSplit = { monthly: number; earned: number; paid: number }

export type DeductResult =
  | ({ ok: true; newTotal: number; newMonthly: number; newEarned: number; newPaid: number } & CreditSplit)
  | { ok: false; reason: 'insufficient' | 'no_settings' | 'error'; total: number }

export async function deductAiCredits(
  supabase: SupabaseClient,
  userId: string,
  cost: number,
  // Which tool spent the credits. Every AI route funnels through this function,
  // so it is the one place that can answer "which tools do people actually use"
  // without instrumenting seven routes separately and forgetting the eighth.
  tool?: string
): Promise<DeductResult> {
  const { data, error } = await supabase.rpc('deduct_ai_credits', {
    p_user_id: userId,
    p_cost: cost,
  })
  if (error || !data) return { ok: false, reason: 'error', total: 0 }
  if (!data.ok) {
    return { ok: false, reason: (data.reason ?? 'error') as 'insufficient' | 'no_settings', total: data.total ?? 0 }
  }

  // Fire and forget. Usage analytics must never fail a paid AI call or slow it
  // down — the credits are already spent by the time we get here.
  if (tool) {
    void supabase
      .from('usage_events')
      .insert({
        user_id:    userId,
        event_type: 'ai_credit',
        metadata:   {
          tool,
          cost,
          monthly: data.monthly_deduct ?? 0,
          earned:  data.earned_deduct ?? 0,
          paid:    data.paid_deduct ?? 0,
        },
      })
      .then(({ error: logErr }: { error: { message: string } | null }) => {
        if (logErr) console.warn('[usage_events] ai_credit insert failed (non-fatal):', logErr.message)
      })
  }

  return {
    ok: true,
    monthly: data.monthly_deduct ?? 0,
    earned: data.earned_deduct ?? 0,
    paid: data.paid_deduct ?? 0,
    newMonthly: data.new_monthly ?? 0,
    newEarned: data.new_earned ?? 0,
    newPaid: data.new_paid ?? 0,
    newTotal: data.new_total ?? 0,
  }
}

// Restore a previously deducted split (call when the AI call fails afterward).
export async function refundAiCredits(
  supabase: SupabaseClient,
  userId: string,
  split: CreditSplit
): Promise<void> {
  await supabase.rpc('refund_ai_credits', {
    p_user_id: userId,
    p_monthly: split.monthly,
    p_earned: split.earned,
    p_paid: split.paid,
  })
}

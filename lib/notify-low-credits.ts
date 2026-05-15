/**
 * notifyLowCredits — fires an in-app notification when a user's combined
 * AI credits drop to 10 or below after an AI action.
 *
 * Idempotency: only inserts if no 'low_credits' notification was sent in the
 * last 24 hours for this user, so users aren't spammed on every request.
 *
 * Non-fatal: all errors are caught and logged; the caller is unaffected.
 */
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function notifyLowCredits(
  userId: string,
  creditsRemaining: number
): Promise<void> {
  try {
    if (creditsRemaining > 10) return

    const admin = getSupabaseAdmin()
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Idempotency: skip if we already sent one in the last 24 hours
    const { data: existing } = await admin
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'low_credits')
      .gte('created_at', cutoff)
      .limit(1)
      .maybeSingle()

    if (existing) return

    await admin.from('notifications').insert({
      user_id: userId,
      type: 'low_credits',
      title: 'Running low on credits',
      message: `You have ${creditsRemaining} credit${creditsRemaining !== 1 ? 's' : ''} left. They reset monthly, or grab a credit pack anytime.`,
      data: { action_url: '/settings?tab=plan' },
      is_read: false,
    })
  } catch (err) {
    console.error('[notifyLowCredits] non-fatal error:', err)
  }
}

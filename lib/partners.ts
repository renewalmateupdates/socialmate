import type { SupabaseClient } from '@supabase/supabase-js'

// One partner, two tables, joined by user_id:
//
//   affiliates          the application, the approval status, and the earnings.
//                       The Stripe webhook credits commission here
//                       (processAffiliateCommission, the coupon path), and the
//                       payout balance is read from here (lib/affiliate-balance.ts).
//   affiliate_profiles  the partner portal: agreement, Stripe Connect payout
//                       account, W-9, payout requests.
//
// The two ways in each created only one of them. Approving an application in
// /admin/affiliates wrote `affiliates` and nothing else, so the approved partner
// could not get past the /partners login. Accepting an invite from
// /admin/partners wrote `affiliate_profiles` and nothing else, so the partner
// could log in, but the webhook never found them and they never earned a cent.
// Both paths now call these helpers so a partner always has both rows.
//
// A partner's referral link is ?ref=<user_settings.referral_code>: proxy.ts
// stores it in the sm_ref cookie and app/auth/callback/route.ts turns it into a
// referral_conversions row at signup, which is what the webhook pays on. The
// portal used to show ?aff=<profile id>, which nothing in the app reads.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// Same format app/affiliate/page.tsx has always generated.
export async function ensureReferralCode(db: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await db
    .from('user_settings')
    .select('referral_code')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) console.warn('[partners] referral code lookup failed:', error.message)
  if (data?.referral_code) return data.referral_code

  // Partners who signed up through /partners never went through the main auth
  // callback, so they may have no user_settings row at all; the upsert creates it.
  const code = `ref_${userId.slice(0, 8)}`
  const { error: upsertErr } = await db
    .from('user_settings')
    .upsert({ user_id: userId, referral_code: code }, { onConflict: 'user_id' })
  if (upsertErr) {
    console.warn('[partners] referral code save failed:', upsertErr.message)
    return null
  }
  return code
}

export function partnerReferralLink(code: string | null, path = '/'): string | null {
  if (!code) return null
  return `${APP_URL}${path}?ref=${encodeURIComponent(code)}`
}

// After an admin approves an application: give the partner a portal profile so
// /partners lets them in to sign the agreement and set up payouts.
export async function ensurePartnerProfile(
  db: SupabaseClient,
  params: { userId: string; email: string; fullName?: string | null },
): Promise<void> {
  const { data: existing, error } = await db
    .from('affiliate_profiles')
    .select('id, status')
    .eq('user_id', params.userId)
    .maybeSingle()
  if (error) console.warn('[partners] profile lookup failed:', error.message)

  if (existing) {
    if (existing.status !== 'active') {
      const { error: updErr } = await db
        .from('affiliate_profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (updErr) console.warn('[partners] profile activate failed:', updErr.message)
    }
    return
  }

  const { error: insErr } = await db.from('affiliate_profiles').insert({
    user_id:   params.userId,
    email:     params.email.toLowerCase(),
    full_name: params.fullName || null,
    status:    'active',
  })
  if (insErr) console.warn('[partners] profile create failed:', insErr.message)
}

// After an invited partner finishes onboarding: give them the `affiliates` row
// the webhook pays into. An invite is the approval, so it starts active, except
// that an admin's suspension is never undone here.
export async function ensureAffiliateRecord(
  db: SupabaseClient,
  params: { userId: string; fullName?: string | null },
): Promise<void> {
  const { data: existing, error } = await db
    .from('affiliates')
    .select('id, status')
    .eq('user_id', params.userId)
    .maybeSingle()
  if (error) console.warn('[partners] affiliate lookup failed:', error.message)

  const now = new Date().toISOString()

  if (existing) {
    if (existing.status !== 'active' && existing.status !== 'suspended') {
      const { error: updErr } = await db
        .from('affiliates')
        .update({ status: 'active', joined_at: now, reviewed_at: now, reviewed_by: 'invite' })
        .eq('id', existing.id)
      if (updErr) console.warn('[partners] affiliate activate failed:', updErr.message)
    }
    return
  }

  const { error: insErr } = await db.from('affiliates').insert({
    user_id:        params.userId,
    status:         'active',
    full_name:      params.fullName || null,
    promotion_plan: 'Invited by SocialMate',
    why_good_fit:   'Invited by SocialMate',
    applied_at:     now,
    joined_at:      now,
    reviewed_at:    now,
    reviewed_by:    'invite',
  })
  if (insErr) console.warn('[partners] affiliate create failed:', insErr.message)
}

// Keep the portal in step with a suspension or reactivation made in
// /admin/affiliates; the portal login and payout requests check this status.
export async function syncPartnerProfileStatus(
  db: SupabaseClient,
  userId: string,
  status: 'active' | 'suspended',
): Promise<void> {
  const { error } = await db
    .from('affiliate_profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) console.warn('[partners] profile status sync failed:', error.message)
}

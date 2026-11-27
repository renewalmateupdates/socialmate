import type { SupabaseClient, User } from '@supabase/supabase-js'
import { recordFunnel } from '@/lib/usage'
import { referrerHost, type Attribution } from '@/lib/attribution'
import { inngest } from '@/lib/inngest'
import { referralCodeCandidates } from '@/lib/referral-code'

/**
 * What app/auth/callback does around a sign-in, split by whether the next page
 * needs it.
 *
 * The callback used to run every step below one after another before it sent
 * the redirect: up to ten database calls for a new account, four for a returning
 * one. Vercel measured it at 1.31 s (p75, Nov 20 to 27, 2026), and the person
 * spends that time looking at the last screen of Google's sign-in. Speed
 * Insights counts it in /onboarding's time to first byte (6.2 s on desktop and
 * 3.1 s on phones at p75), because that time runs from the click on Google's
 * consent screen through every redirect to the page.
 *
 * Two reads decide where the person goes, and the callback waits for them,
 * together: the personal workspace (ensurePersonalWorkspace) and whether
 * onboarding is done. Everything in recordSignIn is bookkeeping the next page
 * never reads, so the callback hands it to after() and it runs once the
 * redirect is on its way.
 */

type SignInUser = Pick<User, 'id' | 'email' | 'user_metadata' | 'app_metadata'>

export interface SignInContext {
  /** isFirstSignIn() (lib/new-account.ts), decided by the callback. */
  isNewAccount: boolean
  /** Where a new account came from; empty for a returning one. */
  attribution: Attribution
  /** The referral cookie the visit arrived with, if any (lib/referral-code.ts). */
  refCode?: string
}

/**
 * Gives the account its personal workspace before any page asks for it.
 *
 * Was a `.single()` read: two personal workspaces (or a failed read) came back
 * as an error with no row, and the callback created another one. A failed read
 * now creates nothing: the workspace provider copes with none, and the post
 * routes create the workspace when a post needs it.
 */
export async function ensurePersonalWorkspace(admin: SupabaseClient, userId: string): Promise<void> {
  try {
    const { data, error } = await admin
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_personal', true)
      .limit(1)
      .maybeSingle()
    if (error) {
      console.warn('[sign-in] personal workspace read failed:', error.message)
      return
    }
    if (data) return
    const { error: insertError } = await admin
      .from('workspaces')
      .insert({ owner_id: userId, name: 'Personal', is_personal: true })
    if (insertError) console.error('[sign-in] personal workspace insert failed:', insertError.message)
  } catch (err) {
    console.error('[sign-in] personal workspace error:', err)
  }
}

/**
 * The sign-in's bookkeeping, in the order the callback always ran it: the
 * referral, a new account's welcome and newsletter choice, the login count,
 * and where a new account came from. Each step logs a failure and carries on.
 */
export async function recordSignIn(admin: SupabaseClient, user: SignInUser, ctx: SignInContext): Promise<void> {
  if (ctx.refCode) await recordReferral(admin, user.id, ctx.refCode)
  if (ctx.isNewAccount) await welcomeNewAccount(admin, user, ctx.attribution)
  await countLogin(admin, user.id)
  if (ctx.isNewAccount) await saveAttribution(admin, user.id, ctx.attribution)
}

/** Credits the partner whose ?ref= link the visit came from (60-day lock). */
async function recordReferral(admin: SupabaseClient, userId: string, refCode: string): Promise<void> {
  // A value that cannot be a code (some sites add ?ref=their-name) has
  // nothing to look up.
  const candidates = referralCodeCandidates(refCode)
  if (!candidates.length) return
  try {
    const { data: referrer, error } = await admin
      .from('user_settings')
      .select('user_id, referral_code')
      .in('referral_code', candidates)
      .limit(1)
      .maybeSingle()
    if (error) {
      console.warn('[sign-in] referrer lookup failed:', error.message)
      return
    }
    if (!referrer || referrer.user_id === userId) return
    const { error: upsertError } = await admin
      .from('referral_conversions')
      .upsert({
        affiliate_user_id: referrer.user_id,
        referred_user_id:  userId,
        referral_code:     referrer.referral_code ?? refCode,
        status:            'pending',
        converted_at:      new Date().toISOString(),
        lock_expires_at:   new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      }, {
        onConflict:       'referred_user_id',
        ignoreDuplicates: true,
      })
    if (upsertError) console.error('[sign-in] referral conversion write failed:', upsertError.message)
  } catch (err) {
    console.error('[sign-in] referral tracking error:', err)
  }
}

/**
 * A new account's first sign-in: the signup_completed funnel step and the
 * welcome email sequence once (guarded by user_settings.welcome_email_sent),
 * and the newsletter choice from the signup form.
 */
async function welcomeNewAccount(admin: SupabaseClient, user: SignInUser, attribution: Attribution): Promise<void> {
  try {
    const { data: flagRow, error: flagReadError } = await admin
      .from('user_settings')
      .select('welcome_email_sent')
      .eq('user_id', user.id)
      .maybeSingle()
    if (flagReadError) console.warn('[sign-in] welcome flag read failed:', flagReadError.message)
    const alreadySent = flagRow?.welcome_email_sent === true

    // Guarded by !alreadySent so a second sign-in inside the new-account
    // window cannot record a second signup for the same person.
    if (!alreadySent) {
      const fromHost = referrerHost(attribution.referrer)
      recordFunnel(admin, user.id, 'signup_completed', {
        provider: user.app_metadata?.provider ?? 'email',
        ...(attribution.landing && { landing: attribution.landing }),
        ...(fromHost            && { referrer_host: fromHost }),
        ...(attribution.source  && { utm_source: attribution.source }),
      })
    }

    if (user.email && !alreadySent) {
      // Upsert, not update: an update on a missing row changes nothing and
      // reports no error, which left the flag unset and the guard above open.
      const { error: flagError } = await admin
        .from('user_settings')
        .upsert({ user_id: user.id, welcome_email_sent: true }, { onConflict: 'user_id' })
      if (flagError) console.error('[sign-in] welcome flag write failed:', flagError.message)

      // The onboarding email sequence (Day 0 welcome, Day 3 AI tools, Day 7
      // upgrade nudge). The id makes it idempotent: Inngest runs the sequence
      // once per account even if a second first sign-in gets this far.
      const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0]
        || (user.user_metadata?.name as string | undefined)?.split(' ')[0]
        || undefined
      await inngest.send({
        id:   `user-signup-${user.id}`,
        name: 'user/signup',
        data: { email: user.email, firstName },
      }).catch((err: unknown) => console.error('[sign-in] Failed to send user/signup event:', err))
    }

    // The IRIS newsletter choice from the signup form's metadata.
    const newsletterOptIn = user.user_metadata?.newsletter_opted_in
    if (typeof newsletterOptIn === 'boolean') {
      const { error: optInError } = await admin
        .from('user_settings')
        .upsert({ user_id: user.id, iris_opt_in: newsletterOptIn }, { onConflict: 'user_id' })
      if (optInError) console.error('[sign-in] newsletter choice write failed:', optInError.message)
    }
  } catch (err) {
    console.error('[sign-in] welcome error:', err)
  }
}

/** login_count and last_active, on every sign-in. */
async function countLogin(admin: SupabaseClient, userId: string): Promise<void> {
  try {
    const { error: rpcError } = await admin.rpc('increment_login_count', { p_user_id: userId })
    if (!rpcError) return
    // Fallback if the RPC is missing: a direct upsert.
    const { data: current } = await admin
      .from('user_settings')
      .select('login_count')
      .eq('user_id', userId)
      .maybeSingle()
    const { error: upsertError } = await admin
      .from('user_settings')
      .upsert({
        user_id:     userId,
        login_count: (current?.login_count ?? 0) + 1,
        last_active: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    if (upsertError) console.error('[sign-in] login tracking failed:', upsertError.message)
  } catch (err) {
    console.error('[sign-in] login tracking error:', err)
  }
}

/** Where a new account came from (lib/attribution.ts), kept on user_settings. */
async function saveAttribution(admin: SupabaseClient, userId: string, attribution: Attribution): Promise<void> {
  if (!(attribution.source || attribution.medium || attribution.campaign || attribution.referrer)) return
  try {
    const { error } = await admin
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...(attribution.source   && { signup_source:   attribution.source   }),
        ...(attribution.medium   && { signup_medium:   attribution.medium   }),
        ...(attribution.campaign && { signup_campaign: attribution.campaign }),
        ...(attribution.referrer && { signup_referrer: attribution.referrer }),
      }, { onConflict: 'user_id' })
    if (error) console.error('[sign-in] attribution write failed:', error.message)
  } catch (err) {
    console.error('[sign-in] attribution error:', err)
  }
}

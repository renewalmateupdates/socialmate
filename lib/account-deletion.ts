import type { SupabaseClient } from '@supabase/supabase-js'
import { oldestFirst, selectAll } from '@/lib/admin-metrics'
import { releaseRegistryForDeletion, restoreRegistryRows } from '@/lib/platform-jail'

/**
 * Deleting an account, in an order that cannot leave half an account behind.
 *
 * Until Nov 10, 2026 Settings > Delete account deleted every table first and
 * the auth user last. The auth delete fails while any row still points at the
 * user through a foreign key with no ON DELETE rule, and
 * platform_account_registry.connected_to_user is one: markConnected() writes
 * it for six platforms, and the delete never cleared it. So anyone who had
 * ever connected a platform and pressed Delete account lost their profile,
 * settings, workspaces, posts and connections, and kept their login. The
 * Settings page only logged the failure, so they saw nothing happen.
 *
 * Two accounts were found that way on Nov 10: a Google signup from April and
 * an email signup from Oct 28, each with registry rows still naming them and
 * no profiles, user_settings or workspaces row. A login with no profiles row
 * can never leave onboarding (every write of onboarding_completed is an
 * update, which matches nothing), and anything that mails from the auth user
 * list kept mailing them.
 *
 * Now: read what the cleanup needs, cancel billing, free the registry, delete
 * the auth user, and only then delete data. Most of the data goes with the
 * auth user through foreign keys that cascade; the explicit deletes catch
 * tables with no foreign key to it. If the auth delete fails, the registry is
 * put back and nothing else has been deleted, so the account still works and
 * the person is told.
 *
 * The subscription cancel is the one step that is not undone. It runs first
 * on purpose: a deleted account must never keep billing, and asking to delete
 * the account is asking to stop paying.
 */

export interface DeleteAccountInput {
  userId: string
  email: string | null | undefined
  /** Cancels a Stripe subscription. Passed in so this file needs no Stripe client. */
  cancelSubscription: (subscriptionId: string) => Promise<unknown>
  now?: Date
}

export type DeleteAccountResult =
  | { ok: true; cleanupErrors: string[] }
  | { ok: false; stage: 'read' | 'registry' | 'auth'; error: string }

/** Storage's remove() takes at most this many paths per call. */
const STORAGE_BATCH = 1000

const message = (err: unknown) => (err instanceof Error ? err.message : String(err))

export async function deleteAccount(db: SupabaseClient, input: DeleteAccountInput): Promise<DeleteAccountResult> {
  const { userId, email, cancelSubscription, now = new Date() } = input

  // 1. What the cleanup needs, read while the rows still exist. Files in the
  //    media bucket are listed by rows that cascade away with the auth user,
  //    so their paths have to be read now or never.
  let subscriptionId: string | null = null
  let affiliateId: string | null = null
  let storagePaths: string[] = []
  try {
    const [settings, affiliate, mediaItems, mediaFiles, tiktokVideos] = await Promise.all([
      db.from('user_settings').select('stripe_subscription_id').eq('user_id', userId).maybeSingle(),
      db.from('affiliate_profiles').select('id').eq('user_id', userId).maybeSingle(),
      selectAll<{ storage_path: string | null }>('media_items', () =>
        oldestFirst(db.from('media_items').select('id, storage_path').eq('user_id', userId))),
      selectAll<{ file_path: string | null }>('media_files', () =>
        oldestFirst(db.from('media_files').select('id, file_path').eq('user_id', userId))),
      selectAll<{ video_storage_path: string | null }>('tiktok_posts', () =>
        oldestFirst(db.from('tiktok_posts').select('id, video_storage_path').eq('user_id', userId))),
    ])
    if (settings.error) throw new Error(`user_settings: ${settings.error.message}`)
    if (affiliate.error) throw new Error(`affiliate_profiles: ${affiliate.error.message}`)
    subscriptionId = (settings.data?.stripe_subscription_id as string | null | undefined) ?? null
    affiliateId = (affiliate.data?.id as string | undefined) ?? null
    const paths = [
      ...mediaItems.map(r => r.storage_path),
      ...mediaFiles.map(r => r.file_path),
      ...tiktokVideos.map(r => r.video_storage_path),
    ].filter((p): p is string => !!p)
    storagePaths = Array.from(new Set(paths))
  } catch (err) {
    return { ok: false, stage: 'read', error: message(err) }
  }

  // 2. Billing. Logged, not blocking: a subscription that was already
  //    cancelled keeps its id in user_settings, and cancelling it again errors.
  if (subscriptionId) {
    try {
      await cancelSubscription(subscriptionId)
    } catch (err) {
      console.error('[account-deletion] Stripe cancel failed:', message(err))
    }
  }

  // 3. The registry rows that name this account. The auth user cannot be
  //    deleted while they do.
  let released
  try {
    released = await releaseRegistryForDeletion(db, userId, now)
  } catch (err) {
    return { ok: false, stage: 'registry', error: message(err) }
  }

  // 4. The auth user. On failure, put the registry back: nothing else has
  //    been touched, so the account is as it was.
  const { error: authError } = await db.auth.admin.deleteUser(userId)
  if (authError) {
    await restoreRegistryRows(db, released)
    return { ok: false, stage: 'auth', error: authError.message }
  }

  // 5. The data. The account is gone from here on, so a failure is collected
  //    and reported, never returned as a failed delete.
  const cleanupErrors: string[] = []
  const run = async (label: string, query: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await query
    if (error) cleanupErrors.push(`${label}: ${error.message}`)
  }

  // Post destinations before workspaces (FK -> workspaces).
  await run('post_destinations', db.from('post_destinations').delete().eq('user_id', userId))
  await run('posts', db.from('posts').delete().eq('user_id', userId))

  // team_members has no user_id column. Membership of other people's teams is
  // keyed by email (see /api/team/accept, lib/team-workspaces.ts), and the
  // people this account invited hang off owner_id.
  if (email) await run('team_members (joined)', db.from('team_members').delete().eq('email', email))
  await run('team_members (invited)', db.from('team_members').delete().eq('owner_id', userId))
  await run('workspaces', db.from('workspaces').delete().eq('owner_id', userId))

  await run('connected_accounts', db.from('connected_accounts').delete().eq('user_id', userId))
  await run('media_items', db.from('media_items').delete().eq('user_id', userId))
  await run('media_files', db.from('media_files').delete().eq('user_id', userId))
  await run('tiktok_posts', db.from('tiktok_posts').delete().eq('user_id', userId))
  await run('bio_pages', db.from('bio_pages').delete().eq('user_id', userId))
  await run('link_in_bio', db.from('link_in_bio').delete().eq('user_id', userId))
  await run('post_templates', db.from('post_templates').delete().eq('user_id', userId))
  await run('hashtag_collections', db.from('hashtag_collections').delete().eq('user_id', userId))
  await run('competitor_accounts', db.from('competitor_accounts').delete().eq('user_id', userId))

  // These five are keyed by affiliate_id (affiliate_profiles.id), not user_id.
  // affiliate_tax_forms holds a legal name and the last four of a tax id.
  if (affiliateId) {
    await run('affiliate_conversions', db.from('affiliate_conversions').delete().eq('affiliate_id', affiliateId))
    await run('affiliate_notifications', db.from('affiliate_notifications').delete().eq('affiliate_id', affiliateId))
    await run('affiliate_payouts', db.from('affiliate_payouts').delete().eq('affiliate_id', affiliateId))
    await run('affiliate_promo_codes', db.from('affiliate_promo_codes').delete().eq('affiliate_id', affiliateId))
    await run('affiliate_tax_forms', db.from('affiliate_tax_forms').delete().eq('affiliate_id', affiliateId))
  }
  await run('affiliate_profiles', db.from('affiliate_profiles').delete().eq('user_id', userId))
  await run('affiliates', db.from('affiliates').delete().eq('user_id', userId))
  await run('referral_conversions', db.from('referral_conversions').delete().eq('referred_user_id', userId))
  await run('invite_tokens', db.from('invite_tokens').delete().eq('owner_id', userId))

  await run('notifications', db.from('notifications').delete().eq('user_id', userId))
  // The two tables the half-deleted accounts still had rows in. usage_events
  // cascades with the auth user (its migration says so). user_achievements was
  // made in the dashboard, so no migration says either way: deleting both here
  // covers a table with no foreign key at all. One with a foreign key and no
  // ON DELETE rule would stop step 4 instead, with nothing lost.
  await run('usage_events', db.from('usage_events').delete().eq('user_id', userId))
  await run('user_achievements', db.from('user_achievements').delete().eq('user_id', userId))
  await run('user_settings', db.from('user_settings').delete().eq('user_id', userId))
  await run('feedback', db.from('feedback').delete().eq('user_id', userId))
  await run('profiles', db.from('profiles').delete().eq('id', userId))

  // 6. Files, now that nothing points at them.
  for (let i = 0; i < storagePaths.length; i += STORAGE_BATCH) {
    const { error } = await db.storage.from('media').remove(storagePaths.slice(i, i + STORAGE_BATCH))
    if (error) cleanupErrors.push(`storage: ${error.message}`)
  }

  return { ok: true, cleanupErrors }
}

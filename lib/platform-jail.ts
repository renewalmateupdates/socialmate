import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * The 45-day reconnect pause on connected platform accounts.
 *
 * It exists for one abuse case: a single X, TikTok, Bluesky, Mastodon,
 * Telegram or Discord account being handed from one SocialMate user to
 * another, each picking up a fresh quota with it. It was never meant to stop
 * anyone reconnecting their own account, and our own messages tell people to
 * do exactly that when a token expires or a connection breaks.
 *
 * X was fixed for that in b3baaa8b: its disconnect kept the owner and its
 * callback let the owner back in. The other five platforms each had their own
 * copy of the check, never got the fix, and nulled the owner on disconnect, so
 * anyone who disconnected and reconnected their own TikTok, Bluesky, Mastodon,
 * Telegram or Discord was refused for six weeks. Every registry read and write
 * goes through this file now, so the six copies cannot drift apart again.
 */

export const COOLING_DAYS = 45

export type JailPlatform = 'twitter' | 'tiktok' | 'bluesky' | 'mastodon' | 'telegram' | 'discord'

export interface RegistryRecord {
  status: string | null
  connected_to_user: string | null
  cooling_until: string | null
}

export type ReconnectVerdict =
  | { allowed: true }
  | { allowed: false; reason: 'already_connected' }
  | { allowed: false; reason: 'in_cooldown'; until: string }

/**
 * Whether `userId` may connect the platform account this registry row is for.
 * Pure, so the decision can be tested without a database.
 */
export function reconnectVerdict(
  record: RegistryRecord | null,
  userId: string,
  now: Date = new Date(),
): ReconnectVerdict {
  if (!record) return { allowed: true }
  // The owner coming back is never the abuse case, whatever the status says.
  if (record.connected_to_user === userId) return { allowed: true }
  if (record.status === 'active') return { allowed: false, reason: 'already_connected' }
  if (record.status === 'cooling' && record.cooling_until) {
    const until = new Date(record.cooling_until)
    if (until > now) return { allowed: false, reason: 'in_cooldown', until: until.toISOString() }
  }
  return { allowed: true }
}

/**
 * Reads the registry row and decides. A failed read lets the connect through,
 * as it always has: refusing every connect because the registry could not be
 * read would lock everyone out at once, which is worse than the abuse case.
 */
export async function checkReconnect(
  platform: JailPlatform,
  platformAccountId: string,
  userId: string,
): Promise<ReconnectVerdict> {
  const { data, error } = await getSupabaseAdmin()
    .from('platform_account_registry')
    .select('status, connected_to_user, cooling_until')
    .eq('platform', platform)
    .eq('platform_account_id', platformAccountId)
    .maybeSingle()
  if (error) console.warn(`[platform-jail] ${platform} registry read failed, allowing:`, error.message)
  return reconnectVerdict((data as RegistryRecord | null) ?? null, userId)
}

/** Records that `userId` now holds this platform account. */
export async function markConnected(
  platform: JailPlatform,
  platformAccountId: string,
  userId: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('platform_account_registry')
    .upsert(
      {
        platform,
        platform_account_id: platformAccountId,
        connected_to_user: userId,
        status: 'active',
        disconnected_at: null,
        cooling_until: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'platform,platform_account_id' },
    )
  if (error) console.warn(`[platform-jail] ${platform} registry upsert failed:`, error.message)
}

/**
 * Starts the pause after a disconnect. The owner is deliberately kept: it is
 * what lets reconnectVerdict tell the owner coming back apart from someone
 * else picking the account up.
 */
export async function startCooling(
  platform: JailPlatform,
  platformAccountId: string,
  now: Date = new Date(),
): Promise<void> {
  const until = new Date(now.getTime() + COOLING_DAYS * 24 * 60 * 60 * 1000)
  const { error } = await getSupabaseAdmin()
    .from('platform_account_registry')
    .update({
      status: 'cooling',
      disconnected_at: now.toISOString(),
      cooling_until: until.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('platform', platform)
    .eq('platform_account_id', platformAccountId)
  if (error) console.warn(`[platform-jail] ${platform} cooling write failed:`, error.message)
}

import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * A TikTok access token that is definitely still valid.
 *
 * The refresh used to be wrapped in `if (account.expires_at)`, so a row with no
 * expiry recorded never refreshed at all. TikTok access tokens live 24 hours.
 * The admin account connected on 5 May with a NULL expires_at and was still
 * sending that same dead token four months later, which TikTok answered with
 * `access_token_invalid` — an error that reads like a broken integration rather
 * than an expired session, and had nothing anywhere to say which.
 *
 * A missing expiry is not evidence of freshness. It is the absence of evidence,
 * and it is now treated as expired.
 */

export type TikTokAuth =
  | { ok: true; token: string; openId: string }
  | { ok: false; reason: 'not_connected' | 'reconnect_required'; message: string }

const RECONNECT =
  'Your TikTok connection has expired. Reconnect TikTok on the Accounts page and try again.'

export async function getValidAccessToken(userId: string): Promise<TikTokAuth> {
  const { data: account, error } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, expires_at, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (error) {
    console.warn('[tiktok-auth] account lookup failed:', error.message)
    return { ok: false, reason: 'not_connected', message: 'Could not read your TikTok connection.' }
  }
  if (!account) {
    return { ok: false, reason: 'not_connected', message: 'No TikTok account connected.' }
  }

  // Refresh when the token is near expiry OR when we have no expiry on record.
  // The second case is the one that was missing.
  const expiresAt = account.expires_at ? new Date(account.expires_at).getTime() : null
  const unverifiable = expiresAt === null
  const nearExpiry = expiresAt !== null && expiresAt - Date.now() < 5 * 60 * 1000

  if (!unverifiable && !nearExpiry) {
    return { ok: true, token: account.access_token, openId: account.platform_user_id }
  }

  if (!account.refresh_token) {
    return { ok: false, reason: 'reconnect_required', message: RECONNECT }
  }

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type:    'refresh_token',
      refresh_token: account.refresh_token,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.warn('[tiktok-auth] refresh failed:', res.status, body.slice(0, 200))
    // The old code warned and returned the stale token anyway, which is how a
    // dead token reached TikTok and came back as an opaque error. If we could
    // not refresh a token we could not vouch for, say so plainly instead.
    return { ok: false, reason: 'reconnect_required', message: RECONNECT }
  }

  const data = await res.json().catch(() => null)
  if (!data?.access_token) {
    console.warn('[tiktok-auth] refresh returned no access_token')
    return { ok: false, reason: 'reconnect_required', message: RECONNECT }
  }

  // Always write an expiry back, even if TikTok omits expires_in, so this row
  // can never fall into the unverifiable state that caused the bug.
  const expires_at = new Date(
    Date.now() + (typeof data.expires_in === 'number' ? data.expires_in : 24 * 60 * 60) * 1000
  ).toISOString()

  const { error: updateError } = await getSupabaseAdmin()
    .from('connected_accounts')
    .update({
      access_token:  data.access_token,
      refresh_token: data.refresh_token ?? account.refresh_token,
      expires_at,
    })
    .eq('id', account.id)

  // Non-fatal: the token in hand is good for this request even if persisting it
  // failed, and the next call will simply refresh again.
  if (updateError) console.warn('[tiktok-auth] token write-back failed:', updateError.message)

  return { ok: true, token: data.access_token, openId: account.platform_user_id }
}

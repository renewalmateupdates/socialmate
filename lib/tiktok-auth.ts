import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * A TikTok access token that is definitely still valid.
 *
 * Refreshes when the stored token is within five minutes of expiry. Extracted
 * from init-upload, which held one of two identical copies of this — the other
 * being in post/route.ts. A third copy was about to be written for the publish
 * status poll, which is the point at which the same token logic drifting in
 * three places stops being hypothetical.
 */
export async function getValidAccessToken(
  userId: string
): Promise<{ token: string; openId: string } | null> {
  const { data: account, error } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, expires_at, platform_user_id')
    .eq('user_id', userId)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (error) {
    console.warn('[tiktok-auth] account lookup failed:', error.message)
    return null
  }
  if (!account) return null

  let token = account.access_token

  if (account.expires_at) {
    const expiresAt = new Date(account.expires_at)
    if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000 && account.refresh_token) {
      const clientKey    = process.env.TIKTOK_CLIENT_KEY!
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET!
      const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientKey, client_secret: clientSecret,
          grant_type: 'refresh_token', refresh_token: account.refresh_token,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const expires_at = data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : null
        await getSupabaseAdmin()
          .from('connected_accounts')
          .update({ access_token: data.access_token, refresh_token: data.refresh_token, expires_at })
          .eq('id', account.id)
        token = data.access_token
      } else {
        // Not fatal on its own — the existing token may still have minutes left
        // — but silence here turns into an opaque 401 further down the call.
        console.warn('[tiktok-auth] token refresh failed:', res.status)
      }
    }
  }

  return { token, openId: account.platform_user_id }
}

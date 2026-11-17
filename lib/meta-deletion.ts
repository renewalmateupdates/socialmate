import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * Deletes every Instagram, Facebook and Threads connection tied to one Meta
 * user, for Meta's "Deauthorize"/"Uninstall" and "Data deletion request"
 * callbacks. Meta identifies the person by an app-scoped id, which SocialMate
 * keeps on the row:
 *   Facebook Pages  metadata.fb_user_id   (the person who connected the Page)
 *   Instagram       metadata.system_user_id (Unified Login), metadata.app_scoped_id,
 *                   and platform_user_id as a fallback
 *   Threads         platform_user_id
 *
 * Only the connection rows are removed (tokens, ids, names, avatar URLs).
 * Posts the person wrote in SocialMate are their SocialMate data, not Meta's,
 * and stay until they delete their SocialMate account.
 */
export async function deleteMetaConnections(
  metaUserId: string,
  reason: 'deauthorize' | 'data_deletion',
): Promise<{ confirmationCode: string; rows: number }> {
  const confirmationCode = crypto.randomBytes(6).toString('hex')

  // Meta ids are numeric. Anything else is refused before it reaches a filter string.
  if (!/^\d{1,40}$/.test(metaUserId)) {
    console.warn('[meta-deletion] ignoring non-numeric user id')
    return { confirmationCode, rows: 0 }
  }

  const db = getSupabaseAdmin()
  const { data: rows, error } = await db
    .from('connected_accounts')
    .select('id, user_id, platform')
    .in('platform', ['instagram', 'facebook', 'threads'])
    .or(
      `platform_user_id.eq.${metaUserId},` +
      `metadata->>fb_user_id.eq.${metaUserId},` +
      `metadata->>app_scoped_id.eq.${metaUserId},` +
      `metadata->>system_user_id.eq.${metaUserId}`,
    )

  if (error) {
    console.error('[meta-deletion] lookup failed:', error)
    return { confirmationCode, rows: 0 }
  }
  if (!rows || rows.length === 0) {
    console.log(`[meta-deletion] ${reason} ${confirmationCode}: nothing stored for that Meta user`)
    return { confirmationCode, rows: 0 }
  }

  const ids = rows.map(r => r.id)
  const { error: delErr } = await db.from('connected_accounts').delete().in('id', ids)
  if (delErr) {
    console.error('[meta-deletion] delete failed:', delErr)
    return { confirmationCode, rows: 0 }
  }

  // One audit line per SocialMate user affected, so a request can be traced by
  // its confirmation code. Fire-and-forget, but logged if it fails.
  const byUser = new Map<string, string[]>()
  rows.forEach(r => {
    const list = byUser.get(r.user_id) ?? []
    list.push(r.platform)
    byUser.set(r.user_id, list)
  })
  const events = Array.from(byUser.entries()).map(([userId, platforms]) => ({
    user_id:    userId,
    event_type: 'meta_data_deletion',
    metadata:   { reason, confirmation_code: confirmationCode, platforms },
  }))
  const { error: logErr } = await db.from('usage_events').insert(events)
  if (logErr) console.warn('[meta-deletion] audit insert failed:', logErr.message)

  console.log(`[meta-deletion] ${reason} ${confirmationCode}: removed ${ids.length} connection(s)`)
  return { confirmationCode, rows: ids.length }
}

/** Meta posts `signed_request` form-encoded. Reads it from either body shape. */
export async function readSignedRequest(request: Request): Promise<string | null> {
  const type = request.headers.get('content-type') || ''
  try {
    if (type.includes('application/json')) {
      const body = await request.json()
      return typeof body?.signed_request === 'string' ? body.signed_request : null
    }
    const text = await request.text()
    return new URLSearchParams(text).get('signed_request')
  } catch {
    return null
  }
}

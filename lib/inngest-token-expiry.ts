import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { createNotification } from '@/lib/notify'
import { sendMail } from '@/lib/mail'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
const DAY_MS  = 86_400_000

// Tell people before a connection dies, not after the post fails.
//
// LinkedIn access tokens last 60 days and there is no refresh token, so every
// LinkedIn connection silently stops working on a fixed date. Nothing warned
// anyone: a post to an expired account just fails with "please reconnect",
// which is how the first LinkedIn connection (May 21) was dead from July 20 and
// seven posts failed on it on Sept 26 with nobody the wiser.
//
// Only platforms whose tokens genuinely expire without a refresh are listed.
// Bluesky, Mastodon and TikTok refresh themselves.
const EXPIRING_PLATFORMS: Record<string, { label: string; reconnectPath: string }> = {
  linkedin: { label: 'LinkedIn', reconnectPath: '/accounts' },
}

const WARN_DAYS = 7
const EVENT     = 'token_expiry_warned'

export const tokenExpiryWarnings = inngest.createFunction(
  { id: 'token-expiry-warnings', name: 'Connection Expiry Warnings', retries: 1 },
  { cron: '0 16 * * *' },
  async ({ step }) => {
    const now     = Date.now()
    const horizon = new Date(now + WARN_DAYS * DAY_MS).toISOString()
    // Also catch ones that lapsed in the last 3 days, so a cron outage or a
    // late deploy does not skip somebody. Older than that is a different
    // conversation, not a reminder.
    const floor   = new Date(now - 3 * DAY_MS).toISOString()

    const due = await step.run('find-expiring', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('connected_accounts')
        .select('id, user_id, platform, account_name, expires_at')
        .in('platform', Object.keys(EXPIRING_PLATFORMS))
        .gte('expires_at', floor)
        .lte('expires_at', horizon)
        .limit(500)
      if (error) throw new Error(`expiring-accounts lookup failed: ${error.message}`)
      return data ?? []
    })

    let warned = 0
    for (const acct of due) {
      const sent = await step.run(`warn-${acct.id}`, async () => {
        const db = getSupabaseAdmin()

        // One warning per connection per expiry date. Reconnecting moves
        // expires_at forward, so the next cycle warns again, as it should.
        const { data: prior, error: priorErr } = await db
          .from('usage_events')
          .select('id')
          .eq('user_id', acct.user_id)
          .eq('event_type', EVENT)
          .contains('metadata', { account_id: acct.id, expires_at: acct.expires_at })
          .limit(1)
        if (priorErr) throw new Error(`idempotency lookup failed: ${priorErr.message}`)
        if (prior && prior.length > 0) return false

        const meta     = EXPIRING_PLATFORMS[acct.platform]
        const expires  = new Date(acct.expires_at as string)
        const daysLeft = Math.ceil((expires.getTime() - Date.now()) / DAY_MS)
        const when     = daysLeft <= 0 ? 'has expired' : daysLeft === 1 ? 'expires tomorrow' : `expires in ${daysLeft} days`
        const name     = acct.account_name ? ` (${acct.account_name})` : ''

        await createNotification(db, {
          userId:  acct.user_id,
          type:    'connection_expiring',
          title:   `Your ${meta.label} connection ${when}`,
          message: `${meta.label} only keeps a connection for 60 days. Reconnect it so scheduled posts keep going out.`,
          href:    meta.reconnectPath,
          data:    { platform: acct.platform, account_id: acct.id },
        })

        const { data: authUser } = await db.auth.admin.getUserById(acct.user_id)
        const email = authUser?.user?.email
        if (email) {
          try {
            await sendMail({
              to: email,
              subject: `Your ${meta.label} connection ${when}`,
              html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#18181b;">
                <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hi,</p>
                <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
                  Your ${meta.label} connection${name} ${when}. ${meta.label} only lets an app stay connected for 60 days,
                  so this happens to everyone and it is not something you did.
                </p>
                <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">
                  Reconnecting takes two clicks and keeps your scheduled posts going out.
                </p>
                <a href="${APP_URL}${meta.reconnectPath}" style="display:inline-block;background:#18181b;color:#ffffff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">Reconnect ${meta.label}</a>
                <p style="font-size:13px;color:#71717a;margin-top:28px;">Joshua, SocialMate. Reply to this if anything looks wrong, it reaches me.</p>
              </div>`,
            })
          } catch (err) {
            console.warn('[token-expiry] email failed (non-fatal):', err instanceof Error ? err.message : err)
          }
        }

        const { error: markErr } = await db.from('usage_events').insert({
          user_id: acct.user_id,
          event_type: EVENT,
          metadata: { account_id: acct.id, platform: acct.platform, expires_at: acct.expires_at },
        })
        if (markErr) console.warn('[token-expiry] could not record warning (may repeat tomorrow):', markErr.message)
        return true
      })
      if (sent) warned++
    }

    return { checked: due.length, warned }
  }
)

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'SocialMate <hello@socialmate.studio>'

// Renewal price for annual listings
const RENEWAL_PRICE_USD = 80

function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function urgencyLabel(days: number) {
  if (days <= 7)  return { emoji: '🚨', label: 'Final notice', color: '#ef4444' }
  if (days <= 14) return { emoji: '⚠️', label: '2 weeks left', color: '#f59e0b' }
  return { emoji: '📬', label: '30 days left', color: '#3b82f6' }
}

function emailHtml(opts: {
  name: string
  toolName: string
  daysLeft: number
  expiresAt: string
  renewalLink: string
}) {
  const { emoji, label, color } = urgencyLabel(opts.daysLeft)
  const expDate = new Date(opts.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

      <!-- Header -->
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">by SocialMate</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <div style="background:${color}15;border:1px solid ${color}40;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0;font-size:20px;">${emoji}</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:${color};">${label} — ${opts.daysLeft} day${opts.daysLeft !== 1 ? 's' : ''} until expiration</p>
        </div>

        <p style="margin:0 0 12px;font-size:14px;color:#374151;">Hey ${opts.name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          Your <strong>${opts.toolName}</strong> listing in Studio Stax expires on <strong>${expDate}</strong>.
          Renew before then to keep your spot — early renewal is locked in at <strong>$${RENEWAL_PRICE_USD}/year</strong>, saving you $69 off the standard rate.
        </p>

        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">What you keep</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#374151;line-height:1.8;">
            <li>Your listing in the SM-Give ranked directory</li>
            <li>Your top-pick status if you held it</li>
            <li>All SM-Give donation credit toward your ranking</li>
          </ul>
        </div>

        <a href="${opts.renewalLink}" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Renew now — $${RENEWAL_PRICE_USD}/year →
        </a>

        <!-- RenewalMate promo -->
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">From the SocialMate family</p>
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111;">Track every recurring expense — free.</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b7280;line-height:1.5;">
            RenewalMate helps creators and businesses see all their subscriptions in one place, catch unused tools, and cut costs. Manual entry for now — and always free to start.
          </p>
          <a href="https://renewalmate.com" style="font-size:12px;font-weight:700;color:#f59e0b;text-decoration:none;">Check out RenewalMate →</a>
        </div>

        <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
          Questions? Reply to this email or reach us at <a href="mailto:hello@socialmate.studio" style="color:#9ca3af;">hello@socialmate.studio</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;font-size:10px;color:#d1d5db;margin-top:16px;">SocialMate · by Gilgamesh Enterprise LLC · Unsubscribe from renewal reminders in your account settings</p>
  </div>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const now   = new Date()
  let sent = 0, errors = 0

  // Fetch all active annual slots not yet expired
  const { data: slots, error } = await admin
    .from('studio_stax_slots')
    .select('id, buyer_name, buyer_email, listing_id, billing_type, expires_at, renewal_email_30_sent, renewal_email_14_sent, renewal_email_7_sent')
    .eq('status', 'active')
    .eq('billing_type', 'annual')
    .gt('expires_at', now.toISOString())

  if (error) {
    console.error('[StaxRenewals] Query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch listing names
  const listingIds = Array.from(new Set((slots ?? []).map((s: any) => s.listing_id).filter(Boolean)))
  const listingNameMap: Record<string, string> = {}
  if (listingIds.length > 0) {
    const { data: listingRows } = await admin
      .from('curated_listings')
      .select('id, name')
      .in('id', listingIds)
    for (const r of listingRows ?? []) listingNameMap[r.id] = r.name
  }

  const renewalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'}/studio-stax/apply`

  for (const slot of slots ?? []) {
    const days = daysUntil(slot.expires_at)

    const needsEmail =
      (days <= 30 && days > 14 && !slot.renewal_email_30_sent) ||
      (days <= 14 && days > 7  && !slot.renewal_email_14_sent) ||
      (days <= 7  && days >= 0  && !slot.renewal_email_7_sent)

    if (!needsEmail) continue

    const toolName   = listingNameMap[slot.listing_id] || 'your tool'
    const subject30  = `Your Studio Stax listing expires in ${days} days — renew for $${RENEWAL_PRICE_USD}`
    const subject14  = `⚠️ 2 weeks left — renew your Studio Stax listing at $${RENEWAL_PRICE_USD}`
    const subject7   = `🚨 7 days left — last chance to renew your Studio Stax listing`

    const subject = days <= 7 ? subject7 : days <= 14 ? subject14 : subject30

    try {
      await resend.emails.send({
        from: FROM,
        to:   slot.buyer_email,
        subject,
        html: emailHtml({ name: slot.buyer_name, toolName, daysLeft: days, expiresAt: slot.expires_at, renewalLink }),
      })

      // Mark email sent
      const updateField =
        days <= 7  ? 'renewal_email_7_sent'  :
        days <= 14 ? 'renewal_email_14_sent' :
                     'renewal_email_30_sent'

      await admin
        .from('studio_stax_slots')
        .update({ [updateField]: true })
        .eq('id', slot.id)

      sent++
    } catch (err) {
      console.error(`[StaxRenewals] Failed to send to ${slot.buyer_email}:`, err)
      errors++
    }
  }

  return NextResponse.json({ ok: true, sent, errors, checked: (slots ?? []).length })
}

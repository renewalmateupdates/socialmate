export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'SocialMate <hello@socialmate.studio>'

// Renewal = 20% off what the member originally paid.
// We derive this from amount_paid_cents — no tier column dependency.
function renewalPrice(amountPaidCents: number): number {
  return Math.round(amountPaidCents * 0.80 / 100) // returns dollars
}

function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function urgencyLabel(days: number) {
  if (days <= 7)  return { emoji: '🚨', label: 'Final notice', color: '#ef4444' }
  if (days <= 14) return { emoji: '⚠️', label: '2 weeks left', color: '#f59e0b' }
  return { emoji: '📬', label: '30 days left', color: '#3b82f6' }
}

function renewalEmail(opts: {
  name: string; toolName: string; daysLeft: number; expiresAt: string
  renewalLink: string; renewalPrice: number; tier: string
}) {
  const { emoji, label, color } = urgencyLabel(opts.daysLeft)
  const expDate = new Date(opts.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const isFounding = opts.tier === 'founding'
  const savingsNote = isFounding
    ? `you save $20 off the $100/yr founding rate`
    : `you save $30 off the $150/yr standard rate`

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">by SocialMate</h1>
      </div>
      <div style="padding:32px;">
        <div style="background:${color}15;border:1px solid ${color}40;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0;font-size:20px;">${emoji}</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:${color};">${label} — ${opts.daysLeft} day${opts.daysLeft !== 1 ? 's' : ''} until expiration</p>
        </div>

        <p style="margin:0 0 12px;font-size:14px;color:#374151;">Hey ${opts.name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          Your <strong>${opts.toolName}</strong> listing in Studio Stax expires on <strong>${expDate}</strong>.
          Renew before then to keep your spot — early renewal locks in at <strong>$${opts.renewalPrice}/year</strong> (${savingsNote}).
        </p>

        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">What you keep on renewal</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#374151;line-height:1.8;">
            <li>Your listing in the SM-Give ranked directory</li>
            <li>Your ${isFounding ? 'founding member' : 'standard'} tier status</li>
            <li>All SM-Give donation credit toward your ranking</li>
            ${isFounding ? '<li>If you let it lapse, your founding spot opens to others</li>' : ''}
          </ul>
        </div>

        <a href="${opts.renewalLink}" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Renew now — $${opts.renewalPrice}/year →
        </a>

        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">From the SocialMate family</p>
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111;">Track every recurring expense free with RenewalMate</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b7280;line-height:1.5;">
            Keep tabs on your Studio Stax renewal — and all your other tools — with RenewalMate. Always free to start.
          </p>
          <a href="https://renewalmate.com" style="font-size:12px;font-weight:700;color:#f59e0b;text-decoration:none;">renewalmate.com →</a>
        </div>

        <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
          Questions? Reply to this email or reach us at <a href="mailto:hello@socialmate.studio" style="color:#9ca3af;">hello@socialmate.studio</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;font-size:10px;color:#d1d5db;margin-top:16px;">SocialMate · by Gilgamesh Enterprise LLC</p>
  </div>
</body>
</html>`
}

function reclaimEmail(opts: {
  name: string; toolName: string; offerLink: string
}) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">A founding spot just opened 🎉</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">Hey ${opts.name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          A founding member didn't renew their Studio Stax listing — which means their spot just opened up.
          As someone currently on the standard rate, you're first in line to claim it.
        </p>
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">Founding spot upgrade offer</p>
          <p style="margin:0;font-size:13px;color:#78350f;line-height:1.5;">
            Your <strong>${opts.toolName}</strong> listing can renew at <strong>$80/yr</strong> instead of $120/yr.
            That's the founding member renewal rate — locked in for as long as you keep renewing.
          </p>
        </div>
        <a href="${opts.offerLink}" style="display:block;text-align:center;background:#f59e0b;color:#000;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Claim founding rate — $80/yr →
        </a>
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
          This offer is first-come-first-served. Reply to this email if you have questions.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin      = getSupabaseAdmin()
  const now        = new Date()
  let sent = 0, errors = 0, reclaims = 0

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  // ── 1. Renewal reminder emails ────────────────────────────────────────────
  const { data: slots, error } = await admin
    .from('studio_stax_slots')
    .select('id, buyer_name, buyer_email, listing_id, amount_paid_cents, expires_at, renewal_email_30_sent, renewal_email_14_sent, renewal_email_7_sent, renewal_token')
    .eq('status', 'active')
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

  for (const slot of slots ?? []) {
    const days = daysUntil(slot.expires_at)
    const needsEmail =
      (days <= 30 && days > 14 && !slot.renewal_email_30_sent) ||
      (days <= 14 && days > 7  && !slot.renewal_email_14_sent) ||
      (days <= 7  && days >= 0  && !slot.renewal_email_7_sent)

    if (!needsEmail) continue

    const toolName     = listingNameMap[slot.listing_id] || 'your tool'
    const renewal      = renewalPrice(slot.amount_paid_cents ?? 10000)
    // Derive tier label from amount paid (no tier column dependency)
    const tierLabel    = (slot.amount_paid_cents ?? 10000) <= 10000 ? 'founding' : 'standard'
    // Generate a fresh renewal token (valid 14 days) so the link is unique per send
    const { randomUUID } = await import('crypto')
    const token        = slot.renewal_token || randomUUID()
    const tokenExpires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    if (!slot.renewal_token) {
      await admin.from('studio_stax_slots')
        .update({ renewal_token: token, renewal_token_expires: tokenExpires.toISOString() })
        .eq('id', slot.id)
    }
    const renewalLink  = `${appUrl}/studio-stax/renew?token=${token}`
    const subject      = days <= 7
      ? `🚨 ${days} days left — renew ${toolName} in Studio Stax`
      : days <= 14
      ? `⚠️ 2 weeks left — renew your Studio Stax listing at $${renewal}/yr`
      : `Your Studio Stax listing for ${toolName} expires in ${days} days`

    try {
      await resend.emails.send({
        from: FROM, to: slot.buyer_email, subject,
        html: renewalEmail({ name: slot.buyer_name, toolName, daysLeft: days, expiresAt: slot.expires_at, renewalLink, renewalPrice: renewal, tier: tierLabel }),
      })
      const updateField = days <= 7 ? 'renewal_email_7_sent' : days <= 14 ? 'renewal_email_14_sent' : 'renewal_email_30_sent'
      await admin.from('studio_stax_slots').update({ [updateField]: true }).eq('id', slot.id)
      sent++
    } catch (err) {
      console.error(`[StaxRenewals] Failed for ${slot.buyer_email}:`, err)
      errors++
    }
  }

  // ── 2. Expire lapsed slots + reclaim offer ────────────────────────────────
  // Mark any expired active slots as expired
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const { data: justExpiredSlots } = await admin
    .from('studio_stax_slots')
    .select('id, listing_id, amount_paid_cents')
    .eq('status', 'active')
    .lt('expires_at', now.toISOString())
    .gt('expires_at', yesterday.toISOString()) // expired in last 24h

  if (justExpiredSlots && justExpiredSlots.length > 0) {
    for (const lapsed of justExpiredSlots) {
      await admin.from('studio_stax_slots').update({ status: 'expired' }).eq('id', lapsed.id)
    }

    // Count how many of the just-expired slots were founder-priced (≤$100)
    const expiredFounderCount = justExpiredSlots.filter(s => (s.amount_paid_cents ?? 0) <= 10000).length

    if (expiredFounderCount > 0) {
      // Find earliest standard-priced active slots that haven't received a reclaim offer
      const { data: standardSlots } = await admin
        .from('studio_stax_slots')
        .select('id, buyer_name, buyer_email, listing_id, reclaim_offer_sent, amount_paid_cents')
        .eq('status', 'active')
        .gt('amount_paid_cents', 10000) // standard tier (paid $150)
        .or('reclaim_offer_sent.is.null,reclaim_offer_sent.eq.false')
        .order('created_at', { ascending: true })
        .limit(expiredFounderCount)

      for (const stdSlot of standardSlots ?? []) {
        const toolName = listingNameMap[stdSlot.listing_id] || 'your tool'
        const { randomUUID } = await import('crypto')
        const reclaimToken = randomUUID()
        await admin.from('studio_stax_slots')
          .update({ renewal_token: reclaimToken, renewal_token_expires: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), reclaim_offer_sent: true })
          .eq('id', stdSlot.id)
        try {
          await resend.emails.send({
            from: FROM,
            to:   stdSlot.buyer_email,
            subject: `🎉 A founding spot just opened in Studio Stax — it's yours`,
            html: reclaimEmail({ name: stdSlot.buyer_name, toolName, offerLink: `${appUrl}/studio-stax/renew?token=${reclaimToken}` }),
          })
          reclaims++
        } catch (err) {
          console.error(`[StaxRenewals] Reclaim email failed for ${stdSlot.buyer_email}:`, err)
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors, reclaims, checked: (slots ?? []).length })
}

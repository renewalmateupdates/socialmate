export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getAdminSupabase() {
  return getSupabaseAdmin()
}

// GET — admin fetch all listings (all statuses)
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const db = getAdminSupabase()
  const { data } = await db
    .from('curated_listings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return NextResponse.json({ listings: data ?? [] })
}

// PATCH — approve / reject / update a listing, or send payment link
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await req.json()
  const { id, status, admin_notes, action, admin_featured, admin_featured_note, free_year } = body
  const db = getAdminSupabase()

  // ── Toggle admin featured ───────────────────────────────────────────────────
  if (typeof admin_featured === 'boolean') {
    const { error } = await db
      .from('curated_listings')
      .update({
        admin_featured,
        admin_featured_note: admin_featured_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ── Approve free for 1 year ────────────────────────────────────────────────
  if (free_year === true) {
    const freeUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch the listing so we can email the applicant
    const { data: listing, error: fetchErr } = await db
      .from('curated_listings')
      .select('id, name, applicant_name, applicant_email')
      .eq('id', id)
      .single()

    if (fetchErr || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const { error: updateErr } = await db
      .from('curated_listings')
      .update({
        status: 'approved',
        free_until: freeUntil,
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Send confirmation email to applicant — fire and forget
    if (listing.applicant_email) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      resend.emails.send({
        from: 'SocialMate <noreply@socialmate.studio>',
        to: listing.applicant_email,
        subject: `🎉 You got a free Studio Stax listing — ${listing.name}!`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">You're in — free for a year!</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hey${listing.applicant_name ? ` ${listing.applicant_name}` : ''},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          Congratulations — <strong>${listing.name}</strong> has been approved for a <strong>free 1-year listing</strong> on Studio Stax!
          It will appear at <a href="https://socialmate.studio/studio-stax" style="color:#111;">socialmate.studio/studio-stax</a>.
        </p>

        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">What's next</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#374151;line-height:1.9;">
            <li>Your listing is now live in the directory</li>
            <li>You'll receive a <strong>quarterly blog post feature</strong> — we'll shout you out on social when each goes live</li>
            <li>The listing is <strong>free for 12 months</strong></li>
            <li>After 12 months, renewal is <strong>$100/year</strong></li>
          </ul>
        </div>

        <a href="https://socialmate.studio/studio-stax/portal" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Visit your lister portal →
        </a>

        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
          Questions? Reply to this email — we read every one.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  }

  // ── Send payment link ───────────────────────────────────────────────────────
  if (action === 'send_payment_link') {
    // Fetch the listing
    const { data: listing, error: fetchErr } = await db
      .from('curated_listings')
      .select('id, name, applicant_name, applicant_email, status')
      .eq('id', id)
      .single()

    if (fetchErr || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Generate a secure token valid for 7 days
    const token   = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: updateErr } = await db
      .from('curated_listings')
      .update({
        status:                  'approved',
        checkout_token:          token,
        checkout_token_expires:  expires,
        admin_notes:             admin_notes || null,
      })
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Send email to applicant
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
    const checkoutUrl = `${appUrl}/studio-stax/checkout?token=${token}`

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'SocialMate <hello@socialmate.studio>',
        to:   listing.applicant_email,
        subject: `Your Studio Stax application for "${listing.name}" was approved 🎉`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">Application Approved</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hey ${listing.applicant_name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          <strong>${listing.name}</strong> has been approved for Studio Stax — our founder-curated directory on SocialMate.
          Use the link below to choose your listing option and complete payment.
        </p>

        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">What's included</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#374151;line-height:1.8;">
            <li>Listed in the SM-Give ranked public directory</li>
            <li>Ranked by SM-Give donations (the more you give, the higher you rank)</li>
            <li>Top-3 rotation protection — no tool holds top spot more than 3 consecutive months</li>
            <li>Annual blog feature when your year is up</li>
          </ul>
        </div>

        <a href="${checkoutUrl}" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:16px;">
          Complete payment → choose your plan
        </a>

        <p style="margin:0 0 24px;font-size:11px;color:#9ca3af;text-align:center;">
          This link expires in 7 days. Reply to this email if you need more time.
        </p>

        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">From the SocialMate family</p>
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111;">Track every recurring expense free with RenewalMate</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b7280;line-height:1.5;">
            Keep tabs on all your subscriptions — including this one — with RenewalMate. Always free to start.
          </p>
          <a href="https://renewalmate.com" style="font-size:12px;font-weight:700;color:#f59e0b;text-decoration:none;">renewalmate.com →</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
      })
    } catch (emailErr) {
      console.error('[StaxAdmin] Failed to send approval email:', emailErr)
      // Don't fail the request — token is saved, admin can resend
    }

    return NextResponse.json({ success: true, checkoutUrl })
  }

  // ── Standard status update ──────────────────────────────────────────────────
  const updatePayload: Record<string, unknown> = {
    admin_notes: admin_notes || null,
    updated_at: new Date().toISOString(),
  }
  if (status) updatePayload.status = status
  if (body.category !== undefined) updatePayload.category = body.category || null

  const { error } = await db
    .from('curated_listings')
    .update(updatePayload)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — permanently remove a listing
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = getAdminSupabase()
  const { error } = await db.from('curated_listings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

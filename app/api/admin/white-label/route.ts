export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

// GET — list all white label requests (pending, active, rejected)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status') || 'pending'

  const db = getSupabaseAdmin()

  // Fetch user_settings with white_label info
  let query = db
    .from('user_settings')
    .select('user_id, plan, white_label_status, white_label_tier, white_label_requested_at, white_label_active')
    .not('white_label_status', 'is', null)
    .order('white_label_requested_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('white_label_status', statusFilter) as typeof query
  }

  const { data: settings, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch emails from auth
  const userIds = (settings ?? []).map(s => s.user_id)
  const emailMap: Record<string, string> = {}
  for (const uid of userIds) {
    try {
      const { data } = await db.auth.admin.getUserById(uid)
      if (data?.user?.email) emailMap[uid] = data.user.email
    } catch {
      // non-fatal
    }
  }

  const enriched = (settings ?? []).map(s => ({
    ...s,
    email: emailMap[s.user_id] ?? s.user_id,
  }))

  return NextResponse.json({ requests: enriched })
}

// POST { user_id, action: 'approve' | 'reject' }
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { user_id, action } = body as { user_id?: string; action?: string }

  if (!user_id || !action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'user_id and action (approve|reject) are required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  if (action === 'approve') {
    const { error } = await db
      .from('user_settings')
      .update({
        white_label_status: 'active',
        white_label_active: true,
      })
      .eq('user_id', user_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify user their request was approved
    try {
      const { data: authUser } = await db.auth.admin.getUserById(user_id)
      const userEmail = authUser?.user?.email
      if (userEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
        await resend.emails.send({
          from: 'SocialMate <hello@socialmate.studio>',
          to:   userEmail,
          subject: 'Your White Label is approved and active',
          html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">White Label Approved</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Great news!</p>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
          Your White Label subscription has been reviewed and is now active. Head to Settings to configure your custom branding.
        </p>
        <a href="${appUrl}/settings?tab=White Label" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Configure White Label →
        </a>
        <p style="margin:0;font-size:12px;color:#9ca3af;">Questions? Reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
        })
      }
    } catch (emailErr) {
      console.warn('[WhiteLabel] Approval email failed (non-fatal):', emailErr)
    }

    return NextResponse.json({ ok: true, status: 'active' })
  }

  // action === 'reject'
  const { data: settings, error: fetchErr } = await db
    .from('user_settings')
    .select('white_label_tier')
    .eq('user_id', user_id)
    .maybeSingle()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const { error } = await db
    .from('user_settings')
    .update({
      white_label_status: 'rejected',
      white_label_active: false,
    })
    .eq('user_id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send rejection email with refund instructions
  try {
    const { data: authUser } = await db.auth.admin.getUserById(user_id)
    const userEmail = authUser?.user?.email
    if (userEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
      await resend.emails.send({
        from: 'SocialMate <hello@socialmate.studio>',
        to:   userEmail,
        subject: 'About your White Label request',
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">White Label Update</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hi there,</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          After review, we weren't able to approve your White Label request at this time.
          We apologize for any inconvenience.
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
          <strong>Refund instructions:</strong> To request a refund, simply reply to this email with "Refund request" and we will process it within 2–3 business days. Your subscription has been cancelled.
        </p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          If you believe this was an error or would like to discuss further, please reply to this email.
        </p>
        <a href="${appUrl}/settings?tab=Plan" style="display:block;text-align:center;background:#f9fafb;color:#111;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;border:1px solid #e5e7eb;">
          View your plan →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
      })
    }
  } catch (emailErr) {
    console.warn('[WhiteLabel] Rejection email failed (non-fatal):', emailErr)
  }

  return NextResponse.json({ ok: true, status: 'rejected' })
}

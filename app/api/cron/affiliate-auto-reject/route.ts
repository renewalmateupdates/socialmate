export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Returns the date that is N business days ago from now
function businessDaysAgo(n: number): Date {
  const date = new Date()
  let count = 0
  while (count < n) {
    date.setDate(date.getDate() - 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) count++
  }
  return date
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminSupabase = getAdminSupabase()
  const threshold = businessDaysAgo(3).toISOString()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  // Find all pending applications older than 3 business days that don't meet minimum requirements
  const { data: toReject, error } = await adminSupabase
    .from('affiliates')
    .select('id, user_id, full_name')
    .eq('status', 'pending_review')
    .eq('meets_minimum', false)
    .lt('applied_at', threshold)

  if (error) {
    console.error('Auto-reject query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!toReject || toReject.length === 0) {
    return NextResponse.json({ rejected: 0, message: 'No applications to auto-reject' })
  }

  const canReapplyAt = new Date()
  canReapplyAt.setDate(canReapplyAt.getDate() + 30)

  let rejected = 0
  const errors: string[] = []

  for (const app of toReject) {
    const rejectionReason =
      'Your application did not meet our current minimum requirements. ' +
      'To be eligible, affiliates need an established audience (500+ followers), ' +
      'an active content presence (website, blog, or social channels), and a clear, ' +
      'detailed promotion plan. You\'re welcome to reapply in 30 days once you\'ve grown your platform.'

    const { error: updateError } = await adminSupabase
      .from('affiliates')
      .update({
        status:           'rejected',
        reviewed_at:      new Date().toISOString(),
        reviewed_by:      'system-auto-reject',
        rejection_reason: rejectionReason,
        auto_rejected:    true,
        can_reapply_at:   canReapplyAt.toISOString(),
      })
      .eq('id', app.id)

    if (updateError) {
      errors.push(`${app.id}: ${updateError.message}`)
      continue
    }

    // Get user email
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(app.user_id)
    const email = authUser?.user?.email

    if (email) {
      await getResend().emails.send({
        from: 'SocialMate <hello@socialmate.studio>',
        to: email,
        subject: 'Your SocialMate Affiliate Application',
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">SocialMate</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Application Update</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Hi ${app.full_name ? app.full_name.split(' ')[0] : 'there'}, thank you for applying to the SocialMate Affiliate Program.
              After review, we're unable to approve your application at this time.
            </p>
            <div style="background: #fff5f5; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">What we look for</div>
              <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                <li>An established audience of 500+ followers on any platform</li>
                <li>An active content presence (website, blog, YouTube, podcast, or social channels)</li>
                <li>A clear, specific plan for how you'll promote SocialMate</li>
                <li>An active SocialMate subscription</li>
              </ul>
            </div>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              You can <strong>reapply on ${canReapplyAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              once you've had a chance to grow your platform. We'd love to have you when the time is right.
            </p>
            <a href="${appUrl}/partners/access-denied" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700;">
              View Reapply Date →
            </a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 12px;">SocialMate · Questions? Reply to this email.</p>
          </div>
        `,
      }).catch(err => console.warn('Auto-reject email failed:', err))
    }

    rejected++
  }

  return NextResponse.json({
    rejected,
    errors: errors.length > 0 ? errors : undefined,
    can_reapply_at: canReapplyAt.toISOString(),
  })
}

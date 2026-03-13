import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function getAdminSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { affiliate_id, action, rejection_reason } = await req.json()

  if (!affiliate_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const adminSupabase = getAdminSupabase()

  const { data: affiliate, error: fetchError } = await adminSupabase
    .from('affiliates')
    .select('*, user_id')
    .eq('id', affiliate_id)
    .single()

  if (fetchError || !affiliate) {
    return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
  }

  const { data: authUser } = await adminSupabase.auth.admin.getUserById(affiliate.user_id)
  const email = authUser?.user?.email

  if (action === 'approve') {
    const { error } = await adminSupabase
      .from('affiliates')
      .update({
        status: 'active',
        joined_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
        rejection_reason: null,
      })
      .eq('id', affiliate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (email) {
      const { data: settings } = await adminSupabase
        .from('user_settings')
        .select('referral_code')
        .eq('user_id', affiliate.user_id)
        .single()

      const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate-six.vercel.app'}/?ref=${settings?.referral_code}`

      await resend.emails.send({
        from: 'SocialMate <onboarding@resend.dev>',
        to: email,
        subject: '🎉 You\'re approved — welcome to the SocialMate Affiliate Program!',
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">SocialMate</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">You're in! 🎉</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Your application to the SocialMate Affiliate Program has been approved.
              You're starting at <strong>30% recurring commission</strong> — and unlock
              <strong>40%</strong> once you hit 100 active referrals.
            </p>
            <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Your Referral Link</div>
              <div style="font-family: monospace; font-size: 14px; color: #111; word-break: break-all;">${referralLink}</div>
            </div>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Share your link anywhere — every user who signs up and subscribes earns you commission automatically.
              Log in to your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate-six.vercel.app'}/affiliate" style="color: #000; font-weight: 600;">affiliate dashboard</a> to track earnings and referrals.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 12px;">SocialMate · 60-day lock period · Payouts processed manually</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, action: 'approved' })

  } else {
    const { error } = await adminSupabase
      .from('affiliates')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
        rejection_reason: rejection_reason || null,
      })
      .eq('id', affiliate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (email) {
      await resend.emails.send({
        from: 'SocialMate <onboarding@resend.dev>',
        to: email,
        subject: 'Your SocialMate Affiliate Application',
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
            <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">SocialMate</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Application Update</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Thank you for applying to the SocialMate Affiliate Program. After review,
              we're unable to approve your application at this time.
            </p>
            ${rejection_reason ? `
            <div style="background: #fff5f5; border: 1px solid #fee2e2; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <div style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Reason</div>
              <div style="font-size: 14px; color: #dc2626;">${rejection_reason}</div>
            </div>` : ''}
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              If you have questions, reply to this email or reach out through your account dashboard.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 12px;">SocialMate</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, action: 'rejected' })
  }
}
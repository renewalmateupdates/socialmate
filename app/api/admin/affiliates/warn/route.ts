export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  return supabase.auth.getUser()
}

// ── POST — send warning email to an affiliate + log it ────────────────────

export async function POST(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
  if (user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { affiliate_id, affiliate_email, affiliate_name } = await req.json()
  if (!affiliate_id || !affiliate_email) {
    return NextResponse.json({ error: 'Missing affiliate_id or affiliate_email' }, { status: 400 })
  }

  const displayName = affiliate_name || affiliate_email.split('@')[0]
  const dashboardUrl = 'https://socialmate.studio/partners/dashboard'
  const sentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Action needed: Your SocialMate affiliate account</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid #222222;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#F59E0B,#7C3AED);padding:28px 32px;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">SocialMate Partners</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Action needed on your affiliate account</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#f1f1f1;">Hey ${displayName},</p>
              <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.7;">
                We noticed your SocialMate affiliate account hasn't had any referral activity recently.
                We wanted to reach out to check in and make sure you have everything you need to succeed.
              </p>
              <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.7;">
                As a reminder, every person you refer who signs up for a paid plan earns you <strong style="color:#F59E0B;">30% recurring commission</strong> — that's ongoing monthly income for as long as they stay subscribed.
              </p>
              <!-- Tips box -->
              <div style="background:#0a0a0a;border:1px solid #222222;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#F59E0B;">Quick tips to get started</p>
                <ul style="margin:0;padding:0 0 0 16px;color:#9ca3af;font-size:13px;line-height:1.8;">
                  <li>Share your referral link on social media, in your newsletter, or with your community</li>
                  <li>Let people know SocialMate is $5/mo — far cheaper than any competitor</li>
                  <li>Use your promo codes to give your audience a discount (increases conversions)</li>
                  <li>Add your link to your YouTube description, bio, or website footer</li>
                </ul>
              </div>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;line-height:1.7;">
                <strong style="color:#f1f1f1;">Important:</strong> Affiliate accounts with no activity for 30 days may be reviewed for deactivation. We'd love to keep you active — just log in and grab your referral link to get going!
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#F59E0B,#7C3AED);">
                    <a href="${dashboardUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Go to Your Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
                Questions? Reply to this email or reach out any time. We're rooting for you.<br />
                — Joshua &amp; the SocialMate team
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #222222;">
              <p style="margin:0;font-size:11px;color:#4b5563;line-height:1.6;">
                You're receiving this because you're enrolled in the SocialMate affiliate program.
                Manage your account at <a href="${dashboardUrl}" style="color:#F59E0B;text-decoration:none;">socialmate.studio/partners/dashboard</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  // Send via Resend
  const resend = getResend()
  const { error: emailError } = await resend.emails.send({
    from: 'SocialMate <noreply@socialmate.studio>',
    to: affiliate_email,
    subject: 'Action needed: Your SocialMate affiliate account',
    html: emailHtml,
  })

  if (emailError) {
    console.error('[warn] Resend error:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Append warning note to affiliate_profiles.notes
  const db = getAdminSupabase()
  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('notes')
    .eq('id', affiliate_id)
    .maybeSingle()

  const existingNotes = profile?.notes || ''
  const warningTag = `[WARNING SENT: ${sentDate}]`
  const updatedNotes = existingNotes
    ? `${existingNotes}\n${warningTag}`
    : warningTag

  await db
    .from('affiliate_profiles')
    .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
    .eq('id', affiliate_id)

  return NextResponse.json({ success: true })
}

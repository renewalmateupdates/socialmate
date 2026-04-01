export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { name, email, socials, why } = await req.json()

    if (!name?.trim() || !email?.trim() || !why?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Notify admin
    await resend.emails.send({
      from:    'SocialMate <hello@socialmate.studio>',
      to:      process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com',
      subject: `New Partner Application — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <h2 style="margin:0 0 20px;font-size:20px;">New Partner Application</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px;">Name</td><td style="font-size:14px;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td><td style="font-size:14px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Socials</td><td style="font-size:14px;">${socials || '—'}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:10px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Why they want to partner</p>
            <p style="margin:0;font-size:14px;line-height:1.6;">${why}</p>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#6b7280;">
            Reply to this email or go to <a href="https://socialmate.studio/admin/affiliates">Admin → Affiliates</a> to invite them.
          </p>
        </div>
      `,
      replyTo: email,
    })

    // Confirm to applicant
    await resend.emails.send({
      from:    'SocialMate <hello@socialmate.studio>',
      to:      email,
      subject: 'We received your partner application',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <h2 style="margin:0 0 12px;font-size:20px;">Hey ${name} 👋</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
            We received your application to join the SocialMate Partner Program. We review every application personally and will get back to you within a few days.
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;">
            In the meantime, feel free to explore SocialMate — it's free to start, no card required.
          </p>
          <a href="https://socialmate.studio/signup" style="display:inline-block;background:#111;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Explore SocialMate →
          </a>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
            Questions? Reply to this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Partner apply error:', err)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}

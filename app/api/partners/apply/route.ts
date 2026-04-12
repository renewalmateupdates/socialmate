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

    // Notify admin — fire and forget
    resend.emails.send({
      from:    'SocialMate <noreply@socialmate.studio>',
      to:      process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com',
      subject: `💰 New Partner Application — ${email}`,
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #333;">
      <div style="background:#111;padding:20px 28px;border-bottom:1px solid #333;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Partner Program</p>
        <h1 style="margin:4px 0 0;font-size:20px;font-weight:800;color:#fff;">New Partner Application</h1>
      </div>
      <div style="padding:28px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;white-space:nowrap;">Name</td>
            <td style="padding:8px 0;color:#f3f4f6;font-weight:700;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;">Email</td>
            <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#60a5fa;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;">Socials</td>
            <td style="padding:8px 0;color:#d1d5db;">${socials || '—'}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;">Applied</td>
            <td style="padding:8px 0;color:#d1d5db;">${new Date().toISOString()}</td>
          </tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#111;border:1px solid #333;border-radius:10px;">
          <p style="margin:0 0 8px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Why they want to partner</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#d1d5db;">${why}</p>
        </div>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #333;text-align:center;">
          <a href="https://socialmate.studio/admin/partners" style="display:inline-block;background:#fff;color:#111;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Review &amp; Approve →
          </a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
      replyTo: email,
    }).catch(() => {})

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

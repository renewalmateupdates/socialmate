export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, team_size, message } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Save to database
    const supabase = getSupabaseAdmin()
    const { error: dbError } = await supabase
      .from('enterprise_inquiries')
      .insert({ name, email, company: company || null, team_size: team_size || null, message: message || null })

    if (dbError) {
      console.error('Failed to save enterprise inquiry:', dbError)
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
    }

    // Send notification email to Joshua
    try {
      await resend.emails.send({
        from: 'SocialMate <noreply@socialmate.studio>',
        to: 'socialmatehq@gmail.com',
        subject: `Enterprise Inquiry — ${company || name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #111; margin-bottom: 4px;">New Enterprise Inquiry</h2>
            <p style="color: #666; margin-top: 0; margin-bottom: 24px;">Someone wants to talk Enterprise.</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px; width: 120px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                  <a href="mailto:${email}" style="color: #f59e0b;">${email}</a>
                </td>
              </tr>
              ${company ? `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Company</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">${company}</td>
              </tr>` : ''}
              ${team_size ? `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">Team size</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${team_size}</td>
              </tr>` : ''}
              ${message ? `<tr>
                <td style="padding: 10px 0; color: #666; font-size: 13px; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
              </tr>` : ''}
            </table>

            <a href="mailto:${email}?subject=Re: Enterprise Plan — SocialMate"
              style="display: inline-block; background: #f59e0b; color: #000; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px;">
              Reply to ${name} →
            </a>
          </div>
        `,
      })
    } catch (emailErr) {
      // Non-fatal — inquiry is saved to DB regardless
      console.error('Failed to send enterprise inquiry email:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Enterprise inquiry error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { feedback_id, reply_message } = await req.json()
  if (!feedback_id || !reply_message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: item, error: fetchError } = await admin
    .from('feedback')
    .select('id, email, type, message')
    .eq('id', feedback_id)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  if (item.email) {
    await getResend().emails.send({
      from: 'SocialMate <hello@socialmate.studio>',
      to: item.email,
      subject: 'Re: Your SocialMate Feedback',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #111;">
          <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">SocialMate</div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Hey! Thanks for reaching out. Here's a response to your feedback:
          </p>
          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Your message</div>
            <div style="font-size: 14px; color: #555; font-style: italic;">${item.message}</div>
          </div>
          <div style="background: #000; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Our reply</div>
            <div style="font-size: 15px; color: #fff; line-height: 1.7;">${reply_message.trim()}</div>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Feel free to reply to this email if you have any follow-up questions.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 12px;">SocialMate · <a href="https://socialmate.studio" style="color: #aaa;">socialmate.studio</a></p>
        </div>
      `,
    })
  }

  const { error: updateError } = await admin
    .from('feedback')
    .update({
      replied_at:    new Date().toISOString(),
      reply_message: reply_message.trim(),
      replied_by:    user.email,
    })
    .eq('id', feedback_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, emailed: !!item.email })
}

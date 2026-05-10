import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const PLAY_STORE_OPT_IN = 'https://play.google.com/apps/testing/studio.socialmate.app'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { error: dbError } = await supabase
    .from('beta_testers')
    .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })

  if (dbError) {
    console.error('beta_testers insert error:', dbError)
    return NextResponse.json({ error: 'Could not save — try again' }, { status: 500 })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Joshua @ SocialMate <hello@socialmate.studio>',
      to: [email],
      subject: "Your SocialMate Android beta invite 🚀",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f0f; color: #f0f0f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #1a1a1a; padding: 32px 32px 24px; border-bottom: 1px solid #2a2a2a;">
            <img src="https://socialmate.studio/logo.png" alt="SocialMate" style="width: 40px; height: 40px; border-radius: 10px; margin-bottom: 16px;" />
            <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #ffffff;">Your beta invite is here 🎉</h1>
            <p style="font-size: 14px; color: #999; margin: 0;">Thanks for joining the SocialMate Android beta. You're helping us ship.</p>
          </div>

          <div style="padding: 28px 32px;">
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 12px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">Your opt-in link</p>
              <a href="${PLAY_STORE_OPT_IN}" style="display: block; background: #fbbf24; color: #000; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 20px; border-radius: 10px; text-align: center;">
                Join the Android Beta on Google Play →
              </a>
              <p style="font-size: 11px; color: #666; margin: 10px 0 0; text-align: center;">You'll need a Google account to opt in</p>
            </div>

            <p style="font-size: 13px; font-weight: 700; color: #f0f0f0; margin: 0 0 10px;">What to do next:</p>
            <ol style="font-size: 13px; color: #aaa; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
              <li>Click the button above</li>
              <li>Sign in with your Google account and tap <strong style="color: #f0f0f0;">Become a tester</strong></li>
              <li>Download SocialMate from the Play Store (appears within a few hours)</li>
              <li>Use it and share any feedback — reply to this email directly</li>
            </ol>

            <div style="background: #1a2a1a; border: 1px solid #2a4a2a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 13px; font-weight: 700; color: #4ade80; margin: 0 0 6px;">🎁 100 bonus AI credits</p>
              <p style="font-size: 12px; color: #86efac; margin: 0;">Beta testers get 100 bonus AI credits added to their account when SocialMate ships to Google Play production. No action needed — we'll add them automatically.</p>
            </div>

            <p style="font-size: 13px; color: #aaa; line-height: 1.7; margin: 0;">
              I'm Joshua — I built SocialMate solo while working a deli job. Every tester gets us one step closer to public launch. Seriously means a lot. 🙏
            </p>
          </div>

          <div style="padding: 20px 32px; border-top: 1px solid #2a2a2a; text-align: center;">
            <p style="font-size: 11px; color: #555; margin: 0;">
              SocialMate · <a href="https://socialmate.studio" style="color: #555;">socialmate.studio</a>
            </p>
          </div>
        </div>
      `,
    })
  } catch (emailErr) {
    console.error('beta email send error:', emailErr)
    // Non-fatal — email failed but DB insert succeeded
  }

  return NextResponse.json({ ok: true })
}

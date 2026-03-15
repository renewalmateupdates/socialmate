import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, role, teamMemberId } = await request.json()

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Save token to DB
  const { error: tokenError } = await supabaseAdmin
    .from('invite_tokens')
    .insert({
      token,
      owner_id: user.id,
      email,
      role,
      expires_at: expiresAt,
    })

  if (tokenError) {
    console.error('Token insert error:', tokenError)
    return NextResponse.json({ error: 'Failed to create invite token' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const inviteUrl = `${appUrl}/invite?token=${token}`

  // Get inviter's display name
  const { data: inviterSettings } = await supabaseAdmin
    .from('user_settings')
    .select('display_name')
    .eq('user_id', user.id)
    .single()

  const inviterName = inviterSettings?.display_name || user.email

  // Send invite email via Resend
  const { error: emailError } = await resend.emails.send({
    from: 'SocialMate <onboarding@resend.dev>',
    to: email,
    subject: `${inviterName} invited you to join SocialMate`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
            <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 8px; color: #111827;">You're invited 🎉</h1>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">
              <strong style="color: #111827;">${inviterName}</strong> has invited you to join their SocialMate workspace as a <strong style="color: #111827;">${role}</strong>.
            </p>
            <a href="${inviteUrl}"
              style="display: block; background: #111827; color: white; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 24px;">
              Accept Invitation →
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              This invite expires in 7 days. If you weren't expecting this, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `,
  })

  if (emailError) {
    console.error('Email send error:', emailError)
    // Don't fail the whole invite if email fails — token is saved
    return NextResponse.json({ success: true, emailSent: false })
  }

  return NextResponse.json({ success: true, emailSent: true })
}
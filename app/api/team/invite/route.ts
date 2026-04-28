export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { logActivity } from '@/lib/workspace-activity'
import { Resend } from 'resend'
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }
import crypto from 'crypto'



const PLAN_SEAT_LIMITS: Record<string, number> = {
  free:   2,
  pro:    5,
  agency: 15,
}

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

  const { email, role } = await request.json()

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
  }

  const VALID_ROLES = ['admin', 'editor', 'viewer', 'client']
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Server-side seat limit check
  const { data: settings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan      = settings?.plan || 'free'
  const seatLimit = PLAN_SEAT_LIMITS[plan] ?? 2

  // Count existing members (not counting owner — owner is +1 implicit)
  const { count: memberCount } = await getSupabaseAdmin()
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  // seatsUsed = members + 1 (owner)
  const seatsUsed = (memberCount ?? 0) + 1
  if (seatsUsed >= seatLimit) {
    return NextResponse.json({
      error: `Seat limit reached. Your ${plan} plan allows ${seatLimit} seats total.`,
    }, { status: 403 })
  }

  // Check not already a member
  const { data: existing } = await getSupabaseAdmin()
    .from('team_members')
    .select('id')
    .eq('owner_id', user.id)
    .eq('email', email.trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'This person is already a team member' }, { status: 409 })
  }

  // Insert the team member record
  const { data: member, error: insertError } = await getSupabaseAdmin()
    .from('team_members')
    .insert({
      owner_id:  user.id,
      email:     email.trim(),
      role,
      status:    'pending',
      joined_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError || !member) {
    console.error('Team member insert error:', insertError)
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 })
  }

  // Log to workspace activity (non-fatal, resolve personal workspace id)
  Promise.resolve(
    getSupabaseAdmin()
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()
  ).then(({ data: ws }) => {
    if (ws?.id) {
      logActivity({
        workspace_id: ws.id,
        user_id:      user.id,
        action:       'member.invited',
        entity_type:  'team_member',
        entity_id:    member.id,
        metadata:     { email: email.trim(), role },
      })
    }
  }).catch(() => {})

  // Generate secure invite token
  const token     = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: tokenError } = await getSupabaseAdmin()
    .from('invite_tokens')
    .insert({
      token,
      owner_id:   user.id,
      email:      email.trim(),
      role,
      expires_at: expiresAt,
    })

  if (tokenError) {
    console.error('Token insert error:', tokenError)
    // Member was added, just couldn't send email — not fatal
    return NextResponse.json({ success: true, emailSent: false, member })
  }

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL!
  const inviteUrl = `${appUrl}/invite?token=${token}`

  const { data: inviterSettings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('display_name')
    .eq('user_id', user.id)
    .single()

  const inviterName = inviterSettings?.display_name || user.email

  const { error: emailError } = await getResend().emails.send({
    from:    'SocialMate <hello@socialmate.studio>',
    to:      email.trim(),
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
    return NextResponse.json({ success: true, emailSent: false, member })
  }

  return NextResponse.json({ success: true, emailSent: true, member })
}
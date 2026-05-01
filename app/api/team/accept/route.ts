import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { logActivity } from '@/lib/workspace-activity'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

const PLAN_SEAT_LIMITS: Record<string, number> = {
  free:   2,
  pro:    5,
  agency: 15,
}

export async function POST(request: NextRequest) {
  const { token, userId, email } = await request.json()

  if (!token || !userId) {
    return NextResponse.json({ error: 'Token and userId are required' }, { status: 400 })
  }

  const adminSupabase = getSupabaseAdmin()

  // Look up token
  const { data: invite, error: tokenError } = await adminSupabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (tokenError || !invite) {
    return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 })
  }

  if (invite.used_at) {
    return NextResponse.json({ error: 'This invite has already been used' }, { status: 400 })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite has expired' }, { status: 400 })
  }

  if (invite.email !== email) {
    return NextResponse.json({ error: 'This invite was sent to a different email address' }, { status: 400 })
  }

  // Re-check seat limit at time of acceptance (owner may have downgraded)
  const { data: ownerSettings } = await adminSupabase
    .from('user_settings')
    .select('plan')
    .eq('user_id', invite.owner_id)
    .single()

  const plan      = ownerSettings?.plan || 'free'
  const seatLimit = PLAN_SEAT_LIMITS[plan] ?? 2

  const { count: memberCount } = await adminSupabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', invite.owner_id)
    .eq('status', 'active')

  const seatsUsed = (memberCount ?? 0) + 1 // +1 for owner
  if (seatsUsed >= seatLimit) {
    return NextResponse.json({
      error: 'This workspace has reached its seat limit. The workspace owner will need to upgrade their plan.',
    }, { status: 403 })
  }

  // Activate the team member record
  const { error: updateError } = await adminSupabase
    .from('team_members')
    .update({ status: 'active', joined_at: new Date().toISOString() })
    .eq('owner_id', invite.owner_id)
    .eq('email', invite.email)

  if (updateError) {
    // No existing record — insert fresh
    await adminSupabase
      .from('team_members')
      .insert({
        owner_id:  invite.owner_id,
        email:     invite.email,
        role:      invite.role,
        status:    'active',
        joined_at: new Date().toISOString(),
      })
  }

  // Mark token as used
  await adminSupabase
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  // Log member.joined activity (non-fatal)
  Promise.resolve(
    adminSupabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', invite.owner_id)
      .eq('is_personal', true)
      .maybeSingle()
  ).then(({ data: ws }) => {
    if (ws?.id && userId) {
      logActivity({
        workspace_id: ws.id,
        user_id:      userId,
        actor_email:  invite.email,
        action:       'member.joined',
        entity_type:  'team_member',
        metadata:     { role: invite.role },
      })
    }
  }).catch(() => {})

  // Send team joined email to workspace owner
  try {
    const { data: ownerPrefs } = await adminSupabase
      .from('user_settings')
      .select('notification_prefs')
      .eq('user_id', invite.owner_id)
      .single()

    const prefs = (ownerPrefs?.notification_prefs ?? {}) as Record<string, boolean>

    if (prefs.team_joined !== false) {
      const { data: ownerAuth } = await adminSupabase.auth.admin.getUserById(invite.owner_id)
      const ownerEmail = ownerAuth?.user?.email

      if (ownerEmail) {
        await getResend().emails.send({
          from: 'SocialMate <notifications@socialmate.studio>',
          to: ownerEmail,
          subject: `${invite.email} just joined your team`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #111;">
              <div style="font-size: 20px; font-weight: 800; margin-bottom: 16px;">SocialMate</div>
              <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">New team member</h2>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                <strong>${invite.email}</strong> accepted your invite and joined your workspace as <strong>${invite.role}</strong>.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'}/team"
                style="display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px;">
                View team →
              </a>
              <p style="color: #aaa; font-size: 12px; margin-top: 24px;">To disable these emails, go to Settings → Notifications.</p>
            </div>
          `,
        })
      }
    }
  } catch (emailErr) {
    console.error('Team joined email failed (non-fatal):', emailErr)
  }

  return NextResponse.json({ success: true, ownerId: invite.owner_id })
}

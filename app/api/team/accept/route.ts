export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'


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

  // Look up token
  const { data: invite, error: tokenError } = await getSupabaseAdmin()
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
  const { data: ownerSettings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('plan')
    .eq('user_id', invite.owner_id)
    .single()

  const plan      = ownerSettings?.plan || 'free'
  const seatLimit = PLAN_SEAT_LIMITS[plan] ?? 2

  const { count: memberCount } = await getSupabaseAdmin()
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
  const { error: updateError } = await getSupabaseAdmin()
    .from('team_members')
    .update({ status: 'active', joined_at: new Date().toISOString() })
    .eq('owner_id', invite.owner_id)
    .eq('email', invite.email)

  if (updateError) {
    // No existing record — insert fresh
    await getSupabaseAdmin()
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
  await getSupabaseAdmin()
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  return NextResponse.json({ success: true, ownerId: invite.owner_id })
}
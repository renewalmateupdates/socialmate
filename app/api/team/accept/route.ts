import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { token, userId, email } = await request.json()

  if (!token || !userId) {
    return NextResponse.json({ error: 'Token and userId are required' }, { status: 400 })
  }

  // Look up token
  const { data: invite, error: tokenError } = await supabaseAdmin
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

  // Update team_members record to active
  const { error: updateError } = await supabaseAdmin
    .from('team_members')
    .update({ status: 'active', joined_at: new Date().toISOString() })
    .eq('owner_id', invite.owner_id)
    .eq('email', invite.email)

  if (updateError) {
    // If no existing record, insert one
    await supabaseAdmin
      .from('team_members')
      .insert({
        owner_id: invite.owner_id,
        email: invite.email,
        role: invite.role,
        status: 'active',
        joined_at: new Date().toISOString(),
      })
  }

  // Mark token as used
  await supabaseAdmin
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  return NextResponse.json({ success: true, ownerId: invite.owner_id })
}
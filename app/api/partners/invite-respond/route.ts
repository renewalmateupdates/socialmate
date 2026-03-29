export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { affiliateDeclineBummerEmail } from '@/lib/emails/affiliateEmails'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// ── GET — check token OR handle decline click ─────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token  = searchParams.get('token')
  const action = searchParams.get('action')

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const db = getAdminSupabase()

  const { data: invite } = await db
    .from('affiliate_invites')
    .select('id, email, status, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!invite) return NextResponse.json({ valid: false, reason: 'not_found' })

  const expired = new Date(invite.expires_at) < new Date()

  // Just checking validity
  if (action === 'check') {
    return NextResponse.json({
      valid: invite.status === 'pending' && !expired,
      email: invite.email,
      reason: expired ? 'expired' : invite.status !== 'pending' ? invite.status : null,
    })
  }

  // Handle decline
  if (action === 'decline') {
    if (invite.status !== 'pending') {
      // Redirect to a "too late" page
      return NextResponse.redirect(new URL('/partners?declined=already', req.url))
    }

    await db
      .from('affiliate_invites')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', invite.id)

    // Send bummer email
    await getResend().emails.send({
      from: 'SocialMate Partners <hello@socialmate.studio>',
      to: invite.email,
      subject: 'No worries — door is always open',
      html: affiliateDeclineBummerEmail({ email: invite.email }),
    })

    return NextResponse.redirect(new URL(`${appUrl}/partners/declined`, req.url))
  }

  return NextResponse.json({ valid: invite.status === 'pending' && !expired, email: invite.email })
}

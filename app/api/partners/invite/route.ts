export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { affiliateInviteEmail } from '@/lib/emails/affiliateEmails'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  return supabase.auth.getUser()
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// ── POST — admin sends invite ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const db = getAdminSupabase()

  // Check if already an affiliate
  const { data: existing } = await db
    .from('affiliate_profiles')
    .select('id, status')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (existing && existing.status === 'active') {
    return NextResponse.json({ error: 'This email is already an active affiliate' }, { status: 409 })
  }

  // Create or re-send invite
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Expire old pending invites for this email
  await db
    .from('affiliate_invites')
    .update({ status: 'expired' })
    .eq('email', email.trim().toLowerCase())
    .eq('status', 'pending')

  const { data: invite, error } = await db
    .from('affiliate_invites')
    .insert({
      email: email.trim().toLowerCase(),
      sent_by: user.email!,
      expires_at: expiresAt,
      status: 'pending',
    })
    .select('token')
    .single()

  if (error || !invite) {
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }

  const acceptUrl  = `${appUrl}/partners?token=${invite.token}`
  const declineUrl = `${appUrl}/api/partners/invite-respond?token=${invite.token}&action=decline`

  await getResend().emails.send({
    from: 'SocialMate Partners <hello@socialmate.studio>',
    to: email.trim(),
    subject: `You're invited to the SocialMate Partner Program`,
    html: affiliateInviteEmail({ email: email.trim(), acceptUrl, declineUrl, expiresAt }),
  })

  return NextResponse.json({ success: true })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { payoutConfirmationEmail, payoutApprovedEmail } from '@/lib/emails/affiliateEmails'

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

// ── GET — list payout requests (admin) ────────────────────────────────────

export async function GET(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const isAdmin    = searchParams.get('admin') === 'true'
  const adminEmail = process.env.ADMIN_EMAIL

  const db = getAdminSupabase()

  if (isAdmin) {
    if (adminEmail && user.email !== adminEmail) {
      return NextResponse.json({ forbidden: true }, { status: 403 })
    }

    const { data: payouts } = await db
      .from('affiliate_payouts')
      .select(`
        *,
        affiliate_profiles!inner (email, full_name)
      `)
      .order('requested_at', { ascending: false })

    const enriched = (payouts ?? []).map((p: any) => ({
      ...p,
      affiliate_email: p.affiliate_profiles?.email,
      affiliate_name:  p.affiliate_profiles?.full_name,
    }))

    return NextResponse.json({ payouts: enriched })
  }

  // Affiliate own payouts
  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ payouts: [] })

  const { data: payouts } = await db
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', profile.id)
    .order('requested_at', { ascending: false })

  return NextResponse.json({ payouts: payouts ?? [] })
}

// ── POST — affiliate requests payout ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminSupabase()

  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || profile.status !== 'active') {
    return NextResponse.json({ error: 'Active affiliate account required' }, { status: 403 })
  }

  if (profile.available_balance_cents < 2500) {
    return NextResponse.json(
      { error: `Minimum payout is $25.00. You have ${(profile.available_balance_cents / 100).toFixed(2)} available.` },
      { status: 400 }
    )
  }

  // Check no pending request already exists
  const { data: pending } = await db
    .from('affiliate_payouts')
    .select('id')
    .eq('affiliate_id', profile.id)
    .in('status', ['requested', 'approved', 'processing'])
    .maybeSingle()

  if (pending) {
    return NextResponse.json({ error: 'You already have a pending payout request' }, { status: 409 })
  }

  const amount = profile.available_balance_cents

  const { data: payout, error } = await db
    .from('affiliate_payouts')
    .insert({
      affiliate_id: profile.id,
      amount_cents: amount,
      status: 'requested',
      stripe_account_id: profile.stripe_account_id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send confirmation email
  if (user.email) {
    await getResend().emails.send({
      from: 'SocialMate Partners <hello@socialmate.studio>',
      to: user.email,
      subject: 'Payout request received',
      html: payoutConfirmationEmail({
        email: user.email,
        amountCents: amount,
        payoutId: payout.id,
      }),
    })
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await getResend().emails.send({
      from: 'SocialMate Partners <hello@socialmate.studio>',
      to: adminEmail,
      subject: `[Partners] Payout request: $${(amount / 100).toFixed(2)} from ${user.email}`,
      html: `<p>${user.email} has requested a payout of <strong>$${(amount / 100).toFixed(2)}</strong>.</p><p>Review in the <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/partners">Admin Panel</a>.</p>`,
    })
  }

  return NextResponse.json({ success: true, payout_id: payout.id })
}

// ── PATCH — admin approves/rejects payout ────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, action } = await req.json()
  if (!id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const db = getAdminSupabase()

  const { data: payout } = await db
    .from('affiliate_payouts')
    .select('*, affiliate_profiles!inner (user_id, email, available_balance_cents, stripe_account_id)')
    .eq('id', id)
    .single()

  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

  if (action === 'approve') {
    // Mark approved + deduct from available balance
    await db
      .from('affiliate_payouts')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.email,
      })
      .eq('id', id)

    await db
      .from('affiliate_profiles')
      .update({
        available_balance_cents: Math.max(0, (payout.affiliate_profiles as any).available_balance_cents - payout.amount_cents),
        paid_out_cents: db.rpc as any,  // done via raw update below
      })
      .eq('id', payout.affiliate_id)

    // Use a simple update for paid_out increment
    const { data: prof } = await db
      .from('affiliate_profiles')
      .select('paid_out_cents, available_balance_cents')
      .eq('id', payout.affiliate_id)
      .single()

    if (prof) {
      await db
        .from('affiliate_profiles')
        .update({
          available_balance_cents: Math.max(0, prof.available_balance_cents - payout.amount_cents),
          paid_out_cents: (prof.paid_out_cents ?? 0) + payout.amount_cents,
        })
        .eq('id', payout.affiliate_id)
    }

    // Email affiliate
    const affiliateEmail = (payout.affiliate_profiles as any).email
    if (affiliateEmail) {
      await getResend().emails.send({
        from: 'SocialMate Partners <hello@socialmate.studio>',
        to: affiliateEmail,
        subject: 'Your payout has been approved!',
        html: payoutApprovedEmail({ email: affiliateEmail, amountCents: payout.amount_cents }),
      })
    }

  } else if (action === 'reject') {
    await db
      .from('affiliate_payouts')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json({ success: true })
}

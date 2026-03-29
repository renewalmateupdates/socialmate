export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { affiliateWelcomeEmail } from '@/lib/emails/affiliateEmails'
import Stripe from 'stripe'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })
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

export async function POST(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { step } = body
  const db = getAdminSupabase()

  // Fetch or create affiliate profile
  let { data: profile } = await db
    .from('affiliate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    // Create from invite token if provided
    if (body.token) {
      const { data: invite } = await db
        .from('affiliate_invites')
        .select('id, email, status, expires_at')
        .eq('token', body.token)
        .eq('status', 'pending')
        .maybeSingle()

      if (!invite || new Date(invite.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 })
      }

      const { data: newProfile } = await db
        .from('affiliate_profiles')
        .insert({
          user_id:      user.id,
          email:        invite.email,
          status:       'pending',
          invite_token: body.token,
        })
        .select()
        .single()

      profile = newProfile

      await db
        .from('affiliate_invites')
        .update({ status: 'accepted', responded_at: new Date().toISOString(), affiliate_profile_id: profile?.id })
        .eq('id', invite.id)
    } else {
      return NextResponse.json({ error: 'Affiliate profile not found. Use your invite link.' }, { status: 404 })
    }
  }

  if (!profile) return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })

  // ── STEP: tos ──────────────────────────────────────────────────────────
  if (step === 'tos') {
    await db
      .from('affiliate_profiles')
      .update({ tos_agreed: true, tos_agreed_at: new Date().toISOString() })
      .eq('id', profile.id)

    return NextResponse.json({ success: true })
  }

  // ── STEP: profile ──────────────────────────────────────────────────────
  if (step === 'profile') {
    const { full_name, website_url } = body
    if (!full_name?.trim()) return NextResponse.json({ error: 'Full name required' }, { status: 400 })

    await db
      .from('affiliate_profiles')
      .update({ full_name: full_name.trim(), ...(website_url ? { notes: `Website: ${website_url}` } : {}) })
      .eq('id', profile.id)

    return NextResponse.json({ success: true })
  }

  // ── STEP: payout_setup — create Stripe Connect account ────────────────
  if (step === 'payout_setup') {
    try {
      const stripe = getStripe()

      let accountId = profile.stripe_account_id

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email!,
          capabilities: { transfers: { requested: true } },
          metadata: { affiliate_id: profile.id },
        })
        accountId = account.id

        await db
          .from('affiliate_profiles')
          .update({ stripe_account_id: accountId, stripe_account_status: 'pending' })
          .eq('id', profile.id)
      }

      const onboardingLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${appUrl}/partners/onboarding?step=3`,
        return_url:  `${appUrl}/api/partners/onboarding/stripe-return?affiliate_id=${profile.id}`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ stripe_onboarding_url: onboardingLink.url })
    } catch (err: any) {
      console.error('Stripe Connect error:', err)
      // Non-fatal — let them skip
      return NextResponse.json({ stripe_onboarding_url: null })
    }
  }

  // ── STEP: complete — mark onboarding done ─────────────────────────────
  if (step === 'complete') {
    await db
      .from('affiliate_profiles')
      .update({ onboarding_completed: true, status: 'active' })
      .eq('id', profile.id)

    // Generate promo codes
    const email = user.email || profile.email
    const base  = email.split('@')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)

    const code3m = base + '3M'
    const code6m = base + '6M'

    // Check for collisions and insert
    for (const [code, months, discount, desc] of [
      [code3m, 3, 20, '20% off for 3 months'],
      [code6m, 6, 15, '15% off for 6 months'],
    ] as [string, number, number, string][]) {
      const { data: existing } = await db
        .from('affiliate_promo_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle()

      const finalCode = existing
        ? code + Math.random().toString(36).slice(2, 5).toUpperCase()
        : code

      await db.from('affiliate_promo_codes').insert({
        affiliate_id:   profile.id,
        code:           finalCode,
        discount_type:  'percent',
        discount_value: discount,
        duration_months: months,
        description:    desc,
      })
    }

    // Send welcome email
    if (user.email) {
      const referralLink = `${appUrl}/?aff=${profile.id.slice(0, 8)}`
      await getResend().emails.send({
        from: 'SocialMate Partners <hello@socialmate.studio>',
        to: user.email,
        subject: "Welcome to the SocialMate Partner Program — you're active!",
        html: affiliateWelcomeEmail({ email: user.email, referralLink }),
      })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown step' }, { status: 400 })
}

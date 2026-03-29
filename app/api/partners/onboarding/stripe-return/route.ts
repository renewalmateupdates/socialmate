export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const affiliateId = searchParams.get('affiliate_id')
  if (!affiliateId) return NextResponse.redirect(new URL('/partners/onboarding', req.url))

  const db = getAdminSupabase()

  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('stripe_account_id')
    .eq('id', affiliateId)
    .maybeSingle()

  if (profile?.stripe_account_id) {
    try {
      const stripe = getStripe()
      const account = await stripe.accounts.retrieve(profile.stripe_account_id)
      const status = account.charges_enabled ? 'active' : 'pending'

      await db
        .from('affiliate_profiles')
        .update({ stripe_account_status: status })
        .eq('id', affiliateId)
    } catch (e) {
      console.error('Stripe retrieve error:', e)
    }
  }

  // Complete onboarding
  await db
    .from('affiliate_profiles')
    .update({ onboarding_completed: true, status: 'active' })
    .eq('id', affiliateId)

  return NextResponse.redirect(new URL('/partners/dashboard', req.url))
}

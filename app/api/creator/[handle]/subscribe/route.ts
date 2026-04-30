import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  const supabase = getSupabaseAdmin()

  const { data: creator } = await supabase
    .from('creator_monetization')
    .select('id, workspace_id, stripe_account_id, stripe_onboarding_complete, subscription_enabled, subscription_price, subscription_name, subscription_description, page_title')
    .eq('page_handle', handle)
    .single()

  if (!creator || !creator.stripe_onboarding_complete) {
    return NextResponse.json({ error: 'Creator not found.' }, { status: 404 })
  }
  if (!creator.subscription_enabled) {
    return NextResponse.json({ error: 'Fan subscriptions are not enabled.' }, { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: creator.subscription_price,
        recurring: { interval: 'month' },
        product_data: {
          name: `${creator.subscription_name} — ${creator.page_title || handle}`,
          description: creator.subscription_description || undefined,
        },
      },
      quantity: 1,
    }],
    subscription_data: {
      transfer_data: { destination: creator.stripe_account_id! },
      metadata: {
        type: 'creator_subscription',
        creator_monetization_id: creator.id,
        workspace_id: creator.workspace_id,
        creator_handle: handle,
      },
    },
    metadata: {
      type: 'creator_subscription',
      creator_monetization_id: creator.id,
      workspace_id: creator.workspace_id,
      creator_handle: handle,
    },
    success_url: `${origin}/creator/${handle}?sub=success`,
    cancel_url:  `${origin}/creator/${handle}?sub=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}

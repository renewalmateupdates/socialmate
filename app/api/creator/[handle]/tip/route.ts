import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const body = await req.json()
  const { amount_cents, message, supporter_name } = body

  if (!amount_cents || amount_cents < 100) {
    return NextResponse.json({ error: 'Minimum tip is $1.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Look up creator by handle
  const { data: creator } = await supabase
    .from('creator_monetization')
    .select('id, workspace_id, stripe_account_id, stripe_onboarding_complete, tip_enabled, tip_min, tip_max, page_title')
    .eq('page_handle', handle)
    .single()

  if (!creator || !creator.stripe_onboarding_complete) {
    return NextResponse.json({ error: 'Creator not found.' }, { status: 404 })
  }
  if (!creator.tip_enabled) {
    return NextResponse.json({ error: 'Tip jar is not enabled.' }, { status: 400 })
  }
  if (amount_cents < creator.tip_min || amount_cents > creator.tip_max) {
    return NextResponse.json({
      error: `Tip must be between $${creator.tip_min / 100} and $${creator.tip_max / 100}.`
    }, { status: 400 })
  }

  // Insert pending tip record
  const { data: tip } = await supabase
    .from('creator_tips')
    .insert({
      workspace_id: creator.workspace_id,
      creator_monetization_id: creator.id,
      amount: amount_cents,
      message: message || null,
      supporter_name: supporter_name || 'Anonymous',
      status: 'pending',
    })
    .select('id')
    .single()

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: amount_cents,
        product_data: {
          name: `Tip for ${creator.page_title || handle}`,
          description: message || undefined,
        },
      },
      quantity: 1,
    }],
    payment_intent_data: {
      transfer_data: { destination: creator.stripe_account_id! },
      metadata: {
        type: 'creator_tip',
        tip_id: tip!.id,
        creator_handle: handle,
        message: message || '',
        supporter_name: supporter_name || 'Anonymous',
      },
    },
    metadata: {
      type: 'creator_tip',
      tip_id: tip!.id,
    },
    success_url: `${origin}/creator/${handle}?tip=success`,
    cancel_url:  `${origin}/creator/${handle}?tip=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}

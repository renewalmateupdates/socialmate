export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// POST { post_id } — create Stripe checkout to one-time unlock a single paywalled post
export async function POST(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const { post_id } = await req.json()
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: cm } = await supabase
    .from('creator_monetization')
    .select('id, workspace_id, stripe_account_id, stripe_onboarding_complete, page_title')
    .eq('page_handle', handle)
    .eq('stripe_onboarding_complete', true)
    .single()

  if (!cm) return NextResponse.json({ error: 'Creator not found.' }, { status: 404 })

  const { data: post } = await supabase
    .from('creator_paywalled_posts')
    .select('id, title, unlock_price_cents')
    .eq('id', post_id)
    .eq('creator_monetization_id', cm.id)
    .eq('is_active', true)
    .single()

  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  if (!post.unlock_price_cents) {
    return NextResponse.json({ error: 'This post requires a fan subscription to unlock.' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

  // Insert pending unlock record first — session_id updated by webhook
  const { data: unlock } = await supabase
    .from('creator_post_unlocks')
    .insert({
      post_id: post.id,
      stripe_session_id: `pending_${Date.now()}`, // placeholder, updated by webhook
      amount_cents: post.unlock_price_cents,
      status: 'pending',
    })
    .select('id')
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: post.unlock_price_cents,
        product_data: {
          name: `Unlock: ${post.title}`,
          description: `One-time access to this post by ${cm.page_title || handle}`,
        },
      },
      quantity: 1,
    }],
    payment_intent_data: {
      transfer_data: { destination: cm.stripe_account_id! },
    },
    metadata: {
      type:         'creator_post_unlock',
      post_id:      post.id,
      unlock_id:    unlock?.id ?? '',
      workspace_id: cm.workspace_id,
      creator_handle: handle,
    },
    success_url: `${APP_URL}/creator/${handle}?unlock=success&cs_id={CHECKOUT_SESSION_ID}&post_id=${post.id}`,
    cancel_url:  `${APP_URL}/creator/${handle}`,
  })

  // Update placeholder session_id with real one
  if (unlock?.id) {
    await supabase
      .from('creator_post_unlocks')
      .update({ stripe_session_id: session.id })
      .eq('id', unlock.id)
  }

  return NextResponse.json({ url: session.url })
}

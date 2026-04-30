export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

let _stripe: Stripe | null = null
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  return _stripe
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// SOMA credit pack price IDs (Stripe live one-time products, created April 30 2026)
export const SOMA_CREDIT_PACKS = [
  { id: 'soma_75',  credits: 75,  price_id: 'price_1TRx227OMwDowUuU8IRlxaRh', label: 'Starter',  amount: '$4.99'  },
  { id: 'soma_225', credits: 225, price_id: 'price_1TRx2U7OMwDowUuU5ZqeMu6a', label: 'Growth',   amount: '$12.99' },
  { id: 'soma_500', credits: 500, price_id: 'price_1TRx2w7OMwDowUuU4t8lMMwe', label: 'Pro',       amount: '$24.99' },
]

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pack_id, workspace_id } = await req.json()
    const pack = SOMA_CREDIT_PACKS.find(p => p.id === pack_id)
    if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    if (!pack.price_id) return NextResponse.json({ error: 'Pack not yet configured' }, { status: 503 })

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: pack.price_id, quantity: 1 }],
      success_url: `${APP_URL}/soma/dashboard?soma_credits_success=1`,
      cancel_url:  `${APP_URL}/soma/dashboard`,
      metadata: {
        type:         'soma_credits',
        user_id:      user.id,
        workspace_id: workspace_id ?? '',
        pack_id:      pack.id,
        credits:      String(pack.credits),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[soma/credits/purchase]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ packs: SOMA_CREDIT_PACKS.map(p => ({ ...p, price_id: undefined })) })
}

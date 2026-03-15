import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: 'Support SocialMate ❤️',
              description: 'A voluntary contribution to support the mission. Thank you.',
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/story?donated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/story`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Donation error:', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
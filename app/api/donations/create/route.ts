export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

type DonationType = 'charity' | 'founder_support'

const DONATION_CONFIG: Record<DonationType, {
  name: string
  description: string
  allocation: string
  successPath: string
}> = {
  charity: {
    name: 'Donate to SM-Give ❤️',
    description: '100% of this donation goes directly to SM-Give — school supplies, baby essentials, and homeless care packages.',
    allocation: '100_percent_charity',
    successPath: '/give?donated=true',
  },
  founder_support: {
    name: 'Support the Founder 💛',
    description: '50% of this contribution goes to SM-Give charity. The remaining 50% supports the founder directly.',
    allocation: '50_percent_charity',
    successPath: '/story?donated=true',
  },
}

export async function POST(req: NextRequest) {
  try {
    const { amount, donation_type } = await req.json()

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const type: DonationType = donation_type === 'charity' ? 'charity' : 'founder_support'
    const config = DONATION_CONFIG[type]

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: config.name,
              description: config.description,
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          donation_type: type,
          allocation: config.allocation,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${config.successPath}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/story`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Donation error:', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const DONATION_PRICES: Record<string, string> = {
  '5':  'price_1TFMIJ7OMwDowUuUj5amigA0',
  '10': 'price_1TFMIM7OMwDowUuUcmN2hPwT',
  '25': 'price_1TFMIQ7OMwDowUuUfdZXeATH',
  '50': 'price_1TFMIT7OMwDowUuUHgqWqtUZ',
}

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()
    const priceId = DONATION_PRICES[String(amount)]
    if (!priceId) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/give?donated=true`,
      cancel_url: `${appUrl}/give`,
      metadata: { type: 'donation' },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const SHOP_ID = process.env.PRINTIFY_SHOP_ID || '27238436'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export async function POST(req: NextRequest) {
  try {
    const { product_id, variant_id, variant_title, price_cents, product_title, image_url } = await req.json()

    if (!product_id || !variant_id || !price_cents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: price_cents,
          product_data: {
            name: `${product_title} — ${variant_title}`,
            description: 'Power to the people. 75% of profit goes to SM-Give.',
            ...(image_url ? { images: [image_url] } : {}),
          },
        },
        quantity: 1,
      }],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'FI', 'IT', 'ES', 'JP'],
      },
      metadata: {
        type: 'merch',
        product_id,
        variant_id: String(variant_id),
        printify_shop_id: SHOP_ID,
      },
      success_url: `${APP_URL}/merch?success=true`,
      cancel_url:  `${APP_URL}/merch`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[MerchCheckout]', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}

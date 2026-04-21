export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const BOOSTER_TIERS: Record<string, { posts: number; priceAmount: number; label: string }> = {
  spark:  { posts: 50,  priceAmount: 199,  label: 'X Booster — Spark (50 posts)'  },
  boost:  { posts: 120, priceAmount: 499,  label: 'X Booster — Boost (120 posts)' },
  surge:  { posts: 250, priceAmount: 999,  label: 'X Booster — Surge (250 posts)' },
  storm:  { posts: 500, priceAmount: 1999, label: 'X Booster — Storm (500 posts)' },
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tier } = await req.json()

  if (!tier || !BOOSTER_TIERS[tier]) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const { posts, priceAmount, label } = BOOSTER_TIERS[tier]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: priceAmount,
          product_data: { name: label },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id:      user.id,
      type:         'x_booster',
      booster_tier: tier,
      booster_posts: String(posts),
    },
    automatic_tax: { enabled: true },
    success_url: `${appUrl}/settings?tab=Plan&booster=purchased#x-booster`,
    cancel_url:  `${appUrl}/settings?tab=Plan#x-booster`,
  })

  return NextResponse.json({ url: session.url })
}

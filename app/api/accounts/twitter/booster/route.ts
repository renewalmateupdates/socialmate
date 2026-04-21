export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'

const BOOSTER_TIERS: Record<string, { amount: number; priceEnvVar: string }> = {
  spark:  { amount: 50,  priceEnvVar: 'TWITTER_BOOSTER_SPARK_PRICE_ID'  },
  boost:  { amount: 120, priceEnvVar: 'TWITTER_BOOSTER_BOOST_PRICE_ID'  },
  surge:  { amount: 250, priceEnvVar: 'TWITTER_BOOSTER_SURGE_PRICE_ID'  },
  storm:  { amount: 500, priceEnvVar: 'TWITTER_BOOSTER_STORM_PRICE_ID'  },
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

  let body: { tier?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tier } = body
  if (!tier || !BOOSTER_TIERS[tier]) {
    return NextResponse.json(
      { error: 'Invalid tier. Must be one of: spark, boost, surge, storm' },
      { status: 400 }
    )
  }

  const tierConfig = BOOSTER_TIERS[tier]
  const priceId    = process.env[tierConfig.priceEnvVar]

  if (!priceId) {
    console.error(`[XBooster] Missing env var: ${tierConfig.priceEnvVar}`)
    return NextResponse.json({ error: 'Booster pricing not configured yet' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  try {
    const session = await stripe.checkout.sessions.create({
      mode:        'payment',
      line_items:  [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings?tab=Plan&booster=purchased#x-booster`,
      cancel_url:  `${appUrl}/settings?tab=Plan#x-booster`,
      metadata: {
        type:    'twitter_booster',
        tier,
        user_id: user.id,
        amount:  String(tierConfig.amount),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[XBooster] Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

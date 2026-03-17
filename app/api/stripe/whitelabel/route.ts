import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const WHITE_LABEL_PRICES: Record<string, string> = {
  basic: 'price_1T9qAu7OMwDowUuUsqM2jwoC',
  pro:   'price_1TBnnS7OMwDowUuUsr09eHVg',
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tier } = await req.json()
  const priceId = WHITE_LABEL_PRICES[tier]
  if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

  // Check user is on Pro or Agency
  const { data: settings } = await supabase
    .from('user_settings')
    .select('plan, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!settings || settings.plan === 'free') {
    return NextResponse.json({ error: 'White Label requires Pro or Agency plan' }, { status: 403 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: settings.stripe_customer_id || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?tab=White+Label&white_label=activated`,
    cancel_url: `${appUrl}/settings?tab=White+Label`,
    metadata: {
      user_id: user.id,
      type: 'white_label',
      white_label_tier: tier,
    },
  })

  return NextResponse.json({ url: session.url })
}

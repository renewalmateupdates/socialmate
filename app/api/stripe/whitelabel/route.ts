export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const WHITE_LABEL_PRICES: Record<string, string> = {
  basic: 'price_1T9qAu7OMwDowUuUsqM2jwoC',
  pro:   'price_1TBnnS7OMwDowUuUsr09eHVg',
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

  if (!tier || !WHITE_LABEL_PRICES[tier]) {
    return NextResponse.json({ error: 'Invalid tier — must be basic or pro' }, { status: 400 })
  }

  // Verify user is on a paid plan before allowing white label purchase
  const { data: settings } = await supabase
    .from('user_settings')
    .select('plan, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!settings || settings.plan === 'free') {
    return NextResponse.json({
      error: 'White Label requires a Pro or Agency subscription',
    }, { status: 403 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  // If user already has a Stripe customer, add white label to their existing subscription
  // Otherwise create a new checkout session
  const sessionParams: any = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: WHITE_LABEL_PRICES[tier], quantity: 1 }],
    metadata: {
      user_id: user.id,
      type: 'white_label',
      white_label_tier: tier,
    },
    success_url: `${appUrl}/settings?tab=White Label&white_label=activated`,
    cancel_url: `${appUrl}/settings?tab=White Label`,
  }

  // Attach to existing customer if we have one so invoices consolidate
  if (settings.stripe_customer_id) {
    sessionParams.customer = settings.stripe_customer_id
  } else {
    sessionParams.customer_email = user.email
  }

  const session = await stripe.checkout.sessions.create(sessionParams)
  return NextResponse.json({ url: session.url })
}
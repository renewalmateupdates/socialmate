export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'

// Enki Stripe price IDs
export const ENKI_PRICES: Record<string, string> = {
  commander_monthly: 'price_1TMthL7OMwDowUuUndSIejcJ',
  commander_annual:  'price_1TMthy7OMwDowUuURnoHc2Qq',
  emperor_monthly:   'price_1TMtiN7OMwDowUuUU5rzK88L',
  emperor_annual:    'price_1TMtis7OMwDowUuUpQ2hZamc',
  cloud_runner:      'price_1TMtkc7OMwDowUuU8aepieuq',
}

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// POST /api/enki/checkout
// Body: { plan: 'commander' | 'emperor' | 'cloud_runner', billing: 'monthly' | 'annual' }
// Returns: { url: string } — Stripe Checkout hosted URL
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, billing } = await req.json() as { plan: string; billing: string }

  const key = plan === 'cloud_runner'
    ? 'cloud_runner'
    : `${plan}_${billing === 'annual' ? 'annual' : 'monthly'}`

  const priceId = ENKI_PRICES[key]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  const session = await stripe.checkout.sessions.create({
    mode:                 'subscription',
    payment_method_types: ['card'],
    customer_email:       user.email ?? undefined,
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          `${appUrl}/enki/dashboard?upgrade=success`,
    cancel_url:           `${appUrl}/enki#pricing`,
    metadata: {
      enki:    'true',
      plan,
      user_id: user.id,
    },
  })

  return NextResponse.json({ url: session.url })
}

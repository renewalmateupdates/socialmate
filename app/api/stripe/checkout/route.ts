import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId, fromOnboarding } = await req.json()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  const successUrl = fromOnboarding
    ? `${appUrl}/onboarding?upgraded=true&step=3`
    : `${appUrl}/dashboard?upgraded=true`

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id },
    success_url: successUrl,
    cancel_url: fromOnboarding ? `${appUrl}/onboarding?step=2` : `${appUrl}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
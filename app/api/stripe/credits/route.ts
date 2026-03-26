export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const VALID_CREDIT_PRICE_IDS = new Set([
  'price_1TA0jd7OMwDowUuULUw5W7EQ', // Starter  100cr
  'price_1TA0l37OMwDowUuUU5JpIcDK', // Popular  300cr
  'price_1TA0nA7OMwDowUuU5wHTbucn', // Pro Pack 750cr
  'price_1TA0nS7OMwDowUuUKURJ7ZM4', // Max Pack 2000cr
])

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await req.json()

  if (!priceId || !VALID_CREDIT_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      user_id: user.id,
      type: 'credit_pack',
      price_id: priceId,
    },
    automatic_tax: { enabled: true },
    success_url: `${appUrl}/settings?tab=Plan&credits=purchased`,
    cancel_url: `${appUrl}/settings?tab=Plan`,
  })

  return NextResponse.json({ url: session.url })
}
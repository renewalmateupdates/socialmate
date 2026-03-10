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

  const { data: settings } = await supabase
    .from('user_settings')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!settings?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: settings.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
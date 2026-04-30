import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

function makeClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (a) => a.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}

export async function GET(req: NextRequest) {
  const supabase = makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  if (!user) return NextResponse.redirect(`${origin}/login?redirect=/monetize/hub`)

  const workspaceId = req.nextUrl.searchParams.get('workspace_id')
  if (!workspaceId) return NextResponse.redirect(`${origin}/monetize/hub?connect=error`)

  // Verify account is actually connected in Stripe
  const { data: settings } = await supabase
    .from('creator_monetization')
    .select('stripe_account_id')
    .eq('workspace_id', workspaceId)
    .single()

  if (settings?.stripe_account_id) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })
    try {
      const account = await stripe.accounts.retrieve(settings.stripe_account_id)
      const complete = account.details_submitted && account.charges_enabled

      await supabase
        .from('creator_monetization')
        .update({ stripe_onboarding_complete: complete })
        .eq('workspace_id', workspaceId)

      return NextResponse.redirect(`${origin}/monetize/hub?connect=${complete ? 'success' : 'pending'}`)
    } catch {
      return NextResponse.redirect(`${origin}/monetize/hub?connect=error`)
    }
  }

  return NextResponse.redirect(`${origin}/monetize/hub?connect=error`)
}

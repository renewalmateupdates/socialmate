import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

async function makeClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (a) => a.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}

export async function GET(req: NextRequest) {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = req.nextUrl.searchParams.get('workspace_id')
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

  // Pro+ gate
  const { data: ws } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .single()
  const plan = (ws?.plan ?? 'free').replace('_annual', '')
  if (plan === 'free') return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

  // Get or create Stripe Connect Express account
  const { data: settings } = await supabase
    .from('creator_monetization')
    .select('stripe_account_id')
    .eq('workspace_id', workspaceId)
    .single()

  let accountId = settings?.stripe_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' })
    accountId = account.id

    await supabase
      .from('creator_monetization')
      .upsert({
        workspace_id: workspaceId,
        user_id: user.id,
        stripe_account_id: accountId,
      }, { onConflict: 'workspace_id' })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/monetize/hub?connect=refresh`,
    return_url:  `${origin}/api/monetize/connect/callback?workspace_id=${workspaceId}`,
    type: 'account_onboarding',
  })

  return NextResponse.redirect(accountLink.url)
}

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get affiliate record
  const { data: affiliate } = await adminSupabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!affiliate) {
    return NextResponse.json({ affiliate: null })
  }

  // Get referral code from user_settings
  const { data: settings } = await adminSupabase
    .from('user_settings')
    .select('referral_code')
    .eq('user_id', user.id)
    .single()

  // Get all conversions
  const { data: conversions } = await adminSupabase
    .from('referral_conversions')
    .select('*')
    .eq('affiliate_user_id', user.id)
    .order('converted_at', { ascending: false })

  // Compute commission tier
  const activeCount = affiliate.active_referral_count ?? 0
  const commissionRate = activeCount >= 100 ? 0.40 : 0.30
  const commissionLabel = activeCount >= 100 ? '40%' : '30%'
  const nextTier = activeCount >= 100
    ? null
    : { rate: '40%', remaining: 100 - activeCount }

  return NextResponse.json({
    affiliate: {
      ...affiliate,
      commission_rate: commissionRate,
    },
    referral_code: settings?.referral_code ?? null,
    conversions: conversions ?? [],
    commission_label: commissionLabel,
    next_tier: nextTier,
  })
}
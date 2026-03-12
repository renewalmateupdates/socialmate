import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
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

  // Must be an active paying user (pro or agency)
  const { data: settings } = await adminSupabase
    .from('user_settings')
    .select('plan, referral_code')
    .eq('user_id', user.id)
    .single()

  if (!settings || settings.plan === 'free') {
    return NextResponse.json(
      { error: 'You must be on a paid plan to join the affiliate program.' },
      { status: 403 }
    )
  }

  // Check if already an affiliate
  const { data: existing } = await adminSupabase
    .from('affiliates')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'You are already registered as an affiliate.' },
      { status: 409 }
    )
  }

  // Register as affiliate
  const { error } = await adminSupabase
    .from('affiliates')
    .insert({
      user_id: user.id,
      status: 'active',
      commission_rate: 0.30,
      total_earnings: 0,
      unpaid_earnings: 0,
      active_referral_count: 0,
    })

  if (error) {
    console.error('Affiliate join error:', error)
    return NextResponse.json({ error: 'Failed to join affiliate program.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    referral_code: settings.referral_code,
  })
}
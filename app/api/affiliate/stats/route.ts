export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

function getAdminSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(req.url)
  const isAdmin = searchParams.get('admin') === 'true'

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

  const adminSupabase = getAdminSupabase()

  // Admin view — all applications
  if (isAdmin) {
    if (ADMIN_USER_ID && user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ forbidden: true }, { status: 403 })
    }
    const { data: applications } = await adminSupabase
      .from('affiliates')
      .select('*')
      .order('applied_at', { ascending: false })

    return NextResponse.json({ applications: applications ?? [] })
  }

  // User view — own record
  const { data: affiliate } = await adminSupabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!affiliate) {
    return NextResponse.json({ affiliate: null })
  }

  const { data: settings } = await adminSupabase
    .from('user_settings')
    .select('referral_code')
    .eq('user_id', user.id)
    .single()

  const { data: conversions } = await adminSupabase
    .from('referral_conversions')
    .select('*')
    .eq('affiliate_user_id', user.id)
    .order('converted_at', { ascending: false })

  const activeCount: number = affiliate.active_referral_count ?? 0
  const commissionRate = activeCount >= 100 ? 0.40 : 0.30
  const commissionLabel = activeCount >= 100 ? '40%' : '30%'
  const nextTier = activeCount >= 100
    ? null
    : { rate: '40%', remaining: 100 - activeCount }

  return NextResponse.json({
    affiliate: { ...affiliate, commission_rate: commissionRate },
    referral_code: settings?.referral_code ?? null,
    conversions: conversions ?? [],
    commission_label: commissionLabel,
    next_tier: nextTier,
  })
}
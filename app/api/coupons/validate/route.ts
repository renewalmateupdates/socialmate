export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ valid: false, error: 'No code provided' })

  // Get authed user to check for double-redemption
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()

  const db = getSupabaseAdmin()

  const { data: coupon, error } = await db
    .from('coupons')
    .select('id, code, discount_type, discount_value, max_redemptions, current_redemptions, expires_at, active')
    .ilike('code', code.trim())
    .single()

  if (error || !coupon) return NextResponse.json({ valid: false, error: 'Code not found' })
  if (!coupon.active) return NextResponse.json({ valid: false, error: 'Code is no longer active' })
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Code has expired' })
  }
  if (coupon.max_redemptions != null && coupon.current_redemptions >= coupon.max_redemptions) {
    return NextResponse.json({ valid: false, error: 'Code has reached its redemption limit' })
  }

  // Check if this user already used this coupon
  if (user) {
    const { data: existing } = await db
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ valid: false, error: 'You have already used this code' })
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id:             coupon.id,
      code:           coupon.code,
      discount_type:  coupon.discount_type,
      discount_value: coupon.discount_value,
    },
  })
}

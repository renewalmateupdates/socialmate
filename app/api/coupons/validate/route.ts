export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { SUPPORT_EMAIL } from '@/lib/contact'
import { paidWithCode, schoolEmailProblem, worksAtCheckout } from '@/lib/coupon-redemption'

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
    .select('id, code, discount_type, discount_value, max_redemptions, current_redemptions, expires_at, active, stripe_promo_id')
    .ilike('code', code.trim())
    .maybeSingle()

  if (error) console.warn('[coupons/validate] lookup failed:', error.message)
  if (error || !coupon) return NextResponse.json({ valid: false, error: 'Code not found' })
  if (!coupon.active) return NextResponse.json({ valid: false, error: 'Code is no longer active' })
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Code has expired' })
  }
  if (coupon.max_redemptions != null && coupon.current_redemptions >= coupon.max_redemptions) {
    return NextResponse.json({ valid: false, error: 'Code has reached its redemption limit' })
  }
  // Never say "applied" for a discount Stripe won't give (lib/coupon-redemption.ts).
  if (!worksAtCheckout(coupon)) {
    return NextResponse.json({ valid: false, error: `This code isn't set up at checkout yet. Email ${SUPPORT_EMAIL} and we'll sort it out.` })
  }
  // STUDENT25 needs a school email on the account (the same check runs at checkout).
  const school = schoolEmailProblem(coupon.code, user?.email)
  if (school) return NextResponse.json({ valid: false, error: school })

  // Only a checkout this person finished counts as using the code. Backing
  // out of Stripe's page used to burn it.
  if (user) {
    const { data: prior, error: priorError } = await db
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .limit(1)
    if (priorError) console.warn('[coupons/validate] redemption lookup failed:', priorError.message)

    if (prior?.length && await paidWithCode(stripe, user.email, coupon.code)) {
      return NextResponse.json({ valid: false, error: 'You have already used this code' })
    }
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

export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { stripe } from '@/lib/stripe'
import { FINAL_SALE_CHECKOUT_TEXT } from '@/lib/refund-policy'
import { resolveWorkspacePlan, PLAN_TIKTOK_VIDEOS } from '@/lib/plan'
import {
  TIKTOK_PACK, TIKTOK_PACK_PRICE, TIKTOK_PACK_TYPE, packOfferMessage, tiktokAllowance, usedThisMonth,
} from '@/lib/tiktok-pack'

// The TikTok pack (lib/tiktok-pack.ts): scheduled TikTok videos past the
// month's allowance, bought once. The Stripe webhook adds them on payment.

async function signedInUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Where the creator stands: the month's TikTok videos and their pack. Studio
// asks before it uploads a video to schedule, so a refusal costs no upload.
export async function GET() {
  const user = await signedInUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db      = getSupabaseAdmin()
  const plan    = await resolveWorkspacePlan(db, user.id, null)
  const monthly = PLAN_TIKTOK_VIDEOS[plan] ?? PLAN_TIKTOK_VIDEOS.free

  const { data: ws, error } = await db
    .from('workspaces')
    .select('tiktok_videos_this_month, tiktok_booster_credits, tiktok_quota_reset_at')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('[tiktok-pack] could not read the TikTok count:', error.message)
    return NextResponse.json({ error: 'Could not read your TikTok videos. Try again.' }, { status: 500 })
  }

  const used       = usedThisMonth(ws?.tiktok_videos_this_month, ws?.tiktok_quota_reset_at)
  const packVideos = Math.max(0, ws?.tiktok_booster_credits ?? 0)
  const allowance  = tiktokAllowance(monthly, used, packVideos)
  const planName   = plan.charAt(0).toUpperCase() + plan.slice(1)

  return NextResponse.json({
    monthly,
    used,
    packVideos,
    canSchedule: allowance.allowed,
    ...(!allowance.allowed && { message: packOfferMessage(monthly, planName) }),
    pack: { videos: TIKTOK_PACK.videos, price: TIKTOK_PACK_PRICE },
  })
}

// Checkout for one pack. The price comes from TIKTOK_PACK, never a Stripe
// Price kept elsewhere, so the button and the charge can't disagree.
export async function POST() {
  const user = await signedInUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency:    'usd',
          unit_amount: TIKTOK_PACK.priceCents,
          product_data: {
            name:        `TikTok pack: ${TIKTOK_PACK.videos} scheduled videos`,
            description: 'One-time. Schedules TikTok videos past your monthly allowance. Never expires.',
          },
        },
      }],
      custom_text:         FINAL_SALE_CHECKOUT_TEXT,
      client_reference_id: user.id,
      ...(user.email && { customer_email: user.email }),
      success_url: `${appUrl}/tiktok/studio?pack=purchased`,
      cancel_url:  `${appUrl}/tiktok/studio`,
      metadata: {
        type:    TIKTOK_PACK_TYPE,
        user_id: user.id,
        videos:  String(TIKTOK_PACK.videos),
      },
    })
    if (!session.url) throw new Error('Stripe returned no checkout URL')
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[tiktok-pack] Stripe checkout error:', err)
    return NextResponse.json({ error: 'Could not open checkout. Try again in a minute.' }, { status: 500 })
  }
}

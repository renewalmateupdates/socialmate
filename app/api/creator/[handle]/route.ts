import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: creator } = await supabase
    .from('creator_monetization')
    .select('page_handle, page_title, page_bio, avatar_url, tip_enabled, tip_min, tip_max, subscription_enabled, subscription_price, subscription_name, subscription_description')
    .eq('page_handle', handle)
    .eq('stripe_onboarding_complete', true)
    .single()

  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ creator })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const refCode = searchParams.get('ref')

  if (!refCode) return NextResponse.json({ isAffiliate: false })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: settings } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('referral_code', refCode)
    .single()

  if (!settings) return NextResponse.json({ isAffiliate: false })

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('status')
    .eq('user_id', settings.user_id)
    .eq('status', 'active')
    .single()

  return NextResponse.json({ isAffiliate: !!affiliate })
}
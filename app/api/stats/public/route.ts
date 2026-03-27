export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('user_settings')
    .select('plan, white_label_tier')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }

  const stats = {
    free: 0,
    pro: 0,
    agency: 0,
    white_label: 0,
    total: data?.length ?? 0,
  }

  for (const row of data ?? []) {
    if (row.plan === 'agency') stats.agency++
    else if (row.plan === 'pro') stats.pro++
    else stats.free++

    if (row.white_label_tier) stats.white_label++
  }

  return NextResponse.json(stats)
}

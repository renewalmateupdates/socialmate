export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('sm_give_allocations')
    .select('source, give_cents')

  if (error) return NextResponse.json({ total_cents: 0, breakdown: {}, count: 0 })

  const breakdown: Record<string, number> = {}
  let total = 0
  for (const row of (data ?? [])) {
    breakdown[row.source] = (breakdown[row.source] ?? 0) + row.give_cents
    total += row.give_cents
  }

  return NextResponse.json({ total_cents: total, breakdown, count: data?.length ?? 0 })
}

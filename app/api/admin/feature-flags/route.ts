export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { mergeFlagState } from '@/lib/feature-flags'

// GET /api/admin/feature-flags — list all flags
export async function GET(_request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await getSupabaseAdmin()
    .from('feature_flags')
    .select('*')
    .order('flag')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Merged against the registry so every switch the code honours is listed,
  // including ones that have never been toggled and so have no row yet.
  return NextResponse.json({ flags: mergeFlagState(data) })
}

// PATCH /api/admin/feature-flags — toggle a flag
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { flag, enabled } = body

  if (!flag || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'flag and enabled are required' }, { status: 400 })
  }

  // Upsert, not update: the first time a flag is switched off there is no row
  // to update, and an UPDATE matching nothing succeeds while changing nothing —
  // the toggle would appear to work and the feature would stay live.
  const { data, error } = await getSupabaseAdmin()
    .from('feature_flags')
    .upsert({
      flag,
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: admin.email || admin.id,
    }, { onConflict: 'flag' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log(`[FeatureFlag] ${admin.email} set ${flag} → ${enabled}`)
  return NextResponse.json({ flag: data })
}

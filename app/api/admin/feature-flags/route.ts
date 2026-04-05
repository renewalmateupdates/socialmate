export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function requireAdmin(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  return settings?.is_admin ? user.email || user.id : null
}

// GET /api/admin/feature-flags — list all flags
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await getSupabaseAdmin()
    .from('feature_flags')
    .select('*')
    .order('flag')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flags: data })
}

// PATCH /api/admin/feature-flags — toggle a flag
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { flag, enabled } = body

  if (!flag || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'flag and enabled are required' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('feature_flags')
    .update({ enabled, updated_at: new Date().toISOString(), updated_by: admin })
    .eq('flag', flag)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log(`[FeatureFlag] ${admin} set ${flag} → ${enabled}`)
  return NextResponse.json({ flag: data })
}

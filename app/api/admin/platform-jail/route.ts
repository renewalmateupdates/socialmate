export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET — returns all Twitter accounts currently in the cooling jail
export async function GET(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('platform_account_registry')
    .select('id, platform, platform_account_id, status, disconnected_at, cooling_until, created_at')
    .eq('status', 'cooling')
    .order('cooling_until', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ jailed: data ?? [] })
}

// POST { platform_account_id, platform } — releases an account from jail early
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { platform_account_id, platform } = body as { platform_account_id?: string; platform?: string }

  if (!platform_account_id || !platform) {
    return NextResponse.json({ error: 'platform_account_id and platform are required' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('platform_account_registry')
    .update({
      status: 'released',
      cooling_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('platform', platform)
    .eq('platform_account_id', platform_account_id)
    .select('id, platform, platform_account_id, status')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

  return NextResponse.json({ released: data })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const accountId = body?.accountId

  // Fetch platform_user_id BEFORE deleting so we can update the jail registry
  let platformUserId: string | null = null
  if (accountId) {
    const { data: accountRow } = await supabase
      .from('connected_accounts')
      .select('platform_user_id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .maybeSingle()
    platformUserId = accountRow?.platform_user_id ?? null
  } else {
    const { data: accountRow } = await supabase
      .from('connected_accounts')
      .select('platform_user_id')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .maybeSingle()
    platformUserId = accountRow?.platform_user_id ?? null
  }

  let query = supabase
    .from('connected_accounts')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'twitter')

  if (accountId) query = query.eq('id', accountId)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Put the Twitter account into the 45-day cooling jail
  if (platformUserId) {
    const now = new Date()
    const coolingUntil = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000)
    await getSupabaseAdmin()
      .from('platform_account_registry')
      .update({
        status: 'cooling',
        connected_to_user: null,
        disconnected_at: now.toISOString(),
        cooling_until: coolingUntil.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('platform', 'twitter')
      .eq('platform_account_id', platformUserId)
  }

  return NextResponse.json({ ok: true })
}

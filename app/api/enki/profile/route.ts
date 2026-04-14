export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// GET — fetch the current user's Enki profile (creates one if missing)
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Try to fetch existing profile
  let { data: profile, error } = await supabase
    .from('enki_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Auto-create citizen profile on first visit
  if (error || !profile) {
    const { data: created, error: createErr } = await supabase
      .from('enki_profiles')
      .insert({ user_id: user.id, tier: 'citizen' })
      .select()
      .single()

    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    profile = created
  }

  return NextResponse.json({ profile })
}

// PATCH — update guardian_mode or other settings
export async function PATCH(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['guardian_mode', 'alpaca_connected', 'coinbase_connected', 'risk_preset']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { error } = await supabase
    .from('enki_profiles')
    .update(updates)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

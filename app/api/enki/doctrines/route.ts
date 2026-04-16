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

// GET — fetch all doctrines for current user
export async function GET(_req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ doctrines: [] })

  const { data, error } = await supabase
    .from('enki_doctrines')
    .select('id, name, description, config, is_active, is_public, is_template, backtest_result, copies_count, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ doctrines: data ?? [] })
}

// POST — create a new doctrine
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, config, is_active, is_public } = body

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (name.trim().length > 60) {
    return NextResponse.json({ error: 'name must be 60 characters or fewer' }, { status: 400 })
  }

  // Validate config.symbols
  if (!config || !Array.isArray(config.symbols) || config.symbols.length === 0) {
    return NextResponse.json({ error: 'config.symbols must be a non-empty array' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('enki_doctrines')
    .insert({
      user_id:     user.id,
      name:        name.trim(),
      description: description || null,
      config,
      is_active:   is_active ?? false,
      is_public:   is_public ?? false,
      is_template: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ doctrine: data }, { status: 201 })
}

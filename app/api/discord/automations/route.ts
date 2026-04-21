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

// GET — fetch all automations for the authenticated user
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('discord_automations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ automations: data ?? [] })
}

// POST — upsert a single automation config
// Body: { guild_id, automation_type, config, is_active }
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { guild_id, automation_type, config, is_active } = body

  if (!guild_id || !automation_type) {
    return NextResponse.json({ error: 'guild_id and automation_type are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('discord_automations')
    .upsert(
      {
        user_id:          user.id,
        guild_id,
        automation_type,
        config:           config ?? {},
        is_active:        is_active ?? true,
      },
      { onConflict: 'user_id,guild_id,automation_type' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ automation: data })
}

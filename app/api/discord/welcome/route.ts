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

// GET — fetch the user's welcome config for their guild
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('discord_welcome_configs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ config: data ?? null })
}

// POST — upsert welcome config { guild_id, channel_id, message, enabled }
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { guild_id, channel_id, message, enabled } = body

  if (!guild_id || !channel_id) {
    return NextResponse.json({ error: 'guild_id and channel_id are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('discord_welcome_configs')
    .upsert(
      {
        user_id:    user.id,
        guild_id,
        channel_id,
        message:    message ?? 'Welcome to the server, {{username}}! 🎉',
        enabled:    enabled ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,guild_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ config: data })
}

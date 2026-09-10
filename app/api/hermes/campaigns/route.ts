export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getHermesAccess, HERMES_LIMITS } from '@/lib/hermes-access'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  return supabase.auth.getUser()
}

export async function GET() {
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const access = await getHermesAccess(supabase, user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const { data: campaigns, error } = await supabase
    .from('hermes_campaigns')
    .select('*, hermes_prospects(count), hermes_messages(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaigns: campaigns ?? [] })
}

export async function POST(req: NextRequest) {
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const access = await getHermesAccess(supabase, user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const { count: campaignCount } = await supabase
    .from('hermes_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('status', 'completed')
  const limit = HERMES_LIMITS[access.tier!].campaigns
  if ((campaignCount ?? 0) >= limit) {
    return NextResponse.json({ error: `Your plan is limited to ${limit} active campaigns. Complete or delete one to create another.` }, { status: 403 })
  }

  const body = await req.json()
  const { name, goal, persona_description, channels, sequence_days, mode } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('hermes_campaigns')
    .insert({
      user_id: user.id,
      name: name.trim(),
      goal: goal?.trim() || null,
      persona_description: persona_description?.trim() || null,
      channels: channels ?? ['email'],
      sequence_days: sequence_days ?? [0, 3, 7],
      mode: mode ?? 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaign: data })
}

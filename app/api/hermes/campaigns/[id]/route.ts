export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data: campaign, error } = await supabase
    .from('hermes_campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: prospects } = await supabase
    .from('hermes_prospects')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })

  const { data: messages } = await supabase
    .from('hermes_messages')
    .select('*, hermes_prospects(name)')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ campaign, prospects: prospects ?? [], messages: messages ?? [] })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['name', 'goal', 'persona_description', 'channels', 'sequence_days', 'mode', 'status']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('hermes_campaigns')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaign: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('hermes_campaigns')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

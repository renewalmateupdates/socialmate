export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getHermesAccess } from '@/lib/hermes-access'

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const access = await getHermesAccess(getSupabaseAdmin(), user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const { subject, body } = await req.json()
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('hermes_messages')
    .update({ subject, body })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const access = await getHermesAccess(getSupabaseAdmin(), user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('hermes_messages')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

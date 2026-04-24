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
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET /api/soma/projects/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const admin = getSupabaseAdmin()

    const { data: project, error } = await admin
      .from('soma_projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Fetch last 2 master docs for diff display
    const { data: docs } = await admin
      .from('soma_master_docs')
      .select('id, version, filename, input_method, created_at, content')
      .eq('project_id', id)
      .order('version', { ascending: false })
      .limit(2)

    return NextResponse.json({ project, docs: docs ?? [] })
  } catch (err) {
    console.error('[SOMA Project GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/soma/projects/[id] — update settings
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    const admin = getSupabaseAdmin()

    const { data, error } = await admin
      .from('soma_projects')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error || !data) return NextResponse.json({ error: 'Update failed' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SOMA Project PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/soma/projects/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const admin = getSupabaseAdmin()

    const { error } = await admin
      .from('soma_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SOMA Project DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

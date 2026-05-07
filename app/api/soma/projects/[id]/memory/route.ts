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
  return { user, supabase }
}

// GET /api/soma/projects/[id]/memory
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: projectId } = await params

  const admin = getSupabaseAdmin()
  const { data: memory } = await admin
    .from('soma_project_memory')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()

  return NextResponse.json({ memory: memory ?? null })
}

// DELETE /api/soma/projects/[id]/memory — clear/reset SOMA's memory for this project
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: projectId } = await params

  const admin = getSupabaseAdmin()
  await admin.from('soma_project_memory').delete().eq('project_id', projectId)

  return NextResponse.json({ success: true })
}

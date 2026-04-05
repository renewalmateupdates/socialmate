export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = params

  const { data: post } = await getSupabaseAdmin()
    .from('posts')
    .select('id, is_evergreen, user_id, status')
    .eq('id', id)
    .single()

  if (!post || post.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only published posts can be marked evergreen
  if (!post.is_evergreen && post.status !== 'published') {
    return NextResponse.json(
      { error: 'Only published posts can be marked as evergreen' },
      { status: 400 }
    )
  }

  const { data: updated, error } = await getSupabaseAdmin()
    .from('posts')
    .update({ is_evergreen: !post.is_evergreen })
    .eq('id', id)
    .select('id, is_evergreen')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}

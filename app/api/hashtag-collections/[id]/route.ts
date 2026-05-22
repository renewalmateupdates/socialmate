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

// PATCH — rename / update hashtags on an existing collection
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; hashtags?: string[] }
  const { name, hashtags } = body

  const updates: { name?: string; hashtags?: string[]; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }
  if (name !== undefined) updates.name = name.trim()
  if (hashtags !== undefined) {
    if (hashtags.length > 30) {
      return NextResponse.json({ error: 'Maximum 30 hashtags per collection' }, { status: 400 })
    }
    updates.hashtags = hashtags
  }

  const { data, error } = await supabase
    .from('hashtag_collections')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, name, hashtags, workspace_id, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ collection: data })
}

// DELETE — remove a hashtag collection
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('hashtag_collections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

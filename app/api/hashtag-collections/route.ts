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

// GET — fetch all hashtag collections for the current user
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('hashtag_collections')
    .select('id, name, hashtags, workspace_id, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ collections: data ?? [] })
}

// POST — create a new hashtag collection
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; hashtags?: string[]; workspace_id?: string }
  const { name, hashtags, workspace_id } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
  }
  if (!hashtags || hashtags.length === 0) {
    return NextResponse.json({ error: 'At least one hashtag is required' }, { status: 400 })
  }
  if (hashtags.length > 30) {
    return NextResponse.json({ error: 'Maximum 30 hashtags per collection' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('hashtag_collections')
    .insert({
      user_id: user.id,
      workspace_id: workspace_id ?? null,
      name: name.trim(),
      hashtags,
    })
    .select('id, name, hashtags, workspace_id, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ collection: data })
}

// PATCH — update name or hashtags on an existing collection
export async function PATCH(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { id?: string; name?: string; hashtags?: string[] }
  const { id, name, hashtags } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

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

  const { error } = await supabase
    .from('hashtag_collections')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE — remove a hashtag collection
export async function DELETE(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { id?: string }
  const { id } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('hashtag_collections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

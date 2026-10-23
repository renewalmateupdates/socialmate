export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // Verify ownership
  const { data: post, error: lookupError } = await getSupabaseAdmin()
    .from('posts')
    .select('id, user_id, status')
    .eq('id', id)
    .maybeSingle()

  if (lookupError) {
    console.error('[posts/patch] lookup failed:', lookupError.message)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
  if (!post || post.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json() as { scheduled_at?: string }

  const updates: Record<string, string> = {}
  if (body.scheduled_at) {
    // Validate it's a parseable ISO date
    const d = new Date(body.scheduled_at)
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled_at' }, { status: 400 })
    }
    updates.scheduled_at = body.scheduled_at
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: updated, error } = await getSupabaseAdmin()
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select('id, scheduled_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // The post's existing wake-up still carries the old time. Queue one for the
  // new time: if it moved earlier, this one fires on time; if it moved later,
  // the old one wakes first, finds it not due, and stands down (see
  // lib/publish/due.ts). Whichever wakes at the right time publishes once,
  // because the publish route claims the post atomically.
  if (updates.scheduled_at && post.status === 'scheduled') {
    await inngest.send({
      name: 'post/scheduled',
      data: { postId: id, scheduledAt: updates.scheduled_at },
    }).catch(err => console.error('[posts/patch] inngest.send failed:', err))
  }

  return NextResponse.json(updated)
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find all posts stuck in scheduled state past their scheduled_at
  const now = new Date().toISOString()
  const { data: stuckPosts, error } = await getSupabaseAdmin()
    .from('posts')
    .select('id, content, platforms, scheduled_at, user_id')
    .eq('status', 'scheduled')
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!stuckPosts || stuckPosts.length === 0) {
    return NextResponse.json({ message: 'No stuck posts found', rescued: 0 })
  }

  const results: { postId: string; status: string; error?: string }[] = []

  for (const post of stuckPosts) {
    try {
      const res = await fetch(`${APP_URL}/api/posts/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      const data = await res.json()
      results.push({ postId: post.id, status: res.ok ? 'published' : 'failed', error: data.error })
    } catch (err) {
      results.push({ postId: post.id, status: 'error', error: String(err) })
    }
  }

  const succeeded = results.filter(r => r.status === 'published').length
  const failed = results.filter(r => r.status !== 'published').length

  return NextResponse.json({
    total: stuckPosts.length,
    rescued: succeeded,
    failed,
    results,
  })
}

// GET — just show how many are stuck (safe to call any time)
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  const { count, data } = await getSupabaseAdmin()
    .from('posts')
    .select('id, scheduled_at, platforms, user_id', { count: 'exact' })
    .eq('status', 'scheduled')
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  return NextResponse.json({ stuck: count ?? 0, posts: data })
}

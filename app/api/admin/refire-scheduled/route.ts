export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

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

  const now = new Date().toISOString()

  // All scheduled posts that haven't fired yet (scheduled_at in the future)
  const { data: futurePosts, error } = await getSupabaseAdmin()
    .from('posts')
    .select('id, scheduled_at')
    .eq('status', 'scheduled')
    .gt('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!futurePosts || futurePosts.length === 0) {
    return NextResponse.json({ fired: 0, message: 'No future scheduled posts found' })
  }

  let fired = 0
  let failed = 0

  for (const post of futurePosts) {
    try {
      await inngest.send({ name: 'post/scheduled', data: { postId: post.id, scheduledAt: post.scheduled_at } })
      fired++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ fired, failed, total: futurePosts.length })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

// Auth: either Vercel cron secret OR the internal deploy token
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  if (auth === `Bearer ${process.env.INTERNAL_CRON_TOKEN}`) return true
  return false
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { data: duePosts, error } = await getSupabaseAdmin()
    .from('posts')
    .select('id, scheduled_at')
    .eq('status', 'scheduled')
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ published: 0, message: 'No posts due' })
  }

  let published = 0
  let failed = 0

  for (const post of duePosts) {
    try {
      const res = await fetch(`${APP_URL}/api/posts/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, fromInngest: true }),
      })
      if (res.ok) {
        published++
      } else {
        await getSupabaseAdmin()
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', post.id)
          .eq('status', 'scheduled')
        failed++
      }
    } catch {
      await getSupabaseAdmin()
        .from('posts')
        .update({ status: 'failed' })
        .eq('id', post.id)
        .eq('status', 'scheduled')
      failed++
    }
  }

  console.log(`[cron/publish-scheduled] ${now} — published: ${published}, failed: ${failed}, total: ${duePosts.length}`)
  return NextResponse.json({ published, failed, total: duePosts.length, ran_at: now })
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET ?session_id=xxx&post_id=xxx
// Verifies a one-time unlock and returns the post content if valid
export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const postId    = req.nextUrl.searchParams.get('post_id')

  if (!sessionId || !postId) {
    return NextResponse.json({ hasAccess: false })
  }

  const supabase = getSupabaseAdmin()

  // Verify paid unlock record
  const { data: unlock } = await supabase
    .from('creator_post_unlocks')
    .select('id, status, post_id')
    .eq('stripe_session_id', sessionId)
    .eq('post_id', postId)
    .eq('status', 'paid')
    .maybeSingle()

  if (!unlock) return NextResponse.json({ hasAccess: false })

  // Return the post content
  const { data: post } = await supabase
    .from('creator_paywalled_posts')
    .select('id, title, preview, content, created_at')
    .eq('id', postId)
    .eq('is_active', true)
    .single()

  if (!post) return NextResponse.json({ hasAccess: false })

  return NextResponse.json({ hasAccess: true, post })
}

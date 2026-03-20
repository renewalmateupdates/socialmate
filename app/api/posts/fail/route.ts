export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'


export async function POST(request: NextRequest) {
  const { postId } = await request.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  await getSupabaseAdmin()
    .from('posts')
    .update({ status: 'failed' })
    .eq('id', postId)
    .eq('status', 'scheduled')

  return NextResponse.json({ success: true })
}
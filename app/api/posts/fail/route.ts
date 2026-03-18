import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { postId } = await request.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  await supabaseAdmin
    .from('posts')
    .update({ status: 'failed' })
    .eq('id', postId)
    .eq('status', 'scheduled')

  return NextResponse.json({ success: true })
}
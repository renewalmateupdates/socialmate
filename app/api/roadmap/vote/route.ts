export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const VALID_KEYS = new Set([
  'chrome_extension', 'instagram', 'facebook', 'linkedin_scheduling',
  'youtube_scheduling', 'pinterest', 'reddit_scheduling', 'threads',
  'zapier_integration', 'post_score', 'dnd_scheduling', 'loyalty_badges',
  'public_api', 'mobile_ios', 'comment_autoresponder', 'hashtag_collections',
  'bulk_import_csv', 'ai_image_generation', 'video_captioning', 'rss_to_post',
])

async function getUser(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const user = await getUser(cookieStore)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { feature_key } = await request.json()
  if (!VALID_KEYS.has(feature_key)) {
    return NextResponse.json({ error: 'Invalid feature key' }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin()
    .from('roadmap_votes')
    .upsert({ user_id: user.id, feature_key }, { onConflict: 'user_id,feature_key', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, voted: true })
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  const user = await getUser(cookieStore)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { feature_key } = await request.json()

  await getSupabaseAdmin()
    .from('roadmap_votes')
    .delete()
    .eq('user_id', user.id)
    .eq('feature_key', feature_key)

  return NextResponse.json({ success: true, voted: false })
}

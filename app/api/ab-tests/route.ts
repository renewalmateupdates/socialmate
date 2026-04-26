export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all posts that belong to an A/B test for this user
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content, platforms, status, scheduled_at, published_at, ab_test_id, ab_variant, bluesky_stats, created_at')
    .eq('user_id', user.id)
    .not('ab_test_id', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by ab_test_id into pairs
  const testMap = new Map<string, { a: any | null; b: any | null; created_at: string }>()

  ;(posts || []).forEach((post: any) => {
    const tid = post.ab_test_id as string
    if (!testMap.has(tid)) {
      testMap.set(tid, { a: null, b: null, created_at: post.created_at })
    }
    const entry = testMap.get(tid)!
    if (post.ab_variant === 'a') {
      entry.a = post
      // Use the earliest created_at (variant A is always first)
      if (post.created_at < entry.created_at) entry.created_at = post.created_at
    } else if (post.ab_variant === 'b') {
      entry.b = post
    }
  })

  // Convert map to sorted array (newest first)
  const tests = Array.from(testMap.entries()).map(([id, entry]) => ({
    id,
    created_at: entry.created_at,
    a: entry.a,
    b: entry.b,
  }))

  tests.sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())

  return NextResponse.json({ tests })
}

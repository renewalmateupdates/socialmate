import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { postLimitFor, postsUsedThisMonth, upgradeCopyFor } from '@/lib/post-limits'

// GET /api/posts/usage — how much of this month's post quota is spent.
//
// Exists so compose can show the boundary BEFORE someone hits it. Until now the
// first a free user heard about the 100/month cap was a red error toast at the
// moment they tried to post, which is a bad way to learn your plan has a limit.
//
// One HEAD count per compose load. No external API, no credits, no writes.
export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* read-only route */ },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  // Not signed in isn't an error here — the caller just shows nothing.
  if (!user) return NextResponse.json({ used: 0, limit: 0, plan: null, remaining: 0 })

  const { data: settings } = await supabase
    .from('user_settings')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan  = settings?.plan || 'free'
  const limit = postLimitFor(plan)
  const used  = await postsUsedThisMonth(supabase, user.id)

  return NextResponse.json({
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    upgrade:     upgradeCopyFor(plan),
    upgradeHref: '/pricing',
  })
}

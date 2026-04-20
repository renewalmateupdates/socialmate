export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { publishToAll } from '@/lib/publish'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

// POST — re-try only the platforms that failed on partial posts
// Useful when a platform (e.g. X) failed due to a bug/quota issue and needs re-publishing
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

  // Optional: limit to posts after a certain date (default: today)
  const { since } = await req.json().catch(() => ({})) as { since?: string }
  const sinceDate = since ? new Date(since) : new Date()
  if (!since) { sinceDate.setDate(1); sinceDate.setHours(0, 0, 0, 0) }

  const { data: partialPosts, error } = await getSupabaseAdmin()
    .from('posts')
    .select('id, user_id, content, platforms, destinations, workspace_id, platform_post_ids, scheduled_at')
    .eq('status', 'partial')
    .gte('scheduled_at', sinceDate.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!partialPosts || partialPosts.length === 0) {
    return NextResponse.json({ message: 'No partial posts found', retried: 0 })
  }

  const results: { postId: string; retriedPlatforms: string[]; status: string; errors?: Record<string, string> }[] = []

  for (const post of partialPosts) {
    const succeededPlatforms = Object.keys(post.platform_post_ids ?? {})
    const failedPlatforms = (post.platforms ?? []).filter((p: string) => !succeededPlatforms.includes(p))

    if (failedPlatforms.length === 0) {
      // All platforms succeeded — fix the status
      await getSupabaseAdmin().from('posts').update({ status: 'published' }).eq('id', post.id)
      results.push({ postId: post.id, retriedPlatforms: [], status: 'status-corrected-to-published' })
      continue
    }

    // Resolve workspace: personal workspaces have workspace_id = null in connected_accounts
    let accountWorkspaceId: string | null = null
    if (post.workspace_id) {
      const { data: wsInfo } = await getSupabaseAdmin()
        .from('workspaces').select('is_personal').eq('id', post.workspace_id).maybeSingle()
      accountWorkspaceId = wsInfo?.is_personal ? null : post.workspace_id
    }

    const publishResults = await publishToAll(
      post.user_id,
      failedPlatforms,
      post.content,
      post.destinations || {},
      accountWorkspaceId,
      {}
    )

    const newSuccesses: Record<string, string> = {}
    const errors: Record<string, string> = {}
    publishResults.forEach(r => {
      if (r.success && r.postId) newSuccesses[r.platform] = r.postId
      else errors[r.platform] = r.error || 'unknown error'
    })

    // Merge new successes into platform_post_ids
    const mergedIds = { ...(post.platform_post_ids ?? {}), ...newSuccesses }
    const allNowSucceeded = post.platforms.every((p: string) => mergedIds[p])
    const newStatus = allNowSucceeded ? 'published' : 'partial'

    await getSupabaseAdmin()
      .from('posts')
      .update({
        platform_post_ids: mergedIds,
        status: newStatus,
        ...(allNowSucceeded ? { published_at: new Date().toISOString() } : {}),
      })
      .eq('id', post.id)

    results.push({
      postId: post.id,
      retriedPlatforms: failedPlatforms,
      status: newStatus,
      ...(Object.keys(errors).length > 0 ? { errors } : {}),
    })
  }

  const fullyPublished = results.filter(r => r.status === 'published' || r.status === 'status-corrected-to-published').length
  const stillPartial   = results.filter(r => r.status === 'partial').length

  return NextResponse.json({
    total: partialPosts.length,
    fully_published: fullyPublished,
    still_partial: stillPartial,
    results,
  })
}

// GET — show how many partial posts exist this month
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

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count, data } = await getSupabaseAdmin()
    .from('posts')
    .select('id, scheduled_at, platforms, platform_post_ids, user_id', { count: 'exact' })
    .eq('status', 'partial')
    .gte('scheduled_at', monthStart.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50)

  const summary = (data ?? []).map(p => ({
    id: p.id,
    scheduled_at: p.scheduled_at,
    succeeded: Object.keys(p.platform_post_ids ?? {}).join(', ') || 'none',
    failed: (p.platforms ?? []).filter((pl: string) => !p.platform_post_ids?.[pl]).join(', ') || 'none',
  }))

  return NextResponse.json({ partial_count: count ?? 0, posts: summary })
}

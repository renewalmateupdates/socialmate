export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspace_id')
    if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

    const admin = getSupabaseAdmin()

    // Fetch competitor accounts for this workspace
    const { data: competitors } = await admin
      .from('competitor_accounts')
      .select('id, username, platform, last_checked_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch recent competitor posts (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: competitorPosts } = await admin
      .from('competitor_posts')
      .select('id, competitor_id, content, platform, posted_at, engagement_score')
      .in('competitor_id', (competitors ?? []).map(c => c.id))
      .gte('posted_at', since)
      .order('engagement_score', { ascending: false })
      .limit(50)

    // Your own posting stats (last 30 days)
    const { data: myPosts } = await admin
      .from('posts')
      .select('id, platforms, status, scheduled_at, published_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'published')
      .gte('published_at', since)
      .order('published_at', { ascending: false })
      .limit(100)

    // Build posting frequency map per competitor
    const competitorFrequency: Record<string, { username: string; platform: string; post_count: number; avg_engagement: number }> = {}
    for (const c of competitors ?? []) {
      const posts = (competitorPosts ?? []).filter(p => p.competitor_id === c.id)
      const totalEngagement = posts.reduce((sum, p) => sum + (p.engagement_score ?? 0), 0)
      competitorFrequency[c.id] = {
        username:       c.username,
        platform:       c.platform,
        post_count:     posts.length,
        avg_engagement: posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0,
      }
    }

    // Top performing competitor posts
    const topPosts = (competitorPosts ?? [])
      .sort((a, b) => (b.engagement_score ?? 0) - (a.engagement_score ?? 0))
      .slice(0, 5)
      .map(p => {
        const comp = (competitors ?? []).find(c => c.id === p.competitor_id)
        return {
          username:   comp?.username ?? 'unknown',
          platform:   p.platform,
          content:    p.content?.slice(0, 200) ?? '',
          posted_at:  p.posted_at,
          engagement: p.engagement_score ?? 0,
        }
      })

    // Your platform breakdown
    const platformCounts: Record<string, number> = {}
    for (const post of myPosts ?? []) {
      for (const platform of (post.platforms ?? [])) {
        platformCounts[platform] = (platformCounts[platform] ?? 0) + 1
      }
    }

    // Posting cadence: posts per week (last 4 weeks)
    const weeksAgo = (n: number) => new Date(Date.now() - n * 7 * 24 * 60 * 60 * 1000).toISOString()
    const weekBuckets = [
      { label: 'This week',   from: weeksAgo(1), to: new Date().toISOString() },
      { label: '2 weeks ago', from: weeksAgo(2), to: weeksAgo(1) },
      { label: '3 weeks ago', from: weeksAgo(3), to: weeksAgo(2) },
      { label: '4 weeks ago', from: weeksAgo(4), to: weeksAgo(3) },
    ]
    const cadence = weekBuckets.map(w => ({
      label: w.label,
      count: (myPosts ?? []).filter(p => p.published_at >= w.from && p.published_at < w.to).length,
    }))

    // Insight: are competitors posting more or less than you?
    const totalCompetitorPosts = (competitorPosts ?? []).length
    const myPostCount          = (myPosts ?? []).length
    const competitorCount      = (competitors ?? []).length
    const avgCompetitorPosts   = competitorCount > 0 ? Math.round(totalCompetitorPosts / competitorCount) : 0

    const insights: string[] = []
    if (myPostCount === 0) {
      insights.push("You haven't published anything in the last 30 days — your competitors are pulling ahead.")
    } else if (avgCompetitorPosts > myPostCount * 1.5) {
      insights.push(`Your competitors average ${avgCompetitorPosts} posts/month. You published ${myPostCount}. Close the gap.`)
    } else if (myPostCount > avgCompetitorPosts) {
      insights.push(`You're out-publishing competitors (${myPostCount} vs their avg ${avgCompetitorPosts}). Focus on quality + consistency.`)
    } else {
      insights.push(`You and your competitors are posting at a similar pace — differentiate with better content angles.`)
    }

    if (competitorCount === 0) {
      insights.push('No competitors tracked yet. Add some in Competitor Tracking to unlock deeper intel.')
    }

    return NextResponse.json({
      competitors:           competitors ?? [],
      competitor_frequency:  competitorFrequency,
      top_posts:             topPosts,
      my_post_count:         myPostCount,
      platform_breakdown:    platformCounts,
      cadence,
      insights,
      period_days:           30,
    })
  } catch (err) {
    console.error('[agents/growth-scout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

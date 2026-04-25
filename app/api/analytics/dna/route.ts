export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlueskyStats {
  likes?: number
  reposts?: number
  replies?: number
}

interface MastodonStats {
  favourites_count?: number
  reblogs_count?: number
  replies_count?: number
}

interface RawPost {
  id: string
  content: string
  platforms: string[]
  published_at: string
  bluesky_stats: BlueskyStats | null
  mastodon_stats: MastodonStats | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function engagementScore(post: RawPost): number {
  let score = 0
  if (post.bluesky_stats) {
    score += (post.bluesky_stats.likes ?? 0)
           + (post.bluesky_stats.reposts ?? 0)
           + (post.bluesky_stats.replies ?? 0)
  }
  if (post.mastodon_stats) {
    score += (post.mastodon_stats.favourites_count ?? 0)
           + (post.mastodon_stats.reblogs_count ?? 0)
           + (post.mastodon_stats.replies_count ?? 0)
  }
  return score
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function detectFormat(content: string): string {
  const trimmed = content.trim()
  // Check for emoji at start (any non-ASCII high codepoint sequence)
  if (/^\p{Emoji}/u.test(trimmed)) return 'emoji'
  if (/^\d+[.)]/u.test(trimmed)) return 'numbered'
  if (trimmed.startsWith('"') || trimmed.startsWith('\u201C')) return 'quote'
  if (trimmed.endsWith('?') || trimmed.includes('?')) return 'question'
  return 'statement'
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function timeOfDay(hour: number): string {
  if (hour >= 6 && hour <= 11) return 'morning'
  if (hour >= 12 && hour <= 16) return 'afternoon'
  if (hour >= 17 && hour <= 22) return 'evening'
  return 'off-hours'
}

function lengthBucket(content: string): string {
  const len = content.length
  if (len < 100) return 'short (<100)'
  if (len <= 200) return 'medium (100–200)'
  return 'long (200+)'
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
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

    const admin = getSupabaseAdmin()

    // Fetch all published posts for this user
    const { data: allPosts, error } = await admin
      .from('posts')
      .select('id, content, platforms, published_at, bluesky_stats, mastodon_stats')
      .eq('user_id', user.id)
      .in('status', ['published', 'partial'])
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    const posts: RawPost[] = (allPosts ?? []) as RawPost[]

    // Only work with posts that have at least one platform's engagement synced
    const postsWithData = posts.filter(p => p.bluesky_stats !== null || p.mastodon_stats !== null)
    const N = postsWithData.length

    if (N < 10) {
      return NextResponse.json({
        posts_with_data: N,
        total_posts: posts.length,
        insufficient_data: true,
      })
    }

    // ── 1. Best day of week ──────────────────────────────────────────────────
    const byDay: Record<number, number[]> = {}
    for (const p of postsWithData) {
      const day = new Date(p.published_at).getDay()
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(engagementScore(p))
    }
    const best_day = Array.from({ length: 7 }, (_, i) => ({
      day: DAY_LABELS[i],
      avg_engagement: parseFloat(avg(byDay[i] ?? []).toFixed(2)),
      post_count: (byDay[i] ?? []).length,
    })).filter(d => d.post_count > 0)

    const bestDayEntry = best_day.reduce((a, b) => a.avg_engagement >= b.avg_engagement ? a : b)

    // ── 2. Best time of day ──────────────────────────────────────────────────
    const byTime: Record<string, number[]> = {}
    for (const p of postsWithData) {
      const hour = new Date(p.published_at).getHours()
      const bucket = timeOfDay(hour)
      if (!byTime[bucket]) byTime[bucket] = []
      byTime[bucket].push(engagementScore(p))
    }
    const best_time = Object.entries(byTime).map(([label, scores]) => ({
      label,
      avg_engagement: parseFloat(avg(scores).toFixed(2)),
      post_count: scores.length,
    }))

    const bestTimeEntry = best_time.reduce((a, b) => a.avg_engagement >= b.avg_engagement ? a : b)

    // ── 3. Best post length ──────────────────────────────────────────────────
    const byLength: Record<string, number[]> = {}
    for (const p of postsWithData) {
      const bucket = lengthBucket(p.content ?? '')
      if (!byLength[bucket]) byLength[bucket] = []
      byLength[bucket].push(engagementScore(p))
    }
    const best_length = Object.entries(byLength).map(([label, scores]) => ({
      label,
      avg_engagement: parseFloat(avg(scores).toFixed(2)),
      post_count: scores.length,
    }))

    const bestLengthEntry = best_length.reduce((a, b) => a.avg_engagement >= b.avg_engagement ? a : b)

    // ── 4. Top 5 posts ───────────────────────────────────────────────────────
    const scored = postsWithData.map(p => ({
      id:             p.id,
      content:        (p.content ?? '').slice(0, 280),
      platforms:      p.platforms,
      published_at:   p.published_at,
      engagement:     engagementScore(p),
      bluesky_stats:  p.bluesky_stats,
      mastodon_stats: p.mastodon_stats,
    }))
    scored.sort((a, b) => b.engagement - a.engagement)
    const top_posts = scored.slice(0, 5)

    // ── 5. Format patterns ───────────────────────────────────────────────────
    const byFormat: Record<string, number[]> = {}
    for (const p of postsWithData) {
      const fmt = detectFormat(p.content ?? '')
      if (!byFormat[fmt]) byFormat[fmt] = []
      byFormat[fmt].push(engagementScore(p))
    }
    const format_patterns = Object.entries(byFormat).map(([label, scores]) => ({
      label,
      avg_engagement: parseFloat(avg(scores).toFixed(2)),
      post_count: scores.length,
    })).sort((a, b) => b.avg_engagement - a.avg_engagement)

    const bestFormatEntry = format_patterns[0] ?? null

    // ── 6. Platform breakdown ────────────────────────────────────────────────
    const bskyPosts    = postsWithData.filter(p => p.bluesky_stats !== null)
    const mastodonPosts = postsWithData.filter(p => p.mastodon_stats !== null)

    const platform_breakdown = [
      {
        platform:       'bluesky',
        avg_engagement: parseFloat(avg(bskyPosts.map(p => {
          const s = p.bluesky_stats!
          return (s.likes ?? 0) + (s.reposts ?? 0) + (s.replies ?? 0)
        })).toFixed(2)),
        post_count: bskyPosts.length,
      },
      {
        platform:       'mastodon',
        avg_engagement: parseFloat(avg(mastodonPosts.map(p => {
          const s = p.mastodon_stats!
          return (s.favourites_count ?? 0) + (s.reblogs_count ?? 0) + (s.replies_count ?? 0)
        })).toFixed(2)),
        post_count: mastodonPosts.length,
      },
    ].filter(pb => pb.post_count > 0)
      .sort((a, b) => b.avg_engagement - a.avg_engagement)

    return NextResponse.json({
      posts_with_data:  N,
      total_posts:      posts.length,
      insufficient_data: false,
      best_day:         { winner: bestDayEntry.day, data: best_day },
      best_time:        { winner: bestTimeEntry.label, data: best_time },
      best_length:      { winner: bestLengthEntry.label, data: best_length },
      top_posts,
      format_patterns:  { winner: bestFormatEntry?.label ?? null, data: format_patterns },
      platform_breakdown,
    })
  } catch (err) {
    console.error('[DNA GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { POSTS } from '@/lib/blog/static-posts'
import { describePost } from '@/lib/blog/describe'
import { buildFeed, prepareItems, type FeedItem } from '@/lib/blog/feed'

// Rebuilt at most once a day, like the blog index.
export const revalidate = 86400

async function dbItems(): Promise<FeedItem[]> {
  // The newest 100 rows are plenty for a 50-item feed.
  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('slug, title, excerpt, category, published_at, content')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(100)
  if (error) {
    console.warn('[blog feed] blog_posts query failed:', error.message)
    return []
  }
  return (data ?? []).map(row => ({
    slug: row.slug as string,
    title: row.title as string,
    description: describePost(row as { excerpt?: string | null; content?: string | null }),
    category: (row.category as string | null) ?? null,
    date: new Date(row.published_at as string),
  }))
}

export async function GET() {
  const staticItems: FeedItem[] = Object.entries(POSTS).map(([slug, p]) => ({
    slug,
    title: p.title,
    description: describePost(p),
    category: p.category,
    date: new Date(p.date),
  }))
  // A post in code wins over a database row with the same slug, as on the blog itself.
  const db = (await dbItems()).filter(i => !(i.slug in POSTS))
  const xml = buildFeed(prepareItems([...staticItems, ...db]))
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

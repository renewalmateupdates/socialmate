import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { POSTS } from '@/lib/blog/static-posts'

export interface RecentPost { slug: string; title: string; date: number }

/**
 * The newest published posts, from code and the blog_posts table, newest
 * first. A post in code wins over a row with the same slug, as on the blog.
 * A failed lookup logs and returns the static posts, never throws.
 */
export async function recentPosts(limit: number): Promise<RecentPost[]> {
  const out: RecentPost[] = Object.entries(POSTS).map(([slug, p]) => ({ slug, title: p.title, date: Date.parse(p.date) || 0 }))
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('blog_posts')
      .select('slug, title, published_at')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit + 20)
    if (error) console.warn('[blog recent] blog_posts query failed:', error.message)
    for (const row of data ?? []) {
      if (row.slug in POSTS) continue
      out.push({ slug: row.slug as string, title: row.title as string, date: Date.parse(row.published_at as string) || 0 })
    }
  } catch (err) {
    console.warn('[blog recent] blog_posts query threw:', err)
  }
  return out.sort((a, b) => b.date - a.date).slice(0, limit)
}

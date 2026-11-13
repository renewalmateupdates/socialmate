import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { oldestFirst, selectAll } from '@/lib/admin-metrics'
import { isProtectedPath } from '@/lib/protected-paths'
import { POSTS } from '@/lib/blog/static-posts'
import { AUDIENCES } from '@/lib/audiences'
import { BRAND } from '@/lib/site-facts'
import manifest from '@/lib/generated/public-routes.json'

// Three sources, none of them typed by hand:
//
//  1. lib/generated/public-routes.json: every public page with its own
//     page.tsx, and the date its file last changed in git. Written by
//     scripts/gen-route-manifest.mjs; `npm run verify:content` fails when a
//     page was added or removed without regenerating it.
//  2. lib/audiences.ts: the /for pages served by app/for/[slug].
//  3. Blog posts: the static POSTS map plus the `blog_posts` table, the same
//     merge generateStaticParams does, each with its own date.
//
// This file used to keep its own list of 100 comparison pages and 60 core
// pages, stamped every URL with today's date, and before that listed 38 blog
// slugs that had no post. Sign-in pages and locale copies are left out by the
// generator (their canonical is elsewhere), so nothing here redirects.
//
// Regenerated daily, so posts inserted with SQL appear without a deploy and a
// failed table lookup at build time heals within a day.
export const revalidate = 86400

type Entry = MetadataRoute.Sitemap[number]

/** How much a page matters to a crawler, from where it sits. */
function weigh(path: string): Pick<Entry, 'changeFrequency' | 'priority'> {
  if (path === '/') return { changeFrequency: 'weekly', priority: 1 }
  if (path === '/pricing' || path === '/features') return { changeFrequency: 'weekly', priority: 0.9 }
  if (path === '/blog' || path === '/vs' || path === '/for' || path === '/guides' || path === '/tools') {
    return { changeFrequency: 'weekly', priority: 0.8 }
  }
  if (path === '/privacy' || path === '/terms') return { changeFrequency: 'yearly', priority: 0.3 }
  if (path.startsWith('/guides/')) return { changeFrequency: 'monthly', priority: 0.8 }
  if (path.startsWith('/for/') || path.startsWith('/tools/')) return { changeFrequency: 'monthly', priority: 0.8 }
  if (path.startsWith('/vs/')) return { changeFrequency: 'monthly', priority: 0.7 }
  return { changeFrequency: 'monthly', priority: 0.7 }
}

/** A date we can stand behind, or none: a wrong lastmod teaches crawlers to ignore it. */
function validDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  return Number.isNaN(time) ? undefined : new Date(time)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BRAND.url

  const pages: MetadataRoute.Sitemap = manifest.routes.map(route => ({
    url: route.path === '/' ? base : `${base}${route.path}`,
    lastModified: validDate(route.lastModified),
    ...weigh(route.path),
  }))

  // Audience pages served by app/for/[slug], straight from their data file.
  // They share one page file, so they carry that file's date via the hub.
  const hubDate = validDate(manifest.routes.find(r => r.path === '/for')?.lastModified)
  const audiencePages: MetadataRoute.Sitemap = AUDIENCES.map(a => ({
    url: `${base}/for/${a.slug}`,
    lastModified: hubDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Database posts carry their own dates. A failure here degrades to the
  // static posts for a day (see revalidate above) rather than an empty sitemap.
  const dbDates = new Map<string, Date | undefined>()
  try {
    // Every row: one request stops at 1,000 rows whatever .limit() says, so
    // an unpaged read would quietly drop posts from the sitemap past that.
    const db = getSupabaseAdmin()
    const rows = await selectAll<{ slug: string; published_at: string | null; updated_at: string | null }>(
      'blog_posts',
      () => oldestFirst(db.from('blog_posts').select('slug, published_at, updated_at')),
    )
    for (const row of rows) dbDates.set(row.slug, validDate(row.updated_at) ?? validDate(row.published_at))
  } catch (err) {
    console.warn('[sitemap] blog_posts lookup threw:', err)
  }

  const blogPosts: MetadataRoute.Sitemap = Array.from(
    new Set([...Object.keys(POSTS), ...Array.from(dbDates.keys())]),
  ).map(slug => ({
    url: `${base}/blog/${slug}`,
    // The copy in code wins when a slug is in both, as it does on the page itself.
    lastModified: POSTS[slug] ? validDate(POSTS[slug].date) : dbDates.get(slug),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Final guard: no duplicate <loc>, and nothing that answers with a login redirect.
  const seen = new Set<string>()
  return [...pages, ...audiencePages, ...blogPosts].filter(entry => {
    if (isProtectedPath(new URL(entry.url).pathname)) return false
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}

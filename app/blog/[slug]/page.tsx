import type { Metadata } from 'next'
import Link from 'next/link'
import BlogInlineCTA from '@/components/BlogInlineCTA'
import BlogToolCard from '@/components/BlogToolCard'
import { relatedToolFor } from '@/lib/tools/related-tool'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import PublicFooter from '@/components/PublicFooter'
import { CalendarDays, Clock, Heart, PenLine } from 'lucide-react'
import { notFound } from 'next/navigation'
import { POSTS } from '@/lib/blog/static-posts'

// Revalidate every 24h — blog posts rarely change; shorter TTL caused hourly ISR cache misses
// that hit the origin server, causing 3s+ FCP for international visitors on each cache expiry.
export const revalidate = 86400

// ── DB post shape ─────────────────────────────────────────────────────────────
type DbPost = {
  slug: string
  title: string
  excerpt: string | null
  content: string
  category: string
  author: string
  published_at: string
}

function dbPostToPost(db: DbPost) {
  const wordCount  = db.content.trim().split(/\s+/).length
  const readMins   = Math.max(1, Math.round(wordCount / 200))
  const dateStr    = new Date(db.published_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  return {
    title:    db.title,
    category: db.category || 'Studio Stax',
    date:     dateStr,
    readTime: `${readMins} min read`,
    excerpt:  db.excerpt || '',
    content:  db.content,
    author:   db.author,
  }
}

// `failed` separates "the lookup broke" from "there is no such post". Only the
// second may 404: a transient database error must not get a real post dropped
// from search, and ISR would cache that 404 for a day.
async function getDbPost(slug: string): Promise<{ post: ReturnType<typeof dbPostToPost> | null; failed: boolean }> {
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('blog_posts')
      .select('slug, title, excerpt, content, category, author, published_at')
      .eq('slug', slug)
      .maybeSingle()
    if (error) {
      console.warn(`[blog] post lookup failed for "${slug}":`, error.message)
      return { post: null, failed: true }
    }
    return { post: data ? dbPostToPost(data as DbPost) : null, failed: false }
  } catch (e) {
    console.warn(`[blog] post lookup threw for "${slug}":`, e)
    return { post: null, failed: true }
  }
}

// ── Related posts ─────────────────────────────────────────────────────────────
// The "More from the blog" rail used to call a getAllDbPosts() helper that
// selected `content` for 50 posts — 191 KB and ~490ms — and then discarded all
// of it. The rail was built from a list with the 62 hardcoded posts first, so
// its three slots were always full before a single DB row was reached. Every
// render paid half a second of TTFB, and the build paid it 674 times, to print
// the same three links on all 674 pages.
//
// `content` is only ever read to derive a read time. The table has a
// `reading_time_minutes` column, but it is NOT usable: nothing reads it, and it
// disagrees with the text on all 674 rows — it says 5 min for 548 of them while
// the median post is 297 words, about a 1 min read. Using it would have inflated
// every read time on the site ~3x. So: rank from a light query, then read
// `content` for the three posts actually shown. 191 KB -> ~30 KB, same numbers.
type RelatedRow = {
  slug: string
  title: string
  category: string | null
  published_at: string
}

type RelatedPost = {
  slug: string
  title: string
  date: string
  readTime: string
}

// Categories were typed by hand across 674 rows and drifted: Guides/guides/guide,
// studio-stax/Studio Stax, enki/Enki, comparison/comparisons. Match on a
// normalized form or same-category grouping silently misses most of its pool.
function normalizeCategory(c: string): string {
  return c.toLowerCase().replace(/[\s_-]+/g, '').replace(/s$/, '')
}

// Stable, dependency-free string hash. Only used to pick a rotation offset, so
// it needs to be deterministic across builds, not cryptographic.
function hashSlug(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0
  return h
}

function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

// Same category first, then newest. Deterministic, so a given post always links
// to the same three neighbors — and, unlike the old rail, a different three per
// post, which is 674 pages of real internal linking instead of 3.
async function getRelatedPosts(currentSlug: string, category: string): Promise<RelatedPost[]> {
  type Candidate = Omit<RelatedPost, 'readTime'> & {
    readTime: string | null
    category: string
    ts: number
  }
  const pool: Candidate[] = []

  for (const [slug, p] of Object.entries(POSTS)) {
    pool.push({
      slug,
      title:    p.title,
      date:     p.date,
      readTime: p.readTime,
      category: p.category,
      ts:       Date.parse(p.date) || 0,
    })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('blog_posts')
      .select('slug, title, category, published_at')
      .order('published_at', { ascending: false })
      .limit(100)
    if (error) {
      console.warn('[blog] related posts query failed:', error.message)
    } else {
      for (const row of (data ?? []) as RelatedRow[]) {
        if (POSTS[row.slug]) continue // hardcoded copy wins
        pool.push({
          slug:     row.slug,
          title:    row.title,
          date:     formatPostDate(row.published_at),
          readTime: null, // filled in below, for the three that get shown
          category: row.category || 'Studio Stax',
          ts:       Date.parse(row.published_at) || 0,
        })
      }
    }
  } catch (e) {
    console.warn('[blog] related posts query threw:', e)
  }

  const target    = normalizeCategory(category)
  const candidates = pool.filter(p => p.slug !== currentSlug)
  const byNewest   = (a: { ts: number }, b: { ts: number }) => b.ts - a.ts
  const sameCat    = candidates.filter(p => normalizeCategory(p.category) === target).sort(byNewest)
  const others     = candidates.filter(p => normalizeCategory(p.category) !== target).sort(byNewest)

  // Taking the top three would point every post in a category at the same three
  // neighbors. Starting at a slug-derived offset and wrapping instead spreads
  // the links across the whole category, so the posts form a ring rather than
  // funnelling into three hubs — the difference between 3 internally linked
  // pages and 674. Seeded by slug, so a given post's rail never shuffles.
  const seed = hashSlug(currentSlug)
  const picked: typeof candidates = []
  for (const list of [sameCat, others]) {
    if (list.length === 0) continue
    const start = seed % list.length
    for (let i = 0; i < list.length && picked.length < 3; i++) {
      picked.push(list[(start + i) % list.length])
    }
  }

  const top = picked.slice(0, 3)

  // Hardcoded posts already carry a read time; only DB ones need resolving, and
  // only the ones that survived the ranking — at most three rows of content.
  const needsReadTime = top.filter(p => p.readTime === null).map(p => p.slug)
  const readTimes = new Map<string, string>()
  if (needsReadTime.length > 0) {
    try {
      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from('blog_posts')
        .select('slug, content')
        .in('slug', needsReadTime)
      if (error) {
        console.warn('[blog] related read-time query failed:', error.message)
      } else {
        for (const row of (data ?? []) as Array<{ slug: string; content: string | null }>) {
          const words = (row.content || '').trim().split(/\s+/).length
          readTimes.set(row.slug, `${Math.max(1, Math.round(words / 200))} min read`)
        }
      }
    } catch (e) {
      console.warn('[blog] related read-time query threw:', e)
    }
  }

  return top.map(({ slug, title, date, readTime }) => ({
    slug,
    title,
    date,
    // A missing read time is not worth failing the rail over — drop the label.
    readTime: readTime ?? readTimes.get(slug) ?? '',
  }))
}

const CATEGORY_COLORS: Record<string, string> = {
  Strategy:    'bg-purple-950/40 text-purple-400',
  Industry:    'bg-blue-950/40 text-blue-400',
  Guide:       'bg-green-950/40 text-green-400',
  Guides:      'bg-green-950/40 text-green-400',
  Tips:        'bg-yellow-950/40 text-yellow-400',
  Analytics:   'bg-yellow-950/40 text-yellow-400',
  Resources:   'bg-blue-950/40 text-blue-400',
  Growth:      'bg-pink-950/40 text-pink-400',
  Comparisons: 'bg-orange-950/40 text-orange-400',
  'Our Story': 'bg-purple-950/40 text-purple-400',
  Features:    'bg-amber-950/40 text-amber-400',
  AI:          'bg-emerald-950/40 text-emerald-400',
  'Studio Stax': 'bg-amber-950/40 text-amber-400',
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const lookup = POSTS[slug] ? null : await getDbPost(slug)
  const post = POSTS[slug] ?? lookup?.post
  // No such post: 404 here, before app/blog/loading.tsx starts the stream. Once
  // streaming has begun the status is already 200 and the page can only add
  // noindex. If the lookup failed, the page shows a retry notice instead, and
  // that does not belong in search either.
  if (!post) {
    if (!lookup?.failed) notFound()
    return { title: 'SocialMate Blog', robots: { index: false, follow: true } }
  }
  return {
    title: `${post.title} — SocialMate Blog`,
    description: post.excerpt,
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      url:         `https://socialmate.studio/blog/${slug}`,
      images:      [{ url: '/og-image.png', width: 1270, height: 760, alt: post.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.excerpt,
      images:      ['/og-image.png'],
    },
    alternates: { canonical: `https://socialmate.studio/blog/${slug}` },
  }
}

// Internal link map: phrase → path (case-insensitive match, first occurrence per paragraph)
const INTERNAL_LINKS: [RegExp, string][] = [
  [/\bSocialMate\b/i, '/'],
  [/\bsocial media scheduler\b/i, '/'],
  [/\bcreator OS\b/i, '/'],
  [/\bBluesky\b/i, '/vs/buffer'],
  [/\bTwitch clips?\b/i, '/clips'],
  [/\bYouTube (clips?|videos?)\b/i, '/clips'],
  [/\bClips Studio\b/i, '/clips'],
  [/\baffiliate program\b/i, '/affiliate'],
  [/\baffiliate commission\b/i, '/affiliate'],
  [/\bStudio Stax\b/i, '/studio-stax'],
  [/\bwhite label\b/i, '/pricing'],
  [/\bbulk schedul/i, '/features'],
  [/\bevergreen recycl/i, '/features'],
  [/\bRSS import\b/i, '/features'],
  [/\blink in bio\b/i, '/features'],
  [/\bcompetitor tracking\b/i, '/features'],
  [/\bAI (tools?|features?|credits?)\b/i, '/features'],
  [/\bsocialmate\.studio\b/i, '/'],
]

function linkifyText(text: string): React.ReactNode {
  let remaining = text
  const parts: React.ReactNode[] = []
  let linkKey = 0
  const used = new Set<string>()

  while (remaining.length > 0) {
    let earliestIndex = -1
    let earliestMatch: RegExpExecArray | null = null
    let earliestPath = ''
    let earliestPattern: RegExp | null = null

    for (const [pattern, path] of INTERNAL_LINKS) {
      if (used.has(path)) continue
      const re = new RegExp(pattern.source, 'i')
      const m = re.exec(remaining)
      if (m && (earliestIndex === -1 || m.index < earliestIndex)) {
        earliestIndex = m.index
        earliestMatch = m
        earliestPath = path
        earliestPattern = pattern
      }
    }

    if (!earliestMatch || earliestPattern === null) {
      parts.push(remaining)
      break
    }

    if (earliestIndex > 0) parts.push(remaining.slice(0, earliestIndex))
    parts.push(
      <a key={linkKey++} href={earliestPath} className="text-amber-400 hover:underline font-medium">
        {earliestMatch[0]}
      </a>
    )
    used.add(earliestPath)
    remaining = remaining.slice(earliestIndex + earliestMatch[0].length)
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
}

function renderContent(content: string, slug?: string) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<div key={key++} className="h-2" />)
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-extrabold tracking-tight mt-8 mb-3 text-gray-100">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={key++} className="text-sm font-bold text-gray-100 mt-4 mb-1">
          {trimmed.slice(2, -2)}
        </p>
      )
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-sm text-gray-400 leading-relaxed ml-4 list-disc">
          {linkifyText(trimmed.slice(2))}
        </li>
      )
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-400 leading-relaxed">
          {linkifyText(trimmed)}
        </p>
      )
    }
  }
  // Drop the CTA roughly a third of the way in, snapped to the nearest
  // heading so it never lands mid-sentence. Below a certain length there is no
  // sensible midpoint, so short posts keep the footer CTA only.
  if (slug && elements.length > 24) {
    const target = Math.floor(elements.length / 3)
    let at = elements.length
    for (let i = target; i < elements.length; i++) {
      const el = elements[i] as { type?: unknown }
      if (el && typeof el === 'object' && el.type === 'h2') { at = i; break }
    }
    if (at < elements.length) {
      elements.splice(at, 0, <BlogInlineCTA key="inline-cta" slug={slug} />)
    }
  }

  return elements
}

// Pre-build all slugs (hardcoded + DB) at deploy time so every blog post is a static page.
// Falls back to hardcoded list only if the DB query fails (e.g. during local builds without env vars).
export async function generateStaticParams() {
  const hardcodedSlugs = Object.keys(POSTS)

  let dbSlugs: string[] = []
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('blog_posts').select('slug')
    if (!error && data) {
      dbSlugs = data.map((row: { slug: string }) => row.slug)
    }
  } catch {
    // If admin client fails (missing env vars in local dev), silently fall back to hardcoded list
  }

  const allSlugs = Array.from(new Set([...hardcodedSlugs, ...dbSlugs]))
  return allSlugs.map((slug) => ({ slug }))
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lookup = POSTS[slug] ? null : await getDbPost(slug)
  const post = POSTS[slug] ?? lookup?.post

  if (!post) {
    // No such post is a real 404. This used to render a "coming soon" page with a 200,
    // and 38 sitemap entries pointed at slugs nobody ever wrote: thin duplicate pages
    // to a search engine. What is left below only shows when the lookup itself failed.
    if (!lookup?.failed) notFound()
    return (
      <div className="dark min-h-screen bg-gray-950">
        <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-40">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-base tracking-tight text-gray-100">SocialMate</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block">Sign in</Link>
            <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              Get started free →
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <PenLine className="w-11 h-11 mx-auto mb-6 text-gray-400" strokeWidth={1.5} />
          <h1 className="text-3xl font-extrabold tracking-tight mb-4 dark:text-gray-100">We couldn&apos;t load this post</h1>
          <p className="text-gray-400 dark:text-gray-500 leading-relaxed mb-8">
            Something went wrong on our side. Please try again in a moment.
          </p>
          <Link href="/blog" className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const otherPosts = await getRelatedPosts(slug, post.category)
  const relatedTool = relatedToolFor({ slug, title: post.title })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    author: {
      '@type': 'Person',
      name: (post as { author?: string }).author || 'SocialMate Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SocialMate',
      url: 'https://socialmate.studio',
      logo: { '@type': 'ImageObject', url: 'https://socialmate.studio/icon.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://socialmate.studio/blog/${slug}`,
    },
  }

  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
          <span className="font-bold text-base tracking-tight text-gray-100">SocialMate</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link href="/features"    className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing"     className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/studio-stax" className="hover:text-white transition-colors">Studio Stax</Link>
          <Link href="/roadmap"     className="hover:text-white transition-colors">Roadmap</Link>
          <Link href="/blog"        className="font-bold text-white">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/give"   className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all hidden sm:inline-flex items-center gap-1"><Heart size={13} strokeWidth={2} fill="currentColor" /> Give</Link>
          <Link href="/login"  className="text-sm font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-gray-200 transition-colors">Blog</Link>
          <span>→</span>
          <span className={`font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-800 text-gray-400'}`}>
            {post.category}
          </span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4 text-gray-100">{post.title}</h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-800 pt-4">
            <span className="inline-flex items-center gap-1"><CalendarDays size={12} strokeWidth={2} /> {post.date}</span>
            <span className="inline-flex items-center gap-1"><Clock size={12} strokeWidth={2} /> {post.readTime}</span>
          </div>
        </div>

        <div className="space-y-2 mb-16">
          {renderContent(post.content, slug)}
        </div>

        {relatedTool && <BlogToolCard slug={slug} tool={relatedTool} />}

        <div className="bg-amber-500 text-gray-950 rounded-3xl p-8 text-center mb-16">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Try SocialMate free</h2>
          <p className="text-gray-950/70 text-sm mb-6 max-w-md mx-auto">
            Schedule to 7 platforms, get 15+ AI tools, and grow your audience — all for free. No credit card required.
          </p>
          <BlogInlineCTA slug={slug} position="footer" />
          <p className="text-gray-950/50 text-xs mt-3">7 platforms · 15+ AI tools · Free forever</p>
        </div>

        {/* ── Compare tools strip ── */}
        <div className="mb-12 p-6 border border-gray-800 rounded-2xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Comparing tools?</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'vs Hootsuite',    href: '/vs/hootsuite'    },
              { label: 'vs Buffer',       href: '/vs/buffer'       },
              { label: 'vs Later',        href: '/vs/later'        },
              { label: 'vs Sendible',     href: '/vs/sendible'     },
              { label: 'vs Metricool',    href: '/vs/metricool'    },
              { label: 'vs Publer',       href: '/vs/publer'       },
              { label: 'vs Planable',     href: '/vs/planable'     },
              { label: 'vs Sprout Social', href: '/vs/sprout-social' },
              { label: 'vs SocialPilot',  href: '/vs/socialpilot'  },
              { label: 'vs Loomly',       href: '/vs/loomly'         },
              { label: 'vs CoSchedule',   href: '/vs/coschedule'     },
              { label: 'vs MeetEdgar',    href: '/vs/meetedgar'      },
              { label: 'vs Iconosquare',  href: '/vs/iconosquare'    },
              { label: 'vs Tailwind',     href: '/vs/tailwind-social' },
              { label: 'vs Crowdfire',    href: '/vs/crowdfire'      },
              { label: 'vs Pallyy',       href: '/vs/pallyy'         },
              { label: 'vs Agorapulse',   href: '/vs/agorapulse'     },
              { label: 'vs Sprinklr',     href: '/vs/sprinklr'       },
              { label: 'vs SocialBee',    href: '/vs/socialbee'      },
              { label: 'vs ContentStudio', href: '/vs/contentstudio' },
              { label: 'vs Missinglettr', href: '/vs/missinglettr'   },
              { label: 'vs Post Planner', href: '/vs/postplanner'    },
              { label: 'vs RecurPost',    href: '/vs/recurpost'      },
              { label: 'vs Nuelink',      href: '/vs/nuelink'        },
              { label: 'vs Fedica',       href: '/vs/fedica'         },
              { label: 'vs Statusbrew',   href: '/vs/statusbrew'     },
            ].map(c => (
              <Link key={c.href} href={c.href}
                className="text-xs font-bold px-3 py-1.5 border border-gray-700 rounded-full hover:border-gray-400 text-gray-400 hover:text-white transition-all">
                {c.label}
              </Link>
            ))}
            <Link href="/vs"
              className="text-xs font-bold px-3 py-1.5 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-400 transition-all">
              See all comparisons →
            </Link>
          </div>
        </div>

        {otherPosts.length > 0 && (
          <div>
            <h2 className="text-lg font-extrabold tracking-tight mb-6 text-gray-100">More from the blog</h2>
            <div className="space-y-3">
              {otherPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="flex items-center gap-4 p-4 border border-gray-800 rounded-2xl hover:border-gray-600 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-gray-100 group-hover:text-gray-300 transition-colors">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[p.date, p.readTime].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-gray-600 group-hover:text-white transition-colors">→</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/blog" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                View all posts →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* SM-Give strip */}
      <div className="border-t border-gray-800 mt-16 pt-10 pb-4">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            ❤️ <span className="font-semibold text-gray-300">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
            <a href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Learn about SM-Give →</a>
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
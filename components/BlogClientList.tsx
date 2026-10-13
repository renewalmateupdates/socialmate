'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BarChart3, Bot, BookOpen, Briefcase, Building2, FileText, Heart,
  Lightbulb, Package, Scale, Search, Sparkles, Store, TrendingUp, Users,
  X as CloseIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type BlogPost = {
  slug:     string
  title:    string
  date:     string
  category: string
  excerpt:  string
  readTime: string
  featured: boolean
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Our Story':    Heart,
  'Guides':       BookOpen,
  'Tips':         Lightbulb,
  'Resources':    Package,
  'Growth':       TrendingUp,
  'Comparisons':  Scale,
  'Features':     Sparkles,
  'Analytics':    BarChart3,
  'AI':           Bot,
  'Industry':     Building2,
  'Teams':        Users,
  'Agencies':     Briefcase,
  'studio-stax':  Store,
  'Studio Stax':  Store,
  'SocialMate':   Sparkles,
  'SOMA':         Bot,
  'Enki':         TrendingUp,
  'RenewalMate':  Package,
  'Founder Story': Heart,
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = CATEGORY_ICONS[category] || FileText
  return <Icon className={className} strokeWidth={1.75} />
}

// Priority order for categories — any category not listed here appears alphabetically after
const CATEGORY_PRIORITY = [
  'Our Story',
  'Guides',
  'Tips',
  'Resources',
  'Growth',
  'Comparisons',
  'Features',
  'Analytics',
  'AI',
  'Industry',
  'Teams',
  'Agencies',
  'Studio Stax',
  'SocialMate',
  'SOMA',
  'Enki',
  'RenewalMate',
  'Founder Story',
]

export default function BlogClientList({ allPosts }: { allPosts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery]       = useState('')
  const [showAllCats, setShowAllCats]       = useState(false)

  const featured = allPosts.find(p => p.featured)

  /* ── derive category list dynamically from actual posts ── */
  const categoryOrder = useMemo(() => {
    const allCats = new Set(allPosts.map(p => p.category))
    const prioritized = CATEGORY_PRIORITY.filter(c => allCats.has(c))
    // Biggest first, so the filters worth clicking are the ones on screen.
    const size = (c: string) => allPosts.filter(p => p.category === c).length
    const remaining   = Array.from(allCats)
      .filter(c => !CATEGORY_PRIORITY.includes(c))
      .sort((a, b) => size(b) - size(a) || a.localeCompare(b))
    return ['All', ...prioritized, ...remaining]
  }, [allPosts])

  /* ── counts per category ── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allPosts.length }
    for (const cat of categoryOrder.slice(1)) {
      counts[cat] = allPosts.filter(p => p.category === cat).length
    }
    return counts
  }, [allPosts, categoryOrder])

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    let posts = allPosts
    if (activeCategory !== 'All') {
      posts = posts.filter(p => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q)   ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    return posts
  }, [allPosts, activeCategory, searchQuery])

  /* ── sixty filters in a wall is not a filter. Show the first row or two. ── */
  const usedCats   = categoryOrder.filter(c => c === 'All' || (categoryCounts[c] ?? 0) > 0)
  const COLLAPSED  = 14
  const collapsed  = usedCats.slice(0, COLLAPSED)
  const visibleCats = showAllCats
    ? usedCats
    : (collapsed.includes(activeCategory) ? collapsed : [...collapsed, activeCategory])
  const hiddenCatCount = usedCats.length - Math.min(usedCats.length, COLLAPSED)

  const showFeatured = featured && activeCategory === 'All' && !searchQuery.trim()
  const gridPosts    = showFeatured ? filtered.filter(p => !p.featured) : filtered

  return (
    <>
      {/* ── Search + Category Filters ── */}
      <div className="mb-6 space-y-3">

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-edge rounded-xl focus:outline-none focus:border-amber/60 bg-panel text-ink-high placeholder:text-ink-faint"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-high">
              <CloseIcon className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Category tab pills */}
        <div className="flex gap-2 flex-wrap">
          {visibleCats.map(cat => {
            const count = categoryCounts[cat] ?? 0
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-amber text-void border-transparent'
                    : 'border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high bg-panel'
                }`}>
                {cat}
                <span className={`ml-1.5 tabular-nums ${isActive ? 'opacity-60' : 'opacity-50'}`}>
                  {count}
                </span>
              </button>
            )
          })}
          {hiddenCatCount > 0 && (
            <button
              onClick={() => setShowAllCats(s => !s)}
              aria-expanded={showAllCats}
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-amber hover:text-amber-bright transition-colors">
              {showAllCats ? 'Show fewer' : `+ ${hiddenCatCount} more`}
            </button>
          )}
        </div>
      </div>

      {/* ── Featured post (only on "All" with no search) ── */}
      {showFeatured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group block bg-panel border border-amber/40 hover:border-amber rounded-2xl p-7 mb-6 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber/15 text-amber rounded-full">
              {featured.category}
            </span>
            <span className="text-xs text-ink-faint">{featured.date} · {featured.readTime}</span>
          </div>
          <CategoryIcon category={featured.category} className="w-7 h-7 mb-3 text-amber" />
          <h2 className="font-display text-xl font-semibold mb-2 text-ink-high">{featured.title}</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-4">{featured.excerpt}</p>
          <span className="text-xs font-semibold text-amber">Read more →</span>
        </Link>
      )}

      {/* ── Empty state ── */}
      {gridPosts.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-9 h-9 mx-auto mb-4 text-ink-faint" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink-high mb-1">No posts found</p>
          <p className="text-xs text-ink-muted">
            {searchQuery ? `No results for "${searchQuery}"` : `Nothing in ${activeCategory} yet`}
          </p>
          <button
            onClick={() => { setActiveCategory('All'); setSearchQuery('') }}
            className="mt-4 text-xs font-semibold underline text-ink-muted hover:text-ink-high transition-colors">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Post grid ── */}
      {gridPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gridPosts.map((post, i) => (
            <Link
              key={post.slug || i}
              href={`/blog/${post.slug}`}
              className="group bg-panel border border-edge rounded-2xl p-5 hover:border-edge-lit transition-colors block">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-raised text-ink-muted">
                  {post.category}
                </span>
                <span className="text-xs text-ink-faint">{post.readTime}</span>
              </div>
              <CategoryIcon category={post.category} className="w-5 h-5 mb-2 text-ink-faint" />
              <h2 className="text-sm font-semibold mb-2 leading-snug text-ink-high">{post.title}</h2>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-faint">{post.date}</span>
                <span className="text-xs font-semibold text-ink-faint group-hover:text-amber transition-colors">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

export type BlogPost = {
  slug:     string
  title:    string
  date:     string
  category: string
  excerpt:  string
  readTime: string
  emoji:    string
  featured: boolean
}

const CATEGORY_ORDER = [
  'All',
  'Our Story',
  'Guides',
  'Tips',
  'Resources',
  'Growth',
  'Comparisons',
  'Studio Stax',
]

const CATEGORY_COLORS: Record<string, string> = {
  'Our Story':   'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  'Guides':      'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
  'Tips':        'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
  'Resources':   'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  'Growth':      'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
  'Comparisons': 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
  'studio-stax': 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  'Studio Stax': 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
}

export default function BlogClientList({ allPosts }: { allPosts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery]       = useState('')

  const featured = allPosts.find(p => p.featured)

  /* ── counts per category ── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allPosts.length }
    for (const cat of CATEGORY_ORDER.slice(1)) {
      counts[cat] = allPosts.filter(p => p.category === cat).length
    }
    return counts
  }, [allPosts])

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

  const showFeatured = featured && activeCategory === 'All' && !searchQuery.trim()
  const gridPosts    = showFeatured ? filtered.filter(p => !p.featured) : filtered

  return (
    <>
      {/* ── Search + Category Filters ── */}
      <div className="mb-6 space-y-3">

        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-gray-400 bg-white dark:bg-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold">
              ✕
            </button>
          )}
        </div>

        {/* Category tab pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_ORDER.map(cat => {
            const count = categoryCounts[cat] ?? 0
            if (count === 0 && cat !== 'All') return null
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 bg-white dark:bg-gray-800'
                }`}>
                {cat}
                <span className={`ml-1.5 tabular-nums ${isActive ? 'opacity-50' : 'opacity-40'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Featured post (only on "All" with no search) ── */}
      {showFeatured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="block bg-black text-white rounded-2xl p-7 mb-6 hover:opacity-90 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
              {featured.category}
            </span>
            <span className="text-xs text-gray-400">{featured.date} · {featured.readTime}</span>
          </div>
          <div className="text-3xl mb-3">{featured.emoji}</div>
          <h2 className="text-lg font-extrabold mb-2">{featured.title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">{featured.excerpt}</p>
          <span className="text-xs font-bold text-white/60">Read more →</span>
        </Link>
      )}

      {/* ── Empty state ── */}
      {gridPosts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">No posts found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {searchQuery ? `No results for "${searchQuery}"` : `Nothing in ${activeCategory} yet`}
          </p>
          <button
            onClick={() => { setActiveCategory('All'); setSearchQuery('') }}
            className="mt-4 text-xs font-bold underline text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
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
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-500 transition-all block">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{post.readTime}</span>
              </div>
              <div className="text-2xl mb-2">{post.emoji}</div>
              <h2 className="text-sm font-extrabold mb-2 leading-snug text-gray-900 dark:text-gray-100">{post.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">{post.date}</span>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

import Link from 'next/link'

const POSTS = [
  {
    slug: 'buffer-alternative-free',
    title: 'The Best Free Buffer Alternative in 2026',
    excerpt: 'Buffer charges $6 per social channel per month. Here\'s how SocialMate gives you all 16 platforms completely free — and why thousands are switching.',
    category: 'Comparison',
    readTime: '5 min read',
    date: 'Feb 28, 2026',
    featured: true,
  },
  {
    slug: 'hootsuite-alternative',
    title: 'Why Hootsuite Users Are Switching to SocialMate',
    excerpt: 'Hootsuite starts at $99/month. SocialMate gives you more features — bulk scheduling, link in bio, team collaboration — for free.',
    category: 'Comparison',
    readTime: '4 min read',
    date: 'Feb 25, 2026',
    featured: false,
  },
  {
    slug: 'free-linktree-alternative',
    title: 'Stop Paying for Linktree — Build Your Bio Page Free',
    excerpt: 'Linktree charges $10–$24/month for a simple link page. SocialMate includes a full Link in Bio builder at zero cost.',
    category: 'Tips',
    readTime: '3 min read',
    date: 'Feb 22, 2026',
    featured: false,
  },
  {
    slug: 'bulk-scheduling-guide',
    title: 'How to Schedule 30 Days of Content in 2 Hours',
    excerpt: 'The bulk scheduling workflow top creators use to plan a full month of social content in a single session — without burning out.',
    category: 'Strategy',
    readTime: '6 min read',
    date: 'Feb 18, 2026',
    featured: false,
  },
  {
    slug: 'best-times-to-post',
    title: 'The Best Times to Post on Every Social Platform in 2026',
    excerpt: 'Platform-by-platform breakdown of peak engagement windows — backed by data, not guesswork. Plus how to find your own best times.',
    category: 'Strategy',
    readTime: '7 min read',
    date: 'Feb 14, 2026',
    featured: false,
  },
  {
    slug: 'social-media-team-collaboration',
    title: 'How to Manage Social Media as a Team Without Paying Per Seat',
    excerpt: 'Buffer and Hootsuite charge $12–$15 per user per month. Here\'s how teams are managing social content together for free.',
    category: 'Teams',
    readTime: '4 min read',
    date: 'Feb 10, 2026',
    featured: false,
  },
  {
    slug: 'instagram-scheduling-guide',
    title: 'The Complete Guide to Scheduling Instagram Posts in 2026',
    excerpt: 'Everything you need to know about scheduling Instagram posts, Reels, and Stories — including the tools that make it effortless.',
    category: 'Guides',
    readTime: '8 min read',
    date: 'Feb 6, 2026',
    featured: false,
  },
  {
    slug: 'hashtag-strategy',
    title: 'How to Build a Hashtag Strategy That Actually Grows Your Audience',
    excerpt: 'Most people use hashtags wrong. Here\'s the data-backed approach to hashtag collections that drives real reach on Instagram, TikTok, and LinkedIn.',
    category: 'Strategy',
    readTime: '5 min read',
    date: 'Feb 2, 2026',
    featured: false,
  },
  {
    slug: 'social-media-analytics',
    title: 'The Only Social Media Metrics That Actually Matter',
    excerpt: 'Vanity metrics won\'t grow your business. Here\'s which analytics to track, how to read them, and what to do with the data.',
    category: 'Analytics',
    readTime: '6 min read',
    date: 'Jan 28, 2026',
    featured: false,
  },
]

const CATEGORIES = ['All', 'Comparison', 'Strategy', 'Tips', 'Guides', 'Teams', 'Analytics']

const CATEGORY_COLORS: Record<string, string> = {
  Comparison: 'bg-blue-50 text-blue-600',
  Strategy: 'bg-purple-50 text-purple-600',
  Tips: 'bg-green-50 text-green-600',
  Guides: 'bg-orange-50 text-orange-600',
  Teams: 'bg-pink-50 text-pink-600',
  Analytics: 'bg-yellow-50 text-yellow-700',
}

export default function Blog() {
  const featured = POSTS.find(p => p.featured)
  const rest = POSTS.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
          <Link href="/blog" className="text-black font-bold">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Blog</h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Social media strategy, platform guides, and tips for scheduling smarter.
          </p>
        </div>

        {/* FEATURED POST */}
        {featured && (
          <div className="bg-black text-white rounded-3xl p-8 mb-12 group hover:opacity-95 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white`}>
                {featured.category}
              </span>
              <span className="text-xs text-white/50">{featured.date}</span>
              <span className="text-xs text-white/50">{featured.readTime}</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 leading-tight">{featured.title}</h2>
            <p className="text-white/60 leading-relaxed mb-6 max-w-2xl">{featured.excerpt}</p>
            <Link href={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
              Read article →
            </Link>
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={cat === 'All' ? '/blog' : `/blog?category=${cat.toLowerCase()}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                cat === 'All' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* POSTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rest.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
                  {post.category}
                </span>
              </div>
              <h2 className="text-sm font-extrabold tracking-tight mb-2 leading-snug group-hover:text-gray-600 transition-colors flex-1">
                {post.title}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400">{post.date}</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready to schedule smarter?</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Join thousands of creators using SocialMate to manage 16 platforms for free.
          </p>
          <Link href="/signup" className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            Create free account →
          </Link>
          <p className="text-xs text-gray-400 mt-3">No credit card · Free forever</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight">SocialMate</span>
            <span className="text-xs text-gray-400 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-black transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
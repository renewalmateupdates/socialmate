import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — Social Media Strategy & Tips | SocialMate',
  description: 'Real guides on social media scheduling, growing your audience, posting smarter, and making the most of free tools. Written by the SocialMate team.',
  openGraph: {
    title: 'SocialMate Blog — Social Media Strategy & Tips',
    description: 'Real guides on social media scheduling, growing your audience, and posting smarter.',
    url: 'https://socialmate.app/blog',
  },
}

const POSTS = [
  {
    slug: 'social-media-scheduling-tools-are-overpriced',
    title: 'Why Social Media Scheduling Tools Are Overpriced — And What To Do About It',
    category: 'Industry',
    excerpt: 'The average social media manager pays $50–$250/month just to schedule posts. Here\'s how that pricing model developed, why it doesn\'t have to be this way, and what a fairer alternative actually looks like.',
    date: 'Mar 4, 2026',
    readTime: '6 min read',
    featured: true,
  },
  {
    slug: 'batch-a-month-of-social-content',
    title: 'How To Batch A Full Month of Social Content In One Afternoon',
    category: 'Strategy',
    excerpt: 'Most creators post reactively and burn out within months. The ones who stay consistent batch everything in one session. Here\'s the exact workflow — from blank page to 30 days scheduled.',
    date: 'Mar 4, 2026',
    readTime: '7 min read',
    featured: false,
  },
  {
    slug: 'best-times-to-post-2026',
    title: 'The Best Times To Post On Every Platform In 2026',
    category: 'Strategy',
    excerpt: 'Timing affects reach more than most creators realize. A platform-by-platform breakdown of peak engagement windows — plus how to find your own best times from real data.',
    date: 'Mar 4, 2026',
    readTime: '8 min read',
    featured: false,
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: 'bg-purple-50 text-purple-600',
  Industry: 'bg-blue-50 text-blue-600',
  Guide: 'bg-green-50 text-green-600',
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
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-bold px-4 py-2 rounded-full mb-6">
            ✍️ Real content only — no filler
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Blog</h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            Practical guides on scheduling smarter, growing your audience, and getting more out of your social media — without overpaying for tools to do it.
          </p>
        </div>

        {/* FEATURED POST */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block mb-10 group">
            <div className="bg-black text-white rounded-3xl p-8 hover:opacity-95 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">{featured.category}</span>
                <span className="text-xs text-white/50">{featured.date}</span>
                <span className="text-xs text-white/50">{featured.readTime}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-3 leading-tight group-hover:opacity-80 transition-opacity">
                {featured.title}
              </h2>
              <p className="text-white/60 leading-relaxed mb-6 max-w-2xl text-sm">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-2 bg-white text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
                Read article →
              </span>
            </div>
          </Link>
        )}

        {/* REST OF POSTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col hover:border-gray-300 transition-all group">
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
        <div className="bg-black rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready to schedule smarter?</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            SocialMate is free, takes 60 seconds to set up, and supports all 16 platforms. No credit card, no trial period.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
            Create free account →
          </Link>
          <p className="text-white/30 text-xs mt-4">No credit card · Free forever · 16 platforms</p>
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
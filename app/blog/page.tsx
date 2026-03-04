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

const COMING_SOON_POSTS = [
  {
    topic: 'How to batch a full month of social content in one afternoon',
    category: 'Strategy',
    desc: 'The exact workflow top creators use to plan 30 days of posts in a single 2-hour session — without burning out or losing quality.',
    eta: 'Coming soon',
  },
  {
    topic: 'The best times to post on every platform in 2026',
    category: 'Strategy',
    desc: 'A platform-by-platform breakdown of peak engagement windows — backed by data, not guesswork. Plus how to find your own best times using real analytics.',
    eta: 'Coming soon',
  },
  {
    topic: 'Why social media scheduling tools are overpriced — and what to do about it',
    category: 'Industry',
    desc: 'An honest look at how the social media tool market got this expensive, and why it doesn\'t have to cost this much to manage your presence professionally.',
    eta: 'Coming soon',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: 'bg-purple-50 text-purple-600',
  Industry: 'bg-blue-50 text-blue-600',
  Guide: 'bg-green-50 text-green-600',
}

export default function Blog() {
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

        {/* COMING SOON POSTS */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-extrabold tracking-tight">Up next</h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">3 posts launching soon</span>
          </div>
          <div className="space-y-4">
            {COMING_SOON_POSTS.map((post, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex items-start gap-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-base font-extrabold text-gray-400 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{post.eta}</span>
                  </div>
                  <h3 className="text-sm font-extrabold tracking-tight mb-1.5 leading-snug">{post.topic}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{post.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HONEST STATEMENT */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 mb-14 text-center">
          <div className="text-3xl mb-4">📝</div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">We publish real content or nothing at all</h2>
          <p className="text-gray-400 leading-relaxed max-w-xl mx-auto">
            Every post on this blog will be genuinely useful — written by people who use SocialMate, based on real data, with no keyword stuffing or filler. We'd rather publish three great articles than thirty mediocre ones. The first posts are coming soon.
          </p>
        </div>

        {/* NOTIFY / CTA */}
        <div className="bg-black rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Don't wait for the blog — start now</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            The best way to learn social media scheduling is to actually do it. SocialMate is free, takes 60 seconds to set up, and supports all 16 platforms.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
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
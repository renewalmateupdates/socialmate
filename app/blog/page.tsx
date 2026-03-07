'use client'
import Sidebar from '@/components/Sidebar'

const POSTS = [
  {
    title: 'SocialMate vs Buffer: Why Free Beats $18/month',
    date: 'March 2025',
    category: 'Comparisons',
    excerpt: 'Buffer charges $18/month for what SocialMate gives you free. Here\'s the full breakdown of every feature, side by side.',
    readTime: '4 min read',
    emoji: '⚔️',
  },
  {
    title: 'The Best Free Social Media Scheduler in 2025',
    date: 'February 2025',
    category: 'Guides',
    excerpt: 'Most "free" schedulers are just trials. SocialMate is genuinely free — here\'s exactly what you get with no credit card required.',
    readTime: '5 min read',
    emoji: '📅',
  },
  {
    title: 'How to Use AI to Write Better Social Media Captions',
    date: 'February 2025',
    category: 'Tips',
    excerpt: 'AI caption tools can save hours every week. Here\'s how to use them without sounding like a robot.',
    readTime: '3 min read',
    emoji: '✍️',
  },
  {
    title: 'How to Schedule 30 Days of Content in One Sitting',
    date: 'January 2025',
    category: 'Guides',
    excerpt: 'Batch content creation is the single biggest time saver for creators. Here\'s the exact system we use.',
    readTime: '6 min read',
    emoji: '🗓',
  },
  {
    title: 'Why Your Hashtag Strategy Isn\'t Working (And How to Fix It)',
    date: 'January 2025',
    category: 'Tips',
    excerpt: 'Spamming 30 hashtags stopped working years ago. Here\'s what actually drives reach in 2025.',
    readTime: '4 min read',
    emoji: '#️⃣',
  },
  {
    title: 'SocialMate vs Hootsuite: The Real Cost Comparison',
    date: 'December 2024',
    category: 'Comparisons',
    excerpt: 'Hootsuite starts at $99/month. SocialMate starts at $0. We break down exactly what you\'re paying for.',
    readTime: '5 min read',
    emoji: '💰',
  },
]

const CATEGORIES = ['All', 'Guides', 'Tips', 'Comparisons']

const CATEGORY_COLORS: Record<string, string> = {
  Comparisons: 'bg-blue-50 text-blue-600',
  Guides: 'bg-green-50 text-green-600',
  Tips: 'bg-yellow-50 text-yellow-600',
}

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Blog</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Tips, comparisons, and guides for creators and small businesses
            </p>
          </div>

          {/* CATEGORY PILLS */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {CATEGORIES.map(cat => (
              <span key={cat}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-500 cursor-pointer hover:border-gray-400 transition-all">
                {cat}
              </span>
            ))}
          </div>

          {/* FEATURED POST */}
          <div className="bg-black text-white rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
                {POSTS[0].category}
              </span>
              <span className="text-xs text-gray-400">{POSTS[0].date}</span>
              <span className="text-xs text-gray-400">· {POSTS[0].readTime}</span>
            </div>
            <div className="text-3xl mb-3">{POSTS[0].emoji}</div>
            <h2 className="text-lg font-extrabold mb-2">{POSTS[0].title}</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{POSTS[0].excerpt}</p>
            <span className="text-xs font-bold text-white/60 hover:text-white transition-all cursor-pointer">
              Read more →
            </span>
          </div>

          {/* POST GRID */}
          <div className="grid grid-cols-2 gap-4">
            {POSTS.slice(1).map((post, i) => (
              <div key={i}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-500'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <div className="text-2xl mb-2">{post.emoji}</div>
                <h2 className="text-sm font-extrabold mb-2 leading-snug">{post.title}</h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-xs font-bold text-gray-400 hover:text-black transition-all">
                    Read →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM CTA */}
          <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <p className="text-sm font-extrabold mb-1">Want more tips like these?</p>
            <p className="text-xs text-gray-400 mb-4">
              SocialMate is free to use — no credit card, no catch.
            </p>
            <a href="/dashboard"
              className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
              Start scheduling for free →
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
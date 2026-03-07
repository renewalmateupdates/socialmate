'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const POSTS = [
  { title: 'Why We Built SocialMate: The Full Story',                         date: 'March 2025',    category: 'Our Story',   excerpt: 'Built by a deli worker in spare moments. Here\'s why SocialMate exists and what we\'re building toward.',                                     readTime: '4 min read', emoji: '❤️',  featured: true  },
  { title: 'The Best Free Social Media Scheduler in 2025',                    date: 'February 2025', category: 'Guides',      excerpt: 'Most "free" schedulers are just trials. SocialMate is genuinely free — here\'s exactly what you get.',                                        readTime: '5 min read', emoji: '📅',  featured: false },
  { title: 'How to Use AI to Write Better Social Media Captions',             date: 'February 2025', category: 'Tips',        excerpt: 'AI caption tools can save hours every week. Here\'s how to use them without sounding like a robot.',                                           readTime: '3 min read', emoji: '✍️', featured: false },
  { title: 'How to Schedule 30 Days of Content in One Sitting',               date: 'January 2025',  category: 'Guides',      excerpt: 'Batch content creation is the single biggest time saver for creators. Here\'s the exact system.',                                             readTime: '6 min read', emoji: '🗓',  featured: false },
  { title: 'Why Your Hashtag Strategy Isn\'t Working (And How to Fix It)',    date: 'January 2025',  category: 'Tips',        excerpt: 'Spamming 30 hashtags stopped working years ago. Here\'s what actually drives reach in 2025.',                                                  readTime: '4 min read', emoji: '#️⃣', featured: false },
  { title: 'The Real Cost of Social Media Management Tools in 2025',         date: 'December 2024', category: 'Comparisons', excerpt: 'We did the math on what popular scheduling tools actually cost. The numbers are eye-opening.',                                                  readTime: '5 min read', emoji: '💰',  featured: false },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Our Story':   'bg-purple-50 text-purple-600',
  'Guides':      'bg-green-50 text-green-600',
  'Tips':        'bg-yellow-50 text-yellow-600',
  'Comparisons': 'bg-blue-50 text-blue-600',
}

export default function Blog() {
  const featured = POSTS.find(p => p.featured)
  const rest = POSTS.filter(p => !p.featured)

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Blog</h1>
          <p className="text-sm text-gray-400">Tips, guides, and updates from SocialMate</p>
        </div>

        {/* FEATURED */}
        {featured && (
          <div className="bg-black text-white rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full`}>
                {featured.category}
              </span>
              <span className="text-xs text-gray-400">{featured.date} · {featured.readTime}</span>
            </div>
            <div className="text-3xl mb-3">{featured.emoji}</div>
            <h2 className="text-lg font-extrabold mb-2">{featured.title}</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{featured.excerpt}</p>
            <Link href="/story" className="text-xs font-bold text-white/60 hover:text-white transition-all">
              Read more →
            </Link>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-2 gap-4">
          {rest.map((post, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all cursor-pointer">
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
                <span className="text-xs font-bold text-gray-400 hover:text-black transition-all">Read →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <p className="text-sm font-extrabold mb-1">Want to try SocialMate?</p>
          <p className="text-xs text-gray-400 mb-4">Free forever. No credit card. No catch.</p>
          <Link href="/signup"
            className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
            Start scheduling for free →
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
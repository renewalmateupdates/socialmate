import Link from "next/link"

const POSTS = [
  {
    slug: "why-we-built-socialmate-free",
    title: "Why We Built the Most Generous Free Plan in Social Media",
    excerpt: "Buffer charges $18/mo. Hootsuite charges $99/mo. We think that's wrong. Here's why SocialMate is free — and how we make it work.",
    category: "Company",
    date: "February 20, 2026",
    readTime: "4 min read",
  },
  {
    slug: "best-times-to-post-2026",
    title: "The Best Times to Post on Every Platform in 2026",
    excerpt: "We analyzed millions of posts across Instagram, TikTok, LinkedIn, and more. Here's exactly when to post for maximum reach.",
    category: "Strategy",
    date: "February 15, 2026",
    readTime: "7 min read",
  },
  {
    slug: "how-to-grow-instagram-2026",
    title: "How to Actually Grow on Instagram in 2026 (Without Paying for Ads)",
    excerpt: "The algorithm changed again. Here's what's actually working right now for organic Instagram growth — backed by real data.",
    category: "Instagram",
    date: "February 10, 2026",
    readTime: "9 min read",
  },
  {
    slug: "social-media-content-calendar",
    title: "How to Build a Social Media Content Calendar That You'll Actually Stick To",
    excerpt: "Most content calendars get abandoned by week two. Here's a simple system that works for solo creators and teams alike.",
    category: "Strategy",
    date: "February 5, 2026",
    readTime: "6 min read",
  },
  {
    slug: "linkedin-content-strategy",
    title: "The LinkedIn Content Strategy That Gets 10x More Views",
    excerpt: "LinkedIn reach is at an all-time high right now. Here's the exact posting strategy driving massive organic growth in 2026.",
    category: "LinkedIn",
    date: "January 28, 2026",
    readTime: "8 min read",
  },
  {
    slug: "tiktok-for-business-beginners",
    title: "TikTok for Business: A Beginner's Guide to Getting Your First 1000 Followers",
    excerpt: "You don't need to dance. You don't need to go viral. Here's a simple repeatable system for growing a business TikTok account.",
    category: "TikTok",
    date: "January 20, 2026",
    readTime: "10 min read",
  },
]

const CATEGORIES = ["All", "Strategy", "Instagram", "LinkedIn", "TikTok", "Company"]

const CATEGORY_COLORS: Record<string, string> = {
  Company: "bg-purple-50 text-purple-700",
  Strategy: "bg-blue-50 text-blue-700",
  Instagram: "bg-pink-50 text-pink-700",
  LinkedIn: "bg-sky-50 text-sky-700",
  TikTok: "bg-gray-100 text-gray-700",
}

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e4e4e0] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Log in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">SocialMate Blog</h1>
          <p className="text-gray-500">Strategy, tips, and insights to help you grow on social media — completely free, just like our product.</p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-[#e4e4e0] bg-gray-50/50 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${cat === "All" ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED POST */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="border border-gray-100 rounded-2xl p-8 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[POSTS[0].category]}`}>
              {POSTS[0].category}
            </span>
            <span className="text-xs text-gray-400">{POSTS[0].date}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{POSTS[0].readTime}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">{POSTS[0].title}</h2>
          <p className="text-gray-500 mb-6 max-w-2xl">{POSTS[0].excerpt}</p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:opacity-70 transition-opacity cursor-pointer">
            Read article →
          </span>
        </div>
      </section>

      {/* POST GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {POSTS.slice(1).map((post) => (
            <div
              key={post.slug}
              className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all bg-white flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category]}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
              <h3 className="font-bold text-base mb-2 leading-snug">{post.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{post.date}</span>
                <span className="text-xs font-semibold text-black hover:opacity-70 transition-opacity cursor-pointer">
                  Read →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50/50 border-t border-[#e4e4e0] py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready to level up your social media?</h2>
          <p className="text-gray-500 mb-8">Join 18,000+ creators using SocialMate to schedule smarter — for free.</p>
          <Link href="/signup" className="bg-black text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base inline-block">
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e4e4e0]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="/blog" className="text-sm text-gray-400 hover:text-black transition-colors">Blog</a>
            <a href="/privacy" className="text-sm text-gray-400 hover:text-black transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-black transition-colors">Terms</a>
          </div>
          <div className="text-sm text-gray-400">© 2026 SocialMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
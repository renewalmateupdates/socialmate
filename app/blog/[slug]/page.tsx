import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Real posts will be added here as they are written and approved
// Do not add placeholder or fake content — real posts only
const POSTS: Record<string, {
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  content: string
}> = {
  // Posts will be populated here as they launch
}

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: 'bg-purple-50 text-purple-600',
  Industry: 'bg-blue-50 text-blue-600',
  Guide: 'bg-green-50 text-green-600',
  Tips: 'bg-green-50 text-green-600',
  Analytics: 'bg-yellow-50 text-yellow-700',
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = POSTS[params.slug]
  if (!post) return { title: 'Post not found — SocialMate Blog' }
  return {
    title: `${post.title} — SocialMate Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://socialmate.app/blog/${params.slug}`,
    },
  }
}

function renderContent(content: string) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<div key={key++} className="h-2" />)
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-extrabold tracking-tight mt-8 mb-3">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={key++} className="text-sm font-bold text-black mt-4 mb-1">
          {trimmed.slice(2, -2)}
        </p>
      )
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-sm text-gray-600 leading-relaxed ml-4 list-disc">
          {trimmed.slice(2)}
        </li>
      )
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-600 leading-relaxed">
          {trimmed}
        </p>
      )
    }
  }
  return elements
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]

  // No post found — redirect to blog index cleanly
  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">Sign in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="text-5xl mb-6">✍️</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4">This post is coming soon</h1>
          <p className="text-gray-400 leading-relaxed mb-8">
            We only publish real, genuinely useful content. This one is still being written. Check back soon — or head back to the blog index to see what's up next.
          </p>
          <Link
            href="/blog"
            className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const otherPosts = Object.entries(POSTS)
    .filter(([slug]) => slug !== params.slug)
    .slice(0, 3)

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
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          <span>→</span>
          <span className={`font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
            <span>📅 {post.date}</span>
            <span>⏱ {post.readTime}</span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-2 mb-16">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="bg-black text-white rounded-3xl p-8 text-center mb-16">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Try SocialMate free</h2>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Schedule to 16 platforms, manage your team, and grow your audience — all for free. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
            Create free account →
          </Link>
          <p className="text-white/30 text-xs mt-3">16 platforms · Unlimited posts · Free forever</p>
        </div>

        {/* MORE POSTS */}
        {otherPosts.length > 0 && (
          <div>
            <h2 className="text-lg font-extrabold tracking-tight mb-6">More from the blog</h2>
            <div className="space-y-3">
              {otherPosts.map(([slug, p]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-gray-600 transition-colors">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.date} · {p.readTime}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/blog" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                View all posts →
              </Link>
            </div>
          </div>
        )}

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
          </div>
        </div>
      </footer>
    </div>
  )
}
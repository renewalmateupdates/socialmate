import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function getDbPosts() {
  try {
    const admin = getSupabaseAdmin()
    const { data } = await admin
      .from('blog_posts')
      .select('slug, title, excerpt, category, author, published_at, content')
      .order('published_at', { ascending: false })
      .limit(30)
    if (!data) return []
    return data.map((d: any) => {
      const wordCount = (d.content || '').trim().split(/\s+/).length
      const readMins  = Math.max(1, Math.round(wordCount / 200))
      return {
        slug:      d.slug as string,
        title:     d.title as string,
        date:      new Date(d.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        category:  (d.category || 'Studio Stax') as string,
        excerpt:   (d.excerpt || '') as string,
        readTime:  `${readMins} min read`,
        emoji:     '🛠️',
        featured:  false,
      }
    })
  } catch {
    return []
  }
}

const STATIC_POSTS = [
  { slug: 'why-we-built-socialmate',                         title: 'Why We Built SocialMate: The Full Story',                        date: 'March 2026',    category: 'Our Story',   excerpt: 'Built by a deli worker in spare moments. Here\'s why SocialMate exists and what we\'re building toward.',              readTime: '4 min read', emoji: '❤️',  featured: true  },
  { slug: 'socialmate-gives-back-sm-give',                   title: 'How SocialMate Gives Back: Introducing SM-Give',                 date: 'April 2026',    category: 'Our Story',   excerpt: 'Every subscription, every donation, every unclaimed affiliate check — a piece goes to real people who need it most.',   readTime: '3 min read', emoji: '🫶',  featured: false },
  { slug: 'discord-scheduling-grow-your-server',             title: 'How to Schedule Discord Posts and Grow Your Server in 2026',    date: 'April 2026',    category: 'Guides',      excerpt: 'Discord isn\'t just for gaming anymore. Here\'s how to use scheduled posts to keep your community engaged daily.',   readTime: '5 min read', emoji: '💬',  featured: false },
  { slug: 'mastodon-scheduling-free-tool',                   title: 'How to Schedule Mastodon Posts for Free (No Paid Tools)',        date: 'April 2026',    category: 'Guides',      excerpt: 'Mastodon has no algorithm — which means consistency is everything. Here\'s a free way to stay consistent.',            readTime: '4 min read', emoji: '🐘',  featured: false },
  { slug: 'how-to-repurpose-content-across-platforms',       title: 'How to Repurpose Content Across 4 Platforms Without Burning Out', date: 'April 2026',   category: 'Tips',        excerpt: 'You don\'t need four different content strategies. One post, four platforms, zero burnout — here\'s the system.',        readTime: '5 min read', emoji: '♻️', featured: false },
  { slug: 'how-to-schedule-posts-on-bluesky',                title: 'How to Schedule Posts on Bluesky in 2026',                       date: 'March 2026',    category: 'Guides',      excerpt: 'Bluesky is growing fast. Here\'s how to schedule posts, maintain consistency, and grow your following.',                readTime: '4 min read', emoji: '🦋',  featured: false },
  { slug: 'social-media-scheduling-for-small-business',      title: 'Social Media Scheduling for Small Businesses: The Practical Guide', date: 'March 2026', category: 'Guides',      excerpt: 'Small businesses don\'t need a $99/month tool to post consistently. Here\'s a practical system that works.',           readTime: '5 min read', emoji: '🏪',  featured: false },
  { slug: 'free-social-media-tools-for-creators',            title: 'The Best Free Social Media Tools for Creators in 2026',          date: 'March 2026',    category: 'Resources',   excerpt: 'A complete list of free tools for creators — scheduling, analytics, design, and AI — with honest takes.',              readTime: '6 min read', emoji: '🎨',  featured: false },
  { slug: 'how-to-grow-bluesky-following',                   title: 'How to Grow Your Bluesky Following in 2026',                     date: 'March 2026',    category: 'Growth',      excerpt: 'Bluesky rewards genuine interaction over gaming the algorithm. Here\'s what\'s actually working.',                      readTime: '5 min read', emoji: '📈',  featured: false },
  { slug: 'social-media-scheduling-vs-posting-manually',     title: 'Scheduling vs. Posting Manually: Which Is Better?',              date: 'March 2026',    category: 'Tips',        excerpt: 'The debate has been settled by data. Here\'s when to schedule, when to post live, and how to combine both.',           readTime: '4 min read', emoji: '⏱️', featured: false },
  { slug: 'best-free-social-media-scheduler-2025',           title: 'The Best Free Social Media Scheduler in 2026 (No Credit Card)',  date: 'Feb 2026',      category: 'Guides',      excerpt: 'Most "free" schedulers are just trials. SocialMate is genuinely free — here\'s exactly what you get.',                 readTime: '5 min read', emoji: '📅',  featured: false },
  { slug: 'how-to-use-ai-for-social-media-captions',         title: 'How to Use AI to Write Better Social Media Captions',            date: 'Feb 2026',      category: 'Tips',        excerpt: 'AI caption tools can save hours every week. Here\'s how to use them without sounding like a robot.',                    readTime: '3 min read', emoji: '✍️', featured: false },
  { slug: 'why-your-hashtag-strategy-isnt-working',          title: 'Why Your Hashtag Strategy Isn\'t Working (And How to Fix It)',   date: 'Jan 2026',      category: 'Tips',        excerpt: 'Spamming 30 hashtags stopped working years ago. Here\'s what actually drives reach in 2026.',                          readTime: '4 min read', emoji: '#️⃣', featured: false },
  { slug: 'real-cost-of-social-media-management-tools-2025', title: 'The Real Cost of Social Media Management Tools in 2026',        date: 'Dec 2025',      category: 'Guides',      excerpt: 'We did the math on what popular scheduling tools actually cost. The numbers are eye-opening.',                          readTime: '5 min read', emoji: '💰',  featured: false },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Our Story':   'bg-purple-50 text-purple-600',
  'Guides':      'bg-green-50 text-green-600',
  'Tips':        'bg-yellow-50 text-yellow-600',
  'Resources':   'bg-blue-50 text-blue-600',
  'Growth':      'bg-pink-50 text-pink-600',
  'Comparisons': 'bg-orange-50 text-orange-600',
  'studio-stax': 'bg-amber-50 text-amber-600',
  'Studio Stax': 'bg-amber-50 text-amber-600',
}

export default async function Blog() {
  const dbPosts  = await getDbPosts()
  const slugSet  = new Set(STATIC_POSTS.map(p => p.slug))
  // Merge: static first, then any DB posts not already in static list
  const allPosts = [
    ...STATIC_POSTS,
    ...dbPosts.filter(p => !slugSet.has(p.slug)),
  ]
  const featured = allPosts.find(p => p.featured)
  const rest = allPosts.filter(p => !p.featured)

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Blog</h1>
          <p className="text-sm text-gray-400">Tips, guides, and updates from SocialMate</p>
        </div>

        {/* FEATURED */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block bg-black text-white rounded-2xl p-7 mb-6 hover:opacity-90 transition-all">
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

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rest.map((post, i) => (
            <Link key={i} href={`/blog/${post.slug}`}
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

        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-center">
          <p className="text-sm font-extrabold mb-1 text-gray-900 dark:text-gray-100">Want to try SocialMate?</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Free forever. No credit card. No catch.</p>
          <Link href="/signup"
            className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
            Start scheduling for free →
          </Link>
        </div>

        {/* SM-Give strip */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-10 pb-4">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ❤️ <span className="font-semibold text-gray-700 dark:text-gray-300">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
              <a href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Learn about SM-Give →</a>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
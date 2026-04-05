import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import BlogClientList from '@/components/BlogClientList'

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
  { slug: 'how-to-schedule-telegram-posts-free',             title: 'How to Schedule Telegram Posts for Free in 2026',               date: 'April 2026',    category: 'Guides',      excerpt: 'Telegram is one of the most underrated platforms for creators and communities. Here\'s how to schedule posts to it without paying for anything.',   readTime: '5 min read', emoji: '✈️',  featured: false },
  { slug: 'bluesky-vs-twitter-where-to-post-2026',           title: 'Bluesky vs Twitter/X in 2026: Where Should You Actually Post?', date: 'April 2026',    category: 'Comparisons', excerpt: 'Bluesky has crossed 30 million users. X/Twitter still has hundreds of millions. Here\'s the honest breakdown of where your time is better spent.',  readTime: '5 min read', emoji: '⚖️',  featured: false },
  { slug: 'social-media-content-calendar-template-2026',     title: 'How to Build a Social Media Content Calendar (Free Template + System)', date: 'April 2026', category: 'Resources', excerpt: 'A content calendar you actually use is worth more than a perfect one you abandon. Here\'s a simple system and a free template.',                  readTime: '6 min read', emoji: '📅',  featured: false },
  { slug: 'best-time-to-post-on-bluesky',                    title: 'The Best Times to Post on Bluesky in 2026 (Data + Tips)',       date: 'April 2026',    category: 'Tips',        excerpt: 'Bluesky is mostly chronological, which means timing matters more here than on algorithm-heavy platforms. Here\'s what\'s working.',                readTime: '4 min read', emoji: '💡',  featured: false },
  { slug: 'discord-community-management-guide',              title: 'Discord Community Management: How to Keep Members Engaged in 2026', date: 'April 2026', category: 'Guides',      excerpt: 'Most Discord servers go quiet within 60 days of launch. Here\'s what separates the ones that stay active from the ones that become ghost towns.',  readTime: '6 min read', emoji: '💬',  featured: false },
  { slug: 'social-media-automation-solo-creators',           title: 'Social Media Automation for Solo Creators: Do More in Less Time', date: 'April 2026',   category: 'Tips',        excerpt: 'Solo creators who automate the right things post more consistently, burn out less, and grow faster. Here\'s exactly what to automate.',           readTime: '5 min read', emoji: '💡',  featured: false },
  { slug: 'free-hootsuite-alternative-2026',                 title: 'The Best Free Hootsuite Alternative in 2026',                    date: 'April 2026',    category: 'Comparisons', excerpt: 'Hootsuite removed their free plan. Prices start at $99/month. Here are the best free alternatives that actually work.',                           readTime: '5 min read', emoji: '⚖️',  featured: false },
  { slug: 'how-to-grow-discord-server-2026',                 title: 'How to Grow a Discord Server from 0 in 2026',                   date: 'April 2026',    category: 'Growth',      excerpt: 'Growing a Discord server from scratch is slow if you don\'t have a system. Here\'s a proven approach for getting your first 500 members.',        readTime: '6 min read', emoji: '📈',  featured: false },
  { slug: 'ai-social-media-tools-free-2026',                 title: 'The Best Free AI Social Media Tools in 2026',                   date: 'April 2026',    category: 'Resources',   excerpt: 'AI tools for social media have gotten genuinely useful in 2026. Here\'s a guide to the best free options and what they\'re actually good at.',     readTime: '5 min read', emoji: '🧰',  featured: false },
  { slug: 'how-to-post-consistently-social-media',           title: 'How to Post Consistently on Social Media (Without Burning Out)', date: 'April 2026',    category: 'Tips',        excerpt: 'Consistency is the single biggest factor in social media growth. Here\'s a system for staying consistent that doesn\'t require willpower.',        readTime: '5 min read', emoji: '💡',  featured: false },
  { slug: 'mastodon-vs-bluesky-2026',                        title: 'Mastodon vs Bluesky in 2026: Which Decentralized Platform Should You Use?', date: 'April 2026', category: 'Comparisons', excerpt: 'Both are open, decentralized alternatives to X/Twitter. They\'re quite different. Here\'s how to decide which one is worth your time.',      readTime: '5 min read', emoji: '⚖️',  featured: false },
  { slug: 'social-media-scheduling-agencies-freelancers',    title: 'Social Media Scheduling for Agencies and Freelancers: The Practical Guide', date: 'April 2026', category: 'Guides', excerpt: 'Managing social media for multiple clients is a different challenge. Here\'s how to build a system that scales without burning out.',             readTime: '6 min read', emoji: '📋',  featured: false },
  // 14 new posts (Apr 2026)
  { slug: 'best-social-media-scheduler-creators-2026',       title: 'The Best Social Media Scheduler for Creators in 2026 (Free Options Compared)', date: 'April 2026', category: 'Comparisons', excerpt: 'Most free schedulers are trials in disguise. Here\'s an honest comparison of the best options for creators in 2026.',                              readTime: '6 min read', emoji: '⚖️',  featured: false },
  { slug: 'how-to-schedule-posts-instagram-free',            title: 'How to Schedule Instagram Posts for Free in 2026',                             date: 'April 2026', category: 'Guides',      excerpt: 'Instagram scheduling without paying $50/month is possible. Here\'s how to do it and what tools actually work for free.',                          readTime: '5 min read', emoji: '📷',  featured: false },
  { slug: 'social-media-content-ideas-2026',                 title: '50 Social Media Content Ideas That Work in 2026',                              date: 'April 2026', category: 'Tips',        excerpt: 'Staring at a blank content calendar? Here are 50 proven ideas across every platform — pick what fits your brand.',                               readTime: '7 min read', emoji: '💡',  featured: false },
  { slug: 'how-to-use-bluesky-for-business',                 title: 'How to Use Bluesky for Business (Complete Guide 2026)',                        date: 'April 2026', category: 'Guides',      excerpt: 'Bluesky has crossed 30 million users and is growing fast. Here\'s how businesses are actually using it.',                                         readTime: '6 min read', emoji: '🦋',  featured: false },
  { slug: 'pinterest-scheduling-free-tools',                 title: 'Best Free Pinterest Scheduling Tools in 2026',                                 date: 'April 2026', category: 'Comparisons', excerpt: 'Pinterest rewards consistent posting. Here\'s which free tools actually work for scheduling Pins without a monthly fee.',                         readTime: '5 min read', emoji: '📌',  featured: false },
  { slug: 'social-media-burnout-creators',                   title: 'Social Media Burnout Is Real — Here\'s How to Post Without Burning Out',       date: 'April 2026', category: 'Tips',        excerpt: 'Posting every day is not sustainable for most people. Here\'s a system for staying consistent without the mental cost.',                          readTime: '5 min read', emoji: '🔥',  featured: false },
  { slug: 'how-to-grow-mastodon-following',                  title: 'How to Grow Your Mastodon Following in 2026',                                  date: 'April 2026', category: 'Growth',      excerpt: 'Mastodon has no algorithm and no ad-driven discovery. Growth works differently here — and that\'s actually a good thing.',                        readTime: '5 min read', emoji: '🐘',  featured: false },
  { slug: 'small-business-social-media-guide-2026',          title: 'The Complete Social Media Guide for Small Businesses in 2026',                 date: 'April 2026', category: 'Guides',      excerpt: 'Running social media for a small business is different from being an influencer. Here\'s a practical guide for the real world.',                  readTime: '7 min read', emoji: '🏪',  featured: false },
  { slug: 'free-link-in-bio-tools',                          title: 'Best Free Link-in-Bio Tools in 2026 (Linktree Alternatives)',                  date: 'April 2026', category: 'Comparisons', excerpt: 'Linktree is the default — but it\'s not the best option for everyone. Here are the top free alternatives in 2026.',                             readTime: '5 min read', emoji: '🔗',  featured: false },
  { slug: 'twitter-x-alternatives-2026',                     title: 'The Best Twitter/X Alternatives in 2026 (And Where Creators Are Going)',       date: 'April 2026', category: 'Growth',      excerpt: 'Creators are spreading out. Bluesky, Mastodon, Threads — here\'s where people are going and what\'s actually growing.',                          readTime: '5 min read', emoji: '📊',  featured: false },
  { slug: 'content-calendar-for-small-business',             title: 'How to Build a Content Calendar for Your Small Business (Free Template)',      date: 'April 2026', category: 'Resources',   excerpt: 'A content calendar prevents the "what do I post today?" panic. Here\'s how to build one that actually gets used.',                                readTime: '6 min read', emoji: '📅',  featured: false },
  { slug: 'social-media-analytics-free-tools',               title: 'Best Free Social Media Analytics Tools in 2026',                               date: 'April 2026', category: 'Comparisons', excerpt: 'Most analytics tools cost $50-$250/month. Here are the ones that give you real data for free in 2026.',                                           readTime: '5 min read', emoji: '📈',  featured: false },
  { slug: 'discord-for-creators-2026',                       title: 'Why Every Creator Should Have a Discord Server in 2026',                       date: 'April 2026', category: 'Growth',      excerpt: 'Discord is the most underrated creator tool right now. Here\'s why every creator should be building a server.',                                   readTime: '5 min read', emoji: '💬',  featured: false },
  { slug: 'how-to-repurpose-one-post-ten-platforms',         title: 'How to Turn One Post Into Content for 10 Platforms',                           date: 'April 2026', category: 'Tips',        excerpt: 'Creating ten separate posts is not sustainable. Here\'s the system for turning one core idea into content across 10 platforms.',                 readTime: '6 min read', emoji: '♻️',  featured: false },
]

export default async function Blog() {
  const dbPosts  = await getDbPosts()
  const slugSet  = new Set(STATIC_POSTS.map(p => p.slug))
  // Merge: static first, then any DB posts not already in static list
  const allPosts = [
    ...STATIC_POSTS,
    ...dbPosts.filter(p => !slugSet.has(p.slug)),
  ]

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Blog</h1>
          <p className="text-sm text-gray-400">Tips, guides, and updates from SocialMate</p>
        </div>

        {/* Search, category filters, featured post, and grid — all client-side */}
        <BlogClientList allPosts={allPosts} />

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
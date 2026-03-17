'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const FEATURE_CATEGORIES = [
  {
    category: 'AI Tools',
    emoji: '🤖',
    desc: '12 AI tools powered by Google Gemini. Credits included on every plan.',
    features: [
      {
        name: 'Caption Generator',
        emoji: '✍️',
        credits: '3 credits',
        proOnly: false,
        what: 'Generates platform-optimized captions based on your topic and tone.',
        how: 'Powered by Google Gemini. Analyzes your topic and platform to generate captions that match character limits, tone, and engagement patterns.',
      },
      {
        name: 'Hashtag Generator',
        emoji: '#️⃣',
        credits: '2 credits',
        proOnly: false,
        what: 'Generates a set of relevant, high-performing hashtags for your post.',
        how: 'AI analyzes your caption content and niche to suggest hashtags that balance reach and relevance.',
      },
      {
        name: 'Post Rewrite / Improver',
        emoji: '🔁',
        credits: '3 credits',
        proOnly: false,
        what: 'Takes your existing caption and makes it sharper, more engaging, and better structured.',
        how: 'AI rewrites for stronger hooks, better readability, and platform-appropriate tone.',
      },
      {
        name: 'Viral Hook Generator',
        emoji: '🎣',
        credits: '4 credits',
        proOnly: false,
        what: 'Generates 3 scroll-stopping opening lines designed to drive clicks and engagement.',
        how: 'Trained on viral content patterns across TikTok, YouTube, LinkedIn and Reddit.',
      },
      {
        name: 'Thread Generator',
        emoji: '🧵',
        credits: '8 credits',
        proOnly: false,
        what: 'Turns a single topic or idea into a structured multi-part thread with a hook, supporting points, and a CTA.',
        how: 'AI structures your idea into a full narrative arc — ready to copy and post.',
      },
      {
        name: 'Content Repurposer',
        emoji: '♻️',
        credits: '8 credits',
        proOnly: false,
        what: 'Paste a blog post, transcript, or long caption and get platform-ready short-form content out the other side.',
        how: 'AI extracts key ideas from long-form content and reshapes them into posts optimized for each platform.',
      },
      {
        name: 'Post Score',
        emoji: '⚡',
        credits: '2 credits',
        proOnly: false,
        what: 'AI predicts how your post will perform before you publish — with a score out of 100, strengths, and improvements.',
        how: 'Scores your post against engagement patterns on the selected platform. Shows what to fix before it goes live.',
      },
      {
        name: 'AI Content Calendar',
        emoji: '📅',
        credits: '20 credits',
        proOnly: true,
        what: 'Generate a full 30-day content calendar based on your niche, platforms, and posting goals.',
        how: 'AI plans a content strategy around your niche, then generates individual posts for each day. Fully editable before publishing.',
      },
      {
        name: 'AI Image Generation',
        emoji: '🎨',
        credits: '25 credits',
        proOnly: true,
        what: 'Generate custom images for your posts directly inside SocialMate.',
        how: 'Powered by Google Gemini image models. Generated images can be added directly to your scheduled post.',
      },
    ],
  },
  {
    category: 'Growth Intelligence',
    emoji: '📡',
    desc: 'Real data from Reddit and YouTube — trend scanning, growth analysis, and gap detection.',
    features: [
      {
        name: 'SM-Pulse',
        emoji: '🔥',
        credits: '10 credits per scan',
        proOnly: false,
        what: 'Scans Reddit and YouTube in real time to surface what is trending in your niche right now.',
        how: 'Analyzes trending topics, viral post formats, and engagement spikes. Returns top 3 trending topics, 3 content angles, 10 hashtags, and the best platform to post on right now.',
      },
      {
        name: 'SM-Radar',
        emoji: '📊',
        credits: '10 credits per report',
        proOnly: false,
        what: 'Analyzes real trending data to surface content gaps, competitor weaknesses, and your single best content strategy this week.',
        how: 'Pulls from live Reddit and YouTube data to identify what topics are being asked about but not answered well, and hands you a concrete opportunity to act on.',
      },
      {
        name: 'Content Gap Detector',
        emoji: '🕳️',
        credits: '10 credits',
        proOnly: false,
        what: 'Spots underserved topics and missing content in your niche so you can create what nobody else is making.',
        how: 'Analyzes your niche and surfaces content gaps, audience questions going unanswered, and underused formats — each scored for ease and reach potential.',
      },
    ],
  },
  {
    category: 'Scheduling & Automation',
    emoji: '🗓️',
    desc: 'Schedule across 16 platforms from one place. Bulk upload, evergreen recycling, and automated queues.',
    features: [
      {
        name: 'Bulk Scheduler',
        emoji: '📦',
        credits: 'Free',
        proOnly: false,
        what: 'Schedule dozens of posts at once instead of one at a time.',
        how: 'Posts are queued and distributed across your selected timeframe. Manual bulk scheduling is always free on every plan.',
      },
      {
        name: 'Evergreen Content Recycling',
        emoji: '♻️',
        credits: 'Free',
        proOnly: false,
        what: 'Mark your best posts as evergreen and they automatically re-queue when your schedule goes empty.',
        how: 'Toggle any published post as evergreen from your post history. SocialMate re-schedules it automatically so your content never goes cold.',
      },
      {
        name: 'RSS / Blog Import',
        emoji: '📡',
        credits: 'Free',
        proOnly: false,
        what: 'Pull posts from any RSS or Atom feed and turn them into scheduled social posts in one click.',
        how: 'Paste any RSS feed URL — blog posts, podcasts, YouTube channels, newsletters. Select which items to import and they save as drafts ready to edit and schedule.',
      },
      {
        name: 'Content Approval Workflows',
        emoji: '✅',
        credits: 'Free',
        proOnly: true,
        what: 'Let team members submit posts for admin review before they go live.',
        how: 'Team members submit posts to a review queue. Admins approve or reject from the Approvals page. Approved posts move to drafts for scheduling.',
      },
      {
        name: 'Best Time to Post',
        emoji: '⏰',
        credits: 'Free',
        proOnly: false,
        what: 'See when your audience is most active so you can schedule posts for maximum reach.',
        how: 'Pulled from your connected account analytics. Displayed on your dashboard and suggested during scheduling.',
      },
      {
        name: 'Platform Requirement Guard',
        emoji: '🛡️',
        credits: 'Always free',
        proOnly: false,
        what: 'Automatically warns you if your post violates a platform\'s rules before it goes live.',
        how: 'Checks every post against known platform limits for character counts, video length, file size, and hashtag caps — before scheduling.',
      },
    ],
  },
  {
    category: 'Creator Tools',
    emoji: '🛠️',
    desc: 'The tools that make your workflow faster — templates, media, hashtags, and your bio page.',
    features: [
      {
        name: 'Link in Bio Page',
        emoji: '🔗',
        credits: 'Free',
        proOnly: false,
        what: 'A clean, shareable bio page that houses all your links — like Linktree, built into SocialMate at no cost.',
        how: 'Fully customizable from your dashboard. Custom themes, button styles, social icons, and a public URL included free. Pro users can connect a custom domain. Earn a custom domain free by referring 3 paying users.',
      },
      {
        name: 'Post Template Library',
        emoji: '📁',
        credits: 'Free',
        proOnly: false,
        what: 'Save your best post formats as reusable templates so you never start from scratch.',
        how: 'Templates are stored in your account. Load any template into the Compose editor with one click.',
      },
      {
        name: 'Media Library',
        emoji: '🗃️',
        credits: 'Free',
        proOnly: false,
        what: 'Store and organize your images and videos inside SocialMate for quick access when scheduling.',
        how: 'Free tier: 1 GB. Pro: 10 GB. Agency: 50 GB. Upload once, attach to any post.',
      },
      {
        name: 'Hashtag Collections',
        emoji: '🏷️',
        credits: 'Free',
        proOnly: false,
        what: 'Save groups of hashtags and apply them to posts with one click.',
        how: 'Create unlimited named hashtag groups. Inject any collection into your post while composing.',
      },
    ],
  },
  {
    category: 'Analytics',
    emoji: '📊',
    desc: 'Real data from your posting activity — no fake metrics, no inflated numbers.',
    features: [
      {
        name: 'Analytics Dashboard',
        emoji: '📈',
        credits: 'Free',
        proOnly: false,
        what: 'Track your posting activity, platform breakdown, streak, peak times, and consistency score — all in one place.',
        how: 'Pulls from your post history to calculate daily activity charts, best days and times, monthly breakdowns, and a consistency score out of 100.',
      },
      {
        name: 'Analytics History',
        emoji: '🗂️',
        credits: 'Free / Credits',
        proOnly: false,
        what: '14-day and 30-day history free on all plans. 90-day free on Pro. 6-month free on Agency.',
        how: 'Free plan can unlock 90-day view for 2 credits. Pro can unlock 6-month for 2 credits. Agency gets full 6-month history at no extra cost.',
      },
      {
        name: 'PDF Analytics Reports',
        emoji: '📄',
        credits: 'Free',
        proOnly: true,
        what: 'Export a full analytics report as a PDF — post counts, engagement, platform breakdown, peak times, and more.',
        how: 'One click from the Analytics page. Generates a clean, branded report you can share with clients or keep for your records.',
      },
    ],
  },
  {
    category: 'Competitive Intelligence',
    emoji: '🔭',
    desc: 'Track competitors, monitor your inbox, and stay ahead of what\'s happening in your niche.',
    features: [
      {
        name: 'Competitor Tracking',
        emoji: '🔭',
        credits: 'Free',
        proOnly: false,
        what: 'Track up to 3 competitor accounts across platforms — available on every plan including free.',
        how: 'Add competitors by name, platform, and handle. Pair with SM-Pulse to scan what\'s trending in their niche and get ahead of them.',
      },
      {
        name: 'Social Inbox',
        emoji: '📬',
        credits: 'Free',
        proOnly: false,
        what: 'Comments and mentions from all your connected platforms — in one unified inbox.',
        how: 'Filter by platform, type (comment, mention, DM), and read/unread status. Click any message to mark it read. Live sync coming soon.',
      },
    ],
  },
  {
    category: 'Team & Agency',
    emoji: '👥',
    desc: 'Collaborate with your team, manage clients, and control access — all built in.',
    features: [
      {
        name: 'Team Management',
        emoji: '👤',
        credits: 'Free',
        proOnly: false,
        what: 'Invite team members, assign roles, and manage who can post, draft, or admin your account.',
        how: 'Free: 2 seats. Pro: 5 seats. Agency: 15 seats. Seat limits are enforced automatically.',
      },
      {
        name: 'Client Workspaces',
        emoji: '🏢',
        credits: 'Free',
        proOnly: true,
        what: 'Separate workspaces for each client — fully isolated content, platforms, and settings.',
        how: 'Agency plan includes full workspace management. Switch between client accounts from the sidebar workspace switcher.',
      },
      {
        name: 'White Label',
        emoji: '🏷️',
        credits: '+$20/mo or +$40/mo add-on',
        proOnly: true,
        what: 'Remove all SocialMate branding and replace it with your own logo, colors, and domain.',
        how: 'White Label Basic ($20/mo): logo + colors + brand name. White Label Pro ($40/mo): everything in Basic plus a custom domain so clients never see SocialMate.',
      },
    ],
  },
]

const CREDIT_SUMMARY = [
  { name: 'Caption Generator',    cost: '3 cr',  proOnly: false },
  { name: 'Hashtag Generator',    cost: '2 cr',  proOnly: false },
  { name: 'Post Rewrite',         cost: '3 cr',  proOnly: false },
  { name: 'Viral Hook',           cost: '4 cr',  proOnly: false },
  { name: 'Thread Generator',     cost: '8 cr',  proOnly: false },
  { name: 'Content Repurposer',   cost: '8 cr',  proOnly: false },
  { name: 'Post Score',           cost: '2 cr',  proOnly: false },
  { name: 'SM-Pulse',             cost: '10 cr', proOnly: false },
  { name: 'SM-Radar',             cost: '10 cr', proOnly: false },
  { name: 'Content Gap',          cost: '10 cr', proOnly: false },
  { name: 'AI Content Calendar',  cost: '20 cr', proOnly: true  },
  { name: 'AI Image Generation',  cost: '25 cr', proOnly: true  },
]

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...FEATURE_CATEGORIES.map(c => c.category)]
  const filtered = activeCategory === 'All'
    ? FEATURE_CATEGORIES
    : FEATURE_CATEGORIES.filter(c => c.category === activeCategory)

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Full feature set</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Everything SocialMate can do</h1>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Every tool, every feature, exactly what it does, and what it costs.
            Scheduling is always free. AI features use credits so you stay in control of what you spend.
          </p>
        </div>

        {/* CREDIT QUICK REFERENCE */}
        <div className="bg-black text-white rounded-2xl p-6 mb-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">AI Credit Quick Reference</p>
              <p className="text-sm font-extrabold">12 tools — 100 credits free every month</p>
            </div>
            <Link href="/pricing" className="text-xs font-bold text-gray-400 hover:text-white transition-all flex-shrink-0">
              See pricing →
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {CREDIT_SUMMARY.map(tool => (
              <div key={tool.name} className="bg-white/10 rounded-xl p-2.5 text-center relative">
                {tool.proOnly && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-full">Pro+</span>
                )}
                <p className="text-xs font-bold text-white leading-snug mb-1">{tool.name}</p>
                <p className="text-xs text-gray-400 font-bold">{tool.cost}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Credits refresh monthly. Unused credits bank — Free banks 150, Pro 750, Agency 3,000.</p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* FEATURE SECTIONS */}
        {filtered.map(section => (
          <div key={section.category} className="mb-14">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <h2 className="text-base font-extrabold tracking-tight">{section.category}</h2>
              </div>
            </div>
            {section.desc && (
              <p className="text-xs text-gray-500 mb-5 ml-8">{section.desc}</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {section.features.map(f => (
                <div key={f.name}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">{f.emoji}</span>
                      <h3 className="text-sm font-extrabold">{f.name}</h3>
                      {f.proOnly && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">Pro+</span>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                      f.credits === 'Free' || f.credits === 'Always free'
                        ? 'bg-green-50 text-green-600'
                        : f.credits.includes('add-on')
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-black text-white'
                    }`}>
                      {f.credits}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">What it does</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{f.what}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">How it works</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{f.how}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* PLATFORM NOTE */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="text-sm font-extrabold mb-1">Platform support — 16 total</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                4 platforms are live right now. LinkedIn, YouTube, Pinterest, and Reddit are coming very soon — code complete, awaiting platform approval. 8 more are on the roadmap.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Discord',   icon: '💬', status: 'live'    },
                  { name: 'Bluesky',   icon: '🦋', status: 'live'    },
                  { name: 'Telegram',  icon: '✈️', status: 'live'    },
                  { name: 'Mastodon',  icon: '🐘', status: 'live'    },
                  { name: 'LinkedIn',  icon: '💼', status: 'soon'    },
                  { name: 'YouTube',   icon: '▶️', status: 'soon'    },
                  { name: 'Pinterest', icon: '📌', status: 'soon'    },
                  { name: 'Reddit',    icon: '🤖', status: 'soon'    },
                  { name: 'Instagram', icon: '📸', status: 'planned' },
                  { name: 'TikTok',    icon: '🎵', status: 'planned' },
                  { name: 'Facebook',  icon: '📘', status: 'planned' },
                  { name: 'Threads',   icon: '🧵', status: 'planned' },
                ].map(p => (
                  <div key={p.name} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    p.status === 'live'    ? 'bg-green-50 text-green-700 border border-green-200' :
                    p.status === 'soon'    ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-white text-gray-400 border border-gray-100'
                  }`}>
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                    {p.status === 'live' && <span className="font-bold">✓</span>}
                    {p.status === 'soon' && <span className="text-blue-400 font-bold">Soon</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="bg-black rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-2">Ready to get started?</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            All of this — free to start. No credit card required. 100 AI credits activate after your first post.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup"
              className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all w-full sm:w-auto text-center">
              Start for free →
            </Link>
            <Link href="/pricing"
              className="border border-gray-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:border-gray-400 transition-all w-full sm:w-auto text-center">
              Compare plans →
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
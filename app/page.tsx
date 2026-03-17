import Link from 'next/link'
import ReferralBanner from '@/app/components/ReferralBanner'

const PLATFORMS = [
  { name: 'Discord',     icon: '💬', status: 'live'    },
  { name: 'Bluesky',     icon: '🦋', status: 'live'    },
  { name: 'Telegram',    icon: '✈️', status: 'live'    },
  { name: 'Mastodon',    icon: '🐘', status: 'live'    },
  { name: 'LinkedIn',    icon: '💼', status: 'soon'    },
  { name: 'YouTube',     icon: '▶️', status: 'soon'    },
  { name: 'Pinterest',   icon: '📌', status: 'soon'    },
  { name: 'Reddit',      icon: '🤖', status: 'soon'    },
  { name: 'Instagram',   icon: '📸', status: 'planned' },
  { name: 'TikTok',      icon: '🎵', status: 'planned' },
  { name: 'Facebook',    icon: '📘', status: 'planned' },
  { name: 'Threads',     icon: '🧵', status: 'planned' },
  { name: 'X / Twitter', icon: '🐦', status: 'planned' },
  { name: 'Snapchat',    icon: '👻', status: 'planned' },
  { name: 'Lemon8',      icon: '🍋', status: 'planned' },
  { name: 'BeReal',      icon: '📷', status: 'planned' },
]

const AI_TOOLS = [
  { name: 'Caption Generator',    emoji: '✍️',  credits: '3 credits',      proOnly: false },
  { name: 'Hashtag Generator',    emoji: '#️⃣', credits: '2 credits',      proOnly: false },
  { name: 'Post Rewriter',        emoji: '🔁',  credits: '3 credits',      proOnly: false },
  { name: 'Viral Hook Generator', emoji: '🎣',  credits: '4 credits',      proOnly: false },
  { name: 'Thread Generator',     emoji: '🧵',  credits: '8 credits',      proOnly: false },
  { name: 'Content Repurposer',   emoji: '♻️',  credits: '8 credits',      proOnly: false },
  { name: 'Post Score',           emoji: '⚡',  credits: '2 credits',      proOnly: false },
  { name: 'SM-Pulse',             emoji: '🔥',  credits: '10 credits',     proOnly: false },
  { name: 'SM-Radar',             emoji: '📊',  credits: '10 credits',     proOnly: false },
  { name: 'Content Gap Detector', emoji: '🕳️', credits: '10 credits',     proOnly: false },
  { name: 'AI Content Calendar',  emoji: '📅',  credits: '20 cr · Pro+',   proOnly: true  },
  { name: 'AI Image Generation',  emoji: '🎨',  credits: '25 cr · Pro+',   proOnly: true  },
]

const FEATURES = [
  {
    icon: '📅',
    title: 'Smart Scheduling',
    desc: 'Schedule across 16 platforms from one place. Bulk upload, drag-and-drop, automated queues, and platform-specific character limit enforcement.',
  },
  {
    icon: '🤖',
    title: '12 AI Tools Built In',
    desc: 'Generate captions, hashtags, viral hooks, full threads, content calendars, and post scores — all powered by Google Gemini.',
  },
  {
    icon: '📊',
    title: 'Real Analytics',
    desc: 'Posting streaks, platform breakdown, best days and times, consistency scores, and engagement tracking. No fake metrics.',
  },
  {
    icon: '🔗',
    title: 'Link in Bio Builder',
    desc: 'A free Linktree alternative built right in. Custom themes, button styles, social icons, and a public URL — included on every plan.',
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    desc: 'Invite team members, assign roles, manage access, and run content approval workflows. Free plan includes 2 seats.',
  },
  {
    icon: '🏢',
    title: 'Client Workspaces',
    desc: 'Agency plan includes separate workspaces per client, PDF reports, competitor tracking, and full account isolation.',
  },
  {
    icon: '♻️',
    title: 'Evergreen Recycling',
    desc: 'Mark your best posts as evergreen and they automatically re-queue when your schedule goes empty.',
  },
  {
    icon: '📡',
    title: 'RSS / Blog Import',
    desc: 'Pull posts from any RSS or Atom feed and turn them into scheduled social posts in one click.',
  },
  {
    icon: '🔭',
    title: 'Competitor Tracking',
    desc: 'Track up to 3 competitor accounts across platforms on any plan — see what they\'re doing before you post.',
  },
]

const FOOTER_LINKS = [
  { label: 'Features',  href: '/features'        },
  { label: 'Pricing',   href: '/pricing'          },
  { label: 'Affiliate', href: '/affiliate'        },
  { label: 'Our Story', href: '/story'            },
  { label: 'Blog',      href: '/blog'             },
  { label: 'Privacy',   href: '/privacy'          },
  { label: 'Terms',     href: '/terms'            },
  { label: 'Admin',     href: '/admin/affiliates' },
]

const COMPARISON = [
  { tool: 'Buffer',     price: '$18/mo', features: '5 platforms, basic analytics'             },
  { tool: 'Hootsuite',  price: '$99/mo', features: '10 platforms, team tools, AI'             },
  { tool: 'Later',      price: '$25/mo', features: '6 platforms, link in bio, limited AI'     },
  { tool: 'SocialMate', price: '$5/mo',  features: '16 platforms, all AI tools, link in bio', highlight: true },
]

export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = await searchParams
  const refCode = params?.ref || ''

  const live    = PLATFORMS.filter(p => p.status === 'live')
  const soon    = PLATFORMS.filter(p => p.status === 'soon')
  const planned = PLATFORMS.filter(p => p.status === 'planned')

  return (
    <div className="min-h-screen bg-white">

      {refCode && <ReferralBanner refCode={refCode} />}

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features',  href: '/features'  },
              { label: 'Pricing',   href: '/pricing'   },
              { label: 'Platforms', href: '#platforms' },
              { label: 'Our Story', href: '/story'     },
            ].map(link => (
              <Link key={link.label} href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-all">Sign in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
          🌱 Free forever · No credit card required · 16 platforms · 12 AI tools included
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Automate your content.<br />
          <span className="text-gray-400">Accelerate your growth.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          SocialMate is the AI-powered social media scheduler built for creators, small businesses, and agencies.
          16 platforms. 12 AI tools. A free plan that puts $99/month tools to shame.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href="/signup"
            className="bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base w-full sm:w-auto text-center">
            Create free account →
          </Link>
          <Link href="/pricing"
            className="text-gray-500 font-semibold hover:text-black transition-all text-base">
            See pricing →
          </Link>
        </div>
        <p className="text-xs text-gray-400">No card required · Free forever · Setup in 60 seconds</p>

        {/* STAT ROW */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
          {[
            { value: '16',    label: 'Platforms supported'        },
            { value: '12',    label: 'AI tools included'          },
            { value: '$0',    label: 'To get started'             },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FREE TIER CALLOUT */}
      <section className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Free plan — no catch</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Most tools charge for this. We don't.</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              SocialMate's free plan is designed to be genuinely useful — not a demo.
              Here's exactly what you get at $0/month.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '🤖', value: '100',    label: 'AI credits / month'           },
              { icon: '📅', value: '2 weeks',label: 'Scheduling window'            },
              { icon: '👥', value: '2',       label: 'Team seats included'         },
              { icon: '💾', value: '1 GB',    label: 'Media storage'               },
              { icon: '📝', value: '100',     label: 'Posts / month'               },
              { icon: '📊', value: '30 days', label: 'Analytics history'           },
              { icon: '🔗', value: 'Free',    label: 'Link in Bio page'            },
              { icon: '🔭', value: '3',       label: 'Competitor accounts tracked' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-lg font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/signup"
              className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
              Start free — no card needed →
            </Link>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section id="platforms" className="border-t border-gray-100 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Platform support</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">16 platforms. One dashboard.</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              4 platforms live now. LinkedIn, YouTube, Pinterest and Reddit coming very soon. 8 more planned.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 text-center">✅ Live now</p>
              <div className="flex flex-wrap justify-center gap-3">
                {live.map(p => (
                  <div key={p.name} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-200 rounded-xl text-sm font-bold text-gray-800">
                    <span>{p.icon}</span>{p.name}
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Live</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 text-center mt-4">🔜 Coming very soon</p>
              <div className="flex flex-wrap justify-center gap-3">
                {soon.map(p => (
                  <div key={p.name} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-xl text-sm font-semibold text-gray-600">
                    <span>{p.icon}</span>{p.name}
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Soon</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center mt-4">📋 Planned</p>
              <div className="flex flex-wrap justify-center gap-3">
                {planned.map(p => (
                  <div key={p.name} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-400">
                    <span>{p.icon}</span>{p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI-Powered</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">12 AI tools built in</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Every tool runs on Google Gemini. 100 credits included free every month — no subscription required to use them.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {AI_TOOLS.map(tool => (
              <div key={tool.name}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-300 transition-all relative">
                {tool.proOnly && (
                  <span className="absolute top-2 right-2 text-xs font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">Pro+</span>
                )}
                <div className="text-2xl mb-2">{tool.emoji}</div>
                <p className="text-xs font-bold leading-snug mb-1">{tool.name}</p>
                <p className="text-xs text-gray-400">{tool.credits}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-black rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-lg">SM-Pulse</p>
                  <p className="text-xs text-gray-400">Real-time trend intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full flex-shrink-0">10 credits</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scans Reddit and YouTube right now to surface trending topics, viral formats, and engagement spikes in your niche — before you create your next post.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-lg">SM-Radar</p>
                  <p className="text-xs text-gray-400">Personal growth intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-gray-200 text-gray-600 rounded-full flex-shrink-0">10 credits</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Analyzes real trending data to surface content gaps, competitor weaknesses, and the single best content strategy for your niche this week.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/ai-features"
              className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              See all 12 AI tools →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Full feature set</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Everything you need to grow</h2>
            <p className="text-sm text-gray-500">Every feature that matters. Most available free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-extrabold mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How we compare</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Other tools charge per channel. We don't.</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Managing 10 platforms on Buffer or Hootsuite costs $60–100/month. SocialMate gives you all 16 free — with AI on top.
            </p>
          </div>
          <div className="space-y-3">
            {COMPARISON.map((row, i) => (
              <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border-2 ${
                row.highlight ? 'border-black bg-black text-white' : 'border-gray-100 bg-white'
              }`}>
                <div className="flex items-center gap-4">
                  <p className={`text-sm font-extrabold w-28 ${row.highlight ? 'text-white' : 'text-gray-900'}`}>{row.tool}</p>
                  <p className={`text-xs ${row.highlight ? 'text-gray-300' : 'text-gray-500'}`}>{row.features}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-extrabold ${row.highlight ? 'text-white' : 'text-gray-900'}`}>{row.price}</p>
                  {row.highlight && <p className="text-xs text-gray-400">or free</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing"
              className="inline-block bg-black text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm">
              See full pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* LINK IN BIO */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-4">
                Free bio link builder
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Link in Bio —<br />included free
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Standalone bio link tools charge $10–20/month for what we include free.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  'Custom themes and button styles',
                  'Social profile icons',
                  'Your own public URL',
                  'Custom domain — earn it via referrals or upgrade to Pro',
                  'No SocialMate branding on Pro+',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/signup"
                className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
                Create your free bio page →
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="bg-gray-900 rounded-xl p-6 text-white text-center">
                <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-2xl mx-auto mb-3">👤</div>
                <p className="font-bold text-sm mb-1">Your Name</p>
                <p className="text-xs text-gray-400 mb-4">Your bio goes here</p>
                <div className="space-y-2">
                  {['🌐  My Website', '📝  Latest Post', '📬  Contact Me'].map(link => (
                    <div key={link} className="bg-white text-gray-900 text-xs font-bold py-2 px-4 rounded-lg">{link}</div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4">Made with SocialMate · Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Early access</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Be part of the first wave</h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-12">
            SocialMate is in active development — built in public, with real users, shaped by real feedback.
            The people who join now help decide what gets built next.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: '🛠',
                title: 'Built with early users',
                desc: 'Your feedback directly shapes features, priorities, and the roadmap. Not a suggestion box — actual influence.',
              },
              {
                icon: '🔒',
                title: 'Locked-in limits',
                desc: 'Join now and lock in current plan limits. If we ever change pricing, early users are grandfathered.',
              },
              {
                icon: '🗺️',
                title: "Shape what's next",
                desc: 'Vote on features, request integrations, and see your ideas ship. Early users get direct founder access.',
              },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-gray-300 transition-all">
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-sm font-extrabold mb-2">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/signup"
            className="inline-block bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            Join early access — it's free →
          </Link>
        </div>
      </section>

      {/* STORY TEASER */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why we built this</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">
            Professional tools shouldn't require<br />a professional budget.
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
            SocialMate is fully bootstrapped — built solo, across every role, with no investors and no safety net.
            The belief driving it is simple: creators and small businesses deserve access to tools that actually work,
            at a price that doesn't require a business budget to justify.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/story"
              className="text-sm font-bold text-black underline hover:opacity-70 transition-all">
              Read the full story →
            </Link>
            <Link href="/pricing"
              className="text-sm font-semibold text-gray-500 hover:text-black transition-all">
              See how pricing works →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8 text-sm max-w-lg mx-auto">
            Free forever. No card required. 100 AI credits on your first post. Set up in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-base w-full sm:w-auto text-center">
              Create free account →
            </Link>
            <Link href="/pricing"
              className="text-gray-400 font-semibold hover:text-white transition-all text-sm">
              Compare plans →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-black text-xs font-bold">S</div>
            <span className="text-sm font-bold text-white">SocialMate</span>
            <span className="text-xs text-gray-600 ml-2">by Gilgamesh Enterprise LLC</span>
          </div>
          <nav className="flex items-center gap-5 flex-wrap">
            {FOOTER_LINKS.map(link => (
              <Link key={link.label} href={link.href}
                className={`text-xs hover:text-white transition-all ${
                  link.label === 'Admin' ? 'text-black select-none' : 'text-gray-500'
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-600">© 2026 SocialMate</p>
        </div>
      </footer>

    </div>
  )
}
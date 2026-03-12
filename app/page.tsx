import Link from 'next/link'

const PLATFORMS = [
  { name: 'Instagram',  icon: '📸', status: 'soon'      },
  { name: 'LinkedIn',   icon: '💼', status: 'available' },
  { name: 'YouTube',    icon: '▶️', status: 'available' },
  { name: 'Pinterest',  icon: '📌', status: 'available' },
  { name: 'Bluesky',    icon: '🦋', status: 'available' },
  { name: 'Reddit',     icon: '🤖', status: 'available' },
  { name: 'Discord',    icon: '💬', status: 'available' },
  { name: 'Telegram',   icon: '✈️', status: 'available' },
  { name: 'Mastodon',   icon: '🐘', status: 'available' },
  { name: 'TikTok',     icon: '🎵', status: 'soon'      },
  { name: 'Facebook',   icon: '📘', status: 'soon'      },
  { name: 'Threads',    icon: '🧵', status: 'soon'      },
  { name: 'X / Twitter',icon: '🐦', status: 'planned'   },
  { name: 'Snapchat',   icon: '👻', status: 'planned'   },
  { name: 'Lemon8',     icon: '🍋', status: 'planned'   },
  { name: 'BeReal',     icon: '📷', status: 'planned'   },
]

const AI_TOOLS = [
  { name: 'Caption Generator',          emoji: '✍️',  credits: '1 credit'    },
  { name: 'Hashtag Generator',          emoji: '#️⃣', credits: '1 credit'    },
  { name: 'Post Rewriter',              emoji: '🔁',  credits: '1 credit'    },
  { name: 'Viral Hook Generator',       emoji: '🎣',  credits: '2 credits'   },
  { name: 'SM-Pulse Trend Scanner',     emoji: '🔥',  credits: '5 credits'   },
  { name: 'SM-Radar Growth Report',     emoji: '📊',  credits: '3 credits'   },
  { name: '30-Day AI Content Calendar', emoji: '📅',  credits: '20 cr · Pro+' },
  { name: 'Content Repurposer',         emoji: '♻️',  credits: '3 credits'   },
  { name: 'Thread Generator',           emoji: '🧵',  credits: '3 credits'   },
  { name: 'AI Image Generation',        emoji: '🎨',  credits: '25 cr · Pro+' },
]

const FEATURES = [
  { icon: '📅', title: 'Smart Scheduling',   desc: 'Schedule to 16 platforms from one place. Bulk upload, queues, drag-and-drop calendar.' },
  { icon: '🤖', title: 'AI Caption Tools',    desc: 'Generate captions, hashtags, viral hooks, and full thread scripts with one click.' },
  { icon: '📊', title: 'Real Analytics',      desc: 'Track what\'s working. Posting streaks, platform breakdown, best times, consistency scores.' },
  { icon: '🔗', title: 'Link in Bio Builder', desc: 'Free Linktree alternative built right in. Your public URL, your links, your style.' },
  { icon: '👥', title: 'Team Collaboration',  desc: 'Invite team members, assign roles, manage access. Up to 50 seats on Agency.' },
  { icon: '🏢', title: 'Client Workspaces',   desc: 'Agency plan includes separate workspaces for each client. Full isolation, clean reporting.' },
]

const FOOTER_LINKS = [
  { label: 'Features',  href: '/features'  },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Affiliate', href: '/affiliate' },
  { label: 'Referral',  href: '/referral'  },
  { label: 'Our Story', href: '/story'     },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Privacy',   href: '/privacy'   },
  { label: 'Terms',     href: '/terms'     },
]

export default function Home() {
  const available = PLATFORMS.filter(p => p.status === 'available')
  const soon      = PLATFORMS.filter(p => p.status === 'soon')
  const planned   = PLATFORMS.filter(p => p.status === 'planned')

  return (
    <div className="min-h-screen bg-white">

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
              { label: 'AI Tools',  href: '/features'  },
              { label: 'Platforms', href: '#platforms' },
              { label: 'Pricing',   href: '/pricing'   },
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
          🌱 Free forever · No credit card · 16 platforms · AI tools included
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          Automate your content.<br />
          <span className="text-gray-400">Accelerate your growth.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          SocialMate is the AI-powered social media scheduler built for creators, small businesses, and agencies.
          16 platforms. AI tools that actually save time. A free plan that puts paid tools to shame.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base">
            Create free account →
          </Link>
          <Link href="/features" className="text-gray-500 font-semibold hover:text-black transition-all text-base">
            See all features →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No card required · Free forever · Takes 60 seconds</p>
      </section>

      {/* PLATFORMS */}
      <section id="platforms" className="border-t border-gray-100 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
            16 PLATFORMS — {available.length} AVAILABLE NOW · MORE LAUNCHING SOON
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {available.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                <span>{p.icon}</span>{p.name}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {soon.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-500">
                <span>{p.icon}</span>{p.name}
                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Soon</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {planned.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-400">
                <span>{p.icon}</span>{p.name}
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Planned</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING COMPARISON */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-black rounded-3xl p-10 text-white text-center">
            <h2 className="text-2xl font-extrabold mb-2">Other tools charge per channel. We don't.</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
              The standard is to charge for every platform you connect. Managing 10 platforms can cost $60–100/month.
              SocialMate gives you all 16 platforms free — and throws in AI tools on top.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-2xl p-5">
                <p className="text-2xl font-extrabold">$18/mo</p>
                <p className="text-xs text-gray-400 mt-1">Standard scheduling tools</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-5">
                <p className="text-2xl font-extrabold">$99/mo</p>
                <p className="text-xs text-gray-400 mt-1">Enterprise-tier tools</p>
              </div>
              <div className="bg-white rounded-2xl p-5">
                <p className="text-2xl font-extrabold text-black">$5/mo</p>
                <p className="text-xs text-gray-500 mt-1">SocialMate Pro</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup" className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm">
                Start for free →
              </Link>
              <Link href="/pricing" className="text-gray-400 font-semibold hover:text-white transition-all text-sm">
                See full pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI-Powered</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Tools that write for you</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Every AI tool runs on Google Gemini. Credits are included with every plan — free users get 50/month.
            </p>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-8">
            {AI_TOOLS.map(tool => (
              <div key={tool.name} className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-300 transition-all">
                <div className="text-2xl mb-2">{tool.emoji}</div>
                <p className="text-xs font-bold leading-snug mb-1">{tool.name}</p>
                <p className="text-xs text-gray-400">{tool.credits}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-extrabold">SM-Pulse</p>
                  <p className="text-xs text-gray-400">Trend Intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full">5 credits</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scans trending hashtags, viral formats, and engagement spikes in your niche before you create your next post.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-extrabold">SM-Radar</p>
                  <p className="text-xs text-gray-400">Personal Growth Intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">3 credits</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Analyzes your own post history to surface your best times, top content formats, and audience engagement patterns.
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/features" className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              See all AI tools →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Everything you need</h2>
            <p className="text-sm text-gray-500">Every feature that matters. None locked behind a paywall.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
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

      {/* EARLY ACCESS */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Be part of the first wave</h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-12">
            SocialMate is in early access. Built in public, with real users, based on real feedback.
            The people who join now shape what this becomes.
          </p>
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { icon: '🛠',  title: 'Built with early users',  desc: 'Your feedback directly shapes features, priorities, and the roadmap.' },
              { icon: '🔒', title: 'Locked-in limits',         desc: 'Join now and lock in current plan limits forever. Grandfathered if we ever change pricing.' },
              { icon: '🗺️', title: 'Shape what\'s next',      desc: 'Early users directly influence which features get built first. Your feedback matters most.' },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 text-left">
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-sm font-extrabold mb-2">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/signup" className="inline-block bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            Join early access →
          </Link>
        </div>
      </section>

      {/* LINK IN BIO */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-4">
                Free bio link builder
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Link in Bio —<br />included free
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Standalone bio link tools charge $10–20/month for what we include free. Custom themes,
                button styles, social icons, and a public URL — all built into SocialMate at no cost.
              </p>
              <Link href="/signup" className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
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

      {/* STORY TEASER */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">WHY WE BUILT THIS</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">
            Professional tools shouldn't require<br />a professional budget.
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
            SocialMate is bootstrapped — built by one person who works at a deli and codes in every spare moment.
            The belief is simple: the best version of a tool should be accessible to everyone.
            Not just those who can already afford it.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/story" className="text-sm font-bold text-black underline hover:opacity-70 transition-all">
              Read the full story →
            </Link>
            <Link href="/pricing" className="text-sm font-semibold text-gray-500 hover:text-black transition-all">
              See how pricing works →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-sm font-bold">SocialMate</span>
          </div>
          <nav className="flex items-center gap-5 flex-wrap">
            {FOOTER_LINKS.map(link => (
              <Link key={link.label} href={link.href} className="text-xs text-gray-400 hover:text-black transition-all">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-400">© 2026 SocialMate</p>
        </div>
      </footer>

    </div>
  )
}
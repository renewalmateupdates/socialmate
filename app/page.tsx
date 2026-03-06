import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate — Free Social Media Scheduler + AI Tools for 16 Platforms',
  description: 'Schedule posts across 16 platforms, generate AI captions, scan trends, and grow your audience — free. No per-channel fees. No post limits. No catch.',
  openGraph: {
    title: 'SocialMate — Free Social Media Scheduler + AI Tools for 16 Platforms',
    description: 'Schedule posts across 16 platforms, generate AI captions, scan trends, and grow your audience — free.',
    url: 'https://socialmate.app',
  },
}

const FEATURES = [
  { icon: '📅', title: 'Content Calendar',     desc: 'Drag and drop to reschedule posts. See your entire month at a glance. Free.' },
  { icon: '✏️', title: 'Compose & Schedule',   desc: 'Write once, post everywhere. Templates, hashtags, and media all built in.' },
  { icon: '📆', title: 'Bulk Scheduler',        desc: 'Schedule 50+ posts at once with auto date-fill. No paid plan required.' },
  { icon: '🤖', title: 'AI Caption Generator', desc: '100 free AI credits every month. Generate captions, hashtags, rewrites, hooks, and more.' },
  { icon: '🔥', title: 'SM-Pulse Trends',       desc: 'Scan what\'s trending in your niche before you create your next post. 5 credits.' },
  { icon: '📡', title: 'SM-Radar Insights',     desc: 'AI analysis of your own content — best times, top formats, engagement patterns. 3 credits.' },
  { icon: '🖼️', title: 'Media Library',         desc: 'Upload and organize all your images and videos in one place.' },
  { icon: '🔗', title: 'Link in Bio',           desc: 'A full bio link builder included free. No separate app. No monthly fee.' },
  { icon: '📊', title: 'Real Analytics',        desc: 'Posting frequency, best times, platform breakdown — all from your real data.' },
  { icon: '#️⃣', title: 'Hashtag Collections',  desc: 'Save hashtag groups and insert them into any post in one click.' },
  { icon: '👥', title: 'Team Collaboration',    desc: 'Invite team members, assign roles, collaborate on content. Free up to 2 seats.' },
  { icon: '🎁', title: 'Referral Program',      desc: 'Refer a friend and you both earn 25 AI credits. They upgrade — you get a free month.' },
]

const PLATFORMS = [
  { icon: '📸', name: 'Instagram',   status: 'soon'      },
  { icon: '💼', name: 'LinkedIn',    status: 'available' },
  { icon: '▶️', name: 'YouTube',     status: 'available' },
  { icon: '📌', name: 'Pinterest',   status: 'available' },
  { icon: '🦋', name: 'Bluesky',     status: 'available' },
  { icon: '🤖', name: 'Reddit',      status: 'available' },
  { icon: '💬', name: 'Discord',     status: 'available' },
  { icon: '✈️', name: 'Telegram',    status: 'available' },
  { icon: '🐘', name: 'Mastodon',    status: 'available' },
  { icon: '🎵', name: 'TikTok',      status: 'soon'      },
  { icon: '📘', name: 'Facebook',    status: 'soon'      },
  { icon: '🧵', name: 'Threads',     status: 'soon'      },
  { icon: '🐦', name: 'X / Twitter', status: 'planned'   },
  { icon: '👻', name: 'Snapchat',    status: 'planned'   },
  { icon: '🍋', name: 'Lemon8',      status: 'planned'   },
  { icon: '📷', name: 'BeReal',      status: 'planned'   },
]

const AI_TOOLS = [
  { icon: '✍️', name: 'Caption Generator',       cost: '1 credit'  },
  { icon: '#️⃣', name: 'Hashtag Generator',       cost: '1 credit'  },
  { icon: '🔁', name: 'Post Rewriter',            cost: '1 credit'  },
  { icon: '🎣', name: 'Viral Hook Generator',     cost: '2 credits' },
  { icon: '🔥', name: 'SM-Pulse Trend Scanner',   cost: '5 credits' },
  { icon: '📡', name: 'SM-Radar Growth Report',   cost: '3 credits' },
  { icon: '📅', name: '30-Day AI Content Calendar', cost: '20 credits' },
  { icon: '♻️', name: 'Content Repurposer',       cost: '3 credits' },
  { icon: '🧵', name: 'Thread Generator',         cost: '3 credits' },
  { icon: '🎨', name: 'AI Image Generation',      cost: '25 credits' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="#features"  className="hover:text-black transition-colors">Features</Link>
          <Link href="#ai"        className="hover:text-black transition-colors">AI Tools</Link>
          <Link href="#platforms" className="hover:text-black transition-colors">Platforms</Link>
          <Link href="/pricing"   className="hover:text-black transition-colors">Pricing</Link>
          <Link href="/story"     className="hover:text-black transition-colors">Our Story</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link href="/signup"
            className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
          🎉 Free forever · No credit card · 16 platforms · AI tools included
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Automate your content.<br />
          <span className="text-gray-400">Accelerate your growth.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          SocialMate is the AI-powered social media scheduler built for creators, small businesses, and agencies.
          16 platforms. AI tools that actually save time. A free plan that puts paid tools to shame.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup"
            className="bg-black text-white text-base font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all shadow-lg shadow-black/10">
            Create free account →
          </Link>
          <Link href="/features"
            className="text-sm font-semibold text-gray-500 hover:text-black transition-colors px-4 py-4">
            See all features →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No card required · Free forever · Takes 60 seconds</p>
      </section>

      {/* PLATFORM PILLS */}
      <section id="platforms" className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-6">
            16 platforms — 9 available now · more launching soon
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PLATFORMS.map(p => (
              <div key={p.name}
                className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-sm font-semibold ${
                  p.status === 'available'
                    ? 'bg-white border-gray-100 shadow-sm text-gray-700'
                    : p.status === 'soon'
                    ? 'bg-blue-50 border-blue-100 text-blue-600'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}>
                <span>{p.icon}</span>
                <span>{p.name}</span>
                {p.status === 'soon'    && <span className="text-xs font-bold text-blue-400 ml-1">Soon</span>}
                {p.status === 'planned' && <span className="text-xs font-bold text-gray-300 ml-1">Planned</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE CALLOUT */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-black rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Most tools charge per channel. We don't.
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            The standard is to charge for every platform you connect. Managing 10 platforms can cost $60–100/month.
            SocialMate gives you all 16 platforms free — and throws in AI tools on top.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            {[
              { label: 'Buffer Pro',        price: '$18/mo',   highlight: false },
              { label: 'Hootsuite',         price: '$99/mo',   highlight: false },
              { label: 'SocialMate Pro',    price: '$5/mo',    highlight: true  },
            ].map(item => (
              <div key={item.label} className={`rounded-2xl p-5 ${item.highlight ? 'bg-white' : 'bg-white/10'}`}>
                <p className={`text-2xl font-extrabold tracking-tight mb-1 ${item.highlight ? 'text-black' : 'text-white'}`}>
                  {item.price}
                </p>
                <p className={`text-xs font-semibold leading-tight ${item.highlight ? 'text-gray-500' : 'text-white/50'}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup"
              className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
              Start for free →
            </Link>
            <Link href="/pricing"
              className="text-sm font-semibold text-white/50 hover:text-white transition-all px-4 py-4">
              See full pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* AI TOOLS SECTION */}
      <section id="ai" className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-full mb-4">
              🤖 100 free AI credits every month
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-3">
              An AI toolkit built for creators
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Not just a caption generator. SocialMate includes trend scanning, growth intelligence,
              content calendars, thread generators, and more — all powered by Google Gemini.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            {AI_TOOLS.map(tool => (
              <div key={tool.name} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-all text-center">
                <div className="text-2xl mb-2">{tool.icon}</div>
                <p className="text-xs font-bold mb-1 leading-tight">{tool.name}</p>
                <p className="text-xs text-gray-400">{tool.cost}</p>
              </div>
            ))}
          </div>

          {/* SM-PULSE + SM-RADAR CALLOUT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm font-extrabold">SM-Pulse</p>
                  <p className="text-xs text-gray-400">Trend Intelligence</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-white text-black px-2 py-0.5 rounded-full">5 credits</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scans trending hashtags, viral formats, and engagement spikes in your niche before you create your next post.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📡</span>
                <div>
                  <p className="text-sm font-extrabold">SM-Radar</p>
                  <p className="text-xs text-gray-400">Personal Growth Intelligence</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">3 credits</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Analyzes your own post history to surface your best times, top content formats, and audience engagement patterns.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/features"
              className="inline-block bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              See all AI tools →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">Everything you need</h2>
          <p className="text-gray-400 text-lg">Every feature that matters. None locked behind a paywall.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feature => (
            <div key={feature.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-all">
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-bold mb-1.5 tracking-tight">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EARLY ADOPTERS */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">Be part of the first wave</h2>
          <p className="text-gray-400 text-lg mb-10">
            SocialMate is in early access. Built in public, with real users, based on real feedback.
            The people who join now shape what this becomes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '🔨', title: 'Built with early users',  desc: 'Your feedback directly shapes features, priorities, and the roadmap.' },
              { icon: '🎁', title: 'Founding member perks',   desc: 'Early users lock in generous limits before any pricing changes ever happen.' },
              { icon: '📣', title: 'Your story here',         desc: 'Using SocialMate? We want to hear about it. Real testimonials coming soon.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 text-left">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-bold mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/signup"
            className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            Join early access →
          </Link>
        </div>
      </section>

      {/* LINK IN BIO CALLOUT */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              Free bio link builder
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Link in Bio — included free</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Standalone bio link tools charge $10–20/month for what we include free. Custom backgrounds,
              button styles, social icons, click tracking, and a public URL — all built into SocialMate at no cost.
            </p>
            <Link href="/signup"
              className="inline-block bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              Create your free bio page →
            </Link>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-2xl">👤</div>
              <h3 className="font-bold text-sm mb-1">Your Name</h3>
              <p className="text-xs text-gray-400 mb-4">Your bio goes here</p>
              <div className="space-y-2">
                {['🌐 My Website', '📸 Latest Post', '📧 Contact Me'].map(link => (
                  <div key={link}
                    className="w-full py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600">
                    {link}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">Made with SocialMate · Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER MISSION */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="border border-gray-100 rounded-3xl p-10 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why we built this</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 max-w-2xl mx-auto">
            Professional tools shouldn't require a professional budget.
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-xl mx-auto mb-6">
            SocialMate is bootstrapped — built by one person who works at a deli and codes in every spare moment.
            The belief is simple: the best version of a tool should be accessible to everyone.
            Not just those who can already afford it.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/story"
              className="text-sm font-bold text-black underline hover:opacity-70 transition-all">
              Read the full story →
            </Link>
            <Link href="/pricing"
              className="text-sm font-semibold text-gray-400 hover:text-black transition-all">
              See how pricing works →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black py-24">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">Start free today</h2>
          <p className="text-white/60 text-xl mb-10 max-w-xl mx-auto">
            No credit card. No trial. No catch. Just a tool that works, respects you, and stays free.
          </p>
          <Link href="/signup"
            className="inline-block bg-white text-black text-base font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all shadow-2xl">
            Create your free account →
          </Link>
          <p className="text-white/30 text-xs mt-6">16 platforms · AI tools included · Free forever</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight">SocialMate</span>
            <span className="text-xs text-gray-400 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400 flex-wrap">
            <Link href="/features"  className="hover:text-black transition-colors">Features</Link>
            <Link href="/pricing"   className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/affiliate" className="hover:text-black transition-colors">Affiliate</Link>
            <Link href="/referral"  className="hover:text-black transition-colors">Referral</Link>
            <Link href="/story"     className="hover:text-black transition-colors">Our Story</Link>
            <Link href="/privacy"   className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms"     className="hover:text-black transition-colors">Terms</Link>
            <Link href="/login"     className="hover:text-black transition-colors">Sign in</Link>
            <Link href="/signup"    className="hover:text-black transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
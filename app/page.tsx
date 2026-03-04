import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
  description: 'Schedule posts to all 16 major social platforms completely free. No per-channel fees. No post limits. No catch. The social media tool that actually respects you.',
  openGraph: {
    title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    description: 'Schedule posts to all 16 major social platforms completely free. No per-channel fees. No post limits. No catch.',
    url: 'https://socialmate-six.vercel.app',
  },
}

const FEATURES = [
  { icon: '📅', title: 'Content Calendar', desc: 'Drag and drop to reschedule posts. See your entire month at a glance. Free.' },
  { icon: '✏️', title: 'Compose & Schedule', desc: 'Write once, post everywhere. Templates, hashtags, and media all built in.' },
  { icon: '📆', title: 'Bulk Scheduler', desc: 'Schedule 50+ posts at once with auto date-fill. No paid plan required.' },
  { icon: '🖼️', title: 'Media Library', desc: 'Upload and organize all your images and videos in one place.' },
  { icon: '🔗', title: 'Link in Bio', desc: 'A full bio link builder included free. No separate app. No monthly fee.' },
  { icon: '📊', title: 'Real Analytics', desc: 'Posting frequency, best times, platform breakdown — all from your real data.' },
  { icon: '#️⃣', title: 'Hashtag Collections', desc: 'Save hashtag groups and insert them into any post in one click.' },
  { icon: '📝', title: 'Post Templates', desc: 'Save caption formats and reuse them across any platform.' },
  { icon: '⏰', title: 'Best Times to Post', desc: 'Your personal posting heatmap plus industry averages for every platform.' },
  { icon: '👥', title: 'Team Collaboration', desc: 'Invite team members, assign roles, collaborate on content. Free up to 2 seats.' },
  { icon: '🤖', title: 'AI Captions', desc: '100 free AI credits every month. Generate captions, hashtags, and optimized copy.' },
  { icon: '🎁', title: 'Referral Program', desc: 'Refer a friend and earn. They get a great tool. You get credits or a free month.' },
]

const PLATFORMS = [
  { icon: '📸', name: 'Instagram' },
  { icon: '🐦', name: 'X / Twitter' },
  { icon: '💼', name: 'LinkedIn' },
  { icon: '🎵', name: 'TikTok' },
  { icon: '📘', name: 'Facebook' },
  { icon: '📌', name: 'Pinterest' },
  { icon: '▶️', name: 'YouTube' },
  { icon: '🧵', name: 'Threads' },
  { icon: '👻', name: 'Snapchat' },
  { icon: '🦋', name: 'Bluesky' },
  { icon: '🤖', name: 'Reddit' },
  { icon: '💬', name: 'Discord' },
  { icon: '✈️', name: 'Telegram' },
  { icon: '🐘', name: 'Mastodon' },
  { icon: '🍋', name: 'Lemon8' },
  { icon: '📷', name: 'BeReal' },
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
          <Link href="#features" className="hover:text-black transition-colors">Features</Link>
          <Link href="#platforms" className="hover:text-black transition-colors">Platforms</Link>
          <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
          🎉 Free forever · No credit card · 16 platforms
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Manage all your social media.<br />
          <span className="text-gray-400">Finally, for free.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          SocialMate gives every creator, business owner, and agency the tools they need to post smarter — across all 16 major platforms, completely free. No per-channel fees. No post limits. No catch.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup"
            className="bg-black text-white text-base font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all shadow-lg shadow-black/10">
            Create free account →
          </Link>
          <Link href="/pricing"
            className="text-sm font-semibold text-gray-500 hover:text-black transition-colors px-4 py-4">
            See pricing →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No card required · Free forever · Takes 60 seconds</p>
      </section>

      {/* PLATFORM PILLS */}
      <section id="platforms" className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-6">All 16 platforms — all free</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm">
                <span>{p.icon}</span>
                <span className="text-gray-700">{p.name}</span>
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
            The standard in social media tools is to charge you for every platform you connect. Managing 10 platforms can cost $60–100/month before you've done anything. SocialMate gives you all 16 platforms free. No per-channel model. No per-seat charges. No surprise bills.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            {[
              { label: 'Typical per-channel tools', price: '$60–120/mo', highlight: false },
              { label: 'Typical enterprise tools', price: '$99–300/mo', highlight: false },
              { label: 'SocialMate', price: '$0/mo', highlight: true },
            ].map(item => (
              <div key={item.label} className={`rounded-2xl p-5 ${item.highlight ? 'bg-white' : 'bg-white/10'}`}>
                <p className={`text-2xl font-extrabold tracking-tight mb-1 ${item.highlight ? 'text-black' : 'text-white'}`}>{item.price}</p>
                <p className={`text-xs font-semibold leading-tight ${item.highlight ? 'text-gray-500' : 'text-white/50'}`}>{item.label}</p>
              </div>
            ))}
          </div>
          <Link href="/signup"
            className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
            Start for free →
          </Link>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">Everything you need</h2>
          <p className="text-gray-400 text-lg">Every feature that matters. None locked behind a paywall.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feature => (
            <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-all">
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-bold mb-1.5 tracking-tight">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EARLY ADOPTERS — honest placeholder replacing fake testimonials */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">Be part of the first wave</h2>
          <p className="text-gray-400 text-lg mb-10">
            SocialMate is in early access. We're building this in public, with real users, based on real feedback. The people who join now shape what this becomes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '🔨', title: 'Built with early users', desc: 'Your feedback directly shapes features, priorities, and the roadmap.' },
              { icon: '🎁', title: 'Founding member perks', desc: 'Early users lock in generous limits before any pricing changes ever happen.' },
              { icon: '📣', title: 'Your story here', desc: 'Using SocialMate? We want to hear about it. Real testimonials coming soon.' },
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
              Standalone bio link tools charge $10–20/month for what we include free. Custom backgrounds, button styles, social icons, click tracking, and a public URL — all built into SocialMate at zero cost.
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
                  <div key={link} className="w-full py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600">
                    {link}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">Made with SocialMate · Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION CALLOUT */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="border border-gray-100 rounded-3xl p-10 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why we built this</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 max-w-2xl mx-auto">
            Professional tools shouldn't require a professional budget.
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-xl mx-auto mb-6">
            SocialMate is part of the Mate Series — a suite of tools built on one belief: the best version of something should be accessible to everyone. Not just those who can already afford it. We charge just enough to keep it running and growing. Everything else, we give away.
          </p>
          <Link href="/pricing"
            className="text-sm font-bold text-black underline hover:opacity-70 transition-all">
            See how the pricing works →
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black py-24">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">
            Start free today
          </h2>
          <p className="text-white/60 text-xl mb-10 max-w-xl mx-auto">
            No credit card. No trial. No catch. Just a tool that works, respects you, and stays free.
          </p>
          <Link href="/signup"
            className="inline-block bg-white text-black text-base font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all shadow-2xl">
            Create your free account →
          </Link>
          <p className="text-white/30 text-xs mt-6">16 platforms · Unlimited posts · Free forever</p>
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
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-black transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-black transition-colors">Sign up</Link>
            <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
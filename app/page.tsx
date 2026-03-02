import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
  description: 'Schedule posts to 16 social platforms completely free. No per-channel fees. No post limits. Better than Buffer and Hootsuite at zero cost.',
  openGraph: {
    title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    description: 'Schedule posts to 16 social platforms completely free. No per-channel fees. No post limits.',
    url: 'https://socialmate-six.vercel.app',
  },
}

const FEATURES = [
  { icon: '📅', title: 'Content Calendar', desc: 'Drag and drop to reschedule posts. See your entire month at a glance.' },
  { icon: '✏️', title: 'Compose & Schedule', desc: 'Write once, post everywhere. Templates, hashtags, and media built in.' },
  { icon: '📆', title: 'Bulk Scheduler', desc: "Schedule 50 posts at once. Hootsuite charges extra for this. We don't." },
  { icon: '🖼️', title: 'Media Library', desc: 'Upload and organize all your images and videos in one place.' },
  { icon: '🔗', title: 'Link in Bio', desc: 'Free Linktree alternative built right in. No extra app needed.' },
  { icon: '📊', title: 'Real Analytics', desc: 'Posting frequency, best times, platform breakdown — all from your real data.' },
  { icon: '#️⃣', title: 'Hashtag Collections', desc: 'Save hashtag groups and insert them into any post in one click.' },
  { icon: '📝', title: 'Post Templates', desc: 'Save caption formats and reuse them across any platform.' },
  { icon: '🔍', title: 'Best Times to Post', desc: 'Heatmap of when you post most. Industry data for every platform.' },
  { icon: '👥', title: 'Team Collaboration', desc: "Invite unlimited team members. Buffer charges $12/user. We don't." },
  { icon: '🤖', title: 'AI Captions', desc: '15 free AI credits every month to generate captions and hashtags.' },
  { icon: '🎁', title: 'Referral Program', desc: 'Earn free Pro time by inviting friends. Rewards stack automatically.' },
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

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Content Creator', text: "I was paying $99/month for Hootsuite. SocialMate does everything I need for free. Genuinely shocked." },
  { name: 'Marcus T.', role: 'Social Media Manager', text: "Managing 8 client accounts used to cost me $300/month in tool subscriptions. Now it's $0." },
  { name: 'Priya M.', role: 'Brand Founder', text: "The Link in Bio builder alone saves me $10/month from Linktree. Everything else is just a bonus." },
  { name: 'Jordan L.', role: 'Agency Owner', text: "Bulk scheduler changed my workflow completely. I batch a whole month of content in one sitting." },
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
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">
            Sign in
          </Link>
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
          Schedule to 16 platforms.<br />
          <span className="text-gray-400">Actually free.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          SocialMate gives you everything Buffer and Hootsuite charge $100+/month for — completely free. No per-channel fees. No post limits. No catch.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup" className="bg-black text-white text-base font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all shadow-lg shadow-black/10">
            Create free account →
          </Link>
          <Link href="/pricing" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors px-4 py-4">
            See how we compare
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Join thousands of creators · No card required · Free forever</p>
      </section>

      {/* PLATFORM PILLS */}
      <section id="platforms" className="border-y border-gray-100 bg-gray-50 py-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-6">All 16 platforms included free</p>
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

      {/* VS COMPETITORS CALLOUT */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-black rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Buffer charges $6 per channel per month.
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Managing 5 platforms on Buffer costs $30/month — $360/year. SocialMate gives you all 16 platforms for free. That's over $1,200 saved every year.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Buffer (5 platforms)', price: '$360/yr', highlight: false },
              { label: 'Hootsuite', price: '$1,188/yr', highlight: false },
              { label: 'SocialMate', price: '$0/yr', highlight: true },
            ].map(item => (
              <div key={item.label} className={`rounded-2xl p-5 ${item.highlight ? 'bg-white' : 'bg-white/10'}`}>
                <p className={`text-2xl font-extrabold tracking-tight mb-1 ${item.highlight ? 'text-black' : 'text-white'}`}>{item.price}</p>
                <p className={`text-xs font-semibold ${item.highlight ? 'text-gray-500' : 'text-white/50'}`}>{item.label}</p>
              </div>
            ))}
          </div>
          <Link href="/signup" className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
            Start saving today →
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
            <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-all group">
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-bold mb-1.5 tracking-tight">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-3">People love it</h2>
            <p className="text-gray-400">Real feedback from real users</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6">
                <p className="text-sm text-gray-700 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LINK IN BIO CALLOUT */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              Free Linktree alternative
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Link in Bio — included free</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Linktree charges $10–$20/month for a branded bio page. SocialMate includes a full Link in Bio builder at zero cost. Custom backgrounds, button styles, social icons, and a public URL.
            </p>
            <Link href="/signup" className="inline-block bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
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
              <p className="text-xs text-gray-400 mt-4">Made with SocialMate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black py-24">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">
            Start for free today
          </h2>
          <p className="text-white/60 text-xl mb-10 max-w-xl mx-auto">
            No credit card. No trial. No catch. Just a genuinely free social media scheduler that actually works.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black text-base font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all shadow-2xl">
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
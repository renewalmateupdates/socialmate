import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Social Media for Content Creators — SocialMate',
  description: 'Manage all your social media from one place. Post to 7 platforms at once, use AI to write content faster, and never burn out from daily posting pressure — free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Content Creators — SocialMate',
    description: 'One dashboard for Bluesky, X, TikTok, LinkedIn, Discord, Telegram, and Mastodon. SOMA generates a week of content from your ideas automatically.',
    url: 'https://socialmate.studio/for/content-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Content Creators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Content Creators — SocialMate',
    description: 'Manage 7 platforms from one dashboard. AI writes content in your voice. Free to start.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/content-creators' },
}

const LIVE_PLATFORMS = [
  { name: 'Bluesky',     icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',    icon: '🐘', note: 'Live' },
  { name: 'Discord',     icon: '💬', note: 'Live' },
  { name: 'Telegram',    icon: '✈️', note: 'Live' },
  { name: 'TikTok',      icon: '🎵', note: 'Live' },
  { name: 'LinkedIn',    icon: '💼', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Threads',   icon: '🧵' },
  { name: 'Pinterest', icon: '📌' },
]

const PAIN_POINTS = [
  {
    before: 'Open TikTok. Post. Open X. Post. Open LinkedIn. Post. Open Bluesky. Post. 45 minutes gone.',
    after:  'Write once. Post to all 7 platforms in 30 seconds. One compose window.',
    icon:   '⏱️',
  },
  {
    before: 'Try to post daily. Miss three days. Engagement tanks. Feel guilty. Repeat.',
    after:  'Batch a week of content in one sitting. Post consistently without burning out.',
    icon:   '📅',
  },
  {
    before: 'Stare at the caption box. No ideas. No energy. Skip posting entirely.',
    after:  'AI writes your captions, hooks, threads, and content ideas. You just edit and approve.',
    icon:   '✍️',
  },
  {
    before: 'Hootsuite wants $99/month. Buffer wants $18. You have 5 platforms and a $0 budget.',
    after:  'Get the same scheduling power for $5/month — or completely free.',
    icon:   '💸',
  },
]

const FEATURES = [
  {
    title: '7 Platforms, One Dashboard',
    desc:  'Bluesky, X, TikTok, LinkedIn, Discord, Telegram, Mastodon — all connected. Write once, publish everywhere. No switching apps.',
    icon:  '📡',
    badge: 'Free',
  },
  {
    title: 'SOMA — AI Content OS',
    desc:  'Tell SOMA your niche and voice. It generates a full week of platform-native posts automatically — TikTok hooks, LinkedIn thoughts, X threads. Done.',
    icon:  '⚡',
    badge: 'Pro',
  },
  {
    title: 'AI Caption & Hook Writer',
    desc:  '20+ AI tools: caption generator, viral hook writer, thread builder, content repurposer, hashtag suggestions, post scorer. All powered by Google Gemini.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'Content Calendar',
    desc:  'Visual calendar view of everything scheduled. Drag, drop, reschedule. See your whole month at a glance. Never wonder "did I post today?" again.',
    icon:  '📅',
    badge: 'Free',
  },
  {
    title: 'Content Repurposer',
    desc:  'Turn one piece of content into 6 formats: Twitter thread, LinkedIn post, email, short hook, caption, audiogram text. 1 click.',
    icon:  '♻️',
    badge: 'Pro',
  },
  {
    title: 'Posting Streak Tracker',
    desc:  'GitHub-style 365-day heatmap. See your consistency, longest streak, and total posts. Streak notifications keep you motivated when you\'re close to a milestone.',
    icon:  '🔥',
    badge: 'Free',
  },
  {
    title: 'Free Plan That Actually Works',
    desc:  '50 AI credits, all 7 platforms, full scheduling calendar, link in bio, drafts, evergreen recycling. Not a demo. A real tool you can run your whole presence on.',
    icon:  '🎁',
    badge: 'Free',
  },
  {
    title: 'Brand Voice AI',
    desc:  'Train the AI on your tone, vocabulary, and style. Every generated post sounds like you — not a template. Your audience will never know it was AI-assisted.',
    icon:  '🎙️',
    badge: 'Pro',
  },
  {
    title: 'Smart Queue & Auto-Schedule',
    desc:  'Have drafts piling up? Smart Queue automatically fills your schedule at optimal times on each platform. 1 click and your queue is full.',
    icon:  '🚀',
    badge: 'Pro',
  },
]

const COMPARISON = [
  { tool: 'Hootsuite Pro',      price: '$99/mo',  platforms: 10, ai: 'Add-on',  free: '✗' },
  { tool: 'Buffer Essentials',  price: '$18/mo',  platforms: 3,  ai: 'Limited', free: '✗' },
  { tool: 'Later Starter',      price: '$18/mo',  platforms: 1,  ai: 'Limited', free: '✗' },
  { tool: 'SocialMate Pro',     price: '$5/mo',   platforms: 7,  ai: '500 cr',  free: '50cr', highlight: true },
]

const FAQ = [
  {
    q: 'Is the free plan actually useful or is it a bait-and-switch?',
    a: 'It\'s genuinely useful. 50 AI credits, all 7 platforms, scheduling calendar, link in bio, drafts, evergreen recycling. The free plan isn\'t a demo — it\'s a real tool. You\'ll outgrow it at some point, but it\'s not stripped down to force upgrades.',
  },
  {
    q: 'Do I need to be on all 7 platforms?',
    a: 'No. Connect only what you actually use. You could connect just TikTok and Bluesky and use SocialMate as a two-platform scheduler. But having more connected costs nothing extra, so you might as well let posts go everywhere.',
  },
  {
    q: 'What is SOMA and do I need it?',
    a: 'SOMA is SocialMate\'s AI content system. You give it context about your brand and niche, and it generates a full week of platform-native posts automatically. If you hate creating content from scratch, SOMA handles it. It\'s a Pro+ feature.',
  },
  {
    q: 'Can I use this if I\'m just starting out with zero followers?',
    a: 'Yes, and it\'s actually more valuable early on when you need consistency to build an audience. The free plan covers everything you need to stay consistent across all platforms while you grow.',
  },
  {
    q: 'What platforms are actually live today?',
    a: 'Bluesky, X/Twitter, Mastodon, Discord, Telegram, TikTok, and LinkedIn are all live. Instagram, Facebook, YouTube, Threads, and Pinterest are on the roadmap — see /roadmap for honest status updates.',
  },
  {
    q: 'Can I schedule TikTok posts?',
    a: 'Yes. TikTok Production API is live. Connect at /accounts and schedule TikTok posts from the same compose window as all your other platforms.',
  },
]

export default function ContentCreatorsPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Built for content creators</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Manage all your social media<br />
          <span className="text-amber-400">from one place.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          7 platforms. 1 dashboard. Post everywhere at once, use AI to write content faster,
          and stop burning out from daily posting pressure.
          What Hootsuite charges $99/month for, we give for $5 — or free.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/features"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            See all features
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">Free forever · 7 live platforms · No credit card required</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            Managing 5+ platforms manually is<br />a full-time job you didn&apos;t sign up for.
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">Right now</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-5">
                  <p className="text-xs text-amber-300 font-bold uppercase tracking-wide mb-2">With SocialMate</p>
                  <p className="text-sm text-white leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            Everything creators need. Nothing they don&apos;t.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-lg mx-auto">
            Core tools are free. AI content automation unlocks at $5/month.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-amber-900/50 text-amber-300'
                  }`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Where your content lands</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">7 platforms live today</h2>
          <p className="text-gray-400 text-sm mb-8">Schedule to all of them from a single compose window. For free.</p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">✓ Live</span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-gray-400 mb-4">In the pipeline</h3>
          <p className="text-gray-500 text-xs mb-6 max-w-md mx-auto">
            Actively working through platform API applications. See the full{' '}
            <Link href="/roadmap" className="text-amber-400 hover:text-amber-300 underline">roadmap</Link>{' '}
            for honest ETAs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-gray-400">{p.name}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">What you might already be paying</h2>
          <p className="text-center text-gray-400 text-sm mb-12">vs. what SocialMate costs.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="py-3 pr-4">Tool</th>
                  <th className="py-3 pr-4">Monthly</th>
                  <th className="py-3 pr-4">Platforms</th>
                  <th className="py-3 pr-4">AI</th>
                  <th className="py-3">Free tier</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-900 ${row.highlight ? 'bg-amber-950/20' : ''}`}>
                    <td className={`py-3 pr-4 font-bold ${row.highlight ? 'text-amber-300' : 'text-gray-300'}`}>
                      {row.tool} {row.highlight && '←'}
                    </td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-amber-300 font-extrabold' : 'text-gray-400'}`}>{row.price}</td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{row.platforms}</td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{row.ai}</td>
                    <td className={`py-3 ${row.highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{row.free}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-600 mt-3">Prices approximate as of May 2026.</p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Creator FAQ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-gray-900 pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-b from-amber-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          One dashboard. All your platforms.<br />Finally.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Free forever on the free plan. $5/month when you need the AI tools.
          No credit card, no commitment.
        </p>
        <Link href="/signup"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Create free account →
        </Link>
        <p className="text-gray-600 text-xs mt-4">7 platforms · AI tools · Free forever on free plan</p>
      </section>

    </PublicLayout>
  )
}

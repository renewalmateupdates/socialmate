import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Social Media Tools for Streamers & Clippers — SocialMate',
  description: 'Schedule Twitch clips and YouTube videos to every social platform in seconds. Free tools built for streamers, clippers, and content creators. No $99/month nonsense.',
  openGraph: {
    title: 'Social Media Tools for Streamers & Clippers — SocialMate',
    description: 'Browse your Twitch VODs and YouTube videos, pick the best moments, and schedule them to every platform — Bluesky, X, Mastodon, Discord, Telegram — in one click.',
    url: 'https://socialmate.studio/for/streamers',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Streamers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Tools for Streamers & Clippers — SocialMate',
    description: 'Schedule Twitch clips to every platform in seconds. Free on all plans.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/streamers' },
}

const LIVE_PLATFORMS = [
  { name: 'Bluesky',   icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',  icon: '🐘', note: 'Live' },
  { name: 'Discord',   icon: '💬', note: 'Live' },
  { name: 'Telegram',  icon: '✈️', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'TikTok',    icon: '🎵' },
  { name: 'Kick',      icon: '🟢' },
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Instagram', icon: '📸' },
  { name: 'Threads',   icon: '🧵' },
  { name: 'Facebook',  icon: '📘' },
]

const PAIN_POINTS = [
  {
    before: 'Open Twitch Dashboard. Find the clip. Copy the link.',
    after:  'Browse all your Twitch clips inside SocialMate.',
    icon:   '🎬',
  },
  {
    before: 'Open Buffer / Hootsuite. Paste the link. Type a caption.',
    after:  'Pick a clip, write once, schedule everywhere.',
    icon:   '✍️',
  },
  {
    before: 'Repeat for every platform. 6 tabs open, 45 minutes gone.',
    after:  'Hit schedule. Done in 30 seconds.',
    icon:   '⏱️',
  },
]

const FEATURES = [
  {
    title: 'Twitch Clip Browser',
    desc:  'Connect your Twitch account and browse every clip right inside SocialMate. No more switching tabs or hunting for URLs.',
    icon:  '🎮',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'YouTube Video Scheduler',
    desc:  'Paste your YouTube channel URL — no API key, no OAuth — and browse your uploads ready to schedule.',
    icon:  '▶️',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Search Any Twitch Channel',
    desc:  'Not your clips? No problem. Search any public Twitch channel and grab clips from creators you collab with.',
    icon:  '🔍',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'One-Click Multi-Platform Scheduling',
    desc:  'Pick a clip, write your caption, choose your platforms, hit schedule. Posts go out to Bluesky, X, Mastodon, Discord, and Telegram in one shot.',
    icon:  '🚀',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'TikTok & Kick Scheduling',
    desc:  'Directly schedule your best clips to TikTok and Kick from the same dashboard. API access is being finalized.',
    icon:  '🎵',
    live:  false,
    badge: 'Coming soon',
  },
  {
    title: 'Clip Calendar & Bulk Scheduling',
    desc:  'Plan your entire week of clips in advance. Bulk-upload multiple clips and assign them to different days automatically.',
    icon:  '📅',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'AI Caption Writer',
    desc:  'No idea what to write? Let the AI write a punchy caption for your clip — hooks, emojis, hashtags included.',
    icon:  '🤖',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Evergreen Clip Recycling',
    desc:  'Your best clips don\'t die after one post. Set them to automatically recycle every few weeks and keep your content working forever.',
    icon:  '♻️',
    live:  true,
    badge: 'Live now',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    note:    'forever',
    credits: '50 AI credits/mo',
    clips:   'Twitch + YouTube clips',
    cta:     'Start free',
    href:    '/signup',
    highlight: false,
  },
  {
    plan:    'Pro',
    price:   '$5',
    note:    '/month',
    credits: '500 AI credits/mo',
    clips:   'Twitch + YouTube clips',
    cta:     'Go Pro',
    href:    '/signup',
    highlight: true,
  },
  {
    plan:    'Agency',
    price:   '$20',
    note:    '/month',
    credits: '2,000 AI credits/mo',
    clips:   'Twitch + YouTube clips',
    cta:     'Go Agency',
    href:    '/signup',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'Does this work with Twitch clips specifically?',
    a: 'Yes. Connect your Twitch account via OAuth and your clips appear inside SocialMate instantly. You can browse, preview, and schedule any clip to multiple social platforms with one click.',
  },
  {
    q: 'Do I need a Twitch affiliate or partner account?',
    a: 'Nope. Clips Studio works with any Twitch account — affiliate, partner, or regular streamer. As long as you have clips, they\'ll show up.',
  },
  {
    q: 'What about YouTube? Do I need to give you API access?',
    a: 'No API access, no OAuth, no permissions needed. Just paste your YouTube channel URL and SocialMate fetches your public video list automatically.',
  },
  {
    q: 'Can I schedule clips from channels I collaborate with?',
    a: 'Yes. The "Search Any Channel" feature lets you browse clips from any public Twitch channel — great for collab highlights and community clips.',
  },
  {
    q: 'Is TikTok or Kick scheduling available yet?',
    a: 'Not yet — we\'re finalizing platform API access. Those platforms are in the roadmap and will be added as direct scheduling targets. Current posting goes to Bluesky, X, Mastodon, Discord, and Telegram.',
  },
  {
    q: 'How much does it cost?',
    a: 'Clips Studio is free on every plan. You get full Twitch OAuth + YouTube scheduling access on the free tier, $0/month, no credit card required.',
  },
  {
    q: 'What platforms can I schedule to right now?',
    a: 'Bluesky, X/Twitter, Mastodon, Discord, and Telegram are live today. LinkedIn, TikTok, Kick, Instagram, Reddit, and more are on the active roadmap.',
  },
  {
    q: 'Do you have a clip editor?',
    a: 'Not yet — clip trimming and editing is on the roadmap. Right now SocialMate is focused on distribution: getting your already-clipped content in front of the right audiences on every platform.',
  },
]

export default function StreamersPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Built for streamers &amp; clippers</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Stop wasting time posting clips.<br />
          <span className="text-purple-400">Schedule everything from one place.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          Browse your Twitch VODs and YouTube videos right inside SocialMate.
          Pick the best moments and fire them out to every platform — Bluesky, X, Mastodon,
          Discord, Telegram — in 30 seconds flat.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/clips"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            See Clips Studio
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">Free forever on all plans · Twitch OAuth · YouTube via channel URL</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            The clip-posting grind is killing your time
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">Without SocialMate</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-purple-950 border border-purple-800 rounded-2xl p-5">
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wide mb-2">With SocialMate</p>
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
          <p className="text-center text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            Everything a streamer needs. Nothing you don&apos;t.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            Clips Studio is free on every plan. No feature-gating for the core tools.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i}
                className={`rounded-2xl p-5 border ${f.live
                  ? 'bg-gray-950 border-gray-800'
                  : 'bg-gray-950/40 border-gray-900 opacity-70'
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.live
                    ? 'bg-green-900 text-green-400'
                    : 'bg-gray-800 text-gray-400'
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-gradient-to-b from-purple-950 to-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">3 steps</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-12">Post a clip in under a minute</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { step: '1', title: 'Connect & Browse', desc: 'Link your Twitch account or paste a YouTube URL. Your clips load instantly in the built-in browser.' },
              { step: '2', title: 'Pick & Caption', desc: 'Click any clip to open the compose window. Write your caption, or let AI write it for you in one click.' },
              { step: '3', title: 'Schedule Everywhere', desc: 'Choose your platforms, pick your time (or post now), and hit Schedule. Done.' },
            ].map((s) => (
              <div key={s.step} className="bg-black/40 border border-purple-900/50 rounded-2xl p-6">
                <div className="text-3xl font-black text-purple-400 mb-3">{s.step}</div>
                <h3 className="text-sm font-extrabold mb-2">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Where your clips land</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Live today</h2>
          <p className="text-gray-400 text-sm mb-8">Schedule to these platforms right now, for free.</p>

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
            We&apos;re actively working through platform API applications. These are real roadmap items, not vaporware.
            See the full <Link href="/roadmap" className="text-purple-400 hover:text-purple-300 underline">roadmap</Link> for ETAs.
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

      {/* ─── PRICING ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">What competitors charge $99 for, we give for $5.</h2>
          <p className="text-gray-400 text-sm mb-12">Clips Studio is included on every plan, including free.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border ${tier.highlight
                  ? 'bg-purple-950 border-purple-700 ring-1 ring-purple-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">Most popular</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.note}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 mb-6 text-left">
                  <li>✓ {tier.credits}</li>
                  <li>✓ {tier.clips}</li>
                  <li>✓ All 5 live platforms</li>
                  <li>✓ AI caption writer</li>
                  <li>✓ Scheduling calendar</li>
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-purple-500 hover:bg-purple-400 text-white'
                    : 'bg-white text-black hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">No credit card required for the free plan. Cancel anytime on paid plans.</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Streamer FAQ</h2>
          <div className="space-y-6">
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
      <section className="bg-gradient-to-br from-purple-950 via-gray-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Your clips deserve more than one platform.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Join SocialMate free and start scheduling your Twitch and YouTube content everywhere in minutes.
        </p>
        <Link href="/signup"
          className="inline-block bg-purple-500 hover:bg-purple-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Create free account →
        </Link>
        <p className="text-gray-600 text-xs mt-4">No credit card · No trial · Free forever on the free plan</p>
      </section>

    </PublicLayout>
  )
}

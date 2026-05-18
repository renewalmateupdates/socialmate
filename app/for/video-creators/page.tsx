import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Free Social Media Tools for Video Creators — SocialMate',
  description: 'Schedule TikTok videos, repurpose YouTube clips, share Twitch highlights — all from one free dashboard. GIF export, script generator, and 6 live platforms.',
  openGraph: {
    title: 'Free Social Media Tools for Video Creators — SocialMate',
    description: 'Schedule TikTok videos, repurpose YouTube clips, share Twitch highlights — all from one free dashboard. GIF export, AI script generator, and 6 live platforms.',
    url: 'https://socialmate.studio/for/video-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Video Creators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Social Media Tools for Video Creators — SocialMate',
    description: 'Schedule TikTok videos, repurpose YouTube clips, share Twitch highlights — free.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/video-creators' },
}

const LIVE_PLATFORMS = [
  { name: 'TikTok',     icon: '🎵', note: 'Live — free', highlight: true  },
  { name: 'X / Twitter', icon: '🐦', note: 'Live',        highlight: false },
  { name: 'Bluesky',    icon: '🦋', note: 'Live',        highlight: false },
  { name: 'Mastodon',   icon: '🐘', note: 'Live',        highlight: false },
  { name: 'Discord',    icon: '💬', note: 'Live',        highlight: false },
  { name: 'Telegram',   icon: '✈️', note: 'Live',        highlight: false },
]

const COMING_PLATFORMS = [
  { name: 'YouTube posting', icon: '▶️' },
  { name: 'Instagram',       icon: '📸' },
  { name: 'LinkedIn',        icon: '💼' },
]

const PAIN_POINTS = [
  {
    icon: '🎬',
    problem: 'Managing TikTok, Twitter, and Discord separately for every video upload — three tabs, three captions, three times the effort.',
    solution: 'One dashboard. Write once, publish to all 6 platforms in one click. TikTok + Discord + Bluesky in 30 seconds flat.',
  },
  {
    icon: '✍️',
    problem: 'Recording great content but spending hours writing hooks, captions, and CTAs from scratch for every video.',
    solution: 'AI TikTok Script Generator writes your hook, body, and CTA. AI Caption Generator handles social posts. Done in seconds.',
  },
  {
    icon: '📤',
    problem: 'Exporting clips in different formats and dimensions for TikTok vs Twitter vs Discord — a technical headache every time.',
    solution: 'Creator Studio handles GIF export and video editing with 8 CSS filters. One source, multiple outputs.',
  },
]

const FEATURES = [
  {
    title: 'TikTok Scheduling — Live & Free',
    desc:  'Production API approved May 2026. Schedule TikTok videos directly from your dashboard — for free on every plan. 20 videos/month on free, 60 on Pro, 200 on Agency.',
    icon:  '🎵',
    live:  true,
    badge: 'Live now',
    accent: 'text-[#fe2c55]',
    badgeBg: 'bg-red-950 text-[#fe2c55]',
  },
  {
    title: 'Clips Studio (Twitch + YouTube)',
    desc:  'Browse your Twitch clips via OAuth or paste a YouTube channel URL — no API key needed. Pick any clip and schedule it to all platforms in one click.',
    icon:  '🎮',
    live:  true,
    badge: 'Live now',
    accent: 'text-purple-400',
    badgeBg: 'bg-green-950 text-green-400',
  },
  {
    title: 'Creator Studio & GIF Export',
    desc:  'Trim videos, apply 8 CSS filters, add caption overlays, and export as GIF or MP4 via MediaRecorder + canvas. No additional software needed.',
    icon:  '🎨',
    live:  true,
    badge: 'Live now',
    accent: 'text-amber-400',
    badgeBg: 'bg-green-950 text-green-400',
  },
  {
    title: 'TikTok Script Generator',
    desc:  'AI-powered hook → body → CTA script built for TikTok format. Enter your topic and get a complete short-form video script in seconds. Powered by Google Gemini.',
    icon:  '🤖',
    live:  true,
    badge: 'Live now',
    accent: 'text-[#fe2c55]',
    badgeBg: 'bg-green-950 text-green-400',
  },
  {
    title: 'Cross-Platform Posting',
    desc:  'Post to all 6 live platforms simultaneously — TikTok, X/Twitter, Bluesky, Mastodon, Discord, Telegram. Per-platform previews show exactly how each post will look.',
    icon:  '🚀',
    live:  true,
    badge: 'Live now',
    accent: 'text-blue-400',
    badgeBg: 'bg-green-950 text-green-400',
  },
  {
    title: 'YouTube Posting',
    desc:  'Direct video uploads to YouTube from the SocialMate dashboard. Full title, description, and tag support. API application in progress.',
    icon:  '▶️',
    live:  false,
    badge: 'Coming soon',
    accent: 'text-[#ff0000]',
    badgeBg: 'bg-gray-800 text-gray-400',
  },
]

const PRICING = [
  {
    plan:      'Free',
    price:     '$0',
    note:      'forever',
    tiktok:    '20 TikTok videos/mo',
    ai:        '50 AI credits/mo',
    cta:       'Start free',
    href:      '/signup',
    highlight: false,
  },
  {
    plan:      'Pro',
    price:     '$5',
    note:      '/month',
    tiktok:    '60 TikTok videos/mo',
    ai:        '500 AI credits/mo',
    cta:       'Go Pro',
    href:      '/signup',
    highlight: true,
  },
  {
    plan:      'Agency',
    price:     '$20',
    note:      '/month',
    tiktok:    '200 TikTok videos/mo',
    ai:        '2,000 AI credits/mo',
    cta:       'Go Agency',
    href:      '/signup',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'What video platforms does SocialMate support?',
    a: 'TikTok is live with Production API approval (May 2026) — free for all users, up to 20 videos/month on the free plan, 60 on Pro, and 200 on Agency. Clips Studio lets you browse and schedule from Twitch (OAuth) and YouTube (channel URL, no API needed). YouTube direct posting and Instagram are on the roadmap.',
  },
  {
    q: 'Can I schedule TikTok videos for free?',
    a: "Yes. TikTok scheduling is free on every SocialMate plan. The free tier includes 20 TikTok videos per month. SocialMate connects directly to TikTok's Production API — no workarounds, no third-party tools. Connect your TikTok account at /accounts and start scheduling from the dashboard.",
  },
  {
    q: 'How does Clips Studio work?',
    a: 'Clips Studio has two modes: Twitch (connect your account via OAuth to browse all your clips), and YouTube (paste any channel URL to browse public videos — no API key or OAuth required). Click any clip to open the compose window, write or generate a caption, choose your platforms, and schedule. Works on the free plan.',
  },
  {
    q: "What's GIF Export in Creator Studio?",
    a: "Creator Studio at /create is SocialMate's browser-based video editor. You can trim clips, apply 8 CSS visual filters, add text caption overlays, capture a thumbnail, and export to GIF or MP4 using MediaRecorder + canvas — no third-party software, no downloads, no additional cost.",
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function VideoCreatorsPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#fe2c55]/10 border border-[#fe2c55]/30 rounded-full px-4 py-1.5 text-xs font-bold text-[#fe2c55] mb-6 uppercase tracking-widest">
          TikTok Production API — Live May 2026
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          One Dashboard for Every<br />
          <span className="text-[#fe2c55]">Video Platform</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          Schedule TikTok videos, repurpose YouTube clips, and share Twitch highlights
          to all 6 live platforms in one click. AI script generator, GIF export, and Clips Studio
          — free on every plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="bg-[#fe2c55] hover:bg-[#fe2c55]/80 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            Start free — no credit card →
          </Link>
          <Link
            href="/accounts"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            Connect TikTok
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">Free forever · TikTok live · Twitch OAuth · YouTube via channel URL</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            The video posting grind is killing your time
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">The problem</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.icon} {p.problem}</p>
                </div>
                <div className="bg-[#fe2c55]/10 border border-[#fe2c55]/20 rounded-2xl p-5">
                  <p className="text-xs text-[#fe2c55] font-bold uppercase tracking-wide mb-2">With SocialMate</p>
                  <p className="text-sm text-white leading-relaxed">{p.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            Built for video creators. Free to start.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            TikTok scheduling, Clips Studio, GIF export, and AI scripts — all on the free plan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 border ${
                  f.live
                    ? 'bg-gray-950 border-gray-800'
                    : 'bg-gray-950/40 border-gray-900 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.badgeBg}`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className={`text-sm font-extrabold mb-2 ${f.live ? f.accent : 'text-gray-500'}`}>
                  {f.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM GRID ─── */}
      <section className="bg-gradient-to-b from-gray-950 to-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Where your videos land</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">6 live platforms. All free.</h2>
          <p className="text-gray-400 text-sm mb-8">Schedule to these platforms right now — no paywall, no trial.</p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border ${
                  p.highlight
                    ? 'bg-[#fe2c55]/10 border-[#fe2c55]/40'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span className={`text-sm font-bold ${p.highlight ? 'text-[#fe2c55]' : ''}`}>{p.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    p.highlight
                      ? 'bg-[#fe2c55]/20 text-[#fe2c55]'
                      : 'bg-green-900 text-green-400'
                  }`}
                >
                  {p.highlight ? '✓ New' : '✓ Live'}
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-gray-400 mb-4">In the pipeline</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 opacity-60"
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-gray-400">{p.name}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">3 steps</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-12">Schedule a TikTok in under a minute</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                step: '1',
                title: 'Connect & Browse',
                desc: 'Link your TikTok account at /accounts. Or paste a YouTube channel URL to browse videos instantly — no API key required.',
              },
              {
                step: '2',
                title: 'Write or Generate',
                desc: 'Use the AI Script Generator for TikTok hooks and CTAs, or let the AI Caption Writer handle your social posts in one click.',
              },
              {
                step: '3',
                title: 'Schedule Everywhere',
                desc: 'Choose your platforms, pick your time, and hit Schedule. TikTok, Bluesky, Discord, Telegram — all at once.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-black/40 border border-[#fe2c55]/20 rounded-2xl p-6">
                <div className="text-3xl font-black text-[#fe2c55] mb-3">{s.step}</div>
                <h3 className="text-sm font-extrabold mb-2">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            What competitors charge $99 for, we give for $5.
          </h2>
          <p className="text-gray-400 text-sm mb-12">TikTok scheduling included on every plan, including free.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div
                key={tier.plan}
                className={`rounded-2xl p-6 border ${
                  tier.highlight
                    ? 'bg-[#fe2c55]/10 border-[#fe2c55]/40 ring-1 ring-[#fe2c55]/30'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                {tier.highlight && (
                  <p className="text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">Most popular</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.note}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 mb-6 text-left">
                  <li>✓ {tier.tiktok}</li>
                  <li>✓ {tier.ai}</li>
                  <li>✓ All 6 live platforms</li>
                  <li>✓ AI Script + Caption Generator</li>
                  <li>✓ Clips Studio (Twitch + YouTube)</li>
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${
                    tier.highlight
                      ? 'bg-[#fe2c55] hover:bg-[#fe2c55]/80 text-white'
                      : 'bg-white text-black hover:opacity-80'
                  }`}
                >
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">No credit card required for the free plan. Cancel anytime on paid plans.</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Video Creator FAQ</h2>
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-gray-800 pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-br from-[#fe2c55]/20 via-gray-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Your videos deserve more than one platform.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Schedule TikTok videos, repurpose clips, and grow your audience everywhere — free, today.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#fe2c55] hover:bg-[#fe2c55]/80 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all"
        >
          Create free account →
        </Link>
        <p className="text-gray-600 text-xs mt-4">No credit card · No trial · Free forever on the free plan</p>
      </section>
    </PublicLayout>
  )
}

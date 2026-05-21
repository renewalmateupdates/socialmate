import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Free TikTok Scheduler for Creators — SocialMate',
  description: 'Schedule TikTok videos to go live automatically. Production API approved. Free for all users — no per-post charges. Plus 5 other platforms in one dashboard.',
  openGraph: {
    title: 'Free TikTok Scheduler for Creators — SocialMate',
    description: 'Schedule TikTok videos to go live automatically. Production API approved. Free for all users — no per-post charges. Plus 5 other platforms in one dashboard.',
    url: 'https://socialmate.studio/for/tiktok-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate TikTok Scheduler' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free TikTok Scheduler for Creators — SocialMate',
    description: 'Schedule TikTok videos automatically. Production API approved. Free on all plans — no per-post charges.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/tiktok-creators' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is TikTok scheduling really free on SocialMate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. TikTok scheduling is free on every SocialMate plan including the free tier. Unlike X/Twitter which charges $0.01 per tweet (because the API is paid), TikTok's Content Posting API has no per-post cost. We pass that saving directly to you — zero extra charge.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the TikTok video limit per month?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free plan: 20 TikTok videos per month. Pro ($5/month): 60 videos per month. Agency ($20/month): 200 videos per month. These are generous limits based on realistic posting schedules. The cost to us is only Supabase storage egress (~$0.09/GB), not a per-post API charge.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a TikTok Pro or Business account to use SocialMate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No Pro or Business account required. SocialMate uses TikTok's Content Posting API which works with standard personal TikTok accounts. Just connect your account at /accounts and you're ready to schedule.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does SocialMate post to TikTok?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "SocialMate uses TikTok's official Production-approved Content Posting API (FILE_UPLOAD method). When you schedule a video, SocialMate uploads it to secure storage and at your scheduled time, calls the TikTok API to publish directly to your profile. No manual posting, no third-party workarounds.",
      },
    },
  ],
}

const LIVE_PLATFORMS = [
  { name: 'TikTok',     icon: '🎵', note: 'Live', highlight: true },
  { name: 'Bluesky',   icon: '🦋', note: 'Live', highlight: false },
  { name: 'X / Twitter', icon: '🐦', note: 'Live', highlight: false },
  { name: 'Mastodon',  icon: '🐘', note: 'Live', highlight: false },
  { name: 'Discord',   icon: '💬', note: 'Live', highlight: false },
  { name: 'Telegram',  icon: '✈️', note: 'Live', highlight: false },
  { name: 'LinkedIn',  icon: '💼', note: 'Live', highlight: false },
]

const COMING_PLATFORMS = [
  { name: 'YouTube',    icon: '▶️' },
  { name: 'Instagram',  icon: '📸' },
  { name: 'Facebook',   icon: '📘' },
  { name: 'Threads',    icon: '🧵' },
]

const PAIN_POINTS = [
  {
    before: 'Set an alarm at 7 PM. Open TikTok. Hope you don\'t forget. Post manually every single day.',
    after:  'Schedule weeks of TikTok videos in one session. They go live automatically.',
    icon:   '⏰',
  },
  {
    before: 'Manage TikTok in one app, Bluesky in another, Discord in a third. Five tabs, all chaos.',
    after:  'One dashboard. All 7 platforms. Schedule once, post everywhere.',
    icon:   '📱',
  },
  {
    before: 'Pay $18+/month to a tool that charges extra or locks TikTok behind a paid plan.',
    after:  'TikTok scheduling is free on SocialMate. No per-post charges. No upgrade required.',
    icon:   '💸',
  },
]

const FEATURES = [
  {
    title: 'TikTok Direct Scheduling',
    desc:  'Schedule TikTok videos using the official Production-approved Content Posting API. Pick your video, write a caption, set a time — SocialMate posts it automatically.',
    icon:  '🎵',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'TikTok Studio',
    desc:  'Browse and manage your TikTok content in one place. Connect your account at /accounts and access TikTok Studio at /tiktok/studio for a full content management experience.',
    icon:  '🎬',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'TikTok Script Generator',
    desc:  'AI-powered TikTok script generator that writes hooks, body, and CTA optimized for TikTok format. Uses 5 AI credits per script. Available to all plans.',
    icon:  '🤖',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Cross-Platform Posting',
    desc:  'Schedule the same video or content to all 7 platforms at once. One compose session reaches TikTok, Bluesky, X, Mastodon, Discord, Telegram, and LinkedIn simultaneously.',
    icon:  '🚀',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'AI Caption Writer',
    desc:  'Write TikTok captions with hashtags, hooks, and emojis in one click. The AI knows TikTok character limits and what captions actually perform.',
    icon:  '✍️',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Scheduling Calendar',
    desc:  'Full drag-and-drop calendar view of every scheduled TikTok post. See gaps, move posts around, and bulk-schedule an entire week of content in one session.',
    icon:  '📅',
    live:  true,
    badge: 'Live now',
  },
]

const PRICING = [
  {
    plan:     'Free',
    price:    '$0',
    note:     'forever',
    tiktok:   '20 TikTok videos/month',
    credits:  '50 AI credits/month',
    cta:      'Connect TikTok Free',
    href:     '/signup',
    highlight: false,
  },
  {
    plan:     'Pro',
    price:    '$5',
    note:     '/month',
    tiktok:   '60 TikTok videos/month',
    credits:  '500 AI credits/month',
    cta:      'Go Pro',
    href:     '/signup',
    highlight: true,
  },
  {
    plan:     'Agency',
    price:    '$20',
    note:     '/month',
    tiktok:   '200 TikTok videos/month',
    credits:  '2,000 AI credits/month',
    cta:      'Go Agency',
    href:     '/signup',
    highlight: false,
  },
]

export default function TikTokCreatorsPage() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-[#0a0a0a] text-white py-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-green-950 border border-green-700 rounded-full px-4 py-1.5 text-xs font-bold text-green-400 mb-6">
          🎵 TikTok Production API — Live
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Schedule TikTok. Post to 6 Platforms.{' '}
          <span className="text-[#fe2c55]">Free.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          TikTok&apos;s Production API is approved and live on SocialMate. Schedule videos
          directly to TikTok — plus Bluesky, X, Mastodon, Discord, and Telegram — from one
          dashboard. No per-post charges. Free on every plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="bg-[#fe2c55] hover:opacity-90 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            Connect TikTok Free →
          </Link>
          <Link
            href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            See pricing
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">
          Free forever · Production API approved · No per-post charges
        </p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            Manual TikTok posting is a full-time job
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">Without SocialMate</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-[#fe2c55]/10 border border-[#fe2c55]/30 rounded-2xl p-5">
                  <p className="text-xs text-[#fe2c55] font-bold uppercase tracking-wide mb-2">With SocialMate</p>
                  <p className="text-sm text-white leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-[#0a0a0a] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            Built for TikTok creators. Free for everyone.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            All TikTok scheduling features are included on the free plan. No gatekeeping.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border bg-gray-950 border-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-900 text-green-400">
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

      {/* ─── WHY FREE ─── */}
      <section className="bg-gradient-to-b from-[#fe2c55]/10 to-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">Why it&apos;s free</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
            TikTok doesn&apos;t charge per post. We don&apos;t either.
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
            X/Twitter charges $0.01 per tweet through their API, so SocialMate gates that behind
            a Pro plan. TikTok&apos;s Content Posting API has no per-post fee — just Supabase
            storage egress (~$0.09/GB). That cost is absorbed into the platform. You pay nothing
            extra to schedule TikTok videos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { platform: 'TikTok', cost: '$0 per post', note: 'Free on all plans', color: 'text-green-400' },
              { platform: 'Bluesky / Mastodon / Discord / Telegram', cost: '$0 per post', note: 'Open APIs — always free', color: 'text-green-400' },
              { platform: 'X / Twitter', cost: '$0.01 per tweet', note: 'Pro+ required (API cost passed through)', color: 'text-amber-400' },
            ].map((r, i) => (
              <div key={i} className="bg-black/40 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs font-extrabold text-gray-300 mb-1">{r.platform}</p>
                <p className={`text-lg font-black mb-1 ${r.color}`}>{r.cost}</p>
                <p className="text-xs text-gray-500">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-[#0a0a0a] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">All your platforms</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">7 platforms live today</h2>
          <p className="text-gray-400 text-sm mb-8">Schedule to all of them from one compose window — free.</p>

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
                <span className="text-sm font-bold">{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  p.highlight ? 'bg-[#fe2c55]/20 text-[#fe2c55]' : 'bg-green-900 text-green-400'
                }`}>
                  ✓ Live
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-gray-400 mb-4">Coming soon</h3>
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

      {/* ─── PRICING ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            TikTok scheduling included on every plan.
          </h2>
          <p className="text-gray-400 text-sm mb-12">
            Competitors charge $18+/month just for TikTok. SocialMate includes it free.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div
                key={tier.plan}
                className={`rounded-2xl p-6 border ${
                  tier.highlight
                    ? 'bg-[#fe2c55]/10 border-[#fe2c55]/50 ring-1 ring-[#fe2c55]/30'
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
                  <li>✓ {tier.credits}</li>
                  <li>✓ All 7 live platforms</li>
                  <li>✓ AI caption writer</li>
                  <li>✓ TikTok Script Generator</li>
                  <li>✓ Scheduling calendar</li>
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${
                    tier.highlight
                      ? 'bg-[#fe2c55] hover:opacity-90 text-white'
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
      <section className="bg-[#0a0a0a] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">TikTok Scheduler FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is TikTok scheduling really free on SocialMate?',
                a: "Yes. TikTok scheduling is free on every SocialMate plan including the free tier. Unlike X/Twitter which charges $0.01 per tweet (because the API is paid), TikTok's Content Posting API has no per-post cost. We pass that saving directly to you — zero extra charge.",
              },
              {
                q: 'What is the TikTok video limit per month?',
                a: 'Free plan: 20 TikTok videos per month. Pro ($5/month): 60 videos per month. Agency ($20/month): 200 videos per month. These are generous limits based on realistic posting schedules. The cost to us is only Supabase storage egress (~$0.09/GB), not a per-post API charge.',
              },
              {
                q: 'Do I need a TikTok Pro or Business account?',
                a: "No Pro or Business account required. SocialMate uses TikTok's Content Posting API which works with standard personal TikTok accounts. Just connect your account at /accounts and you're ready to schedule.",
              },
              {
                q: 'How does SocialMate post to TikTok?',
                a: "SocialMate uses TikTok's official Production-approved Content Posting API (FILE_UPLOAD method). When you schedule a video, SocialMate uploads it to secure storage and at your scheduled time, calls the TikTok API to publish directly to your profile. No manual posting, no third-party workarounds.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-900 pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-br from-[#fe2c55]/20 via-gray-950 to-[#0a0a0a] text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          The only free TikTok scheduler with a Production API.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Join SocialMate and schedule TikTok videos automatically — plus 5 other platforms — starting today. No credit card. No per-post fees.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#fe2c55] hover:opacity-90 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all"
        >
          Connect TikTok Free →
        </Link>
        <p className="text-gray-600 text-xs mt-4">No credit card · Production API approved · Free forever on the free plan</p>
      </section>
    </PublicLayout>
  )
}

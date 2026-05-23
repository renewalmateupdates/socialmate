import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Social Media for Podcasters — SocialMate',
  description: 'Stop promoting your podcast across 5 different apps. Schedule episode drops to all 7 platforms at once, generate AI captions for audiogram posts, and grow your listener community — free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Podcasters — SocialMate',
    description: 'Schedule podcast episode announcements to Bluesky, X, LinkedIn, Discord, Telegram, TikTok, and Mastodon in one click. SOMA generates your episode promos automatically.',
    url: 'https://socialmate.studio/for/podcasters',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Podcasters' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Podcasters — SocialMate',
    description: 'Promote your podcast on 7 platforms at once. Free tools built for podcasters.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/podcasters' },
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
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Instagram', icon: '📸' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Threads',   icon: '🧵' },
]

const PAIN_POINTS = [
  {
    before: 'New episode drops. Now post about it on Twitter. Then LinkedIn. Then Bluesky. Then Discord. Then Telegram.',
    after:  'Write one episode announcement. Post to all 7 platforms in 30 seconds.',
    icon:   '📣',
  },
  {
    before: 'Guest comes on your show. You scramble to announce it across 5 apps with no time left.',
    after:  'Pre-schedule all guest announcement posts before the episode even airs.',
    icon:   '🎙️',
  },
  {
    before: 'Your audiogram is ready but you have no idea what caption to write for each platform.',
    after:  'AI writes platform-native captions for your audiogram in one click.',
    icon:   '✍️',
  },
  {
    before: 'Your listener community is scattered across Reddit, Discord, and DMs.',
    after:  'Build your community in Discord — schedule announcements and updates directly to your server.',
    icon:   '💬',
  },
]

const FEATURES = [
  {
    title: 'Episode Launch Scheduler',
    desc:  'Schedule episode drop announcements to all 7 platforms at once. Set it before you publish and it fires automatically when your episode goes live.',
    icon:  '🚀',
    badge: 'Free',
  },
  {
    title: 'AI Caption Generator',
    desc:  'Stuck on what to write? Paste your episode title and description — AI writes punchy, platform-native captions. Hook variants, calls to action, the whole thing.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'Discord Listener Community',
    desc:  'Schedule episode announcements, Q&As, and listener updates directly to your Discord server. Build real community without switching apps.',
    icon:  '💬',
    badge: 'Free',
  },
  {
    title: 'SOMA — Episode Promo on Autopilot',
    desc:  'Upload your show notes. SOMA generates a full week of episode promo content: teasers, quotes, guest callouts, listener questions — platform-native for each channel.',
    icon:  '⚡',
    badge: 'Pro',
  },
  {
    title: 'Content Repurposer',
    desc:  'Turn one episode into 6 types of content automatically: Twitter thread, LinkedIn post, email newsletter intro, short hook, caption, and more. 1 click.',
    icon:  '♻️',
    badge: 'Pro',
  },
  {
    title: 'Evergreen Episode Recycling',
    desc:  'Your back catalog has gold in it. Set top episodes to auto-recycle every few weeks. Old episodes become new listeners.',
    icon:  '📻',
    badge: 'Free',
  },
  {
    title: 'LinkedIn Scheduling',
    desc:  'LinkedIn is the platform podcasters are sleeping on. Schedule thought leadership posts, guest announcements, and episode clips directly to your professional network.',
    icon:  '💼',
    badge: 'Free',
  },
  {
    title: 'Bulk Episode Scheduling',
    desc:  'Launching a new season? Batch schedule all your episode promos for the entire run in one sitting. Set it and forget it for months.',
    icon:  '📦',
    badge: 'Free',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    note:    'forever',
    credits: '50 AI credits/mo',
    cta:     'Start free',
    href:    '/signup',
    highlight: false,
  },
  {
    plan:    'Pro',
    price:   '$5',
    note:    '/month',
    credits: '500 AI credits/mo',
    cta:     'Go Pro',
    href:    '/signup',
    highlight: true,
  },
  {
    plan:    'Agency',
    price:   '$20',
    note:    '/month',
    credits: '2,000 AI credits/mo',
    cta:     'Go Agency',
    href:    '/signup',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'Can I schedule episode announcements in advance?',
    a: 'Yes. Write your announcement posts before your episode drops, schedule them for release day, and they fire automatically across all connected platforms. Great for coordinated launch campaigns.',
  },
  {
    q: 'Does this work for audiogram posts?',
    a: 'Yes. You can attach media to posts and write AI-generated captions optimized for audiogram content on each platform. TikTok, X, Bluesky, LinkedIn — each gets a caption that fits the vibe.',
  },
  {
    q: 'Can I schedule to my Discord server and podcast listener group at the same time?',
    a: 'Yes. Discord is a live platform on SocialMate. Connect your server, choose the right channel, and schedule episode announcements alongside all your other platforms in the same post.',
  },
  {
    q: 'What is SOMA and do I need it?',
    a: 'SOMA is SocialMate\'s AI content OS. You upload your show notes or episode transcript, and it generates a week of platform-native promo content automatically. It\'s a Pro+ add-on — the free plan gives you the scheduling tools and AI caption generator without SOMA.',
  },
  {
    q: 'Can I use this if I have multiple podcasts?',
    a: 'Agency plan gives you client workspaces — so you can manage multiple shows as separate workspaces, each with their own connected accounts and content calendars.',
  },
  {
    q: 'How much does it cost?',
    a: 'Free forever on the free plan (50 AI credits, all 7 platforms, full scheduler). Pro is $5/month (500 AI credits, SOMA access, Smart Queue, A/B testing). No credit card required to start.',
  },
]

export default function PodcastersPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Built for podcasters</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Promote your podcast.<br />
          <span className="text-orange-400">Everywhere. All at once.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          Stop switching between 5 apps every time you drop a new episode.
          Schedule announcements to all 7 platforms in one shot — Bluesky, X, LinkedIn,
          Discord, Telegram, TikTok, Mastodon. SOMA generates your promos automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/soma"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            See SOMA
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">Free forever · 7 live platforms · No credit card required</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            You shouldn&apos;t spend more time promoting<br />than actually making your show.
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">Without SocialMate</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-orange-950/40 border border-orange-800/50 rounded-2xl p-5">
                  <p className="text-xs text-orange-300 font-bold uppercase tracking-wide mb-2">With SocialMate</p>
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
          <p className="text-center text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            Everything a podcaster needs to grow.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            Core scheduling tools are free. AI-powered automation is on Pro.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-orange-900/50 text-orange-300'
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
      <section className="bg-gradient-to-b from-orange-950 to-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-orange-300 uppercase tracking-widest mb-3">3 steps</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-12">Episode drops. You&apos;re already everywhere.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { step: '1', title: 'Connect Your Platforms', desc: 'Link your Bluesky, X, LinkedIn, Discord, Telegram, TikTok, and Mastodon accounts once. Takes 5 minutes.' },
              { step: '2', title: 'Write Your Episode Post', desc: 'Write one announcement — or let AI generate it from your episode title and description. Customize per platform if you want.' },
              { step: '3', title: 'Schedule & Forget', desc: 'Pick your publish time, hit Schedule. All 7 platforms get your announcement the moment you want it. Zero manual posting.' },
            ].map((s) => (
              <div key={s.step} className="bg-black/40 border border-orange-900/50 rounded-2xl p-6">
                <div className="text-3xl font-black text-orange-400 mb-3">{s.step}</div>
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Where your episodes land</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Live on 7 platforms today</h2>
          <p className="text-gray-400 text-sm mb-8">Schedule to all of these from one compose window.</p>

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

          <h3 className="text-base font-extrabold text-gray-400 mb-4">Coming soon</h3>
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

      {/* ─── SOMA CALLOUT ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-orange-950/60 to-gray-900 border border-orange-800/40 rounded-3xl p-8 sm:p-10 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">SOMA — AI Content OS</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              Paste your show notes.<br />Get a week of promo content.
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
              SOMA reads your episode notes and generates platform-native content for every channel:
              teaser threads for X, audiogram captions for TikTok, professional announcements for LinkedIn,
              listener callouts for Discord. All in your voice. All scheduled automatically.
            </p>
            <Link href="/soma"
              className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all">
              Learn about SOMA →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">What competitors charge $99 for, we give for $5.</h2>
          <p className="text-gray-400 text-sm mb-12">Core scheduler is free. SOMA and Smart Queue unlock at Pro.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border ${tier.highlight
                  ? 'bg-orange-950/40 border-orange-700 ring-1 ring-orange-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-orange-300 uppercase tracking-widest mb-3">Most popular</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.note}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 mb-6 text-left">
                  <li>✓ {tier.credits}</li>
                  <li>✓ All 7 live platforms</li>
                  <li>✓ AI caption writer</li>
                  <li>✓ Scheduling calendar</li>
                  <li>✓ Discord & Telegram scheduling</li>
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-orange-500 hover:bg-orange-400 text-white'
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
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Podcaster FAQ</h2>
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
      <section className="bg-gradient-to-br from-orange-950 via-gray-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Your podcast deserves more ears.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Join SocialMate free and start scheduling episode announcements across all 7 platforms in minutes.
          No credit card. No commitment.
        </p>
        <Link href="/signup"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Create free account →
        </Link>
        <p className="text-gray-600 text-xs mt-4">Free forever on the free plan · All 7 platforms · No credit card</p>
      </section>

    </PublicLayout>
  )
}

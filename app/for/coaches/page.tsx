import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Social Media for Coaches & Consultants — SocialMate',
  description: 'Stop losing clients to coaches with worse credentials but better social media. Schedule a week of posts in 30 minutes, let AI write thought leadership content, and stay visible on LinkedIn — free or $5/month.',
  openGraph: {
    title: 'Social Media for Coaches & Consultants — SocialMate',
    description: 'Schedule posts to LinkedIn, X, Bluesky, Discord, and more in 30 minutes a week. SOMA generates coaching content in your voice automatically.',
    url: 'https://socialmate.studio/for/coaches',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Coaches' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Coaches & Consultants — SocialMate',
    description: 'Schedule a week of coaching content in 30 minutes. AI writes thought leadership in your voice.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/coaches' },
}

const PERSONAS = [
  { label: 'Life coach',           icon: '🌱' },
  { label: 'Business coach',       icon: '💼' },
  { label: 'Health coach',         icon: '🏃' },
  { label: 'Career consultant',    icon: '📈' },
  { label: 'Executive coach',      icon: '🎯' },
  { label: 'Financial advisor',    icon: '💰' },
  { label: 'Marketing consultant', icon: '📣' },
  { label: 'Mindset coach',        icon: '🧠' },
]

const LIVE_PLATFORMS = [
  { name: 'Bluesky',     icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',    icon: '🐘', note: 'Live' },
  { name: 'Discord',     icon: '💬', note: 'Live' },
  { name: 'Telegram',    icon: '✈️', note: 'Live' },
  { name: 'TikTok',      icon: '🎵', note: 'Live' },
  { name: 'LinkedIn',    icon: '💼', note: 'Live' },
]

const PAIN_POINTS = [
  {
    before: 'Client work fills every hour. No time left to post. No visibility, no new clients.',
    after:  'Schedule a full week of content on Sunday. Show up every day without lifting a finger.',
    icon:   '⏱️',
  },
  {
    before: 'Stare at a blank screen trying to write something that sounds "thought leader-y." 45 minutes gone.',
    after:  'AI writes thought leadership posts in your voice in 3 seconds. You just review and approve.',
    icon:   '✍️',
  },
  {
    before: 'Feel weird promoting yourself. Posting feels inauthentic.',
    after:  'SOMA generates content from your actual ideas and methods — not generic fluff.',
    icon:   '🎯',
  },
  {
    before: 'LinkedIn is where your clients are, but you never post consistently enough to matter.',
    after:  'Schedule LinkedIn posts in advance and build authority without being glued to your phone.',
    icon:   '💼',
  },
]

const FEATURES = [
  {
    title: 'LinkedIn Scheduling',
    desc:  'Your clients are on LinkedIn. Schedule thought leadership posts, client wins, and offers in advance. Show up consistently without the daily grind.',
    icon:  '💼',
    badge: 'Free',
  },
  {
    title: 'AI Thought Leadership Writer',
    desc:  'Type a topic or paste a voice note. AI generates a polished post that sounds like you — your framework, your voice, your clients. Not generic coaching-speak.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'SOMA — Coaching Content on Autopilot',
    desc:  'Upload your methodology, client FAQs, or coaching frameworks. SOMA generates a week of platform-native content automatically — LinkedIn posts, X threads, Discord insights, all in your voice.',
    icon:  '⚡',
    badge: 'Pro',
  },
  {
    title: 'Batch Your Week in 30 Minutes',
    desc:  'Schedule all 7 platforms in one sitting. Use templates, bulk-upload content ideas, or let Smart Queue fill optimal time slots automatically.',
    icon:  '📅',
    badge: 'Free',
  },
  {
    title: 'Content Repurposer',
    desc:  'Turn one piece of content into 6 formats: LinkedIn post, X thread, email snippet, short hook, Telegram update, Discord message. 1 click, 5 minutes saved.',
    icon:  '♻️',
    badge: 'Pro',
  },
  {
    title: 'Brand Voice AI',
    desc:  'Train the AI on your tone, vocabulary, and style once. Every AI-generated post will sound like you — not a template. Pro feature.',
    icon:  '🎙️',
    badge: 'Pro',
  },
  {
    title: 'Client Community via Discord & Telegram',
    desc:  'Schedule community updates, accountability check-ins, and group challenges to your client Discord or Telegram group automatically.',
    icon:  '💬',
    badge: 'Free',
  },
  {
    title: 'Analytics & Best Times',
    desc:  'See which content lands, when your audience is most active, and which platform drives the most engagement. Double down on what works.',
    icon:  '📊',
    badge: 'Pro',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    period:  'forever',
    credits: '50 AI credits/mo',
    seats:   '2 seats',
    highlight: false,
    cta:     'Start free — no card',
    href:    '/signup',
  },
  {
    plan:    'Pro',
    price:   '$5',
    period:  '/month',
    credits: '500 AI credits/mo',
    seats:   '5 seats',
    highlight: true,
    cta:     'Go Pro',
    href:    '/signup',
  },
]

const FAQ = [
  {
    q: 'Can I really schedule a week of content in 30 minutes?',
    a: 'Yes. Open compose, write or generate a post with AI, pick all your platforms, choose your schedule (or let Smart Queue pick optimal times), and repeat. Most coaches do a Sunday batch session and have the whole week covered in 30–45 minutes.',
  },
  {
    q: 'Will the AI actually sound like me, or will it sound generic?',
    a: 'Pro plan has Brand Voice — you set your tone, vocabulary, and style once, and every AI output reflects it. You can also give the AI specific topic prompts, frameworks, or phrases you use. It\'s not perfect out of the box, but it gets better the more you use it.',
  },
  {
    q: 'I\'m mostly on LinkedIn. Do I have to use all 7 platforms?',
    a: 'No. Connect only what you want. You can literally just connect LinkedIn and use SocialMate as a LinkedIn scheduler. But having Bluesky, X, or Telegram connected costs nothing extra — you might as well let the post go everywhere.',
  },
  {
    q: 'What is SOMA and should I use it?',
    a: 'SOMA is SocialMate\'s AI content system. You upload your coaching methodology, client FAQs, or any source material, and it generates a full week of posts in your voice across all your platforms. If you hate writing content, SOMA handles it. It\'s a Pro+ feature.',
  },
  {
    q: 'Can I schedule content for a client I manage?',
    a: 'Yes. Agency plan includes client workspaces — separate content calendars, connected accounts, and team access per client. If you manage social media for other coaches or businesses, Agency is built for you.',
  },
  {
    q: 'Is there a contract or long-term commitment?',
    a: 'No contract. Cancel anytime from your settings. No "call to cancel" nonsense. Free plan is free forever with no expiration.',
  },
]

export default function CoachesPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Built for coaches &amp; consultants</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Schedule a week of content<br />
          <span className="text-emerald-400">in 30 minutes flat.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-6">
          Your expertise is in delivering results — not posting on LinkedIn every day.
          SocialMate schedules your thought leadership content to all 7 platforms while you&apos;re
          busy coaching. AI writes it. You just approve.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
          {PERSONAS.map((p) => (
            <span key={p.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-300 font-medium">
              {p.icon} {p.label}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            See pricing
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">Free forever · LinkedIn scheduling live · No credit card required</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">We know the feeling</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            Your content shouldn&apos;t take<br />as long as your client sessions.
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">Right now</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-5">
                  <p className="text-xs text-emerald-300 font-bold uppercase tracking-wide mb-2">With SocialMate</p>
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
          <p className="text-center text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            The tools you actually need.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-lg mx-auto">
            Most features are free. SOMA and advanced AI tools unlock at Pro ($5/month).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-emerald-900/50 text-emerald-300'
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
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">7 platforms. One compose window.</h2>
          <p className="text-gray-400 text-sm mb-8">LinkedIn is live. Your clients are already there.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${
                  p.name === 'LinkedIn'
                    ? 'bg-blue-950/40 border-blue-700'
                    : 'bg-gray-900 border-gray-700'
                }`}>
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">✓ Live</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">No tricks. No tiers designed to confuse you.</h2>
          <p className="text-gray-400 text-sm mb-12 max-w-lg mx-auto">Free plan is real. Pro is $5. That&apos;s it.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-emerald-950/40 border-emerald-700 ring-1 ring-emerald-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-3">Most popular</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.period}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 mb-6">
                  <li>✓ {tier.credits}</li>
                  <li>✓ {tier.seats}</li>
                  <li>✓ All 7 live platforms</li>
                  <li>✓ LinkedIn scheduling</li>
                  <li>✓ AI caption writer</li>
                  <li>✓ Link in Bio page</li>
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Coach &amp; Consultant FAQ</h2>
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
      <section className="bg-gradient-to-b from-emerald-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Your expertise deserves an audience.<br />Let&apos;s build it.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Free forever on the free plan. $5/month if you need more.
          No credit card, no commitment, no fluff.
        </p>
        <Link href="/signup"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Create free account →
        </Link>
        <p className="text-gray-600 text-xs mt-4">LinkedIn scheduling live · AI content writer included · All 7 platforms</p>
      </section>

    </PublicLayout>
  )
}

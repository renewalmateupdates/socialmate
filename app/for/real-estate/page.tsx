import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Social Media for Real Estate Agents — SocialMate',
  description: 'Free social media scheduler for real estate agents. Schedule listing announcements on LinkedIn, cross-post to 7 platforms, and let AI generate real estate content — free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Real Estate Agents — SocialMate',
    description: 'Schedule listing announcements, market updates, and client wins across LinkedIn and 6 more platforms. Real estate social media that runs on autopilot.',
    url: 'https://socialmate.studio/for/real-estate',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Real Estate Agents' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Real Estate Agents — SocialMate',
    description: 'Real estate social media scheduling. LinkedIn live. Free forever or $5/month.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/real-estate' },
}

const LIVE_PLATFORMS = [
  { name: 'LinkedIn',   icon: '💼', note: 'Live' },
  { name: 'Bluesky',   icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',   icon: '🐘', note: 'Live' },
  { name: 'Discord',    icon: '💬', note: 'Live' },
  { name: 'Telegram',   icon: '✈️', note: 'Live' },
  { name: 'TikTok',     icon: '🎵', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Pinterest', icon: '📌' },
]

const PAIN_POINTS = [
  {
    before: 'Listing goes live. You post it once. It disappears from feeds in 20 minutes. Buyer never sees it.',
    after:  'Schedule a full campaign: announcement, open house reminder, price drop, sold post — all pre-planned.',
    icon: '🏡',
  },
  {
    before: 'LinkedIn is where serious buyers and referral partners live. You know you need to post more. You never do.',
    after:  'LinkedIn scheduling is live. Write once, schedule weeks in advance. Stay top-of-mind without daily effort.',
    icon: '💼',
  },
  {
    before: 'Writing "Just Listed!" for the 50th time. Same caption, same energy, same low engagement.',
    after:  'AI generates fresh listing captions, market insight posts, and client win stories based on your niche.',
    icon: '✍️',
  },
]

const FEATURES = [
  {
    title: 'LinkedIn Scheduling — Live Now',
    desc:  'LinkedIn is the highest-value platform for real estate professionals. Connect your LinkedIn personal profile and schedule posts weeks in advance. Consistent presence without daily effort.',
    icon:  '💼',
    badge: 'Free',
  },
  {
    title: 'Schedule Listing Campaigns in Advance',
    desc:  'For every listing, build a campaign: announcement post, open house reminder, price update, sold announcement. Schedule them all at once. They fire automatically on your timeline.',
    icon:  '🏡',
    badge: 'Free',
  },
  {
    title: 'SOMA AI Generates Real Estate Content',
    desc:  'Tell SOMA your market, niche (luxury, first-time buyers, investment), and tone — it writes listing captions, market update posts, and thought leadership content that sounds like you.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'Cross-Post to 7 Platforms at Once',
    desc:  'One listing. Seven platforms. Hit schedule and your post goes to LinkedIn, Bluesky, X, Mastodon, Discord, Telegram, and TikTok simultaneously. Zero copy-paste.',
    icon:  '📡',
    badge: 'Free',
  },
  {
    title: 'Team Seats for Your Transaction Coordinator',
    desc:  'Add your TC, marketing assistant, or partner. Free plan includes 2 seats. Pro includes 5. No extra charge per seat — everyone schedules from the same account.',
    icon:  '👥',
    badge: 'Free',
  },
  {
    title: 'Agency Plan for Teams & Brokerages',
    desc:  'Run social media for your entire team or brokerage. 5 client workspaces, 15 seats, client approval workflows — manage every agent\'s content from one Agency account.',
    icon:  '🏢',
    badge: 'Agency',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    period:  'forever',
    highlight: false,
    cta:     'Start free — no card',
    href:    '/signup',
    perks: [
      '50 AI credits/month',
      '7 live platforms including LinkedIn',
      'Post calendar & drafts',
      'Link in Bio page',
      '2 team seats',
    ],
  },
  {
    plan:    'Pro',
    price:   '$5',
    period:  '/month',
    highlight: true,
    cta:     'Go Pro',
    href:    '/signup',
    perks: [
      '500 AI credits/month',
      'All 7 platforms',
      'SOMA AI content generator',
      'Evergreen recycling',
      '5 team seats',
    ],
  },
  {
    plan:    'Agency',
    price:   '$20',
    period:  '/month',
    highlight: false,
    cta:     'Go Agency',
    href:    '/signup',
    perks: [
      '2,000 AI credits/month',
      '15 seats',
      '5 client workspaces',
      'All platforms + features',
      'Client approval workflows',
    ],
  },
]

const FAQ = [
  {
    q: 'Is LinkedIn scheduling actually live?',
    a: "Yes, LinkedIn personal profile scheduling went live May 21, 2026. Connect your LinkedIn account at /accounts and you can schedule posts directly from SocialMate — no workarounds needed.",
  },
  {
    q: 'Can I schedule listing posts weeks in advance?',
    a: "Yes. Pro and Agency plans have unlimited scheduling windows. Free plan has a 2-week window. Build your listing campaigns upfront and they post automatically at the times you set.",
  },
  {
    q: 'Will SOMA AI write real estate content that doesn\'t sound generic?',
    a: "SOMA has a Voice DNA Builder where you describe your market, niche, and personality. It learns your style and generates listing captions, market updates, and thought leadership posts that sound like you — not a template.",
  },
  {
    q: 'I\'m a team leader — can I manage multiple agents\' social media?',
    a: "The Agency plan ($20/mo) gives you 5 client workspaces and 15 seats. Each agent gets their own workspace with a separate content calendar. You review and approve content before it goes live.",
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function RealEstatePage() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Built for real estate agents</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Stay top-of-mind.<br />
          <span className="text-cyan-400">Without posting manually every day.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          Schedule listing campaigns, market updates, and LinkedIn posts weeks in advance.
          AI generates the captions. 7 platforms in one dashboard.
          Free forever, or $5/month when you need more.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            Start free — no credit card →
          </Link>
          <Link href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            See pricing
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">Free forever · LinkedIn live · 7 platforms · No credit card required</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">The real estate agent reality</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            Referrals come from staying visible.<br />But who has time to post every day?
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">Right now</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-2xl p-5">
                  <p className="text-xs text-cyan-300 font-bold uppercase tracking-wide mb-2">With SocialMate</p>
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
          <p className="text-center text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            How SocialMate helps real estate agents build a consistent presence.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            Most features are on the free plan. LinkedIn is live today.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-green-900/50 text-green-400'
                      : f.badge === 'Agency'
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'bg-yellow-900/50 text-yellow-300'
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Where buyers and referral partners find you</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">7 platforms. One dashboard.</h2>
          <p className="text-gray-400 text-sm mb-8">LinkedIn is live. Schedule to all 7 platforms right now, for free.</p>
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

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">What your CRM charges just for email, we include with social scheduling.</h2>
          <p className="text-gray-400 text-sm mb-12">Free plan is real. Pro is $5. Agency for teams and brokerages.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-cyan-950/40 border-cyan-700 ring-1 ring-cyan-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3">Most popular</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.period}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk}>✓ {perk}</li>
                  ))}
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Real estate agent FAQ</h2>
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
      <section className="bg-gradient-to-b from-cyan-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          The next referral is looking at your feed right now.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Start free. Schedule your first listing campaign in the next 20 minutes.
        </p>
        <Link href="/signup"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Create free account →
        </Link>
        <p className="text-gray-600 text-xs mt-4">No credit card · No trial · Free forever on the free plan</p>
      </section>

    </PublicLayout>
  )
}

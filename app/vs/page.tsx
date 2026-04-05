import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Other Social Media Tools (2026) — Full Comparisons',
  description: 'See how SocialMate compares to Hootsuite, Buffer, Later, Sprout Social, Loomly, CoSchedule, MeetEdgar, Metricool, Sendible, SocialPilot, and more. Free plan, no credit card.',
  openGraph: {
    title:       'SocialMate vs Other Social Media Tools (2026)',
    description: 'Honest, detailed comparisons between SocialMate and 14 popular social media scheduling tools. Free plan always available.',
    url:         'https://socialmate.studio/vs',
  },
  alternates: { canonical: 'https://socialmate.studio/vs' },
}

const COMPARISONS = [
  {
    slug:        'hootsuite',
    name:        'Hootsuite',
    emoji:       '🦉',
    headline:    'Hootsuite starts at $99/month',
    angle:       'No free plan. Prices have tripled since 2023. SocialMate gives you bulk scheduling and multi-platform posting for $0.',
    tag:         'Most expensive',
    tagColor:    'bg-red-50 text-red-600',
  },
  {
    slug:        'buffer',
    name:        'Buffer',
    emoji:       '📦',
    headline:    'Buffer free plan: 3 channels, 10 posts total',
    angle:       "Buffer's free tier is so limited it's almost unusable for real posting. Bulk scheduling is locked behind paid plans.",
    tag:         'Severely limited free',
    tagColor:    'bg-orange-50 text-orange-600',
  },
  {
    slug:        'later',
    name:        'Later',
    emoji:       '📷',
    headline:    "Later's free plan is Instagram-only",
    angle:       'Later was built for Instagram and TikTok. If you post on Bluesky, Discord, Telegram, or Mastodon — Later is useless.',
    tag:         'Instagram-only focus',
    tagColor:    'bg-pink-50 text-pink-600',
  },
  {
    slug:        'sendible',
    name:        'Sendible',
    emoji:       '📡',
    headline:    'Sendible starts at $29/month — no free plan',
    angle:       'Built for agencies, priced for agencies. Solo creators and small teams pay for features they\'ll never use.',
    tag:         'Agency-priced',
    tagColor:    'bg-purple-50 text-purple-600',
  },
  {
    slug:        'metricool',
    name:        'Metricool',
    emoji:       '📊',
    headline:    'Metricool free plan caps at 50 posts/month',
    angle:       'Hit 50 posts and you stop. Per-brand pricing means costs multiply fast if you manage multiple clients or projects.',
    tag:         'Post-limit free plan',
    tagColor:    'bg-yellow-50 text-yellow-600',
  },
  {
    slug:        'publer',
    name:        'Publer',
    emoji:       '📤',
    headline:    'Publer free plan: 3 accounts, 10 posts each',
    angle:       'Publer looks affordable until you add accounts. Features like AI assist and bulk upload are paywalled.',
    tag:         'Account-capped',
    tagColor:    'bg-blue-50 text-blue-600',
  },
  {
    slug:        'planable',
    name:        'Planable',
    emoji:       '🗂️',
    headline:    'Planable free plan: 50 posts total — lifetime',
    angle:       "Not 50 posts per month. 50 posts ever. Once you hit the limit, you're done unless you pay $33/month.",
    tag:         'Lifetime post cap',
    tagColor:    'bg-red-50 text-red-600',
  },
  {
    slug:        'sprout-social',
    name:        'Sprout Social',
    emoji:       '🌱',
    headline:    'Sprout Social starts at $249/month',
    angle:       'The most expensive tool in the space by far. 5 social profiles for $249/mo. Built for enterprise, priced for enterprise.',
    tag:         'Enterprise pricing',
    tagColor:    'bg-red-50 text-red-600',
  },
  {
    slug:        'socialpilot',
    name:        'SocialPilot',
    emoji:       '🛩️',
    headline:    'SocialPilot has no free plan at all',
    angle:       "$25.50/month minimum, billed annually. No way to try it before paying. Heavy Instagram/Facebook focus — Bluesky and Discord aren't supported.",
    tag:         'No free tier',
    tagColor:    'bg-orange-50 text-orange-600',
  },
  {
    slug:        'zoho-social',
    name:        'Zoho Social',
    emoji:       '🔷',
    headline:    'Zoho Social is a Zoho ecosystem product',
    angle:       'Powerful if you already use Zoho CRM. Overkill — and confusing — if you just want to schedule posts.',
    tag:         'CRM-first tool',
    tagColor:    'bg-teal-50 text-teal-600',
  },
  {
    slug:        'loomly',
    name:        'Loomly',
    emoji:       '📅',
    headline:    'Loomly starts at $32/month — no free plan',
    angle:       'Per-workspace pricing means your costs multiply fast. SocialMate gives you multi-brand management for free.',
    tag:         'Per-workspace pricing',
    tagColor:    'bg-orange-50 text-orange-600',
  },
  {
    slug:        'coschedule',
    name:        'CoSchedule',
    emoji:       '🗓️',
    headline:    "CoSchedule free plan can't auto-publish",
    angle:       "Free tier requires you to manually click publish every time. If you want actual scheduling, you're paying from day one.",
    tag:         'No free auto-publish',
    tagColor:    'bg-red-50 text-red-600',
  },
  {
    slug:        'meetedgar',
    name:        'MeetEdgar',
    emoji:       '🔄',
    headline:    'MeetEdgar charges $29/month for evergreen recycling',
    angle:       "MeetEdgar's main selling point — content recycling — is free on SocialMate. And we support Bluesky, Discord, and Mastodon too.",
    tag:         'Recycling not worth $29',
    tagColor:    'bg-purple-50 text-purple-600',
  },
  {
    slug:        'iconosquare',
    name:        'Iconosquare',
    emoji:       '📸',
    headline:    'Iconosquare starts at $49/month — analytics-first, not scheduling-first',
    angle:       "Iconosquare is an analytics tool that added scheduling, not the other way around. You're paying for data you probably don't need yet.",
    tag:         'Analytics-first, expensive',
    tagColor:    'bg-blue-50 text-blue-600',
  },
  {
    slug:        'tailwind-social',
    name:        'Tailwind',
    emoji:       '📌',
    headline:    "Tailwind's free plan is limited to 20 posts/month",
    angle:       "Tailwind was built for Pinterest and Instagram. If you're on Bluesky, Discord, Mastodon, or Telegram — Tailwind doesn't support them at all.",
    tag:         'Pinterest/Instagram only',
    tagColor:    'bg-pink-50 text-pink-600',
  },
  {
    slug:        'crowdfire',
    name:        'Crowdfire',
    emoji:       '🔥',
    headline:    "Crowdfire free plan: 3 accounts, 10 scheduled posts total",
    angle:       "Crowdfire's free tier is practically unusable for real scheduling. And most of the differentiating features — curated content, advanced analytics — require paid plans.",
    tag:         'Minimal free tier',
    tagColor:    'bg-orange-50 text-orange-600',
  },
  {
    slug:        'pallyy',
    name:        'Pallyy',
    emoji:       '🎨',
    headline:    "Pallyy free plan: 1 social group, 15 scheduled posts/month",
    angle:       "Pallyy's UI looks great but the free plan barely lets you get started. Heavy Instagram/TikTok focus means Bluesky, Discord, and Mastodon users get nothing.",
    tag:         'Visual-first, limited free',
    tagColor:    'bg-purple-50 text-purple-600',
  },
]

const SOCIALMATE_WINS = [
  { icon: '✅', text: 'Genuinely free forever — no credit card, no trial' },
  { icon: '📦', text: 'Bulk scheduler included on the free plan' },
  { icon: '🦋', text: 'Supports Bluesky, Discord, Telegram, Mastodon — not just Instagram' },
  { icon: '💰', text: 'Flat pricing — no per-brand or per-seat fees' },
  { icon: '🤖', text: 'AI caption tools built in, no add-ons needed' },
  { icon: '📅', text: 'Content calendar, queue, and analytics in one place' },
]

export default function VsIndex() {
  return (
    <div className="min-h-dvh bg-white dark:bg-gray-950">
      {/* NAV */}
      <nav className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          SocialMate
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Blog
          </Link>
          <Link href="/pricing" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Pricing
          </Link>
          <Link href="/signup"
            className="text-xs font-bold bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Try free →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HERO */}
        <div className="text-center mb-14">
          <div className="text-5xl mb-5">⚔️</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
            SocialMate vs Every Other<br className="hidden sm:block" /> Social Media Tool
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Honest, detailed comparisons. No fluff. We break down pricing, free plans, feature limits,
            and who each tool is actually built for — so you can pick the right one.
          </p>
        </div>

        {/* WHY SOCIALMATE WINS */}
        <div className="bg-black text-white rounded-2xl p-7 mb-12">
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-5">What SocialMate does differently</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOCIALMATE_WINS.map(w => (
              <div key={w.text} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{w.icon}</span>
                <p className="text-sm text-gray-300 leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/signup"
              className="inline-block bg-white text-gray-900 text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all">
              Start free — no credit card →
            </Link>
            <p className="text-xs text-white/40">Free forever. Not a trial.</p>
          </div>
        </div>

        {/* COMPARISON CARDS */}
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-5">
          Pick a comparison
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {COMPARISONS.map(c => (
            <Link
              key={c.slug}
              href={`/vs/${c.slug}`}
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all block">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.emoji}</span>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    SocialMate vs {c.name}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.tagColor}`}>
                  {c.tag}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{c.headline}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{c.angle}</p>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                See full comparison →
              </span>
            </Link>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-7 text-center">
          <p className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            Done comparing. Ready to try it?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Free forever. Bulk scheduler included. No credit card.
          </p>
          <Link href="/signup"
            className="inline-block bg-black dark:bg-white text-white dark:text-gray-900 text-sm font-bold px-7 py-3 rounded-xl hover:opacity-80 transition-all">
            Create your free account →
          </Link>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-600">
          <p>© {new Date().getFullYear()} SocialMate · Free social media scheduling</p>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Blog</Link>
            <Link href="/pricing" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Privacy</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

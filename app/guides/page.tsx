'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const GUIDES = [
  {
    number: 'Vol. 1',
    title: 'Starting a Business From Scratch',
    subtitle: '(Even if You\'re Broke, Alone, and Nobody Believes In You)',
    description:
      'The real playbook: Wyoming LLC for $150, validating on Reddit before you build, getting your first customer with flyers, and what happens when your co-founder walks away. Everything they charge $500 courses for — free.',
    href: '/guides/starting-a-business',
    available: true,
    chapters: [
      'The Decision Nobody Makes Twice',
      'Validate Before You Build (The Reddit Method)',
      'Make It Legal for $200 or Less',
      'Build Your Stack for Free',
      'Get Your First Customer',
      'When Your Co-Founder Walks Away',
      'What the Streets Teach You About Business',
      'Building Through Loss',
    ],
    readTime: '25 min read',
    tags: ['Business', 'Startups', 'LLC', 'Bootstrap'],
  },
  {
    number: 'Vol. 2',
    title: 'Marketing on Zero Budget',
    subtitle: 'How to Grow Without Paying a Dollar in Ads',
    description:
      'Organic growth strategies for solo builders: content flywheels, community seeding, affiliate structures, and how to turn every platform into a distribution channel.',
    href: '/guides/marketing-zero-budget',
    available: true,
    chapters: [
      'The Marketing Nobody Teaches',
      'Your Story Is the Product',
      'The Content Flywheel',
      'Platform Seeding — Where to Start',
      'Community-First Distribution',
      'The Demo Video Method',
      'Turning Attention Into Customers',
      'Consistency Is the Strategy',
    ],
    readTime: '20 min read',
    tags: ['Marketing', 'Content', 'Growth', 'Social Media'],
  },
  {
    number: 'Vol. 3',
    title: 'Business Credit, Legal Foundations & Tax Breaks',
    subtitle: 'DUNS Numbers, PAYDEX Scores, Licenses, Deductions — All of It, Free',
    description:
      'The complete no-BS guide to building business credit from scratch, getting your DUNS number, what licenses you actually need, every major tax deduction explained with real numbers, LLC vs S-Corp, and what insurance to buy. Everything they charge $500 courses for — free.',
    href: '/guides/business-credit-legal',
    available: true,
    chapters: [
      'The DUNS Number',
      'Building Business Credit & PAYDEX',
      'Licenses & Registrations',
      'Tax Deductions (Section 179, Home Office, QBI)',
      'LLC vs. S-Corp Election',
      'Banking Setup',
      'Insurance',
    ],
    readTime: '40 min read',
    tags: ['Business Credit', 'Tax Breaks', 'LLC', 'Legal'],
  },
  {
    number: 'Vol. 4',
    title: 'Vibe Coding — Building with AI',
    subtitle: 'Ship Real Software With No CS Degree',
    description:
      'The actual workflow, the real stack, how to prompt, how to debug, and the mindset of building in stolen hours. From a solo founder who built a live SaaS at night while working a deli job. No gatekeeping.',
    href: '/guides/vibe-coding-with-ai',
    available: true,
    chapters: [
      'What Vibe Coding Actually Is',
      'The Stack (What I Actually Use)',
      'The Workflow',
      'Prompting That Ships',
      'When It Breaks — Debugging',
      'Going Live — The First Deploy',
      'The Mindset',
    ],
    readTime: '35 min read',
    tags: ['AI', 'Development', 'Claude Code', 'Solo Founder'],
  },
  {
    number: 'Vol. 5',
    title: 'Creator Monetization — How to Actually Get Paid',
    subtitle: 'The Real Stack for Turning an Audience Into Income',
    description:
      'Why creators stay broke, and how to fix it. Tip jars, fan subscriptions, digital products, brand deals, and affiliate income — stacked together. A realistic 12-month roadmap to $5K/month starting from zero, for any audience size.',
    href: '/guides/creator-monetization',
    available: true,
    chapters: [
      'Why Creators Stay Broke',
      'The Monetization Stack',
      'Tip Jars — Zero-Barrier Start',
      'Fan Subscriptions — Recurring Income',
      'Digital Products & Courses',
      'Brand Deals',
      'Affiliate Marketing',
      'Stacking to $5K/Month',
    ],
    readTime: '40 min read',
    tags: ['Monetization', 'Creator Economy', 'Income Streams', 'Digital Products'],
  },
  {
    number: 'Vol. 6',
    title: 'Your First 30 Days on Social Media',
    subtitle: "The Creator's Launchpad",
    description:
      "Why most creators quit before Day 30 — and how to not be one of them. The One-Platform Rule, how to set up profiles that convert, a 10-post starter framework, a consistency system that removes decision fatigue, and how to get your first 100 followers without spending a dollar.",
    href: '/guides/first-30-days-social-media',
    available: true,
    chapters: [
      'Why Most Creators Quit Before Day 30',
      'Choosing Your Starting Platform (The One-Platform Rule)',
      'Setting Up Your Profiles the Right Way',
      'Your First 10 Posts',
      'The Consistency System That Actually Works',
      'How to Get Your First 100 Followers Without Ads',
      'Understanding What\'s Working (Basic Analytics)',
      'What Happens After Day 30',
    ],
    readTime: '30 min read',
    tags: ['Social Media', 'Beginners', 'Consistency', 'Growth'],
  },
  {
    number: 'Vol. 7',
    title: 'Build Your Brand from Zero',
    subtitle: 'The No-Budget Personal Brand Playbook',
    description:
      "What a personal brand actually is (it's not what you think), how to find your niche without pigeonholing yourself, telling your story, building a visual identity for free with Canva, developing your voice, consistency vs. virality, and turning your brand into real opportunity.",
    href: '/guides/build-your-brand-from-zero',
    available: true,
    chapters: [
      'What a Personal Brand Actually Is',
      'Finding Your Niche Without Pigeonholing Yourself',
      'Your Story Is Your Brand',
      'The Visual Identity You Can Build for Free',
      'Your Voice: How to Sound Like Yourself Online',
      'Consistency vs. Virality',
      'Building a Community, Not Just a Following',
      'Turning Your Brand Into Opportunity',
    ],
    readTime: '35 min read',
    tags: ['Personal Brand', 'Branding', 'Voice', 'Community'],
  },
  {
    number: 'Vol. 8',
    title: 'From Side Hustle to Full-Time Creator',
    subtitle: 'The Realistic Roadmap',
    description:
      "The unfiltered guide to going full-time — written by someone still in the middle of the journey. Building while you work, your first $500 online, the creator revenue stack, when the numbers are actually ready to quit your job, and what full-time really looks like.",
    href: '/guides/side-hustle-to-full-time-creator',
    available: true,
    chapters: [
      'The Honest Truth About Going Full-Time',
      'Building While You Work (The After-Hours Schedule)',
      'Your First $500 Online',
      'The Creator Revenue Stack',
      'When to Quit Your Day Job',
      'The Mental Game of Building in Public',
      'Building Systems So the Business Runs Without You',
      'What Full-Time Actually Looks Like',
    ],
    readTime: '35 min read',
    tags: ['Full-Time Creator', 'Revenue', 'Side Hustle', 'Income'],
  },
  {
    number: 'Vol. 9',
    title: "The Content Creator's Business Guide",
    subtitle: 'Run It Like a Company',
    description:
      "Everything they charge $500 business courses for — organized for creators. Making it official with an LLC, taxes you actually need to know, contracts that protect you, pricing your work (stop undercharging), tools worth the cost, brand deal negotiation, and building a team.",
    href: '/guides/content-creator-business',
    available: true,
    chapters: [
      "You're a Business, Not a Hobby (Make It Official)",
      'Taxes for Creators: What You Actually Need to Know',
      'Contracts and Deals: Protect Yourself Every Time',
      'Pricing Your Work (Stop Undercharging)',
      'Creator Tools and Software Worth the Cost',
      'Collaborations, Sponsorships, and Brand Deals',
      "Building a Team When You're Ready to Scale",
    ],
    readTime: '30 min read',
    tags: ['Business', 'Taxes', 'Contracts', 'Brand Deals'],
  },
  {
    number: 'Vol. 10',
    title: 'AI Tools for Creators: The Complete 2026 Handbook',
    subtitle: 'The Creator\'s Unfair Advantage',
    description:
      "The full AI stack for creators in 2026: AI for ideation, writing and captions, visuals and video, scheduling and distribution, analytics and strategy. The complete toolkit that costs almost nothing — and the human thing no model can ever replace.",
    href: '/guides/ai-tools-for-creators-2026',
    available: true,
    chapters: [
      "Why AI Is the Creator's Unfair Advantage Right Now",
      'AI for Content Ideation (Never Run Out of Ideas)',
      'AI for Writing and Captions',
      'AI for Visuals and Video',
      'AI for Scheduling and Distribution',
      'AI for Analytics and Strategy',
      'The AI Stack That Costs Almost Nothing',
      "The Human Thing AI Can't Replace",
    ],
    readTime: '35 min read',
    tags: ['AI Tools', 'Productivity', 'Creator Stack', '2026'],
  },
]

export default function GuidesHubPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <section className="border-b border-[#1f1f1f] px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
              {t('guides_landing.free_badge')}
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight text-white md:text-6xl">
              {t('guides_landing.title')}
            </h1>
            <p className="mb-4 text-xl leading-relaxed text-gray-300 md:text-2xl">
              {t('guides_landing.hero_tagline')}
            </p>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500">
              {t('guides_landing.hero_desc_before')}{' '}
              <span className="text-amber-400">Joshua Bostic</span>{' '}
              {t('guides_landing.hero_desc_after')}
            </p>
          </div>
        </section>

        {/* About the series */}
        <section className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                {t('guides_landing.why_badge')}
              </p>
              <p className="mb-4 text-lg leading-relaxed text-gray-200">
                {t('guides_landing.why_para1')}
              </p>
              <p className="mb-4 leading-relaxed text-gray-400">
                {t('guides_landing.why_para2')}
              </p>
              <p className="leading-relaxed text-gray-400">
                {t('guides_landing.why_para3')}{' '}
                <span className="text-white">{t('guides_landing.why_para3_highlight')}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Guides list */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-8">
            {GUIDES.map((guide) => (
              <article
                key={guide.number}
                className="group rounded-2xl border border-[#1f1f1f] bg-[#111111] p-8 transition-colors hover:border-amber-500/30"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                    {guide.number}
                  </span>
                  {guide.available ? (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                      {t('guides_landing.available_now')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-500 border border-gray-700">
                      {t('guides_landing.coming_soon')}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">{guide.readTime}</span>
                </div>

                <h2 className="mb-1 text-2xl font-black text-white">{guide.title}</h2>
                <p className="mb-4 text-sm text-gray-500 italic">{guide.subtitle}</p>
                <p className="mb-6 leading-relaxed text-gray-400">{guide.description}</p>

                {guide.chapters.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-600">
                      {t('guides_landing.chapters_label')}
                    </p>
                    <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {guide.chapters.map((ch, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="text-amber-500/60">—</span>
                          {ch}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-6 flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1 text-xs text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {guide.available ? (
                  <Link
                    href={guide.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
                  >
                    {t('guides_landing.read_guide_cta')}
                    <span>→</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-6 py-3 text-sm font-bold text-gray-600"
                  >
                    {t('guides_landing.coming_soon')}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Support / Donate */}
        <section className="border-t border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <div className="mb-3 text-4xl">☕</div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">{t('guides_landing.support_badge')}</p>
              <h2 className="mb-4 text-2xl font-black text-white">
                {t('guides_landing.support_title')}
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-400">
                {t('guides_landing.support_desc')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Support Joshua */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-7 text-center">
                <div className="mb-3 text-3xl">👑</div>
                <h3 className="mb-2 text-lg font-extrabold text-white">{t('guides_landing.support_joshua_title')}</h3>
                <p className="mb-6 text-sm leading-relaxed text-gray-400">
                  {t('guides_landing.support_joshua_desc')}
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
                >
                  {t('guides_landing.try_socialmate_cta')}
                </Link>
              </div>
              {/* Pay It Forward / donate */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-7 text-center">
                <div className="mb-3 text-3xl">❤️</div>
                <h3 className="mb-2 text-lg font-extrabold text-white">{t('guides_landing.pay_forward_title')}</h3>
                <p className="mb-6 text-sm leading-relaxed text-gray-400">
                  {t('guides_landing.pay_forward_desc')}
                </p>
                <Link
                  href="/give"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-6 py-3 text-sm font-bold text-rose-400 transition-colors hover:bg-rose-500/25"
                >
                  {t('guides_landing.donate_cta')}
                </Link>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-gray-700">
              {t('guides_landing.no_pressure')}
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-[#1f1f1f] px-6 py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-2xl font-black text-white">
              {t('guides_landing.footer_cta_title')}
            </p>
            <p className="mb-8 leading-relaxed text-gray-500">
              {t('guides_landing.footer_cta_desc')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-3 font-bold text-black transition-colors hover:bg-amber-400"
              >
                {t('guides_landing.try_socialmate_cta')}
              </Link>
              <Link
                href="/gils-guide"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111111] px-8 py-3 font-bold text-white transition-colors hover:border-amber-500/30"
              >
                {t('guides_landing.about_guide_cta')}
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#1f1f1f] px-6 py-8 text-center">
          <p className="text-xs text-gray-700">
            {t('guides_landing.footer_copy')}
          </p>
        </footer>
      </main>
    </PublicLayout>
  )
}

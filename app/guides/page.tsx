import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: "Gilgamesh's Guides — Free Business & Creator Playbooks",
  description:
    "Real-talk guides for solo builders, creators, and people starting from nothing. No fluff. No gatekeeping. Written by Joshua Bostic, founder of SocialMate.",
  openGraph: {
    title: "Gilgamesh's Guides — Free Playbooks for Real Builders",
    description:
      "Free, no-BS guides on starting a business, marketing from zero, and building with AI. From a bootstrapped solo founder who works a deli job and ships software at night.",
    type: 'website',
  },
}

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
      'Organic growth strategies for solo builders: content flywheels, community seeding, affiliate structures, and how to turn every platform into a distribution channel. Coming soon.',
    href: '/guides/marketing-zero-budget',
    available: false,
    chapters: [],
    readTime: '~20 min read',
    tags: ['Marketing', 'Content', 'Growth', 'Social Media'],
  },
  {
    number: 'Vol. 3',
    title: 'Vibe Coding — Building with AI',
    subtitle: 'The Solo Founder\'s Complete AI Development Playbook',
    description:
      'How to ship production software with no CS degree using AI as your co-pilot. The real workflow, the real mistakes, and why vision matters more than syntax. Coming soon.',
    href: '/guides/vibe-coding-with-ai',
    available: false,
    chapters: [],
    readTime: '~30 min read',
    tags: ['AI', 'Development', 'Claude', 'Productivity'],
  },
]

export default function GuidesHubPage() {
  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <section className="border-b border-[#1f1f1f] px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
              Free. Always.
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight text-white md:text-6xl">
              Gilgamesh&apos;s Guides
            </h1>
            <p className="mb-4 text-xl leading-relaxed text-gray-300 md:text-2xl">
              Real playbooks for people building from nothing.
            </p>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500">
              Written by{' '}
              <span className="text-amber-400">Joshua Bostic</span> — founder of SocialMate,
              bootstrapped solo builder, works a deli job nights and weekends, ships software
              at 2am. Everything in these guides is earned, not theorized.
            </p>
          </div>
        </section>

        {/* About the series */}
        <section className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                Why these exist
              </p>
              <p className="mb-4 text-lg leading-relaxed text-gray-200">
                When I started building, I had no mentor, no co-founder who stayed, no VC, no
                network. I had a laptop, a WiFi connection, and a chip on my shoulder the size
                of a city block.
              </p>
              <p className="mb-4 leading-relaxed text-gray-400">
                I couldn&apos;t afford the $500 business courses. I didn&apos;t have a CTO friend. I
                learned everything the hard way — by doing it wrong first, then figuring it
                out. I watched free YouTube videos at 3am. I Googled everything. I read
                Reddit threads from other broke founders. And eventually, I shipped something
                real.
              </p>
              <p className="leading-relaxed text-gray-400">
                These guides are everything I wish someone had handed me. No fluff. No
                gatekeeping. No upsell at the end.{' '}
                <span className="text-white">Just the door, wide open.</span>
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
                      Available Now
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-500 border border-gray-700">
                      Coming Soon
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
                      Chapters
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
                    Read the Guide
                    <span>→</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-6 py-3 text-sm font-bold text-gray-600"
                  >
                    Coming Soon
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-[#1f1f1f] px-6 py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-2xl font-black text-white">
              Want more from Joshua?
            </p>
            <p className="mb-8 leading-relaxed text-gray-500">
              SocialMate is the tool he built while writing these guides — a full social
              media OS for creators and businesses. Free plan, always. Because power to the
              people isn&apos;t just a tagline.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-3 font-bold text-black transition-colors hover:bg-amber-400"
              >
                Try SocialMate Free
              </Link>
              <Link
                href="/gils-guide"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111111] px-8 py-3 font-bold text-white transition-colors hover:border-amber-500/30"
              >
                About Gilgamesh&apos;s Guide
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#1f1f1f] px-6 py-8 text-center">
          <p className="text-xs text-gray-700">
            © Gilgamesh Enterprise LLC — Written by Joshua Bostic. All guides are free, forever.
          </p>
        </footer>
      </main>
    </PublicLayout>
  )
}

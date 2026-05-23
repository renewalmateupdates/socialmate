import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'About SocialMate | Built for Creators, By a Creator',
  description: 'SocialMate was built by a solo founder working a deli job at night — because he couldn\'t afford the tools that existed. This is the story of why we build the way we build.',
  openGraph: {
    title: 'About SocialMate | Built for Creators, By a Creator',
    description: 'One person. A deli job. A vision to tear down the gatekeeping walls of social media management. This is the SocialMate story.',
    url: 'https://socialmate.studio/about',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'About SocialMate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SocialMate | Built for Creators, By a Creator',
    description: 'Built by one person, working a deli job, for everyone who ever got priced out of the tools they needed.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/about' },
}

export default function AboutPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <img src="/logo.png" alt="SocialMate" className="w-20 h-20 rounded-3xl mx-auto mb-8" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Built by one person.<br />
            <span className="text-amber-400">For everyone.</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-xl mx-auto">
            SocialMate started because one founder couldn&apos;t find a social media scheduler that didn&apos;t
            cost $99/month. So he built one. Nights and weekends. While working a deli job at Walmart.
          </p>
        </div>
      </section>

      {/* ─── ORIGIN STORY ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">The origin story</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">
            How SocialMate actually happened
          </h2>

          <div className="space-y-6 text-gray-300 text-base leading-relaxed">
            <p>
              Joshua was trying to market RenewalMate — a subscription tracking app he was building.
              He needed a social media scheduler to stay consistent across platforms without
              spending hours every day manually posting.
            </p>
            <p>
              He looked at the options. Buffer. Hootsuite. Later. SocialBee. They all wanted $18–$99
              a month for the features he needed. For a solo bootstrapped founder working a deli job,
              that math didn&apos;t work.
            </p>
            <p>
              Then he found Claude Code on Product Hunt. And something clicked.
            </p>
            <p>
              He spent his nights and weekends building the tool he needed — a real multi-platform
              scheduler with AI built in, for people who can&apos;t afford the incumbents. In March 2026,
              SocialMate went live at socialmate.studio.
            </p>
            <p>
              Since then: 7 platforms live, 8 AI agents, SOMA (autonomous content generation),
              Enki (trading bot), 480+ blog posts, a Discord community, and a real product
              that thousands of people are using to stay consistent online — for free or $5/month.
            </p>
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">The mission</p>
          <blockquote className="text-2xl sm:text-3xl font-extrabold leading-snug mb-6">
            &ldquo;Power to the people. Tear down the gatekeeping walls. Build the door.&rdquo;
          </blockquote>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            Social media management tools have always been priced for agencies and enterprises.
            The people who actually needed them most — small creators, solo founders, nonprofits,
            coaches, bloggers — got left out or forced to hack together a janky free-tier solution.
          </p>
          <p className="text-gray-300 text-base leading-relaxed">
            SocialMate&apos;s answer is simple: what competitors charge $99/month for, we give for $5.
            Or free. Because the tool should work for you whether you have a budget or not.
          </p>
        </div>
      </section>

      {/* ─── EVERYTHING EVERYWHERE ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-950/50 to-gray-900 border border-amber-800/30 rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">The vision</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              Everything. Everywhere. All at once.
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Post to every platform simultaneously from one place. That&apos;s the core promise.
              Write once, reach everyone. 7 platforms live today — Bluesky, X/Twitter, LinkedIn,
              TikTok, Discord, Telegram, Mastodon — with more coming.
            </p>
            <p className="text-gray-300 text-base leading-relaxed">
              Beyond scheduling: SOMA generates a week of content from your ideas. Enki trades
              algorithmically. 8 AI agents run your outreach, newsletter, and community on autopilot.
              SocialMate isn&apos;t just a scheduler. It&apos;s a Creator OS — the home base for every
              creator, streamer, business, and person building online.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SM-GIVE ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-6">SM-Give</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
            2% of every subscription<br />goes to charity.
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            SM-Give is built into every subscription. 2% of every payment goes to charitable causes:
            homeless care, school supplies for underprivileged students, and support for single parents.
            Not as a future feature. Not as a marketing promise. Right now, on every transaction.
          </p>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            75% of every merch order goes to SM-Give too. When you buy a shirt, you&apos;re funding
            the give fund. It&apos;s the simplest version of &ldquo;business as a force for good&rdquo;
            we could build.
          </p>
          <Link href="/give"
            className="inline-block border border-rose-700 hover:bg-rose-950/40 text-rose-400 font-bold px-6 py-3 rounded-xl text-sm transition-all">
            ❤️ See SM-Give tracker →
          </Link>
        </div>
      </section>

      {/* ─── FOUNDER ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-8 text-center">The founder</p>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-3xl flex-shrink-0">
                J
              </div>
              <div>
                <h2 className="text-xl font-extrabold mb-1">Joshua Bostic</h2>
                <p className="text-amber-400 text-sm font-bold mb-4">Founder &amp; CEO · Gilgamesh Enterprise LLC · Wyoming</p>
                <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                  <p>
                    Solo bootstrapped founder. Working a deli job at Walmart while building SocialMate
                    nights and weekends. No VC. No co-founder. No engineering team. Just Claude Code,
                    a laptop, and a vision.
                  </p>
                  <p>
                    Background: self-taught. Built RenewalMate first. Failed at marketing it because
                    the tools were too expensive. Pivoted. Built SocialMate. Soft launched March 2026.
                    Product Hunt launch April 2026.
                  </p>
                  <p>
                    Philosophy: ship fast, stay honest, build for the people who got left out.
                    Don&apos;t wait for permission. Build the door.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10">By the numbers</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: '7',    label: 'Live platforms' },
              { value: '480+', label: 'Blog posts' },
              { value: '8',    label: 'AI agents' },
              { value: '$5',   label: 'Pro plan price' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                <p className="text-3xl font-black text-amber-400 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gradient-to-b from-gray-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Join us. It&apos;s free.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          No credit card. No pitch. No $99/month trial.
          Just a real tool built for real people by a real person.
        </p>
        <Link href="/signup"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Join for free →
        </Link>
        <p className="text-gray-600 text-xs mt-4">7 platforms · AI tools · Free forever on free plan</p>
      </section>

    </PublicLayout>
  )
}

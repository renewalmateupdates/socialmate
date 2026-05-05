import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: "Marketing on Zero Budget (Free Guide) — Gilgamesh's Guides",
  description:
    'How to grow your business, brand, or product with no ad budget. Organic content strategy, community seeding, platform flywheels, and how to turn attention into customers — for free.',
  keywords: [
    'how to market with no money',
    'organic marketing strategy',
    'grow business without ads',
    'content marketing for bootstrappers',
    'free marketing strategies',
    'social media growth without paid ads',
    'how to get first 1000 followers',
    'community marketing strategy',
    'content flywheel strategy',
  ],
  openGraph: {
    title: "Marketing on Zero Budget — Gilgamesh's Guide Vol. 2",
    description:
      'The no-ad-budget playbook: organic content, community seeding, platform flywheels, and how to grow without spending a dollar on ads.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',  label: 'Preface' },
  { id: 'ch1',      label: '1. The Marketing Nobody Teaches' },
  { id: 'ch2',      label: '2. Your Story Is the Product' },
  { id: 'ch3',      label: '3. The Content Flywheel' },
  { id: 'ch4',      label: '4. Platform Seeding — Where to Start' },
  { id: 'ch5',      label: '5. Community-First Distribution' },
  { id: 'ch6',      label: '6. The Demo Video Method' },
  { id: 'ch7',      label: '7. Turning Attention Into Customers' },
  { id: 'ch8',      label: '8. Consistency Is the Strategy' },
  { id: 'epilogue', label: 'Epilogue' },
]

export default function MarketingZeroBudgetPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <header className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link href="/guides" className="text-xs text-gray-600 hover:text-amber-400 transition-colors">
                ← All Guides
              </Link>
              <span className="text-gray-700">·</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Vol. 2
              </span>
              <span className="text-xs text-gray-600">20 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Marketing on Zero Budget
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              How to Grow Without Spending a Dollar on Ads
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>Written by <span className="text-amber-400">Joshua Bostic</span></span>
              <span>·</span>
              <span>Founder, SocialMate</span>
              <span>·</span>
              <span>© Gilgamesh Enterprise LLC</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex gap-12">
            {/* Sticky Table of Contents */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-8 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-600">
                  Table of Contents
                </p>
                <nav className="space-y-2">
                  {CHAPTERS.map(ch => (
                    <a key={ch.id} href={`#${ch.id}`}
                      className="block text-sm leading-snug text-gray-500 transition-colors hover:text-amber-400">
                      {ch.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 border-t border-[#1f1f1f] pt-6">
                  <Link href="/guides" className="block text-center text-xs text-gray-600 hover:text-amber-400 transition-colors">
                    ← More Guides
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <article className="min-w-0 flex-1">
              {/* Mobile TOC */}
              <div className="mb-10 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 lg:hidden">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-600">Chapters</p>
                <div className="columns-2 gap-4 space-y-1">
                  {CHAPTERS.map(ch => (
                    <a key={ch.id} href={`#${ch.id}`}
                      className="block text-sm text-gray-500 hover:text-amber-400 transition-colors">
                      {ch.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* PREFACE */}
              <section id="preface" className="mb-16 scroll-mt-8">
                <h2 className="mb-6 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Preface: What This Guide Is and Isn&apos;t
                </h2>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This guide is not about growth hacking. It&apos;s not about virality, gaming
                  algorithms, or tricks that work for two weeks until the platform changes its
                  rules. It&apos;s about building something real, sustainable, and repeatable —
                  without spending money you don&apos;t have.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I bootstrapped SocialMate — a social media scheduling platform — with zero
                  marketing budget. I built an audience, drove sign-ups, and grew a brand from
                  nothing, using only content, community, and consistency. I still do it this
                  way. This guide is exactly what I do.
                </p>
                <p className="leading-relaxed text-gray-300">
                  The good news: zero-budget marketing isn&apos;t a disadvantage. It&apos;s a filter. It
                  forces you to connect with people genuinely, to create content that actually
                  helps, and to build a community that trusts you — none of which money can buy.
                  The brands people love most are the ones that showed up consistently before
                  they had anything to sell.
                </p>
              </section>

              {/* CHAPTER 1 */}
              <section id="ch1" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 1: The Marketing Nobody Teaches
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why ads are the last resort, not the first move.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The marketing industry wants you to believe that growth requires ad spend.
                  That you need to pay Facebook or Google to put your business in front of
                  people. That organic reach is dead. That the only way to scale is to buy your
                  way there.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This is not true. It&apos;s a story told by companies that profit from your ad
                  spend.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The real truth: ads amplify what already works. They don&apos;t create what
                  doesn&apos;t work. A bad product with ad spend just reaches more people who don&apos;t
                  care. A good product with organic distribution builds a foundation that ads
                  can later accelerate.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Before you run your first ad, you need to know: does anyone care about this?
                  Does it resonate when I share it? Does anyone share it after me? The only way
                  to answer those questions is to go organic first.
                </p>

                <Callout>
                  Run zero-budget marketing until you understand what resonates. Then, if you
                  ever have budget, you&apos;ll know exactly what to amplify. Most founders do it
                  backwards — they spend on ads before they know what message works, and they
                  lose their money learning what organic would have taught them for free.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The marketing nobody teaches is this: the best growth strategy for a
                  bootstrapped founder is to be so genuinely helpful, so consistently present,
                  and so authentically yourself that people start bringing you customers. Word
                  of mouth. Referrals. Community reputation. These compound for years. An ad
                  campaign stops the second you stop paying for it.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Build the thing that compounds.
                </p>
              </section>

              {/* CHAPTER 2 */}
              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Your Story Is the Product
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why your background is your biggest marketing asset, and how to use it.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  In a world where AI can generate infinite generic content, the one thing that
                  can&apos;t be faked is your actual story. Your specific path. Your specific
                  struggle. Your specific reason for building what you built.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I built SocialMate while working a deli job. That&apos;s not a liability in my
                  marketing — it&apos;s the most powerful thing I have. It&apos;s proof that this isn&apos;t
                  a venture-backed startup with a marketing team and a PR firm. It&apos;s a real
                  person, building something real, from a place most of my potential users
                  recognize. That resonates in a way that polished brand copy never could.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s how to find and use your story:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Find the tension</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Every good story has tension — a gap between where you were and where you
                  want to go. What was the problem you had that nobody was solving? What made
                  you angry enough to build something? What was the moment you decided to
                  stop waiting for someone else to fix it? That tension is your hook.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Share the process, not just the wins</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Most founders only post when they have something to celebrate. The first
                  500 users, the press mention, the revenue milestone. But the posts that build
                  real audiences are the ones that share the messy middle — the bug that took
                  three days, the feature that failed, the launch that underwhelmed, the day
                  you almost quit. People connect with the struggle because they&apos;re in it too.
                </p>

                <Callout>
                  &quot;Build in public&quot; isn&apos;t a strategy for attention-seekers. It&apos;s a strategy for
                  trust-building. Every time you share honestly about the journey — wins and
                  losses both — you create a record that says: I&apos;m for real. I&apos;m not
                  manufacturing a narrative. I&apos;m actually building this, and you can watch.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Make your &quot;why&quot; public</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  People don&apos;t just buy products. They buy into missions. SocialMate&apos;s mission
                  — "Power to the people. Tear down the gatekeeping walls. Build the door." —
                  is not marketing copy. It&apos;s a genuine belief. I share it because I mean it.
                  And when the right people hear it, they don&apos;t just try the product. They
                  become advocates.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Figure out your why. Say it out loud. Then keep saying it until the people
                  who believe it find you.
                </p>
              </section>

              {/* CHAPTER 3 */}
              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: The Content Flywheel
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to create once and distribute everywhere, without burning out.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The mistake most founders make with content is treating it as a daily sprint.
                  They post something. It doesn&apos;t go viral. They feel deflated. They skip a
                  week. They fall off entirely.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The alternative is a flywheel — a system that gets easier and more effective
                  over time, not harder.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The one-to-many model</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Start with one &quot;pillar&quot; piece of content per week. Something with depth — a
                  LinkedIn post about a lesson learned, a blog post about a problem you solved,
                  a short video about something your users ask constantly.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  From that one piece, you extract everything else:
                </p>
                <ul className="mb-6 space-y-2 text-gray-300 pl-4">
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>The long LinkedIn post becomes 3 tweets/Bluesky posts</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>The 3 tweets become a short-form video script</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>The video script becomes a caption for TikTok and Instagram</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>The whole thing goes in a weekly digest email</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>The key quote from the post becomes a Discord/Telegram share</span></li>
                </ul>
                <p className="mb-4 leading-relaxed text-gray-300">
                  One idea. One hour of thinking. Five to eight pieces of content. This is how
                  you stay consistent without being a full-time content creator.
                </p>

                <Callout>
                  The flywheel works because you&apos;re not creating from scratch every time.
                  You&apos;re repackaging a good idea for different audiences and different formats.
                  The idea does the heavy lifting. The distribution is just packaging.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Schedule it or it won&apos;t happen</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This is where I&apos;ll be direct: if you rely on willpower to post consistently,
                  you will fail. Life will interrupt. You&apos;ll be tired. You&apos;ll feel like you
                  have nothing to say. The posts will stop.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Schedule your content in advance. Batch it once a week — write five posts in
                  one hour, schedule them all, and forget it. SocialMate exists literally for
                  this. You write when you&apos;re inspired, and the posts go out even when you&apos;re
                  not. That consistency is what compounds into an audience.
                </p>
              </section>

              {/* CHAPTER 4 */}
              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: Platform Seeding — Where to Start
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Which platforms to use first, and how to pick them without spreading yourself thin.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  One of the most common early mistakes: trying to be on every platform at
                  once. Instagram, TikTok, X, LinkedIn, YouTube, Pinterest — all at the same
                  time, none of them done well.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Pick two platforms and dominate them before expanding. Here&apos;s how to pick:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Go where your people already are</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Where are your potential customers spending time right now? Where do they ask
                  questions about the problem you solve? For B2B / professionals: LinkedIn.
                  For builders / founders: X/Twitter or Bluesky. For creative audiences: TikTok,
                  Instagram. For tech communities: Discord, Reddit, Mastodon. For streamers:
                  Twitch, Discord. Go there first.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The open platforms advantage</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s a strategic tip most people miss: start on the open, decentralized
                  platforms (Bluesky, Mastodon, Discord, Telegram) before attacking the
                  algorithm-heavy ones (Instagram, TikTok). Why?
                </p>
                <ul className="mb-6 space-y-2 text-gray-300 pl-4">
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span><strong className="text-white">Less competition.</strong> Everyone is fighting for eyeballs on Instagram. Bluesky and Mastodon are still wide open.</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span><strong className="text-white">Better quality engagement.</strong> The people on open platforms are often tech-forward early adopters — exactly who you want for a product in early stages.</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span><strong className="text-white">The algorithm doesn&apos;t gatekeep you.</strong> On Bluesky, if someone follows you, they see your posts. No algorithmic suppression. No pay-to-play.</span></li>
                </ul>

                <Callout>
                  I grew SocialMate&apos;s earliest audience on Bluesky and Discord. Not because
                  those were the biggest platforms — but because the people there were exactly
                  the kind of early adopters I needed, and the organic reach was real. Build
                  your foundation where you can actually reach people first.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Platform priorities for a bootstrapped product</h3>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">LinkedIn</strong> — Long-form story posts about your journey. High organic reach for B2B. Builds credibility fast.</li>
                  <li><strong className="text-white">Bluesky / X</strong> — Short punchy takes, product updates, community engagement. Fast feedback loop.</li>
                  <li><strong className="text-white">Reddit / Discord</strong> — Find your niche communities. Be genuinely helpful. Post content that adds value, not just product pitches.</li>
                  <li><strong className="text-white">TikTok / YouTube</strong> — Video content showing the product or the journey. High discovery potential but higher production bar.</li>
                </ol>
              </section>

              {/* CHAPTER 5 */}
              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: Community-First Distribution
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to use existing communities to grow before you have your own audience.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  You don&apos;t need an audience to market your product. You need access to
                  other people&apos;s audiences. This is community-first distribution, and it&apos;s
                  the fastest way to get traction with zero budget.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The give-first rule</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Join the communities where your customers are (subreddits, Discord servers,
                  Slack groups, Telegram channels, Twitter communities) and spend the first
                  month giving, not pitching. Answer questions. Share knowledge. Help people
                  with problems you actually know how to solve. Build a reputation as someone
                  worth listening to.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Then, when someone has the exact problem your product solves: mention it
                  naturally. &quot;Hey, I actually built something for this — it&apos;s free to start,
                  happy to share it.&quot; That hits completely differently than cold promotion.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Reddit seeding</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit has a strong anti-promotion culture, which means it also has strong
                  anti-spam immunity. That works in your favor if you&apos;re genuine. The key rules:
                </p>
                <ul className="mb-6 space-y-2 text-gray-300 pl-4">
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Maintain a karma ratio of at least 10:1 — for every promotional post, make 10 purely helpful ones</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Always disclose when you built the thing you&apos;re recommending</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Answer the question first, mention your product second (or not at all if it&apos;s not actually relevant)</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Post about your journey on r/entrepreneur, r/SaaS, r/startups — people there are interested in the builder story</span></li>
                </ul>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Discord and Telegram</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Find the 5–10 Discord servers and Telegram groups where your customers hang
                  out. Get in them. Read what people are asking about. Contribute. Over time,
                  your name becomes associated with expertise in the space. When you have
                  something to share, you have a warm audience.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Better yet: eventually start your own. A free Discord for your users is a
                  distribution channel you own forever. No algorithm. No platform dependency.
                  The people who join are self-selected as your most engaged potential advocates.
                </p>
              </section>

              {/* CHAPTER 6 */}
              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: The Demo Video Method
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why a 2-minute screen recording beats a thousand words of copy.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The single most underused marketing tool for early-stage products is the
                  demo video. Not a produced commercial. Not a sales deck. A simple screen
                  recording of you using the product, narrating what you&apos;re doing and why it
                  matters.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I&apos;ve watched demo videos drive more sign-ups than blog posts, Twitter threads,
                  and press mentions combined. Here&apos;s why: video collapses the gap between
                  &quot;I wonder what this does&quot; and &quot;I understand exactly what this does.&quot; That
                  gap is where people drop off. Close the gap.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What a good demo video includes</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">The problem (10–15 seconds).</strong> Start with the pain. &quot;Every time I wanted to post to
                    five platforms, I had to open five tabs, log into five accounts, copy-paste
                    five times. It was taking 30 minutes for something that should take two.&quot;
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">The solution (show it, don&apos;t tell it).</strong> Screen share. Actually use the product.
                    Narrate what you&apos;re clicking and why. Don&apos;t just describe features — show
                    how it feels to use them.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">The result (the &quot;after&quot;).</strong> Show the end state. The post scheduled, the time
                    saved, the workflow simplified. Make the viewer feel the relief.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">The CTA (clear and simple).</strong> &quot;It&apos;s free to start. Link in bio.&quot; That&apos;s it.
                  </li>
                </ol>

                <Callout>
                  Don&apos;t over-produce. A screen recording with your voice, your real account,
                  and your actual workflow is more convincing than a polished explainer video.
                  People can tell when something is real. Authenticity is the production value.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Where to post the demo</h3>
                <ul className="mb-4 space-y-2 text-gray-300 pl-4">
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>TikTok — &quot;day in my life as a solo founder&quot; framing works great</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>LinkedIn — screen recordings get strong organic reach, especially with a founder story hook</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Twitter/Bluesky — video reply to &quot;anyone know a tool for X?&quot; threads</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Reddit — r/SaaS, r/entrepreneur, niche subreddits for your market</span></li>
                  <li className="flex gap-3"><span className="text-amber-500 shrink-0 mt-1">▸</span><span>Product Hunt — required for the launch submission, but also on its own as a teaser</span></li>
                </ul>
              </section>

              {/* CHAPTER 7 */}
              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: Turning Attention Into Customers
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The gap between &quot;people know about me&quot; and &quot;people pay me.&quot;
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Attention without conversion is just an ego metric. The goal of all this
                  marketing isn&apos;t followers — it&apos;s customers. Here&apos;s how to close the gap.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Have a clear free offer</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The single best conversion tool for a bootstrapped product is a genuinely
                  good free tier. Not a 14-day trial. Not a &quot;limited preview.&quot; A real free plan
                  that provides real value, permanently. This is why I built SocialMate the
                  way I did — the free plan is genuinely useful because I need people to use
                  it, experience value, and want to upgrade. That&apos;s a much more efficient
                  funnel than trying to convert on first visit.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Your equivalent: what can you give away that&apos;s genuinely valuable? A free
                  tool, a free guide (like this one), a free consultation, a free sample?
                  The word &quot;free&quot; is not a discount — it&apos;s the first step in the relationship.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The affiliate / referral flywheel</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Build a referral program before you need it. When you have even 10 happy
                  users, one email asking them to share — with a real incentive — can bring
                  in 10 more. Then 10 more. The cost per acquisition is near zero.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  For a paid product, offer a real commission: 20–30% recurring is standard
                  for SaaS affiliates. &quot;Tell someone about this and earn money forever when
                  they subscribe&quot; is a compelling offer. I built SocialMate&apos;s affiliate program
                  at 30% recurring for that reason — I&apos;d rather give up 30% and acquire a
                  customer for free than spend money on ads.
                </p>

                <Callout>
                  Every happy user is a potential sales rep. Make it easy and worth their while
                  to share. A referral from a real user converts at 5–10× the rate of a cold ad.
                  Your best marketing channel is the person who already loves what you built.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Follow-up is marketing</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Most founders treat marketing as a broadcast — send content out, wait for
                  responses, repeat. But some of the highest-converting marketing is personal
                  follow-up. When someone tries your product and doesn&apos;t convert, a genuine
                  email that says &quot;Hey, what stopped you?&quot; has a 30–40% reply rate and often
                  surfaces a fix that converts the next 50 users.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Do the thing that doesn&apos;t scale, until it does.
                </p>
              </section>

              {/* CHAPTER 8 */}
              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: Consistency Is the Strategy
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why the person who shows up every day beats every tactic.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  I have a confession: in the early days of SocialMate, I posted 140 pieces
                  of content in one week. I batched everything, used AI to assist with drafts,
                  and used SocialMate (my own product) to schedule it all. Some of it performed.
                  Most of it disappeared into the void.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  But here&apos;s what that week did that a sporadic approach never could: it put
                  me in front of people repeatedly, across platforms, in different contexts.
                  Some people saw three of those posts. Some saw ten. By the end of the week,
                  those people had a pattern match in their brain: this person posts about
                  building stuff. This person is consistent. This person is real.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  That pattern match is the most valuable thing in marketing. More valuable
                  than any single viral post. More valuable than a press feature. More valuable
                  than a perfect ad. The creator who shows up every day for two years beats
                  the creator who goes viral once and disappears.
                </p>

                <Callout>
                  Marketing is a long game disguised as a short game. Everyone wants the
                  viral moment. But the real win is the person who sees your 47th post and
                  finally decides to try your thing. They didn&apos;t convert on post #1 — they
                  needed the accumulated weight of all 46 posts that proved you were serious.
                  Show up for that person.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Practically: decide on a cadence you can sustain and maintain it. One post
                  a day is better than seven one week and zero the next. Batch your content
                  when you have energy. Schedule it to release consistently. And then don&apos;t
                  look at the numbers for 30 days. Just post.
                </p>
                <p className="leading-relaxed text-gray-300">
                  The numbers will show up eventually. They always do for the people who don&apos;t quit.
                </p>
              </section>

              {/* EPILOGUE */}
              <section id="epilogue" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Epilogue: The Tool I Built for This
                </h2>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Every system in this guide — the content flywheel, the platform seeding, the
                  scheduled consistency — I do it with SocialMate. Not because I built it and
                  I have to say that. Because when I was doing all of this manually, it was
                  taking hours I didn&apos;t have. Working a deli job doesn&apos;t leave you with
                  three hours a day for content management.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  SocialMate lets me write content in batches, schedule it across six platforms
                  with one click, use AI to generate captions when I&apos;m dry, and track what&apos;s
                  actually getting engagement. The free plan is real and useful — not a trick
                  to get you to upgrade. I built it for people who are doing exactly what this
                  guide describes: marketing from nothing, with no budget, on their own time.
                </p>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="mb-4 text-gray-200 leading-relaxed">
                    If you&apos;re implementing anything from this guide, try SocialMate to do the
                    scheduling and AI parts. Free to start. No card. If it helps, tell someone.
                    That&apos;s the whole business model.
                  </p>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400">
                    Try SocialMate free →
                  </Link>
                </div>
              </section>

              {/* Bottom navigation */}
              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <p className="font-bold text-white">Vol. 3: Vibe Coding with AI</p>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <Link href="/guides/starting-a-business"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111111] px-6 py-3 font-bold text-white transition-colors hover:border-amber-500/30 text-sm">
                    ← Read Vol. 1: Starting a Business
                  </Link>
                  <Link href="/guides" className="text-sm text-gray-600 hover:text-amber-400 transition-colors text-center">
                    ← Back to All Guides
                  </Link>
                </div>
              </div>

              <p className="mt-12 text-center text-xs text-gray-800">
                © Gilgamesh Enterprise LLC — Written by Joshua Bostic. Free to share, always.
              </p>
            </article>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-8 rounded-2xl border-l-4 border-amber-500 bg-amber-500/5 px-6 py-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
        Joshua&apos;s Take
      </p>
      <p className="leading-relaxed text-gray-200">{children}</p>
    </blockquote>
  )
}

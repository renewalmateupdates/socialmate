import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: "From Side Hustle to Full-Time Creator (Free Guide) — Gilgamesh's Guides",
  description:
    "The realistic roadmap for going full-time as a creator: building while you work, hitting your first $500 online, stacking revenue streams, knowing when to quit your day job, and what full-time actually looks like.",
  keywords: [
    'side hustle to full-time creator',
    'how to become a full-time creator',
    'quit your day job to create content',
    'creator income streams',
    'making money as a creator',
    'building side hustle while working',
    'when to quit your job',
    'full-time content creator',
    'creator economy income',
    'side hustle to business',
  ],
  openGraph: {
    title: "From Side Hustle to Full-Time Creator — Gilgamesh's Guide Vol. 8",
    description:
      "The unfiltered guide to going full-time as a creator — written by someone still in the middle of that journey. No fantasy, no fluff. Just the real numbers and the real roadmap.",
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'ch1', label: '1. The Honest Truth About Going Full-Time' },
  { id: 'ch2', label: '2. Building While You Work (The After-Hours Schedule)' },
  { id: 'ch3', label: '3. Your First $500 Online' },
  { id: 'ch4', label: '4. The Creator Revenue Stack' },
  { id: 'ch5', label: '5. When to Quit Your Day Job' },
  { id: 'ch6', label: '6. The Mental Game of Building in Public' },
  { id: 'ch7', label: '7. Building Systems So the Business Runs Without You' },
  { id: 'ch8', label: '8. What Full-Time Actually Looks Like' },
]

export default function SideHustleToFullTimePage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <header className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link
                href="/guides"
                className="text-xs text-gray-600 hover:text-amber-400 transition-colors"
              >
                ← All Guides
              </Link>
              <span className="text-gray-700">·</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Vol. 8
              </span>
              <span className="text-xs text-gray-600">35 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              From Side Hustle to Full-Time Creator
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The Realistic Roadmap
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
                  {CHAPTERS.map((ch) => (
                    <a
                      key={ch.id}
                      href={`#${ch.id}`}
                      className="block text-sm leading-snug text-gray-500 transition-colors hover:text-amber-400"
                    >
                      {ch.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 border-t border-[#1f1f1f] pt-6">
                  <Link
                    href="/guides"
                    className="block text-center text-xs text-gray-600 hover:text-amber-400 transition-colors"
                  >
                    ← More Guides
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <article className="min-w-0 flex-1 prose-custom">
              {/* Mobile TOC */}
              <div className="mb-10 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 lg:hidden">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-600">
                  Chapters
                </p>
                <div className="columns-2 gap-4 space-y-1">
                  {CHAPTERS.map((ch) => (
                    <a
                      key={ch.id}
                      href={`#${ch.id}`}
                      className="block text-sm text-gray-500 hover:text-amber-400 transition-colors"
                    >
                      {ch.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* CHAPTER 1 */}
              <section id="ch1" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 1: The Honest Truth About Going Full-Time as a Creator
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The fantasy vs. the reality — and why you need to hear both before you plan anything.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  I&apos;m going to tell you something most creator guides won&apos;t: going full-time is not the goal. Building something sustainable enough that you have the option to go full-time is the goal. That distinction matters, because a lot of creators quit their jobs prematurely — chasing the dream of full-time freedom — and end up back at a job six months later, with a depleted savings account and a damaged relationship with the thing they loved building.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  As of this writing, I&apos;m still at my deli job. I still work shifts. I still build at night. And I&apos;m telling you that not as a failure — but as a choice. I won&apos;t quit until the numbers are there. Because going full-time too early doesn&apos;t just risk your finances — it risks your relationship with building. When your only income is your creative work, the pressure changes everything. Content decisions become survival decisions. You stop making what&apos;s true and start making what pays.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The goal of this guide is to give you a realistic picture of what full-time actually requires, what the journey looks like from here to there, and how to build toward it in a way that doesn&apos;t destroy you on the way.
                </p>

                <Callout>
                  The side hustle that becomes a full-time business is built slowly, late at night, on weekends, in the margins — and then one day it earns enough to be the main thing. That transition is real. It just takes longer than the success stories make it look.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  What full-time means depends on your life. For someone with no dependents and low expenses, $3,000/month from creative work might be full-time. For someone with a family and a mortgage, maybe it&apos;s $8,000-$10,000/month before they can consider leaving their job. Know your number before anything else. That number is the target, not &quot;I want to be a full-time creator.&quot; Those aren&apos;t the same thing.
                </p>
              </section>

              {/* CHAPTER 2 */}
              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Building While You Work (The After-Hours Creator&apos;s Schedule)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to protect creative time when you&apos;re also holding down a job — without burning out.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most people reading this are building on stolen time. Before work, after work, on lunch breaks, on weekends. That&apos;s not a disadvantage — it&apos;s how most things that matter get built. The constraint of limited time forces you to be ruthlessly focused on what moves the needle instead of getting lost in the things that feel like work but aren&apos;t.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s the schedule framework I use and recommend for people building after hours:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The 5-hour creator week</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Five focused hours per week — not per day — is enough to build a real creative presence if the hours are structured. Here&apos;s how to split them: two hours for content creation (batch creating your posts for the week), one hour for community engagement (responding, commenting, building relationships), one hour for learning or skill development (studying your analytics, reading about your niche, watching what&apos;s working for others), and one hour for the business side (tracking revenue, refining the offer, working on a product or service).
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Find your protected time block</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  For me it&apos;s after midnight on weeknights and early mornings on weekends. For someone else it might be 5am before the house wakes up, or 8-10pm after the kids are down. Find the block where you can have 90-120 minutes of uninterrupted focus. That block is sacred. Protect it from social obligations, from TV, from the exhaustion that makes you just want to scroll instead of create.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Use scheduling tools to multiply your time</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When you batch-create content and schedule it, you&apos;re essentially time-traveling. The work you do on Sunday night posts on Tuesday and Thursday automatically. SocialMate&apos;s scheduling does exactly this — write your posts once, schedule them across all your platforms, and they go out while you&apos;re at your day job. Your online presence doesn&apos;t have to pause just because your life is full.
                </p>

                <Callout>
                  Protect your creative hours the same way you&apos;d protect a doctor&apos;s appointment. You can&apos;t reclaim the time you don&apos;t use — and the gap between people who build something and people who mean to build something is almost always just this: one of them protected the time and one of them didn&apos;t.
                </Callout>
              </section>

              {/* CHAPTER 3 */}
              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Your First $500 Online (The Milestone That Changes Everything)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why the first dollar online is worth more psychologically than the hundredth dollar from a job.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The first time money comes in from something you built is a completely different experience from a paycheck. A paycheck is expected — you worked, you got paid. But that first $500 from a product, a service, a sponsorship, or a subscription someone voluntarily chose to pay you? That proves that what you create has value beyond your labor. It proves the model works. It changes the relationship you have with everything you build after that.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here are the fastest paths to your first $500 as a creator, roughly ordered by speed and accessibility:
                </p>
                <ul className="mb-6 space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Freelance service.</strong> The fastest money is trading your existing skill for payment. Writer? Write for a brand. Designer? Take a project. Developer? Build something small. The market is immediate. No product needed, no audience required. One good project at $500 or five at $100 each — same math.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">A digital product under $20.</strong> A Notion template, a resource guide, a spreadsheet, a prompt library. The price point is low enough that people don&apos;t think hard before buying. Create it once, sell it endlessly. Use Gumroad — it&apos;s free to start and takes no monthly fee, just a small cut per sale.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Tip jar / pay what you want.</strong> If you&apos;re consistently giving away valuable content, put a tip link in your bio. Some percentage of your audience will use it. SocialMate&apos;s Creator Hub has a tip jar built in, free on Pro — it takes zero percent of what you earn.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Affiliate marketing.</strong> Recommend products you already use. When someone buys through your link, you get a cut. Low barrier to start — no product, no service, no audience minimum. The payout per conversion is small, but it&apos;s genuinely passive once the links are live.</span>
                  </li>
                </ul>

                <Callout>
                  Get to $500 by whatever honest means you can. Not because $500 pays your bills — it doesn&apos;t. But because it proves to you that this is real. After the first $500, you&apos;ll know the model works. Then you can focus on making it work at scale.
                </Callout>
              </section>

              {/* CHAPTER 4 */}
              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: The Creator Revenue Stack (Multiple Streams, Not One Big Bet)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why relying on one income source is a risk you can&apos;t afford — and how to stack multiple streams.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The creators who go full-time sustainably almost never do it on the back of a single revenue stream. One sponsor deal disappears when the brand cuts their budget. One platform collapses and takes your monetization with it. One product stops selling because the trend moves. Sustainable creator income is built on a stack — multiple sources that reinforce each other, so no single point of failure can take everything down.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s how to think about the stack in layers:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Layer 1: Recurring base income</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This is the foundation. Fan subscriptions, membership communities, and retainer clients all produce monthly recurring revenue — money you can count on. Even $1,000/month in recurring income changes everything about how you make decisions. You&apos;re no longer dependent on any single sale going through. Build toward recurring first.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Layer 2: Product sales</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Digital products, online courses, templates, and e-books are income that doesn&apos;t require your active time once they&apos;re created. A $97 course sold 50 times is $4,850. You did the work once. This is the closest thing to passive income that&apos;s actually real and accessible for individual creators.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Layer 3: Variable / opportunity income</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Sponsorships, brand deals, speaking fees, and freelance work. These pay well when they come in, but they&apos;re not guaranteed month-to-month. Treat them as bonus income that accelerates savings and investments, not as the base you build your expenses on.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Layer 4: Affiliate and passive income</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Small amounts from affiliate links, platform ad revenue, referral programs. Low per-unit value, but it compounds over a large body of content. SocialMate&apos;s affiliate program pays 30% recurring on every subscriber you refer — that stacks month over month as your referrals stay subscribed.
                </p>

                <Callout>
                  You don&apos;t need all four layers on Day 1. You need one that works, then you add the next. Most creators who fail financially try to do everything at once, execute none of it well, and get discouraged. Pick one revenue stream and make it real before adding the next.
                </Callout>
              </section>

              {/* CHAPTER 5 */}
              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: When to Quit Your Day Job (The Numbers You Need to See First)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The financial checklist you have to complete before the leap makes sense.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  This is the question everyone asks and most guides answer with vibes instead of numbers. &quot;When it feels right!&quot; &quot;When you believe in yourself!&quot; That&apos;s not useful. Here are the actual numbers you need before quitting your job is rational rather than reckless:
                </p>
                <ol className="mb-6 list-decimal pl-6 space-y-4 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">6 months of living expenses in savings.</strong> Not revenue — savings. Liquid cash you can access if your creative income has a bad quarter. This is your runway. Without it, every slow month becomes a crisis, and crisis-mode creativity is bad creativity.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">3 consecutive months of earning at least 80% of your income replacement number.</strong> Not one good month. Three in a row. One good month could be a spike. Three consecutive months is a pattern. You need the pattern before you bet your livelihood on it.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">At least one recurring revenue stream that isn&apos;t dependent on your constant attention.</strong> If all your income evaporates the second you stop posting, you don&apos;t have a business — you have a very demanding job. You need at least some income that continues even in a slow month.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">A clear plan for health insurance.</strong> This is the thing Americans especially underestimate. An individual health insurance plan can run $300-$600/month or more. Factor it into your income replacement number. It&apos;s not optional.
                  </li>
                </ol>

                <Callout>
                  Quitting too early is a pride decision disguised as a courage decision. The bravest thing is sometimes staying until the numbers are unambiguous — because a failed leap sends you backward, and backward costs you time and momentum you can&apos;t easily recover.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  When those four conditions are met, quitting becomes a logical decision rather than a gamble. You might still be scared. That&apos;s fine. Fear is appropriate when the stakes are real. But fear plus financial stability is very different from fear plus financial exposure.
                </p>
              </section>

              {/* CHAPTER 6 */}
              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: The Mental Game of Building in Public
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The psychological cost of sharing your process while you&apos;re still in the middle of it.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Building in public means sharing your wins and your struggles as they happen, rather than waiting until you have a polished success story. It&apos;s one of the most powerful creator strategies because it creates authenticity and community simultaneously. But it has a cost that most people don&apos;t talk about.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When you build in public, you are permanently in front of an audience while you&apos;re in the most vulnerable phase: before the product is working, before the revenue is consistent, before the story has a good ending. Every public failure is witnessed. Every slow month gets shared. Every pivot can feel like an admission of defeat in front of people who were watching.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The mental traps to watch out for: comparison (comparing your Chapter 1 to someone else&apos;s Chapter 20 kills motivation), validation-seeking (checking metrics constantly instead of building — metrics are lagging indicators, building is leading), and performing instead of sharing (saying things you think the audience wants to hear instead of what&apos;s actually true, which is both unsustainable and dishonest).
                </p>

                <Callout>
                  Building in public is not about performing your journey. It&apos;s about sharing it honestly. The difference: performance is managed for reception. Sharing is honest regardless of reception. Audiences can feel the difference, and they reward the honest version with the kind of loyalty that performance never earns.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  The creators who build in public sustainably develop a thick skin through repetition — not because they care less, but because they learn to separate their worth from their metrics. You are not your follower count. You are not your monthly revenue. Those are measurements of a process you&apos;re in. Keep going regardless of what the measurements say this week.
                </p>
              </section>

              {/* CHAPTER 7 */}
              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: Building Systems So the Business Runs Without You
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The difference between a creator and a creator-business — and why it matters.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  A creator is a person. A creator-business is a system. The distinction matters because a creator is always limited by their personal capacity. You can only create so many hours a day. You can only be in one place. You get sick. You take vacations. You burn out. If all your income depends on you personally showing up and creating every single day, you don&apos;t have a business — you have a very creative job with bad benefits.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The goal, over time, is to build systems that produce output independent of your moment-to-moment effort:
                </p>
                <ul className="mb-6 space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Content systems.</strong> Batch creation + scheduling means you can take a week off and still have content posting. SocialMate&apos;s Smart Queue and SOMA handle this — posts scheduled weeks in advance, AI-assisted generation that sounds like you, and the Evergreen Recycling feature that resurfaces your best content automatically.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Revenue systems.</strong> Products that sell while you sleep. Affiliate links baked into old content. Memberships that bill automatically. The passive portion of your income is the part that runs without you.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Community systems.</strong> A Discord server or community that self-sustains between your posts. Pinned resources. Regular threads that don&apos;t require your active facilitation. An engaged community keeps going even in quiet periods.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Operations systems.</strong> Templates for replying to common inquiries, an FAQ, documented processes for handling sponsorships or client requests. The time you save not reinventing the wheel every week goes directly back into creating.</span>
                  </li>
                </ul>

                <Callout>
                  Systems feel like overhead until you need them. Then they feel like salvation. Build one system at a time. Every hour you invest in a good system saves you 10 hours over the next year. It doesn&apos;t feel urgent until it&apos;s suddenly the difference between resting and burning out.
                </Callout>
              </section>

              {/* CHAPTER 8 */}
              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: What Full-Time Actually Looks Like (The Unfiltered Version)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The thing about full-time creator life they don&apos;t put in the highlight reel.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most people who want to be full-time creators are imagining freedom — no alarm clock, no boss, no commute, just making things you care about in pajamas. And that&apos;s real, to some extent. But the fuller picture is worth knowing before you make the leap.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Full-time creator life means your income is directly tied to your output and the health of your relationship with your audience. Bad months aren&apos;t just disappointing — they&apos;re financially real. The floor of a creator income is much lower than the ceiling, and the floor is where you&apos;ll live more often than the highlight-reel moments suggest.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The creative pressure changes too. When making content is your job, there are days it feels like a job. The algorithm rewards certain types of content, and sometimes the commercially smart move is in tension with the creatively honest move. Managing that tension — staying true to your voice while still building an audience that can support your life — is the ongoing challenge nobody in the &quot;quit your job and do what you love&quot; content is talking about.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  That said: the people I know who have made the leap successfully are almost universally happier. Not because it&apos;s easier — it&apos;s often harder. But because they&apos;re building something they chose, spending their time in a way that feels aligned, and growing in a direction that matters to them. That alignment is worth a lot. It&apos;s worth building toward carefully, methodically, with the right numbers in place.
                </p>

                <Callout>
                  Full-time isn&apos;t the finish line. It&apos;s just a different kind of start — one where the stakes are higher, the pressure is real, and the work is your own. If you&apos;ve built the foundation, it&apos;s worth every bit of it.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  I&apos;ll get there. So will you, if you do the work. Not the fantasy version of it — the real work: showing up consistently, building the systems, earning the audience, stacking the revenue. One shift at a time. One post at a time. One product at a time. The door is open. You just have to keep walking toward it.
                </p>
              </section>

              {/* Joshua's Note */}
              <section className="mb-16 scroll-mt-8">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                    A Note from Joshua
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    I wrote this guide from the middle. Not from the other side of a big exit or a viral moment. I&apos;m still at my deli job. I&apos;m still building at night. I don&apos;t write that as a complaint — I write it because I want you to know that this guide is from someone who is in it with you, not someone who finished the race and is telling you about it from a beach.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    The numbers I shared are real. The timeline is real. The mental game is real. Trust the process, protect your time, stack your revenue, and build toward the freedom you want one system at a time.
                  </p>
                  <p className="leading-relaxed text-gray-300">
                    Find me at <strong className="text-amber-400">@socialmatehq</strong>. Tell me where you are in the journey. I want to know.
                  </p>
                  <p className="mt-6 text-right text-sm text-amber-400 font-semibold">
                    — Joshua Bostic<br />
                    <span className="text-gray-600 font-normal">Founder, SocialMate</span>
                  </p>
                </div>
              </section>

              <GuideEmailCapture />
              <GuidePDFDownload title="From Side Hustle to Full-Time Creator" />

              {/* Bottom navigation */}
              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <p className="font-bold text-white">Vol. 9: The Content Creator&apos;s Business Guide</p>
                  <Link href="/guides/content-creator-business" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">Read now →</Link>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-black transition-colors hover:bg-amber-400"
                  >
                    Try SocialMate Free →
                  </Link>
                  <Link
                    href="/guides"
                    className="text-sm text-gray-600 hover:text-amber-400 transition-colors text-center"
                  >
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

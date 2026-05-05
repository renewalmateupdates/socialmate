import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: "How to Start a Business From Scratch (Free Guide) — Gilgamesh's Guides",
  description:
    'The no-BS playbook for starting a business with no money, no connections, and no permission. Wyoming LLC for $150, free tech stack, Reddit validation, and what nobody tells you about doing it alone.',
  keywords: [
    'how to start a business',
    'start a business with no money',
    'how to form an LLC',
    'Wyoming LLC',
    'bootstrap startup',
    'solo founder',
    'start a business from scratch',
    'free business guide',
    'how to get first customer',
    'validate business idea',
  ],
  openGraph: {
    title: "Starting a Business From Scratch — Gilgamesh's Guide Vol. 1",
    description:
      "Real talk from a bootstrapped solo founder who works a deli job and builds software at night. Everything they charge $500 courses for — free.",
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface', label: 'Preface' },
  { id: 'ch1', label: '1. The Decision Nobody Makes Twice' },
  { id: 'ch2', label: '2. Validate Before You Build' },
  { id: 'ch3', label: '3. Make It Legal for $200 or Less' },
  { id: 'ch4', label: '4. Build Your Stack for Free' },
  { id: 'ch5', label: '5. Get Your First Customer' },
  { id: 'ch6', label: '6. When Your Co-Founder Walks Away' },
  { id: 'ch7', label: '7. What the Streets Teach You About Business' },
  { id: 'ch8', label: '8. Building Through Loss' },
  { id: 'epilogue', label: 'Epilogue' },
  { id: 'joshua-note', label: "A Note from Joshua" },
]

export default function StartingABusinessGuidePage() {
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
                Vol. 1
              </span>
              <span className="text-xs text-gray-600">25 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Starting a Business From Scratch
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              (Even if You&apos;re Broke, Alone, and Nobody Believes In You)
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

              {/* PREFACE */}
              <section id="preface" className="mb-16 scroll-mt-8">
                <h2 className="mb-6 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Preface: Who This Is For
                </h2>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This guide isn&apos;t for people who already have money. It&apos;s not for people with a
                  co-founder, an MBA, or a warm intro to a VC. It&apos;s not for the people who
                  grew up seeing entrepreneurship modeled at the dinner table.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  It&apos;s for the person who has an idea at 2am that they can&apos;t shake. The person
                  who Googles &quot;how to start an LLC&quot; at lunch on their work break. The person who
                  watches YouTube tutorials in bed because they can&apos;t afford the course. The
                  person who thinks: <em>maybe this could be something</em> — but has no idea where
                  to start and no one to ask.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  That was me. That&apos;s still me, some days.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I wrote this guide because when I started SocialMate — a social media scheduling
                  platform I built solo, while working a deli job — I had to piece together
                  everything from scratch. No mentor. No co-founder. No startup ecosystem around
                  me. I had Reddit threads, YouTube at 3am, and enough stubbornness to outlast
                  the doubt.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Everything in here is real. The numbers are real. The mistakes are real. The
                  wins are hard-earned and small at first. I&apos;m not writing this from the other
                  side of a billion-dollar exit. I&apos;m writing it from the middle — still building,
                  still grinding, still clocking in to my deli job on the days when the SaaS
                  revenue isn&apos;t there yet.
                </p>
              </section>

              {/* CHAPTER 1 */}
              <section id="ch1" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 1: The Decision Nobody Makes Twice
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why you either keep starting businesses or you stop — and how to know which one you are.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  There&apos;s a type of person who, once they start a business, can&apos;t go back.
                  Something breaks in you — in the best way. You see the world differently. You
                  look at every product, every app, every restaurant and you think: <em>who built
                  this, and how?</em> You stop being a consumer and start being a builder. That
                  shift doesn&apos;t reverse.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  But before that shift happens, there&apos;s a decision. And most people never make
                  it — not because they don&apos;t have good ideas, but because the fear of starting
                  is louder than the cost of staying still.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s what I want you to understand before anything else: the decision to start
                  is not a rational one. You will never have enough money, enough knowledge,
                  enough time, or enough confidence before you begin. Those things come <em>after</em>.
                  They come from doing. The person who waits until they&apos;re ready never starts.
                </p>

                <Callout>
                  You don&apos;t need permission to start a business. You never did. You need a
                  problem worth solving and the stubbornness to keep going past the first wall.
                  Everything else is learnable.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The question isn&apos;t <em>am I ready?</em> The question is: <em>is this idea pulling me hard
                  enough that I&apos;ll do it even when I&apos;m tired, even when it&apos;s not working, even
                  when nobody around me thinks it&apos;s a good idea?</em>
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  If yes — you&apos;re already a founder. You just haven&apos;t filed the paperwork yet.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  There&apos;s also something nobody tells you: the people who discourage you most are
                  usually the ones who wanted to try something but didn&apos;t. Your success reminds
                  them of their regret. That&apos;s not your problem. Love them and keep building.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Your environment will often be unsupportive — not because people are evil, but
                  because they don&apos;t live inside your vision. They see the risk. You see the
                  upside. Both are real. But at the end of your life, you won&apos;t regret trying.
                  You&apos;ll regret not trying. Make the decision. Then make the next one. That&apos;s all
                  this is.
                </p>
              </section>

              {/* CHAPTER 2 */}
              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Validate Before You Build (The Reddit Method)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to find out if anyone actually wants what you&apos;re making — before spending a dollar.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most first-time entrepreneurs do things in the wrong order. They build first,
                  then try to find customers. Months later, sometimes years later, they figure
                  out that nobody wanted what they built. This is the most expensive mistake in
                  the startup world.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Before you write a line of code, before you design a logo, before you pay for
                  anything — <strong className="text-white">go find the people who have the problem you want to solve.</strong>
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The Reddit Method</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit is the most underrated market research tool on the internet, and it&apos;s
                  completely free. Here&apos;s how I used it before building SocialMate:
                </p>
                <ol className="mb-6 list-decimal pl-6 space-y-4 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Find your subreddit.</strong> Whatever problem you&apos;re solving, there&apos;s a subreddit
                    for it. For social media scheduling, I went to r/entrepreneur, r/socialmedia,
                    r/smallbusiness, r/SaaS. For a food business, go to r/food, r/mealprep,
                    r/restaurateur. Find where your future customers already hang out.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Search for pain posts.</strong> Search the subreddit for phrases like &quot;frustrated
                    with,&quot; &quot;I hate how,&quot; &quot;why is there no tool that,&quot; &quot;does anyone else struggle
                    with.&quot; These are people literally telling you their problems in public. Read
                    100 of them. Take notes.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Post a question.</strong> Make a simple post: &quot;I&apos;m building a solution for [problem].
                    Does anyone else deal with this? What would actually help?&quot; Don&apos;t pitch your
                    product. Ask about their pain. People love to talk about their problems if
                    you&apos;re genuinely listening.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Count the responses.</strong> If people don&apos;t engage, that&apos;s data. If 50 people
                    respond saying &quot;yes, this is a real problem,&quot; that&apos;s your green light. If they
                    tell you what they&apos;d actually pay for, you have a product roadmap.
                  </li>
                </ol>

                <Callout>
                  The goal of validation isn&apos;t to get compliments on your idea. It&apos;s to find
                  proof that people will pay to have a problem solved. Compliments are free.
                  Money is the real vote.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Pre-sell before you build</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The ultimate validation is a pre-sale. Tell people: &quot;I&apos;m building X. It costs
                  Y. If 20 people pre-buy, I build it. If not, you get a full refund.&quot; You can
                  do this with a simple Google Form or a Stripe payment link. You don&apos;t need a
                  website. You don&apos;t need a prototype.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  If nobody pre-buys, you saved yourself months of work. If people do, you have
                  revenue before you have a product — and paying customers are the most powerful
                  motivator to actually finish building.
                </p>
                <p className="leading-relaxed text-gray-300">
                  I didn&apos;t do this perfectly with SocialMate — I built more than I needed to
                  before validating. Learn from that. Even a week of Reddit research can save
                  you three months of building the wrong thing.
                </p>
              </section>

              {/* CHAPTER 3 */}
              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Make It Legal for $200 or Less
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  LLCs, EINs, domains, and everything you actually need — without paying a lawyer $5,000.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Legal stuff scares people into inaction. They think they need a lawyer, a
                  business partner, a certified accountant, and a three-month runway before they
                  can &quot;officially&quot; start. None of that is true. Here&apos;s the real minimum:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Step 1: Form an LLC ($50–$200)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  An LLC (Limited Liability Company) separates your personal finances from your
                  business. This is important: if your business gets sued, they can&apos;t come after
                  your personal bank account or property. You want this.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The easiest, cheapest, and most private way to form an LLC in the US is through
                  the state of <strong className="text-white">Wyoming</strong>. Here&apos;s why I formed Gilgamesh Enterprise LLC in Wyoming:
                </p>
                <ul className="mb-6 list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">$100 filing fee.</strong> Most states charge $300–$500. Wyoming is $100.</li>
                  <li><strong className="text-white">No state income tax.</strong> Wyoming doesn&apos;t tax LLC income at the state level.</li>
                  <li>
                    <strong className="text-white">Strong privacy protection.</strong> Wyoming doesn&apos;t require you to publicly list
                    the LLC members. Your name doesn&apos;t have to be in any public database. For
                    solo founders who don&apos;t want competitors or bad actors knowing their real
                    address, this matters.
                  </li>
                  <li><strong className="text-white">You don&apos;t have to live in Wyoming.</strong> You can form a Wyoming LLC from
                    anywhere in the US (or the world).</li>
                </ul>

                <Callout>
                  You can form a Wyoming LLC yourself through the Wyoming Secretary of State
                  website for $100. Or use a registered agent service like Northwest Registered
                  Agent (~$125/year) which includes a registered address in Wyoming. Total cost:
                  $100–$200. No lawyer needed.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Step 2: Get your EIN (Free)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  An EIN (Employer Identification Number) is basically a Social Security Number
                  for your business. You need it to open a business bank account. You get it
                  from the IRS website — irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online.
                  It takes 10 minutes. It&apos;s free.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Step 3: Open a business bank account (Free)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Never mix business money with personal money. Not because the government will
                  audit you (though they might), but because you can&apos;t track your business if you
                  don&apos;t know what it&apos;s making and spending. Mercury bank (mercury.com) is free for
                  startups, has no minimum balance, no monthly fees, and works entirely online.
                  You need your LLC documents and your EIN to open it.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Step 4: Get your domain ($15–$30/year)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Your domain is your address on the internet. Register it through Namecheap or
                  Cloudflare — both are ~$10–$15/year for a .com. Don&apos;t overthink the name.
                  Something clean, short, and memorable. You can always buy a better domain
                  later. Don&apos;t let the perfect domain stop you from starting.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What you DON&apos;T need to start</h3>
                <ul className="mb-6 list-disc pl-6 space-y-2 text-gray-300">
                  <li>A lawyer (until you have contracts or investors)</li>
                  <li>A business plan document (you need the thinking, not the document)</li>
                  <li>A professional logo (Canva, free)</li>
                  <li>A fancy office</li>
                  <li>Business cards</li>
                  <li>An accountant (until you&apos;re making real money, then yes)</li>
                </ul>

                <p className="leading-relaxed text-gray-300">
                  Total cost to be a legally real business: <strong className="text-white">$150–$200, maybe $250</strong> if you add a
                  registered agent service. That&apos;s one dinner out. That&apos;s one month of a
                  streaming subscription. This is not the barrier. Don&apos;t let it be the barrier.
                </p>
              </section>

              {/* CHAPTER 4 */}
              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: Build Your Stack for Free (Until You&apos;re Paid)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The exact tools and services you can use for $0 until revenue justifies the cost.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  One of the biggest lies the tech industry tells you is that you need expensive
                  tools to build something real. You don&apos;t. I built the first version of SocialMate
                  on free tiers — no team, no budget, just time and persistence.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s the stack I use, and what&apos;s free:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">For software / web products</h3>
                <ul className="mb-6 space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Next.js (free)</strong> — The framework I build on. Server-side rendering,
                    API routes, everything in one. Deployed on Vercel with a generous free tier.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Supabase (free tier)</strong> — Database, auth, storage, and real-time. The
                    free tier gives you 500MB database, 1GB storage, 50,000 monthly active users.
                    Enough to get to real revenue before you pay a cent.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Vercel (free Hobby tier)</strong> — Deploys your Next.js app to the internet in
                    seconds. Custom domain, automatic HTTPS, edge network. Free until you scale.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Stripe (no monthly fee)</strong> — Takes payments and gives you 2.9% + 30¢ per
                    transaction. You only pay when you make money. There&apos;s no better deal in
                    payment processing for a bootstrapper.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Resend (free tier)</strong> — Transactional email (welcome emails, password
                    resets, notifications). 100 emails/day free. More than enough to start.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">GitHub (free)</strong> — Code hosting, version control, and collaboration.
                    Never build without version control. You will need to roll back something.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Claude / ChatGPT (AI assistance)</strong> — I build with AI as my co-pilot.
                    Claude&apos;s free tier is enough to start. When it saves you 40 hours/week of
                    development time, $20/month for Claude Pro is the best investment in software
                    that exists.</span>
                  </li>
                </ul>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">For non-software businesses</h3>
                <ul className="mb-6 space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Google Workspace (free personal Gmail)</strong> — Use a free Gmail for your
                    business email at first. Not forever — but at first, it&apos;s fine. Get
                    yourname@gmail.com or even yourname@yourdomain.com through Zoho Mail (free).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Canva (free)</strong> — Design logos, social media posts, business cards, flyers,
                    presentations. Canva free tier is genuinely excellent. You don&apos;t need a
                    graphic designer until you have real money.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">SocialMate (free plan)</strong> — Schedule your social media posts across
                    platforms. AI caption writer, scheduling, analytics — free. Obviously I&apos;m
                    biased, but I built it specifically so people like you don&apos;t have to pay $99/month
                    for Buffer or Hootsuite.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Wave (free)</strong> — Accounting software for small businesses. Invoicing,
                    expense tracking, basic reports. Completely free. Better than a spreadsheet.</span>
                  </li>
                </ul>

                <Callout>
                  The rule: don&apos;t pay for tools until a free version limits your growth. Most
                  bootstrappers pay for tools they don&apos;t use yet. Stay lean. Every dollar you
                  don&apos;t spend on tools is a dollar that can go toward your first marketing push
                  or keep you solvent one more month.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  The total cost of running SocialMate in its first month was under $50. Most
                  of that was the domain. The rest was free tiers. Don&apos;t let &quot;I can&apos;t afford
                  the software&quot; be a reason. That excuse doesn&apos;t hold anymore.
                </p>
              </section>

              {/* CHAPTER 5 */}
              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: Get Your First Customer (The Unglamorous Way)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Your first sale won&apos;t come from a viral post. Here&apos;s what actually works.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The gap between &quot;I have a product&quot; and &quot;I have a paying customer&quot; is where most
                  businesses die. It&apos;s not because the product isn&apos;t good. It&apos;s because the
                  founder is waiting for people to find them instead of going to find the people.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Your first customer is not going to come from a viral TikTok. It&apos;s not going
                  to come from a press feature. It&apos;s not going to come from a perfectly optimized
                  landing page. It&apos;s going to come from you, directly, telling someone about what
                  you built and asking if they&apos;d like to try it.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The methods that work when you have no audience</h3>

                <p className="mb-3 font-semibold text-white">1. Your existing network (start here)</p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Text 20 people you know. Not &quot;hey check out my business&quot; — that&apos;s annoying.
                  Instead: &quot;Hey, I&apos;m building something and looking for honest feedback. Would you
                  be willing to try it for free and tell me if it&apos;s useful?&quot; People love being
                  asked for their opinion. Some will try it. Some of those will pay. Some will
                  refer others.
                </p>

                <p className="mb-3 font-semibold text-white">2. Direct outreach in communities (the Reddit/Discord method)</p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Find the communities where your customers hang out. When someone posts a
                  problem that your product solves, reply genuinely — give real advice first,
                  mention your tool second. Don&apos;t spam. Build reputation in the community. One
                  real connection there is worth 1,000 cold emails.
                </p>

                <p className="mb-3 font-semibold text-white">3. Physical hustle (don&apos;t sleep on this)</p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This one people underestimate because they&apos;re in the digital mindset. But if
                  your business serves local people or small businesses, print 50 flyers on your
                  home printer and put them up. Go to a laundromat, a coffee shop, a local
                  community board. Go to a business networking breakfast. Walk into small
                  businesses and introduce yourself.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I know founders who got their first 10 customers from flyers they printed for
                  $5 and posted at the library. Not because flyers are magic — because most
                  people building online products never do anything offline, so offline has zero
                  competition.
                </p>

                <p className="mb-3 font-semibold text-white">4. Free consultations / the SBA</p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The US Small Business Administration (SBA) offers free business counseling
                  through SCORE — a network of retired executives who volunteer as mentors. Go
                  to score.org. Set up a free meeting. Bring your idea. They&apos;ve seen thousands
                  of businesses. Their feedback is real, their advice is free, and the mentors
                  often have networks they&apos;re willing to share.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I went to an SBA meeting in the early days. The feedback I got wasn&apos;t always
                  what I wanted to hear, but it was grounding. It helped me see blind spots I
                  didn&apos;t know I had.
                </p>

                <Callout>
                  Your first 10 customers will come from hustle, not marketing. Marketing scales
                  hustle — it doesn&apos;t replace it. Do the unglamorous thing. Send the awkward
                  DM. Post in the forum. Put up the flyer. Ask for the sale. The first yes
                  will change everything.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  When you get a paying customer, treat them like gold. Respond fast. Fix
                  problems fast. Ask them what else they need. One delighted customer becomes
                  a referral engine. Word of mouth from a real happy customer beats any ad
                  campaign you&apos;ll ever run.
                </p>
              </section>

              {/* CHAPTER 6 */}
              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: When Your Co-Founder Walks Away
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  What to do when your business partner leaves — and why it might be the best thing that happens to you.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  This one is personal for me, so I&apos;m going to be direct.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I had someone lined up as a technical co-founder when I was starting out. A
                  CTO. Someone I thought was going to build this thing with me. And they left.
                  Not dramatically — they just quietly stopped showing up. Stopped responding.
                  Decided it wasn&apos;t for them.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  At the time, I didn&apos;t know how to code. I was terrified. I thought: <em>this is
                  it. Without a technical co-founder, I can&apos;t build this. It&apos;s over.</em>
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  It wasn&apos;t over. It was actually the beginning.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When I had no one to build for me, I learned to build myself. I sat down with
                  Claude AI and started asking questions. I watched tutorials. I made mistakes.
                  I broke things and fixed them. I built slowly, then faster, then faster still.
                  Two years later, I&apos;m shipping production-grade software solo — features that
                  would cost a startup $200k+ in engineering salaries to replicate.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  What I couldn&apos;t see then: if my CTO had stayed, I would have been dependent
                  on them forever. I would have been a &quot;business founder&quot; who needed someone
                  else to realize his own vision. The fact that they left forced me to become
                  whole on my own.
                </p>

                <Callout>
                  A business partner leaving is painful. But it also can&apos;t sink you — unless
                  you let it. The vision was always yours. Your ability to execute was always
                  inside you. The walk-away just forces you to find it.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to actually handle a co-founder split</h3>
                <ul className="mb-6 space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Always have a founder agreement before you start.</strong> Spell out equity splits,
                    vesting schedules (4 years, 1-year cliff is standard), and what happens if
                    someone leaves. A handshake agreement is not a legal agreement. This costs
                    $500 with a contract lawyer. It&apos;s worth it.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Don&apos;t give equity away casually.</strong> Equity is ownership of your future.
                    Give it only to people who are actively building, and only with a vesting
                    schedule. If they leave before their shares vest, they leave with nothing.
                    This is not cruel — it&apos;s how founders protect what they built.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">Don&apos;t give up on the idea.</strong> The co-founder is not the idea. The idea
                    was yours. Keep going. Hire freelancers, learn the skill yourself, use AI
                    tools, find a different partner — but don&apos;t let one person&apos;s exit kill what
                    you started.</span>
                  </li>
                </ul>

                <p className="leading-relaxed text-gray-300">
                  Plenty of the biggest companies in history were built by solo founders or had
                  major co-founder splits early on. It&apos;s survivable. Most of the time, you
                  come out stronger.
                </p>
              </section>

              {/* CHAPTER 7 */}
              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: What the Streets Teach You About Business
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The mindset lessons from people who had no choice but to figure it out.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  I grew up in an environment where hustle wasn&apos;t a LinkedIn buzzword. It was
                  survival. I watched people figure out how to create value, build loyalty, and
                  keep operations running under conditions that most business schools never
                  cover. And while I don&apos;t endorse everything those environments produce, I
                  learned more about business from watching that world than I ever did from
                  a textbook.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here are the lessons that transferred:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Read the market, not the playbook</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  In the streets, you can&apos;t follow a template. You have to read what&apos;s actually
                  in front of you. What&apos;s the demand? Who&apos;s the competition? What does the
                  market actually want right now, not last year? Business works the same way.
                  The people who follow &quot;best practices&quot; while ignoring what&apos;s actually happening
                  in their specific market get left behind. Stay in the present. Trust your read.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Loyalty and reputation compound</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  In any tight community, word travels fast. If you&apos;re straight with people,
                  they tell others. If you&apos;re not, you&apos;re done in that community. Business is
                  the same — your reputation with early customers, partners, and peers is
                  your most valuable asset. It&apos;s also the hardest to rebuild once it&apos;s damaged.
                  Be straight with people. Under-promise, over-deliver. Do what you said you&apos;d do.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Keep moving. Static is death.</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The people who survived and thrived in tough environments were the ones who
                  adapted constantly. They didn&apos;t get sentimental about their current position.
                  If something wasn&apos;t working, they changed it. In business, this looks like
                  being willing to pivot your product, change your pricing, shift your target
                  customer, rebuild features from scratch. The founders who survive are the ones
                  who never get too attached to how things are, only to where they&apos;re going.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The come-up is earned, not given</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  There&apos;s no shortcut past the grind. Period. You can work smarter, use better
                  tools, have a better strategy — and you should. But at the end of the day,
                  the people who build something real are the ones who showed up every single
                  day when there was no reward yet. That&apos;s the tax on success. Everyone pays it.
                  Most people don&apos;t finish paying.
                </p>

                <Callout>
                  The streets don&apos;t give trophies for almost. They give results for showing
                  up. Business is the same. Your unfinished app, your almost-launched product,
                  your idea you&apos;re still thinking about — none of that pays. Ship. Move. Try.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  The hardest and most valuable skill I have is the ability to keep going when
                  nothing is working yet. That&apos;s not a gift. I earned it in places that didn&apos;t
                  give me a choice. If you grew up soft, you can still build it — but you have
                  to be intentional. Every time you push through resistance, you&apos;re building
                  the muscle that carries you.
                </p>
              </section>

              {/* CHAPTER 8 */}
              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: Building Through Loss
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  When life hits the hardest, and you keep building anyway.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  I lost my father. I&apos;m not going to tell you when or how because that&apos;s mine to
                  carry. But I will tell you what it did to my relationship with this work.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When you lose a parent, something shifts. There&apos;s grief — obviously. But
                  there&apos;s also clarity. Suddenly you see very sharply what matters and what
                  doesn&apos;t. You see the shortness of time. You feel in your bones that there
                  is no &quot;later,&quot; no &quot;I&apos;ll do it eventually.&quot; There is only now.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I built SocialMate with him on my mind. Every feature I ship is partly for
                  him — partly a message that says: <em>look what we became. Look what this family
                  can do.</em> That&apos;s the chip on my shoulder. That&apos;s the fuel that keeps me in
                  the chair at 2am when the rational thing would be to go to sleep.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I don&apos;t say this to make you feel sorry for me. I say it because I know I&apos;m
                  not alone. A lot of people building things from nothing are building through
                  something. Through debt. Through a job they hate. Through grief. Through
                  a past they&apos;re running from or a future they&apos;re running toward.
                </p>

                <Callout>
                  The pain you&apos;re carrying can either be a weight or a motor. Both are real.
                  The difference is what you do with it. I chose to make mine a motor. I don&apos;t
                  recommend performing grief in public — but I do recommend letting it mean
                  something in private. Let it drive you.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  There will be days when the business breaks, the code doesn&apos;t work, the
                  customers don&apos;t come, and you wonder why you&apos;re doing this. On those days,
                  come back to the reason. Not the revenue goal. Not the exit. The <em>reason</em>.
                  The person you&apos;re proving something to. The future you&apos;re building for your
                  family. The people in your city who need to see that someone from where you&apos;re
                  from can build something real.
                </p>
                <p className="leading-relaxed text-gray-300">
                  That&apos;s the only engine that runs long enough to finish.
                </p>
              </section>

              {/* EPILOGUE */}
              <section id="epilogue" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Epilogue: What &quot;Power to the People&quot; Actually Means
                </h2>

                <p className="mb-4 leading-relaxed text-gray-300">
                  SocialMate&apos;s tagline is &quot;Power to the people. Tear down the gatekeeping walls.
                  Build the door.&quot; I didn&apos;t pick that from a brand manual. I picked it because
                  it&apos;s literally what I&apos;m trying to do.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The tools that can change your life — social media scheduling, AI writing
                  assistants, analytics platforms, customer management systems — have historically
                  been priced for enterprises and agencies. The bootstrapped creator, the small
                  business owner, the first-generation entrepreneur building something from
                  nothing? They get the watered-down version, if anything.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  That is a power structure. And like every power structure, it can be disrupted.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  SocialMate gives you what Buffer charges $99/month for, for $5. Or free.
                  These guides give you what $500 courses charge for — free. That&apos;s not a
                  marketing strategy. That&apos;s a value system.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The goal of everything I build, including this guide, is to give people the
                  tools, knowledge, and belief they need to build their own thing. Not because
                  I&apos;m a saint — but because I remember what it felt like to want these resources
                  and not be able to afford them. I remember Googling at 3am because I couldn&apos;t
                  pay for the answer.
                </p>
                <p className="leading-relaxed text-gray-300">
                  You don&apos;t need permission. You never did. Go build the thing.
                </p>
              </section>

              {/* JOSHUA'S NOTE */}
              <section id="joshua-note" className="mb-16 scroll-mt-8">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                    A Note from Joshua
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    I wrote this guide in between shifts. Some of it at a table in the break room.
                    Some of it at 11pm after a long deli shift, when my feet hurt and my eyes were
                    heavy but the idea wouldn&apos;t leave me alone.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    I&apos;m not a business school professor. I&apos;m not a serial entrepreneur with five
                    exits. I&apos;m a solo founder who is still in the middle of the story — still
                    clocking in, still building at night, still figuring it out. But I&apos;ve built
                    something real, launched it to the world, and learned things that took me years
                    to learn the hard way.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    If even one person reads this guide and takes one step toward the thing
                    they&apos;ve been thinking about — that&apos;s enough. If it saves someone three months
                    of mistakes, if it gives someone the courage to file the LLC, if it helps
                    someone understand that the co-founder leaving isn&apos;t the end — then this was
                    worth writing.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    Tell me how it goes. I&apos;m on social media everywhere as{' '}
                    <strong className="text-amber-400">@socialmatehq</strong>. Or email me at{' '}
                    <strong className="text-amber-400">socialmatehq@gmail.com</strong>.
                  </p>
                  <p className="leading-relaxed text-gray-300">
                    Keep building. The door is open.
                  </p>
                  <p className="mt-6 text-right text-sm text-amber-400 font-semibold">
                    — Joshua Bostic<br />
                    <span className="text-gray-600 font-normal">Founder, SocialMate</span>
                  </p>
                </div>
              </section>

              {/* Bottom navigation */}
              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <p className="font-bold text-white">Vol. 2: Marketing on Zero Budget</p>
                  <p className="text-sm text-gray-500">Coming soon</p>
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

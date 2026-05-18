import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'

export const metadata: Metadata = {
  title: "Creator Monetization — How to Actually Get Paid Online (Free Guide) — Gilgamesh's Guides",
  description:
    'The real monetization stack for creators: tip jars, fan subscriptions, digital products, brand deals, and affiliate income. How to stack multiple streams to $5K/month starting from zero.',
  keywords: [
    'creator monetization guide',
    'how to make money as a creator',
    'tip jar for creators',
    'fan subscriptions for creators',
    'digital products for creators',
    'brand deals how to get',
    'affiliate marketing creators',
    'creator economy 2026',
    'how to monetize a following',
    'creator income streams',
    'make money online creator',
    'social media monetization',
  ],
  openGraph: {
    title: "Creator Monetization — How to Actually Get Paid — Gilgamesh's Guide Vol. 5",
    description:
      'The real monetization stack for creators. Tip jars, fan subs, digital products, brand deals, affiliate income — stacked to $5K/month. No gatekeeping. Free.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',    label: 'Preface' },
  { id: 'ch1',       label: '1. Why Creators Stay Broke' },
  { id: 'ch2',       label: '2. The Monetization Stack' },
  { id: 'ch3',       label: '3. Tip Jars' },
  { id: 'ch4',       label: '4. Fan Subscriptions' },
  { id: 'ch5',       label: '5. Digital Products & Courses' },
  { id: 'ch6',       label: '6. Brand Deals' },
  { id: 'ch7',       label: '7. Affiliate Marketing' },
  { id: 'ch8',       label: '8. Stack to $5K/Month' },
  { id: 'resources', label: 'All Resources' },
]

export default function CreatorMonetizationGuidePage() {
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
                Vol. 5
              </span>
              <span className="text-xs text-gray-600">40 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Creator Monetization — How to Actually Get Paid
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The real stack: tip jars, fan subscriptions, digital products, brand deals, and affiliate income — stacked together until you hit $5K/month.
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
            {/* Sidebar TOC */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600">Contents</p>
                <nav className="space-y-1">
                  {CHAPTERS.map((ch) => (
                    <a
                      key={ch.id}
                      href={`#${ch.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-[#1a1a1a] hover:text-amber-400"
                    >
                      {ch.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <article className="min-w-0 flex-1 prose prose-invert prose-amber max-w-none">

              {/* Preface */}
              <section id="preface" className="mb-16">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 not-prose">
                  <p className="mb-4 text-sm font-bold uppercase tracking-widest text-amber-400">Preface</p>
                  <p className="mb-4 text-lg leading-relaxed text-gray-200">
                    The creator economy is worth over $250 billion. Most creators see none of it.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-400">
                    Not because they&apos;re not talented. Not because they don&apos;t hustle. Because nobody taught them the actual money architecture — where to put the pipes, how to stack the streams, how to turn an audience (even a small one) into a real income.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-400">
                    I built SocialMate after grinding through this exact problem — trying to grow an audience and monetize it with zero budget, zero team, zero playbook. What I discovered is that monetization isn&apos;t about going viral. It&apos;s about building multiple small streams that compound.
                  </p>
                  <p className="leading-relaxed text-gray-400">
                    This guide is everything I learned. From the first tip jar to stacking toward $5K/month. No fluff. No upsell disguised as advice. Just the door, open.
                  </p>
                </div>
              </section>

              {/* Chapter 1 */}
              <section id="ch1" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 1: Why Creators Stay Broke</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Most creators have one income stream. Usually it&apos;s ad revenue — which means they&apos;re dependent on an algorithm, a platform&apos;s policies, and the whims of advertisers who spend less when the economy sneezes.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Ad revenue on YouTube averages $1–$5 per 1,000 views depending on your niche. On TikTok it&apos;s worse — some creators report $0.02–$0.04 per 1,000 views. You need millions of monthly views just to cover rent.
                </p>

                <div className="not-prose rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-8">
                  <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">The Broke Creator Trap</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex gap-2"><span className="text-red-400">✗</span> Chasing views instead of building relationships</li>
                    <li className="flex gap-2"><span className="text-red-400">✗</span> One income stream (usually ad rev or brand deals) with no floor</li>
                    <li className="flex gap-2"><span className="text-red-400">✗</span> No owned audience — followers on a platform you don&apos;t control</li>
                    <li className="flex gap-2"><span className="text-red-400">✗</span> Waiting to "be big enough" to monetize</li>
                    <li className="flex gap-2"><span className="text-red-400">✗</span> Pricing work at zero to "build the audience first"</li>
                  </ul>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">
                  The number one lie in the creator economy is that you need a massive audience before you can make money. It&apos;s not true. A creator with 1,000 engaged followers who trust them can make $2,000–$5,000/month. A creator with 100,000 passive followers who only watch for entertainment and never buy? They might make $400 from ad rev.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Trust converts. Reach doesn&apos;t.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">The real problem: not stacking</h3>

                <p className="text-gray-300 leading-relaxed mb-6">
                  The creators making real money aren&apos;t doing one thing — they&apos;re stacking. A tip jar runs in the background. Fan subscriptions provide recurring base income. A digital product pays for groceries. A brand deal covers rent. Affiliate links generate passive income from content they already created. Every stream is small alone. Together they&apos;re life-changing.
                </p>

                <p className="text-gray-300 leading-relaxed">
                  That&apos;s the architecture this guide teaches. Let&apos;s build it.
                </p>
              </section>

              {/* Chapter 2 */}
              <section id="ch2" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 2: The Monetization Stack</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Think of monetization as a pyramid. The base is passive — it runs while you sleep and requires almost no upkeep. As you go up the pyramid, each layer is more active, more lucrative, but also more dependent on your time and audience trust.
                </p>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">The Creator Stack (bottom to top)</p>
                  <div className="space-y-3">
                    {[
                      { tier: '5 — Brand Deals', desc: 'Highest pay, most time, requires trust + audience', color: 'text-purple-400' },
                      { tier: '4 — Digital Products / Courses', desc: 'One-time work, passive income forever', color: 'text-amber-400' },
                      { tier: '3 — Fan Subscriptions', desc: 'Recurring monthly revenue, scales with loyalty', color: 'text-blue-400' },
                      { tier: '2 — Affiliate Marketing', desc: 'Passive from existing content, compounds over time', color: 'text-emerald-400' },
                      { tier: '1 — Tip Jar', desc: 'Zero friction, works from day one, any audience size', color: 'text-gray-300' },
                    ].map((item) => (
                      <div key={item.tier} className="flex items-start gap-3">
                        <span className={`text-sm font-bold ${item.color} w-48 shrink-0`}>{item.tier}</span>
                        <span className="text-sm text-gray-500">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">
                  You don&apos;t need all five running on day one. Start at the bottom, add layers as you grow. Most creators plateau because they skip layers 1–3 and chase brand deals that require follower counts they don&apos;t have yet.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">The golden rule: own your audience</h3>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Before every monetization strategy: build your email list. I know you&apos;ve heard this. I know it sounds old. It&apos;s still true in 2026.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  TikTok can shadowban you. Instagram can tank your reach. Twitter can ban your account. But nobody can take your email list. Your email list is your business continuity plan. Start capturing emails from day one — a free guide, a checklist, a template, anything. We&apos;ll talk tools in each chapter.
                </p>
              </section>

              {/* Chapter 3 */}
              <section id="ch3" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 3: Tip Jars — The Zero-Barrier Start</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  A tip jar is the least complicated monetization you can set up. It&apos;s a link. Someone taps it, types a dollar amount, and pays you. That&apos;s it.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  It feels embarrassing to some creators. Like asking for charity. Reframe it: tips are how audiences say "thank you for the thing that helped me." Every creator I know who added a tip link to their bio was surprised when someone actually used it — often within the first week.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">How to set up a tip jar</h3>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Options</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-white">Ko-fi</p>
                      <p className="text-xs text-gray-500">Free tier, 0% platform fee on one-time tips. Great starting point. Also does subscriptions, shop, commissions.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Buy Me a Coffee</p>
                      <p className="text-xs text-gray-500">5% fee on tips and memberships. Clean UI. Good integration with link-in-bio tools.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">SocialMate Creator Hub</p>
                      <p className="text-xs text-gray-500">Built into your SocialMate bio link. 0% platform cut — 100% goes to you via Stripe. Set presets ($1/$3/$5/$10) or custom amounts. Live at /creator/[handle].</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Stripe Payment Link</p>
                      <p className="text-xs text-gray-500">2.9% + 30¢ per tip, no platform cut. Full control. Good if you already use Stripe for other things.</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">How to actually get tips</h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  Most people don&apos;t tip because they forget or because the link is buried. The conversion tricks are simple:
                </p>

                <ul className="space-y-3 mb-8 text-gray-300">
                  <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">→</span> Put the link in your bio on every platform. Don&apos;t assume people will find it.</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">→</span> Mention it at the end of long-form content. "If this helped you, link in bio."</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">→</span> Set preset amounts ($3, $5, $10). People rarely fill in custom amounts. Presets reduce friction.</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">→</span> Name what the tip pays for. "If you want to keep this content free and ad-free, tips cover server costs." Specificity beats vague.</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold shrink-0">→</span> Say thank you publicly (anonymized). Post "Thank you to everyone who&apos;s tipped this month — you keep this going." It creates social proof that people tip.</li>
                </ul>

                <div className="not-prose rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="text-sm font-bold text-amber-400 mb-2">Realistic income from tips</p>
                  <p className="text-sm text-gray-400">If 0.5% of your monthly audience tips an average of $4 at 1,000 followers = $20/month. At 5,000 followers = $100/month. At 20,000 = $400/month. Small amounts that compound, and build the habit of your audience paying you.</p>
                </div>
              </section>

              {/* Chapter 4 */}
              <section id="ch4" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 4: Fan Subscriptions — Recurring Base Income</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  A tip is a one-time appreciation. A subscription is a relationship. This is where creator income starts to look sustainable.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Fan subscriptions work when your audience wants more — more content, earlier access, behind-the-scenes, direct access to you, exclusive community. The key word is <em>exclusive</em>. You&apos;re not gatekeeping free content. You&apos;re building a tier of deeper relationship for the people who want it most.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">Platforms for subscriptions</h3>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <div className="space-y-4">
                    <div className="border-b border-[#2a2a2a] pb-4">
                      <p className="text-sm font-bold text-white mb-1">Patreon</p>
                      <p className="text-xs text-gray-500 mb-1">8–12% platform fee. Industry standard. Built-in discovery. Good for artists, educators, writers, podcasters. Huge existing user base that already knows how to pay creators.</p>
                      <p className="text-xs text-amber-400">Best for: established creators who want access to Patreon&apos;s marketplace discovery</p>
                    </div>
                    <div className="border-b border-[#2a2a2a] pb-4">
                      <p className="text-sm font-bold text-white mb-1">Substack</p>
                      <p className="text-xs text-gray-500 mb-1">10% fee on paid subscriptions. Free newsletters → paid newsletters. Writer-focused. Great SEO for your content. Built-in recommendation network.</p>
                      <p className="text-xs text-amber-400">Best for: writers, thinkers, journalists, any creator with a newsletter-first strategy</p>
                    </div>
                    <div className="border-b border-[#2a2a2a] pb-4">
                      <p className="text-sm font-bold text-white mb-1">Ko-fi Memberships</p>
                      <p className="text-xs text-gray-500 mb-1">0% fee on free tier (5% on gold). Simple monthly memberships with perks. Good for creators already on Ko-fi for tips — low-friction upsell.</p>
                      <p className="text-xs text-amber-400">Best for: smaller creators who want minimal setup and zero platform cut</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">SocialMate Creator Hub (fan subscriptions)</p>
                      <p className="text-xs text-gray-500 mb-1">0% platform cut. You set the monthly price, description, and perks. Stripe handles billing. Your subscribers live on your account, not on someone else&apos;s platform.</p>
                      <p className="text-xs text-amber-400">Best for: creators who want to own the relationship with no middleman fee</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">What to offer subscribers</h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  The #1 mistake is not being specific about what subscribers get. "Support me on Patreon" converts poorly. "Get all my templates + weekly behind-the-scenes + Discord access for $5/month" converts.
                </p>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">What actually works as subscription perks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Early access to videos/posts',
                      'Ad-free versions',
                      'Monthly templates/resources',
                      'Discord or community access',
                      'Q&A or AMA sessions',
                      'Behind-the-scenes content',
                      'Input on what you create next',
                      'Monthly 1:1 call (higher tier)',
                    ].map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-emerald-500">✓</span> {perk}
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">Pricing your tiers</h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  Three tiers is the sweet spot. A low entry tier ($3–$5), a main tier ($9–$15), and a high-touch tier ($25–$50) for the people who really want to support you.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Most of your revenue will come from the middle tier. The low tier gets people in the door. The high tier captures your biggest fans. Don&apos;t price the high tier cheap — your most committed fans want to pay more to show it.
                </p>

                <div className="not-prose rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="text-sm font-bold text-amber-400 mb-2">Realistic subscription income</p>
                  <p className="text-sm text-gray-400 mb-2">With 1,000 followers, if 3% subscribe at $7/month average = $210/month recurring. At 5,000 followers with 3% = $1,050/month. At 10,000 = $2,100/month. This is stable floor income — it doesn&apos;t go away when the algorithm changes.</p>
                  <p className="text-xs text-gray-600">Note: 3% subscriber conversion rate is realistic for a highly engaged niche audience. Broad entertainment audiences convert lower (0.5–1%). Deep-value educational or niche communities convert higher (5–10%).</p>
                </div>
              </section>

              {/* Chapter 5 */}
              <section id="ch5" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 5: Digital Products & Courses — Work Once, Sell Forever</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  A digital product is one of the most powerful moves in the creator monetization stack. You build it once. You sell it unlimited times. There&apos;s no inventory, no shipping, no fulfillment beyond automated email delivery. Every sale while you sleep is possible.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">What you can sell</h3>

                <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { product: 'Templates', desc: 'Notion templates, Canva designs, spreadsheets, planners. Creator template packs regularly sell for $15–$50.', example: 'Content Calendar Template, Social Media Strategy Spreadsheet' },
                    { product: 'E-books / Guides', desc: 'PDFs or Gumroad downloads. Your expertise in a structured format. Price: $9–$29.', example: 'Like this guide, but packaged and sold' },
                    { product: 'Presets / Filters', desc: 'Lightroom presets, video LUTs, audio presets. Huge in photo/video niches. $15–$60 packs.', example: 'Photography presets, VSCO packs, DaVinci LUTs' },
                    { product: 'Mini-courses', desc: 'Video series (5–10 short lessons) covering one specific outcome. Sweet spot: $47–$97.', example: '"How to Batch 30 Days of Content in a Weekend"' },
                    { product: 'Full courses', desc: 'Comprehensive training (10+ hours). Premium pricing: $97–$497+.', example: '"Social Media Content System — Zero to 10K"' },
                    { product: 'Swipe files', desc: 'Caption templates, hook collections, email scripts. Fast to create, quick sells at $7–$19.', example: '100 Caption Hooks, DM Sales Scripts' },
                  ].map((item) => (
                    <div key={item.product} className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-5">
                      <p className="text-sm font-bold text-white mb-1">{item.product}</p>
                      <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
                      <p className="text-xs text-gray-700 italic">{item.example}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-white mb-4">Where to sell</h3>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <span className="font-bold text-white w-28 shrink-0">Gumroad</span>
                      <span className="text-gray-400">10% fee. Easiest setup. Built-in marketplace discovery. Start here if you want to sell in 20 minutes.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-white w-28 shrink-0">Lemon Squeezy</span>
                      <span className="text-gray-400">5% + $0.50/sale. Better for SaaS/software but works for any digital product. Handles EU VAT automatically.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-white w-28 shrink-0">Teachable</span>
                      <span className="text-gray-400">Free plan available. Built specifically for courses. Handles video hosting, drip content, quizzes, certificates.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-white w-28 shrink-0">Podia</span>
                      <span className="text-gray-400">0% transaction fee on paid plans. Courses + digital downloads + memberships in one. Clean UI.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-bold text-white w-28 shrink-0">Notion + Stripe</span>
                      <span className="text-gray-400">DIY: create a Notion page, gate it with Stripe payment link. Works but requires more setup. 2.9% + 30¢, no platform cut.</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">The "done in a weekend" product launch</h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  You don&apos;t need a polished Teachable course on day one. Here&apos;s the fastest path to your first $100 in digital products:
                </p>

                <ol className="space-y-3 mb-8 text-gray-300">
                  <li className="flex gap-3"><span className="text-amber-400 font-bold">1.</span> Ask your audience: "What&apos;s one thing you keep asking me about?" (DMs, stories, comments)</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold">2.</span> Write that out as a 10–20 page PDF guide. Google Docs → Download as PDF. No designer needed.</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold">3.</span> Upload to Gumroad. Set price: $9–$19.</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold">4.</span> Post the link in your bio. Post one story/video about what&apos;s inside.</li>
                  <li className="flex gap-3"><span className="text-amber-400 font-bold">5.</span> Done. Iterate from feedback.</li>
                </ol>

                <div className="not-prose rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="text-sm font-bold text-amber-400 mb-2">Realistic digital product income</p>
                  <p className="text-sm text-gray-400">A $19 template sold to 1% of a 2,000-person audience = $380 from one launch. If you repromote it quarterly, that&apos;s $1,500+/year from one PDF. Courses in the $47–$97 range at 10–20 sales/month = $470–$1,940/month consistently once the audience is warm.</p>
                </div>
              </section>

              {/* Chapter 6 */}
              <section id="ch6" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 6: Brand Deals — Getting Paid to Recommend Things</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  A brand deal is when a company pays you to feature their product in your content. It&apos;s the most visible monetization layer and often the highest per-post payout — but it&apos;s also the most misunderstood.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Most creators think you need 100,000 followers to land brand deals. You don&apos;t. Micro-influencer deals (5K–50K) are some of the most active right now because brands want real engagement, not inflated numbers. A creator with 8,000 engaged followers in a specific niche is more valuable to the right brand than someone with 80,000 passive followers.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">How to get your first brand deal</h3>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Step 1: Build your media kit</p>
                      <p className="text-sm text-gray-400">One-page PDF: who you are, your audience demographics (age, location, niche), platform numbers (followers, avg views, engagement rate), past brand work (if any), rate card. Canva has free media kit templates. Make it clean and professional.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Step 2: Start with brands you already use</p>
                      <p className="text-sm text-gray-400">Your first pitch is always easiest when it&apos;s authentic. "I use your product, I&apos;ve mentioned it organically, here&apos;s a proposal for a formal partnership." Find their influencer marketing contact (often marketing@ or partnerships@).</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Step 3: Use creator marketplaces</p>
                      <p className="text-sm text-gray-400">Aspire, Grin, Creator.co, Influencer.com, #paid, TikTok Creator Marketplace, YouTube BrandConnect — these connect brands to creators actively looking for deals. Apply with your media kit.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Step 4: Cold outreach (it works)</p>
                      <p className="text-sm text-gray-400">Find brands whose audience overlaps yours. Send a personalized email: your hook, why their product fits your audience, your numbers, and a specific content idea. Not a templated blast. Personalized, specific, brief.</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">Pricing your deals</h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  The industry rough rate for social media posts as of 2026: approximately $100 per 10,000 followers per post. That&apos;s a baseline — adjust up for higher engagement, niche audiences, video content (costs more), or product-market fit. Never post for free in exchange for the product unless you genuinely want the product and the brand is too small to pay.
                </p>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 mb-8">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Rough rate benchmarks</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">5K followers, 1 IG post</span><span className="text-amber-400">$50–$150</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">10K followers, 1 TikTok</span><span className="text-amber-400">$100–$300</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">25K followers, 1 YouTube integration</span><span className="text-amber-400">$500–$1,500</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">50K followers, dedicated YouTube video</span><span className="text-amber-400">$1,000–$3,000</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Monthly ambassador deal (multi-platform)</span><span className="text-amber-400">negotiated, often 3–6× single post rate</span></div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">The non-obvious thing about brand deals</h3>

                <p className="text-gray-300 leading-relaxed mb-4">
                  The best brand deals come to you because you&apos;ve already talked about a product organically. Brands search hashtags, track who mentions their products, and reach out. This is why authenticity isn&apos;t just a values thing — it&apos;s a business strategy. Create genuinely, talk about what you actually use, and deals will eventually come to you.
                </p>

                <p className="text-gray-300 leading-relaxed">
                  Also: always disclose. #ad and #sponsored aren&apos;t optional — they&apos;re FTC-required in the US. Beyond legal compliance, audiences respect honesty. The creators who over-promote lose trust faster than they gain income.
                </p>
              </section>

              {/* Chapter 7 */}
              <section id="ch7" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 7: Affiliate Marketing — Passive Income from Content You Already Made</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Affiliate marketing is the closest thing to printing money that&apos;s completely legal. You recommend a product, someone buys it through your link, you earn a commission — usually 5–50% depending on the program.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  The magic of affiliate marketing is that it&apos;s retroactive. A blog post you wrote two years ago is still earning commissions today. A YouTube video from last year with your affiliate link in the description is still generating clicks. Content compounds. Affiliate income compounds with it.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">The best affiliate programs for creators</h3>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <div className="space-y-3">
                    {[
                      { program: 'Amazon Associates', commission: '1–10%', notes: 'Wide variety. Low rates but high conversion because everyone trusts Amazon.' },
                      { program: 'SaaS tools (Notion, Canva, etc.)', commission: '20–40% recurring', notes: 'The golden ticket. Monthly recurring commissions for every subscriber you refer.' },
                      { program: 'Creator tools (SocialMate, etc.)', commission: '30% recurring', notes: 'SocialMate partners earn 30% of every active subscriber, forever.' },
                      { program: 'Impact / CJ Affiliate / ShareASale', commission: 'varies', notes: 'Marketplace networks — apply once, access hundreds of brands.' },
                      { program: 'ClickBank', commission: '30–75%', notes: 'High commissions, often digital products. Research before promoting — quality varies.' },
                      { program: 'ConvertKit / Beehiiv', commission: '30% recurring', notes: 'Email platforms. High value because email is mission-critical for creators who buy it.' },
                    ].map((item) => (
                      <div key={item.program} className="flex gap-3 text-sm">
                        <span className="font-bold text-white w-44 shrink-0">{item.program}</span>
                        <span className="text-amber-400 w-28 shrink-0">{item.commission}</span>
                        <span className="text-gray-500">{item.notes}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">How to do affiliate marketing right</h3>

                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <div>
                      <strong className="text-white">Only promote what you actually use.</strong> Your audience trusts you. Break that trust once and it costs you far more than the commission.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <div>
                      <strong className="text-white">Put links in high-traffic places.</strong> YouTube descriptions. Blog post "tools I use" sections. Link in bio. Newsletter footer. Not just in the post where you mention it once.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <div>
                      <strong className="text-white">Create comparison content.</strong> "Tool A vs Tool B" and "Best tools for [niche]" content drives affiliate clicks because people in buying mode search these terms.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <div>
                      <strong className="text-white">Use a link manager.</strong> Don&apos;t paste raw affiliate links. Use Linktree, your bio page, or a link shortener so you can update links if programs change without editing 50 old posts.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <div>
                      <strong className="text-white">Disclose always.</strong> "This post contains affiliate links. If you buy through them, I earn a small commission at no extra cost to you." Required by FTC. Also builds trust.
                    </div>
                  </li>
                </ul>

                <div className="not-prose rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="text-sm font-bold text-amber-400 mb-2">Realistic affiliate income</p>
                  <p className="text-sm text-gray-400">A creator with a newsletter of 3,000 subscribers recommending 3–4 SaaS tools in a "stack" post: if 2% click and 10% of those subscribe to a $15/month tool with 30% recurring commission = $27/month recurring per 100 subscribers who convert. Small, but it grows every month and you built it once.</p>
                </div>
              </section>

              {/* Chapter 8 */}
              <section id="ch8" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">Chapter 8: Stacking to $5K/Month</h2>

                <p className="text-gray-300 leading-relaxed mb-6">
                  $5K/month is the number that changes things. It&apos;s not "quit your job tomorrow" money for most people — but it&apos;s "I have a real business and this is sustainable" money. Here&apos;s how the stack gets you there.
                </p>

                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 mb-8">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">A $5K/month stack at 10,000 followers</p>
                  <div className="space-y-3">
                    {[
                      { stream: 'Fan Subscriptions', math: '300 subscribers × $7/month avg', result: '$2,100' },
                      { stream: 'Digital Products', math: '20 sales/month × $47 avg', result: '$940' },
                      { stream: 'Brand Deals', math: '1–2 deals/month @ $300–$600 each', result: '$600' },
                      { stream: 'Affiliate Income', math: 'Recurring commissions on 5+ tools', result: '$300' },
                      { stream: 'Tip Jar', math: 'Passive baseline', result: '$100' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400 flex-1">{item.stream}</span>
                        <span className="text-gray-600 text-xs flex-1 hidden sm:block">{item.math}</span>
                        <span className="text-emerald-400 font-bold w-16 text-right">{item.result}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#2a2a2a] pt-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-white">Total</span>
                      <span className="font-black text-amber-400 text-lg">~$4,040/month</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">Plus growth, seasonality, and occasional product launch spikes — $5K becomes achievable within a 3–6 month ramp once all streams are active.</p>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">The 12-month roadmap</h3>

                <div className="not-prose space-y-4 mb-8">
                  {[
                    { phase: 'Month 1–2: Foundation', items: ['Set up tip jar on bio', 'Start email list (free opt-in)', 'Post consistently — find your niche'] },
                    { phase: 'Month 3–4: First Product', items: ['Launch one $9–$19 digital product', 'Apply to 3 affiliate programs', 'Post "tools I use" content'] },
                    { phase: 'Month 5–6: Subscriptions', items: ['Launch fan subscription tier', 'Email list push for founding members', 'Reach out to 5 brands for deals'] },
                    { phase: 'Month 7–9: Optimize', items: ['Second product (higher ticket)', 'Nurture affiliate content library', 'Land 1–2 recurring brand partner'] },
                    { phase: 'Month 10–12: Scale', items: ['Course or premium product launch', 'Raise subscription price or add tier', 'System and schedule for all streams'] },
                  ].map((phase) => (
                    <div key={phase.phase} className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-5">
                      <p className="text-sm font-bold text-amber-400 mb-3">{phase.phase}</p>
                      <ul className="space-y-1">
                        {phase.items.map((item) => (
                          <li key={item} className="flex gap-2 text-sm text-gray-400">
                            <span className="text-amber-500/60">—</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-white mb-4">The one thing that accelerates everything</h3>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Consistency. Not going viral. Not the perfect platform. Not waiting until your content is perfect. Every creator I know who hit $5K/month got there by showing up every week for 12–18 months. Not explosively. Not overnight. By building slowly, stacking deliberately, and not stopping.
                </p>

                <p className="text-gray-300 leading-relaxed mb-6">
                  You are one platform algorithm shift away from losing your reach. You are not one algorithm shift away from losing your email list, your subscribers, your products, or your affiliate relationships. Build those. Protect them. The audience you own is the audience that pays you.
                </p>

                <div className="not-prose rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
                  <p className="text-lg font-black text-white mb-3">
                    "Don&apos;t build for the algorithm. Build for the person."
                  </p>
                  <p className="text-sm text-gray-500">
                    The creator who knows their audience deeply will always outmonetize the creator chasing trends. Find one person you&apos;re talking to. Know what keeps them up at night. Solve it. Charge for it. That&apos;s the whole business.
                  </p>
                </div>
              </section>

              {/* Resources */}
              <section id="resources" className="mb-16">
                <h2 className="text-3xl font-black text-white mb-6">All Resources Mentioned</h2>

                <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { category: 'Tip Jars', items: ['Ko-fi', 'Buy Me a Coffee', 'SocialMate Creator Hub', 'Stripe Payment Links'] },
                    { category: 'Fan Subscriptions', items: ['Patreon', 'Substack', 'Ko-fi Memberships', 'SocialMate Fan Subs'] },
                    { category: 'Digital Products', items: ['Gumroad', 'Lemon Squeezy', 'Teachable', 'Podia', 'Notion + Stripe'] },
                    { category: 'Brand Deal Marketplaces', items: ['Aspire', 'Creator.co', '#paid', 'TikTok Creator Marketplace', 'YouTube BrandConnect'] },
                    { category: 'Affiliate Networks', items: ['Amazon Associates', 'Impact', 'CJ Affiliate', 'ShareASale', 'ClickBank'] },
                    { category: 'Email & Scheduling', items: ['ConvertKit (email)', 'Beehiiv (newsletter)', 'SocialMate (scheduling + bio)'] },
                  ].map((group) => (
                    <div key={group.category} className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-5">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{group.category}</p>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item} className="text-sm text-gray-400">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Final note */}
              <section className="mb-16">
                <div className="not-prose rounded-2xl border border-[#2a2a2a] bg-[#111111] p-8">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-4">A final note from Joshua</p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    I wrote this guide because I spent years watching talented creators stay broke not because they weren&apos;t good enough — but because nobody showed them the architecture. The same way nobody showed me the LLC setup, the credit system, the affiliate structure. That information was locked behind courses costing more than my rent.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    This is your architecture. It&apos;s not theoretical. These are the same streams I&apos;ve been building with SocialMate — tip jar, subscriptions (plan upgrades), digital products (credit packs), brand deals (Studio Stax partnerships), and affiliate commissions (30% recurring). One source didn&apos;t build a business. Stacking did.
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    Start with one stream. Get your first $10. Then $100. Then stack. The ceiling is wherever you decide to stop building.
                  </p>
                  <p className="mt-6 text-sm text-amber-400 font-bold">— Joshua Bostic, Founder of SocialMate, Gilgamesh Enterprise LLC</p>
                </div>
              </section>

            </article>
          </div>
        </div>

        {/* Email Capture */}
        <div className="border-t border-[#1f1f1f]">
          <GuideEmailCapture />
        </div>

        <footer className="border-t border-[#1f1f1f] px-6 py-8 text-center">
          <p className="text-xs text-gray-700">
            © Gilgamesh Enterprise LLC — Written by Joshua Bostic. All guides are free, forever.
          </p>
        </footer>
      </div>
    </PublicLayout>
  )
}

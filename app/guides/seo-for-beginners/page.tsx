import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: 'SEO for Normal People (Free Guide) — Gilgamesh\'s Guides',
  description:
    'How to get found on Google without paying anyone $3,000 a month. Keyword research, Google Search Console, on-page SEO, blog strategy, and backlinks — explained plainly for non-technical founders.',
  keywords: [
    'seo for beginners',
    'how to do seo yourself',
    'seo for small business',
    'free seo tools',
    'google search console tutorial',
    'keyword research for beginners',
    'how to rank on google',
    'on page seo basics',
    'blog seo strategy',
    'seo without hiring an agency',
  ],
  openGraph: {
    title: 'SEO for Normal People — Gilgamesh\'s Guide Vol. 13',
    description:
      'Get found on Google without paying anyone $3,000 a month. Keyword research, Search Console, on-page basics, and a blog strategy that pays off for years.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',  label: 'Preface' },
  { id: 'ch1',     label: '1. What Google Is Actually Looking For' },
  { id: 'ch2',     label: '2. Keyword Research for Free' },
  { id: 'ch3',     label: '3. Google Search Console' },
  { id: 'ch4',     label: '4. On-Page SEO in Plain English' },
  { id: 'ch5',     label: '5. Blog Posts as 5-Year Assets' },
  { id: 'ch6',     label: '6. The Internal Linking Game' },
  { id: 'ch7',     label: '7. Getting Backlinks Without Being Annoying' },
  { id: 'ch8',     label: '8. Local SEO vs. National SEO' },
  { id: 'ch9',     label: '9. When to Hire Someone vs. Do It Yourself' },
  { id: 'epilogue', label: 'Epilogue' },
]

export default function SeoForBeginnersPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link href="/guides" className="text-xs text-gray-600 hover:text-amber-400 transition-colors">
                ← All Guides
              </Link>
              <span className="text-gray-700">·</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Vol. 13
              </span>
              <span className="text-xs text-gray-600">35 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              SEO for Normal People
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              Get Found on Google Without Paying Anyone $3,000 a Month
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

            <article className="min-w-0 flex-1">
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

              <section id="preface" className="mb-16 scroll-mt-8">
                <h2 className="mb-6 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Preface: What SEO Is and Why It Matters More Than People Tell You
                </h2>
                <p className="mb-4 leading-relaxed text-gray-300">
                  SEO — search engine optimization — is the process of making your website
                  show up when people search for things on Google. That&apos;s it. Everything else
                  is just details.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The reason it matters: Google processes about 8.5 billion searches every day.
                  When someone types &quot;free social media scheduler&quot; or &quot;how to start an LLC in
                  Wyoming&quot; or &quot;tree service near me,&quot; Google returns a list of results. The
                  sites at the top get clicked. The ones on page 2 might as well not exist —
                  less than 1 percent of searchers ever click past the first page.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The SEO industry has made this feel complicated because complicated things
                  justify $3,000-a-month retainers. Most of it is not complicated. The basics
                  of SEO have not changed in 10 years: create genuinely useful content for
                  real people, structure it so Google can read it, and get other sites to
                  reference it. That&apos;s 80 percent of the job.
                </p>
                <p className="leading-relaxed text-gray-300">
                  This guide is the 80 percent. Written for normal people who have a business,
                  a product, or something worth finding — and want people to actually find it.
                </p>
              </section>

              <section id="ch1" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 1: What Google Is Actually Looking For
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Search intent, authority, and why stuffing keywords into your page stopped working in 2012.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Google&apos;s job is to give searchers the most useful result for whatever they typed.
                  That&apos;s the only thing it cares about. Everything in SEO flows from understanding
                  what Google considers &quot;most useful&quot; and building toward that — not gaming it.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Search intent is everything</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Before Google decides which page to show, it tries to understand what the
                  person actually wants. There are four types of search intent:
                </p>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Informational</strong> — &quot;how to build an email list.&quot;
                    They want to learn. The right content is a guide or blog post.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Navigational</strong> — &quot;SocialMate login.&quot;
                    They want a specific page. Don&apos;t compete for navigational searches
                    you don&apos;t own.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Commercial investigation</strong> — &quot;best social
                    media scheduler.&quot; They&apos;re comparing options before buying. The right content
                    is a comparison page, features page, or vs. page.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Transactional</strong> — &quot;SocialMate Pro plan.&quot;
                    They want to buy. Send them to the pricing or product page directly.
                  </li>
                </ol>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The most common SEO mistake is writing a blog post when someone&apos;s search
                  intent is transactional, or building a product page when someone wants a
                  guide. Match the content type to what the searcher actually wants.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The three signals Google uses to rank pages</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Relevance</strong> — does this page actually
                    answer what was searched? Google reads your page content, title, headings,
                    and structure to decide.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Authority</strong> — does Google trust this
                    site? Authority is primarily built through backlinks — other websites
                    linking to yours as a reference. A new site has low authority. An old
                    site with many quality inbound links has high authority.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">User experience</strong> — does the page
                    load fast? Is it readable on mobile? Do people stick around after clicking?
                    Google tracks these signals through Chrome usage data.
                  </li>
                </ol>

                <Callout>
                  A new website can rank for low-competition keywords even with zero
                  authority, if the content genuinely answers a specific question better
                  than what&apos;s currently ranking. This is the opening for bootstrapped builders:
                  target the specific long-tail keywords your bigger competitors aren&apos;t
                  bothering with, and write the best answer on the internet for each one.
                </Callout>
              </section>

              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Keyword Research for Free
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to find the exact words your customers are typing — without paying for tools.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Keyword research is figuring out which words and phrases people type into
                  Google when looking for what you offer. The goal is to find keywords that
                  have real search volume (people are actually searching for them) and low
                  competition (you can realistically rank for them without a decade of SEO work).
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Free tools that work</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Google itself.</strong> Type your topic into
                    Google and look at the autocomplete suggestions. Then scroll to the bottom
                    of the results page — &quot;People also ask&quot; and &quot;Related searches&quot; show
                    you exactly what people search for around your topic. Free, real, current.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Google Search Console.</strong> Once your site
                    is verified (see next chapter), GSC shows you exactly what search terms
                    your site is already appearing for. This is gold — these are real searches
                    real people did that showed your pages, even if they didn&apos;t click.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Ubersuggest.</strong> Neil Patel&apos;s tool offers
                    free keyword search volume estimates, competition scores, and related keyword
                    ideas. Free tier gives you 3 searches per day — enough when you&apos;re researching
                    intentionally.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">AnswerThePublic.</strong> Visualizes every
                    question people ask around a keyword. Type &quot;email list&quot; and it shows
                    &quot;how to build an email list,&quot; &quot;why email lists matter,&quot; &quot;when to start
                    an email list.&quot; These question formats are excellent for blog post titles.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Reddit.</strong> Search your topic on Reddit
                    and read what people actually say. The specific words they use, the
                    questions they ask, the frustrations they express — these are often
                    better keyword signals than any tool.
                  </li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Long-tail keywords are your friend when you&apos;re starting out</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  &quot;Social media scheduler&quot; gets searched 40,000 times a month — and every
                  well-funded competitor is fighting for it. You will not rank for it as a
                  new site. &quot;Free social media scheduler for small business&quot; gets searched
                  500 times a month — and the competition is much thinner. Win the specific
                  searches first. Authority builds from there.
                </p>

                <Callout>
                  The counterintuitive truth about keyword research: start more specific than
                  you think you need to be. &quot;How to start a business in Wyoming with no money&quot;
                  is better than &quot;how to start a business.&quot; You want to be the best answer
                  for a narrow search before you try to compete for a broad one.
                </Callout>
              </section>

              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Google Search Console — Your Free Scoreboard
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The free Google tool that tells you exactly how your site performs in search.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Google Search Console (GSC) is a free tool from Google that shows you how
                  your website is performing in search results. It is the most valuable SEO
                  tool available to you — and it&apos;s completely free. Most small business owners
                  and creators have never set it up.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to set it up</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Go to search.google.com/search-console and sign in with your Google account.</li>
                  <li>Click &quot;Add property&quot; and choose &quot;Domain&quot; (covers all versions of your site).</li>
                  <li>Google will give you a DNS TXT record to verify ownership. Log into your domain registrar (Porkbun, GoDaddy, Namecheap, wherever you bought your domain).</li>
                  <li>Add the TXT record to your domain&apos;s DNS settings. Paste the value exactly as given.</li>
                  <li>Click &quot;Verify&quot; in GSC. It may take up to 48 hours to confirm.</li>
                  <li>Once verified, go to Sitemaps and enter just <code className="text-amber-400">sitemap.xml</code> — not the full URL. Google finds it from your domain.</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What to look at in GSC</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Performance report.</strong> Shows which search
                    queries your site appeared for, how many times it was clicked, and your
                    average position. Sort by impressions to find keywords you&apos;re already
                    showing up for but not ranking high enough to get clicks — these are
                    your best optimization opportunities.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Coverage report.</strong> Shows any errors
                    Google found when crawling your pages. Fix errors here — they block
                    Google from indexing your content.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Core Web Vitals.</strong> Shows your page
                    speed and experience scores. Pages with poor scores get ranked lower.
                  </li>
                </ol>

                <Callout>
                  The most actionable thing in GSC: find queries where your average position
                  is between 8 and 20. Those are pages barely outside the first page of
                  results. A small improvement — better title, more content, a few backlinks —
                  can push them onto page 1, which dramatically increases clicks. This is
                  the fastest SEO win available to an established site.
                </Callout>
              </section>

              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: On-Page SEO in Plain English
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The elements on every page that tell Google what you&apos;re about.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  On-page SEO is everything you control on the page itself — titles, headings,
                  content, images, links. This is where most of the everyday work happens.
                  Done right once, it pays off for years.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The title tag</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The title tag is what appears as the clickable blue link in Google results.
                  It&apos;s the single most important on-page element. Rules:
                </p>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Include the primary keyword you want to rank for — ideally near the front</li>
                  <li>Keep it under 60 characters or Google will cut it off</li>
                  <li>Make it compelling enough to click, not just stuffed with keywords</li>
                  <li>Every page should have a unique title — no duplicates</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The meta description</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The two-line summary that appears under your title in search results. Google
                  doesn&apos;t use it as a ranking factor, but it directly affects whether people
                  click. Write it as a pitch: what will the reader get from this page, in 155
                  characters or less. Include the keyword naturally.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Headings (H1, H2, H3)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Every page should have exactly one H1 — the main title. Use H2s for major
                  sections and H3s for subsections. Google reads heading structure to understand
                  how the content is organized. Include your main keyword in the H1 and relevant
                  secondary keywords in H2s naturally.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Image alt text</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Every image should have alt text — a short description of what the image shows.
                  Google can&apos;t &quot;see&quot; images; it reads the alt text to understand them. Also
                  helps with accessibility. Keep it descriptive and natural: &quot;screenshot of
                  SocialMate calendar view with scheduled posts&quot; not &quot;image1.jpg.&quot;
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">URL structure</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Clean, readable URLs rank better and get clicked more. Use hyphens between
                  words, include the keyword, and keep it short.
                  <code className="text-amber-400 block mt-2 text-sm">
                    socialmate.studio/guides/email-list-building
                  </code>
                  beats
                  <code className="text-amber-400 block mt-2 text-sm">
                    socialmate.studio/page?id=1234&cat=guides
                  </code>
                </p>
              </section>

              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: Blog Posts as 5-Year Assets
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why every good blog post you write today is still bringing in traffic in 2031.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  An ad you stop paying for stops working immediately. A blog post you publish
                  today can rank on Google for years, bringing in new visitors every single
                  day with zero ongoing cost. This is the compounding math of SEO that most
                  people don&apos;t think about when they say &quot;does blogging even work anymore?&quot;
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  It works. But the posts that rank for years have specific characteristics.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What makes a blog post rank</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">It targets one specific keyword.</strong>
                    Each post should be built around one search query. Not five. One. The
                    title, H1, first paragraph, and several points throughout should reference
                    that keyword naturally.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">It answers the search intent completely.</strong>
                    If someone searches &quot;how to do keyword research for free,&quot; the post should
                    answer that question fully. Not tease an answer and push them to buy a
                    course. Google tracks whether people click &quot;back&quot; to return to search
                    results after visiting your page — if they do, the page didn&apos;t answer
                    the question.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">It&apos;s comprehensive.</strong> Longer content
                    outranks thin content for informational searches. Not because length is a
                    ranking factor — it isn&apos;t. But because a 2,000-word guide naturally covers
                    more related keywords, answers more related questions, and signals more
                    depth than a 400-word post.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">It&apos;s updated when information changes.</strong>
                    A post titled &quot;Best free SEO tools in 2023&quot; starts losing traffic in 2024.
                    Update the date, refresh the content, and Google will continue to show it.
                  </li>
                </ol>

                <Callout>
                  Write 12 solid blog posts this year — one per month — each targeting a
                  specific keyword your ideal customer searches for. Do it right. In three
                  years you have 36 posts compounding, each bringing in traffic. That beats
                  posting every day for a month and burning out. Consistency at sustainable
                  pace beats sprints every time.
                </Callout>
              </section>

              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: The Internal Linking Game
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The free SEO tactic almost nobody does consistently — and why it moves rankings.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Internal links are links from one page on your site to another page on your
                  site. When you write a blog post and link to your pricing page, or link to
                  a related guide — that&apos;s an internal link. Most people add these ad hoc
                  or not at all. Treated as a system, they significantly improve rankings.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s why it works: Google discovers pages by following links. The more
                  internal links a page has pointing to it, the more Google crawls it, the
                  more authority it accumulates, and the higher it ranks. You can directly
                  boost the ranking of your most important pages by linking to them from
                  every relevant post you write.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to do it systematically</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Identify your 5 to 10 most important pages (pricing, features, key landing pages)</li>
                  <li>Every time you write a new blog post, find a natural place to link to at least 2 of those pages</li>
                  <li>Use descriptive anchor text — not &quot;click here&quot; but &quot;free social media scheduler&quot; or &quot;how to build a business credit score&quot;</li>
                  <li>Also link to related blog posts within each post — this keeps readers on your site longer and signals to Google that your content connects</li>
                </ol>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Once a quarter, go back and add internal links to your most important
                  new pages from older posts. It takes 30 minutes and directly pushes those
                  pages up in rankings.
                </p>
              </section>

              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: Getting Backlinks Without Being Annoying
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How other sites linking to yours builds authority — and the tactics that actually work.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Backlinks are links from other websites pointing to yours. They are the
                  primary way Google measures authority. A site with 100 quality backlinks
                  will almost always outrank a technically perfect site with zero backlinks.
                  Getting backlinks is hard — which is exactly why it&apos;s worth doing.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Tactics that actually work</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Create something genuinely linkable.</strong>
                    Free tools, original data, comprehensive guides, free templates. If you
                    publish something genuinely useful, people link to it without being asked.
                    The guides in this series are a good example — free, comprehensive, easy
                    to reference.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Get listed in relevant directories.</strong>
                    ProductHunt, G2, Capterra, AlternativeTo for software. Local business
                    directories (Google Business Profile, Yelp, your Chamber of Commerce) for
                    local businesses. These are legitimate backlinks and easy to get.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">HARO / Connectively.</strong> Help A Reporter
                    Out — journalists post questions looking for expert sources for articles.
                    You answer, they quote you and link to your site. It&apos;s free, takes 15
                    minutes a day, and can land links in major publications.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Guest posts on blogs your audience reads.</strong>
                    Write an article for a publication your ideal customer reads. You get
                    a backlink in the author bio and exposure to a relevant audience.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Partner cross-links.</strong> If you have
                    non-competing businesses in adjacent spaces, link to each other&apos;s relevant
                    pages. A social media guide linking to an email marketing guide makes
                    sense for readers and for SEO.
                  </li>
                </ol>

                <Callout>
                  Don&apos;t buy backlinks. Ever. Google&apos;s Penguin algorithm specifically penalizes
                  paid link schemes. Sites that rank well from bought links eventually get
                  deindexed and lose everything. Build links through content and relationships.
                  It&apos;s slower. It&apos;s permanent.
                </Callout>
              </section>

              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: Local SEO vs. National SEO
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Different strategies for different goals — and which one applies to you.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Local SEO is for businesses that serve customers in a specific geographic area:
                  tree services, dentists, restaurants, plumbers, freelancers who work locally.
                  National SEO is for products and services available to anyone anywhere: SaaS
                  products, online courses, e-commerce, content sites.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The tactics overlap but the priorities differ.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Local SEO priorities</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Google Business Profile</strong> — this is the single biggest lever. A complete, verified GBP shows your business in the &quot;map pack&quot; — the 3 results with the map that appear above organic results for local searches. Set it up before anything else.</li>
                  <li><strong className="text-white">NAP consistency</strong> — your Name, Address, and Phone number must be identical everywhere online. Inconsistent info confuses Google and hurts local rankings.</li>
                  <li><strong className="text-white">Reviews</strong> — ask every happy customer for a Google review. Businesses with more reviews rank higher in local results. More than backlinks, more than content. Reviews are the primary local ranking signal after GBP completeness.</li>
                  <li><strong className="text-white">Local keywords</strong> — include your city and service area in your page titles, headings, and content: &quot;tree removal service Dillsboro IN&quot; not just &quot;tree removal.&quot;</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">National/online SEO priorities</h3>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Content and keyword strategy (this entire guide applies)</li>
                  <li>Technical site health: speed, mobile-friendliness, crawlability</li>
                  <li>Backlink building from relevant sites in your industry</li>
                  <li>Comparison and alternative pages targeting commercial intent searches</li>
                </ol>
              </section>

              <section id="ch9" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 9: When to Hire Someone vs. Do It Yourself
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The honest breakdown of what an agency does, what it costs, and when it&apos;s worth it.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  SEO agencies and consultants range from $500 to $10,000 per month and deliver
                  wildly different results. Some are legitimate. Many are not. Here&apos;s how to
                  think about whether to hire someone and what to look for if you do.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Do it yourself when</h3>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>You&apos;re pre-revenue or early stage — spend your time on product and customers, not SEO</li>
                  <li>You have the time to write consistent content (2 to 4 posts per month)</li>
                  <li>Your market isn&apos;t hyper-competitive yet and long-tail keywords are available</li>
                  <li>You&apos;re a local business that just needs GBP + reviews + a solid site</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Consider hiring when</h3>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>You have revenue and SEO is a clear growth channel you&apos;re not capitalizing on</li>
                  <li>You don&apos;t have time to do it yourself and the opportunity cost is real</li>
                  <li>You&apos;re in a competitive national market where technical SEO matters significantly</li>
                  <li>You need significant content production at scale (20+ posts per month)</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Red flags in SEO agencies</h3>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Guarantees of specific rankings (&quot;we guarantee page 1 in 30 days&quot;)</li>
                  <li>Proprietary secret methods they won&apos;t explain</li>
                  <li>Extremely low prices with aggressive promises</li>
                  <li>They can&apos;t show you case studies with real site names and verifiable results</li>
                  <li>They pitch link-building packages where they buy links from networks</li>
                </ol>

                <Callout>
                  A good SEO consultant will explain exactly what they&apos;re doing and why.
                  They&apos;ll show you the work, report on real metrics (organic traffic, keyword
                  positions, conversions — not &quot;domain authority&quot; as a vanity metric), and
                  set realistic timelines. SEO takes 3 to 6 months minimum to show results.
                  Anyone who tells you otherwise is selling something.
                </Callout>
              </section>

              <section id="epilogue" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Epilogue: The Compounding Asset
                </h2>

                <p className="mb-4 leading-relaxed text-gray-300">
                  SEO is the only marketing channel where the work you do today is still
                  paying off in five years with no additional spend. Every blog post you
                  publish, every internal link you add, every backlink you earn — it compounds.
                  It doesn&apos;t reset when you stop paying. It doesn&apos;t require a monthly budget.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The founders who figure this out early and do the work consistently end up
                  with an asset that their competitors have to pay thousands of dollars a month
                  in ads to compete with. Build it slowly. Do it right. Let it compound.
                </p>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="mb-4 text-gray-200 leading-relaxed">
                    If you&apos;re doing SEO for a product or brand, social media presence is
                    part of the signal. Content distributed across platforms drives branded
                    searches, generates social proof, and indirectly supports your rankings.
                    SocialMate handles the distribution side — schedule across 7 platforms
                    from one place, free to start.
                  </p>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400">
                    Try SocialMate free →
                  </Link>
                </div>
              </section>

              <GuideEmailCapture />
              <GuidePDFDownload title="SEO for Normal People" />

              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <Link href="/guides/reddit-marketing" className="font-bold text-white hover:text-amber-400 transition-colors">
                    Vol. 14: Reddit Marketing Without Getting Banned →
                  </Link>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <Link href="/guides/email-list-building"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111111] px-6 py-3 font-bold text-white transition-colors hover:border-amber-500/30 text-sm">
                    ← Read Vol. 12: Email List Building
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

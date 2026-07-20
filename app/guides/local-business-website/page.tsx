import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: "Local Business Websites: A Complete Guide — Gilgamesh's Guides Vol. 11",
  description:
    'How to build, price, and sell local business websites. Tech stack, what every page needs, Google Business Profile, getting your first client, and how to hand it off. Real process, no fluff.',
  keywords: [
    'local business website',
    'how to build a local business website',
    'small business website guide',
    'web design for local businesses',
    'how to get web design clients',
    'freelance web developer guide',
    'local SEO basics',
    'Google Business Profile setup',
    'small business website cost',
    'how to price a website',
  ],
  openGraph: {
    title: "Local Business Websites — Gilgamesh's Guide Vol. 11",
    description:
      "The complete no-BS playbook for building, pricing, and selling local business websites. Tech stack, SEO basics, getting clients, and the handoff.",
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface', label: 'Preface' },
  { id: 'ch1', label: '1. Who Actually Needs a Website (And Who Wastes Money)' },
  { id: 'ch2', label: '2. What Makes a Local Site Actually Work' },
  { id: 'ch3', label: '3. The Tech Stack That Won\'t Break in a Year' },
  { id: 'ch4', label: '4. What Goes on Every Page' },
  { id: 'ch5', label: '5. Contact Forms, Maps, and Getting Found on Google' },
  { id: 'ch6', label: '6. Google Business Profile — Do This Before the Website' },
  { id: 'ch7', label: '7. Getting Your First Client (Without a Portfolio)' },
  { id: 'ch8', label: '8. Pricing Your Work' },
  { id: 'ch9', label: '9. The Handoff — Clients Who Own Their Site' },
  { id: 'epilogue', label: 'Epilogue' },
]

export default function LocalBusinessWebsiteGuidePage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-void text-white">
        <header className="border-b border-[#1f1f1f] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link href="/guides" className="text-xs text-gray-600 hover:text-amber-400 transition-colors">
                ← All Guides
              </Link>
              <span className="text-gray-700">·</span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                Vol. 11
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Available Now
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl">
              Local Business Websites
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              Build It, Price It, Sell It — and Hand It Off Clean
            </p>
            <p className="mb-8 leading-relaxed text-gray-400">
              I built rjstreecare.com for a tree service client while working alongside him cutting trees during the day. No agency, no proposal deck, no $10K retainer — just a fast, clean site that actually converts. This guide is everything I learned doing it: what local businesses actually need from a website, the tech stack that won&apos;t fall apart in six months, how to price it, and how to get your first client when you don&apos;t have a portfolio yet.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-gray-600">50 min read</span>
              <span className="text-gray-700">·</span>
              <GuidePDFDownload title="Local Business Websites — Gilgamesh's Guide Vol. 11" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 py-16">
          {/* TOC */}
          <nav className="mb-16 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-8">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-amber-400">Chapters</p>
            <ol className="space-y-2">
              {CHAPTERS.map((ch) => (
                <li key={ch.id}>
                  <a href={`#${ch.id}`} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    {ch.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Preface */}
          <section id="preface" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">Preface</h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Local businesses get scammed constantly when it comes to websites. Agencies charge $5,000–$15,000 for a five-page site that takes three months to deliver, breaks the moment the client wants to change a phone number, and ranks nowhere on Google because nobody thought about SEO beyond putting the business name in the title tag.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              The business owner doesn&apos;t know any better. They paid a lot of money so they assume it&apos;s good. Meanwhile their competitor who built something on Squarespace in a weekend is getting more calls because their Google Business Profile is complete and they have 40 reviews.
            </p>
            <p className="leading-relaxed text-gray-400">
              This guide is for developers who want to build local business sites as a service — and for business owners who want to understand what they&apos;re buying. The actual requirements are simpler than the industry wants you to believe.
            </p>
          </section>

          {/* Ch1 */}
          <section id="ch1" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              1. Who Actually Needs a Website (And Who Wastes Money)
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Not every local business needs a custom-built website right now. A Google Business Profile with real photos and 20+ reviews will outperform a website for a lot of service businesses in a lot of markets. Start there. If they don&apos;t have a GBP yet, that&apos;s the first conversation — not the website.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              A website becomes essential when: the business needs to explain something complex (pricing tiers, service areas, multi-step processes), when customers research before calling (contractors, healthcare, legal), when they need to take payments or bookings online, or when they want to rank for more than just their brand name.
            </p>
            <p className="mb-4 font-semibold text-white">Who benefits most from a real website:</p>
            <ul className="mb-4 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">1.</span>Tree service, landscaping, pressure washing, pool care — anything where customers search by service + city</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">2.</span>Contractors, plumbers, electricians, HVAC — trust-heavy trades where credentials and before/afters matter</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">3.</span>Dentists, chiropractors, therapists, vets — research-intensive, booking-focused</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">4.</span>Restaurants and bakeries — menu, hours, photos, and Google Maps integration</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">5.</span>Any business in a city with real search volume for their service</li>
            </ul>
            <p className="leading-relaxed text-gray-400">
              A solo barber in a small town who survives on referrals and Instagram does not need a $3,500 website. Talk to them honestly. Clients who don&apos;t actually need what you&apos;re selling become bad clients fast.
            </p>
          </section>

          {/* Ch2 */}
          <section id="ch2" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              2. What Makes a Local Site Actually Work
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              A local business website has one job: convince someone to call, book, or walk in. Everything else is noise. The sites that perform are boring by design — clear headline, clear service list, clear contact information, real photos, and some signal of credibility (years in business, insurance, reviews).
            </p>
            <p className="mb-4 font-semibold text-white">What actually drives conversions:</p>
            <ul className="mb-6 space-y-3 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">1.</span><span><strong className="text-white">Phone number above the fold, on every page.</strong> Put it in the nav. Put it in the hero. Don&apos;t make them scroll to find it.</span></li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">2.</span><span><strong className="text-white">Real photos, not stock.</strong> Stock photos of smiling white people in hard hats destroy trust instantly. One real job site photo is worth a hundred stock images.</span></li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">3.</span><span><strong className="text-white">Specific service areas.</strong> "Serving Dillsboro, Versailles, Batesville, Milan, Sunman, and surrounding Ripley County" ranks for all of those towns. "Serving Indiana" ranks for none of them.</span></li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">4.</span><span><strong className="text-white">Social proof near the CTA.</strong> "22 years experience. Fully insured." directly above the contact form closes more leads than any design element.</span></li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">5.</span><span><strong className="text-white">Speed.</strong> A slow site loses mobile users before they read a word. Target under 3 seconds on mobile. Most local competitors are over 8.</span></li>
            </ul>
            <p className="leading-relaxed text-gray-400">
              The local business website isn&apos;t trying to win a design award. It&apos;s trying to be the most useful result when someone Googles "tree removal near me" at 7pm on a Sunday after a storm.
            </p>
          </section>

          {/* Ch3 */}
          <section id="ch3" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              3. The Tech Stack That Won&apos;t Break in a Year
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              You have two real options for local business sites: static HTML or a lightweight framework. Both work. The wrong answer is WordPress unless you plan to maintain it for them, because most local business owners won&apos;t update plugins and they&apos;ll call you when it breaks.
            </p>
            <p className="mb-4 font-semibold text-white">Static HTML (what I use for most local sites):</p>
            <ul className="mb-4 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Zero build step. Open files in any editor, push to GitHub, Vercel or Netlify deploys automatically.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Hosting is free on Vercel/Netlify for static sites. Domain is $10-15/year at Porkbun. Total recurring cost for the client: $15/year.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Loads instantly. No React hydration, no framework overhead, nothing to update.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Easy to hand off. A client who knows nothing about tech can understand "this is just a folder of files."</li>
            </ul>
            <p className="mb-4 font-semibold text-white">Next.js (when they need more):</p>
            <ul className="mb-4 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Use when they need a blog, dynamic content, a booking form with backend, or an admin panel for content updates.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Still deploys free on Vercel. More complex, but scales further.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>TypeScript + Tailwind + Supabase (if they need auth or a database) is the full stack you need for anything a local business would ever want.</li>
            </ul>
            <p className="mb-4 font-semibold text-white">For contact forms:</p>
            <ul className="mb-4 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Resend (email API) is free for low volume. Wire the contact form to send emails directly. No third-party form service needed.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Zoho Mail is free for custom email addresses (info@yourbusiness.com). Beats Gmail for credibility. Set it up for the client and give them the app — most will never need web access.</li>
            </ul>
            <p className="leading-relaxed text-gray-400">
              Avoid: WordPress (maintenance burden), Wix (locked-in, slow, hard to migrate), GoDaddy website builder (terrible SEO, overpriced). These are fine for clients who want to DIY. Not for anything you&apos;re billing $2,500+ to build.
            </p>
          </section>

          {/* Ch4 */}
          <section id="ch4" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              4. What Goes on Every Page
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Most local business sites need five pages. Sometimes fewer. Here&apos;s the exact structure that works:
            </p>
            <div className="mb-6 space-y-6">
              <div>
                <p className="mb-2 font-bold text-white">Home page</p>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Hero: business name, one-line service description, phone number, primary CTA button</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Services summary (3-6 cards, each linking to the services page)</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Social proof strip: years in business, insurance status, number of jobs completed</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Service area (specific towns, not just "Indiana")</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Gallery section (real photos)</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Contact section with form + phone + email</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-bold text-white">Services page</p>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li className="flex gap-2"><span className="text-amber-500">—</span>One section per service. Explain what it is, who needs it, and what to expect.</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>This is where keyword coverage lives. "Stump grinding Dillsboro Indiana" belongs here, not on the home page.</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-bold text-white">About page</p>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li className="flex gap-2"><span className="text-amber-500">—</span>The owner&apos;s story. How long they&apos;ve been doing it, why, what sets them apart.</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Credentials, certifications, insurance. Specifics build trust.</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-bold text-white">Gallery</p>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Before/afters where possible. Real job sites. Equipment on site.</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Alt text every image with descriptive keywords.</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-bold text-white">Contact page</p>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Phone number, email, Google Maps embed, service area list, contact form.</li>
                  <li className="flex gap-2"><span className="text-amber-500">—</span>Keep the form short: name, phone, email, message. Each extra field drops completion rate.</li>
                </ul>
              </div>
            </div>
            <p className="leading-relaxed text-gray-400">
              That&apos;s it. Don&apos;t add a blog unless the client will actually write for it. A blog with zero posts or three posts from 2023 hurts more than having no blog. Build what you can maintain.
            </p>
          </section>

          {/* Ch5 */}
          <section id="ch5" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              5. Contact Forms, Maps, and Getting Found on Google
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              The basics of local SEO are straightforward. Most local competitors ignore them entirely — which is your client&apos;s advantage.
            </p>
            <p className="mb-4 font-semibold text-white">Contact form wiring:</p>
            <ul className="mb-6 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">1.</span>Use Resend, Nodemailer, or a simple API route to email submissions to the owner. Test it with a real submission before you hand off.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">2.</span>Set Reply-To to the customer&apos;s email so the owner can reply directly from their inbox.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">3.</span>Send a confirmation email to the customer so they know the form worked.</li>
            </ul>
            <p className="mb-4 font-semibold text-white">Google Maps embed:</p>
            <ul className="mb-6 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">1.</span>Go to maps.google.com, search for the business, click Share, copy the embed code. Free, no API key needed for a basic embed.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">2.</span>Service area businesses (no storefront) can embed a map of their general area instead.</li>
            </ul>
            <p className="mb-4 font-semibold text-white">Basic SEO checklist:</p>
            <ul className="mb-4 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Every page has a unique title tag. Format: "Service + City — Business Name"</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Meta description under 160 characters on every page</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>H1 on every page that includes the primary keyword</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>NAP (Name, Address, Phone) consistent and matching GBP</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Schema markup: LocalBusiness JSON-LD in the head of every page</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Images compressed (WebP preferred, under 200KB each)</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Submit sitemap.xml to Google Search Console after launch</li>
            </ul>
            <p className="leading-relaxed text-gray-400">
              A single relevant inbound link — from the local Chamber of Commerce, a local news site, or a neighboring business — is worth more than 50 directory submissions. Focus on that once the site is live.
            </p>
          </section>

          {/* Ch6 */}
          <section id="ch6" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              6. Google Business Profile — Do This Before the Website
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              I will say this as clearly as I can: for most local service businesses, a complete Google Business Profile with real photos and 20+ genuine reviews will drive more calls than a $5,000 website with no GBP. Do the GBP first. Do it as part of the engagement. Make it non-optional.
            </p>
            <p className="mb-4 font-semibold text-white">GBP setup checklist:</p>
            <ul className="mb-6 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">1.</span>Go to business.google.com and claim or create the listing</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">2.</span>Business type matters: service area business (no storefront) vs. storefront. Select correctly — you can hide the address for service businesses.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">3.</span>Category selection is your most important SEO decision here. Be specific: "Tree service" not "Home services"</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">4.</span>Add every city in the service area. Be specific with towns, not just county.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">5.</span>Upload at least 10 real photos. Exterior, work in progress, completed jobs, equipment. Google rewards active GBPs.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">6.</span>Verify via USPS postcard (standard) or video verification (faster, newer option)</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">7.</span>Hours, website link, phone number — all must match the website exactly</li>
            </ul>
            <p className="mb-4 font-semibold text-white">After verification — the review strategy:</p>
            <p className="mb-4 leading-relaxed text-gray-400">
              20 real reviews from real customers is the threshold where the listing starts winning the local pack. The fastest path: every time they finish a job and the customer is happy, the owner texts them the GBP review link right there on-site. No email, no delay. The moment is now, the phone is in their hand.
            </p>
            <p className="leading-relaxed text-gray-400">
              Include the GBP setup as a deliverable in your contract. Clients don&apos;t always know it exists. When their site launches and their GBP is set up and their first five reviews are in, they will tell everyone they know who built their site.
            </p>
          </section>

          {/* Ch7 */}
          <section id="ch7" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              7. Getting Your First Client (Without a Portfolio)
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Everyone who&apos;s ever tried to break into web development hits the same wall: clients want a portfolio, and you can&apos;t build a portfolio without clients. Here&apos;s how to break out of it.
            </p>
            <p className="mb-4 font-semibold text-white">The demo site method:</p>
            <p className="mb-4 leading-relaxed text-gray-400">
              Pick a local business type you want to target — dentist, bakery, contractor, tree service. Build a demo site for a fictional version of that business. Make it look real. Deploy it on a live URL. Now you have a portfolio piece you can show any business in that vertical.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              When you approach a real bakery, you&apos;re not showing them a GitHub repo or a screenshot — you&apos;re showing them a live site that looks exactly like what they&apos;d get. That demo converts better than any proposal.
            </p>
            <p className="mb-4 font-semibold text-white">The existing relationship method:</p>
            <p className="mb-4 leading-relaxed text-gray-400">
              You already know local business owners. Your dentist, your barber, the restaurant you go to, the contractor who did your parents&apos; roof. Look at their current website (if they have one) and ask yourself honestly: could you build something better? You almost certainly could. Reach out. Offer to build them something better for free or cheap as your first project, in exchange for being able to use it as a portfolio piece.
            </p>
            <p className="mb-4 font-semibold text-white">What to say:</p>
            <p className="mb-4 text-gray-400 bg-[#111] border border-[#1f1f1f] rounded-xl p-6 text-sm leading-relaxed">
              "Hey [name], I noticed your website is pretty outdated — I build sites for local businesses and I&apos;d love to redesign yours. I&apos;m building out my portfolio so I&apos;m taking on a few projects at a reduced rate. Would you want to see what I can put together?"
            </p>
            <p className="leading-relaxed text-gray-400">
              Most local business owners with bad sites already know they have bad sites. You&apos;re not selling them something they don&apos;t want. You&apos;re solving a problem they think about every time a competitor gets a call they should have gotten.
            </p>
          </section>

          {/* Ch8 */}
          <section id="ch8" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              8. Pricing Your Work
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Pricing a local business website is one part cost estimation and three parts market positioning. Charge too little and clients don&apos;t trust the work. Charge too much and you lose deals you could&apos;ve won. Here&apos;s how to think about it.
            </p>
            <p className="mb-4 font-semibold text-white">Baseline pricing by vertical:</p>
            <ul className="mb-6 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Tree service, landscaping, contractors, tradespeople: $1,800–$3,500</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Restaurant, bakery, small retail: $1,500–$3,000</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Doctor, dentist, therapist, vet: $3,500–$7,000+</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">—</span>Full-service build including branding, SEO setup, GBP, email: add $500–$1,000</li>
            </ul>
            <p className="mb-4 font-semibold text-white">Recurring maintenance:</p>
            <p className="mb-4 leading-relaxed text-gray-400">
              Offer a monthly maintenance package: $50–$150/month depending on complexity. Includes hosting coordination, minor content updates (new photos, updated hours), and a quarterly performance check. This is almost pure margin once the site is live and gives you predictable income.
            </p>
            <p className="mb-4 font-semibold text-white">How to anchor the conversation:</p>
            <p className="mb-4 leading-relaxed text-gray-400">
              Never start with a number. Start with questions. How many calls/leads do you get per week? What&apos;s the average job worth? A tree service doing $2,500 average jobs only needs your site to generate 2 extra jobs per year to justify a $3,500 build. Frame it that way. You&apos;re not selling a website — you&apos;re selling an asset that generates leads for years.
            </p>
            <p className="leading-relaxed text-gray-400">
              Don&apos;t discount heavily. A client who haggles you down to $800 for a site that would take you 40 hours becomes a client who thinks they can text you at 9pm about font colors. Charge what the work is worth. The clients who respect the price are almost always the clients who respect your time.
            </p>
          </section>

          {/* Ch9 */}
          <section id="ch9" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">
              9. The Handoff — Clients Who Own Their Site
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              The goal of the handoff is a client who understands what they have, knows how to reach you if something breaks, and isn&apos;t dependent on you for things they should be able to do themselves.
            </p>
            <p className="mb-4 font-semibold text-white">What to hand off:</p>
            <ul className="mb-6 space-y-2 text-gray-400">
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">1.</span>Domain access — the registrar login or transfer to their own account. They own their domain. Full stop.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">2.</span>GitHub repo access (or a zip of the code) — they shouldn&apos;t be locked into you. If you disappear, they should be able to hire someone else without starting over.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">3.</span>Vercel/Netlify access — or walk them through reconnecting if they ever need to.</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">4.</span>Email credentials for their business email (Zoho, Google Workspace, etc.)</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">5.</span>Google Business Profile manager access — add their personal Gmail as an owner, not just a manager</li>
              <li className="flex gap-3"><span className="text-amber-500 flex-shrink-0">6.</span>Google Search Console access — so they can see impressions, clicks, and indexing status</li>
            </ul>
            <p className="mb-4 font-semibold text-white">The handoff call:</p>
            <p className="mb-4 leading-relaxed text-gray-400">
              Do a 30-minute screen share. Show them: how to add a photo to the gallery (if it&apos;s static, show them how to email you and you&apos;ll update it), how to check Google Search Console, how to respond to Google reviews, and your support contact info for anything that breaks.
            </p>
            <p className="leading-relaxed text-gray-400">
              A good handoff creates referrals. When the owner feels confident in what they have and something breaks and you fix it fast, they become your most effective sales force. Every contractor, dentist, or restaurant owner they know who has a bad site is a warm lead for you.
            </p>
          </section>

          {/* Epilogue */}
          <section id="epilogue" className="mb-16 scroll-mt-8">
            <h2 className="mb-6 text-2xl font-black text-white">Epilogue</h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              I built a tree service website while cutting trees. I was learning the business from the outside as a developer while experiencing it from the inside as labor. That combination is worth something — when you understand the actual day of a tree service owner (early start, job site to job site, answering calls while running a chainsaw), you build for them differently.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              The best local business websites aren&apos;t built by people who understand web development in the abstract. They&apos;re built by people who spent twenty minutes talking to the business owner before touching a line of code and came away knowing what their customers actually need.
            </p>
            <p className="leading-relaxed text-gray-400">
              Ask more questions. Build less. When you do build, build for one person — the customer who finds the site at 7pm on a Sunday when something went wrong and they need someone who can show up.
            </p>
          </section>

          <GuideEmailCapture />
        </div>
      </div>
    </PublicLayout>
  )
}

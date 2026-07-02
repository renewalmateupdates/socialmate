import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: 'Email List Building From Zero (Free Guide) — Gilgamesh\'s Guides',
  description:
    'How to build an email list from scratch with no budget. Lead magnets, welcome sequences, free tools, growing from 0 to 500 subscribers, and turning your list into customers.',
  keywords: [
    'how to build an email list',
    'email list building for beginners',
    'grow email list free',
    'email marketing for small business',
    'how to get email subscribers',
    'email list from zero',
    'free email marketing tools',
    'lead magnet ideas',
    'welcome email sequence',
    'email list without a website',
  ],
  openGraph: {
    title: 'Email List Building From Zero — Gilgamesh\'s Guide Vol. 12',
    description:
      'The audience you own forever. Build an email list from nothing — lead magnets, welcome sequences, free tools, and how to turn subscribers into customers.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',  label: 'Preface' },
  { id: 'ch1',     label: '1. Why Social Followers Aren\'t Yours' },
  { id: 'ch2',     label: '2. The Lead Magnet' },
  { id: 'ch3',     label: '3. Your First Welcome Sequence' },
  { id: 'ch4',     label: '4. Tools That Don\'t Cost Anything' },
  { id: 'ch5',     label: '5. Growing From 0 to 500' },
  { id: 'ch6',     label: '6. Segmentation Without Overcomplicating It' },
  { id: 'ch7',     label: '7. Turning Subscribers Into Customers' },
  { id: 'ch8',     label: '8. Staying Out of Spam' },
  { id: 'ch9',     label: '9. What Your List Tells You' },
  { id: 'epilogue', label: 'Epilogue' },
]

export default function EmailListBuildingPage() {
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
                Vol. 12
              </span>
              <span className="text-xs text-gray-600">30 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Email List Building From Zero
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The Audience You Own Forever
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
                  Preface: The Only Audience You Actually Own
                </h2>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Every platform you build on can take it away. Instagram can tank your reach
                  overnight with an algorithm update. Twitter can suspend your account. TikTok
                  can get banned in your country. Discord servers get nuked. Reddit accounts get
                  shadowbanned. The platform always owns the relationship between you and your
                  audience — except one.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Email is the only channel where you have a direct line to a real person, without
                  a platform sitting in the middle deciding whether your message gets seen. An email
                  list of 1,000 real people who asked to hear from you is worth more than 10,000
                  followers on any social platform. Not because email is glamorous — it isn't — but
                  because it converts, it compounds, and nobody can take it from you.
                </p>
                <p className="leading-relaxed text-gray-300">
                  This guide is how you build that list from zero, with no money, no existing
                  audience, and no technical background required.
                </p>
              </section>

              <section id="ch1" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 1: Why Social Followers Aren&apos;t Yours (But Email Is)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The real difference between renting an audience and owning one.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  When you post on Instagram and someone follows you, Instagram owns that
                  relationship. They decide how many of your followers see any given post.
                  Organic reach on most platforms sits between 1 and 5 percent — meaning if
                  you have 10,000 followers, roughly 100 to 500 people see what you post.
                  And that number keeps shrinking as platforms push toward paid ads.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Email is different. When someone gives you their email address, you have
                  a direct line to their inbox. Average email open rates sit between 20 and
                  40 percent — meaning if you have 1,000 subscribers, 200 to 400 people
                  actually read what you send. That is 4 to 8 times the reach of social,
                  from a smaller list.
                </p>

                <Callout>
                  The math changes everything. 1,000 email subscribers who open your emails
                  at 30% is 300 people reading your message. 10,000 Instagram followers at
                  3% organic reach is also 300 people. Same reach. But email converts at
                  3 to 5 times the rate of social because the subscriber chose to be there.
                  They raised their hand and said: yes, I want to hear from you.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  There&apos;s a second risk social followers carry: platform dependency. In 2022,
                  Instagram organic reach dropped 30% in six months for creators who didn&apos;t
                  pay to boost posts. Entire Twitter accounts with hundreds of thousands of
                  followers disappeared overnight when those accounts were suspended. TikTok
                  faced a US ban. None of these things can happen to your email list. The
                  file lives on your computer. You can export it today and send an email
                  tomorrow regardless of what any platform does.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Social media is a megaphone you borrow. An email list is a phone book you own.
                </p>
              </section>

              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: The Lead Magnet
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  What to give someone in exchange for their email address — and what doesn&apos;t work.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Nobody gives you their email address for nothing. If your signup form just says
                  &quot;subscribe to my newsletter&quot; with no reason to subscribe, conversion rates sit
                  around 1 to 2 percent of visitors. Add a compelling lead magnet — something
                  genuinely valuable in exchange for signing up — and that number jumps to
                  10 to 25 percent.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  A lead magnet is anything that solves one specific problem for your target
                  audience, instantly, for free. The key word is specific. Vague lead magnets
                  fail. Specific ones work.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What works</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">A short checklist or template.</strong> &quot;The
                    5-step checklist I use before publishing any social post&quot; or &quot;My exact
                    cold email template (copy-paste ready).&quot; Takes 30 minutes to make.
                    Converts well because it saves someone a specific amount of time.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">A guide or playbook.</strong> Exactly like
                    this one. Long-form, genuinely useful, free. Positions you as an expert
                    and creates goodwill before you ever try to sell anything.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">A resource list.</strong> &quot;The 12 free tools
                    I use to run my business.&quot; Easy to make, specific, immediately useful.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Early access or a waitlist.</strong> If you&apos;re
                    building something, the exclusivity of being first is a real incentive.
                    &quot;Join the waitlist — first 500 get the Pro plan free for 30 days.&quot;
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">A mini-course or email series.</strong>
                    &quot;7 days, 7 lessons, one email a day on how to start a business with no money.&quot;
                    High perceived value, keeps people on your list for the full sequence.
                  </li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What doesn&apos;t work</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  &quot;Subscribe for updates.&quot; Nobody wants updates. They want solutions to
                  problems. If your signup form doesn&apos;t clearly answer &quot;what do I get out of
                  this?&quot; in one sentence, it won&apos;t convert.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  A lead magnet that&apos;s too broad also fails. &quot;Everything you need to know about
                  marketing&quot; is not a lead magnet. &quot;The exact Reddit posting schedule I used
                  to get 40 users with zero ad spend&quot; is.
                </p>

                <Callout>
                  Your lead magnet should solve one problem so specifically that someone
                  reads the title and thinks &quot;that&apos;s exactly what I need right now.&quot; If
                  it solves a general problem, it serves no one. Narrow it down until it
                  feels almost too niche. That&apos;s when it starts working.
                </Callout>
              </section>

              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Your First Welcome Sequence
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The 5 emails that set the relationship and start the conversion clock.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The moment someone subscribes is the highest-intent moment you will ever
                  have with them. They just took action. They want what you have. The worst
                  thing you can do is go silent for three weeks and then show up with a pitch.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  A welcome sequence is a series of automated emails sent in the days after
                  someone joins your list. You write them once, set them to send automatically,
                  and every new subscriber gets them in order. This is where the relationship
                  either gets built or dies.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Email 1: Deliver and introduce (Day 0 — send immediately)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Send the lead magnet immediately. Then introduce yourself in 2 to 3 sentences.
                  Not your whole life story. &quot;I&apos;m Joshua. I build tools for creators and write
                  about what I learn along the way. Reply to this email if you have questions.&quot;
                  That last line matters — it signals you&apos;re a real person, not a broadcast bot.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Email 2: Your story (Day 2)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Share the tension behind why you built what you built or write what you write.
                  The specific moment things got hard and you kept going anyway. People buy
                  from people they feel connected to. This email builds that.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Email 3: Your best content (Day 4)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Send your single most useful piece of content — your best blog post, a quick
                  tip that changed how you work, a behind-the-scenes look. No ask. Just value.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Email 4: Social proof (Day 6)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  A quote from a user, a screenshot of a result, a short case study. If you
                  don&apos;t have testimonials yet, share a win of your own: &quot;I used this exact
                  method and got X result.&quot; Specificity is proof.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Email 5: The soft offer (Day 8)</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Now you can mention your product, service, or paid offer — briefly, without
                  pressure. &quot;If you want to go deeper on this, here&apos;s what I built.&quot; You&apos;ve
                  given four emails of value first. This is not a cold pitch. This is a natural
                  next step for someone who&apos;s been reading along.
                </p>

                <Callout>
                  Short emails outperform long ones at every stage of the sequence. Three
                  paragraphs, clear and direct, with one point per email. The person reading
                  is on their phone. They gave you 60 seconds of attention. Use it well.
                </Callout>
              </section>

              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: Tools That Don&apos;t Cost Anything to Start
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The free email marketing stack that handles everything until you have 1,000 subscribers.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  You do not need to pay for email marketing tools until you&apos;re making money
                  from your list. Everything you need to build a real list and send real emails
                  is available for free at the sizes that matter when you&apos;re starting out.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Email service providers (free tiers)</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Brevo (formerly Sendinblue).</strong> Free
                    for unlimited contacts with 300 emails per day. Good automation, solid
                    deliverability, no credit card to start. Best free option for most people.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Mailchimp.</strong> Free up to 500 contacts
                    and 1,000 sends per month. Has a landing page builder built in. Interface
                    is clunky but ubiquitous. Good for absolute beginners.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Kit (formerly ConvertKit).</strong> Free up
                    to 10,000 subscribers — no email sending on the free plan but you can
                    collect subscribers and set up landing pages. Upgrade when you&apos;re ready to send.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Beehiiv.</strong> Free for up to 2,500
                    subscribers. Newsletter-first design. Clean, minimal, good for creators
                    who want their emails to look like a real publication.
                  </li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Where to put your signup form</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Every email service provider gives you an embeddable form and a hosted landing
                  page. You don&apos;t need a website to start collecting emails. You can:
                </p>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Link directly to the hosted signup page from your social bio</li>
                  <li>Embed the form on your website if you have one</li>
                  <li>Use the link in every piece of content you publish</li>
                  <li>Add it to the footer of every email you send</li>
                </ol>
              </section>

              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: Growing From 0 to 500 Subscribers
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The specific tactics that move the number before you have an audience to promote to.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The first 500 subscribers are the hardest. Every person on that list required
                  you to find them, give them a reason to trust you, and ask. After 500, the
                  compounding starts — people share what you send, subscribers refer friends,
                  your content starts ranking on Google. But you have to earn the first 500.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">1. Start with your actual network</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Email or DM 20 people you actually know and respect — friends, former
                  colleagues, people whose opinion you value. Tell them what you&apos;re building
                  and that you&apos;re starting an email list. Ask directly: &quot;Can I add you?&quot; Don&apos;t
                  send a mass email. One-to-one messages convert 5 to 10 times better. Aim
                  for 20 people and get 10 to 15 subscribers from it. That&apos;s your proof of life.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">2. Put the link in your social bio, everywhere</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Twitter bio, LinkedIn about section, Instagram bio, Reddit profile. The
                  link should be your signup page. Every person who lands on any of your
                  profiles sees it.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">3. Mention it in every piece of content you make</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Every blog post, every LinkedIn post, every tweet — end with a sentence
                  pointing to the list. Not a loud pitch, just a mention: &quot;If you found this
                  useful, I send more like it to my email list. Link in bio.&quot; It compounds.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">4. Post in communities where your subscribers are</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit, Discord servers, Slack groups, Facebook groups — find where your
                  ideal subscribers are talking about the thing you write about. Spend a month
                  being genuinely helpful. Then share something you wrote — with the email
                  signup at the bottom. Don&apos;t lead with the list. Lead with value, then the
                  list is a natural next step.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">5. Cross-promote with one other person</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Find someone in a complementary space with a small email list of their own.
                  Offer to mention them in your next email if they mention you in theirs.
                  Two lists of 200 can cross-pollinate into 300 each. You don&apos;t need big
                  partners — you need aligned ones.
                </p>

                <Callout>
                  The best growth tactic for the first 500 is doing the things that don&apos;t
                  scale. Personal DMs. Individual replies to people who engage with your
                  content. Direct asks. This feels slow but creates a foundation of subscribers
                  who actually know who you are and want to hear from you. Those people will
                  share your stuff. Passive signups from a widget won&apos;t.
                </Callout>
              </section>

              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: Segmentation Without Overcomplicating It
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  When to send different emails to different people — and when not to bother.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Segmentation is dividing your list into groups so you can send more relevant
                  emails to each group. In theory, it improves open rates, conversions, and
                  keeps people from unsubscribing. In practice, most people overcomplicate it
                  before they have enough subscribers to make it matter.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here is the simple rule: don&apos;t segment until you have at least 500 subscribers
                  and you already know who&apos;s buying. Before that, you don&apos;t have enough data
                  to know what segments mean anything. Send to the whole list, watch what
                  people click, and let the data tell you where the groups are.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The three segments that almost always matter</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">New subscribers (last 30 days).</strong> These
                    people are in your welcome sequence. Don&apos;t also blast them with your regular
                    newsletter at the same time — they&apos;ll get overwhelmed and unsubscribe.
                    Wait until the sequence ends.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Engaged vs. unengaged.</strong> People who
                    haven&apos;t opened an email in 90 days are a separate group. Before you give
                    up on them, send one re-engagement email: &quot;Still want to hear from me?
                    Click here to stay on the list.&quot; Those who don&apos;t click get removed.
                    This keeps your deliverability healthy and your numbers honest.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Customers vs. non-customers.</strong> Once
                    someone buys from you, they get different emails than people who haven&apos;t.
                    You stop pitching them on the thing they already purchased. You start
                    sending value, upsells, and loyalty content instead.
                  </li>
                </ol>
              </section>

              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: Turning Subscribers Into Customers
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The gap between &quot;people read my emails&quot; and &quot;people buy from me.&quot;
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  An email list is not a business. It&apos;s a relationship. The business comes from
                  knowing when and how to make an ask. Most people make two mistakes: they
                  either never ask, so the list stays a vanity project — or they ask too soon,
                  before they&apos;ve given enough to earn the right.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The give-to-ask ratio</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  For every email where you ask for something (buy this, click here, sign up
                  for this), send 3 to 5 emails that give something. Content, insights,
                  resources, value. This ratio is not a hard rule — it&apos;s a gut check. If
                  every email ends with a pitch, people unsubscribe. If you never pitch,
                  you don&apos;t have a business.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to write a pitch email that converts</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Open with the problem, not the product.</strong>
                    &quot;If you&apos;ve been spending 2 hours a day managing social posts across five
                    platforms...&quot; Pull them into the pain before you offer the solution.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Be direct about what you&apos;re selling.</strong>
                    Don&apos;t bury the offer. Tell them what it is, what it costs, and why it&apos;s
                    worth it — in that order.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">One clear call to action.</strong> One link.
                    One button. One ask. Every additional link you add halves the conversion
                    rate of the primary one.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Create real urgency.</strong> Not fake
                    countdown timers. Real limits: &quot;This is only open to the first 50 people
                    because I personally onboard each one.&quot; If you can&apos;t create real urgency,
                    at least create a reason to act now vs. act later.
                  </li>
                </ol>

                <Callout>
                  Email converts higher than social because people read their inbox with
                  intent. They showed up to read. Compare that to a social feed scroll where
                  your post is competing with 40 other things at once. When someone opens
                  your email, you have their attention. Don&apos;t waste it.
                </Callout>
              </section>

              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: Staying Out of Spam
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The technical basics that keep your emails landing in the inbox, not the junk folder.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Deliverability is the percentage of your emails that actually reach the
                  inbox. It&apos;s the invisible variable that makes or breaks an email list.
                  You can have 1,000 subscribers and perfect content, but if 40 percent of
                  your emails land in spam, you&apos;re talking to 600 people.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The basics (do these first)</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Use a reputable email service provider.</strong>
                    Gmail and Outlook have aggressive spam filters for mass sends. Your ESP
                    (Brevo, Mailchimp, etc.) has built-in deliverability infrastructure.
                    Never mass-send from a personal Gmail.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Authenticate your domain.</strong> Set up
                    SPF, DKIM, and DMARC DNS records for your domain. These are email
                    authentication protocols that prove to spam filters that your emails
                    are legitimate. Your ESP will walk you through exactly what to add.
                    Sounds technical — takes 10 minutes.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Never buy email lists.</strong> Purchased
                    lists are full of people who never asked to hear from you. They mark
                    you as spam. Your domain gets blacklisted. Your deliverability tanks
                    permanently. It is always the wrong move.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Clean your list regularly.</strong> Remove
                    subscribers who haven&apos;t opened an email in 90 days after one re-engagement
                    attempt. Dead weight hurts your open rate metrics, which signals to spam
                    filters that your content is low-quality.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Include an unsubscribe link in every email.</strong>
                    This is legally required (CAN-SPAM, GDPR). Your ESP adds it automatically.
                    Don&apos;t remove it. People who can&apos;t unsubscribe mark you as spam instead.
                  </li>
                </ol>
              </section>

              <section id="ch9" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 9: What Your List Tells You About What to Build
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why your email list is the best market research tool you have.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most people treat email as a one-way broadcast. They send. Subscribers read.
                  End of transaction. But a list of engaged subscribers is actually the most
                  valuable feedback loop you have access to — better than surveys, better than
                  analytics, better than user interviews (though those matter too). Here&apos;s why.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The things your subscribers reply to tell you exactly what they care about.
                  The things they don&apos;t open tell you what doesn&apos;t resonate. The questions they
                  ask reveal the gaps in your content or product. Every reply is a free customer
                  development session.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The one-question email</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Once a quarter, send a single email with a single question: &quot;What&apos;s the
                  one thing you&apos;re most stuck on right now?&quot; or &quot;What&apos;s the biggest problem
                  in [your topic] that nobody talks about?&quot; Read every reply. Look for
                  patterns. The answers will tell you exactly what to build, write, or
                  offer next. This is the research your competitors are paying agencies
                  thousands of dollars to get.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What to track</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Open rate</strong> — are the right people on your list and do they care about your subject lines?</li>
                  <li><strong className="text-white">Click-through rate</strong> — are people interested enough in your content to take action?</li>
                  <li><strong className="text-white">Reply rate</strong> — the most undertracked metric. Replies mean real engagement, not passive consumption.</li>
                  <li><strong className="text-white">Unsubscribe rate</strong> — occasional unsubscribes are healthy. A spike means you sent something off-brand or too salesy.</li>
                </ol>

                <Callout>
                  Treat your email list like a conversation, not a broadcast. Ask questions.
                  Reply when people respond. Show up consistently. The list that converts
                  best is the one where subscribers feel like they know a real person, not
                  a brand. Be that person.
                </Callout>
              </section>

              <section id="epilogue" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Epilogue: Start Today, Even If It&apos;s Small
                </h2>

                <p className="mb-4 leading-relaxed text-gray-300">
                  I have made the mistake of waiting until things were &quot;ready&quot; before starting
                  my email list. Ready meant: until I had a real website, until I had something
                  better to offer, until I had more content to send. Two years into building
                  SocialMate, I wish I had started collecting emails on day one.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  You don&apos;t need a polished list. You don&apos;t need a big audience to start.
                  You need a reason for someone to give you their email, a free tool to send
                  it, and the willingness to show up regularly. The rest builds from there.
                  Start with 10 subscribers. Serve them well. Let it grow.
                </p>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="mb-4 text-gray-200 leading-relaxed">
                    SocialMate has an email newsletter system built in — IRIS Dispatch — that
                    handles the scheduling and delivery side. If you&apos;re building an audience
                    and want to pair your email strategy with a real social media presence,
                    try SocialMate free. Schedule your content across 7 platforms while your
                    email list grows in parallel.
                  </p>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400">
                    Try SocialMate free →
                  </Link>
                </div>
              </section>

              <GuideEmailCapture />
              <GuidePDFDownload title="Email List Building From Zero" />

              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <Link href="/guides/seo-for-beginners" className="font-bold text-white hover:text-amber-400 transition-colors">
                    Vol. 13: SEO for Normal People →
                  </Link>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <Link href="/guides/local-business-website"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#111111] px-6 py-3 font-bold text-white transition-colors hover:border-amber-500/30 text-sm">
                    ← Read Vol. 11: Local Business Websites
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

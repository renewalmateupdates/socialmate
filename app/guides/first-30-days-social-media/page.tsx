import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: "Your First 30 Days on Social Media (Free Guide) — Gilgamesh's Guides",
  description:
    'The creator launchpad: how to choose your starting platform, set up your profiles right, write your first 10 posts, build a consistency system, and get your first 100 followers — without running any ads.',
  keywords: [
    'first 30 days social media',
    'how to start on social media',
    'getting first 100 followers',
    'social media for beginners',
    'creator launchpad',
    'how to grow on social media',
    'social media consistency',
    'starting on social media guide',
    'first posts on social media',
    'social media tips for beginners',
  ],
  openGraph: {
    title: "Your First 30 Days on Social Media — Gilgamesh's Guide Vol. 6",
    description:
      'The no-BS creator launchpad. How to start, what to post, and how to actually stick with it. From a bootstrapped founder who built a platform for people exactly like you.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'ch1', label: '1. Why Most Creators Quit Before Day 30' },
  { id: 'ch2', label: '2. Choosing Your Starting Platform' },
  { id: 'ch3', label: '3. Setting Up Your Profiles the Right Way' },
  { id: 'ch4', label: '4. Your First 10 Posts' },
  { id: 'ch5', label: '5. The Consistency System That Actually Works' },
  { id: 'ch6', label: '6. How to Get Your First 100 Followers Without Ads' },
  { id: 'ch7', label: '7. Understanding What\'s Working (Basic Analytics)' },
  { id: 'ch8', label: '8. What Happens After Day 30' },
]

export default function First30DaysSocialMediaPage() {
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
                Vol. 6
              </span>
              <span className="text-xs text-gray-600">30 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Your First 30 Days on Social Media
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The Creator&apos;s Launchpad
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
                  Chapter 1: Why Most Creators Quit Before Day 30 (and How to Not Be One of Them)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The real reason people stop — and the mindset shift that makes the difference.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most people who start on social media quit in the first 30 days. Not because they ran out of ideas. Not because the algorithm hated them. They quit because they expected results faster than the platform delivers them, then decided the whole thing wasn&apos;t working and walked away.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s what nobody tells you when you&apos;re starting: the first 30 days aren&apos;t about getting followers. They&apos;re about building the habit of showing up and figuring out what you actually want to say. The algorithm rewards consistency over time — but most people judge the first two weeks and conclude that consistency doesn&apos;t pay. It does. It just doesn&apos;t pay immediately.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The creators who break through are almost never the most talented people in the room. They&apos;re the ones who kept posting when the numbers were embarrassing. They posted for 6 people, then 60, then 600. The path through was always the same: don&apos;t stop.
                </p>

                <Callout>
                  Your first 30 posts are practice. Your first 90 are when patterns start to emerge. Your first 365 are when real momentum builds. If you measure success at Day 12, you&apos;re measuring the wrong thing.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  There are three reasons most creators quit early. First: they picked a platform that isn&apos;t suited to their strengths. A writer forced onto TikTok will feel wrong every single time they post. Second: they had no system — every post was a fresh decision, which is exhausting. Third: they had no clear idea of who they were talking to, so nothing they wrote felt like it landed.
                </p>
                <p className="leading-relaxed text-gray-300">
                  This guide fixes all three. By the end of Day 30, you won&apos;t have gone viral — but you&apos;ll have real posts live, a system that takes the decision-making out of consistency, and enough data to know what&apos;s actually resonating. That&apos;s a better foundation than most creators ever build.
                </p>
              </section>

              {/* CHAPTER 2 */}
              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Choosing Your Starting Platform (The One-Platform Rule)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why spreading yourself across every platform is the fastest way to build nothing.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The first question every new creator asks is: &quot;Which platforms should I be on?&quot; And the instinct is to answer &quot;all of them,&quot; because it feels like being everywhere means reaching more people. It doesn&apos;t. Being everywhere when you&apos;re just starting out means being mediocre everywhere — spread thin, posting half-formed content that doesn&apos;t fit any platform&apos;s native format, and burning out before you build any real audience anywhere.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The One-Platform Rule: pick one primary platform for your first 90 days and go deep on it. Learn its culture, its format, its algorithm quirks. Build a real audience there before you expand. This is not a permanent rule — it&apos;s a starting strategy. Once you have 500 followers somewhere, you have proof of concept. You have content that worked. You can start distributing that content across other platforms without creating from scratch.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to pick your platform</h3>
                <ul className="mb-6 space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">You write well?</strong> Start on LinkedIn or Bluesky. Long-form thinking performs well on LinkedIn (especially personal brand content). Bluesky rewards authentic, conversational writing without algorithmic gatekeeping.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">You&apos;re comfortable on camera?</strong> TikTok or YouTube Shorts. These platforms reward raw, high-energy, face-to-camera content. Production value matters less than authenticity and a strong hook in the first 2 seconds.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">You have a visual brand (art, design, food, fashion)?</strong> Instagram. Still the strongest platform for image-first content and visual discovery.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 text-amber-500 shrink-0">▸</span>
                    <span><strong className="text-white">You&apos;re building in public or in a niche community?</strong> Discord or a niche subreddit first, then use that feedback to fuel your main platform content. Communities with 1,000 engaged members are more valuable than 10,000 passive followers.</span>
                  </li>
                </ul>

                <Callout>
                  Pick the platform where creating content feels natural, not the one where you think the most people are. You&apos;ll post better content when the format fits you. Better content gets more reach than platform size alone.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  Tools like SocialMate let you schedule and cross-post once you&apos;re ready to expand — it&apos;s free and handles Bluesky, Mastodon, Discord, Telegram, X/Twitter, TikTok, and LinkedIn all in one dashboard. But don&apos;t think about multi-platform yet. Master one first. Then distribute.
                </p>
              </section>

              {/* CHAPTER 3 */}
              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Setting Up Your Profiles the Right Way
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Your profile is your landing page. This is what first-time visitors decide everything from.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most creators spend their first week posting and their second week wondering why nobody&apos;s following. The answer is usually the profile. When someone new lands on your profile and decides whether to follow you, they&apos;re answering one question: &quot;Is this person relevant to me?&quot; Your profile has about 3 seconds to answer yes.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s what a strong profile has — across every platform:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Profile photo</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Use a real photo of your face if you&apos;re a personal brand creator. A clear, well-lit headshot where your face takes up at least 60% of the frame. No sunglasses. No group shots. Smiling or serious — both work, but match the energy of your content. If you&apos;re a brand (not a personal brand), a clean logo at the center of the frame, no clutter.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Username / handle</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Keep it consistent across platforms if you can. Short, easy to spell, easy to say out loud. If your name is taken, add a word that describes what you do: @joshuabuilds, @mariacooks, @alexdesigns. Don&apos;t add random numbers — they look like bot accounts and make you harder to find via word of mouth.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Bio</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Your bio needs to answer three questions in two lines or less: Who you are. Who you help or what you talk about. Why someone should follow you right now. Example: &quot;Solo founder building in public. I share what actually works (and what doesn&apos;t) when you&apos;re building a SaaS from your living room.&quot; That&apos;s specific, self-aware, and gives a clear reason to follow.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Link</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Put your most valuable link here — your website, a landing page, a freebie, or your Link in Bio page (SocialMate&apos;s SIGIL feature gives you a free link-in-bio page on every plan). Make sure the destination matches the expectation your bio creates. If your bio says you share business tips, don&apos;t link to a personal photography page.
                </p>

                <Callout>
                  Set up your profile before you post a single piece of content. Every post you publish drives people to your profile. If your profile isn&apos;t ready to convert those visitors into followers, you&apos;re leaking audience from day one.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  Once your profile is set up, take a screenshot and compare it to two or three creators you admire in your niche. What&apos;s immediately clear about them that isn&apos;t clear about you yet? That gap is your next edit.
                </p>
              </section>

              {/* CHAPTER 4 */}
              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: Your First 10 Posts (What to Say When You Have Nothing to Say)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  A concrete starting framework so you&apos;re never staring at a blank screen.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The blank screen is the enemy of every new creator. You know you should post, you sit down to write something, and suddenly you have no idea what to say. Everything feels too basic, too niche, too personal, or not good enough. So you close the tab and tell yourself you&apos;ll post tomorrow.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s the fix: decide your first 10 posts before you start, so there&apos;s no decision to make when you sit down. Use this framework:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The First 10 Framework</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-4 text-gray-300">
                  <li className="leading-relaxed"><strong className="text-white">Your origin post.</strong> Who you are, what you&apos;re building or doing, and why. Keep it real. People connect to honesty about where you&apos;re starting from, not where you&apos;re hoping to end up.</li>
                  <li className="leading-relaxed"><strong className="text-white">A lesson you learned the hard way.</strong> Something you wish someone had told you when you started in your field. The harder the lesson, the more it resonates.</li>
                  <li className="leading-relaxed"><strong className="text-white">A contrarian take.</strong> Something you believe that most people in your space get wrong. Takes generate discussion, and discussion drives reach.</li>
                  <li className="leading-relaxed"><strong className="text-white">A process post.</strong> How you do something — step by step. People love behind-the-scenes content. Show the work, not just the result.</li>
                  <li className="leading-relaxed"><strong className="text-white">A recommendation.</strong> A tool, a book, a resource, a person. Recommend something you genuinely use. Generosity builds goodwill fast.</li>
                  <li className="leading-relaxed"><strong className="text-white">A failure post.</strong> Something that didn&apos;t work and what you learned. These consistently outperform success posts because they&apos;re rare and vulnerable.</li>
                  <li className="leading-relaxed"><strong className="text-white">A question to your audience.</strong> Ask them something real. Their answers tell you what to post next — and replies boost your algorithmic reach on most platforms.</li>
                  <li className="leading-relaxed"><strong className="text-white">A myth-busting post.</strong> Something your industry says that you disagree with. Structured as: &quot;Everyone says X. Here&apos;s why I think they&apos;re wrong.&quot;</li>
                  <li className="leading-relaxed"><strong className="text-white">A personal win (any size).</strong> Something you accomplished that felt meaningful. Don&apos;t wait for a big win. Share the small ones. Momentum is built in increments.</li>
                  <li className="leading-relaxed"><strong className="text-white">A value post with zero selling.</strong> Pure information. A list of five things. A quick how-to. Something someone can screenshot and use immediately.</li>
                </ol>

                <Callout>
                  Write all 10 posts before you publish the first one. Then schedule them out over your first two weeks. You&apos;ll post with more confidence knowing the next 9 are ready. Use SocialMate to schedule them so you&apos;re never scrambling for what&apos;s next.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  None of these posts need to be perfect. They need to be real, specific, and posted. A mediocre post that goes live always beats a perfect post that stays in your drafts.
                </p>
              </section>

              {/* CHAPTER 5 */}
              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: The Consistency System That Actually Works
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to post regularly without burning out or running out of ideas.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  &quot;Post consistently&quot; is advice everyone gives and almost nobody follows, because it treats consistency like a willpower problem. It&apos;s not. It&apos;s a systems problem. If creating content requires a fresh decision every single time — what do I say today, when do I post it, how do I format it — you will eventually run out of energy for those decisions and stop. The fix is to remove as many of those decisions as possible.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s the system I use and recommend:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Pick your posting frequency and stick to it — even if it feels slow</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  For most platforms, 3-5 times per week is the sweet spot for building momentum without burning out. Twice a week is fine if that&apos;s what you can sustain. Daily is powerful but hard to maintain long-term without a system. The worst thing you can do is post 15 times in week one and then go dark for two weeks. Irregular activity tanks your algorithmic reach and trains your audience not to expect you.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Batch create, don&apos;t daily create</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Set aside one dedicated block of time per week — 1-2 hours — to write all your posts for the next 7 days. Create 5-7 posts at once while you&apos;re in the creative headspace. Then schedule them all out. This way, every day isn&apos;t a content creation day. It&apos;s a distribution day.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Use scheduling tools</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I built SocialMate specifically for this reason. Write your posts once, schedule them for the optimal times, and let the tool do the rest. The free plan handles Bluesky, Mastodon, Discord, and Telegram. Pro ($5/month) adds X/Twitter, TikTok, and LinkedIn. Scheduling removes the daily friction of &quot;did I post today?&quot; and &quot;when should I post?&quot; — both of which eat creative energy that should go toward making better content.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Keep an idea bank</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Open a note in your phone — just a plain text note — titled &quot;Content Ideas.&quot; Every time you have a thought, observe something interesting, read something that makes you react, or get a question from someone — dump it in there. You don&apos;t have to write the post. Just capture the seed. After two weeks, you&apos;ll have 30-40 ideas. You&apos;ll never face a blank screen again.
                </p>

                <Callout>
                  Consistency isn&apos;t a character trait. It&apos;s a system. Build the system, then trust the system. The creators who show up every week aren&apos;t more disciplined than you — they&apos;ve just removed the decisions that stop most people.
                </Callout>
              </section>

              {/* CHAPTER 6 */}
              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: How to Get Your First 100 Followers Without Ads
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The unglamorous, organic playbook that actually works when you&apos;re starting from zero.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  100 followers is the first milestone that matters. Not because 100 followers is a big audience — it isn&apos;t. But because getting your first 100 real followers proves the concept. It means real people found your content, decided it was worth following, and opted in. That proof changes how you create. You stop writing into the void and start writing for an actual community.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s what actually moves the number without spending a dollar:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Engage before you broadcast</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  For the first two weeks, spend 15-20 minutes per day leaving substantive comments on posts from creators in your niche. Not &quot;great post!&quot; — that&apos;s invisible. Write comments that add something: a counterpoint, a related story, a question that deepens the conversation. People read comment sections. They click on the names of commenters who say something interesting. That&apos;s free discovery.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Tell your existing network</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Post a &quot;I&apos;m starting&quot; message in your personal texts, your personal Instagram Stories, whatever you already use. Tell 20-30 people what you&apos;re building and ask them to follow if they&apos;re interested. You probably have 30-40 people who will support you if you ask directly. Most people never ask. Don&apos;t be most people.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Appear in communities, not just on your feed</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Find two or three active communities in your niche: subreddits, Discord servers, Facebook groups, newsletters with comment sections. Participate authentically — answer questions, share real experience, be genuinely useful. Drop your profile link when it&apos;s natural and relevant. Community discovery is one of the most underrated growth channels for new creators because most people skip it entirely.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Collaborate with other small creators</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Find other creators in your niche who are at a similar follower count. Do a reply thread together, co-write a post, shout each other out. Audience overlap at the small level is powerful — two creators with 200 followers cross-promoting is a 100% discovery opportunity for both of them. Don&apos;t wait until you&apos;re big to collaborate. Collaborate on the way up.
                </p>

                <Callout>
                  The first 100 followers are the hardest to get because you&apos;re working with zero momentum. Every follower you earn requires effort right now. That&apos;s fine. It builds character, it builds your content chops, and it means the followers you get actually chose you — not an algorithm.
                </Callout>
              </section>

              {/* CHAPTER 7 */}
              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: Understanding What&apos;s Working (Basic Analytics Without Overwhelm)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  You don&apos;t need to become a data scientist. You need to watch three numbers.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most new creators either ignore analytics entirely or spend too much time in them, obsessing over every post&apos;s performance and losing the thread of why they&apos;re creating in the first place. The right approach is somewhere in the middle: check analytics weekly, look at a small number of signals, and use what you see to inform the next week.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  After 30 days, here are the only three things you actually need to measure:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">1. Engagement rate</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Likes, comments, reposts, saves — divided by impressions or follower count. This tells you what percentage of people who saw your post did something with it. A post with 100 views and 15 interactions is outperforming a post with 1,000 views and 5 interactions. Look for the type of content that gets the highest engagement rate, not just the highest raw numbers.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">2. Follower growth rate</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Are you gaining followers week over week? Even if slowly? A positive trend matters more than the absolute number. What you&apos;re looking for: which posts drove the most follows? Those posts reveal your highest-converting content style. Do more of that.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">3. Your own posting streak</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This one isn&apos;t in the platform analytics, but it&apos;s the most important metric for the first 30 days. Did you post consistently? That number — days posted divided by days in the period — is the most predictive metric for long-term success. SocialMate has a streak tracker on your dashboard so you can watch this in real time.
                </p>

                <Callout>
                  Don&apos;t check analytics daily in your first month. It&apos;s too noisy. Check once a week, on the same day. Write down what performed best and why. Three patterns will become clear by Day 30. Trust those patterns — they&apos;re your audience telling you who they are and what they want.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  Analytics are a feedback loop, not a report card. You&apos;re not being graded. You&apos;re gathering data so you can make better content next week than you made last week. That&apos;s all this is.
                </p>
              </section>

              {/* CHAPTER 8 */}
              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: What Happens After Day 30 (The Real Game Begins Here)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The transition from starting to building — and why the work you did in the first month matters more than you realize.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  By Day 30, something has shifted that you might not fully see yet. You&apos;ve shipped more content than most aspiring creators do in six months. You&apos;ve figured out what feels natural to create and what doesn&apos;t. You have data — even if it&apos;s just 30 posts worth — that shows you what your audience responds to. You have a system. You have a habit.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The work from Day 30 through Day 90 is to double down on what worked and let go of what didn&apos;t. Take the two or three content types that got the most engagement and make them your pillars. Create more of those. Stop creating the things that got nothing — even if you enjoyed making them. At some point, you have to create for your audience, not just for yourself. That&apos;s the transition from hobby to audience-building.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Day 30 is also when it makes sense to start thinking about expanding to a second platform. Not starting over — repurposing. Take your best posts from your primary platform and adapt them for one more. A LinkedIn post becomes five Bluesky threads. A TikTok becomes a YouTube Short. The content is done. Now you&apos;re distributing it. SocialMate makes this seamless — write once, schedule across all your connected platforms in one place.
                </p>

                <Callout>
                  Day 30 is where most people stop. Day 31 is where you separate from them. The game doesn&apos;t end at a month — that&apos;s when the real compound interest on your consistency starts to accrue. Keep going.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  A few questions to answer honestly after your first 30 days: What did I post that I&apos;m genuinely proud of? Who showed up consistently in my replies and comments — who is my early community? What do I know now that I didn&apos;t know on Day 1? What would I tell someone who was at Day 0 right now?
                </p>
                <p className="leading-relaxed text-gray-300">
                  Write down those answers. They&apos;re the seeds of your next month&apos;s content. They&apos;re proof that you&apos;ve learned something. And they&apos;re evidence that the version of you that finishes Day 30 is different from the one who started Day 1. That difference compounds every 30 days you keep going. Don&apos;t stop now.
                </p>
              </section>

              {/* Joshua's Note */}
              <section className="mb-16 scroll-mt-8">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                    A Note from Joshua
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    I built SocialMate because I needed it. When I was figuring out social media for my own business, I couldn&apos;t afford the scheduling tools the big creators use. The free versions were crippled. So I built a better version and made it free for people like me.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    If you&apos;re reading this guide, you&apos;re exactly who SocialMate was built for: someone building something from nothing, trying to figure out how to show up consistently without burning out or spending money they don&apos;t have.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    Tag me in your first post. I&apos;m <strong className="text-amber-400">@socialmatehq</strong> everywhere. I read every mention. I&apos;ll be there.
                  </p>
                  <p className="leading-relaxed text-gray-300">
                    Now go post something.
                  </p>
                  <p className="mt-6 text-right text-sm text-amber-400 font-semibold">
                    — Joshua Bostic<br />
                    <span className="text-gray-600 font-normal">Founder, SocialMate</span>
                  </p>
                </div>
              </section>

              <GuideEmailCapture />
              <GuidePDFDownload title="Your First 30 Days on Social Media" />

              {/* Bottom navigation */}
              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <p className="font-bold text-white">Vol. 7: Build Your Brand from Zero</p>
                  <Link href="/guides/build-your-brand-from-zero" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">Read now →</Link>
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

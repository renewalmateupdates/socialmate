import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: 'Reddit Marketing Without Getting Banned (Free Guide) — Gilgamesh\'s Guides',
  description:
    'How to use Reddit to grow your business, find users, and build community without getting shadowbanned or roasted. The real playbook from someone who actually does it.',
  keywords: [
    'reddit marketing guide',
    'how to market on reddit',
    'reddit for business',
    'reddit without getting banned',
    'how to post on reddit as a founder',
    'reddit promotion strategy',
    'how to get karma on reddit',
    'reddit community marketing',
    'reddit organic growth',
    'saas founder reddit marketing',
  ],
  openGraph: {
    title: 'Reddit Marketing Without Getting Banned — Gilgamesh\'s Guide Vol. 14',
    description:
      'The real Reddit marketing playbook: building karma, finding the right subreddits, posting without getting flagged, and writing posts that don\'t sound like AI wrote them.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'preface',  label: 'Preface' },
  { id: 'ch1',     label: '1. Why Reddit Is Different' },
  { id: 'ch2',     label: '2. Building Karma Without Being Fake' },
  { id: 'ch3',     label: '3. Finding the Right Subreddits' },
  { id: 'ch4',     label: '4. The Give-Before-You-Take Rule' },
  { id: 'ch5',     label: '5. How to Post Without Getting Flagged' },
  { id: 'ch6',     label: '6. Writing Posts That Don\'t Sound Like AI' },
  { id: 'ch7',     label: '7. When and How to Mention Your Product' },
  { id: 'ch8',     label: '8. Handling Bad Comments and Trolls' },
  { id: 'ch9',     label: '9. Building a Long-Term Reddit Presence' },
  { id: 'epilogue', label: 'Epilogue' },
]

export default function RedditMarketingPage() {
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
                Vol. 14
              </span>
              <span className="text-xs text-gray-600">30 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Reddit Marketing Without Getting Banned
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The Platform That Hates Spam and Rewards Real People
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
                  Preface: The Platform That Rewards Real Over Polished
                </h2>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I&apos;ve been using Reddit to grow SocialMate since day one. I&apos;ve gotten new users
                  from it. I&apos;ve gotten cofounder leads from it. I&apos;ve gotten feedback that changed
                  how I built the product. I&apos;ve also had posts taken down, got called out for
                  sounding like AI, and had a main account suspended and had to start over.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  This guide is everything I learned. Not theory. Not a marketing textbook.
                  What actually works on a platform that is aggressively hostile to self-promotion
                  and genuinely rewards the people who show up as real human beings.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Reddit is the highest-quality free marketing channel available to bootstrapped
                  founders — if you do it right. If you do it wrong, you&apos;ll get roasted,
                  banned, and accomplish nothing. This guide is the difference.
                </p>
              </section>

              <section id="ch1" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 1: Why Reddit Is Different From Every Other Platform
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  What makes Reddit&apos;s culture unique — and why that works in your favor if you understand it.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  On Instagram, people expect brands to promote themselves. On LinkedIn, it&apos;s
                  acceptable to talk about your business constantly. On Reddit, both of those
                  things will get you immediately dismissed or downvoted into oblivion. Reddit
                  has an anti-spam immune system unlike any other platform.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit users are anonymous, they&apos;re self-moderating, and they have a deeply
                  held cultural belief that communities should serve members, not marketers.
                  They vote posts up or down collectively, and when something reads as
                  promotional, it gets buried. When it reads as genuinely useful, it rises.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Why this works in your favor</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The same mechanism that makes Reddit hostile to bad marketing makes it
                  incredibly powerful for good marketing. When a Reddit thread recommends
                  your product — especially when it&apos;s organic, not from you — it carries more
                  weight than a Google ad, a press mention, or a tweet from a big account.
                  Reddit is where people go to ask &quot;what tool should I actually use?&quot; and
                  get real answers from real people who have used it.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit also has exceptional SEO: Reddit threads often rank on the first page
                  of Google for product comparison searches. Being present and mentioned
                  positively in those threads has direct, lasting SEO value for your brand.
                </p>

                <Callout>
                  Reddit rewards the same thing real communities reward: showing up
                  consistently, helping people, being honest about who you are and what you
                  built, and not treating every interaction as a sales opportunity. The
                  founders who win on Reddit are the ones who would be the same person whether
                  or not they had a product to sell.
                </Callout>
              </section>

              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Building Karma Without Being Fake
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to establish a legitimate account before you ever post about your product.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit karma is a score that reflects how much your posts and comments have
                  been upvoted. New accounts with low karma get filtered out automatically
                  in many subreddits. Some subreddits require a minimum karma threshold before
                  you can post at all. A new account that jumps straight to promoting something
                  looks exactly like a spam account — because that&apos;s exactly what most spam
                  accounts do.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Build karma first. This is not manipulation — it&apos;s demonstrating that you&apos;re
                  a real person who participates in real communities.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to build karma legitimately</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Comment on popular posts in your niche.</strong>
                    Find posts with high engagement in subreddits relevant to what you build.
                    Add a thoughtful comment — not &quot;great post!&quot; but something that adds to
                    the conversation. A sentence or two with a real perspective. Do this 10 times
                    across different subreddits in your first week.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Answer questions directly.</strong> &quot;Has anyone
                    found a good tool for X?&quot; — if you know the answer to something that doesn&apos;t
                    involve your product, answer it. Genuinely and specifically. Karma from
                    helpful comments in r/entrepreneur, r/SaaS, r/startups accumulates fast.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Post in general community subreddits first.</strong>
                    r/mildlyinteresting, r/todayilearned, r/AskReddit — posting casually in
                    low-stakes communities before you go into niche business subreddits shows
                    that you&apos;re a real person with real interests, not a bot.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Wait one month before any product mention.</strong>
                    Build a foundation first. 30 days of genuine participation creates an account
                    that reads as human. Jump in on day 3 and Reddit&apos;s spam filters will flag you.
                  </li>
                </ol>
              </section>

              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Finding the Right Subreddits
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Where your potential customers already are — and how to read each community before you post.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  There are two types of subreddits you care about:
                </p>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Where your customers are.</strong> The communities
                    your ideal users actually participate in. For a social media scheduling tool:
                    r/socialmedia, r/marketing, r/content_marketing, r/smallbusiness. For a
                    tree service: r/homeowners, r/lawncare, r/mildlyinfuriating (when a tree
                    falls). You&apos;re looking for their problems, questions, and language.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Where builders and founders are.</strong>
                    r/entrepreneur, r/SaaS, r/startups, r/micro_saas, r/saasbuild,
                    r/buildinpublic, r/cofounderhunt, r/indiehackers. These communities are
                    interested in your journey, not just your product. Build-in-public posts
                    perform well here regardless of where you are in the business.
                  </li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to read a subreddit before posting</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Before posting in any subreddit:
                </p>
                <ol className="mb-4 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Read the rules in the sidebar — every subreddit has them and violations get posts removed</li>
                  <li>Scroll through the top posts of the past month — this shows what content that community actually responds to</li>
                  <li>Look at what flairs exist — using the wrong flair or no flair often gets posts removed without notice</li>
                  <li>Check if product promotion is explicitly allowed or banned — some subreddits allow it with disclosure, others ban it entirely</li>
                  <li>Read the comments on popular posts to understand the tone — each subreddit has its own culture</li>
                </ol>
              </section>

              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: The Give-Before-You-Take Rule
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why your first month on Reddit should involve zero promotion of anything.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The ratio that works on Reddit: for every post or comment where you mention
                  your product, make 10 posts or comments that have nothing to do with it.
                  This isn&apos;t a made-up ratio. It comes from Reddit&apos;s own guidelines on spam,
                  which define promotional behavior partly by this kind of ratio.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  More importantly, it reflects how trust works. People in niche communities
                  recognize each other over time. When someone you&apos;ve seen around the community
                  — who has been helpful, made good comments, shared useful things — mentions
                  a product they built, the community hears it differently than when a brand
                  new account shows up to promote something.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What giving looks like in practice</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Answer questions with specificity.</strong>
                    When someone asks &quot;what&apos;s the best way to build business credit?&quot; don&apos;t
                    link your guide. Write out the actual answer in your comment. If the guide
                    goes deeper, mention it after — &quot;I wrote more on this here if it&apos;s helpful.&quot;
                    The value comes first.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Share things you learned that week.</strong>
                    &quot;I just figured out that X happens when you do Y — in case anyone else
                    runs into this.&quot; Useful, timely, human. No product pitch needed.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Validate other people&apos;s experiences.</strong>
                    If someone posts about a struggle you&apos;ve had too, say so. Not to pivot to
                    your product. Just because shared experience builds community and community
                    is what makes Reddit work.
                  </li>
                </ol>

                <Callout>
                  The founders who get called out for self-promotion on Reddit are almost
                  always the ones who skipped the giving phase. The ones who thrive are
                  the ones who genuinely care about the communities they&apos;re in — and the
                  promotion, when it comes, feels natural because it comes from someone
                  the community already knows.
                </Callout>
              </section>

              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: How to Post Without Getting Flagged
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The technical and cultural rules that keep your posts visible.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Getting a post removed or account shadowbanned on Reddit is frustrating but
                  avoidable if you understand how the filters work. Here&apos;s what triggers removal:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Technical triggers</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Posting the same link to multiple subreddits in the same day — Reddit&apos;s spam filter flags this as coordinated promotion</li>
                  <li>Account too new with too low karma trying to post in karma-gated subreddits</li>
                  <li>Using a URL shortener instead of a direct link — many subreddits block these</li>
                  <li>Posting the exact same text in multiple places — duplicate content detection</li>
                  <li>Missing required flairs — the post goes live for you but automod quietly removes it</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Cultural triggers</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Posting only about your product with no other activity on the account</li>
                  <li>Starting a post with a pitch instead of a perspective or question</li>
                  <li>Not disclosing that you&apos;re affiliated with what you&apos;re recommending</li>
                  <li>Responding to comments about your post only to deflect criticism or push the product harder</li>
                  <li>Writing in obviously AI-generated formal English in communities that value informal tone</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Check if you&apos;ve been shadowbanned</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  A shadowban means your posts appear live to you but invisible to everyone
                  else. To check: open a private/incognito browser window and go to your
                  Reddit profile. If your posts don&apos;t show up, you&apos;re shadowbanned. You can
                  appeal to Reddit admin via a support ticket, or start fresh with a new account
                  and avoid what triggered it.
                </p>
              </section>

              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: Writing Posts That Don&apos;t Sound Like AI
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  Why Reddit users are the best AI detectors in the world — and how to write past them.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit users are acutely sensitive to AI-written content. They&apos;ve developed
                  a pattern recognition that catches it fast — and when they call it out, the
                  post is usually dead. I&apos;ve had this happen to me. It&apos;s not fun. Here is
                  exactly what triggers the response and how to write past it.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What AI writing sounds like on Reddit</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Em dashes used like punctuation — everywhere, all the time</li>
                  <li>Perfect parallel structure in every list (&quot;First, X. Second, Y. Third, Z.&quot;)</li>
                  <li>Phrases like &quot;in today&apos;s fast-paced world&quot; or &quot;here&apos;s my honest take&quot;</li>
                  <li>No typos, no informal language, no contractions, no personality</li>
                  <li>Round numbers only: exactly 10 users, exactly 5 features, exactly 3 months</li>
                  <li>Every paragraph starts with a transition word: &quot;However,&quot; &quot;Additionally,&quot; &quot;Furthermore&quot;</li>
                  <li>The post sounds like a well-structured essay, not a person talking</li>
                </ol>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What human writing sounds like on Reddit</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Specific odd numbers: 47 users, 13 days, built in 6 hours at 2am</li>
                  <li>Short sentences. Mixed with longer ones that explain something. Variety.</li>
                  <li>Real-world anchors: where you were when you figured something out, what you were doing when something broke</li>
                  <li>Self-corrections and qualifications: &quot;I think&quot; not &quot;clearly&quot;</li>
                  <li>A question at the end that you actually want answered, not a rhetorical close</li>
                  <li>One thing that&apos;s slightly embarrassing or weird about the situation — this is the honesty signal</li>
                </ol>

                <Callout>
                  The test for whether a Reddit post sounds human: would you be comfortable
                  saying this to someone&apos;s face in a conversation? If the answer is no —
                  if it sounds too formal, too structured, too polished — rewrite it in the
                  voice you actually speak. Reddit is the internet&apos;s most aggressive
                  authenticity filter. Feed it authenticity.
                </Callout>
              </section>

              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: When and How to Mention Your Product
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The timing, framing, and disclosure approach that gets results without backlash.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  After you&apos;ve built some karma and established yourself as a real participant
                  in a community, you can start mentioning what you build. Here&apos;s the framework
                  that works.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Always disclose upfront</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Say immediately that you built the thing you&apos;re mentioning. Not buried at the
                  bottom — in the first paragraph. &quot;I built this.&quot; Reddit&apos;s culture doesn&apos;t hate
                  founders promoting their work; it hates people pretending to be neutral while
                  promoting their work. The disclosure flips the response entirely.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The build-in-public framing</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Instead of &quot;check out my product,&quot; frame it as &quot;here&apos;s what I built and what
                  I learned building it.&quot; Share a specific challenge you hit, a decision you
                  made, a metric that surprised you. The product is part of the story, not the
                  entire point. This works in r/buildinpublic, r/SaaS, r/entrepreneur,
                  r/micro_saas — anywhere founders gather.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The answer-first approach in niche subreddits</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When someone asks a question your product solves, answer the question
                  completely in the comment — then mention your product as an option in the
                  last line. &quot;You can do this manually by doing X, Y, Z — or if you want a
                  tool that handles it automatically, I built one for exactly this.&quot;
                  The answer first approach shows you&apos;re there to help, not just to sell.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Subreddits where product launches are explicitly welcome</h3>
                <ol className="mb-4 list-decimal pl-6 space-y-1 text-gray-300">
                  <li>r/SideProject — sharing what you built, requesting feedback</li>
                  <li>r/sideprojects — same</li>
                  <li>r/alphaandbetausers — users actively looking for products to test</li>
                  <li>r/IMadeThis — pure showcase, no pitch required</li>
                  <li>r/SaaS — founders sharing SaaS products, especially early stage</li>
                </ol>
              </section>

              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: Handling Bad Comments and Trolls
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to respond to criticism, negative feedback, and the people who just want to watch you fail.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  If you&apos;re posting on Reddit about something you built, someone will eventually
                  say something negative. This is not personal. Reddit is a public forum and
                  some of its users have strong opinions, low tolerance for anything that looks
                  like marketing, and plenty of time to express this. How you respond matters
                  more than what they said.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Types of negative responses and how to handle them</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Legitimate criticism of your product or approach.</strong>
                    Engage with it. Thank them, acknowledge the point, explain your thinking, or
                    admit they&apos;re right. This response gains respect from everyone else reading.
                    The comment thread becomes proof that you&apos;re someone who can take feedback —
                    which is the most important thing for a founder to be known for.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Accusations of AI writing.</strong> I&apos;ve dealt
                    with this. The response that works: acknowledge it briefly, then just talk
                    like a person in the reply. &quot;Fair, I can see why it reads that way. I wrote
                    it — here&apos;s what I was actually trying to say.&quot; Don&apos;t get defensive.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Pure negativity with no substance.</strong>
                    Don&apos;t engage. Seriously. You will not change their mind. Everyone else
                    reading can tell the difference between a troll and valid criticism. Engaging
                    a troll just keeps the negative thread alive. Move on.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Someone else recommending a competitor.</strong>
                    Don&apos;t counter-pitch in the same thread. You can engage with &quot;I actually
                    built something in this space too if you want to compare&quot; but don&apos;t argue
                    about features in public. It looks desperate.
                  </li>
                </ol>
              </section>

              <section id="ch9" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 9: Building a Long-Term Reddit Presence
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  What Reddit looks like as a channel 6 months and 2 years in.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit compounds the same way any community relationship does. The longer you
                  participate genuinely, the more your name means something in the communities
                  you&apos;re in. People start to remember you. When you post, it gets more initial
                  upvotes because people recognize the name. When you mention your product,
                  people have context for who you are.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The content types that perform long-term</h3>
                <ol className="mb-6 list-decimal pl-6 space-y-3 text-gray-300">
                  <li className="leading-relaxed">
                    <strong className="text-white">Milestone posts.</strong> &quot;6 months, solo,
                    bootstrapped, here&apos;s exactly what I built and what happened.&quot; Real numbers,
                    real honesty, real lessons. These get saved and reshared for months.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Lessons from failure.</strong> What didn&apos;t work
                    and why. Reddit responds to vulnerability more than success — not because
                    people want to see you fail, but because honest failure analysis is rarer
                    and more useful than success posts.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Ask-for-advice posts.</strong> &quot;I&apos;m building X
                    for Y users and stuck on Z — anyone been through this?&quot; These drive comments,
                    comments drive visibility, and the advice itself is genuinely valuable.
                    You also get to see who in the community knows things you don&apos;t.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-white">Resource posts with no pitch.</strong>
                    &quot;I compiled the 8 free tools I use to run a SaaS solo. No affiliate links.&quot;
                    These get saved, linked to from other posts, and bring traffic for months
                    after the initial post.
                  </li>
                </ol>

                <Callout>
                  The best thing Reddit has given me isn&apos;t traffic or users — it&apos;s feedback
                  I couldn&apos;t have gotten any other way. When someone in r/micro_saas tells you
                  your product has a problem, they&apos;re doing you a favor. When someone in
                  r/AskMarketing tells you your post reads like AI, they&apos;re teaching you
                  something about how you&apos;re coming across. The platform that&apos;s most hostile
                  to bad marketing is also the most honest mirror for what your marketing
                  actually looks like. Use it that way.
                </Callout>
              </section>

              <section id="epilogue" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Epilogue: The Long Game on the Honest Platform
                </h2>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Reddit is not a quick-win channel. You can&apos;t buy your way in, post your
                  way in, or template your way in. The only path is being a real person in
                  real communities over real time.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  That is exactly why it&apos;s worth it. The channels that take the most effort
                  to do right have the least competition from people who want the shortcut.
                  Show up. Be real. Build things worth sharing. Reddit will eventually send
                  you users, collaborators, feedback, and occasionally a thread that changes
                  how you think about what you&apos;re building.
                </p>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <p className="mb-4 text-gray-200 leading-relaxed">
                    When you&apos;re ready to schedule all the content you&apos;re creating across Reddit,
                    LinkedIn, Bluesky, and 4 other platforms — SocialMate handles that. Free
                    to start, batch your posts, and stay consistent even when you&apos;re deep in
                    a build sprint and don&apos;t have time to manually post every day.
                  </p>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400">
                    Try SocialMate free →
                  </Link>
                </div>
              </section>

              <GuideEmailCapture />
              <GuidePDFDownload title="Reddit Marketing Without Getting Banned" />

              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Previous guide</p>
                  <Link href="/guides/seo-for-beginners" className="font-bold text-white hover:text-amber-400 transition-colors">
                    ← Vol. 13: SEO for Normal People
                  </Link>
                </div>
                <Link href="/guides" className="text-sm text-gray-600 hover:text-amber-400 transition-colors text-center">
                  ← Back to All Guides
                </Link>
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

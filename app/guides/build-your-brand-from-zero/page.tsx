import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import GuideEmailCapture from '@/components/GuideEmailCapture'
import GuidePDFDownload from '@/components/GuidePDFDownload'

export const metadata: Metadata = {
  title: "Build Your Brand from Zero (Free Guide) — Gilgamesh's Guides",
  description:
    'The no-budget personal brand playbook: finding your niche without pigeonholing yourself, telling your story, building a visual identity for free, developing your voice, and turning your brand into real opportunity.',
  keywords: [
    'build personal brand',
    'personal brand from zero',
    'no budget personal brand',
    'how to build a personal brand',
    'personal branding for creators',
    'find your niche',
    'building a brand online',
    'personal brand strategy',
    'how to brand yourself online',
    'creator branding guide',
  ],
  openGraph: {
    title: "Build Your Brand from Zero — Gilgamesh's Guide Vol. 7",
    description:
      'The no-BS personal brand playbook from a bootstrapped solo founder. Find your niche, tell your story, and build something people remember — with zero budget.',
    type: 'article',
  },
}

const CHAPTERS = [
  { id: 'ch1', label: '1. What a Personal Brand Actually Is' },
  { id: 'ch2', label: '2. Finding Your Niche Without Pigeonholing Yourself' },
  { id: 'ch3', label: '3. Your Story Is Your Brand' },
  { id: 'ch4', label: '4. The Visual Identity You Can Build for Free' },
  { id: 'ch5', label: '5. Your Voice: How to Sound Like Yourself Online' },
  { id: 'ch6', label: '6. Consistency vs. Virality' },
  { id: 'ch7', label: '7. Building a Community, Not Just a Following' },
  { id: 'ch8', label: '8. Turning Your Brand Into Opportunity' },
  { id: 'ch9', label: '9. Finding Your Voice With AI (Without Sounding Like AI)' },
]

export default function BuildYourBrandPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-void text-white">
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
                Vol. 7
              </span>
              <span className="text-xs text-gray-600">40 min read</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Build Your Brand from Zero
            </h1>
            <p className="mb-6 text-xl text-gray-400 italic">
              The No-Budget Personal Brand Playbook
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
                  Chapter 1: What a Personal Brand Actually Is (It&apos;s Not What You Think)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The most misunderstood concept in the creator space — and what it actually means for you.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Most people think a personal brand is a logo, a color palette, a consistent Instagram aesthetic, and a content niche with a catchy hook. That stuff matters — but it&apos;s not the brand. Those are the clothes. The brand is what&apos;s underneath: who you actually are, what you genuinely believe, and what you consistently deliver to people who follow you.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Jeff Bezos has a famous quote: &quot;Your brand is what people say about you when you&apos;re not in the room.&quot; That&apos;s it. That&apos;s the whole thing. Your personal brand is not what you say about yourself — it&apos;s the impression you leave behind. It&apos;s the specific feeling people associate with your name. It&apos;s the word that comes to mind when someone mentions you to someone else.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When someone mentions me, I want people to think: solo founder, building in public, real about the grind, gives away what others charge for. That&apos;s not a logo. That&apos;s a reputation. And it&apos;s built post by post, interaction by interaction, over time.
                </p>

                <Callout>
                  You already have a personal brand — whether you&apos;ve built it intentionally or not. The question isn&apos;t whether to have one. It&apos;s whether the one you have reflects who you actually are and where you want to go.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The good news: you don&apos;t need to be someone else to build a strong brand. The most powerful personal brands are just people who found a way to be extremely clearly themselves in public. Authenticity isn&apos;t a buzzword in this context — it&apos;s a competitive advantage. People can sense when someone is performing versus when they&apos;re being real. The real ones keep audiences longer.
                </p>
                <p className="leading-relaxed text-gray-300">
                  This guide is going to walk you through the actual process of building a brand intentionally, from zero, with no budget. Not by faking who you are — by figuring out who you actually are and making that legible to the world.
                </p>
              </section>

              {/* CHAPTER 2 */}
              <section id="ch2" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 2: Finding Your Niche Without Pigeonholing Yourself
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  How to pick a lane that&apos;s specific enough to matter but wide enough to grow.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  The advice &quot;pick a niche&quot; is right but also terrifying, because it feels like you&apos;re being asked to permanently box yourself in. What if your interests change? What if you want to talk about more than one thing? What if you don&apos;t know what your niche is?
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s the reframe: a niche isn&apos;t a cage. It&apos;s a starting point. The goal is to be the clearest possible thing to a specific group of people. Once you&apos;ve built an audience with that clarity, you can expand — because the audience trusts you enough to follow you into adjacent territory. The creators who get pigeonholed are the ones who never explicitly choose to expand. You can always evolve a clear brand. You can&apos;t build an audience with a vague one.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The niche formula that works</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Your niche lives at the intersection of three things: what you know well, what you&apos;re genuinely interested in, and what a real audience cares about. You need all three. Knowing something without anyone caring means you&apos;re a subject-matter expert with no readers. Caring deeply about something with no expertise means you&apos;re a fan who&apos;ll run out of original things to say. An audience that cares without your genuine interest means you&apos;ll burn out performing enthusiasm you don&apos;t feel.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Write out answers to these questions: What do people ask me for advice about? What do I read or watch when I have free time? What problems have I solved in my own life that other people are still struggling with? Look for overlap in those answers. That overlap is your niche.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Go specific, then broad</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The mistake most people make is starting too broad. &quot;I talk about personal development&quot; is a niche with 10 million creators in it. &quot;I help working parents build morning routines without waking up at 4am&quot; is a niche with 200 creators and 10 million potential readers who feel very specifically seen. Start with something specific enough that you can own it. Then expand from there as your audience grows.
                </p>

                <Callout>
                  Specific beats generic every time at the start. You&apos;d rather be the only person in the room for 1,000 people than one of 10,000 voices all saying the same thing to the same audience. Find the room where you can be the most relevant person there.
                </Callout>
              </section>

              {/* CHAPTER 3 */}
              <section id="ch3" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 3: Your Story Is Your Brand (How to Tell It)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The most underused competitive advantage you already have: your actual life.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Nobody else has lived your life. Not the combination of where you grew up, what you&apos;ve been through, what you&apos;ve built, who you&apos;ve lost, what you&apos;ve learned. That combination is yours. And it is, genuinely, your most differentiated asset as a creator — because it cannot be copied, replicated, or faked by anyone else.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The instinct most people have is to hide the messy parts of their story and only show the polished version. The job they got. The company they launched. The credential they earned. But audiences don&apos;t connect with polished stories — they connect with true ones. The struggle before the win. The pivot that was really a failure first. The moment you didn&apos;t know if you were going to make it.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  I built SocialMate while working a deli job. I wrote code at night after 8-hour shifts on my feet. My technical co-founder left before we even started. I learned to code from scratch at 30 using AI. Every one of those facts is part of my brand — not because I&apos;m trying to get sympathy, but because they&apos;re true, they&apos;re specific, and they make me legible to the people I&apos;m trying to reach: builders who are starting from nothing.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">How to structure your story</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The most compelling personal brand stories follow a simple structure: Before → Crisis → Change → Now. Who were you before? What happened that forced a shift? How did you change as a result? Where are you now, and where are you going? This isn&apos;t a template to follow robotically — it&apos;s a framework for finding the narrative arc in your own life. Almost everyone has one. Most people just haven&apos;t articulated it yet.
                </p>

                <Callout>
                  The parts of your story you&apos;re most tempted to hide are often the parts that will resonate the most. Not because people want to watch you suffer — but because specificity and honesty are rare, and audiences are starving for both.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  Write your story down once — a full version, maybe 500 words. Then use pieces of it constantly. Your origin post. Your bio. Your about page. The context you weave into every piece of content. Your story isn&apos;t separate from your content strategy. It&apos;s the spine of it.
                </p>
              </section>

              {/* CHAPTER 4 */}
              <section id="ch4" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 4: The Visual Identity You Can Build for Free
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  What you actually need for a visual brand — and what&apos;s optional until you have money.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Visual identity matters — but it matters a lot less than most people think at the start, and it costs a lot less than designers will tell you. For a creator brand, your visual identity is doing one job: making your content immediately recognizable before someone reads a single word. That&apos;s it. Anything beyond that is refinement, not foundation.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s what you actually need at day one, and what you can build all of it with using Canva (free):
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">A profile photo that works</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Covered in the Vol. 6 guide, but worth repeating here: use your actual face if you&apos;re a personal brand. Consistent across platforms. Good lighting — the light from a window is free and better than most studio setups. This is not optional. An anonymous avatar is brand kryptonite for a personal brand creator.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">One primary color</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Pick one color that feels right for your brand personality. Energetic and bold? Orange or red. Trustworthy and calm? Deep blue or navy. Premium and minimal? Black or charcoal. Professional but approachable? Amber or warm yellow (my choice for SocialMate). Use that color in your profile header, your graphics, your Canva templates. One color, used consistently, creates recognition over time.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">A Canva template for your posts</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  In Canva, create one simple template for your image posts: your color, your font, your logo or name. Every image post you share uses this template. This takes 20 minutes to set up and makes your content look 10x more professional than creators who design from scratch every time. You&apos;re building visual consistency, which builds brand recognition.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">What you don&apos;t need yet</h3>
                <ul className="mb-6 list-disc pl-6 space-y-2 text-gray-300">
                  <li>A professional logo (Canva text works fine to start)</li>
                  <li>A brand style guide document</li>
                  <li>Custom fonts (use one of Canva&apos;s free ones consistently)</li>
                  <li>A designer</li>
                  <li>Matching merchandise</li>
                </ul>

                <Callout>
                  Visual brand is about recognition, not perfection. Pick something and be consistent with it. A creator with one color, one font, and one photo style who posts 200 times looks more professional than a creator with a $5,000 brand kit who posts 20 times. Volume and consistency beat production value for personal brands.
                </Callout>
              </section>

              {/* CHAPTER 5 */}
              <section id="ch5" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 5: Your Voice: How to Sound Like Yourself Online
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The difference between a creator people remember and one they scroll past is almost always voice.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Voice is the hardest thing to teach and the most valuable thing to develop. It&apos;s not your writing style — it&apos;s the specific combination of vocabulary, rhythm, opinion, and personality that makes your words sound like you and nobody else. When your voice is strong, people can read a post without seeing your name and know it&apos;s from you. That&apos;s the goal.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Most new creators write the way they were taught in school or the way they&apos;ve seen professional content written. Formal. Hedged. Safe. That produces content that sounds like everyone else&apos;s, because most people were taught the same rules. The creators who break through usually break some of those rules on purpose.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Finding your voice</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Go back through text messages you&apos;ve sent to close friends in the last month. Look at how you actually talk. The contractions you use. The words you repeat. The jokes you make. The analogies you reach for. The level of directness. That&apos;s your real voice — not the version you perform when you think someone&apos;s grading you.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Now write your next post the same way you&apos;d explain the topic to a friend over the phone. Not a professional. Not a professor. A friend who would tell you if you were being boring. This exercise, repeated many times, trains you to write in your actual voice rather than a performed version of it.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Voice doesn&apos;t mean unprofessional</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  You can be an authority in your field and still have a conversational, human voice. In fact, that combination is rare and magnetic. The experts who write like textbooks get skimmed. The experts who write like they&apos;re talking to you get read. Trust is built through clarity, not formality.
                </p>

                <Callout>
                  If you sound exactly like every other creator in your space, you are replaceable. Your voice is the thing that makes you irreplaceable. It can&apos;t be copied because nobody else has lived your exact life and developed your exact perspective. Let it show.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  For SOMA users on SocialMate: the Voice DNA Builder on the SOMA dashboard is literally designed for this. It&apos;s a 40-question interview that teaches the AI your exact voice — your vocabulary, your tone, your opinions — so when SOMA generates content for you, it sounds like you, not like a corporate press release. If you haven&apos;t done it yet, that&apos;s your next step.
                </p>
              </section>

              {/* CHAPTER 6 */}
              <section id="ch6" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 6: Consistency vs. Virality (The Thing Nobody Tells You)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The honest truth about going viral — and why most creators are chasing the wrong thing.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  Everyone wants a viral post. It&apos;s the fantasy: one piece of content explodes, your follower count jumps by 10,000 overnight, and your brand is established. It does happen. And it almost never leads to sustainable audience growth by itself.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s what actually happens when a creator goes viral without a consistent body of work behind them: the flood of new visitors arrives, looks at a profile with 20 scattered posts, and most of them don&apos;t follow. Why would they? There&apos;s no evidence of what this person is about or whether they&apos;ll keep showing up. Within 48 hours, the viral traffic has dried up and the creator is left with a small bump in followers and a hunger to go viral again — which leads to chasing trends instead of building substance.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The creators who build lasting audiences almost always did it through consistency, not a single viral moment. They showed up 200, 300, 500 times. They built a library of content that new visitors could explore. They created the conditions where any one post could go viral — and when it did, there was something to land on.
                </p>

                <Callout>
                  Virality is a lottery ticket. Consistency is a savings account. One might pay off big once. The other compounds every single week. Build the account. If the lottery ticket comes, great — but don&apos;t structure your strategy around winning it.
                </Callout>

                <p className="mb-4 leading-relaxed text-gray-300">
                  This doesn&apos;t mean never try to create content that spreads. It means the goal of every post should be to serve your specific audience, not to game some hypothetical viral trigger. Ironically, the posts that spread the most are usually the ones that weren&apos;t trying to go viral — they were just extremely honest, specific, and useful to a defined group of people.
                </p>
                <p className="leading-relaxed text-gray-300">
                  Post 200 times, and your odds of having one piece blow up are genuinely good. Post chasing virality 20 times and give up, and your odds are zero. Consistency is the strategy that works even when it&apos;s not working yet.
                </p>
              </section>

              {/* CHAPTER 7 */}
              <section id="ch7" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 7: Building a Community, Not Just a Following
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  The difference between an audience that consumes you and one that would fight for you.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  A following is a number. A community is a group of people who feel some sense of belonging around what you&apos;re building. The difference matters because communities are resilient — they don&apos;t evaporate when the algorithm changes, when a platform tanks, or when you take two weeks off. A following can disappear overnight. A community migrates with you.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Most creators build a following by accident. They post, people follow, they keep posting. The relationship is one-directional: creator broadcasts, audience consumes. That&apos;s fine as a start. But the brands that last are built on two-directional relationships: the creator talks to the audience, and the audience talks back — to each other.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s how to start building community, not just audience:
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Respond to everyone who comments, for as long as you possibly can</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  When you have 100 followers, you can reply to every comment. Do it. Not just &quot;thanks!&quot; — a real response that extends the conversation. People who feel seen become advocates. They tell others. They defend you in comment sections. They buy from you. The relationship you build in the early days with a small audience is the foundation everything else sits on.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Create spaces for your audience to gather</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  A Discord server, a Telegram group, a Subreddit — somewhere people who follow you can talk to each other. When your audience talks to each other, you go from being a content source to being the center of a shared identity. That&apos;s magnetic. Community platforms are free and easy to set up. SocialMate lets you post directly to Discord channels — use it to keep your community active between your other posts.
                </p>

                <Callout>
                  You don&apos;t need 100,000 followers to have a real community. 200 people who genuinely connect with what you&apos;re building, who talk to each other, who share your work — that&apos;s more valuable than 50,000 passive scrollers. Build depth before you chase width.
                </Callout>
              </section>

              {/* CHAPTER 8 */}
              <section id="ch8" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 8: Turning Your Brand Into Opportunity
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  When the brand is built, what actually comes from it — and how to make sure it does.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  A personal brand is not a product. It&apos;s a distribution channel and a trust machine. When your brand is working, opportunities come to you instead of you chasing them. Job offers, collaboration requests, speaking invitations, partnership deals, product opportunities — these all flow from reputation. The brand is what makes people reach out instead of you having to cold-pitch everything.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  But the brand doesn&apos;t create opportunity by itself. You have to design a path from the brand to the thing you want. That means being clear about what you want and making it visible. If you want clients, say so. If you want a job at a specific type of company, say the kinds of problems you solve and the environment you thrive in. If you want speaking gigs, talk about the topics you&apos;d want to speak on. Opportunities find specific, clear targets more than vague ones.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  The tangible ways a brand converts to opportunity: consulting and freelance work (people hire you because they trust your expertise), digital products (courses, templates, guides — people pay for organized versions of what you give away free), partnerships and sponsorships (brands pay to be associated with audiences that trust you), direct sales (your own product, like I&apos;m doing with SocialMate), and simply better career options (employers watch your public work and reach out before you ever apply).
                </p>

                <Callout>
                  A brand is a long game. You won&apos;t monetize immediately, and if you try to too early, you&apos;ll lose the trust you&apos;re building. Spend the first year giving everything. Build the reputation. Then when you have something to offer, the audience will be ready to hear it — because you&apos;ve earned the right to ask.
                </Callout>

                <p className="leading-relaxed text-gray-300">
                  When you&apos;re ready to monetize, SocialMate&apos;s Creator Hub gives you tip jars and fan subscriptions out of the box — free on Pro. No platform cut. Build the audience first. The revenue will follow if the trust is real.
                </p>
              </section>

              {/* CHAPTER 9 */}
              <section id="ch9" className="mb-16 scroll-mt-8">
                <h2 className="mb-2 text-2xl font-black text-white border-b border-[#1f1f1f] pb-4">
                  Chapter 9: Finding Your Voice With AI (Without Sounding Like AI)
                </h2>
                <p className="mb-4 text-sm italic text-gray-600 border-b border-[#1f1f1f] pb-4">
                  AI writing tools are everywhere now. Here&apos;s how to use them without becoming everyone else.
                </p>

                <p className="mb-4 leading-relaxed text-gray-300">
                  AI writing tools are everywhere now, and most AI-generated content has a recognizable voice. You know it when you see it. &quot;In today&apos;s fast-paced world...&quot; A wall of hedging. An em dash doing way too much work. A close that sounds like a LinkedIn motivational poster no matter what the topic was. None of it is wrong, exactly. It&apos;s just generic. And generic is the opposite of everything we just spent eight chapters building.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  If your audience can tell a post is AI-written, it undermines the authenticity that&apos;s the entire point of a personal brand. People followed you for your perspective, not for a well-organized summary of the topic. The moment your content starts sounding like it could&apos;ve come from anyone&apos;s AI tool, you&apos;ve traded your most valuable asset for a faster first draft.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  But throwing out AI tools entirely throws away a real productivity unlock. The blank page is the hardest part of content creation for most people, and AI is genuinely good at getting you past it. The fix isn&apos;t &quot;don&apos;t use AI.&quot; The fix is &quot;make AI sound like you.&quot;
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Build a voice brief before you write a single prompt</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Before you use any AI tool to help write content, spend 30 to 60 minutes documenting your actual voice in writing. This becomes a reusable brief you paste into every AI writing session from now on. It&apos;s the single highest-leverage thing you can do to make AI output sound like you instead of like itself.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Your voice brief should cover:
                </p>
                <ul className="mb-6 list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Your niche and audience.</strong> Who you&apos;re talking to and what they actually care about, in plain language.</li>
                  <li><strong className="text-white">Your tone.</strong> Formal vs. casual, serious vs. playful, direct vs. nuanced. Pick where you fall and say it explicitly.</li>
                  <li><strong className="text-white">Words and phrases you actually use.</strong> Your real vocabulary, including slang or niche terms specific to your space.</li>
                  <li><strong className="text-white">Words and phrases you&apos;d never say.</strong> This is just as important as the last one. It&apos;s how you filter out generic AI-isms before they ever show up.</li>
                  <li><strong className="text-white">Your story and background, in your own words.</strong> AI can&apos;t invent your lived experience, but it can help you articulate it once you&apos;ve told it the real version.</li>
                  <li><strong className="text-white">Your stance on things.</strong> What do you believe that not everyone agrees with? Generic content has no point of view. Yours should.</li>
                </ul>

                <Callout>
                  This is exactly what SOMA&apos;s Voice DNA Builder does in a structured 40-question interview, but you can build a rougher version of the same thing yourself in an hour with a notes app and some honesty. The format doesn&apos;t matter. The specificity does.
                </Callout>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">Use the brief, every time</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Paste your voice brief at the start of any AI writing session, alongside whatever specific content you&apos;re asking for. The output won&apos;t be perfect on the first try. It almost never is. But it&apos;ll be dramatically closer to &quot;you&quot; than a cold prompt that just describes the topic. The brief is doing the work of context that a cold prompt can&apos;t provide.
                </p>

                <h3 className="mb-3 mt-8 text-lg font-bold text-amber-400">The feedback loop most people skip</h3>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Here&apos;s the part that actually compounds. After you publish AI-assisted content, take a minute to note what felt off, what landed, and what you ended up rewriting before posting. Then add those notes back into your voice brief. Maybe you keep cutting a phrase the AI loves. Maybe a certain framing always needs softening, or a certain topic always needs more edge than the AI gives it by default.
                </p>
                <p className="mb-4 leading-relaxed text-gray-300">
                  Over time, the brief gets sharper and the AI output needs less editing. Treat your voice brief as a living document, not a one-time setup. The version you write in an hour today should look different in three months, because you&apos;ll have fed it real feedback from real posts.
                </p>

                <Callout>
                  Your voice is the asset. AI is just faster typing once it actually knows what your voice sounds like. Build the brief, feed it back, and let the gap between &quot;AI draft&quot; and &quot;your final post&quot; get smaller every time you publish.
                </Callout>
              </section>

              {/* Joshua's Note */}
              <section className="mb-16 scroll-mt-8">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                    A Note from Joshua
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    I built my brand the same way I&apos;m telling you to: slowly, honestly, and without a budget. I didn&apos;t have a professional headshot. I didn&apos;t have a brand designer. I had a real story and the stubbornness to keep telling it until someone listened.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-300">
                    The most important thing I can tell you about building a brand from zero is this: start before you&apos;re ready, and let the brand evolve with you. The version of your brand you have on Day 1 is not the version you&apos;ll have in Year 2. That&apos;s fine. Start anyway.
                  </p>
                  <p className="leading-relaxed text-gray-300">
                    Find me at <strong className="text-amber-400">@socialmatehq</strong> everywhere. Show me what you&apos;re building.
                  </p>
                  <p className="mt-6 text-right text-sm text-amber-400 font-semibold">
                    — Joshua Bostic<br />
                    <span className="text-gray-600 font-normal">Founder, SocialMate</span>
                  </p>
                </div>
              </section>

              <GuideEmailCapture />
              <GuidePDFDownload title="Build Your Brand from Zero" />

              {/* Bottom navigation */}
              <div className="border-t border-[#1f1f1f] pt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Up next</p>
                  <p className="font-bold text-white">Vol. 8: From Side Hustle to Full-Time Creator</p>
                  <Link href="/guides/side-hustle-to-full-time-creator" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">Read now →</Link>
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

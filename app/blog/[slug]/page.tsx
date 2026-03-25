import type { Metadata } from 'next'
import Link from 'next/link'

const POSTS: Record<string, {
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  content: string
}> = {
  'why-we-built-socialmate': {
    title:    'Why We Built SocialMate: The Full Story',
    category: 'Our Story',
    date:     'Mar 1, 2026',
    readTime: '4 min read',
    excerpt:  'Built by a deli worker in spare moments. Here\'s why SocialMate exists and what we\'re building toward.',
    content: `
## The Problem We Kept Running Into

I was managing social media for a local business in between shifts. The tools that could actually do the job — schedule across multiple platforms, give you analytics, help with content — all cost $50 to $250 per month.

That's a lot when the business you're posting for barely makes enough to justify the marketing budget in the first place.

I looked for a free alternative. What I found were free tiers that gave you two channels, a handful of scheduled posts, and constant prompts to upgrade. Not useful.

So I started building SocialMate in my spare time. That was in late 2024.

## What We Decided Early On

The first decision we made was that the free plan had to be genuinely useful. Not a trial. Not a crippled version. An actual working tool that covers the needs of a small creator or small business without requiring them to pay.

That meant: real platform support, not a token list of one or two. Real scheduling with a reasonable window. Real AI tools, not one tool locked to a credit that expires. Real analytics that show you something meaningful.

It also meant accepting that growth would be slower. A useful free tier means fewer people feel pressure to upgrade. We made peace with that.

## Who We Built This For

SocialMate is for people who are doing real work without enterprise resources.

The freelance social media manager handling four clients who can't justify $99/month for a tool that mostly just schedules posts. The small business owner who posts their own content between running everything else. The creator who is serious about their audience but not yet at the revenue level where $50/month for a scheduling tool makes sense.

These are real people with real needs. The existing tools weren't built for them — they were built for teams at companies that can put "scheduling software" on an expense report without anyone blinking.

## What Makes SocialMate Different

We support 16 platforms and we're adding more. The free plan includes all of them. Connecting Discord and Bluesky and Mastodon and Telegram doesn't cost more than connecting just one.

We built 12 AI tools into the platform. Not one AI tool on a restricted tier — twelve, available from day one. Caption generation, hashtag sets, viral hook writing, post rewriting, thread generation, content repurposing, post scoring, SM-Pulse trend analysis, SM-Radar competitive intelligence, content gap detection, AI content calendar, and more.

We built in features that other tools charge for separately: bulk scheduling, a link in bio page, evergreen content recycling, competitor tracking, RSS import, team collaboration with content approval workflows.

All of it is included. Most of it is free.

## How We're Sustaining It

SocialMate is fully bootstrapped. There are no investors, no venture funding, no board to answer to.

The Pro plan ($5/month) and Agency plan ($20/month) pay for infrastructure and development. Users who find enough value to upgrade are the ones who make the free tier possible for everyone else. That's the model.

It works as long as we build something people find genuinely useful at the free tier and genuinely worth paying for at the paid tiers. We think we can do that.

## What's Next

SocialMate is early. There are features we haven't built yet. Platforms we haven't connected. Polish we haven't applied. We're working through the list.

If you're here now, you're part of the first wave. Your feedback shapes what gets built next. We ship fast and we pay attention to what users actually need.

We're glad you're here.
    `,
  },
  'best-free-social-media-scheduler-2025': {
    title:    'The Best Free Social Media Scheduler in 2026 (No Credit Card)',
    category: 'Guides',
    date:     'Feb 20, 2026',
    readTime: '5 min read',
    excerpt:  'Most "free" schedulers are just trials. SocialMate is genuinely free — here\'s exactly what you get.',
    content: `
## "Free" Usually Means Something Else

The social media scheduling market has a language problem.

"Free" usually means: free for 7 days, then $29/month. Or: free for one user, one platform, three scheduled posts per month. Or: free to sign up, but every feature you'd actually use is behind a paywall.

Hootsuite removed their free plan entirely. Buffer's free plan gives you 3 channels and 10 posts per channel — not enough for any real social presence. Sprout Social starts at $249/month.

This guide covers what a genuinely free scheduler actually looks like in 2026, and how to find one without getting burned.

## What "Genuinely Free" Requires

A social media scheduler is only free in a meaningful sense if it lets you do these things at no cost:

1. Connect more than one or two platforms
2. Schedule more than a token number of posts
3. Access analytics beyond basic counts
4. Use the tool with at least one team member
5. Actually publish posts without hitting a wall

Anything less than that is a trial with a free label on it.

## What SocialMate Offers for Free

SocialMate's free plan includes:

- All 16 supported platforms (Discord, Bluesky, Telegram, Mastodon, LinkedIn, YouTube, Pinterest, and 9 more on the roadmap)
- 100 posts per month
- 2-week scheduling window
- 2 team seats
- 50 AI credits per month (caption generation, hashtag sets, post scoring, and more)
- Analytics covering the last 30 days
- A link in bio page (no separate Linktree subscription needed)
- Competitor tracking for up to 3 accounts
- RSS import, bulk scheduler, hashtag manager

There is no credit card required. There is no trial period. The features above are just what the free plan is.

## What You Give Up at the Free Tier

Being honest about limitations matters. Here's what free users don't get:

- Scheduling more than 2 weeks in advance (Pro gets 4 weeks, Agency gets 12)
- Client workspaces (Pro gets 1, Agency gets up to 10)
- More than 2 team seats
- White label options
- Posts beyond 100/month

If you need those things, the Pro plan is $5/month and covers most of them. But for individual users, small businesses, and early-stage creators, the free tier covers a lot of ground.

## How to Get Started

Creating an account takes about 60 seconds. Connect your first platform — Bluesky, Discord, Mastodon, or Telegram are all live now. Compose your first post. Schedule it or publish immediately.

If you've been putting off social media scheduling because you couldn't justify paying for another tool, this is the time to stop waiting. The free plan is genuinely free.
    `,
  },
  'how-to-use-ai-for-social-media-captions': {
    title:    'How to Use AI to Write Better Social Media Captions',
    category: 'Tips',
    date:     'Feb 10, 2026',
    readTime: '3 min read',
    excerpt:  'AI caption tools can save hours every week. Here\'s how to use them without sounding like a robot.',
    content: `
## The Problem With AI Captions

Most people who try AI for social media captions give up after a few attempts. The outputs are too generic, too formal, too clearly AI-generated. "Exciting news!" and "We're thrilled to announce" have become punchlines because AI tools trained on corporate content produce corporate-sounding outputs by default.

The problem isn't AI. The problem is how people are using it.

## Give It Context, Not Just a Topic

The most common mistake is prompting with just a topic. "Write a caption about our new product launch." The AI has nothing to work with except the bare minimum, so it produces the bare minimum.

Better inputs:
- **Your tone**: Are you casual and direct? Warm and encouraging? Dry and witty?
- **Your audience**: Who's reading this? What do they care about?
- **The platform**: A LinkedIn caption reads differently than a Bluesky post.
- **The goal**: Awareness? Engagement? Click-through?
- **A specific angle**: Don't say "our new product." Say "we built this because customers kept asking for X."

The more specific you are, the more the AI can match your voice and purpose.

## Use AI as a Starting Point

The best use of AI for captions is not final output — it's first drafts.

Use SocialMate's Caption Generator to produce 3-5 options for a post. Read them. One usually has the right idea with wrong execution. Take that one and rewrite it in your actual voice. What you end up with is usually better than if you'd started from scratch, because the AI gave you a structure and an angle to react to.

This workflow is faster than writing from scratch and produces more authentic output than using AI copy directly.

## Viral Hook Generator

The opening line of a post matters more than anything else. If the first sentence doesn't stop the scroll, nothing else matters.

SocialMate's Viral Hook Generator is specifically trained on high-performing post openings. Give it your topic and tone, and it produces opening lines designed for engagement. Run it alongside your Caption Generator and mix and match — often the best caption is the AI hook combined with your own body text.

## Post Rewriter

This one gets underused. If you wrote a caption that's technically accurate but just isn't landing — or if you want to repurpose the same core idea for a different platform — the Post Rewriter takes your draft and restructures it.

Paste your existing caption, tell it what's not working or what platform you're adapting it for, and it rewrites while keeping your core message intact. This is particularly useful for adapting LinkedIn posts to Bluesky where the character limit is tighter and the tone is more conversational.

## What AI Won't Do

AI can help with structure, phrasing, hooks, and volume. It can't replace your actual perspective or experience. The captions that perform best on social media are almost always specific — specific anecdotes, specific results, specific opinions. AI doesn't have those. You do.

Use AI to accelerate the writing process. But make sure every caption you publish has something specific and human at its core.
    `,
  },
  'why-your-hashtag-strategy-isnt-working': {
    title:    'Why Your Hashtag Strategy Isn\'t Working (And How to Fix It)',
    category: 'Tips',
    date:     'Jan 28, 2026',
    readTime: '4 min read',
    excerpt:  'Spamming 30 hashtags stopped working years ago. Here\'s what actually drives reach in 2026.',
    content: `
## The Hashtag Myth

At some point in the early 2010s, stacking 30 hashtags on an Instagram post helped with reach. That time has passed. The platforms changed, the algorithms changed, and the behavior that used to work now either does nothing or actively hurts your content.

If you're still using a block of 25-30 hashtags on every post, you're spending time on something that isn't moving the needle.

## What Changed

Several things happened simultaneously across platforms:

**Instagram deprioritized hashtag-driven discovery** for most content types. Their own official guidance now recommends 3-5 targeted hashtags over large hashtag dumps. The algorithm prioritizes accounts and content, not tags.

**Most platforms outside Instagram never relied on hashtags** the way Instagram users expected. Hashtags on LinkedIn work differently. Hashtags on Bluesky work differently. Treating them all the same way produces poor results across the board.

**Generic hashtags became noise**. #marketing #business #entrepreneur are flooded with content. Your post isn't being seen by anyone browsing those tags — there's too much competition and too little intent behind the behavior.

## What Actually Works Now

**Fewer, more targeted hashtags** outperform large volumes on every platform. On Instagram, 3-5 specific tags relevant to your actual content. On LinkedIn, 3 hashtags that match the topic you're writing about. On Bluesky, 1-2 that your specific community actually follows.

**Niche over broad**. #contentmarketing reaches your actual audience. #marketing does not.

**Platform-specific strategy**. Hashtags on Bluesky are a navigation tool for small communities — use the ones your niche actively monitors. Hashtags on LinkedIn signal your expertise area. Don't use the same set everywhere.

**Consistency over volume**. Using the same 5-10 hashtags consistently over time builds topical authority in ways that random hashtag selection can't.

## How to Build Your Hashtag Sets

Start by searching hashtags you're considering and looking at what actually appears there. Is your content competitive in that space? Are people engaging with that tag, or is it a graveyard of posts with no engagement?

SocialMate's Hashtag Manager lets you build named hashtag sets — for example, "SaaS Marketing" or "Content Creation Tips" — and insert them into posts with a single click. Build 3-4 sets that match your content pillars. Rotate them based on what you're posting about rather than using the same block every time.

The goal is intentional, relevant hashtag use. Not volume.

## The Quick Fix

If your current hashtag strategy is a paste of 20-30 generic tags: cut it to 5, make sure each one is specific to the actual content of the post, and test that approach for 30 days.

You probably won't see a massive traffic spike from hashtags regardless. That's the honest answer — organic hashtag reach is limited in 2026. Your time is better spent on content quality, posting consistency, and community engagement than on hashtag optimization.

But cutting the bloated tag block removes something that isn't helping and occasionally hurts. That's a net win.
    `,
  },
  'real-cost-of-social-media-management-tools-2025': {
    title: 'Why Social Media Scheduling Tools Are Overpriced — And What To Do About It',
    category: 'Industry',
    date: 'Mar 4, 2026',
    readTime: '6 min read',
    excerpt: 'The average social media manager pays $50–$250/month just to schedule posts. Here\'s how that pricing model developed, why it doesn\'t have to be this way, and what a fairer alternative actually looks like.',
    content: `
## The Pricing Problem Nobody Talks About

If you manage social media for a living — or even just for your own brand — you've probably done the math at some point and felt something between confused and annoyed.

Buffer charges $6/month per channel on monthly billing ($5/month if you pay a full year upfront). Manage 5 platforms and you're at $30/month — $360/year — before you add a single team member. Add teammates and you're looking at $10/channel/month on their Team plan. For 10 channels and 3 users, that's $100/month. $1,200/year. To schedule posts.

Hootsuite doesn't even offer a free plan. Their Standard plan starts at $99/month. Bulk scheduling and a link-in-bio tool aren't available until their Advanced tier at $249/month.

These aren't small numbers for individual creators, small businesses, or lean agencies. And the frustrating part is that the underlying cost structure doesn't justify the pricing.

## How We Got Here

Social media management tools grew up in an era where "SaaS" meant per-seat, per-feature pricing was the default business model. You add a user, you pay more. You add a channel, you pay more. Every feature gate is a potential upsell.

This made sense in a world where software was expensive to build and maintain. But that world has changed significantly. Infrastructure costs have dropped. AI tools have made development faster. The marginal cost of adding one more social account to a scheduling tool is genuinely very low.

The pricing hasn't followed the costs down. It's followed the market — which is to say, it's stayed wherever users will tolerate paying.

## What The Pricing Actually Buys You

Let's be specific. When you pay Buffer $6/month for a single channel, here's what you're getting for that specific channel:

- Unlimited post scheduling (on paid plans)
- A calendar view
- Basic analytics
- Access to their mobile app

That's genuinely useful. But the per-channel pricing model means your bill scales linearly with the number of platforms you manage — not with the value you're getting. Managing Instagram and TikTok doesn't create twice the infrastructure cost for a scheduling tool. It barely registers.

The per-seat model on team plans has similar issues. Adding a content creator to your workspace doesn't meaningfully increase the cost of running the software. The pricing is a business decision, not a cost reflection.

## A Different Model

SocialMate was built on the premise that the per-channel, per-seat model is the wrong foundation for a scheduling tool aimed at individual creators and small teams.

The free plan includes all 16 supported platforms — Instagram, X/Twitter, LinkedIn, TikTok, Facebook, Threads, Pinterest, YouTube, Snapchat, Bluesky, Reddit, Discord, Telegram, Mastodon, Lemon8, and BeReal. Connecting your Instagram account and your TikTok account doesn't cost more than connecting just Instagram. The platform count doesn't drive the pricing.

Team seats follow the same logic. The free plan includes 2 team members. The Pro plan ($5/month flat, not per channel) includes 5. Agency ($20/month) includes unlimited. You're not paying per person.

## What This Actually Costs You Compared

Here's a direct comparison for a real-world use case: a small business managing 6 social platforms with 2 team members.

Buffer Team plan: 6 channels × $10/month = $60/month. That's $720/year.

Hootsuite Standard: $99/month for up to 10 accounts, 1 user. Add a second user and you're negotiating with their sales team.

SocialMate: $0/month. All 6 platforms, both team members, bulk scheduler, analytics, link in bio, hashtag collections, AI credits — included.

The $5/month Pro plan would cover 5 accounts per platform and 5 team members. The $20/month Agency plan covers 10 accounts per platform and unlimited team members.

## What We're Not Saying

This isn't an argument that established tools don't have value. Buffer has been refining their product for over a decade. Hootsuite has deep enterprise integrations, compliance features, and account management infrastructure that genuinely justifies their pricing for large organizations.

If you're running social media for a Fortune 500 company and need Salesforce integration, compliance monitoring, and dedicated support — enterprise tools exist for good reasons.

But for the vast majority of users — creators, small businesses, startups, lean agencies — the pricing these tools charge doesn't reflect the value delivered at that tier. It reflects the pricing tolerance of a market that hasn't had a well-built alternative.

SocialMate exists because we think that should change.

## The Simple Version

You shouldn't pay $50–$250/month to schedule social media posts. The software to do it well doesn't cost that much to build or maintain. The pricing is a business model choice, not a necessity.

If you've been paying those rates, it's worth seeing what $0/month actually gets you now.
    `,
  },
  'schedule-30-days-of-content-in-one-sitting': {
    title: 'How To Batch A Full Month of Social Content In One Afternoon',
    category: 'Strategy',
    date: 'Mar 4, 2026',
    readTime: '7 min read',
    excerpt: 'Most creators post reactively and burn out within months. The ones who stay consistent batch everything in one session. Here\'s the exact workflow — from blank page to 30 days scheduled.',
    content: `
## The Consistency Problem

The number one reason social media strategies fail isn't bad content. It's inconsistency.

You post three times one week, nothing the next, then scramble to put something together on a Tuesday because you haven't posted in 11 days. The algorithm notices. Your audience notices. Engagement drops, reach drops, and eventually posting feels like a chore instead of a lever for growth.

The creators and brands with consistent presence aren't posting more hours per week than you. They're spending those hours differently. They batch.

## What Batching Actually Means

Batching means setting aside a single focused session — typically 2 to 4 hours — to create and schedule all your content for the next 30 days. After that session, you don't think about content creation again until next month.

The cognitive case for batching is strong. Context-switching is expensive. When you write one caption, pause to answer emails, come back, write another caption, get distracted, come back again — you're spending far more total time than if you'd written all 30 captions in one uninterrupted block. Batching eliminates the switching cost.

There's also a creative case. When you're writing caption 15 of 30, you're in a different mental state than when you're writing caption 1 of 1 under pressure because you haven't posted in three days. Momentum is real.

## The Full Workflow

Here's the exact process. Budget about 3 hours for your first batch, 2 hours once it becomes routine.

**Step 1: Define your content pillars (15 minutes)**

Before you write anything, define 3–5 recurring themes for the month. These are the categories your content will rotate through. Examples:

- Educational tips specific to your industry
- Behind-the-scenes content from your work or process
- Product or service highlights
- Questions and conversation starters
- Personal takes on industry news

Having pillars means you never start from a blank page. You start from a category.

Aim for 6 posts per pillar across 30 days. That's 30 posts total — roughly once a day, with a few rest days built in.

**Step 2: Write all captions in one sitting (60–75 minutes)**

Open SocialMate's Compose page. Start writing. The rule here is: don't edit while you write. Don't second-guess. Don't delete and restart. Write all 30 captions straight through, saving each one as a draft.

Use your content pillars as prompts when you get stuck. Use the AI caption generator when you're completely blank — give it a topic and a tone and use the output as a starting point, not a final draft.

The goal of this step is volume. You'll refine later. Right now you just need raw material.

**Step 3: Match media to captions (20–30 minutes)**

Upload your images, graphics, and videos to the Media Library. Then go through your 30 drafts and attach the right media to each one. Some captions will need new media — note those and either create them quickly or set them aside for a text-only post.

This is also a good time to do a light editing pass. Fix anything that reads awkwardly. Add hashtag collections from your saved sets.

**Step 4: Bulk schedule everything (20–25 minutes)**

Open the Bulk Scheduler. Select all 30 drafts. Assign posting times based on your Best Times data — or use platform best practices if you're newer and don't have enough posting history yet for personalized recommendations.

Spread posts across the month. Make sure you're not stacking 3 promotional posts in a row. Aim for variety in format and topic across any given week.

Hit schedule.

**Step 5: Calendar review (10 minutes)**

Open the Calendar view. Scan the full month. Look for gaps, weird clusters, anything that doesn't feel right. Make small adjustments.

You're done.

## What To Do For The Rest Of The Month

Monitor your notifications for any posts that fail or need attention. Respond to comments — that's still a live, real-time job. Check your analytics midway through the month to see what's performing and let that inform next month's batch.

Content creation? You're finished until next month.

## Starting Smaller

If a full month feels overwhelming, start with 2 weeks. 15 posts in one session is very achievable and you'll still feel the difference immediately — both in the consistency of your posting and in how much mental space you recover by not thinking about "what should I post today" every single day.

Once you've done a 2-week batch twice, extend to the full month. By then the workflow will be familiar and 30 posts won't feel like a big lift.

## The Compound Effect

The real payoff from batching isn't just time saved. It's what you do with that time. Creators who batch their content spend their social media hours on engagement, relationship building, and strategy — the things that actually move the needle — instead of scrambling to produce content under pressure every few days.

Consistency compounds. Algorithms reward it. Audiences reward it. The batching workflow is how you sustain it without burning out.
    `,
  },
  'best-times-to-post-2026': {
    title: 'The Best Times To Post On Every Platform In 2026',
    category: 'Strategy',
    date: 'Mar 4, 2026',
    readTime: '8 min read',
    excerpt: 'Timing affects reach more than most creators realize. Here\'s a platform-by-platform breakdown of peak engagement windows — plus how to find your own best times from real data instead of generic advice.',
    content: `
## Why Timing Matters More Than You Think

Post the exact same piece of content at 3am versus 9am and you'll get materially different results. This isn't just about whether your followers are awake — it's about how social media algorithms treat early engagement.

Most major platforms use early engagement velocity as a signal for content distribution. If your post collects strong likes, comments, and shares in the first 30–60 minutes after going live, the algorithm interprets that as a signal that the content is worth showing to more people. If it sits quiet for that window, it gets buried regardless of how good it actually is.

Timing is how you stack the deck in favor of that early engagement window. You want your post to land when your audience is most likely to be scrolling and ready to interact.

## A Note On How To Use This Data

The figures below are aggregated industry benchmarks. They reflect general audience behavior across millions of accounts. They are a useful starting point, not a final answer.

Your specific audience might be night-shift workers, people in different time zones, or a niche community with its own rhythms. After you've accumulated 3–4 weeks of posting history in SocialMate, check your Best Times heatmap — it shows you when your actual posts have gotten the most engagement. That data is worth far more than any industry benchmark.

Use the benchmarks below to get started. Then replace them with your own data as quickly as you can.

## Platform-By-Platform Breakdown

**Instagram**

Peak windows: Tuesday through Thursday, 7–9am, 11am–1pm, and 7–9pm local time.

Instagram usage spikes during morning routines, lunch breaks, and evening wind-downs. The algorithm heavily weights saves and shares alongside likes and comments, so content that's genuinely useful or visually compelling tends to get extended distribution beyond the initial posting window.

Reels currently get more algorithmic push than feed posts. If you're posting Reels, the same time windows apply but the distribution tail is longer — a good Reel can continue picking up views for days.

Worst times: Sunday mornings, late weeknights after 10pm.

**X / Twitter**

Peak windows: Monday, Wednesday, and Thursday, 8–10am and 12–1pm local time.

Twitter is a real-time platform. It lives and dies by what's happening right now. The morning window captures commuters and people checking the news before work. The lunch window captures a second wave of activity.

For most content, X has the shortest shelf life of any platform — a tweet posted outside peak hours may simply never find an audience. This makes timing more critical here than almost anywhere else.

Worst times: weekends, evenings after 7pm.

**LinkedIn**

Peak windows: Tuesday through Thursday, 7–9am and 12–1pm.

LinkedIn is used professionally, which means it follows work schedules. Early morning before meetings start and the lunch break are the two golden windows. Posts published during these windows on Tuesday, Wednesday, or Thursday consistently outperform the same content published on Friday afternoon or over the weekend.

LinkedIn posts also have unusually long distribution tails — a post can continue generating engagement for 48–72 hours after publishing if it gets strong early traction. This makes it worthwhile to be precise about timing your best content.

Worst times: Friday after 2pm through Monday morning.

**TikTok**

Peak windows: Tuesday and Thursday, 6–9am and 7–10pm.

TikTok has two distinct daily peaks — early morning commuters and late evening scrollers. The algorithm is powerful enough that timing is somewhat less critical here than on other platforms — genuinely good content can find an audience at almost any hour. But hitting one of these windows still meaningfully improves your odds of strong early engagement.

TikTok's algorithm is topic-based more than account-based. A new account can reach millions with strong content. Timing helps but content quality is the bigger lever on this platform.

Worst times: midday on weekdays, early afternoon.

**Facebook**

Peak windows: Wednesday and Thursday, 9am–12pm, with a secondary window at 1–3pm.

Facebook skews toward slightly older demographics and tends to be used during work breaks. Mid-morning and early afternoon are the most reliable windows. Weekends are inconsistent — some audiences are very active on weekends, others aren't. Check your own analytics before committing to weekend posting on Facebook.

Worst times: late evenings, Saturday mornings.

**Pinterest**

Peak windows: Saturday and Sunday, 2–4pm and 8–11pm.

Pinterest is genuinely different from other platforms. Users go to Pinterest to plan — recipes, home projects, outfits, travel. Weekend afternoons and evenings are when that planning activity peaks. Content on Pinterest also has an extremely long shelf life; a well-optimized pin can continue driving traffic for months or years after posting.

If you're a brand with visual products or content that helps people plan or create something, Pinterest deserves more attention than most social strategies give it.

Worst times: weekday mornings.

**Threads**

Peak windows: Tuesday through Thursday, 8–10am and 6–8pm.

Threads follows a pattern similar to Instagram since it shares the same user base. The platform is still maturing, so audience behavior may shift over the next year. Currently, the morning and early evening windows perform best.

**Bluesky**

Peak windows: Monday through Friday, 8–10am and 5–7pm.

Bluesky skews toward a tech-forward, media-adjacent audience that tends to be most active at the start and end of the work day. The platform is smaller than most on this list, so reach is more limited — but engagement rates are often higher because the community is more intentional.

## How To Find Your Own Best Times

Here's the honest version: after 3–4 weeks of consistent posting, your own data will tell you more than any benchmark.

In SocialMate, your Best Times page shows a heatmap of engagement across days and hours based on your actual posting history. The darker the cell, the higher your average engagement during that window. Once you have enough data, use that heatmap to anchor your scheduling.

The process looks like this:

Start with the industry benchmarks above for your main 2–3 platforms. Post consistently for 30 days. Check your Best Times heatmap. Identify your top 2–3 windows per platform. Adjust your scheduling template to match. Repeat this review every 60–90 days — audience behavior shifts with seasons, platform updates, and changes in your own content mix.

## One Practical Note On Consistency Vs. Timing

If you have to choose between posting at the perfect time inconsistently and posting at a good time consistently, choose consistency every time.

The algorithm rewards accounts that post regularly. An audience that knows to expect content from you on Tuesday and Thursday mornings will engage more reliably than an audience that doesn't know when you'll show up. Timing optimization is a refinement. Consistency is the foundation.

Get the consistency right first. Then optimize timing on top of it.
    `,
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: 'bg-purple-50 text-purple-600',
  Industry: 'bg-blue-50 text-blue-600',
  Guide: 'bg-green-50 text-green-600',
  Tips: 'bg-green-50 text-green-600',
  Analytics: 'bg-yellow-50 text-yellow-700',
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS[slug]
  if (!post) return { title: 'Post not found — SocialMate Blog' }
  return {
    title: `${post.title} — SocialMate Blog`,
    description: post.excerpt,
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      url:         `https://socialmate.studio/blog/${slug}`,
    },
    alternates: { canonical: `https://socialmate.studio/blog/${slug}` },
  }
}

function renderContent(content: string) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<div key={key++} className="h-2" />)
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-extrabold tracking-tight mt-8 mb-3 dark:text-gray-100">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={key++} className="text-sm font-bold text-black dark:text-gray-100 mt-4 mb-1">
          {trimmed.slice(2, -2)}
        </p>
      )
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed ml-4 list-disc">
          {trimmed.slice(2)}
        </li>
      )
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {trimmed}
        </p>
      )
    }
  }
  return elements
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <nav className="border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight dark:text-gray-100">SocialMate</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors hidden sm:block">Sign in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="text-5xl mb-6">✍️</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4 dark:text-gray-100">This post is coming soon</h1>
          <p className="text-gray-400 dark:text-gray-500 leading-relaxed mb-8">
            We only publish real, genuinely useful content. This one is still being written. Check back soon.
          </p>
          <Link href="/blog" className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const otherPosts = Object.entries(POSTS)
    .filter(([s]) => s !== slug)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight dark:text-gray-100">SocialMate</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          <span>→</span>
          <span className={`font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4 dark:text-gray-100">{post.title}</h1>
          <p className="text-lg text-gray-400 dark:text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-4">
            <span>📅 {post.date}</span>
            <span>⏱ {post.readTime}</span>
          </div>
        </div>

        <div className="space-y-2 mb-16">
          {renderContent(post.content)}
        </div>

        <div className="bg-black text-white rounded-3xl p-8 text-center mb-16">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Try SocialMate free</h2>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Schedule to 16 platforms, manage your team, and grow your audience — all for free. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all">
            Create free account →
          </Link>
          <p className="text-white/30 text-xs mt-3">16 platforms · Unlimited posts · Free forever</p>
        </div>

        {otherPosts.length > 0 && (
          <div>
            <h2 className="text-lg font-extrabold tracking-tight mb-6 dark:text-gray-100">More from the blog</h2>
            <div className="space-y-3">
              {otherPosts.map(([slug, p]) => (
                <Link key={slug} href={`/blog/${slug}`}
                  className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-gray-600 dark:text-gray-100 dark:group-hover:text-gray-300 transition-colors">{p.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.date} · {p.readTime}</p>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors">→</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/blog" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                View all posts →
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight dark:text-gray-100">SocialMate</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
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

So I started building SocialMate in my spare time. That was in early February 2026.

## What We Decided Early On

The first decision we made was that the free plan had to be genuinely useful. Not a trial. Not a crippled version. An actual working tool that covers the needs of a small creator or small business without requiring them to pay.

That meant: real platform support, not a token list of one or two. Real scheduling with a reasonable window. Real AI tools, not one tool locked to a credit that expires. Real analytics that show you something meaningful.

It also meant accepting that growth would be slower. A useful free tier means fewer people feel pressure to upgrade. We made peace with that.

## Who We Built This For

SocialMate is for people who are doing real work without enterprise resources.

The freelance social media manager handling four clients who can't justify $99/month for a tool that mostly just schedules posts. The small business owner who posts their own content between running everything else. The creator who is serious about their audience but not yet at the revenue level where $50/month for a scheduling tool makes sense.

These are real people with real needs. The existing tools weren't built for them — they were built for teams at companies that can put "scheduling software" on an expense report without anyone blinking.

## What Makes SocialMate Different

We're live with four platforms right now — Discord, Bluesky, Mastodon, and Telegram — with LinkedIn, YouTube, Pinterest, Reddit, Instagram, TikTok, Facebook, and Threads coming soon as platform approvals come through. We're building toward 16 total. Every platform you can connect is included on the free plan at no extra cost.

We built 12 AI tools into the platform — caption generation, hashtag sets, viral hook writing, post rewriting, thread generation, content repurposing, post scoring, SM-Pulse trend analysis, SM-Radar competitive intelligence, content gap detection, AI content calendar, and AI image generation. All tools are accessible on the free tier through a monthly credit allowance (75 credits/month free, more on paid plans). Credits reset monthly so you always have access — the system is designed to be generous, not to wall things off.

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

- 4 live platforms now: Discord, Bluesky, Telegram, Mastodon (LinkedIn, YouTube, Pinterest, Reddit and more coming soon as approvals clear)
- Unlimited scheduled posts
- 2-week scheduling window
- 2 team seats
- 75 AI credits per month (caption generation, hashtag sets, post scoring, and more — credits reset monthly)
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
  'how-to-schedule-posts-on-bluesky': {
    title:    'How to Schedule Posts on Bluesky in 2026',
    category: 'Guides',
    date:     'Mar 20, 2026',
    readTime: '4 min read',
    excerpt:  'Bluesky is growing fast. Here\'s how to schedule posts, maintain consistency, and grow your following without spending hours online.',
    content: `
## Why Bluesky Scheduling Matters

Bluesky crossed 30 million users in 2024 and has continued growing as users looking for an open, algorithm-light alternative to X/Twitter have moved over. For creators, marketers, and small businesses, Bluesky represents one of the most engagement-friendly platforms available right now — but only if you post consistently.

Most people can't be online at the exact right moment every day. That's where scheduling comes in.

## What You Need to Schedule on Bluesky

To schedule Bluesky posts, you need:

1. A Bluesky account (free at bsky.app)
2. A scheduling tool that supports the AT Protocol (the open standard Bluesky is built on)
3. Your content planned in advance

SocialMate supports Bluesky natively. Connect your account once, and you can compose, schedule, and publish posts from the same dashboard you use for Discord, Telegram, and Mastodon.

## How to Connect Bluesky to SocialMate

1. Sign in at socialmate.studio
2. Go to Settings → Accounts
3. Click "Connect" next to Bluesky
4. Enter your Bluesky handle and an App Password (generated in your Bluesky settings under Privacy & Security)
5. Click Connect

The App Password system means you never give third-party tools your main account password. You can revoke access anytime from within Bluesky.

## Scheduling Your First Bluesky Post

Once connected:

1. Go to Compose in the sidebar
2. Write your post (up to 300 characters on Bluesky)
3. Select Bluesky as your platform (or select multiple platforms to post simultaneously)
4. Click "Schedule" instead of "Post Now"
5. Pick your date and time
6. Confirm

Your post will publish automatically at the scheduled time. If something goes wrong (network issue, token expiry), SocialMate retries and notifies you.

## Best Times to Post on Bluesky

Based on general engagement patterns for decentralized social platforms:

- **Tuesday–Thursday** outperform weekends
- **9–11am and 5–7pm** in your audience's primary time zone tend to perform best
- **Avoid Sunday mornings** — engagement is low across most platforms

SocialMate's Best Times tool analyzes your own post performance over time and tells you exactly when your specific audience is most active. Use it after you've posted 20+ times.

## Cross-Posting to Multiple Platforms

One of the highest-leverage things you can do with a scheduling tool is write a post once and send it to multiple platforms simultaneously. SocialMate lets you compose one post and distribute it to Bluesky, Mastodon, Discord, and Telegram at the same time.

Some notes on cross-posting:
- Bluesky and Mastodon have similar character limits and both reward conversational, direct content
- Discord posts look better with slightly more context (Discord audiences expect threads and conversations, not standalone announcements)
- Telegram works well for longer-form updates

The platform toggles in SocialMate's composer let you customize the message per platform if you want to tweak tone or length.

## Building a Consistent Bluesky Presence

Consistency beats volume on Bluesky. 1 post a day performed better than 5 posts in one day followed by silence. Use the bulk scheduler to upload a week's worth of content at once, then let it run.

The Calendar view in SocialMate shows all your scheduled Bluesky posts at a glance. Drag and drop to reschedule. Add content when you see gaps.

Bluesky's algorithm currently rewards recency and engagement over reach — which means posting consistently and responding to replies matters more than posting volume.
    `,
  },
  'social-media-scheduling-for-small-business': {
    title:    'Social Media Scheduling for Small Businesses: The Practical Guide',
    category: 'Guides',
    date:     'Mar 18, 2026',
    readTime: '5 min read',
    excerpt:  'Small businesses don\'t need a $99/month tool to post consistently. Here\'s a practical system that works without a big budget.',
    content: `
## The Real Problem for Small Businesses

Most small businesses manage social media themselves — the owner, a part-time hire, or whoever has a few extra minutes. The challenge isn't content ideas. It's consistency. It's finding time to post when you're also running everything else.

Scheduling tools were built to solve this. Write content in one focused session. Schedule it across the week. Move on.

The problem is that most scheduling tools are priced for agencies and enterprise teams — not for the coffee shop, the freelance photographer, or the small e-commerce brand trying to stay active on social without a dedicated social media manager.

## What Small Businesses Actually Need

You don't need 15 social accounts managed simultaneously. You don't need a content approval workflow with 8 people. You don't need white-label reports.

What most small businesses need:

- Post scheduling to 3-5 platforms
- A way to batch content creation (write a week's worth in one sitting)
- Basic analytics (what's working, when to post)
- One or two team members with access
- Something that costs under $10/month, or free

That's it. Most scheduling tools charge $50–250/month for those features because they bundle them into enterprise packages. You're paying for complexity you don't need.

## A Simple Social Media System for Small Businesses

**Step 1: Pick 2-3 platforms and commit**

Spreading thin across every platform produces nothing. Pick the platforms where your customers actually spend time. For local businesses: Facebook and Instagram. For B2B: LinkedIn. For tech/creator audiences: Bluesky and Twitter/X. For community-oriented brands: Discord and Telegram.

**Step 2: Block 2 hours on Monday morning**

Use this time to create all your content for the week. Not to post it — to write it, create the visuals, and schedule it. By Monday afternoon, your whole week should be queued and ready.

**Step 3: Use templates**

Most small business social content follows 4-5 patterns: product/service post, behind-the-scenes, customer story, educational tip, call-to-action. Build a template for each. Use AI tools to generate first drafts. Edit to match your voice.

**Step 4: Schedule everything at once**

With SocialMate's bulk scheduler, you can upload a CSV of posts and schedule them all at once. No clicking through 20 individual posts. Upload, review, confirm.

**Step 5: Review once a week**

Check your analytics once per week — not daily. What got engagement? What got ignored? Adjust next week's content based on what you see.

## What SocialMate Costs for Small Businesses

SocialMate's free plan covers most of what a small business needs:

- 4 live platforms (Bluesky, Discord, Telegram, Mastodon) — more platforms shipping throughout 2026
- 100 posts per month
- Bulk scheduler
- 50 AI credits/month for captions and hashtags
- 2 team seats
- Analytics for the last 30 days

If you need more — more posts, more platforms, more team members — the Pro plan is $5/month. That's less than a cup of coffee.

There's no credit card required for the free plan. No trial period. No "free for 14 days, then $99/month."

## The AI Shortcut for Content Creation

The part of social media that takes the most time isn't posting — it's deciding what to say. AI tools solve this.

SocialMate includes a Caption Generator, Viral Hook Generator, Hashtag Suggester, and Post Rewriter. Use them to go from a rough idea to a polished post in under 2 minutes.

Here's the workflow: Take a photo or describe what you want to post. Run it through the Caption Generator. Get 3 options. Edit the best one to sound like you. Done.

At 50 free AI credits per month, that's 50 posts created with AI assistance — enough to post more than once a day.

## Getting Started

1. Create a free account at socialmate.studio
2. Connect your first platform (takes 2 minutes)
3. Schedule your first post
4. Block 2 hours next Monday for your first content batch

The first week of consistent posting is the hardest. After that, it becomes a system.
    `,
  },
  'free-social-media-tools-for-creators': {
    title:    'The Best Free Social Media Tools for Creators in 2026',
    category: 'Resources',
    date:     'Mar 15, 2026',
    readTime: '6 min read',
    excerpt:  'A complete list of free tools for creators — scheduling, analytics, design, and AI — with honest takes on what\'s actually useful.',
    content: `
## Why Free Tools Matter for Creators

Most content creators aren't monetized yet, or are in the early stages where a $50/month tool budget doesn't make sense. The good news: 2026 has more genuinely free tools available than any previous year. The bad news: a lot of "free" tools are actually trials or freemium products with aggressive upsell flows.

This guide covers tools that are either completely free or have free tiers that are actually useful — not just enough to get you hooked.

## Scheduling & Publishing

**SocialMate (free plan)**
Best for: multi-platform scheduling without per-channel fees.
Free tier includes: Bluesky, Discord, Telegram, Mastodon, 100 posts/month, bulk scheduler, 50 AI credits, 2 team seats, analytics, link-in-bio page.
Why it stands out: Most schedulers charge per connected account. SocialMate charges nothing on the free plan regardless of how many accounts you connect.
Link: socialmate.studio

**Buffer (free plan)**
Best for: Instagram and Facebook scheduling.
Free tier: 3 channels, 10 posts per channel.
Honest take: The free tier is very limited. Fine for someone just starting out with 1-2 platforms. Gets expensive fast once you need more.

## AI Writing Tools

**SocialMate AI (included free)**
Included in SocialMate's free plan. Caption generator, viral hook generator, hashtag suggester, post rewriter, thread generator, content calendar, post scoring, and more. 50 credits/month free.

**ChatGPT (free tier)**
Good for: generating first drafts, brainstorming content ideas, rewriting posts in different styles.
Limitation: Doesn't directly integrate with your scheduler. Manual copy-paste workflow.

**Claude.ai (free tier)**
Good for: longer-form content, more nuanced tone matching.
Better than ChatGPT for: staying on-brand, understanding context across a conversation.

## Design

**Canva (free plan)**
The standard for creator design. Templates for every platform and post type. Free tier covers most use cases for individual creators.
Limitation: Some templates and premium elements require a paid account.

**Adobe Express (free plan)**
Similar to Canva. Better integration with Adobe tools if you use Photoshop/Lightroom. Free tier is generous.

## Analytics

**SocialMate Analytics (free)**
Post performance, engagement rates, posting streak, best times to post, platform breakdown. Available in the free plan for the last 30 days of history.

**Native Platform Analytics**
Every platform has free built-in analytics. Bluesky, Twitter/X, LinkedIn, and Instagram all offer engagement data. Not as consolidated as a third-party tool but zero cost.

## Link in Bio

**SocialMate Link in Bio (free)**
Built into SocialMate's free plan. Create a simple landing page with links to all your profiles, content, and CTAs. No Linktree subscription needed.

**Linktree (free plan)**
The most recognized link-in-bio tool. Free tier is functional but limited in customization.

## Hashtag Research

**SocialMate Hashtag Manager (free)**
Save hashtag collections, get AI-generated hashtag suggestions based on your content. Included in the free plan.

## Content Idea Generation

**SocialMate SM-Pulse (free credits)**
Trend scanner that identifies what's getting engagement in your niche right now. Uses your AI credit balance.

**AnswerThePublic (limited free)**
Shows what questions people are searching related to your topic. Useful for content ideas with SEO value.

**Google Trends (completely free)**
Underrated for content creators. Shows seasonal and trending topics. Use it to write content tied to things people are actively searching.

## The Stack That Works for Most Creators

For a creator starting with no budget:

1. **SocialMate** — scheduling, AI tools, analytics, link-in-bio (free)
2. **Canva** — graphics and video thumbnails (free)
3. **ChatGPT or Claude** — content brainstorming and first drafts (free tier)
4. **Google Trends** — content idea research (free)
5. **Native analytics** — platform-specific data (free)

That's a complete toolkit at $0/month. The only thing you'd need to upgrade for is either more volume (more posts, more platforms, longer scheduling windows) or more team seats — both of which are available on SocialMate's $5/month Pro plan when you're ready.
    `,
  },
  'how-to-grow-bluesky-following': {
    title:    'How to Grow Your Bluesky Following in 2026 (What\'s Actually Working)',
    category: 'Growth',
    date:     'Mar 12, 2026',
    readTime: '5 min read',
    excerpt:  'Bluesky rewards genuine interaction over gaming the algorithm. Here\'s what\'s working for creators building audiences there in 2026.',
    content: `
## Bluesky Is Different — That's the Point

Bluesky's growth model is fundamentally different from Twitter/X, Instagram, or TikTok. There's no viral algorithm pushing content to users who don't follow you. There's no "for you page" that rewards posting frequency or using trending audio.

What Bluesky has instead: a transparent, open protocol (AT Protocol), optional algorithmic feeds built by third parties, and an audience that is actively suspicious of tactics that feel manipulative.

This means the playbook that works on TikTok or Instagram doesn't work here. But a different playbook does.

## What's Working on Bluesky Right Now

**1. Being a real person in public**

The highest-performing Bluesky accounts are people who share genuine perspectives, reactions, work-in-progress updates, and opinions. Not polished brand content. Not announcement posts. Actual thoughts.

If you're a developer, show what you're building. If you're a writer, share sentences you're working on. If you run a business, share the reality of what that's like. Bluesky's culture currently rewards transparency.

**2. Consistency over volume**

One quality post per day outperforms five posts on one day followed by a week of silence. Bluesky's feed is chronological by default — timing matters more than it does on algorithmic platforms.

Scheduling tools help with this. Use SocialMate to queue content for the week, then let it run. Your audience will start to expect your posts.

**3. Replying to other people**

The fastest way to get followers on Bluesky isn't to post great content and wait. It's to reply to other people's posts with substance. Find threads in your niche. Add to the conversation. When someone reads your reply and finds it interesting, they check your profile. If your profile has consistent content they like, they follow.

High-effort replies are currently the highest-ROI activity on Bluesky.

**4. Using Starter Packs**

Bluesky's Starter Packs feature lets users follow a curated list of accounts in one click. Getting included in a popular Starter Pack in your niche can produce a significant follower spike. To get included: be active, post consistently, and connect with people who run Starter Packs in your area.

**5. Cross-posting from other platforms — selectively**

Content that performs well on other platforms can be republished on Bluesky, but context matters. A thread that works on X/Twitter might need to be trimmed for Bluesky's culture. A personal story that did well on LinkedIn can be adapted for Bluesky with a more casual tone.

SocialMate's cross-posting feature lets you write once and distribute to multiple platforms. Use it for evergreen content, but tweak for platform culture.

## What Doesn't Work on Bluesky

**Follow-for-follow**: Bluesky users don't engage with this tactic. Most will follow back and then mute you.

**Engagement bait ("comment below")**: Works poorly. Bluesky's community tends to be skeptical of manufactured engagement.

**Pure promotional content**: Announcement-only accounts don't grow on Bluesky. Mix promotion with genuine content.

**Posting and ghosting**: Not responding to replies signals you're broadcasting, not participating. Even a short "thanks for this" reply makes a difference.

## Tracking Your Bluesky Growth

SocialMate's Analytics dashboard shows your posting streak, engagement rates per platform, and best times to post based on your actual performance data.

Check it weekly (not daily — daily analytics lead to overthinking). Look for:
- Which posts got the most engagement — what did they have in common?
- What time of day your Bluesky posts tend to perform best
- Your posting frequency — are you consistent?

Adjust based on what you see. Growth on Bluesky is slower than TikTok but the audience is more engaged, more loyal, and more likely to convert to newsletter subscribers, customers, or collaborators.

## A Realistic Timeline

Week 1-4: Connect with your first 50 followers. This is the hardest part. Post daily. Reply to others.
Month 2-3: 50-200 followers. Your replies are producing follow-backs. Your content is finding its voice.
Month 4-6: 200-1,000 followers if consistent. Starter Pack inclusions start happening. Content occasionally breaks out.

Slow by Instagram standards. But these followers actually read what you write.
    `,
  },
  'social-media-scheduling-vs-posting-manually': {
    title:    'Scheduling vs. Posting Manually: Which Is Better for Social Media?',
    category: 'Tips',
    date:     'Mar 10, 2026',
    readTime: '4 min read',
    excerpt:  'The debate has been settled by data. Here\'s when to schedule, when to post live, and how to combine both for maximum impact.',
    content: `
## The Debate

There's a recurring argument in social media circles about scheduling: some people swear by posting in real time because it feels more authentic. Others batch everything and schedule a week out.

Both sides have valid points. The answer, like most things in marketing, is "it depends on what you're trying to do."

## The Case for Scheduling

**Consistency**: The biggest benefit of scheduling is not having to remember to post. Consistency matters more than timing on most platforms. An audience that sees you every weekday grows faster than one that sees you 5 times one week and zero the next.

**Batching is more efficient**: Writing 7 posts in a focused 90-minute session is more efficient than writing 1 post every morning while your coffee cools. Creative work has setup cost — you get into a flow when doing a batch and the quality goes up.

**Time zone coverage**: If your audience is split across time zones, scheduling lets you reach them at optimal times without being awake at 3am. A post scheduled for 9am EST reaches your US East Coast audience at peak morning, your West Coast audience before they start work, and your European audience in the afternoon.

**Stress reduction**: Knowing your content is handled for the week reduces the daily anxiety of "I haven't posted today." That cognitive load compounds over time.

## The Case for Manual Posting

**Reacting to news and trends**: Some content needs to go out now. If something happens in your industry or the news that's directly relevant to your audience, scheduling doesn't help. The window for timely content is often hours, not days.

**Authentic engagement bait**: Posting and then immediately being in the comments for the first hour of a post's life dramatically increases engagement. Algorithms on most platforms reward early engagement velocity. If you schedule something and then miss the first hour, you lose that.

**Personal and spontaneous content**: Some of the best-performing content feels spontaneous because it is — a thought you had while walking, a reaction to something that just happened. That can't be scheduled.

## The Best Approach: Scheduled Foundation + Manual Layer

The highest-performing social media accounts use a hybrid approach:

**Scheduled (70% of content):**
- Regular educational posts, tips, guides
- Product/service updates that are planned
- Repurposed content from other formats
- Evergreen content that doesn't need to be timely

**Manual (30% of content):**
- Reactions to breaking news
- Behind-the-scenes and spontaneous moments
- Replies and conversation-starting comments on others' posts
- Anything that's time-sensitive

The scheduled content keeps you consistent and handles the bulk of your volume. The manual content keeps you feeling human and timely.

## How to Set This Up

With SocialMate, build your scheduled queue on Monday morning: compose 5-7 posts, spread them across the week, and schedule them. That's your foundation.

During the week, any time you have an impulse to post something timely, go to Compose and hit "Post Now" — it bypasses the scheduling flow entirely.

Check your calendar once a day (30 seconds) to confirm nothing needs to be changed.

That's it. 90 minutes on Monday + a few minutes of opportunistic posting throughout the week = a consistent, human, engaged social presence.

## What About Engagement Timing?

One practical note: most scheduling tools publish exactly at the scheduled time but don't automatically engage with the replies. Block 15-20 minutes after your most important scheduled posts to reply to comments. That engagement window is as important as the post itself.

SocialMate's Best Times feature tells you when your specific audience is most active, so you can schedule posts to go out at those times and then be ready to engage when they do.
    `,
  },

  'socialmate-gives-back-sm-give': {
    title:    'How SocialMate Gives Back: Introducing SM-Give',
    category: 'Our Story',
    date:     'Apr 1, 2026',
    readTime: '3 min read',
    excerpt:  'Every subscription, every donation, every unclaimed affiliate check — a piece goes to real people who need it most.',
    content: `
## A Tool With a Mission

SocialMate was built from nothing. No investors. No funding rounds. No safety net. Just a deep belief that tools like this should exist for people who don't have enterprise budgets.

That same belief — that resources should reach the people who need them most — drives SM-Give.

## What SM-Give Is

SM-Give is SocialMate's built-in giving program. It's not a marketing campaign. It's not a promise we'll fulfill "someday." It's baked into how the business works from day one.

Three things happen automatically:

**2% of every subscription** goes directly to SM-Give. Every paid plan — Pro at $5/month, Agency at $20/month — contributes a slice to the program monthly, after Stripe fees and applicable taxes.

**50% of every voluntary support donation** on the Story page goes directly to SM-Give. If someone believes in what we're building and chips in, half of that goes to something even more tangible.

**75% of unclaimed affiliate commissions** fund SM-Give. Affiliates who miss the payout deadline each cycle forfeit their balance. Rather than keeping it, we send 75% to charity.

## Where the Money Goes

Three areas. No corporate charity fluff — just direct impact.

**School Supply Bookbags.** Fully stocked backpacks for kids at underprivileged schools. Real supplies — notebooks, pencils, folders, crayons, scissors, rulers. Not dollar-store fillers. We believe a child shouldn't walk into their first day of school without the tools to learn.

**Diaper Bags for Struggling Parents.** Quality essentials for new parents who are struggling — especially single parents. Real diapers, real wipes, real baby clothes. Not cheap onesies. Something a new parent can actually use.

**Homeless Care Packages.** Hygiene essentials, socks, warm beanies, snacks, a handwritten note. Distributed through local shelters and outreach organizations. Because dignity matters.

## Why 2% and Not More?

Honesty. We need to be able to sustain this program long-term, which means accounting for infrastructure costs, Stripe fees, taxes, and everything it takes to operate. We're not a nonprofit — we're a bootstrapped company with a giving program built in.

2% is a real number. It's not the largest number. But it's a number we can honor every month, regardless of how big or small the month is, and grow over time as the product grows.

## This Doesn't Make SocialMate a Charity

SocialMate is still a product built to help creators and small businesses. SM-Give doesn't change that. It just means that when you use SocialMate — when you schedule a post, upgrade your plan, or refer someone — a piece of that goes somewhere that matters.

We think that's the right way to build.
    `,
  },

  'discord-scheduling-grow-your-server': {
    title:    'How to Schedule Discord Posts and Grow Your Server in 2026',
    category: 'Guides',
    date:     'Apr 1, 2026',
    readTime: '5 min read',
    excerpt:  'Discord isn\'t just for gaming anymore. Here\'s how to use scheduled posts to keep your community engaged daily.',
    content: `
## Discord Has a Content Problem

Most Discord servers go quiet. There's a flurry of activity at launch, a gradual decline in messages, and eventually the server becomes a ghost town that the owner is too embarrassed to archive.

The root cause is almost always the same: there's no consistent content. The community has nowhere to rally around, nothing to respond to, no rhythm to the space.

Scheduled posts fix this.

## Why Discord Scheduling Is Different

Unlike Twitter or Instagram, Discord is built for conversation. When you post to a channel, you're not broadcasting — you're starting a thread. That means scheduled posts on Discord work best when they're designed to get responses, not just be read.

The best Discord content formats for scheduled posting:
- **Daily check-in questions** — "What are you working on today?" in your #general channel at 9 AM
- **Weekly showcase prompts** — "Share what you built this week" in your #share channel every Friday
- **Resource drops** — One useful link, tool, or tip posted consistently in #resources
- **Polls and votes** — What to name something, what feature to build next, what collab to pursue

## How to Schedule Discord Posts with SocialMate

SocialMate connects directly to Discord via webhooks. Here's the setup:

**Step 1: Create a webhook in your Discord server.**
Go to your server settings → Integrations → Webhooks → New Webhook. Copy the webhook URL.

**Step 2: Add the webhook as a destination in SocialMate.**
Go to Accounts → Destinations → Add Destination → Select Discord → paste your webhook URL → name the channel and save.

**Step 3: Compose and schedule.**
Open the Compose screen, write your post, select Discord, choose your channel destination, pick a date and time, and hit Schedule. SocialMate's Inngest-powered scheduler handles the rest — even if you close the browser.

## What to Schedule and When

The goal isn't to post more — it's to post consistently at the right times.

**Best times for Discord:** Mid-morning (9-11 AM) and early evening (7-9 PM) in your community's main time zone. If your server is international, pick a time that works for two major regions and rotate.

**Best cadence:** 1-2 scheduled posts per day max. Discord feels different when it's being used naturally versus when it feels like a broadcast channel. Don't over-automate.

**Types of posts to automate:**
- Community rituals (daily questions, weekly wins)
- Announcements and product updates
- Content drops (links, resources, guides)

**Types of posts to never automate:**
- Replies to members
- Reactions to current events
- Personal check-ins

## Growing Your Server With Consistent Content

Consistency does two things for Discord growth:

First, it gives members a reason to come back. If they know every Monday morning there's a discussion thread in #strategy, some members will make that a habit. Habits drive retention.

Second, it gives you something to promote. "We post daily in our Discord" is a better value proposition than "join our Discord." Consistent content is the thing you invite people into.

**The 30-day plan:**
- Week 1: Set up your content calendar. Schedule one post per day for the first two weeks.
- Week 2: Monitor which posts get the most replies. Double down on those formats.
- Week 3: Promote your Discord in your other channels. "We're discussing X in the Discord this week."
- Week 4: Review engagement. Cut what didn't land. Add what did.

## One More Thing

SocialMate supports media attachments on Discord posts — images, videos, and files. If you're running a creative community, schedule posts with example work, inspiration, or WIPs. Visual content consistently outperforms text-only in Discord channels.
    `,
  },

  'mastodon-scheduling-free-tool': {
    title:    'How to Schedule Mastodon Posts for Free (No Paid Tools)',
    category: 'Guides',
    date:     'Apr 1, 2026',
    readTime: '4 min read',
    excerpt:  'Mastodon has no algorithm — which means consistency is everything. Here\'s a free way to stay consistent.',
    content: `
## The Mastodon Consistency Challenge

Mastodon doesn't have an algorithm that amplifies your posts when you're not online. There's no "for you" page showing your content to strangers hours after you posted. If you're not posting when people are looking at their feeds, you're invisible.

This makes consistency more important on Mastodon than almost anywhere else.

The problem: most creators post in bursts. A flurry of toots during a productive week, then silence for two weeks. That pattern kills Mastodon growth.

Scheduling solves it.

## What Mastodon Scheduling Actually Does

When you schedule a post for Mastodon, you're not just picking a time — you're committing to being present in the feed at a moment when your audience is actively scrolling. Mastodon users tend to be habitual: they check their feed at the same times each day.

Scheduled posts let you:
- Show up consistently without being chained to a posting schedule
- Front-load content creation to your most productive times
- Post at optimal times regardless of your time zone

## How to Connect Mastodon to SocialMate

SocialMate connects to any Mastodon instance via OAuth — not just mastodon.social. If you're on fosstodon.org, hachyderm.io, infosec.exchange, or any other instance, the connection process is the same.

**Step 1:** Go to Accounts in SocialMate and click "Connect Mastodon."

**Step 2:** Enter your instance URL (e.g., mastodon.social or fosstodon.org).

**Step 3:** Authorize SocialMate in the OAuth flow on your instance.

That's it. Your account is connected. SocialMate stores your OAuth token securely and uses it for every scheduled post.

## The 500 Character Limit Is a Feature

Mastodon's default 500-character limit (some instances allow more) forces you to be direct. It's easy to schedule posts on Mastodon because there's a natural length ceiling — you can't write a novel.

Mastodon content that performs well:
- **Takes and opinions** — Mastodon rewards genuine perspective. Say something you actually believe.
- **Questions** — The Mastodon community is engaged and will reply. "What are you working on?" gets answers.
- **Links with context** — Don't just paste a URL. Add 2-3 sentences on why it matters.
- **Short threads** — Some instances support threaded toots. Start a thread with your main point and expand in replies.

## Best Posting Times for Mastodon

Mastodon's audience skews toward tech, creative, and academic communities. Based on engagement patterns:

- **Morning (7-9 AM UTC):** European users are most active
- **Afternoon (1-3 PM UTC):** Transatlantic peak — both European and early US users
- **Evening (6-9 PM UTC):** US prime time

If you're growing a specific niche (dev, design, writing), check when the active users in your instance tend to engage. Your instance's local feed is a good signal.

## A 30-Day Consistency Plan for Mastodon

**Week 1:** Schedule 2 posts per day — morning and afternoon. Mix opinions with questions.

**Week 2:** Identify which formats get the most boosts and replies. Double down.

**Week 3:** Add one thread per week — a longer-form take broken into 4-5 connected toots.

**Week 4:** Review your follower growth. Consistent posters on Mastodon typically see 10-25% follower growth in the first month compared to irregular posters.

## The Free Part

SocialMate's free plan includes Mastodon scheduling with a 2-week scheduling window and unlimited scheduled posts. You don't need a paid plan to maintain a consistent Mastodon presence.

If you want to schedule further ahead (up to 3 months on the Agency plan), that's available on Pro and above — but for most Mastodon creators, two weeks is plenty.
    `,
  },

  'how-to-repurpose-content-across-platforms': {
    title:    'How to Repurpose Content Across 4 Platforms Without Burning Out',
    category: 'Tips',
    date:     'Apr 1, 2026',
    readTime: '5 min read',
    excerpt:  'You don\'t need four different content strategies. One post, four platforms, zero burnout — here\'s the system.',
    content: `
## The Multi-Platform Mistake

Most creators who try to post on multiple platforms burn out within three months. The reason is almost always the same: they're treating each platform as a separate content machine that requires original posts, separate writing sessions, and a different brain for each one.

That's not sustainable. And it's not necessary.

The fix is a repurposing system — a single piece of content broken down and adapted for each platform rather than created from scratch.

## The Core Concept: One Idea, Four Formats

Every piece of content starts as an idea, not a post. When you think in ideas instead of posts, repurposing becomes natural.

Here's an example. The idea: "People overthink their content strategy."

- **Bluesky (300 chars):** "Most people are spending 80% of their time optimizing a strategy and 20% actually posting. Flip that. The algorithm rewards volume, not perfection."
- **Mastodon (500 chars):** Same core idea with an additional supporting point — add what you'd tell someone who asked "but what about quality?"
- **Telegram:** The full take — two or three paragraphs, written conversationally, like a newsletter entry.
- **Discord:** A question version — "Do you over-plan your content or under-plan it?" — designed to start a conversation.

Same idea. Four different executions. One writing session.

## How to Build Your Repurposing System

**Step 1: Write the long version first.**

Write your full thought — as long as it needs to be. Don't edit for platform yet. Just get the idea out. This becomes your source material.

**Step 2: Extract the core sentence.**

What's the one sentence that contains the entire point? That's your Bluesky post (or the first line of a Bluesky thread).

**Step 3: Expand for Mastodon.**

Take the core sentence and add one supporting point. Stay under 500 characters. Don't add fluff — just the most useful expansion of the idea.

**Step 4: Use the full version for Telegram.**

Telegram's format is conversational and long-form friendly. Paste your full thought, break it into short paragraphs, and add a question at the end to drive replies.

**Step 5: Convert to a conversation starter for Discord.**

Take the core idea and reframe it as a question or prompt. "What do you think about X?" or "Have you tried Y?" Discord rewards posts that get replies, not statements.

## The SocialMate Workflow

SocialMate's compose screen lets you write once and post to multiple platforms simultaneously. Here's the workflow:

1. Write your full version in the compose area
2. Select all four platforms (Discord, Bluesky, Mastodon, Telegram)
3. Post it directly, or schedule it for your optimal time

For platform-specific versions, create separate drafts and use SocialMate's AI Caption Rewriter to adapt tone for each platform without rewriting from scratch.

## Common Repurposing Mistakes

**Posting the identical text everywhere.** Each platform has norms. Twitter/X and Bluesky reward short and punchy. Mastodon rewards thoughtful and slightly longer. Telegram and Discord reward conversational and personal. Identical text on all four feels off and gets ignored.

**Changing content but not format.** A wall-of-text paragraph that works on Telegram will get skipped on Bluesky. Format matters as much as content.

**Repurposing too fast.** If you post the same idea across all platforms within an hour, followers who are on multiple platforms will see it duplicated. Stagger by 24-48 hours.

## The Sustainable Schedule

A repurposed content system lets you maintain 4 platforms with 2-3 writing sessions per week. The math:

- Monday writing session → Post on Discord and Bluesky Monday, Mastodon and Telegram Tuesday
- Wednesday writing session → Post Wednesday/Thursday across platforms
- Friday writing session → Weekend posts across platforms

That's 4 platforms, 6-8 posts per week, 3 sessions. Fully sustainable without a team.

SocialMate's scheduling queue handles the spacing automatically once you've created the posts. Set it and forget it.
    `,
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  Strategy:  'bg-purple-50 text-purple-600',
  Industry:  'bg-blue-50 text-blue-600',
  Guide:     'bg-green-50 text-green-600',
  Guides:    'bg-green-50 text-green-600',
  Tips:      'bg-green-50 text-green-600',
  Analytics: 'bg-yellow-50 text-yellow-700',
  Resources: 'bg-blue-50 text-blue-600',
  Growth:    'bg-pink-50 text-pink-600',
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
          <Link href="/features"    className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
          <Link href="/pricing"     className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/studio-stax" className="hover:text-black dark:hover:text-white transition-colors">Studio Stax</Link>
          <Link href="/roadmap"     className="hover:text-black dark:hover:text-white transition-colors">Roadmap</Link>
          <Link href="/blog"        className="font-bold text-black dark:text-white">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/give"   className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all hidden sm:block">❤️ Give</Link>
          <Link href="/login"  className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors hidden sm:block">Sign in</Link>
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

      {/* SM-Give strip */}
      <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-10 pb-4">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ❤️ <span className="font-semibold text-gray-700 dark:text-gray-300">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
            <a href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Learn about SM-Give →</a>
          </p>
        </div>
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
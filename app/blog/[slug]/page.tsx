import Link from 'next/link'
import { notFound } from 'next/navigation'

const POSTS: Record<string, {
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  content: string
}> = {
  'buffer-alternative-free': {
    title: 'The Best Free Buffer Alternative in 2026',
    category: 'Comparison',
    date: 'Feb 28, 2026',
    readTime: '5 min read',
    excerpt: 'Buffer charges $6 per social channel per month. Here\'s how SocialMate gives you all 16 platforms completely free — and why thousands are switching.',
    content: `
## Why People Are Leaving Buffer

Buffer used to be the go-to social media scheduler. Simple, clean, reliable. But over the past few years, something changed: the pricing.

Today, Buffer charges $6 per social channel per month. If you manage 5 platforms — Instagram, Twitter, LinkedIn, Facebook, TikTok — that's $30/month. Managing 10 platforms? $60/month. And that's before you add team members, analytics, or any of the features that actually matter.

For individual creators and small businesses, that adds up fast. $360–$720 per year just to schedule posts.

## What SocialMate Does Differently

SocialMate was built on a simple premise: social media scheduling shouldn't cost more than the platforms themselves.

Here's what you get on the free plan:

**All 16 platforms included.** Instagram, X/Twitter, LinkedIn, TikTok, Facebook, Pinterest, YouTube, Threads, Snapchat, Bluesky, Reddit, Discord, Telegram, Mastodon, Lemon8, and BeReal. Every single one. No per-channel fees.

**Unlimited scheduled posts.** Buffer's free plan limits you to 10 scheduled posts per channel. SocialMate has no post limits — ever.

**Bulk Scheduler.** Plan and schedule 50 posts at once. Buffer charges extra for this. We don't.

**Real analytics.** See your posting frequency, best times, platform breakdown, and consistency score — all from your actual data.

**Team collaboration.** Buffer charges $12 per user per month for team features. SocialMate includes unlimited team members at no cost.

**Link in Bio builder.** A full Linktree alternative built right in. No extra app, no extra subscription.

## The Real Cost Comparison

Let's say you're a social media manager handling accounts for a small business. You need 8 platforms and 2 team members.

Buffer: 8 channels × $6 = $48/month + 2 users × $12 = $24/month = **$72/month ($864/year)**

SocialMate: **$0/month**

That's $864 in annual savings — just from switching schedulers.

## What About Buffer's Strengths?

Buffer has been around longer and has deeper integrations with some platforms. Its analytics are well-designed. And if you're already deeply embedded in Buffer's workflow, there's a switching cost.

But for anyone starting fresh or feeling the pinch of Buffer's pricing, SocialMate gives you more features at zero cost.

## How to Switch from Buffer to SocialMate

1. Create a free SocialMate account (no credit card needed)
2. Complete the 5-step onboarding to set up your platforms
3. Export your scheduled posts from Buffer if needed
4. Re-schedule through SocialMate's Bulk Scheduler
5. Cancel Buffer before your next billing date

The whole process takes about 20 minutes. And you'll never pay a per-channel fee again.
    `,
  },
  'hootsuite-alternative': {
    title: 'Why Hootsuite Users Are Switching to SocialMate',
    category: 'Comparison',
    date: 'Feb 25, 2026',
    readTime: '4 min read',
    excerpt: 'Hootsuite starts at $99/month. SocialMate gives you more features — bulk scheduling, link in bio, team collaboration — for free.',
    content: `
## The Hootsuite Price Shock

If you've looked at Hootsuite's pricing recently, you've probably had the same reaction as everyone else: $99 per month. That's $1,188 per year for a social media scheduler.

Hootsuite justifies this with enterprise features, deep analytics, and a long track record. And for large agencies managing dozens of clients, it might be worth it.

But for the vast majority of users — individual creators, small businesses, startups — paying $1,188/year to schedule Instagram posts is genuinely hard to justify.

## What You Actually Get with Hootsuite's $99 Plan

- Up to 10 social accounts
- 1 user (yes, just 1 — team features cost extra)
- Unlimited scheduling
- Basic analytics
- No AI tools on the base plan
- No Link in Bio included

## What SocialMate Gives You for Free

- 16 social platforms
- Unlimited users
- Unlimited scheduling
- Bulk Scheduler (50 posts at once)
- AI caption generator (15 credits/month)
- Full analytics dashboard
- Best Times to Post heatmap
- Link in Bio builder
- Hashtag Collections
- Post Templates
- Media Library
- Global Search

The feature set isn't comparable. SocialMate's free plan beats Hootsuite's $99 plan in almost every category that matters to individual users and small teams.

## Who Should Still Use Hootsuite

Hootsuite makes sense for large enterprises that need deep CRM integrations, compliance features, and dedicated account management. If you're managing 50+ social accounts across a large organization, Hootsuite's enterprise infrastructure has real value.

For everyone else, there's SocialMate.

## Making the Switch

Create a free account at SocialMate, connect your platforms through the Accounts page, and start scheduling. The onboarding flow gets you set up in under 5 minutes. No credit card, no trial period, no catch.
    `,
  },
  'free-linktree-alternative': {
    title: 'Stop Paying for Linktree — Build Your Bio Page Free',
    category: 'Tips',
    date: 'Feb 22, 2026',
    readTime: '3 min read',
    excerpt: 'Linktree charges $10–$24/month for a branded bio page. SocialMate includes a full Link in Bio builder at zero cost.',
    content: `
## The Linktree Tax

Linktree is the most popular "link in bio" tool in the world. It's also become one of the most unnecessary subscriptions for creators and businesses.

The free Linktree plan is deliberately limited — no custom colors, no analytics, Linktree branding everywhere. To remove that branding and get basic customization, you're paying $9/month. For a page with links on it.

The Pro plan is $24/month. That's $288/year to host a list of links.

## SocialMate's Link in Bio — What You Get Free

SocialMate includes a full Link in Bio builder as part of the free plan. Here's what that means:

**Custom username.** Your page lives at socialmate-six.vercel.app/yourusername — clean, shareable, yours.

**Full visual customization.** Choose from 8 backgrounds including gradients, set your button style (rounded, pill, square, soft), add your avatar and bio.

**Unlimited links.** Add as many links as you want, reorder them by drag-and-drop, toggle any link on or off without deleting it.

**Social icons.** Link your Instagram, Twitter, LinkedIn, TikTok, and more with one-click icon buttons above your links.

**Live preview.** See exactly how your page looks before publishing.

## How to Set Up Your Bio Page

1. Go to Link in Bio in your SocialMate sidebar
2. Set your username (this becomes your public URL)
3. Add your display name, bio, and avatar
4. Choose your background and button style
5. Add your links with titles, URLs, and optional emoji icons
6. Hit Save — your page is live instantly

The whole thing takes about 3 minutes. And it costs exactly $0.

## Cancel Linktree Today

If you're currently paying for Linktree, here's a quick migration plan:

- Screenshot your current Linktree links
- Set up your SocialMate bio page
- Update your Instagram/TikTok bio URL to your new SocialMate URL
- Cancel Linktree before your next billing date

Save $108–$288 per year. Spend it on something better.
    `,
  },
  'bulk-scheduling-guide': {
    title: 'How to Schedule 30 Days of Content in 2 Hours',
    category: 'Strategy',
    date: 'Feb 18, 2026',
    readTime: '6 min read',
    excerpt: 'The bulk scheduling workflow top creators use to plan a full month of social content in a single session — without burning out.',
    content: `
## The Content Treadmill

Most creators post reactively. Something happens, they post about it. They feel inspired, they write a caption. They remember they haven't posted in 3 days, they throw something together in 10 minutes.

This works until it doesn't. And then it stops working all at once — burnout, inconsistency, declining reach.

The top creators don't work this way. They batch.

## What Batching Actually Means

Batching means setting aside one dedicated session — usually 2–4 hours — to create and schedule all your content for the next 30 days. Then you don't think about social media again until next month.

The cognitive benefits are enormous. Context-switching between creative work and scheduling work is expensive. When you batch, you stay in creative mode the entire time. Ideas flow faster. Captions write themselves. You produce more in 2 hours than you would in 10 hours of reactive posting.

## The Exact Workflow

**Step 1: Content Pillars (15 minutes)**

Before you write a single caption, define your 3–5 content pillars for the month. These are the recurring themes you'll post about. Examples:

- Educational tips about your industry
- Behind-the-scenes content
- Product or service highlights
- User stories or testimonials
- Personal/lifestyle content

Aim for 6 posts per pillar per month. That's 30 posts total.

**Step 2: Batch Writing (60 minutes)**

Open SocialMate's Compose page and start writing. Don't edit. Don't second-guess. Write all 30 captions in one sitting. Use your content pillars as prompts. Use the AI caption generator when you're stuck.

Save each one as a draft. Don't worry about scheduling yet.

**Step 3: Media Matching (20 minutes)**

Upload all your images and videos to the Media Library. Then go through your drafts and attach the right media to each post.

**Step 4: Bulk Scheduling (25 minutes)**

Open the Bulk Scheduler. Select all 30 drafts. Assign posting times based on your Best Times to Post data. Spread them across the month. Hit schedule.

You're done.

**Step 5: Review (10 minutes)**

Open the Calendar view and scan the month. Make sure the content mix looks right — not too many promotional posts in a row, variety in formats, no weird gaps.

## What to Do for the Rest of the Month

Nothing. Check your notifications for any posts that need attention. Respond to comments. That's it.

The content machine runs itself.

## Getting Started

If you've never batched content before, start with 2 weeks instead of a full month. 15 posts is more manageable and you'll still feel the difference immediately.

Use SocialMate's Bulk Scheduler to handle the scheduling. It's built exactly for this workflow — select multiple posts, assign times, done.
    `,
  },
  'best-times-to-post': {
    title: 'The Best Times to Post on Every Social Platform in 2026',
    category: 'Strategy',
    date: 'Feb 14, 2026',
    readTime: '7 min read',
    excerpt: 'Platform-by-platform breakdown of peak engagement windows — backed by data, not guesswork. Plus how to find your own best times.',
    content: `
## Why Timing Actually Matters

Post the same content at 3am versus 9am and you'll get completely different results. The algorithm doesn't care when you post — but it does care about early engagement. If your post gets strong likes, comments, and shares in the first 30–60 minutes, the algorithm pushes it to more people. Miss that window and the post quietly dies.

Timing is how you stack the deck in your favor.

## Platform-by-Platform Breakdown

**Instagram**
Peak times: Tuesday–Thursday, 8–10am, 11am–1pm, 7–9pm
Instagram audiences are most active during morning routines and evening wind-downs. Weekday lunch breaks also perform well. Avoid Sunday mornings and late nights.

**X / Twitter**
Peak times: Monday, Wednesday, Thursday, 8–10am, 12–1pm, 5–6pm
Twitter is a real-time platform. Commute hours and lunch breaks are prime. News cycles drive a lot of engagement — post around breaking moments in your niche.

**LinkedIn**
Peak times: Tuesday–Thursday, 7–9am, 12–1pm, 5–6pm
LinkedIn is a professional network used during work hours. Early morning before meetings and lunch breaks are gold. Weekends are essentially dead.

**TikTok**
Peak times: Tuesday, Thursday, Friday, 6–10am, 7–9pm, 10–11pm
TikTok has two distinct peaks — early morning commuters and late evening scrollers. The algorithm is powerful enough that timing matters less than on other platforms, but it still helps.

**Facebook**
Peak times: Wednesday–Friday, 9am–12pm, 1–3pm
Facebook skews older and is used during work breaks. Mid-morning and early afternoon drive the most engagement. Weekends are inconsistent.

**Pinterest**
Peak times: Saturday–Sunday, 8–11pm, 2–4pm
Pinterest is a weekend platform. Users plan recipes, home projects, and purchases on weekends. Evening is prime time.

**LinkedIn**
Best days: Tuesday, Wednesday, Thursday. Worst days: Saturday, Sunday.

## The Most Important Rule: Find YOUR Best Times

Industry data is a starting point, not a prescription. Your specific audience might behave completely differently from the averages.

SocialMate's Best Times to Post feature shows you a heatmap of when YOUR posts get the most engagement — based on your actual posting history. After you've posted 20–30 times, patterns emerge. Use those patterns, not generic advice.

## How to Use This Information

1. Start with the industry recommendations for your main platforms
2. Schedule posts consistently for 30 days
3. Check your Best Times heatmap in SocialMate
4. Adjust your schedule based on your real data
5. Repeat

Within 60 days you'll have a posting schedule optimized for your specific audience. No guessing required.
    `,
  },
  'social-media-team-collaboration': {
    title: 'How to Manage Social Media as a Team Without Paying Per Seat',
    category: 'Teams',
    date: 'Feb 10, 2026',
    readTime: '4 min read',
    excerpt: 'Buffer and Hootsuite charge $12–$15 per user per month for team features. Here\'s how teams are managing social content together for free.',
    content: `
## The Per-Seat Pricing Problem

Social media management is increasingly a team sport. Brands have content creators, copywriters, strategists, and approvers all touching the same content pipeline. But most scheduling tools treat team collaboration as a premium upsell.

Buffer: $6/channel + $12/user. A team of 3 managing 5 platforms costs $66/month.
Hootsuite: Team plans start at $249/month for 3 users.

For small businesses and agencies, these costs are significant.

## Roles That Actually Work

Effective social media teams typically have 3–4 distinct roles:

**Owner:** Full access. Sets strategy, manages billing, controls team membership.

**Admin:** Can do everything except manage billing. Ideal for senior social media managers.

**Editor:** Can create, schedule, and edit posts. Can't manage team members or settings. Ideal for content creators and copywriters.

**Viewer:** Read-only access. Useful for clients who want visibility without the ability to accidentally change anything.

SocialMate supports all four roles with appropriate permission levels — and adding team members is free regardless of how many you add.

## The Collaborative Workflow

Here's how effective social media teams use SocialMate together:

**Content creators (Editor role)** write captions, save them as drafts, and attach media from the shared Media Library. They use Post Templates to maintain brand voice consistency.

**Strategists (Admin role)** review drafts, schedule them at optimal times, and manage the content calendar.

**Clients or stakeholders (Viewer role)** can log in to see what's scheduled without touching anything.

**The Owner** monitors analytics, adjusts strategy, and manages platform connections.

## Setting Up Your Team

1. Go to Team in your SocialMate sidebar
2. Enter your colleague's email and select their role
3. Send the invite — they'll receive an email to join
4. They create their account and land directly in your workspace

The whole setup takes 2 minutes per person. And unlike Buffer and Hootsuite, adding your 5th, 10th, or 20th team member costs exactly the same as adding your first: nothing.
    `,
  },
  'instagram-scheduling-guide': {
    title: 'The Complete Guide to Scheduling Instagram Posts in 2026',
    category: 'Guides',
    date: 'Feb 6, 2026',
    readTime: '8 min read',
    excerpt: 'Everything you need to know about scheduling Instagram posts, Reels, and Stories — including the tools that make it effortless.',
    content: `
## Does Scheduling Instagram Posts Hurt Reach?

Let's address this upfront because it's the most common question: no, scheduling Instagram posts does not hurt your reach or engagement. This myth has been thoroughly debunked. Instagram's algorithm cares about content quality and early engagement — not whether you wrote the caption live or scheduled it three days ago.

Schedule away.

## What You Can Schedule on Instagram

**Feed posts:** Photos and carousels. Full scheduling support with captions, hashtags, and first comments.

**Reels:** Short-form video. Caption and hashtag scheduling supported. Thumbnail selection varies by tool.

**Stories:** More limited scheduling support across tools. Best practice is to schedule the reminder and post manually.

**Lives:** Can't be scheduled — by definition.

## The Optimal Instagram Posting Schedule

For most accounts, 4–5 feed posts per week is the sweet spot. More than that and quality starts to suffer. Less than 3 per week and the algorithm deprioritizes your account.

Reels should be 2–3 per week. They get significantly more reach than regular feed posts right now — Instagram is still heavily promoting Reels to compete with TikTok.

Stories should be daily if possible. They keep you at the top of your followers' feeds and drive direct engagement.

## Hashtag Strategy for 2026

Instagram's hashtag landscape has changed significantly. The old advice of using all 30 hashtags is outdated. Current best practices:

- Use 5–10 highly relevant hashtags
- Mix popular tags (1M+ posts) with niche tags (10K–100K posts)
- Create a branded hashtag for your community
- Save your best hashtag combinations as collections in SocialMate for one-click insertion

## The Scheduling Workflow

1. Write your caption in SocialMate's Compose page
2. Select Instagram (and any other platforms you're cross-posting to)
3. Watch the character counter — Instagram allows 2,200 characters
4. Add your hashtags from your saved Hashtag Collections
5. Attach your image or video from the Media Library
6. Set your posting time based on your Best Times data
7. Schedule

That's it. The post goes live automatically at the time you set.

## Cross-Posting to Other Platforms

Instagram content often works well on Threads, Facebook, and Pinterest with minor adjustments. SocialMate lets you select multiple platforms in a single compose session — write once, customize per platform, post everywhere.

Use the per-platform character counter to make sure each version is optimized for its destination.

## Building a Month of Instagram Content

The most effective Instagram accounts batch their content creation. Set aside 2 hours once a month, write 15–20 captions, match them to your media library, and schedule the whole month using the Bulk Scheduler.

Your Instagram presence runs on autopilot. Your engagement stays consistent. Your algorithm ranking improves.
    `,
  },
  'hashtag-strategy': {
    title: 'How to Build a Hashtag Strategy That Actually Grows Your Audience',
    category: 'Strategy',
    date: 'Feb 2, 2026',
    readTime: '5 min read',
    excerpt: 'Most people use hashtags wrong. Here\'s the data-backed approach to hashtag collections that drives real reach on Instagram, TikTok, and LinkedIn.',
    content: `
## Why Most Hashtag Strategies Fail

The most common hashtag mistake is chasing reach over relevance. People add #love, #instagood, and #photography to every post because those tags have hundreds of millions of posts. The logic seems sound: more posts = more people searching = more reach.

The reality is the opposite. Tags with 100M+ posts are so saturated that your content disappears within seconds of posting. You're competing with millions of posts and winning nothing.

## The Right Hashtag Mix

A strong hashtag strategy uses three tiers:

**Niche tags (10K–100K posts):** These are your bread and butter. Specific enough that you can rank, popular enough that people actually search them. Example: #minimalistdesigner instead of #design.

**Mid-tier tags (100K–1M posts):** Good for reach without total saturation. You won't rank at the top but you'll get exposure. Example: #branddesign.

**Broad tags (1M–10M posts):** Use sparingly — 1–2 per post maximum. These are for discovery by new audiences but don't expect to rank. Example: #graphicdesign.

**Branded tags:** Create one for your community. Encourage followers to use it. Builds a searchable archive of your content.

## Building Hashtag Collections

The biggest time sink in hashtag strategy is research. You find a set of tags that works, you post them once, and then you can't find them again next week.

The solution is collections. Group your hashtags by topic, content type, or campaign:

- "Educational content" — 8 tags for when you post tips and tutorials
- "Product showcases" — 7 tags for when you feature your work
- "Community" — 5 tags for engagement-focused posts

Save these collections in SocialMate's Hashtag Collections feature. When you're composing a post, insert the right collection with one click.

## Platform-Specific Notes

**Instagram:** 5–10 hashtags in the caption or first comment. The algorithm has devalued massive hashtag dumps.

**TikTok:** 3–5 hashtags maximum. TikTok's algorithm is topic-based, not hashtag-based. Use tags as content labels, not reach multipliers.

**LinkedIn:** 3–5 professional hashtags. LinkedIn users search hashtags actively. Relevance matters more than volume.

**Twitter/X:** 1–2 hashtags maximum. More than 2 hashtags actually reduces engagement on Twitter.

## Measuring Hashtag Performance

Track which hashtag sets drive more profile visits and followers over time. Rotate your collections, test new tags, and retire ones that stop performing.

This isn't a set-it-and-forget-it strategy. Hashtag effectiveness shifts as platforms evolve. Review your collections quarterly and adjust.
    `,
  },
  'social-media-analytics': {
    title: 'The Only Social Media Metrics That Actually Matter',
    category: 'Analytics',
    date: 'Jan 28, 2026',
    readTime: '6 min read',
    excerpt: 'Vanity metrics won\'t grow your business. Here\'s which analytics to track, how to read them, and what to do with the data.',
    content: `
## The Vanity Metric Trap

Follower count. Total likes. Impressions. These numbers feel important because they're big and they go up. Social media platforms show them prominently because they keep you engaged with the platform.

They are almost entirely useless for understanding whether your social media strategy is working.

A post with 10,000 impressions and 50 likes is a failure. A post with 500 impressions and 75 likes is a success. Reach doesn't matter. Engagement does.

## The Metrics That Actually Matter

**Engagement Rate:** (Likes + Comments + Shares) / Reach × 100. This is the single most important metric. A healthy engagement rate varies by platform — 3–6% is good on Instagram, 1–3% on LinkedIn, 0.5–1% on Twitter.

**Posting Consistency:** How many days did you post per week over the last month? Consistency is more important than volume. 3 posts per week every week beats 7 posts one week and 0 the next.

**Best Performing Content:** Which posts got the highest engagement rate? Look for patterns — content type, topic, time of day, caption length, presence of hashtags.

**Follower Growth Rate:** Not total followers — growth rate. 100 new followers when you have 1,000 is 10% growth. The same 100 new followers when you have 100,000 is 0.1% growth. Context matters.

**Click-Through Rate:** If you're posting with the goal of driving traffic, what percentage of viewers click your link? This is the bridge between social media and business outcomes.

## What to Ignore

- Total impressions (vanity)
- Total likes without context (vanity)
- Follower count as a standalone metric (vanity)
- Reach on posts that don't drive business outcomes (irrelevant)
- Competitor follower counts (distracting)

## Building a Simple Analytics Routine

Once a week, spend 10 minutes reviewing your last 7 days:

1. What was your average engagement rate?
2. Which post performed best and why?
3. Did you hit your posting consistency goal?
4. What one thing will you do differently next week?

That's it. Simple, actionable, repeatable.

SocialMate's Analytics page shows your posting frequency, consistency score, best times, and platform breakdown — all from your real data. No manual spreadsheet required.

## Connecting Analytics to Strategy

Data without action is just numbers. For every analytics review, identify one specific change to make:

- "My Tuesday posts consistently outperform Monday posts — I'll shift my schedule"
- "Posts with questions in the caption get 2x more comments — I'll add questions more often"
- "My engagement drops off after 3 posts per week — I'll reduce volume and increase quality"

That's how analytics actually grows your audience.
    `,
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  Comparison: 'bg-blue-50 text-blue-600',
  Strategy: 'bg-purple-50 text-purple-600',
  Tips: 'bg-green-50 text-green-600',
  Guides: 'bg-orange-50 text-orange-600',
  Teams: 'bg-pink-50 text-pink-600',
  Analytics: 'bg-yellow-50 text-yellow-700',
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
        <h2 key={key++} className="text-xl font-extrabold tracking-tight mt-8 mb-3">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={key++} className="text-sm font-bold text-black mt-4 mb-1">
          {trimmed.slice(2, -2)}
        </p>
      )
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-sm text-gray-600 leading-relaxed ml-4 list-disc">
          {trimmed.slice(2)}
        </li>
      )
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-600 leading-relaxed">
          {trimmed}
        </p>
      )
    }
  }

  return elements
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]
  if (!post) notFound()

  const otherPosts = Object.entries(POSTS)
    .filter(([slug]) => slug !== params.slug)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          <span>→</span>
          <span className={`font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
            <span>📅 {post.date}</span>
            <span>⏱ {post.readTime}</span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-2 mb-16">
          {renderContent(post.content)}
        </div>

        {/* CTA BOX */}
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

        {/* MORE POSTS */}
        <div>
          <h2 className="text-lg font-extrabold tracking-tight mb-6">More from the blog</h2>
          <div className="space-y-3">
            {otherPosts.map(([slug, p]) => (
              <Link
                key={slug}
                href={`/blog/${slug}`}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-gray-600 transition-colors">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.date} · {p.readTime}</p>
                </div>
                <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/blog" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
              View all posts →
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight">SocialMate</span>
            <span className="text-xs text-gray-400 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const TERMS: { letter: string; term: string; definition: string; related?: string[] }[] = [
  // A
  {
    letter: 'A',
    term: 'Algorithm',
    definition:
      'The set of rules a social platform uses to decide what content to show users and in what order. Algorithms weigh factors like recency, engagement signals, relationship strength, and watch time to determine a post\'s reach. Understanding the algorithm for each platform is key to organic growth.',
    related: ['Engagement', 'Reach', 'For You Page (FYP)'],
  },
  {
    letter: 'A',
    term: 'Analytics',
    definition:
      'Data and metrics that measure social media performance across dimensions like likes, reach, impressions, engagement rate, follower growth, and click-throughs. Analytics help you understand what content resonates with your audience and inform your content strategy over time.',
    related: ['Engagement Rate', 'Impressions', 'Reach'],
  },
  {
    letter: 'A',
    term: 'Audience Targeting',
    definition:
      'Defining and reaching specific demographics with your content based on attributes like age, location, interests, and behavior. Effective audience targeting ensures your posts are seen by people most likely to engage, follow, or convert — reducing wasted effort and amplifying results.',
    related: ['KPI (Key Performance Indicator)', 'Conversion Rate'],
  },
  {
    letter: 'A',
    term: 'Auto-scheduling',
    definition:
      'Automatically queuing posts at optimal times based on audience behavior data and platform engagement patterns. Auto-scheduling removes the guesswork from timing — tools like SocialMate analyze when your audience is most active and slot posts into those windows for maximum reach.',
    related: ['Post Scheduling', 'Content Calendar', 'Scheduling Tool'],
  },
  // B
  {
    letter: 'B',
    term: 'Bio Link',
    definition:
      'The single clickable URL allowed in a social media profile, often pointing to a dedicated "link in bio" landing page. Since most platforms limit you to one link in your profile, a link-in-bio page acts as a mini-website hub directing followers to your most important content, offers, or pages.',
    related: ['Link in Bio', 'Profile'],
  },
  {
    letter: 'B',
    term: 'Bluesky',
    definition:
      'A decentralized social network built on the AT Protocol, developed as an open-source Twitter alternative. Bluesky gives users control over their feeds through custom algorithms, supports account portability, and allows third-party clients and schedulers — making it a growing platform for creators who value open social.',
    related: ['Mastodon', 'X (Twitter)', 'Feed'],
  },
  {
    letter: 'B',
    term: 'Brand Voice',
    definition:
      'The consistent personality, tone, and style a brand uses across all social content — from word choice and sentence structure to humor level and formality. A well-defined brand voice makes your content instantly recognizable and builds trust with your audience over time.',
    related: ['Voice DNA', 'Content Pillars', 'SOMA'],
  },
  {
    letter: 'B',
    term: 'Buffer',
    definition:
      'A social media scheduling tool and one of the most recognized names in the space. Buffer popularized the concept of scheduling queues and post analytics for small businesses and creators. SocialMate offers similar scheduling capabilities at a fraction of the cost — Pro starts at $5/month.',
    related: ['Scheduling Tool', 'Post Scheduling', 'Auto-scheduling'],
  },
  // C
  {
    letter: 'C',
    term: 'Caption',
    definition:
      'The text accompanying a social media post or image. A strong caption provides context, reinforces the visual, includes a call-to-action, and often incorporates hashtags for discoverability. Captions vary in length and tone by platform — what works on LinkedIn reads very differently from what resonates on TikTok.',
    related: ['Hook', 'Hashtag'],
  },
  {
    letter: 'C',
    term: 'Content Calendar',
    definition:
      'A planning tool that maps out what content to post, when, and on which platforms. A content calendar helps you maintain consistency, plan campaigns in advance, balance content types, and avoid last-minute scrambling. It\'s the backbone of any sustainable social media strategy.',
    related: ['Auto-scheduling', 'Post Scheduling', 'Content Pillars'],
  },
  {
    letter: 'C',
    term: 'Content Pillars',
    definition:
      '3-5 core topics a creator or brand consistently creates content around. Pillars give your account a sense of identity and purpose — for example, a fintech founder might post around personal finance, startup building, creator tools, and mindset. Sticking to pillars builds an audience who knows exactly what to expect from you.',
    related: ['Brand Voice', 'Content Calendar', 'Niche'],
  },
  {
    letter: 'C',
    term: 'Conversion Rate',
    definition:
      'The percentage of social media visitors or post viewers who take a desired action — signing up, purchasing, downloading, or clicking through. Conversion rate is a critical KPI for evaluating whether your social strategy is actually driving business outcomes beyond vanity metrics like likes.',
    related: ['KPI (Key Performance Indicator)', 'Analytics', 'Audience Targeting'],
  },
  {
    letter: 'C',
    term: 'Creator Economy',
    definition:
      'The ecosystem of independent creators monetizing their content, audiences, and expertise directly — through subscriptions, tips, brand deals, merchandise, and platforms. The creator economy has grown to hundreds of millions of participants globally, making tools that reduce overhead and increase leverage increasingly critical.',
    related: ['UGC (User-Generated Content)', 'Influencer', 'Viral'],
  },
  {
    letter: 'C',
    term: 'Cross-posting',
    definition:
      'Publishing the same — or adapted — content across multiple social platforms simultaneously or in sequence. Cross-posting maximizes your content\'s reach without proportionally increasing your workload. Smart cross-posting tools like SocialMate adapt formatting, character limits, and media specs per platform automatically.',
    related: ['Repurposing', 'Scheduling Tool', 'Platform'],
  },
  // D
  {
    letter: 'D',
    term: 'Dark Social',
    definition:
      'Traffic from private sharing channels — direct messages, email, WhatsApp, Slack — that can\'t be tracked by standard analytics tools. Because these shares happen off-platform, they show up as "direct" traffic with no referrer. Dark social often represents a significant chunk of truly viral content spread that goes uncounted.',
    related: ['Analytics', 'Reach', 'Viral'],
  },
  {
    letter: 'D',
    term: 'Discord',
    definition:
      'A community platform organized into servers and channels, originally built for gamers but now widely used by creators, brands, DAOs, and communities of all kinds. SocialMate supports scheduling announcements and posts directly to Discord channels, making it one of the few schedulers with native Discord integration.',
    related: ['Telegram', 'Platform', 'Social Inbox'],
  },
  {
    letter: 'D',
    term: 'Duet',
    definition:
      'A TikTok feature that allows users to create side-by-side videos reacting to, responding to, or building on another creator\'s video. Duets are a powerful collaboration and discovery mechanism on TikTok — reacting to a trending video via Duet can expose your content to the original video\'s entire audience.',
    related: ['Stitch', 'TikTok', 'Short-form Video'],
  },
  // E
  {
    letter: 'E',
    term: 'Engagement',
    definition:
      'All interactions users have with your content: likes, comments, shares, saves, reposts, click-throughs, and replies. Engagement is a stronger quality signal than raw follower count — it tells you how much your audience actually cares about what you post, not just how many people passively follow you.',
    related: ['Engagement Rate', 'Algorithm', 'Analytics'],
  },
  {
    letter: 'E',
    term: 'Engagement Rate',
    definition:
      'The percentage of your audience (or reach) that interacted with a specific post, calculated as total engagements divided by reach or followers. Engagement rate lets you compare performance across posts of different reach sizes — a post seen by 100 people with 20 engagements outperforms one seen by 10,000 with 50 engagements.',
    related: ['Engagement', 'Reach', 'Analytics'],
  },
  {
    letter: 'E',
    term: 'Evergreen Content',
    definition:
      'Content that stays relevant, useful, and valuable long after its original publish date — "how to" guides, definitions, tutorials, and timeless advice. Evergreen content continues to generate traffic and engagement for months or years, making it among the highest-ROI content you can create.',
    related: ['Content Pillars', 'Repurposing', 'RSS Feed'],
  },
  // F
  {
    letter: 'F',
    term: 'Feed',
    definition:
      'The main content stream on a social platform showing posts from accounts you follow, plus algorithmically recommended content. Feed algorithms are increasingly shifting toward discovery-based models — showing you content from creators you don\'t follow but might enjoy — which means non-followers can see your posts.',
    related: ['Algorithm', 'For You Page (FYP)', 'Follower'],
  },
  {
    letter: 'F',
    term: 'Follower',
    definition:
      'A user who has subscribed to see your content in their feed on a social platform. While follower count is often the first metric creators track, follower quality — how engaged, targeted, and loyal they are — matters far more than raw numbers for building a sustainable audience.',
    related: ['Feed', 'Engagement', 'Reach'],
  },
  {
    letter: 'F',
    term: 'For You Page (FYP)',
    definition:
      'TikTok\'s algorithmic discovery feed that shows content tailored to each individual user based on their watch history, engagement patterns, and behavioral signals. The FYP is the primary reason creators can go viral on TikTok with zero existing following — the algorithm actively distributes new content to relevant audiences.',
    related: ['TikTok', 'Algorithm', 'Viral'],
  },
  // G
  {
    letter: 'G',
    term: 'GIF',
    definition:
      'A short looping animated image format commonly shared on social media to convey reactions, emotions, and humor. GIFs are widely supported across platforms and can be a powerful engagement tool — they stop the scroll without requiring sound. SocialMate\'s Creator Studio supports GIF export directly from video clips.',
    related: ['Short-form Video', 'Creator Economy'],
  },
  {
    letter: 'G',
    term: 'Growth Hacking',
    definition:
      'Rapid experimentation with marketing channels, messaging, product changes, and distribution methods to identify the fastest paths to audience growth. The term originated in the startup world but now applies broadly to any creator or brand using data-driven, iterative tactics to grow faster than traditional marketing allows.',
    related: ['Audience Targeting', 'Analytics', 'Conversion Rate'],
  },
  // H
  {
    letter: 'H',
    term: 'Handle',
    definition:
      'Your unique @username on a social platform — the identifier other users mention when tagging you and the URL component that identifies your profile. A consistent handle across platforms makes you easier to find and strengthens your brand identity, especially as you grow across multiple networks.',
    related: ['Profile', 'Mention'],
  },
  {
    letter: 'H',
    term: 'Hashtag',
    definition:
      'A word or phrase prefixed with # used to categorize content and increase discoverability. When you tap or click a hashtag, you see all public posts using that tag. Hashtags are most effective on platforms like Instagram, TikTok, X, and Mastodon — their impact varies significantly by platform and niche.',
    related: ['Niche', 'Caption', 'Reach'],
  },
  {
    letter: 'H',
    term: 'Hook',
    definition:
      'The first 1-3 seconds of a video or the opening line of a text post, designed to immediately capture attention and stop the scroll. The hook is arguably the most important part of any piece of social content — without it, the rest of the post never gets seen. Strong hooks create curiosity, state a bold claim, or call out a specific audience.',
    related: ['Caption', 'Short-form Video', 'Engagement'],
  },
  // I
  {
    letter: 'I',
    term: 'Impression',
    definition:
      'Every time your content is displayed on a screen, whether the viewer actively engaged with it or not. A single user can generate multiple impressions from the same post across different sessions. Impressions measure total exposure, while reach measures unique viewers — both are useful but tell different parts of the story.',
    related: ['Reach', 'Engagement', 'Analytics'],
  },
  {
    letter: 'I',
    term: 'Influencer',
    definition:
      'A social media creator with an engaged, trusting audience who can meaningfully affect follower behavior and purchasing decisions. Influencer tiers range from nano (1K-10K followers) to mega (1M+), with micro-influencers often delivering the highest engagement rates and ROI for brand partnerships due to their niche audience loyalty.',
    related: ['Creator Economy', 'Engagement Rate', 'UGC (User-Generated Content)'],
  },
  {
    letter: 'I',
    term: 'Inbox',
    definition:
      'A unified view of direct messages, mentions, and replies across all your connected social platforms, consolidated in one place. Managing a social inbox centrally saves significant time and ensures you never miss an important mention. SocialMate\'s unified inbox supports Bluesky, Mastodon, Telegram, and Discord.',
    related: ['Mention', 'Social Inbox', 'Discord'],
  },
  // K
  {
    letter: 'K',
    term: 'KPI (Key Performance Indicator)',
    definition:
      'A measurable value used to track progress toward a specific business or content goal. For social media, common KPIs include follower growth rate, engagement rate, click-through rate, conversion rate, and reach. Defining the right KPIs before running a campaign is critical — measuring the wrong things leads to misleading conclusions.',
    related: ['Analytics', 'Engagement Rate', 'Conversion Rate'],
  },
  // L
  {
    letter: 'L',
    term: 'Link in Bio',
    definition:
      'A dedicated landing page accessible via the single link allowed in most social media profiles, acting as a mini-homepage for your entire online presence. A well-designed link-in-bio page consolidates your most important links — products, newsletter, YouTube, website — into one tappable hub that followers reach from any platform.',
    related: ['Bio Link', 'Profile', 'Conversion Rate'],
  },
  {
    letter: 'L',
    term: 'LinkedIn',
    definition:
      'A professional networking platform that functions as the primary B2B social content hub, used by founders, marketers, executives, and job seekers. LinkedIn\'s algorithm currently rewards long-form original content, authentic personal stories, and thoughtful commentary — making it one of the highest-organic-reach platforms available today.',
    related: ['Platform', 'Content Pillars', 'Cross-posting'],
  },
  // M
  {
    letter: 'M',
    term: 'Mastodon',
    definition:
      'An open-source, decentralized social network that is part of the Fediverse — a network of independently operated servers that communicate via the ActivityPub protocol. Users join an "instance" (server) but can follow and interact with users on any other instance. Mastodon is one of SocialMate\'s fully supported free scheduling platforms.',
    related: ['Bluesky', 'Fediverse', 'Platform'],
  },
  {
    letter: 'M',
    term: 'Mention',
    definition:
      'Tagging another account in a post or comment using @username, which sends them a notification and creates a clickable link to their profile. Mentions are used to credit collaborators, call out brands, include conversation partners, or boost engagement through mutual tagging — a basic but powerful connection tool.',
    related: ['Handle', 'Inbox', 'Engagement'],
  },
  {
    letter: 'M',
    term: 'Meme',
    definition:
      'A humorous image, video, or text format that spreads rapidly through social sharing, often adapted and remixed by many creators. Memes are a core language of internet culture — brands and creators who understand how to authentically participate in meme culture can achieve outsized organic reach with zero paid promotion.',
    related: ['Viral', 'UGC (User-Generated Content)', 'Engagement'],
  },
  // N
  {
    letter: 'N',
    term: 'Niche',
    definition:
      'A specific, targeted segment of an audience or content category that a creator or brand focuses on consistently. Niching down is counterintuitive but effective — a narrowly focused account builds a more loyal, engaged audience than a generalist one because followers know exactly what value they\'re subscribing to.',
    related: ['Content Pillars', 'Audience Targeting', 'Brand Voice'],
  },
  // O
  {
    letter: 'O',
    term: 'Organic Reach',
    definition:
      'The number of unique users who see your content without any paid promotion or advertising spend behind it. Organic reach has declined on many platforms (especially Facebook and Instagram) as they push brands toward paid distribution. However, platforms like Bluesky, Mastodon, and TikTok still offer strong organic reach for quality content.',
    related: ['Reach', 'Algorithm', 'Impression'],
  },
  // P
  {
    letter: 'P',
    term: 'Platform',
    definition:
      'A social network or application where users create, share, and interact with content — such as TikTok, Bluesky, Mastodon, Discord, Telegram, LinkedIn, or X. Each platform has its own culture, content format norms, algorithm behavior, and audience demographics. Effective social strategy requires adapting your approach to each platform\'s unique environment.',
    related: ['Cross-posting', 'Feed', 'Algorithm'],
  },
  {
    letter: 'P',
    term: 'Post Scheduling',
    definition:
      'Setting a specific future date and time for a social media post to automatically publish without manual action. Post scheduling is the foundation of any consistent social strategy — it allows you to batch-create content when you\'re in a flow state, then distribute it at optimal times throughout the week.',
    related: ['Auto-scheduling', 'Content Calendar', 'Scheduling Tool'],
  },
  {
    letter: 'P',
    term: 'Profile',
    definition:
      'Your public account page on a social platform — including your name, handle, profile photo, bio, and link. Your profile is the first impression for anyone who discovers your content: it needs to communicate who you are, what you post about, and what someone gains by following you — within seconds.',
    related: ['Handle', 'Bio Link', 'Link in Bio'],
  },
  // R
  {
    letter: 'R',
    term: 'Reach',
    definition:
      'The total number of unique users who saw your content during a given time period. Unlike impressions (which count multiple views from the same person), reach represents distinct eyeballs. Reach is a measure of awareness and distribution — how widely your content spread beyond your existing follower base.',
    related: ['Impression', 'Organic Reach', 'Engagement Rate'],
  },
  {
    letter: 'R',
    term: 'Recurring Post',
    definition:
      'A post set to automatically republish on a defined schedule — daily, weekly, bi-weekly, or monthly. Recurring posts are ideal for evergreen content that stays relevant over time, such as weekly tips, motivational prompts, or promotional reminders. SocialMate supports recurring posts with auto-rescheduling after each publish.',
    related: ['Evergreen Content', 'Post Scheduling', 'Auto-scheduling'],
  },
  {
    letter: 'R',
    term: 'Repurposing',
    definition:
      'Adapting existing content into new formats, lengths, or styles for different platforms or contexts. A long blog post becomes a Twitter thread; a podcast episode becomes 10 short video clips; a YouTube video becomes a series of Instagram carousels. Repurposing multiplies the value of every piece of content you create.',
    related: ['Cross-posting', 'Evergreen Content', 'Short-form Video'],
  },
  {
    letter: 'R',
    term: 'RSS Feed',
    definition:
      'A web feed format allowing automated aggregation and distribution of content updates from websites and blogs. RSS feeds enable tools to automatically detect new blog posts or articles and trigger social posts, emails, or other actions — making them a core automation layer for content-heavy brands and publishers.',
    related: ['Evergreen Content', 'Auto-scheduling', 'Repurposing'],
  },
  // S
  {
    letter: 'S',
    term: 'Scheduling Tool',
    definition:
      'Software that lets you plan, compose, and automatically publish social media posts in advance without manual action at post time. Scheduling tools range from simple queue managers to full-featured platforms with analytics, team collaboration, and AI content generation. SocialMate offers all of these starting at $5/month.',
    related: ['Post Scheduling', 'Auto-scheduling', 'Content Calendar'],
  },
  {
    letter: 'S',
    term: 'Short-form Video',
    definition:
      'Video content typically under 60 seconds designed for fast consumption on platforms like TikTok, Instagram Reels, and YouTube Shorts. Short-form video is the dominant content format of the current social media era — combining high watch-through rates with strong algorithmic promotion and creator discoverability.',
    related: ['TikTok', 'For You Page (FYP)', 'Hook'],
  },
  {
    letter: 'S',
    term: 'Social Inbox',
    definition:
      'A unified dashboard showing all incoming mentions, replies, comments, and direct messages across multiple social platforms in one place. A social inbox prevents important conversations from slipping through the cracks when managing multiple accounts — critical for creators and agencies handling community engagement at scale.',
    related: ['Inbox', 'Mention', 'Engagement'],
  },
  {
    letter: 'S',
    term: 'Social Listening',
    definition:
      'Monitoring social media for mentions of your brand, competitors, industry keywords, or topics of interest — even when you\'re not directly tagged. Social listening gives you real-time insight into how your brand is perceived, what competitors are doing, and what trends are emerging — far beyond your own @mentions.',
    related: ['Analytics', 'Mention', 'Engagement'],
  },
  {
    letter: 'S',
    term: 'SOMA',
    definition:
      'SocialMate\'s autonomous AI content agent that generates and schedules platform-native posts on your behalf. You drop in a brain dump or master doc of what\'s happened recently — SOMA diffs it against your previous submission, extracts what\'s new, and builds a full week of scheduled content tailored to each platform in your voice.',
    related: ['Brand Voice', 'Voice DNA', 'Auto-scheduling'],
  },
  {
    letter: 'S',
    term: 'Stitch',
    definition:
      'A TikTok feature that lets creators clip a 1-5 second segment of another creator\'s video and incorporate it as the intro to their own video. Stitches are a powerful discovery and commentary format on TikTok — responding to a viral video via Stitch puts your content in front of that video\'s audience while adding your own perspective.',
    related: ['Duet', 'TikTok', 'Short-form Video'],
  },
  {
    letter: 'S',
    term: 'Story',
    definition:
      'A temporary, 24-hour vertical content format popularized by Snapchat and adopted by Instagram, Facebook, and WhatsApp. Stories create urgency through their ephemeral nature, making them effective for behind-the-scenes content, limited-time offers, polls, and daily updates that don\'t warrant a permanent feed post.',
    related: ['Short-form Video', 'Feed', 'Engagement'],
  },
  {
    letter: 'S',
    term: 'Stream',
    definition:
      'A live video broadcast to an audience in real time, most commonly on platforms like Twitch, YouTube, and TikTok. Streaming builds deep audience connection through live interaction — chat, reactions, and real-time Q&A create engagement that pre-recorded content can\'t replicate. Clips from streams are also highly repurposable.',
    related: ['Short-form Video', 'Repurposing', 'Creator Economy'],
  },
  // T
  {
    letter: 'T',
    term: 'Telegram',
    definition:
      'A messaging app with powerful channel and group features that allow creators and brands to broadcast content to large subscriber bases with no algorithmic filtering. Telegram channels deliver every post directly to subscribers — no feed competition, no algorithm. SocialMate supports full scheduling to Telegram channels.',
    related: ['Discord', 'Platform', 'Social Inbox'],
  },
  {
    letter: 'T',
    term: 'Thread',
    definition:
      'A series of connected posts — each replying to or continuing the previous one — used to tell longer stories, make arguments, or provide tutorials within a platform\'s post length limits. Threads are native to X/Twitter and Bluesky and are a popular format for educational content, launch announcements, and build-in-public updates.',
    related: ['X (Twitter)', 'Bluesky', 'Hook'],
  },
  {
    letter: 'T',
    term: 'TikTok',
    definition:
      'A short-form video platform known for its powerful algorithmic discovery feed (the FYP) that distributes content to non-followers based on interest signals. TikTok has launched more creators and businesses from zero than any other platform in recent history. SocialMate supports TikTok scheduling with Production API approval as of May 2026.',
    related: ['For You Page (FYP)', 'Short-form Video', 'Algorithm'],
  },
  {
    letter: 'T',
    term: 'Trending',
    definition:
      'Content, topics, hashtags, or sounds that are currently experiencing a surge in popularity and widespread discussion across a platform. Tapping into trending topics early — with an authentic, relevant take — can dramatically amplify reach. Tools like SocialMate\'s Trend Scout agent surface trending angles from competitor and audience data.',
    related: ['Hashtag', 'Algorithm', 'Viral'],
  },
  // U
  {
    letter: 'U',
    term: 'UGC (User-Generated Content)',
    definition:
      'Content created by customers, fans, or followers rather than the brand itself — reviews, unboxing videos, testimonials, fan art, and tagged posts. UGC is among the most trusted and effective forms of social proof: potential customers trust peers far more than brand-produced marketing, making UGC a high-ROI acquisition channel.',
    related: ['Creator Economy', 'Influencer', 'Engagement'],
  },
  // V
  {
    letter: 'V',
    term: 'Viral',
    definition:
      'Content that spreads exponentially through organic sharing — reaching far more people than your follower base through reposts, duets, stitches, and word-of-mouth. Virality is unpredictable but can be engineered for by optimizing hooks, emotional resonance, shareability, and timing. A single viral post can generate more reach than months of steady posting.',
    related: ['For You Page (FYP)', 'Algorithm', 'Hook'],
  },
  {
    letter: 'V',
    term: 'Voice DNA',
    definition:
      'SocialMate\'s adaptive brand voice system that analyzes your personality through a structured interview and injects a custom voice summary into every SOMA AI content generation prompt. Voice DNA ensures AI-generated posts sound authentically like you — your vocabulary, tone, humor, and perspective — instead of generic AI output.',
    related: ['Brand Voice', 'SOMA', 'Content Pillars'],
  },
  // W
  {
    letter: 'W',
    term: 'Webhook',
    definition:
      'An automated HTTP callback that fires when a specific event occurs in one system, sending data to another system in real time. Webhooks power social media integrations — for example, when a payment succeeds, a webhook can trigger a post, send an email, or update a database. SocialMate uses webhooks extensively to connect Stripe, TikTok, and other platforms.',
    related: ['RSS Feed', 'Auto-scheduling', 'Platform'],
  },
  // X
  {
    letter: 'X',
    term: 'X (Twitter)',
    definition:
      'A microblogging platform for short-form text posts up to 280 characters (longer with subscriptions), known for real-time news, public conversation, and viral text content. Formerly Twitter, rebranded to X in 2023. X charges developers $0.01 per API tweet — SocialMate passes this cost through and gates X posting to Pro and Agency plans.',
    related: ['Thread', 'Bluesky', 'Algorithm'],
  },
  // Y
  {
    letter: 'Y',
    term: 'YouTube Shorts',
    definition:
      'A short-form vertical video feature on YouTube, directly competing with TikTok Reels and Instagram Reels for the short-form audience. Shorts benefit from YouTube\'s massive search-based discovery engine and long-term content longevity — a Short can surface in search results months after posting, unlike most TikTok content.',
    related: ['Short-form Video', 'TikTok', 'Repurposing'],
  },
]

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

const LETTER_SET = new Set(TERMS.map((t) => t.letter))

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://socialmate.studio/glossary',
      url: 'https://socialmate.studio/glossary',
      name: 'Social Media Glossary — Every Term You Need to Know | SocialMate',
      description:
        'A comprehensive A–Z glossary of 60+ social media terms and definitions. From algorithms and engagement rate to voice DNA and webhooks.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socialmate.studio' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Glossary',
            item: 'https://socialmate.studio/glossary',
          },
        ],
      },
    },
    {
      '@type': 'DefinedTermSet',
      '@id': 'https://socialmate.studio/glossary#termset',
      name: 'Social Media Glossary',
      description: 'Definitions of social media marketing terms and concepts for creators, agencies, and businesses.',
      hasDefinedTerm: TERMS.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        description: t.definition,
        inDefinedTermSet: 'https://socialmate.studio/glossary#termset',
      })),
    },
  ],
}

export default function GlossaryPage() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TERMS
    return TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q),
    )
  }, [search])

  const visibleLetters = useMemo(() => new Set(filtered.map((t) => t.letter)), [filtered])

  // Group filtered terms by letter
  const grouped = useMemo(() => {
    const map: Record<string, typeof TERMS> = {}
    for (const t of filtered) {
      if (!map[t.letter]) map[t.letter] = []
      map[t.letter].push(t)
    }
    return map
  }, [filtered])

  const presentLetters = Array.from(new Set(filtered.map((t) => t.letter))).sort()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            {t('glossary.eyebrow')}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('glossary.title')}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('glossary.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('glossary.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-lg leading-none"
              aria-label={t('glossary.search_clear_aria')}
            >
              ×
            </button>
          )}
        </div>

        {/* A–Z nav */}
        {!search && (
          <div className="flex flex-wrap gap-1.5 mb-12">
            {LETTERS.map((l) => {
              const active = LETTER_SET.has(l)
              return active ? (
                <a
                  key={l}
                  href={`#letter-${l}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold bg-gray-900 border border-gray-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
                >
                  {l}
                </a>
              ) : (
                <span
                  key={l}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold text-gray-700 cursor-default"
                >
                  {l}
                </span>
              )
            })}
          </div>
        )}

        {/* Terms */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">{t('glossary.no_results', { search })}</p>
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors"
            >
              {t('glossary.search_clear_btn')}
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {presentLetters.map((letter) => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-black text-amber-400">{letter}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
                <div className="space-y-6">
                  {grouped[letter].map((item) => (
                    <article
                      key={item.term}
                      id={`term-${item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 sm:p-6 hover:border-gray-700 transition-colors"
                    >
                      <h2 className="text-base sm:text-lg font-bold text-white mb-2">
                        {item.term}
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.definition}</p>
                      {item.related && item.related.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                            {t('glossary.related_label')}
                          </span>
                          {item.related.map((rel) => {
                            const targetSlug = TERMS.find((t) => t.term === rel)
                              ? `#term-${rel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                              : undefined
                            return targetSlug ? (
                              <a
                                key={rel}
                                href={targetSlug}
                                className="text-xs text-amber-400/80 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-full px-2.5 py-0.5 transition-all"
                              >
                                {rel}
                              </a>
                            ) : (
                              <span
                                key={rel}
                                className="text-xs text-gray-500 border border-gray-800 rounded-full px-2.5 py-0.5"
                              >
                                {rel}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Count badge */}
        {!search && (
          <p className="text-center text-gray-600 text-xs mt-10">
            {t('glossary.terms_count', { count: TERMS.length, letters: LETTERS.filter((l) => LETTER_SET.has(l)).length })}
          </p>
        )}
        {search && filtered.length > 0 && (
          <p className="text-center text-gray-600 text-xs mt-10">
            {filtered.length === 1
            ? t('glossary.results_count', { count: filtered.length, search })
            : t('glossary.results_count_plural', { count: filtered.length, search })
          }
          </p>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-white font-bold text-lg mb-2">
            {t('glossary.cta_title')}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {t('glossary.cta_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-all"
            >
              {t('glossary.cta_signup')}
            </Link>
            <Link
              href="/features"
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-500 transition-all"
            >
              {t('glossary.cta_features')}
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

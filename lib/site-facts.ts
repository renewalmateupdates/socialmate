/**
 * What SocialMate is, costs and does, in one typed module.
 *
 * Everything public reads from here: /llms.txt, /llms-full.txt, /ai.txt, the
 * JSON-LD in app/layout.tsx, the comparison pages (lib/vs-facts.ts), the
 * workspace context and the upgrade copy. `npm run verify:content`
 * (scripts/verify-site-content.mjs) fails when a page, a blog post or one of
 * the ask-first files that keep their own copy of a number disagrees with it.
 *
 * Rules for editing:
 *  - Limits are derived from lib/plan.ts, which is what the server enforces.
 *    Change a limit there, never here.
 *  - A platform is `live` only when someone outside the team can connect an
 *    account and publish today. Built-but-unapproved is `unavailable`.
 *  - A feature is `live` only when it is reachable in the app and has been
 *    used for real. Built, reachable and not yet proven by an outside user is
 *    `beta`. Nothing here is `planned` unless there is no code for it at all.
 *  - No customer counts, ratings or awards. Those are queried, never typed.
 *
 * Relative imports only: the verify script loads this file outside Next.
 */
import {
  PLAN_ACCOUNTS_PER_PLATFORM,
  PLAN_AI_CREDITS,
  PLAN_CLIENT_WORKSPACES,
  PLAN_POST_LIMITS,
  PLAN_PRICES,
  PLAN_SCHEDULE_WEEKS,
  PLAN_SEATS,
  PLAN_TIKTOK_VIDEOS,
  PLAN_X_POSTS,
  type PlanTier,
} from './plan'

// ─── Brand ──────────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'SocialMate',
  domain: 'socialmate.studio',
  /** The one canonical origin: https, no www, no trailing slash. */
  url: 'https://socialmate.studio',
  tagline: 'Free social media scheduler and Creator OS',
  /** One sentence, safe to quote anywhere. */
  summary:
    'SocialMate is a social media scheduler with built-in AI writing tools. It posts to TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon, and has a free plan that needs no credit card.',
  supportEmail: 'socialmatehq@gmail.com',
  legalEntity: 'Gilgamesh Enterprise LLC',
  entityNote: 'a Wyoming LLC',
  founder: 'Joshua Bostic',
  location: 'Indiana, USA',
  /** Soft launch. The Product Hunt launch was April 1, 2026. */
  launched: '2026-03-26',
  social: {
    x: 'https://x.com/socialmatehq',
    bluesky: 'https://bsky.app/profile/socialmatehq.bsky.social',
    tiktok: 'https://www.tiktok.com/@socialmatehq',
    youtube: 'https://www.youtube.com/@SocialMateHQ',
    discord: 'https://discord.gg/2se6FGrbRU',
  },
  xHandle: '@socialmatehq',
  languages: ['en', 'es', 'de', 'fr', 'pt', 'ru', 'zh', 'ja', 'ko'],
} as const

// ─── Plans ──────────────────────────────────────────────────────────────────

export type PaidTier = Exclude<PlanTier, 'free'>

export interface PlanFacts {
  id: PlanTier
  name: string
  /** Whole US dollars. 0 for Free. */
  monthly: number
  annual: number
  postsPerMonth: number
  aiCreditsPerMonth: number
  seats: number
  clientWorkspaces: number
  accountsPerPlatform: number
  scheduleWeeksAhead: number
  tiktokVideosPerMonth: number
  xPostsPerMonth: number
}

function plan(id: PlanTier, name: string): PlanFacts {
  return {
    id,
    name,
    monthly: id === 'free' ? 0 : PLAN_PRICES[id].monthly,
    annual: id === 'free' ? 0 : PLAN_PRICES[id].annual,
    postsPerMonth: PLAN_POST_LIMITS[id],
    aiCreditsPerMonth: PLAN_AI_CREDITS[id],
    seats: PLAN_SEATS[id],
    clientWorkspaces: PLAN_CLIENT_WORKSPACES[id],
    accountsPerPlatform: PLAN_ACCOUNTS_PER_PLATFORM[id],
    scheduleWeeksAhead: PLAN_SCHEDULE_WEEKS[id],
    tiktokVideosPerMonth: PLAN_TIKTOK_VIDEOS[id],
    xPostsPerMonth: PLAN_X_POSTS[id],
  }
}

export const PLANS: Record<PlanTier, PlanFacts> = {
  free: plan('free', 'Free'),
  pro: plan('pro', 'Pro'),
  agency: plan('agency', 'Agency'),
}

export const PLAN_ORDER: PlanTier[] = ['free', 'pro', 'agency']

/**
 * Billing terms, as sold. There is no free trial: the free plan is the trial,
 * it does not expire and it never asks for a card.
 */
export const BILLING = {
  currency: 'USD',
  intervals: ['monthly', 'annual'] as const,
  /** Annual costs ten months: two months free. */
  annualMonthsCharged: 10,
  freeTrial: false,
  cardRequiredForFree: false,
  cancelAnytime: true,
  /** lib/refund-policy.ts and Terms section 8. */
  refunds: 'All sales are final. Subscriptions can be canceled anytime to stop the next renewal.',
  /** Enterprise is a contract, priced by quote. Its seat count is the one uncapped number. */
  enterprise: 'Custom pricing by contract',
} as const

/**
 * The Stripe prices that charge the plan amounts above. Checkout screens and
 * the webhook each keep their own copy; scripts/test-site-facts.mjs fails if
 * any of them names a different ID.
 */
export const STRIPE_PLAN_PRICE_IDS = {
  proMonthly: 'price_1U3jSI7OMwDowUuUm0oMEpiT',
  agencyMonthly: 'price_1U3jSJ7OMwDowUuUjK3igDLr',
  proAnnual: 'price_1U3jSJ7OMwDowUuUO3utSP0R',
  agencyAnnual: 'price_1U3jSJ7OMwDowUuUTMLaC9Fu',
} as const

/** Add-ons and one-time packs. Prices in US dollars. */
export const ADDONS = {
  whiteLabel: [
    { name: 'White Label Basic', monthly: 20, what: 'your logo, colors and brand name' },
    { name: 'White Label Pro', monthly: 40, what: 'everything in Basic plus a custom domain' },
  ],
  aiCreditPacks: [
    { name: 'Starter', credits: 100, price: 1.99 },
    { name: 'Popular', credits: 300, price: 4.99 },
    { name: 'Pro', credits: 750, price: 9.99 },
    { name: 'Max', credits: 2000, price: 19.99 },
  ],
  xBoosters: [
    { name: 'Spark', posts: 50, price: 1.99 },
    { name: 'Boost', posts: 120, price: 4.99 },
    { name: 'Surge', posts: 250, price: 9.99 },
    { name: 'Storm', posts: 500, price: 19.99 },
  ],
  soma: [
    { name: 'SOMA Autopilot', monthly: 10 },
    { name: 'SOMA Full Send', monthly: 20 },
  ],
  somaCreditPacks: [
    { name: 'Starter', credits: 75, price: 4.99 },
    { name: 'Growth', credits: 225, price: 12.99 },
    { name: 'Pro', credits: 500, price: 24.99 },
  ],
  hermes: [
    { name: 'HERMES Starter', monthly: 12 },
    { name: 'HERMES Pro', monthly: 25 },
  ],
} as const

/** Partner program rates, as percentages. lib/partner-rate.ts applies them. */
export const AFFILIATE = {
  recurringPercent: 30,
  milestonePercent: 40,
  milestoneActivePayments: 100,
  smallPackPercent: 10,
  largePackPercent: 15,
} as const

// ─── Platforms ──────────────────────────────────────────────────────────────

export type PlatformId = 'tiktok' | 'linkedin' | 'x' | 'bluesky' | 'discord' | 'telegram' | 'mastodon'

export interface PlatformFacts {
  id: PlatformId
  name: string
  /** The cheapest plan that can post here. */
  minPlan: PlanTier
  /** Characters per post, as SocialMate enforces it. */
  charLimit: number
  text: boolean
  /** Images per post. 0 means none. */
  maxImages: number
  video: boolean
  /** Threads published as real reply chains (posted right away, see THREADS_NOTE). */
  threads: boolean
  /** Engagement numbers synced back into Analytics. */
  analytics: boolean
  /** Mentions and replies arrive in the inbox. */
  inbox: boolean
  /** How an account is connected. */
  connect: string
  /** What is true and worth knowing, including what it cannot do. */
  notes: string
}

/**
 * Platforms a customer can post to today, in the order the site lists them.
 * Capabilities are read from lib/publish/* and app/tiktok/studio.
 * Not supported on any platform: carousels as a distinct format, stories,
 * first-comment scheduling.
 */
export const NOT_SUPPORTED_ANYWHERE = ['stories', 'carousels as their own format', 'first-comment scheduling'] as const

/**
 * Threads are real reply chains on Bluesky, Mastodon and X, and they post
 * right away (app/api/posts/create-thread). A thread cannot be scheduled.
 */
export const THREADS_NOTE = 'Threads post as real reply chains on Bluesky, Mastodon and X. They post right away; a thread cannot be scheduled for later.'
export const PLATFORMS: PlatformFacts[] = [
  {
    id: 'tiktok', name: 'TikTok', minPlan: 'free', charLimit: 2200,
    text: false, maxImages: 0, video: true, threads: false, analytics: false, inbox: false,
    connect: 'TikTok sign-in',
    notes: 'Video only, posted or scheduled from TikTok Studio. Direct posting to public profiles was approved by TikTok on October 23, 2026.',
  },
  {
    id: 'linkedin', name: 'LinkedIn', minPlan: 'free', charLimit: 3000,
    text: true, maxImages: 9, video: true, threads: false, analytics: false, inbox: false,
    connect: 'LinkedIn sign-in',
    notes: 'Personal profiles only. Company Pages are not supported. LinkedIn sign-ins last 60 days, then the account is reconnected.',
  },
  {
    id: 'x', name: 'X', minPlan: 'pro', charLimit: 280,
    text: true, maxImages: 4, video: true, threads: true, analytics: false, inbox: false,
    connect: 'X sign-in',
    notes: 'Pro and Agency only, because X charges for every post made through its API. Monthly allowance per plan, with one-time X Booster packs on top.',
  },
  {
    id: 'bluesky', name: 'Bluesky', minPlan: 'free', charLimit: 300,
    text: true, maxImages: 4, video: true, threads: true, analytics: true, inbox: true,
    connect: 'app password',
    notes: 'Likes, reposts and replies sync into Analytics.',
  },
  {
    id: 'discord', name: 'Discord', minPlan: 'free', charLimit: 2000,
    text: true, maxImages: 10, video: false, threads: false, analytics: false, inbox: true,
    connect: 'the SocialMate bot, added to a server you manage',
    notes: 'Posts to the channel you pick, with up to 10 attached files.',
  },
  {
    id: 'telegram', name: 'Telegram', minPlan: 'free', charLimit: 4096,
    text: true, maxImages: 10, video: true, threads: false, analytics: false, inbox: true,
    connect: 'a bot you create with @BotFather',
    notes: 'Channels and groups. Text sent with a photo or video is capped at 1,024 characters by Telegram.',
  },
  {
    id: 'mastodon', name: 'Mastodon', minPlan: 'free', charLimit: 500,
    text: true, maxImages: 4, video: false, threads: true, analytics: true, inbox: true,
    connect: 'sign-in on your own instance',
    notes: 'Any instance. Favourites, boosts and replies sync into Analytics.',
  },
]

export const LIVE_PLATFORM_NAMES: string[] = PLATFORMS.map(p => p.name)
export const FREE_PLATFORM_NAMES: string[] = PLATFORMS.filter(p => p.minPlan === 'free').map(p => p.name)
export const PAID_ONLY_PLATFORM_NAMES: string[] = PLATFORMS.filter(p => p.minPlan !== 'free').map(p => p.name)

/** Platforms people ask about that SocialMate cannot post to, and why. */
export const UNAVAILABLE_PLATFORMS: { name: string; why: string }[] = [
  { name: 'Instagram', why: "needs Meta's app review, which has not been started" },
  { name: 'Facebook', why: "needs Meta's app review, which has not been started" },
  { name: 'Threads', why: "needs Meta's app review, which has not been started" },
  { name: 'YouTube', why: "posting is waiting on Google's review" },
  { name: 'Pinterest', why: "Pinterest declined SocialMate's application" },
  { name: 'Reddit', why: "Reddit declined SocialMate's application" },
]

export const UNAVAILABLE_PLATFORM_NAMES: string[] = UNAVAILABLE_PLATFORMS.map(p => p.name)

// ─── AI tools ───────────────────────────────────────────────────────────────

export interface AiToolFacts {
  name: string
  /** AI credits per use. */
  credits: number
  /** One plain sentence: what you get back. */
  what: string
  where: string
  minPlan: PlanTier
}

/**
 * Every AI tool a customer can run, with what the route actually charges
 * (app/api/ai/route.ts, app/api/ai/*, lib/ai-tool-costs.ts).
 */
export const AI_TOOLS: AiToolFacts[] = [
  { name: 'Caption', credits: 5, what: 'Writes the full post from your topic', where: 'Compose', minPlan: 'free' },
  { name: 'Rewrite', credits: 5, what: 'Rewrites the post you have to be punchier', where: 'Compose', minPlan: 'free' },
  { name: 'Hook', credits: 5, what: 'Gives 3 opening lines to start a post with', where: 'Compose', minPlan: 'free' },
  { name: 'Thread', credits: 10, what: 'Turns one idea into a numbered thread', where: 'Compose', minPlan: 'free' },
  { name: 'Repurpose', credits: 10, what: 'Reshapes long content into another format', where: 'Compose', minPlan: 'free' },
  { name: 'Hashtags', credits: 5, what: 'Suggests hashtags for the post and its platforms', where: 'Compose', minPlan: 'free' },
  { name: 'Post Score', credits: 5, what: 'Scores a draft out of 100 with what to fix', where: 'Compose', minPlan: 'pro' },
  { name: 'Bio Writer', credits: 5, what: 'Writes a profile bio', where: '/ai-features/bio-writer', minPlan: 'free' },
  { name: 'Profile Optimizer', credits: 5, what: 'Suggests improvements to a platform profile', where: '/ai-features/profile-optimizer', minPlan: 'free' },
  { name: 'TikTok Script', credits: 5, what: 'Writes a hook, body and call to action for a video', where: '/ai-features/tiktok-script', minPlan: 'free' },
  { name: 'Content Calendar', credits: 5, what: 'Plans a set of post ideas across dates', where: '/ai-features/content-calendar', minPlan: 'free' },
  { name: 'Content Gaps', credits: 10, what: 'Lists topics in your niche you have not covered', where: '/content-gap', minPlan: 'free' },
  { name: 'SM-Pulse', credits: 20, what: 'Scans what is trending in your niche', where: '/sm-pulse', minPlan: 'free' },
  { name: 'SM-Radar', credits: 20, what: 'Reports content gaps, formats and timing for your niche', where: '/sm-radar', minPlan: 'free' },
  { name: 'Campaign rewording', credits: 2, what: 'Writes 6 versions of each campaign message (charged per message, once)', where: 'Campaigns', minPlan: 'free' },
]

// ─── Features ───────────────────────────────────────────────────────────────

export type FeatureStatus = 'live' | 'beta' | 'planned'

export interface FeatureFacts {
  name: string
  what: string
  status: FeatureStatus
  /** Where it lives. A public URL when there is one, else the in-app path. */
  href: string
  minPlan: PlanTier
  /** Why it is beta, when it is. */
  note?: string
}

export const FEATURES: FeatureFacts[] = [
  // Scheduling
  { name: 'Compose', what: 'Write one post and send it to several platforms, now or later, with per-platform previews and character counts', status: 'live', href: '/compose', minPlan: 'free' },
  { name: 'Schedule (calendar and list) and Drafts', what: 'See, move, retry and edit everything scheduled, by month, week or list, TikTok posts included', status: 'live', href: '/calendar', minPlan: 'free' },
  { name: 'Bulk scheduler', what: 'Schedule many posts at once, each checked against its platform character limit', status: 'live', href: '/bulk-scheduler', minPlan: 'free' },
  { name: 'TikTok Studio', what: 'Upload, caption and schedule TikTok videos', status: 'live', href: '/tiktok/studio', minPlan: 'free' },
  { name: 'Campaigns', what: 'Write a set of messages once and have them post in rotation on the days and times you choose', status: 'live', href: '/campaigns', minPlan: 'free' },
  { name: 'Recurring and evergreen posts', what: 'Repeat a post on a schedule, or requeue evergreen posts', status: 'live', href: '/evergreen', minPlan: 'free' },
  { name: 'RSS import', what: 'Turn items from an RSS or Atom feed into drafts', status: 'live', href: '/rss-import', minPlan: 'free' },
  { name: 'Smart Queue', what: 'Fills open slots with your drafts at suggested times', status: 'live', href: '/queue', minPlan: 'pro' },
  { name: 'Media library', what: 'Upload images and videos once and reuse them', status: 'live', href: '/media', minPlan: 'free' },
  { name: 'Clips', what: 'Browse your Twitch clips and YouTube videos and schedule a post about one', status: 'live', href: '/clips', minPlan: 'free' },
  // Team
  { name: 'Team seats and roles', what: 'Invite people as Admin, Editor, Viewer or Client', status: 'live', href: '/team', minPlan: 'free' },
  { name: 'Approvals', what: 'Editors and clients submit posts; an owner or admin approves them', status: 'live', href: '/approvals', minPlan: 'free' },
  { name: 'Client workspaces', what: 'A separate workspace, accounts and queue per client', status: 'live', href: '/workspaces', minPlan: 'pro' },
  // Insight
  { name: 'Analytics', what: 'Posting history, platform breakdown and engagement synced from Bluesky and Mastodon', status: 'live', href: '/analytics', minPlan: 'free' },
  { name: 'Best times', what: 'A heatmap of when your own posts did best', status: 'live', href: '/best-times', minPlan: 'free' },
  { name: 'Inbox', what: 'Bluesky and Mastodon mentions, Telegram and Discord messages in one feed, with replies for Bluesky and Mastodon', status: 'live', href: '/inbox', minPlan: 'free' },
  { name: 'Competitor tracking', what: 'Follow up to 3 public accounts and see what they post', status: 'live', href: '/competitor-tracking', minPlan: 'free' },
  // Creator tools
  { name: 'SIGIL link in bio', what: 'A link-in-bio page with click counts', status: 'live', href: '/link-in-bio', minPlan: 'free' },
  { name: 'Link shortener', what: 'Short links on socialmate.studio/go with click counts', status: 'live', href: '/links', minPlan: 'free' },
  { name: 'Free tools', what: 'Character counter, thread splitter, UTM builder, LinkedIn formatter, Discord timestamps and a Bluesky domain helper. No account needed', status: 'live', href: '/tools', minPlan: 'free' },
  { name: 'SOMA', what: 'Reads a master document and your voice profile, then drafts or schedules a week of posts', status: 'live', href: '/soma', minPlan: 'pro' },
  { name: 'AI agents', what: 'Eight scheduled helpers: newsletter, client report, repurpose, caption, trend scout, growth scout, inbox replies and email outreach drafts', status: 'live', href: '/agents', minPlan: 'pro' },
  { name: 'HERMES', what: 'Cold outreach campaigns by email, Bluesky and Mastodon, sold as an add-on', status: 'live', href: '/hermes', minPlan: 'free' },
  { name: 'Go-live alerts', what: 'Posts your alert when your Twitch stream starts', status: 'beta', href: '/for/streamers', minPlan: 'free', note: 'Built and tested; not yet run by a streamer outside the team.' },
  { name: 'Creator Hub', what: 'Tips, paid posts and fan subscriptions through your own Stripe account', status: 'beta', href: '/monetize', minPlan: 'pro', note: 'No live payment has been taken yet.' },
  { name: 'Android app', what: 'The web app in a Google Play wrapper', status: 'beta', href: '/signup', minPlan: 'free', note: 'Closed testing on Google Play.' },
]

// ─── Sentences other files should not retype ────────────────────────────────

/** "TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon" */
export function listWords(items: readonly string[], conjunction = 'and'): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`
}

export function usd(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
}

/** "$8/month or $80/year" */
export function priceLine(tier: PaidTier): string {
  return `${usd(PLANS[tier].monthly)}/month or ${usd(PLANS[tier].annual)}/year`
}

/** One line per plan, for llms.txt, emails and anywhere a plan is summarized. */
export function planLine(tier: PlanTier): string {
  const p = PLANS[tier]
  const price = tier === 'free' ? '$0' : priceLine(tier)
  const workspaces = p.clientWorkspaces === 0
    ? 'no client workspaces'
    : `${p.clientWorkspaces} client workspace${p.clientWorkspaces === 1 ? '' : 's'}`
  return `${p.name} (${price}): ${p.postsPerMonth.toLocaleString('en-US')} posts a month, ${p.aiCreditsPerMonth.toLocaleString('en-US')} AI credits a month, ${p.seats} seats, ${p.accountsPerPlatform} account${p.accountsPerPlatform === 1 ? '' : 's'} per platform, ${workspaces}`
}

export const SENTENCES = {
  platforms: `SocialMate posts to ${listWords(LIVE_PLATFORM_NAMES)}.`,
  freePlatforms: `The free plan covers ${listWords(FREE_PLATFORM_NAMES)}. ${listWords(PAID_ONLY_PLATFORM_NAMES)} needs Pro or Agency, because X charges for every post made through its API.`,
  notAvailable: `SocialMate does not post to ${listWords(UNAVAILABLE_PLATFORM_NAMES, 'or')}.`,
  free: `Free: ${PLANS.free.postsPerMonth} posts and ${PLANS.free.aiCreditsPerMonth} AI credits a month, ${PLANS.free.seats} seats, no credit card.`,
  metaDescription: `Schedule posts to ${listWords(LIVE_PLATFORM_NAMES)}. Free plan with ${PLANS.free.postsPerMonth} posts a month and ${AI_TOOLS.length} AI tools. No credit card required.`,
} as const

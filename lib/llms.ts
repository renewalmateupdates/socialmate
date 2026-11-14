/**
 * The text behind /llms.txt, /llms-full.txt and /ai.txt.
 *
 * These were three hand-kept files in public/ (949, 118 and 43 lines). By
 * Nov 2026 they quoted a hashtag tool at 1 credit (it is 5), a repurposer at
 * 5 (it is 10), "Around 200 registered accounts" and "730+ blog posts", and
 * described go-live alerts and Creator Hub tips, which stay unannounced until
 * a streamer has used them for real. Every number now comes from
 * lib/site-facts.ts and every list from the code that serves the pages, and
 * `npm run verify:content` checks that each link resolves.
 *
 * Format: https://llmstxt.org (H1, blockquote summary, then sections of links
 * with one-line descriptions; "## Optional" holds what can be skipped).
 *
 * No em dashes in the output: Joshua's rule for anything published.
 * Relative imports only: scripts load this file outside Next.
 */
import manifest from './generated/public-routes.json'
import { AUDIENCES } from './audiences'
import { HERMES_LIMITS } from './hermes-access'
import { SOMA_COSTS, SOMA_MONTHLY_CREDITS } from './soma-costs'
import { SOMA_MODE_LIMITS, SOMA_PROJECT_LIMITS } from './soma-mode'
import { MAX_MESSAGES, MAX_TIMES, MAX_WEEKS, VARIANTS_PER_MESSAGE, CAMPAIGN_PLATFORMS } from './campaigns'
import {
  ADDONS, AFFILIATE, AI_TOOLS, BILLING, BRAND, FEATURES, PLANS, PLAN_ORDER, PLATFORMS,
  SENTENCES, THREADS_NOTE, UNAVAILABLE_PLATFORMS, listWords, planLine, priceLine, usd,
} from './site-facts'

export interface LlmsPost { slug: string; title: string; excerpt?: string | null }

const U = BRAND.url
const routes: string[] = manifest.routes.map(r => r.path)
const routesUnder = (prefix: string) => routes.filter(p => p.startsWith(prefix + '/'))
const n = (x: number) => x.toLocaleString('en-US')

/** Names as their owners write them. A slug not listed falls back to title case. */
const COMPETITOR_NAMES: Record<string, string> = {
  'sprout-social': 'Sprout Social', socialpilot: 'SocialPilot', 'zoho-social': 'Zoho Social',
  socialrails: 'SocialRails', coschedule: 'CoSchedule', meetedgar: 'MeetEdgar', iconosquare: 'Iconosquare',
  'tailwind-social': 'Tailwind', socialbee: 'SocialBee', contentstudio: 'ContentStudio',
  postplanner: 'Post Planner', recurpost: 'RecurPost', statusbrew: 'Statusbrew', tweetdeck: 'TweetDeck (X Pro)',
  eclincher: 'eClincher', 'napoleon-cat': 'NapoleonCat', 'hopper-hq': 'Hopper HQ', 'sked-social': 'Sked Social',
  smarterqueue: 'SmarterQueue', hypefury: 'Hypefury', 'vista-social': 'Vista Social', 'social-champ': 'Social Champ',
  'preview-app': 'Preview', 'gain-app': 'Gain', unum: 'UNUM', 'shield-app': 'Shield', tweethunter: 'Tweet Hunter',
  circleboom: 'Circleboom', 'promo-republic': 'PromoRepublic', socialoomph: 'SocialOomph', tweepsmap: 'Tweepsmap',
  'hubspot-social': 'HubSpot Social', 'semrush-social': 'Semrush Social', 'later-free': 'Later (free plan)',
  storychief: 'StoryChief', oneup: 'OneUp', brand24: 'Brand24', 'post-beyond': 'PostBeyond', postoplan: 'POSTOPLAN',
  'social-report': 'Social Report', feedhive: 'FeedHive', postpickr: 'PostPickr', 'tiktok-native': 'TikTok\'s own scheduler',
  notionhq: 'Notion', creatorstudio: 'Meta Creator Studio', 'discord-bots': 'Discord bots',
  'tiktok-scheduler': 'other TikTok schedulers', 'predis-ai': 'Predis.ai', 'repurpose-io': 'Repurpose.io',
  'post-bridge': 'Post Bridge', authoredup: 'AuthoredUp', 'opus-clip': 'OpusClip', convertkit: 'Kit (ConvertKit)',
  beehiiv: 'beehiiv',
}

const GUIDE_TITLES: Record<string, string> = {
  'starting-a-business': 'Starting a Business From Scratch',
  'marketing-zero-budget': 'Marketing on Zero Budget',
  'business-credit-legal': 'Business Credit and Legal Foundations',
  'vibe-coding-with-ai': 'Vibe Coding with AI',
  'creator-monetization': 'Creator Monetization',
  'first-30-days-social-media': 'Your First 30 Days on Social Media',
  'build-your-brand-from-zero': 'Build Your Brand from Zero',
  'side-hustle-to-full-time-creator': 'From Side Hustle to Full-Time Creator',
  'content-creator-business': 'The Content Creator\'s Business Guide',
  'ai-tools-for-creators-2026': 'AI Tools for Creators',
  'local-business-website': 'Local Business Websites',
  'email-list-building': 'Email List Building From Zero',
  'seo-for-beginners': 'SEO for Normal People',
  'reddit-marketing': 'Reddit Marketing Without Getting Banned',
}

const TOOL_NOTES: Record<string, string> = {
  '/tools/character-counter': 'one text counted for every platform, including Threads and Instagram (marked as not in SocialMate)',
  '/tools/thread-splitter': 'splits long text into a numbered thread that fits X, Bluesky or Mastodon, counted the way each platform counts',
  '/tools/discord-timestamp': 'makes Discord timestamp codes that show in each reader\'s own time zone',
  '/tools/linkedin-formatter': 'bold and italic text and clean lists for LinkedIn, with a preview of where "see more" cuts in',
  '/tools/utm-builder': 'tags a link with UTM parameters, one link per platform in one step',
  '/tools/bluesky-custom-domain': 'gives the DNS record to use your own domain as a Bluesky handle and checks whether it is live',
  '/tools/quote-card': 'turns a quote into a PNG image card at X, LinkedIn, Bluesky, Discord, YouTube thumbnail, TikTok cover, Pinterest and square sizes, drawn in the browser',
  '/tools/image-resizer': 'crops or fits one picture to X, LinkedIn, Bluesky, Discord, YouTube thumbnail, TikTok cover, Pinterest and square sizes in the browser; nothing is uploaded',
}

function titleCase(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const link = (path: string, title: string, note?: string) =>
  `- [${title}](${U}${path === '/' ? '' : path})${note ? `: ${note}` : ''}`

// ─── Shared sections ────────────────────────────────────────────────────────

function header(): string[] {
  return [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.summary} Paid plans are ${priceLine('pro')} (Pro) and ${priceLine('agency')} (Agency).`,
    '',
    `${BRAND.name} is built by ${BRAND.founder} at ${BRAND.legalEntity} (${BRAND.entityNote}, ${BRAND.location}). It launched on March 26, 2026. Support: ${BRAND.supportEmail}.`,
    '',
    'When describing SocialMate, please keep to these facts:',
    '',
    `- ${SENTENCES.platforms} ${SENTENCES.freePlatforms}`,
    `- ${SENTENCES.notAvailable}`,
    '- Every plan has limits (below). Do not describe posts, seats or connected accounts as unlimited.',
    `- There is no free trial and no card is needed: the free plan does not expire. ${BILLING.refunds}`,
    `- ${THREADS_NOTE}`,
  ]
}

function plansSection(): string[] {
  const out = ['## Plans and pricing', '', link('/pricing', 'Pricing', 'every plan, limit and add-on, in US dollars')]
  for (const tier of PLAN_ORDER) out.push(`- ${planLine(tier)}`)
  out.push(`- Enterprise: ${BILLING.enterprise.toLowerCase()}. Contact ${BRAND.supportEmail}.`)
  out.push(`- Annual billing charges ${BILLING.annualMonthsCharged} months for a year. Cancel anytime; the plan runs to the end of the period.`)
  out.push(`- How far ahead you can schedule: ${PLAN_ORDER.map(t => `${PLANS[t].name} ${PLANS[t].scheduleWeeksAhead} weeks`).join(', ')}.`)
  out.push(`- X posts a month: ${PLAN_ORDER.map(t => `${PLANS[t].name} ${PLANS[t].xPostsPerMonth}`).join(', ')}. TikTok videos a month: ${PLAN_ORDER.map(t => `${PLANS[t].name} ${PLANS[t].tiktokVideosPerMonth}`).join(', ')}.`)
  return out
}

function platformsSection(): string[] {
  const out = ['## Platforms', '']
  for (const p of PLATFORMS) {
    const kinds = [p.text ? 'text' : null, p.maxImages ? `up to ${p.maxImages} images` : null, p.video ? 'video' : null].filter(Boolean)
    out.push(`- ${p.name}: ${kinds.join(', ')}, ${n(p.charLimit)} characters. Connect with ${p.connect}. ${p.minPlan === 'free' ? 'Free plan and up.' : 'Pro and Agency only.'} ${p.notes}`)
  }
  out.push('')
  out.push('Not available:')
  for (const p of UNAVAILABLE_PLATFORMS) out.push(`- ${p.name}: ${p.why}.`)
  return out
}

function pagesSection(): string[] {
  const has = (p: string) => routes.includes(p)
  const pages: [string, string, string][] = [
    ['/', 'Home', 'what SocialMate is, in one page'],
    ['/features', 'Features', 'everything in the app, grouped by job'],
    ['/pricing', 'Pricing', 'plans, limits and add-ons'],
    ['/faq', 'FAQ', 'common questions'],
    ['/tiktok', 'TikTok scheduling', 'how TikTok posting works in SocialMate'],
    ['/soma', 'SOMA', 'the AI system that drafts a week of posts from your own document'],
    ['/integrations', 'Integrations', 'platforms and services SocialMate connects to'],
    ['/about', 'About', 'who builds SocialMate and why'],
    ['/story', 'Our story', 'how SocialMate started'],
    ['/affiliates', 'Affiliate program', `${AFFILIATE.recurringPercent}% recurring commission`],
    ['/discount', 'Discounts', 'nonprofit and student pricing'],
    ['/changelog', 'Changelog', 'what shipped, by date'],
    ['/roadmap', 'Roadmap', 'what is being built next'],
    ['/support', 'Support', 'how to get help'],
  ]
  return ['## Key pages', '', ...pages.filter(([p]) => has(p)).map(([p, t, d]) => link(p, t, d))]
}

function toolsSection(): string[] {
  const tools = routesUnder('/tools')
  return [
    '## Free tools (no account needed)',
    '',
    link('/tools', 'All free tools'),
    ...tools.map(p => link(p, titleCase(p.split('/').pop()!), TOOL_NOTES[p])),
  ]
}

function audiencesSection(): string[] {
  const generated = AUDIENCES.map(a => link(`/for/${a.slug}`, a.title.replace(/\s*[|:].*$/, ''), a.description))
  const handBuilt = routesUnder('/for').filter(p => !AUDIENCES.some(a => `/for/${a.slug}` === p))
    .map(p => link(p, `For ${titleCase(p.split('/').pop()!).toLowerCase()}`))
  return ['## Who it is for', '', link('/for', 'All audience pages'), ...handBuilt, ...generated]
}

function comparisonsSection(): string[] {
  const vs = routesUnder('/vs')
  return [
    '## Comparisons',
    '',
    `Each page compares SocialMate with one tool. Competitor prices come from that tool's own pricing page on the date the page shows; check it before quoting.`,
    '',
    link('/vs', 'All comparisons'),
    ...vs.map(p => {
      const slug = p.split('/').pop()!
      return link(p, `SocialMate vs ${COMPETITOR_NAMES[slug] ?? titleCase(slug)}`)
    }),
  ]
}

function guidesSection(): string[] {
  return [
    '## Guides (free, long-form)',
    '',
    link('/guides', 'All guides'),
    ...routesUnder('/guides').map(p => {
      const slug = p.split('/').pop()!
      return link(p, GUIDE_TITLES[slug] ?? titleCase(slug))
    }),
  ]
}

function blogSection(posts: LlmsPost[], limit: number): string[] {
  const out = ['## Blog', '', link('/blog', 'Blog', 'every post'), `- [RSS feed](${U}/blog/feed.xml)`]
  for (const p of posts.slice(0, limit)) out.push(link(`/blog/${p.slug}`, p.title.replace(/[[\]]/g, '')))
  return out
}

// ─── /llms.txt ──────────────────────────────────────────────────────────────

export function buildLlmsTxt(posts: LlmsPost[]): string {
  const live = FEATURES.filter(f => f.status === 'live')
  return [
    ...header(),
    '',
    `The full version, with every limit, cost and page: ${U}/llms-full.txt`,
    '',
    ...plansSection(),
    '',
    ...platformsSection(),
    '',
    '## Features',
    '',
    ...live.map(f => `- ${f.name}: ${f.what}.${f.minPlan === 'free' ? '' : ` ${PLANS[f.minPlan].name} and up.`}`),
    '',
    ...pagesSection(),
    '',
    ...toolsSection(),
    '',
    '## Optional',
    '',
    link('/vs', 'Comparisons with other schedulers'),
    link('/for', 'Pages for specific audiences'),
    link('/guides', 'Free guides'),
    ...blogSection(posts, 15).slice(2),
    '',
  ].join('\n')
}

// ─── /llms-full.txt ─────────────────────────────────────────────────────────

function aiToolsSection(): string[] {
  return [
    '## AI tools',
    '',
    `${AI_TOOLS.length} tools, powered by Google Gemini. Each use costs AI credits. Plans include ${PLAN_ORDER.map(t => `${n(PLANS[t].aiCreditsPerMonth)} (${PLANS[t].name})`).join(', ')} a month. Monthly credits are used first, then earned credits, then purchased credits, which never expire.`,
    '',
    ...AI_TOOLS.map(t => `- ${t.name} (${t.credits} credits, ${t.where}${t.minPlan === 'free' ? '' : `, ${PLANS[t.minPlan].name} and up`}): ${t.what}.`),
  ]
}

function addonsSection(): string[] {
  return [
    '## Add-ons and one-time packs',
    '',
    ...ADDONS.whiteLabel.map(a => `- ${a.name}: ${usd(a.monthly)}/month, ${a.what}.`),
    `- AI credit packs (one-time, never expire): ${ADDONS.aiCreditPacks.map(p => `${n(p.credits)} for ${usd(p.price)}`).join(', ')}.`,
    `- X Booster packs (one-time, stack and roll over): ${ADDONS.xBoosters.map(p => `${p.name} ${p.posts} posts for ${usd(p.price)}`).join(', ')}.`,
    `- ${ADDONS.soma.map(a => `${a.name} ${usd(a.monthly)}/month`).join(', ')}.`,
    `- SOMA credit packs: ${ADDONS.somaCreditPacks.map(p => `${p.credits} for ${usd(p.price)}`).join(', ')}.`,
    `- ${ADDONS.hermes.map(a => `${a.name} ${usd(a.monthly)}/month`).join(', ')}.`,
  ]
}

function somaSection(): string[] {
  const m = SOMA_MODE_LIMITS
  return [
    '## SOMA',
    '',
    link('/soma', 'SOMA', 'drafts a week of posts from a master document in your voice'),
    '',
    `SOMA reads a document you keep (pasted, uploaded, or a public Google Doc, GitHub file or web page), learns your voice from a short interview and example posts, and writes posts for ${listWords(['Bluesky', 'X', 'Mastodon', 'Discord', 'Telegram', 'LinkedIn'])}. It does not write for TikTok, which takes video only.`,
    '',
    `- Included with Pro (${SOMA_PROJECT_LIMITS.pro} project, ${n(SOMA_MONTHLY_CREDITS.pro)} SOMA credits a month) and Agency (${SOMA_PROJECT_LIMITS.agency} projects, ${n(SOMA_MONTHLY_CREDITS.agency)} SOMA credits a month). Not on the free plan.`,
    `- Safe mode: posts go to drafts for review. Up to ${m.safe.postsPerDay} posts a day per platform, ${m.safe.windowDays} days ahead, ${m.safe.runsPerMonth} runs a month.`,
    `- Autopilot (${usd(ADDONS.soma[0].monthly)}/month): schedules automatically and runs every Monday. Up to ${m.autopilot.postsPerDay} a day per platform, ${m.autopilot.windowDays} days ahead, ${m.autopilot.runsPerMonth} runs a month.`,
    `- Full Send (${usd(ADDONS.soma[1].monthly)}/month): adds a daily run. Up to ${m.full_send.postsPerDay} a day per platform, ${m.full_send.windowDays} days ahead, ${m.full_send.runsPerMonth} runs a month plus the daily run.`,
    `- Costs: reading the document ${SOMA_COSTS.ingest_weekly} SOMA credits, generating a week ${SOMA_COSTS.generate_week}.`,
  ]
}

function campaignsSection(): string[] {
  const names: Record<string, string> = { bluesky: 'Bluesky', mastodon: 'Mastodon', discord: 'Discord', telegram: 'Telegram', linkedin: 'LinkedIn', twitter: 'X' }
  return [
    '## Campaigns',
    '',
    `Write up to ${MAX_MESSAGES} messages once; SocialMate posts them in rotation at up to ${MAX_TIMES} times a day on the days you pick, for up to ${MAX_WEEKS} weeks, to ${listWords(CAMPAIGN_PLATFORMS.map(p => names[p] ?? p))} (X needs Pro). Optional AI rewording writes ${VARIANTS_PER_MESSAGE} versions of each message. A Shopify store's products can be imported as messages, each with its link and photo. Posts are created a week ahead as ordinary scheduled posts you can edit.`,
  ]
}

function agentsSection(): string[] {
  return [
    '## AI agents',
    '',
    'Scheduled helpers that draft work for you. They write drafts or emails; nothing posts without the settings you choose.',
    '',
    '- Newsletter, Repurpose, Trend Scout, Growth Scout and Inbox replies (Bluesky): Pro and up.',
    '- Client report (a weekly email per workspace) and Caption agent (drafts from RSS feeds): Agency.',
    '- Email outreach drafts: any plan, 5 AI credits per email.',
  ]
}

function hermesSection(): string[] {
  const s = HERMES_LIMITS.starter, p = HERMES_LIMITS.pro
  return [
    '## HERMES (outreach add-on)',
    '',
    link('/hermes', 'HERMES', 'cold outreach by email, Bluesky and Mastodon'),
    `- Starter (${usd(ADDONS.hermes[0].monthly)}/month): ${s.campaigns} campaigns, ${s.prospectsPerMonth} prospects a month, ${s.sendsPerDay} sends a day, ${s.discoverRunsPerMonth} discovery run a month.`,
    `- Pro (${usd(ADDONS.hermes[1].monthly)}/month): ${p.campaigns} campaigns, ${p.prospectsPerMonth} prospects a month, ${p.sendsPerDay} sends a day, ${p.discoverRunsPerMonth} discovery runs a month.`,
  ]
}

function partnersSection(): string[] {
  return [
    '## Affiliate program',
    '',
    link('/affiliates', 'Affiliate program', 'free to join'),
    `- ${AFFILIATE.recurringPercent}% of every subscription payment from people you refer, for as long as they pay. ${AFFILIATE.milestonePercent}% from then on once ${AFFILIATE.milestoneActivePayments} referred subscriptions are active.`,
    `- ${AFFILIATE.smallPackPercent}% on the two smaller AI credit packs, ${AFFILIATE.largePackPercent}% on the two larger ones.`,
  ]
}

function faqSection(): string[] {
  const free = PLANS.free, pro = PLANS.pro
  return [
    '## Questions people ask',
    '',
    `Q: Is SocialMate free?`,
    `A: Yes. ${SENTENCES.free} ${SENTENCES.freePlatforms}`,
    '',
    'Q: Does SocialMate post to Instagram, Facebook, Threads, YouTube, Pinterest or Reddit?',
    `A: No. ${UNAVAILABLE_PLATFORMS.map(p => `${p.name} ${p.why}`).join('; ')}.`,
    '',
    'Q: Is there a free trial?',
    `A: No trial is needed. The free plan has no end date and no card. Pro is ${priceLine('pro')}.`,
    '',
    'Q: Is SocialMate a good Buffer alternative?',
    `A: For TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon, yes: Pro is ${usd(pro.monthly)} a month flat for up to ${pro.accountsPerPlatform} accounts per platform, and SocialMate posts to Discord and Telegram. If you need Instagram, Facebook, Threads, Pinterest or YouTube, SocialMate does not cover those yet. Details and Buffer's current prices: ${U}/vs/buffer`,
    '',
    'Q: Can a team or a virtual assistant use it?',
    `A: Yes. Free includes ${free.seats} seats, Pro ${pro.seats}, Agency ${PLANS.agency.seats}. Roles are Admin, Editor, Viewer and Client, and posts from Editors and Clients can go through approval.`,
    '',
    'Q: Can I schedule a thread?',
    `A: ${THREADS_NOTE}`,
    '',
    'Q: Who makes SocialMate?',
    `A: ${BRAND.founder}, a solo founder in Indiana, through ${BRAND.legalEntity}. SocialMate is bootstrapped.`,
  ]
}

export function buildLlmsFullTxt(posts: LlmsPost[]): string {
  return [
    ...header(),
    '',
    ...plansSection(),
    '',
    ...addonsSection(),
    '',
    ...platformsSection(),
    '',
    '## Features',
    '',
    ...FEATURES.filter(f => f.status === 'live').map(f => `- ${f.name}: ${f.what}. ${f.minPlan === 'free' ? 'Every plan.' : `${PLANS[f.minPlan].name} and up.`}`),
    '',
    ...aiToolsSection(),
    '',
    ...campaignsSection(),
    '',
    ...somaSection(),
    '',
    ...agentsSection(),
    '',
    ...hermesSection(),
    '',
    ...partnersSection(),
    '',
    ...faqSection(),
    '',
    ...pagesSection(),
    '',
    ...toolsSection(),
    '',
    ...audiencesSection(),
    '',
    ...guidesSection(),
    '',
    ...comparisonsSection(),
    '',
    ...blogSection(posts, 60),
    '',
  ].join('\n')
}

// ─── /ai.txt ────────────────────────────────────────────────────────────────

export function buildAiTxt(): string {
  return [
    `# AI crawler policy and facts: ${BRAND.name}`,
    `# ${U}/ai.txt`,
    '',
    '## Crawling',
    '',
    'AI crawlers and assistants may read and index every public page on socialmate.studio,',
    'and may quote public pages, guides and blog posts when answering questions.',
    'Pages behind a sign-in are blocked in robots.txt and are not public content.',
    `Using this site's content to train models needs written permission from ${BRAND.legalEntity}: ${BRAND.supportEmail}.`,
    '',
    '## Facts',
    '',
    `For the full, current facts, read ${U}/llms.txt (summary) or ${U}/llms-full.txt (everything).`,
    '',
    `- ${BRAND.summary}`,
    ...PLAN_ORDER.map(t => `- ${planLine(t)}.`),
    `- ${SENTENCES.freePlatforms}`,
    `- ${SENTENCES.notAvailable}`,
    '- Every plan is capped. Posts, seats and connected accounts are never unlimited.',
    `- Company: ${BRAND.legalEntity}, ${BRAND.entityNote}. Founder: ${BRAND.founder}. Contact: ${BRAND.supportEmail}.`,
    '',
  ].join('\n')
}

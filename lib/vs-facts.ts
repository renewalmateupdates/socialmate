import { PLAN_ACCOUNTS_PER_PLATFORM, PLAN_POST_LIMITS } from '@/lib/plan'

/**
 * SocialMate's own side of the comparison pages built from
 * components/vs/VsComparison.tsx, in one place.
 *
 * The older /vs pages each typed these facts out by hand, and by Nov 2026
 * seventeen of them disagreed with the plan table (100 posts a month, 16
 * platforms, Instagram "approval pending"). Limits come from lib/plan.ts;
 * prices and platforms must match CLAUDE.md's plan table and /pricing.
 */
export const SM = {
  freePosts:     PLAN_POST_LIMITS.free,
  proPosts:      PLAN_POST_LIMITS.pro,
  agencyPosts:   PLAN_POST_LIMITS.agency,
  freeAccounts:  PLAN_ACCOUNTS_PER_PLATFORM.free,
  proAccounts:   PLAN_ACCOUNTS_PER_PLATFORM.pro,
  proPrice:      8,
  proAnnual:     80,
  agencyPrice:   29,
  agencyAnnual:  290,
  freeSeats:     2,
  proSeats:      5,
  agencySeats:   15,
  freeCredits:   50,
  proCredits:    500,
  freeTikTok:    20,
  livePlatforms: ['TikTok', 'LinkedIn', 'X', 'Bluesky', 'Discord', 'Telegram', 'Mastodon'],
  notYet:        ['Instagram', 'Facebook', 'Threads', 'YouTube', 'Pinterest', 'Reddit'],
} as const

/** "TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon" */
export function listWords(items: readonly string[], conjunction = 'and'): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`
}

/** SocialMate's card on every comparison page built from VsComparison. */
export const SM_POINTS: string[] = [
  `✅ Free plan: ${SM.freePosts} posts a month, no card`,
  `✅ Pro: $${SM.proPrice}/month with ${SM.proSeats} seats`,
  `✅ Posts to ${listWords(SM.livePlatforms)}`,
  `✅ 15+ AI writing tools, ${SM.freeCredits} credits a month free`,
  `❌ No ${listWords(SM.notYet.slice(0, 5), 'or')} yet`,
]

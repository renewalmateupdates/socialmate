import { AI_TOOLS, LIVE_PLATFORM_NAMES, PLANS, UNAVAILABLE_PLATFORM_NAMES, listWords } from '@/lib/site-facts'

/**
 * SocialMate's own side of the comparison pages built from
 * components/vs/VsComparison.tsx, in one place.
 *
 * The older /vs pages each typed these facts out by hand, and by Nov 2026
 * seventeen of them disagreed with the plan table (100 posts a month, 16
 * platforms, Instagram "approval pending"). Every number here is read from
 * lib/site-facts.ts, which reads the limits the server enforces (lib/plan.ts).
 */
export const SM = {
  freePosts:     PLANS.free.postsPerMonth,
  proPosts:      PLANS.pro.postsPerMonth,
  agencyPosts:   PLANS.agency.postsPerMonth,
  freeAccounts:  PLANS.free.accountsPerPlatform,
  proAccounts:   PLANS.pro.accountsPerPlatform,
  proPrice:      PLANS.pro.monthly,
  proAnnual:     PLANS.pro.annual,
  agencyPrice:   PLANS.agency.monthly,
  agencyAnnual:  PLANS.agency.annual,
  freeSeats:     PLANS.free.seats,
  proSeats:      PLANS.pro.seats,
  agencySeats:   PLANS.agency.seats,
  freeCredits:   PLANS.free.aiCreditsPerMonth,
  proCredits:    PLANS.pro.aiCreditsPerMonth,
  freeTikTok:    PLANS.free.tiktokVideosPerMonth,
  livePlatforms: LIVE_PLATFORM_NAMES,
  notYet:        UNAVAILABLE_PLATFORM_NAMES,
} as const

export { listWords }

/** SocialMate's card on every comparison page built from VsComparison. */
export const SM_POINTS: string[] = [
  `✅ Free plan: ${SM.freePosts} posts a month, no card`,
  `✅ Pro: $${SM.proPrice}/month with ${SM.proSeats} seats`,
  `✅ Posts to ${listWords(SM.livePlatforms)}`,
  `✅ ${AI_TOOLS.length} AI writing tools, ${SM.freeCredits} credits a month free`,
  `❌ No ${listWords(SM.notYet.slice(0, 5), 'or')} yet`,
]

export const dynamic = 'force-dynamic'
// Every step runs as one call to this route. SOMA's fill steps stop starting
// model calls at 30s (lib/soma-generate.ts) and need the rest of the minute to
// finish; without this the route ran on Vercel's default, which can be 10s.
export const maxDuration = 60
import { serve } from 'inngest/next'
import {
  inngest,
  publishScheduledPost,
  weeklyDigest,
  fetchPostAnalytics,
  evergreenRecycler,
  discordWelcomePoller,
  sendNotification,
  creditLowChecker,
  onboardingSequence,
  competitorPostFetcher,
  competitorAlerts,
  resetSomaCredits,
  streakNotifications,
  somaAutopilotRun,
  somaFullSendDailyRun,
  postPerformanceAlerts,
  publishScheduledTiktokPosts,
  cleanupStagedTiktokVideos,
  monthlyCreditsResetEmail,
  comebackEmails,
  irisAutoDispatch,
  adminHealthAlert,
  checkAchievements,
} from '@/lib/inngest'
import { newsletterAgent, clientReportAgent, repurposeAgent, captionAgent, trendScoutAgent, inboxAgent } from '@/lib/inngest-agents'
import { hermesFollowUpCron, hermesAutoDiscoverCron } from '@/lib/inngest-hermes'
import { stoppedPostingEmails } from '@/lib/inngest-lifecycle'
import { tokenExpiryWarnings } from '@/lib/inngest-token-expiry'
import { farEndDeliveryCheck } from '@/lib/inngest-delivery-check'
import { campaignTopUp } from '@/lib/inngest-campaigns'
import { liveAlertFire } from '@/lib/inngest-live-alerts'

export const { GET, POST, PUT } = serve({
  client: inngest,
  // Enki's four jobs (paper trading and truth mode scans every 15 minutes,
  // cloud runner hourly, weekly report) were unregistered on Oct 22, 2026:
  // they ran ~6,500 times a month for one dormant profile against the Inngest
  // Hobby plan's 50,000 executions. On Nov 9 the Enki code left SocialMate
  // entirely; it is kept at the git tag archive/enki-2026-11-09, and
  // docs/archive/enki.md says how to bring it back. Don't re-add it here.
  functions: [
    publishScheduledPost,
    weeklyDigest,
    fetchPostAnalytics,
    evergreenRecycler,
    discordWelcomePoller,
    sendNotification,
    creditLowChecker,
    onboardingSequence,
    competitorPostFetcher,
    competitorAlerts,
    resetSomaCredits,
    streakNotifications,
    somaAutopilotRun,
    somaFullSendDailyRun,
    postPerformanceAlerts,
    newsletterAgent,
    clientReportAgent,
    repurposeAgent,
    captionAgent,
    trendScoutAgent,
    inboxAgent,
    publishScheduledTiktokPosts,
    cleanupStagedTiktokVideos,
    monthlyCreditsResetEmail,
    comebackEmails,
    irisAutoDispatch,
    adminHealthAlert,
    checkAchievements,
    hermesFollowUpCron,
    hermesAutoDiscoverCron,
    stoppedPostingEmails,
    tokenExpiryWarnings,
    farEndDeliveryCheck,
    campaignTopUp,
    liveAlertFire,
  ],
})

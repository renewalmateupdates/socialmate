export const dynamic = 'force-dynamic'
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

export const { GET, POST, PUT } = serve({
  client: inngest,
  // Not registered: Enki's four jobs (paper trading scan and truth mode scan
  // every 15 minutes, cloud runner hourly, weekly report). Enki is wound down
  // and moving off SocialMate; on Oct 22 its one profile was dormant with no
  // trades in 30 days, yet the scans ran ~6,500 times a month against the
  // Inngest Hobby plan's 50,000 executions. The code stays in lib/inngest.ts.
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
  ],
})

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
} from '@/lib/inngest'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishScheduledPost,
    weeklyDigest,
    fetchPostAnalytics,
    evergreenRecycler,
    discordWelcomePoller,
    sendNotification,
    creditLowChecker,
  ],
})
export const dynamic = 'force-dynamic'
import { serve } from 'inngest/next'
import { inngest, publishScheduledPost, weeklyDigest, fetchPostAnalytics, evergreenRecycler } from '@/lib/inngest'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishScheduledPost, weeklyDigest, fetchPostAnalytics, evergreenRecycler],
})
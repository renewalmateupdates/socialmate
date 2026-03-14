import { serve } from 'inngest/next'
import { inngest, publishScheduledPost } from '@/lib/inngest'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishScheduledPost],
})
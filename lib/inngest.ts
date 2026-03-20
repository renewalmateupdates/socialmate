import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'socialmate' })

export const publishScheduledPost = inngest.createFunction(
  {
    id:      'publish-scheduled-post',
    // Retry up to 3 times with exponential backoff before giving up
    retries: 3,
    // Prevent multiple simultaneous runs for the same post
    concurrency: { limit: 10 },
  },
  { event: 'post/scheduled' },
  async ({ event, step }) => {
    const { postId, scheduledAt } = event.data

    if (!postId || !scheduledAt) {
      throw new Error('Missing postId or scheduledAt in event data')
    }

    // Sleep until the scheduled time
    await step.sleepUntil('wait-until-scheduled', new Date(scheduledAt))

    // Publish the post (wrapped in step for retry isolation)
    const result = await step.run('publish-post', async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/publish`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId, fromInngest: true }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        // Mark post as failed so it doesn't stay stuck in 'scheduled' state
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/fail`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ postId }),
        }).catch(err => console.error('[Inngest] Failed to mark post as failed:', err))

        const errMsg = data.error || `HTTP ${res.status}`
        console.error(`[Inngest] Publish failed for post ${postId}: ${errMsg}`)
        throw new Error(`Publish failed: ${errMsg}`)
      }

      console.log(`[Inngest] Successfully published post ${postId}:`, {
        status:    data.status,
        platforms: data.results?.map((r: any) => `${r.platform}:${r.success ? 'ok' : 'fail'}`),
      })

      return data
    })

    return result
  }
)

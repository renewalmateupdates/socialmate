import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'socialmate' })

export const publishScheduledPost = inngest.createFunction(
  { id: 'publish-scheduled-post' },
  { event: 'post/scheduled' },
  async ({ event, step }) => {
    const { postId, scheduledAt } = event.data

    await step.sleepUntil('wait-until-scheduled', new Date(scheduledAt))

    await step.run('publish-post', async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, fromInngest: true }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        // Mark post as failed in DB so it doesn't stay stuck as 'scheduled'
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/fail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })
        throw new Error(`Publish failed: ${data.error || res.status}`)
      }

      return data
    })
  }
)
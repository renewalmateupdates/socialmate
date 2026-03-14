import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'socialmate' })

export const publishScheduledPost = inngest.createFunction(
  { id: 'publish-scheduled-post' },
  { event: 'post/scheduled' },
  async ({ event, step }) => {
    const { postId } = event.data

    await step.sleep('wait-until-scheduled', event.data.delay)

    await step.run('publish-post', async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, fromInngest: true }),
      })
      if (!res.ok) throw new Error('Publish failed')
    })
  }
)
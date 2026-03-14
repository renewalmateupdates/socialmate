import { publishToDiscord } from './discord'
import { publishToBluesky } from './bluesky'

export type PublishResult = {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

export async function publishToAll(
  userId: string,
  platforms: string[],
  content: string
): Promise<PublishResult[]> {
  const results: PublishResult[] = []

  for (const platform of platforms) {
    try {
      let postId: string | undefined

      switch (platform) {
        case 'discord':
          postId = await publishToDiscord(userId, content)
          break
        case 'bluesky':
          postId = await publishToBluesky(userId, content)
          break
        default:
          results.push({ platform, success: false, error: 'Platform adapter not yet implemented' })
          continue
      }

      results.push({ platform, success: true, postId })
    } catch (err) {
      results.push({
        platform,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return results
}
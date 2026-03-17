import { publishToDiscord } from './discord'
import { publishToBluesky } from './bluesky'
import { publishToTelegram } from './telegram'
import { publishToMastodon } from './mastodon'
import { publishToYouTube } from './youtube'
import { publishToLinkedIn } from './linkedin'

export type PublishResult = {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

// destinations is a map of platform -> destination ID from post_destinations table
// e.g. { discord: 'uuid-of-destination', telegram: 'uuid-of-destination' }
export async function publishToAll(
  userId: string,
  platforms: string[],
  content: string,
  destinations: Record<string, string> = {}
): Promise<PublishResult[]> {
  const results: PublishResult[] = []

  for (const platform of platforms) {
    try {
      let postId: string | undefined
      const destId = destinations[platform]

      switch (platform) {
        case 'discord':
          postId = await publishToDiscord(userId, content, destId)
          break
        case 'bluesky':
          postId = await publishToBluesky(userId, content)
          break
        case 'telegram':
          postId = await publishToTelegram(userId, content, destId)
          break
        case 'mastodon':
          postId = await publishToMastodon(userId, content)
          break
        case 'youtube':
          postId = await publishToYouTube(userId, content)
          break
        case 'linkedin':
          postId = await publishToLinkedIn(userId, content)
          break
        default:
          results.push({
            platform,
            success: false,
            error: 'Platform not yet available',
          })
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
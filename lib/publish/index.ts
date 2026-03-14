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
        case 'telegram':
          postId = await publishToTelegram(userId, content)
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
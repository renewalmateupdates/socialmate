import { publishToDiscord }   from './discord'
import { publishToBluesky }   from './bluesky'
import { publishToTelegram }  from './telegram'
import { publishToMastodon }  from './mastodon'
import { publishToYouTube }   from './youtube'
import { publishToLinkedIn }  from './linkedin'
import { publishToPinterest } from './pinterest'

export type PublishResult = {
  platform:  string
  success:   boolean
  postId?:   string
  error?:    string
  /** Human-readable error suitable for displaying in the UI */
  userError?: string
}

// destinations: map of platform → destination ID from post_destinations table
// e.g. { discord: 'uuid-of-destination', telegram: 'uuid-of-destination' }
// workspaceId: null for personal workspace accounts, UUID for client workspace accounts
// mediaUrls: optional array of public URLs to attach as images/videos
export async function publishToAll(
  userId:             string,
  platforms:          string[],
  content:            string,
  destinations:       Record<string, string> = {},
  workspaceId:        string | null = null,
  selectedAccountIds: Record<string, string> = {},
  mediaUrls:          string[] = []
): Promise<PublishResult[]> {
  const results: PublishResult[] = []

  for (const platform of platforms) {
    try {
      let postId: string | undefined
      const destId = destinations[platform]
      const media  = mediaUrls.length > 0 ? mediaUrls : undefined

      switch (platform) {
        case 'discord':
          postId = await publishToDiscord(userId, content, destId, media)
          break
        case 'bluesky':
          postId = await publishToBluesky(userId, content, workspaceId, selectedAccountIds['bluesky'], media)
          break
        case 'telegram':
          postId = await publishToTelegram(userId, content, destId, media)
          break
        case 'mastodon':
          postId = await publishToMastodon(userId, content, workspaceId, selectedAccountIds['mastodon'], media)
          break
        case 'youtube':
          postId = await publishToYouTube(userId, content)
          break
        case 'linkedin':
          postId = await publishToLinkedIn(userId, content)
          break
        case 'pinterest':
          postId = await publishToPinterest(userId, content, destId)
          break
        default:
          results.push({
            platform,
            success:   false,
            error:     `${platform} publishing is not yet available`,
            userError: `${capitalize(platform)} support is coming soon. Remove it from this post for now.`,
          })
          continue
      }

      results.push({ platform, success: true, postId })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      results.push({
        platform,
        success:   false,
        error:     message,
        userError: message,
      })
    }
  }

  return results
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

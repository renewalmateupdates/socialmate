import { publishToDiscord }   from './discord'
import { publishToBluesky }   from './bluesky'
import { publishToTelegram }  from './telegram'
import { publishToMastodon }  from './mastodon'
import { publishToYouTube }   from './youtube'
import { publishToLinkedIn }  from './linkedin'
import { publishToPinterest } from './pinterest'
import { publishToTwitter }   from './twitter'
import { isRetryablePublishError } from './retry'
import { firstVideo } from './video'

export type PublishResult = {
  platform:  string
  success:   boolean
  postId?:   string
  error?:    string
  /** Human-readable error suitable for displaying in the UI */
  userError?: string
  /**
   * The platform refused right now, not forever — a rate limit, an upstream 5xx,
   * X's "credits depleted". The caller may reschedule rather than burning the
   * post. Absent or false means the failure is the post's own fault and will
   * fail again identically.
   */
  retryable?: boolean
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
  const media = mediaUrls.length > 0 ? mediaUrls : undefined

  const publishOne = async (platform: string): Promise<PublishResult> => {
    try {
      let postId: string | undefined
      const destId = destinations[platform]

      switch (platform) {
        case 'discord':
          postId = await publishToDiscord(userId, content, destId, media)
          break
        case 'bluesky':
          // publishToBluesky now returns { uri, cid } -- cid is needed to
          // reply to a post (see the thread-builder path), which the
          // general pipeline here has no use for.
          postId = (await publishToBluesky(userId, content, workspaceId, selectedAccountIds['bluesky'], media)).uri
          break
        case 'telegram':
          postId = await publishToTelegram(userId, content, destId, media, selectedAccountIds['telegram'])
          break
        case 'mastodon':
          postId = await publishToMastodon(userId, content, workspaceId, selectedAccountIds['mastodon'], media)
          break
        case 'youtube':
          postId = await publishToYouTube(userId, content)
          break
        case 'linkedin':
          postId = await publishToLinkedIn(userId, content, workspaceId, selectedAccountIds['linkedin'], media)
          break
        case 'pinterest':
          postId = await publishToPinterest(userId, content, destId)
          break
        case 'twitter':
          postId = await publishToTwitter(userId, content, workspaceId, selectedAccountIds['twitter'], media)
          break
        case 'tiktok':
          throw new Error(
            'TikTok only supports video posts — text scheduling is not available for TikTok. ' +
            'Use TikTok Studio (/tiktok/studio) to upload and schedule videos directly.'
          )
        default:
          return {
            platform,
            success:   false,
            error:     `${platform} publishing is not yet available`,
            userError: `${capitalize(platform)} support is coming soon. Remove it from this post for now.`,
          }
      }

      return { platform, success: true, postId }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return {
        platform,
        success:   false,
        error:     message,
        userError: message,
        retryable: isRetryablePublishError(err),
      }
    }
  }

  // A post with a video waits on each platform to process it, and a publish
  // route has 60 seconds. So those posts go to every platform at once (each
  // publisher waits at most VIDEO_WAIT_MS). Everything else goes one platform
  // at a time, exactly as before. Results keep the platforms' order either way.
  if (firstVideo(mediaUrls)) return Promise.all(platforms.map(publishOne))

  const results: PublishResult[] = []
  for (const platform of platforms) results.push(await publishOne(platform))
  return results
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

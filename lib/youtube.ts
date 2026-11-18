/**
 * YouTube posting (Nov 2026): SocialMate uploads the video attached to a post
 * to the person's YouTube channel through the YouTube Data API (videos.insert).
 *
 * Google project "socialmate-youtube-engine" (owner socialmatehq@gmail.com).
 * Until Google verifies the app, only its test users can sign in, so the
 * connect button is limited the same way as Meta's (see canConnectYouTube in
 * lib/review-access.ts). Separately, YouTube locks videos uploaded through an
 * unaudited API project to Private until the project passes the YouTube API
 * Services audit.
 *
 * Quota: videos.insert costs 1,600 of the project's 10,000 daily units, so the
 * whole app can upload about 6 videos a day until the audit raises the quota.
 *
 * Env:
 *   YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET   the OAuth client in that project
 *   YOUTUBE_CONNECT_OPEN=true                  let everyone connect (after Google verification)
 *   NEXT_PUBLIC_YOUTUBE_CONNECT_OPEN=true      show YouTube to everyone in /accounts and Compose
 *   YOUTUBE_REVIEWER_EMAILS                    optional, comma-separated SocialMate logins that
 *                                              may connect before verification (reviewer test logins)
 */

/**
 * What SocialMate asks Google for, and must match the project's Data Access
 * page: read the channel's ID, title and thumbnail to show which channel is
 * connected, and upload videos. Nothing that reads or changes existing videos.
 */
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
]

export function youtubeConnectOpen(): boolean {
  return process.env.YOUTUBE_CONNECT_OPEN === 'true'
}

export function isYouTubeReviewerEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const reviewers = (process.env.YOUTUBE_REVIEWER_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return reviewers.includes(email.trim().toLowerCase())
}

/** YouTube rejects titles over 100 characters and any title containing < or >. */
export const MAX_TITLE = 100
/** Descriptions are capped at 5,000 bytes and also refuse < and >. */
export const MAX_DESCRIPTION_BYTES = 5000

function stripAngles(s: string): string {
  return s.replace(/[<>]/g, '')
}

/** The post's first non-empty line becomes the title. */
export function youtubeTitle(content: string): string {
  const first = content.split('\n').map(l => l.trim()).find(Boolean) ?? ''
  const clean = stripAngles(first).replace(/\s+/g, ' ').trim()
  if (!clean) return 'New video'
  if (clean.length <= MAX_TITLE) return clean
  return clean.slice(0, MAX_TITLE - 1).trimEnd() + '…'
}

/** The whole post becomes the description, cut at a character boundary under the byte cap. */
export function youtubeDescription(content: string): string {
  const clean = stripAngles(content).trim()
  const enc = new TextEncoder()
  if (enc.encode(clean).length <= MAX_DESCRIPTION_BYTES) return clean
  let out = ''
  for (const ch of clean) {
    if (enc.encode(out + ch + '…').length > MAX_DESCRIPTION_BYTES) break
    out += ch
  }
  return out.trimEnd() + '…'
}

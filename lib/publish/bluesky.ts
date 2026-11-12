import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { linkFacets } from '@/lib/bluesky-facets'
import { VIDEO_WAIT_MS, VideoStillProcessing, fetchVideo, firstVideo, mp4Info, sleep, type FetchedVideo } from './video'


const MAX_BLUESKY_LENGTH = 300

function countGraphemes(str: string): number {
  return Array.from(new Intl.Segmenter().segment(str)).length
}

function truncateToGraphemes(str: string, max: number): string {
  const segs = Array.from(new Intl.Segmenter().segment(str))
  if (segs.length <= max) return str
  return segs.slice(0, max - 1).map(s => s.segment).join('') + '…'
}

// ── Video ────────────────────────────────────────────────────────────────────
// Bluesky's video service, as its own app uses it (bluesky-social/social-app,
// src/lib/media/video/multipart; lexicons in bluesky-social/atproto under
// packages/api/lexicons/app/bsky/video). docs.bsky.app redirects elsewhere now,
// so those are the primary sources. The flow:
//   1. a service-auth token from the account's PDS (aud did:web:<pds host>,
//      lxm com.atproto.repo.uploadBlob), so the service can write the blob;
//   2. startUpload, then each part, then finishUpload on video.bsky.app;
//   3. getJobStatus until the job has a blob, which the post embeds.

const VIDEO_SERVICE = 'https://video.bsky.app'

type DidService = { id?: string; type?: string; serviceEndpoint?: unknown }

/** The PDS URL from a DID document, if it names one. */
export function pdsFromDidDoc(doc: unknown): string | null {
  const services = ((doc as { service?: DidService[] } | null)?.service ?? [])
  const pds = services.find(s => s.id === '#atproto_pds' || String(s.id ?? '').endsWith('#atproto_pds') || s.type === 'AtprotoPersonalDataServer')
  return typeof pds?.serviceEndpoint === 'string' ? pds.serviceEndpoint : null
}

async function resolvePds(did: string): Promise<string | null> {
  const url = did.startsWith('did:plc:') ? `https://plc.directory/${did}`
    : did.startsWith('did:web:') ? `https://${did.slice('did:web:'.length)}/.well-known/did.json`
    : null
  if (!url) return null
  try {
    const res = await fetch(url)
    return res.ok ? pdsFromDidDoc(await res.json()) : null
  } catch {
    return null
  }
}

async function bskyJson(res: Response, step: string): Promise<Record<string, unknown>> {
  const text = await res.text().catch(() => '')
  let body: Record<string, unknown> = {}
  try { body = text ? JSON.parse(text) : {} } catch { body = {} }
  if (!res.ok) {
    const detail = (body.message as string) || (body.error as string) || `HTTP ${res.status}`
    throw new Error(`Bluesky video ${step} failed: ${detail}`)
  }
  return body
}

/** Byte ranges for each part: full parts of partSize, the last one shorter. */
export function blueskyParts(size: number, partSize: number): { partNumber: number; start: number; end: number }[] {
  const parts: { partNumber: number; start: number; end: number }[] = []
  if (partSize <= 0) return parts
  for (let start = 0, n = 1; start < size; start += partSize, n++) {
    parts.push({ partNumber: n, start, end: Math.min(start + partSize, size) })
  }
  return parts
}

type JobStatus = { state?: string; blob?: unknown; error?: string; failureCode?: string }

export async function uploadBlueskyVideo(accessJwt: string, pdsUrl: string, video: FetchedVideo, deadline: number): Promise<unknown> {
  const pds = pdsUrl.replace(/\/+$/, '')
  const exp = Math.floor(Date.now() / 1000) + 30 * 60 // whole seconds: a fraction is rejected
  const auth = await bskyJson(await fetch(
    `${pds}/xrpc/com.atproto.server.getServiceAuth?aud=${encodeURIComponent(`did:web:${new URL(pds).hostname}`)}&lxm=com.atproto.repo.uploadBlob&exp=${exp}`,
    { headers: { Authorization: `Bearer ${accessJwt}` } },
  ), 'sign-in')
  const token = String(auth.token ?? '')
  if (!token) throw new Error('Bluesky video sign-in returned no token')
  const headers = { Authorization: `Bearer ${token}` }

  const ext = video.contentType === 'video/quicktime' ? 'mov' : video.contentType === 'video/webm' ? 'webm' : 'mp4'
  const start = await bskyJson(await fetch(`${VIDEO_SERVICE}/xrpc/app.bsky.video.startUpload`, {
    method:  'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ sizeBytes: video.bytes.byteLength, mimeType: video.contentType, name: `socialmate-${Date.now()}.${ext}` }),
  }), 'start')
  const jobId = String(start.jobId ?? '')
  const parts = blueskyParts(video.bytes.byteLength, Number(start.partSizeBytes))
  if (!jobId || parts.length !== Number(start.partCount)) throw new Error('Bluesky returned an upload plan SocialMate could not follow')

  for (const part of parts) {
    await bskyJson(await fetch(
      `${VIDEO_SERVICE}/xrpc/app.bsky.video.uploadPart?jobId=${encodeURIComponent(jobId)}&partNumber=${part.partNumber}`,
      { method: 'POST', headers: { ...headers, 'Content-Type': 'application/octet-stream' }, body: video.bytes.subarray(part.start, part.end) },
    ), `part ${part.partNumber}`)
  }

  const fin = await bskyJson(await fetch(`${VIDEO_SERVICE}/xrpc/app.bsky.video.finishUpload`, {
    method:  'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ jobId }),
  }), 'finish')
  // On a duplicate upload Bluesky hands back the earlier job's id.
  const pollId = String(fin.completedJobId ?? jobId)
  let status = fin.jobStatus as JobStatus | undefined
  while (!status?.blob) {
    if (status?.state === 'JOB_STATE_FAILED') {
      throw new Error(`Bluesky could not process this video: ${status.error || status.failureCode || 'no reason given'}`)
    }
    if (Date.now() + 2000 > deadline) throw new VideoStillProcessing('Bluesky')
    await sleep(2000)
    const st = await bskyJson(await fetch(`${VIDEO_SERVICE}/xrpc/app.bsky.video.getJobStatus?jobId=${encodeURIComponent(pollId)}`), 'status')
    status = st.jobStatus as JobStatus | undefined
  }
  return status.blob
}

export type BlueskyPostRef = { uri: string; cid: string }
export type BlueskyReplyTo = { root: BlueskyPostRef; parent: BlueskyPostRef }

export async function publishToBluesky(
  userId:     string,
  content:    string,
  workspaceId?: string | null,
  accountId?:   string,
  mediaUrls?:   string[],
  replyTo?:     BlueskyReplyTo,
): Promise<BlueskyPostRef> {
  // If a specific account ID was selected, query by it directly
  let query = getSupabaseAdmin()
    .from('connected_accounts')
    .select('id, access_token, refresh_token, platform_user_id, account_name')
    .eq('user_id', userId)
    .eq('platform', 'bluesky')

  if (accountId) {
    query = query.eq('id', accountId)
  } else if (workspaceId) {
    query = query.eq('workspace_id', workspaceId)
  } else {
    query = query.is('workspace_id', null)
  }

  const { data: account, error: accountError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (accountError || !account) {
    throw new Error('No Bluesky account connected. Go to Accounts to connect your Bluesky account.')
  }

  if (!account.refresh_token) {
    throw new Error('Bluesky session expired. Please reconnect your account in Accounts → Bluesky.')
  }

  // Truncate to Bluesky's 300-grapheme limit (not UTF-16 code units — emojis are 1 grapheme but 2 code units)
  if (countGraphemes(content) > MAX_BLUESKY_LENGTH) {
    content = truncateToGraphemes(content, MAX_BLUESKY_LENGTH)
  }

  // Refresh session to get a fresh access token
  let accessJwt = account.access_token
  let did = account.platform_user_id
  // The account's own server (PDS): video uploads need it for their token.
  let pdsUrl: string | null = null

  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.refresh_token}`,
      'Content-Type': 'application/json',
    },
  })

  if (sessionRes.ok) {
    const session = await sessionRes.json()
    accessJwt = session.accessJwt
    did = session.did
    pdsUrl = pdsFromDidDoc(session.didDoc)

    await getSupabaseAdmin()
      .from('connected_accounts')
      .update({ access_token: session.accessJwt, refresh_token: session.refreshJwt })
      .eq('id', account.id)
  } else {
    const errBody = await sessionRes.json().catch(() => ({}))
    console.warn('[Bluesky] Token refresh failed:', errBody)

    if (sessionRes.status === 401) {
      throw new Error('Bluesky session expired and could not be refreshed. Please reconnect your Bluesky account.')
    }

    // Non-401 failure (e.g. 400/expired): a concurrent publish may have already rotated
    // this token. Re-read DB to get the freshest tokens before falling through.
    const { data: freshAccount } = await getSupabaseAdmin()
      .from('connected_accounts')
      .select('access_token, refresh_token, platform_user_id')
      .eq('id', account.id)
      .maybeSingle()

    if (freshAccount?.access_token) {
      accessJwt = freshAccount.access_token
      if (freshAccount.platform_user_id) did = freshAccount.platform_user_id
    }
  }

  // A video goes through Bluesky's video service and is embedded on its own
  // (a post holds a video or images, not both). Otherwise images go to the
  // blob store (max 4 images, 1MB each).
  let embed: Record<string, unknown> | undefined
  const videoUrl = firstVideo(mediaUrls)

  if (videoUrl) {
    const video = await fetchVideo(videoUrl)
    const pds = pdsUrl ?? await resolvePds(did)
    if (!pds) throw new Error('Could not find your Bluesky server to upload the video to. Reconnect Bluesky and try again.')
    const blob = await uploadBlueskyVideo(accessJwt, pds, video, Date.now() + VIDEO_WAIT_MS)
    const { width, height } = mp4Info(video.bytes)
    embed = {
      $type: 'app.bsky.embed.video',
      video: blob,
      // Without it Bluesky frames a vertical video as landscape.
      ...(width && height ? { aspectRatio: { width, height } } : {}),
    }
  } else if (mediaUrls && mediaUrls.length > 0) {
    const imageUrls = mediaUrls.filter(u => !u.match(/\.(mp4|mov|avi|webm)/i))
    if (imageUrls.length > 0) {
      const imageBlobs: Array<{ alt: string; image: unknown }> = []

      for (const url of imageUrls.slice(0, 4)) {
        try {
          const mediaRes  = await fetch(url)
          const buffer    = await mediaRes.arrayBuffer()
          const cType     = mediaRes.headers.get('content-type') || 'image/jpeg'

          const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
            method:  'POST',
            headers: {
              Authorization:  `Bearer ${accessJwt}`,
              'Content-Type': cType,
            },
            body: Buffer.from(buffer),
          })

          if (blobRes.ok) {
            const blobData = await blobRes.json()
            if (blobData.blob) {
              imageBlobs.push({ alt: '', image: blobData.blob })
            }
          } else {
            console.warn('[Bluesky] Blob upload failed for', url, await blobRes.text())
          }
        } catch (err) {
          console.warn('[Bluesky] Failed to fetch/upload media:', err)
        }
      }

      if (imageBlobs.length > 0) {
        embed = { $type: 'app.bsky.embed.images', images: imageBlobs }
      }
    }
  }

  // Bluesky shows a link as clickable only when the record marks it with a
  // facet; until Nov 2026 every link in these posts was plain text. Measured
  // on the final (possibly truncated) text, since offsets are in bytes.
  const facets = linkFacets(content)

  // Create the post
  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo:       did,
      collection: 'app.bsky.feed.post',
      record: {
        $type:     'app.bsky.feed.post',
        text:      content,
        createdAt: new Date().toISOString(),
        ...(facets.length ? { facets } : {}),
        ...(embed ? { embed } : {}),
        ...(replyTo ? { reply: replyTo } : {}),
      },
    }),
  })

  if (!postRes.ok) {
    const errBody = await postRes.json().catch(() => ({}))
    const detail  = errBody.message || errBody.error || `HTTP ${postRes.status}`
    console.error('[Bluesky] Post creation failed:', errBody)

    if (postRes.status === 401) {
      throw new Error('Bluesky authentication failed. Please reconnect your account in Accounts → Bluesky.')
    }
    if (postRes.status === 429) {
      throw new Error('Bluesky rate limit hit. Please wait a few minutes and try again.')
    }
    throw new Error(`Bluesky post failed: ${detail}`)
  }

  const post = await postRes.json()

  const rkey   = post.uri?.split('/').pop()
  const handle = account.account_name || did
  if (rkey && handle) {
    console.log(`[Bluesky] Published: https://bsky.app/profile/${handle}/post/${rkey}`)
  }

  // Both uri and cid are needed to reply to this post later -- Bluesky's
  // reply record requires a strong ref (uri + cid), not just the uri this
  // function used to return alone. See publishToAll's caller for the
  // general-pipeline case, which only ever needed the uri.
  return { uri: post.uri, cid: post.cid }
}

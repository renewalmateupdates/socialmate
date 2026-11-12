import { RetryablePublishError } from './retry'

/**
 * Shared pieces for sending video to X, LinkedIn and Bluesky (Nov 2026).
 *
 * Until then those three publishers dropped video and posted the text alone;
 * Compose warned about it (#779). Each platform makes you upload the file and
 * then wait while it processes before the post can reference it, and a publish
 * has to finish inside its route's 60 seconds. So publishToAll sends a post
 * with a video to its platforms at the same time, and each publisher waits at
 * most VIDEO_WAIT_MS for processing. A video still processing after that fails
 * that platform with VideoStillProcessing and a "press Retry" message.
 */

/** SocialMate's own upload cap (app/api/media/upload-url) and what the publishers will fetch. */
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024

/** The longest a publisher waits for a platform to finish processing a video. */
export const VIDEO_WAIT_MS = 40_000

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** The file types Compose accepts as video. */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|m4v|webm)$/i.test(String(url).split('?')[0])
}

/** The first video among a post's media, if any. */
export function firstVideo(urls?: string[] | null): string | null {
  for (const u of urls ?? []) if (isVideoUrl(u)) return u
  return null
}

/** A platform is still processing the video when the publish has to stop waiting. */
export class VideoStillProcessing extends RetryablePublishError {
  constructor(platformName: string) {
    super(`${platformName} is still processing this video. Press Retry on the post in a minute or two to send it.`)
    this.name = 'VideoStillProcessing'
  }
}

export interface FetchedVideo {
  /** Backed by a plain ArrayBuffer, so slices of it can be sent as a request body. */
  bytes: Uint8Array<ArrayBuffer>
  contentType: string
}

function guessVideoType(url: string): string {
  const ext = String(url).split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'mov') return 'video/quicktime'
  if (ext === 'webm') return 'video/webm'
  return 'video/mp4'
}

const toMb = (n: number) => Math.round(n / 1024 / 1024)

/** Downloads the video once, refusing anything over the cap before reading it all. */
export async function fetchVideo(url: string, maxBytes = VIDEO_MAX_BYTES): Promise<FetchedVideo> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not read the video file (HTTP ${res.status}).`)
  const declared = Number(res.headers.get('content-length') || 0)
  if (declared > maxBytes) {
    throw new Error(`This video is ${toMb(declared)} MB. SocialMate sends videos up to ${toMb(maxBytes)} MB.`)
  }
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.byteLength > maxBytes) {
    throw new Error(`This video is ${toMb(bytes.byteLength)} MB. SocialMate sends videos up to ${toMb(maxBytes)} MB.`)
  }
  const header = res.headers.get('content-type') || ''
  // Storage often answers application/octet-stream; trust the extension then.
  const contentType = header.startsWith('video/') ? header : guessVideoType(url)
  return { bytes, contentType }
}

// ── MP4 / MOV boxes ──────────────────────────────────────────────────────────

export interface Mp4Info {
  /** Display size: a phone video stored sideways with a 90° turn reports as upright. */
  width?: number
  height?: number
  durationSec?: number
}

function u32(b: Uint8Array, o: number): number {
  return ((b[o] << 24) >>> 0) + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3]
}

function i32(b: Uint8Array, o: number): number {
  return (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]
}

function u64(b: Uint8Array, o: number): number {
  return u32(b, o) * 4294967296 + u32(b, o + 4)
}

function boxType(b: Uint8Array, o: number): string {
  return String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3])
}

/** Child boxes between start and end: [type, payloadStart, boxEnd]. */
function boxes(b: Uint8Array, start: number, end: number): [string, number, number][] {
  const out: [string, number, number][] = []
  let o = start
  while (o + 8 <= end) {
    let size = u32(b, o)
    const type = boxType(b, o + 4)
    let header = 8
    if (size === 1) {
      if (o + 16 > end) break
      size = u64(b, o + 8)
      header = 16
    } else if (size === 0) {
      size = end - o
    }
    if (size < header || o + size > end) break
    out.push([type, o + header, o + size])
    o += size
  }
  return out
}

/**
 * Width, height and duration from the moov box of an MP4 or MOV file, without
 * decoding anything. Bluesky wants the aspect ratio with a video, or it shows
 * a vertical video in a landscape frame. Missing fields mean "couldn't tell".
 */
export function mp4Info(bytes: Uint8Array): Mp4Info {
  const info: Mp4Info = {}
  const moov = boxes(bytes, 0, bytes.length).find(([t]) => t === 'moov')
  if (!moov) return info
  for (const [type, start, end] of boxes(bytes, moov[1], moov[2])) {
    if (type === 'mvhd' && end - start >= 20) {
      const v1 = bytes[start] === 1
      const timescale = u32(bytes, start + (v1 ? 20 : 12))
      const duration = v1 ? u64(bytes, start + 24) : u32(bytes, start + 16)
      if (timescale > 0) info.durationSec = duration / timescale
    }
    if (type === 'trak' && info.width === undefined) {
      const tkhd = boxes(bytes, start, end).find(([t]) => t === 'tkhd')
      if (!tkhd) continue
      const [, s, e] = tkhd
      const v1 = bytes[s] === 1
      // version/flags 4, times and ids, then reserved 8, layer/group/volume/reserved 8, matrix 36, width, height
      const matrix = s + (v1 ? 4 + 8 + 8 + 4 + 4 + 8 : 4 + 4 + 4 + 4 + 4 + 4) + 8 + 8
      const dims = matrix + 36
      if (dims + 8 > e) continue
      const w = u32(bytes, dims) / 65536
      const h = u32(bytes, dims + 4) / 65536
      if (!w || !h) continue // audio tracks are 0 x 0
      const a = i32(bytes, matrix) / 65536
      const bb = i32(bytes, matrix + 4) / 65536
      const turned = Math.round(a) === 0 && Math.abs(Math.round(bb)) === 1
      info.width = Math.round(turned ? h : w)
      info.height = Math.round(turned ? w : h)
    }
  }
  return info
}

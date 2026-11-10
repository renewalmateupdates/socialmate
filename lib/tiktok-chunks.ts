// How a video is split for TikTok's FILE_UPLOAD (Content Posting API, Media
// Transfer Guide). Shared by /api/tiktok/init-upload, which tells TikTok the
// plan, and TikTok Studio, which PUTs the pieces, so the two can't disagree.
//
// TikTok takes a file of up to 64 MB as one piece. Anything bigger must be
// split: pieces of 5 to 64 MB, sent in order, at most 1,000 of them, with the
// last piece taking the remainder (up to 128 MB). total_chunk_count is
// video_size / chunk_size, rounded down. Until Nov 9, 2026 every video was
// declared as one piece, while Studio accepts up to 500 MB, so a typical phone
// video could never upload. 10,000,000-byte pieces are TikTok's own example
// size and sit inside the limit whether "MB" means 10^6 or 2^20 bytes.

export const TIKTOK_SINGLE_PIECE_MAX = 64_000_000
export const TIKTOK_CHUNK_BYTES = 10_000_000

export interface TiktokChunkPlan {
  chunk_size: number
  total_chunk_count: number
}

export function tiktokChunkPlan(videoSize: number): TiktokChunkPlan {
  if (videoSize <= TIKTOK_SINGLE_PIECE_MAX) return { chunk_size: videoSize, total_chunk_count: 1 }
  return { chunk_size: TIKTOK_CHUNK_BYTES, total_chunk_count: Math.floor(videoSize / TIKTOK_CHUNK_BYTES) }
}

/** Byte ranges to PUT, in order. The last one runs to the end of the file. */
export function tiktokChunkRanges(videoSize: number, plan: TiktokChunkPlan): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = []
  for (let i = 0; i < plan.total_chunk_count; i++) {
    const start = i * plan.chunk_size
    const end = i === plan.total_chunk_count - 1 ? videoSize - 1 : start + plan.chunk_size - 1
    ranges.push({ start, end })
  }
  return ranges
}

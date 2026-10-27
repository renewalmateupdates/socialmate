// Unsplash photos for SOMA posts, with no repeats.
//
// On June 5, 2026 one run put the same photo on six posts (a per-keyword cache,
// removed in #468). Two gaps were left after that: each run started with an
// empty list of used photos, so a later run could reuse one, and the third try
// accepted a repeat anyway. Now each run starts from every photo the
// workspace's posts already carry, a repeat is never accepted, and photos are
// compared by image path so Unsplash's tracking parameters cannot hide one.
//
// Self-contained (no project imports) so scripts/test-soma-images.mjs can load
// it without a build.

const BATCH = 10
const FALLBACK_QUERY = 'creator social media'

interface UnsplashPhoto {
  urls?: { small?: string; regular?: string }
  user?: { name?: string; links?: { html?: string } }
  links?: { download_location?: string }
}

/** The part of an Unsplash image URL that names the photo: its path, without the per-request query. */
export function unsplashPhotoKey(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url.split('?')[0]
  }
}

/** Photo keys already used by these posts. media_urls holds [imageUrl, attribution]. */
export function usedPhotoKeys(rows: { media_urls?: string[] | null }[]): Set<string> {
  const used = new Set<string>()
  for (const row of rows) {
    const url = row.media_urls?.[0]
    if (typeof url === 'string' && url.includes('images.unsplash.com')) used.add(unsplashPhotoKey(url))
  }
  return used
}

/** The first photo in the batch that has an image and has not been used. */
export function pickUnusedPhoto(photos: UnsplashPhoto[], used: Set<string>): UnsplashPhoto | null {
  for (const photo of photos) {
    const url = photo?.urls?.small ?? photo?.urls?.regular
    if (url && !used.has(unsplashPhotoKey(url))) return photo
  }
  return null
}

/**
 * One unused photo for a post, as [imageUrl, attribution], or null.
 *
 * Asks for a batch of random photos for the post's keyword and takes the first
 * unused one, then tries a general query once. If both batches are all used,
 * the post goes out without a photo rather than with a repeat.
 *
 * urls.small (~400px) stays under Bluesky's 1MB blob limit. Unsplash requires
 * the download ping for the photo that is used.
 */
export async function fetchUnsplashImage(keyword: string, used: Set<string>, accessKey: string | undefined): Promise<string[] | null> {
  if (!accessKey) return null
  const queries = keyword === FALLBACK_QUERY ? [keyword] : [keyword, FALLBACK_QUERY]
  for (const query of queries) {
    let photos: UnsplashPhoto[]
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&count=${BATCH}&client_id=${accessKey}`,
        { signal: AbortSignal.timeout(5000) },
      )
      // A rate limit or a bad key will not clear for the next query either.
      if (!res.ok) return null
      const body = await res.json()
      photos = Array.isArray(body) ? body : []
    } catch {
      return null
    }
    const photo = pickUnusedPhoto(photos, used)
    if (!photo) continue
    const url = (photo.urls?.small ?? photo.urls?.regular) as string
    used.add(unsplashPhotoKey(url))
    if (photo.links?.download_location) {
      fetch(`${photo.links.download_location}?client_id=${accessKey}`, { signal: AbortSignal.timeout(3000) }).catch(() => {})
    }
    return [url, `Photo by ${photo.user?.name ?? 'Unknown'} on Unsplash | ${photo.user?.links?.html ?? 'https://unsplash.com'}`]
  }
  return null
}

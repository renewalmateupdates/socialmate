'use client'

/**
 * Parses a media_urls array and renders:
 *  - A small landscape image thumbnail (media_urls[0])
 *  - A "Photo by X on Unsplash" attribution link (media_urls[1]) when present
 *
 * Format of media_urls[1]: "Photo by John Doe on Unsplash | https://unsplash.com/@johndoe"
 *
 * Required by Unsplash API guidelines for any application displaying their photos.
 */

interface Props {
  mediaUrls: string[] | null | undefined
  /** 'sm' = compact thumbnail (queue cards), 'md' = slightly larger (calendar panel) */
  size?: 'sm' | 'md'
}

function parseAttribution(raw: string): { name: string; url: string } | null {
  const match = raw.match(/^Photo by (.+) on Unsplash \| (.+)$/)
  if (!match) return null
  return { name: match[1].trim(), url: match[2].trim() }
}

export default function UnsplashCredit({ mediaUrls, size = 'sm' }: Props) {
  if (!mediaUrls || mediaUrls.length === 0) return null

  const imageUrl    = mediaUrls[0]
  const attrRaw     = mediaUrls[1] ?? ''
  const attribution = attrRaw.startsWith('Photo by') ? parseAttribution(attrRaw) : null

  // Safety: only render if imageUrl looks like a URL
  if (!imageUrl || !imageUrl.startsWith('http')) return null

  const imgClass = size === 'md'
    ? 'w-full h-28 object-cover rounded-lg'
    : 'w-full h-20 object-cover rounded-lg'

  return (
    <div className="mt-2.5">
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={attribution ? `Photo by ${attribution.name} on Unsplash` : 'Post image'}
          className={imgClass}
          loading="lazy"
        />
      </div>

      {/* Attribution — required by Unsplash API guidelines */}
      {attribution && (
        <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          📷{' '}
          <a
            href={`${attribution.url}?utm_source=socialmate&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {attribution.name}
          </a>
          {' '}on{' '}
          <a
            href="https://unsplash.com?utm_source=socialmate&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Unsplash
          </a>
        </p>
      )}
    </div>
  )
}

'use client'

/**
 * Where TikTok's own interface covers your video.
 *
 * A caption placed at the bottom of the frame looks fine in any editor and is
 * then sat on by the username, the caption text and the scrolling sound ticker
 * once it is actually in the feed. The right-hand column of buttons does the
 * same to anything on that edge. This is the single most common way a video
 * comes out wrong, and it is invisible until it is published.
 *
 * The zones below are approximate — TikTok moves them between app versions and
 * they shift with device aspect ratio — so this is a guide, not a guarantee.
 * Keeping anything that must be read inside the clear middle is the point.
 */

interface Zone { label: string; style: React.CSSProperties }

const ZONES: Zone[] = [
  // Right-hand action rail: avatar, like, comment, bookmark, share, sound disc.
  { label: 'buttons', style: { right: '0%', top: '38%', width: '17%', height: '52%' } },
  // Username, caption and sound ticker along the bottom.
  { label: 'caption', style: { left: '0%', right: '17%', bottom: '4%', height: '22%' } },
  // "Following / For You" tabs and the search icon.
  { label: 'tabs', style: { left: '0%', right: '0%', top: '0%', height: '9%' } },
]

export default function SafeAreaOverlay({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {ZONES.map(z => (
        <div
          key={z.label}
          className="absolute border border-dashed border-[#fe2c55]/70 bg-[#fe2c55]/10"
          style={z.style}
        >
          <span className="absolute bottom-1 left-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#fe2c55]">
            {z.label}
          </span>
        </div>
      ))}
      {/* The band that is always clear. Anything that must be read goes here. */}
      <div
        className="absolute border border-dashed border-jade/60"
        style={{ left: '4%', right: '21%', top: '12%', bottom: '28%' }}
      >
        <span className="absolute top-1 left-1 font-mono text-[8px] uppercase tracking-[0.14em] text-jade">
          safe
        </span>
      </div>
    </div>
  )
}

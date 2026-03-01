import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

const BG_CLASSES: Record<string, string> = {
  white: 'bg-white',
  gray: 'bg-gray-100',
  black: 'bg-gray-900',
  'gradient-purple': 'bg-gradient-to-br from-purple-500 to-pink-500',
  'gradient-blue': 'bg-gradient-to-br from-blue-500 to-cyan-400',
  'gradient-green': 'bg-gradient-to-br from-green-400 to-emerald-600',
  'gradient-orange': 'bg-gradient-to-br from-orange-400 to-pink-500',
  'gradient-dark': 'bg-gradient-to-br from-gray-900 to-gray-700',
}

const TEXT_COLORS: Record<string, string> = {
  white: 'text-gray-900',
  gray: 'text-gray-900',
  black: 'text-white',
  'gradient-purple': 'text-white',
  'gradient-blue': 'text-white',
  'gradient-green': 'text-white',
  'gradient-orange': 'text-white',
  'gradient-dark': 'text-white',
}

const BUTTON_CLASSES: Record<string, string> = {
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  sharp: 'rounded-none',
  outline: 'rounded-xl border-2 border-current bg-transparent',
}

function getButtonClass(style: string, bg: string) {
  const isDark = bg !== 'white' && bg !== 'gray'
  const base = BUTTON_CLASSES[style] || 'rounded-xl'

  if (style === 'outline') {
    return `${base} ${isDark ? 'border-white text-white' : 'border-gray-900 text-gray-900'}`
  }

  return `${base} ${isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`
}

export default async function PublicBioPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: page } = await supabase
    .from('link_in_bio')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!page) return notFound()

  const textColor = TEXT_COLORS[page.background] || 'text-gray-900'
  const bgClass = BG_CLASSES[page.background] || 'bg-white'
  const isDark = page.background !== 'white' && page.background !== 'gray'

  return (
    <div className={`min-h-screen ${bgClass} flex items-start justify-center py-12 px-4`}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-6">

          {page.avatar_url ? (
            <img
              src={page.avatar_url}
              alt={page.title}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg ${
                isDark ? 'bg-white/20' : 'bg-black/10'
              }`}
            >
              {page.title ? page.title[0].toUpperCase() : '?'}
            </div>
          )}

          {page.title && (
            <h1 className={`text-xl font-extrabold tracking-tight text-center ${textColor}`}>
              {page.title}
            </h1>
          )}

          {page.bio && (
            <p
              className={`text-sm text-center max-w-xs ${
                isDark ? 'text-white/80' : 'text-gray-500'
              }`}
            >
              {page.bio}
            </p>
          )}

          {page.socials &&
            Object.keys(page.socials).filter(
              (k: string) => (page.socials as any)[k]
            ).length > 0 && (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {[
                  { key: 'instagram', icon: '📸' },
                  { key: 'twitter', icon: '🐦' },
                  { key: 'linkedin', icon: '💼' },
                  { key: 'tiktok', icon: '🎵' },
                  { key: 'youtube', icon: '▶️' },
                  { key: 'threads', icon: '🧵' },
                  { key: 'bluesky', icon: '🦋' },
                ]
                  .filter((s) => (page.socials as any)[s.key])
                  .map((s) => {
                    const rawUrl = (page.socials as any)[s.key]
                    const formattedUrl = rawUrl.startsWith('http')
                      ? rawUrl
                      : `https://${rawUrl}`

                    return (
                      <a
                        key={s.key}
                        href={formattedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl hover:scale-110 transition-transform"
                      >
                        {s.icon}
                      </a>
                    )
                  })}
              </div>
            )}
        </div>

        <div className="space-y-3">
          {page.links
            ?.filter((l: any) => l.active)
            .map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-4 px-6 text-sm font-bold text-center transition-all hover:opacity-80 hover:scale-[1.02] ${getButtonClass(
                  page.button_style,
                  page.background
                )}`}
              >
                {link.title}
              </a>
            ))}
        </div>

        <p
          className={`text-xs text-center mt-8 ${
            isDark ? 'text-white/30' : 'text-gray-300'
          }`}
        >
          Made with{' '}
          <a href="/" className="hover:underline">
            SocialMate
          </a>
        </p>
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

export default function PublicBioPage() {
  const params = useParams()
  const slug = params.slug as string
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPage() {
      const { data } = await supabase
        .from('link_in_bio')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()
      setPage(data)
      setLoading(false)
    }
    if (slug) fetchPage()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-bold text-gray-700">Page not found</p>
          <p className="text-xs text-gray-400 mt-1">This bio link doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

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
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg ${isDark ? 'bg-white/20' : 'bg-black/10'}`}>
              {page.title ? page.title[0].toUpperCase() : '?'}
            </div>
          )}

          {page.title && (
            <h1 className={`text-xl font-extrabold tracking-tight text-center ${textColor}`}>
              {page.title}
            </h1>
          )}

          {page.bio && (
            <p className={`text-sm text-center max-w-xs ${isDark ? 'text-white/80' : 'text-gray-500'}`}>
              {page.bio}
            </p>
          )}

          {page.social_links && Object.keys(page.social_links).filter((k: string) => page.social_links[k]).length > 0 && (
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {[
                { key: 'instagram', icon: '📸' },
                { key: 'twitter',   icon: '🐦' },
                { key: 'linkedin',  icon: '💼' },
                { key: 'tiktok',    icon: '🎵' },
                { key: 'youtube',   icon: '▶️' },
                { key: 'threads',   icon: '🧵' },
                { key: 'bluesky',   icon: '🦋' },
              ]
                .filter((s) => page.social_links[s.key])
                .map((s) => {
                  const rawUrl = page.social_links[s.key]
                  const formattedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
                  return (
                    <a key={s.key} href={formattedUrl} target="_blank" rel="noopener noreferrer"
                      className="text-2xl hover:scale-110 transition-transform">
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
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`block w-full py-4 px-6 text-sm font-bold text-center transition-all hover:opacity-80 hover:scale-[1.02] ${getButtonClass(page.button_style, page.background)}`}>
                {link.title}
              </a>
            ))}
        </div>

        <p className={`text-xs text-center mt-8 ${isDark ? 'text-white/30' : 'text-gray-300'}`}>
          Made with{' '}
          <a href="/" className="hover:underline">SocialMate</a>
        </p>
      </div>
    </div>
  )
}
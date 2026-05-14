'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type LinkItem = {
  id: string
  title: string
  url: string
  icon?: string
  active: boolean
}

const BUTTON_STYLES: Record<string, string> = {
  rounded: 'rounded-xl',
  pill:    'rounded-full',
  square:  'rounded-none',
  soft:    'rounded-lg',
}

const BACKGROUNDS: Record<string, string> = {
  white:           'bg-white',
  black:           'bg-black',
  gray:            'bg-gray-100',
  gradient_purple: 'bg-gradient-to-br from-purple-500 to-pink-500',
  gradient_blue:   'bg-gradient-to-br from-blue-500 to-cyan-400',
  gradient_green:  'bg-gradient-to-br from-green-400 to-teal-500',
  gradient_orange: 'bg-gradient-to-br from-orange-400 to-pink-500',
  gradient_dark:   'bg-gradient-to-br from-gray-900 to-gray-700',
}

const TEXT_COLORS: Record<string, string> = {
  white:           'text-black',
  black:           'text-white',
  gray:            'text-black',
  gradient_purple: 'text-white',
  gradient_blue:   'text-white',
  gradient_green:  'text-white',
  gradient_orange: 'text-white',
  gradient_dark:   'text-white',
}

const BUTTON_COLORS: Record<string, string> = {
  white:           'bg-black text-white hover:opacity-80',
  black:           'bg-white text-black hover:opacity-80',
  gray:            'bg-black text-white hover:opacity-80',
  gradient_purple: 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30',
  gradient_blue:   'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30',
  gradient_green:  'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30',
  gradient_orange: 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30',
  gradient_dark:   'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20',
}

const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter:   '🐦',
  linkedin:  '💼',
  tiktok:    '🎵',
  youtube:   '▶️',
  facebook:  '📘',
  pinterest: '📌',
  threads:   '🧵',
  bluesky:   '🦋',
  snapchat:  '👻',
}

const APP_ROUTES = [
  'dashboard', 'compose', 'calendar', 'drafts', 'queue', 'analytics',
  'settings', 'accounts', 'team', 'referral', 'notifications', 'search',
  'hashtags', 'media', 'templates', 'link-in-bio', 'bulk-scheduler',
  'pricing', 'blog', 'privacy', 'terms', 'login', 'signup',
  'onboarding', 'best-times', 'forgot-password', 'reset-password',
]

export default function PublicBioPage() {
  const params = useParams()
  const username = params.username as string
  const [bioData, setBioData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username || APP_ROUTES.includes(username)) {
      setLoading(false)
      return
    }
    async function fetchBio() {
      const { data } = await supabase
        .from('link_in_bio')
        .select('*')
        .eq('slug', username)
        .single()
      setBioData(data)
      setLoading(false)
    }
    fetchBio()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!bioData || APP_ROUTES.includes(username)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-bold text-gray-700">Page not found</p>
          <p className="text-xs text-gray-400 mt-1">This profile doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const bg = bioData.background || 'white'
  const textColor = TEXT_COLORS[bg] || 'text-black'
  const btnColor = BUTTON_COLORS[bg] || 'bg-black text-white'
  const btnStyle = BUTTON_STYLES[bioData.button_style || 'rounded'] || 'rounded-xl'
  const links: LinkItem[] = bioData.links || []
  const socialLinks: Record<string, string> = bioData.social_links || {}
  const activeLinks = links.filter((l) => l.active !== false)

  return (
    <div className={`min-h-screen ${BACKGROUNDS[bg] || 'bg-white'} flex flex-col items-center py-16 px-4`}>
      <div className="w-full max-w-sm">

        {/* AVATAR */}
        <div className="flex justify-center mb-4">
          {bioData.avatar_url ? (
            <img
              src={bioData.avatar_url}
              alt={bioData.display_name || username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-extrabold ${bg === 'white' || bg === 'gray' ? 'bg-gray-100 text-gray-600' : 'bg-white/20 text-white'}`}>
              {(bioData.display_name || username)[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* NAME & BIO */}
        <div className="text-center mb-6">
          <h1 className={`text-xl font-extrabold tracking-tight ${textColor}`}>
            {bioData.display_name || username}
          </h1>
          {bioData.bio && (
            <p className={`text-sm mt-1.5 leading-relaxed ${textColor} opacity-70`}>
              {bioData.bio}
            </p>
          )}
        </div>

        {/* SOCIAL ICONS */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {Object.entries(socialLinks)
              .filter(([, url]) => url)
              .map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 ${bg === 'white' || bg === 'gray' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}
                  title={platform}>
                  {SOCIAL_ICONS[platform] || '🔗'}
                </a>
              ))}
          </div>
        )}

        {/* LINKS */}
        <div className="space-y-3 mb-10">
          {activeLinks.length === 0 ? (
            <div className={`text-center py-8 text-sm opacity-50 ${textColor}`}>
              No links yet
            </div>
          ) : (
            activeLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3.5 px-5 text-sm font-semibold transition-all ${btnStyle} ${btnColor}`}>
                {link.icon && <span>{link.icon}</span>}
                {link.title}
              </a>
            ))
          )}
        </div>

        {/* POWERED BY */}
        <div className="text-center mt-2">
          <Link
            href="https://socialmate.studio/signup"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              bg === 'white' || bg === 'gray'
                ? 'bg-black/6 text-black/55 hover:bg-black/12 hover:text-black/75'
                : 'bg-white/12 text-white/55 hover:bg-white/22 hover:text-white/80'
            }`}>
            <span className="font-black text-amber-500 text-sm leading-none">S</span>
            Made with SocialMate
          </Link>
        </div>

      </div>
    </div>
  )
}
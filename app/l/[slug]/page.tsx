import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import React from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const THEMES: Record<string, { bg: string; text: string; btn: string; subtext: string }> = {
  white:  { bg: '#ffffff', text: '#111827', btn: '#111827', subtext: '#6b7280' },
  black:  { bg: '#030712', text: '#ffffff', btn: '#ffffff', subtext: '#9ca3af' },
  gray:   { bg: '#f3f4f6', text: '#1f2937', btn: '#1f2937', subtext: '#6b7280' },
  blue:   { bg: '#2563eb', text: '#ffffff', btn: '#ffffff', subtext: '#bfdbfe' },
  purple: { bg: '#7e22ce', text: '#ffffff', btn: '#ffffff', subtext: '#e9d5ff' },
  green:  { bg: '#065f46', text: '#ffffff', btn: '#ffffff', subtext: '#a7f3d0' },
}

const BTN_RADIUS: Record<string, string> = {
  rounded: '12px',
  pill: '9999px',
  square: '0px',
}

const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  pinterest: '📌',
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from('bio_pages')
    .select('name, bio')
    .eq('slug', params.slug)
    .single()
  if (!data) return { title: 'Not Found' }
  return {
    title: data.name,
    description: data.bio || `${data.name}'s link in bio`,
  }
}

interface BioLink {
  id: string
  title: string
  url: string
  active: boolean
}

interface PageData {
  user_id: string
  name: string
  bio: string
  slug: string
  avatar_url: string
  theme: string
  btn_style: string
  links: BioLink[]
  socials: Record<string, string>
}

export default async function BioPage({ params }: { params: { slug: string } }) {
  const { data: page } = await supabase
    .from('bio_pages')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!page) notFound()

  const p = page as PageData
  const theme = THEMES[p.theme] || THEMES.white
  const btnRadius = BTN_RADIUS[p.btn_style] || BTN_RADIUS.rounded
  const activeLinks = (p.links || []).filter((l) => l.active && l.title && l.url)
  const activeSocials = Object.entries(p.socials || {}).filter(([, v]) => v)

  const { data: settings } = await supabase
    .from('user_settings')
    .select('plan')
    .eq('user_id', p.user_id)
    .single()

  const isPaid = settings?.plan === 'pro' || settings?.plan === 'agency'

  return React.createElement(
    'div',
    {
      style: {
        backgroundColor: theme.bg,
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }
    },
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '480px',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
        }
      },
      p.avatar_url
        ? React.createElement('img', {
            src: p.avatar_url,
            alt: p.name,
            style: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' as const, marginBottom: '16px' }
          })
        : React.createElement(
            'div',
            { style: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: `${theme.text}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px' } },
            p.name?.[0]?.toUpperCase() || '👤'
          ),
      React.createElement('h1', { style: { color: theme.text, fontSize: '22px', fontWeight: '800', margin: '0 0 8px', textAlign: 'center' as const } }, p.name),
      p.bio
        ? React.createElement('p', { style: { color: theme.subtext, fontSize: '14px', textAlign: 'center' as const, lineHeight: '1.6', margin: '0 0 20px', maxWidth: '320px' } }, p.bio)
        : null,
      activeSocials.length > 0
        ? React.createElement(
            'div',
            { style: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' as const, justifyContent: 'center' } },
            ...activeSocials.map(([platform, url]) =>
              React.createElement('a', { key: platform, href: url, target: '_blank', rel: 'noopener noreferrer', style: { fontSize: '22px', textDecoration: 'none' } }, SOCIAL_ICONS[platform] || '🔗')
            )
          )
        : null,
      React.createElement(
        'div',
        { style: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '12px' } },
        ...activeLinks.map((link) =>
          React.createElement(
            'a',
            {
              key: link.id,
              href: link.url,
              target: '_blank',
              rel: 'noopener noreferrer',
              style: {
                display: 'block',
                width: '100%',
                padding: '14px 24px',
                backgroundColor: theme.btn,
                color: theme.bg,
                textAlign: 'center' as const,
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '14px',
                borderRadius: btnRadius,
                boxSizing: 'border-box' as const,
              }
            },
            link.title
          )
        )
      ),
      !isPaid
        ? React.createElement(
            'p',
            { style: { color: theme.subtext, fontSize: '11px', marginTop: '40px', opacity: 0.6 } },
            'Made with ',
            React.createElement('a', { href: 'https://socialmate-six.vercel.app', target: '_blank', rel: 'noopener noreferrer', style: { color: theme.subtext, fontWeight: '700' } }, 'SocialMate')
          )
        : null
    )
  )
}
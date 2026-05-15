'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Tip = {
  id: string
  tip: string
  link?: string
  linkText?: string
}

const TIPS: Tip[] = [
  {
    id: 'multi-platform',
    tip: 'You can schedule posts to multiple platforms at once — select all your connected accounts in Compose.',
    link: '/compose',
    linkText: 'Open Compose',
  },
  {
    id: 'smart-queue',
    tip: 'The Smart Queue auto-schedules your drafts at optimal times based on platform best practices.',
    link: '/queue',
    linkText: 'Open Queue',
  },
  {
    id: 'soma-generate',
    tip: 'SOMA can generate a full week of content for you — just describe your brand in a project.',
    link: '/soma',
    linkText: 'Try SOMA',
  },
  {
    id: 'credits-reset',
    tip: 'Your AI credits reset every month on the 1st — never lose unused credits.',
    link: '/settings?tab=Plan',
    linkText: 'View plan',
  },
  {
    id: 'hashtag-suggestions',
    tip: 'Hashtag suggestions are available in Compose — click # to get 12 AI-powered suggestions.',
    link: '/compose',
    linkText: 'Try it',
  },
  {
    id: 'calendar-view',
    tip: 'The calendar view shows all your scheduled posts at a glance.',
    link: '/calendar',
    linkText: 'View calendar',
  },
  {
    id: 'brand-voice',
    tip: 'Brand Voice in Settings lets AI match your exact tone and vocabulary when generating content.',
    link: '/settings?tab=Brand+Voice',
    linkText: 'Set up Brand Voice',
  },
  {
    id: 'link-in-bio',
    tip: 'The Link in Bio builder is free on all plans — create your own landing page in minutes.',
    link: '/bio',
    linkText: 'Build your page',
  },
  {
    id: 'evergreen',
    tip: 'Evergreen Recycling automatically re-queues your best posts so your content keeps working for you.',
    link: '/queue',
    linkText: 'Set up recycling',
  },
  {
    id: 'streak',
    tip: 'The streak page tracks your posting consistency — try to keep the streak alive and watch it grow.',
    link: '/streak',
    linkText: 'Check your streak',
  },
  {
    id: 'analytics-dna',
    tip: 'The Content DNA page shows what posting style works best for your audience.',
    link: '/analytics/dna',
    linkText: 'View Content DNA',
  },
  {
    id: 'team-invite',
    tip: 'You can invite team members to your workspace — up to 5 on Pro plan.',
    link: '/team',
    linkText: 'Invite teammates',
  },
  {
    id: 'inbox-replies',
    tip: 'The inbox lets you reply to Bluesky and Mastodon mentions without leaving SocialMate.',
    link: '/inbox',
    linkText: 'Open inbox',
  },
  {
    id: 'thread-mode',
    tip: 'Compose supports thread mode — write multi-part posts natively with auto-split per platform limit.',
    link: '/compose',
    linkText: 'Write a thread',
  },
  {
    id: 'media-library',
    tip: 'The media library stores your uploaded images and videos for reuse across posts.',
    link: '/media',
    linkText: 'Open media library',
  },
  {
    id: 'bulk-scheduler',
    tip: 'Bulk Scheduler lets you paste multiple posts at once and schedule them with a single click.',
    link: '/bulk-scheduler',
    linkText: 'Try bulk scheduling',
  },
  {
    id: 'templates',
    tip: 'Post templates let you save caption formats and reuse them. You can also save a Compose draft as a template.',
    link: '/templates',
    linkText: 'Browse templates',
  },
  {
    id: 'agents-hub',
    tip: 'The Agents Hub has 8 AI agents that run automatically — from newsletter generation to inbox replies.',
    link: '/agents',
    linkText: 'Explore agents',
  },
  {
    id: 'analytics',
    tip: 'The analytics dashboard shows an SVG area chart plus platform-level engagement breakdowns.',
    link: '/analytics',
    linkText: 'View analytics',
  },
  {
    id: 'short-links',
    tip: 'The Link Shortener creates branded short links at socialmate.studio/go/[slug] with click tracking.',
    link: '/links',
    linkText: 'Create a short link',
  },
]

const LS_KEY = 'dismissed_tips'

export default function DidYouKnow() {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
      const next = TIPS.find(t => !dismissed.includes(t.id)) ?? null
      setCurrentTip(next)
    } catch {
      setCurrentTip(TIPS[0])
    }
  }, [])

  const dismiss = () => {
    if (!currentTip) return
    try {
      const dismissed: string[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
      const updated = [...dismissed, currentTip.id]
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      const next = TIPS.find(t => !updated.includes(t.id)) ?? null
      setCurrentTip(next)
    } catch {
      setCurrentTip(null)
    }
  }

  // No flash on SSR
  if (!mounted || !currentTip) return null

  return (
    <div className="relative flex items-start gap-3 bg-surface border border-theme rounded-2xl px-4 py-3.5 mb-4">
      {/* Lightbulb icon */}
      <span className="text-xl flex-shrink-0 mt-0.5">💡</span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
          Did you know?
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
          {currentTip.tip}
        </p>
        {currentTip.link && (
          <a
            href={currentTip.link}
            className="inline-block mt-2 text-xs font-bold text-black dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-all"
          >
            {currentTip.linkText ?? 'Try it →'}
          </a>
        )}
      </div>

      {/* Got it + dismiss */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <button
          onClick={dismiss}
          className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
        >
          Got it
        </button>
        <button
          onClick={dismiss}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm"
          aria-label="Dismiss tip"
        >
          ×
        </button>
      </div>
    </div>
  )
}

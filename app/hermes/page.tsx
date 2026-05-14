'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Campaign = {
  id: string
  name: string
  goal: string | null
  channels: string[]
  status: 'active' | 'paused' | 'completed'
  mode: 'draft' | 'auto'
  created_at: string
  hermes_prospects: { count: number }[]
  hermes_messages: { count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const CHANNEL_ICONS: Record<string, string> = {
  email: '📧',
  bluesky: '🦋',
  mastodon: '🐘',
}

export default function HermesPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading]     = useState(true)
  const [isAdmin, setIsAdmin]     = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/hermes'); return }
      if (user.email !== 'socialmatehq@gmail.com') { router.push('/dashboard'); return }
      setIsAdmin(true)
      fetch('/api/hermes/campaigns')
        .then(r => r.json())
        .then(d => { setCampaigns(d.campaigns ?? []); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [router])

  if (!isAdmin) return null

  const totalProspects = campaigns.reduce((s, c) => s + (c.hermes_prospects?.[0]?.count ?? 0), 0)
  const totalMessages  = campaigns.reduce((s, c) => s + (c.hermes_messages?.[0]?.count ?? 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚡</span>
              <h1 className="text-3xl font-extrabold tracking-tight">HERMES</h1>
            </div>
            <p className="text-gray-400 text-sm">Cold outreach agent — email · Bluesky · Mastodon</p>
          </div>
          <Link
            href="/hermes/campaigns/new"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-black text-sm font-extrabold rounded-xl transition-all">
            + New Campaign
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Campaigns', value: activeCampaigns },
            { label: 'Total Prospects', value: totalProspects },
            { label: 'Messages Drafted', value: totalMessages },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-2xl font-extrabold">{loading ? '–' : stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-24 bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">⚡</p>
            <h2 className="text-lg font-bold mb-2">No campaigns yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first campaign to start reaching out.</p>
            <Link
              href="/hermes/campaigns/new"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-black text-sm font-extrabold rounded-xl transition-all">
              Create first campaign →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => (
              <Link
                key={c.id}
                href={`/hermes/campaigns/${c.id}`}
                className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="font-bold text-base">{c.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${c.mode === 'auto' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-700'}`}>
                        {c.mode === 'auto' ? '⚡ Auto-send' : '✏️ Draft'}
                      </span>
                    </div>
                    {c.goal && <p className="text-xs text-gray-400 mb-2 truncate">{c.goal}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{c.hermes_prospects?.[0]?.count ?? 0} prospects</span>
                      <span>{c.hermes_messages?.[0]?.count ?? 0} messages</span>
                      <span className="flex items-center gap-1">
                        {(c.channels ?? []).map(ch => (
                          <span key={ch} title={ch}>{CHANNEL_ICONS[ch] ?? ch}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-600 text-lg">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

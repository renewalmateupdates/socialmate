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
  active:    'bg-green-500/10 text-green-400 border-green-500/20',
  paused:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const CHANNEL_ICONS: Record<string, string> = {
  email:    '📧',
  bluesky:  '🦋',
  mastodon: '🐘',
}

const CHANNEL_LABELS: Record<string, string> = {
  email:    'Email',
  bluesky:  'Bluesky',
  mastodon: 'Mastodon',
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

  const totalProspects  = campaigns.reduce((s, c) => s + (c.hermes_prospects?.[0]?.count ?? 0), 0)
  const totalMessages   = campaigns.reduce((s, c) => s + (c.hermes_messages?.[0]?.count ?? 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  const stats = [
    { icon: '⚡', label: 'Active Campaigns', value: activeCampaigns,  color: 'text-amber-400' },
    { icon: '👤', label: 'Total Prospects',  value: totalProspects,   color: 'text-blue-400' },
    { icon: '✉️',  label: 'Messages Created', value: totalMessages,    color: 'text-purple-400' },
    { icon: '🏹', label: 'Channels Live',    value: 3,                color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back nav */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 w-fit">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl">⚡</div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">HERMES</h1>
                <p className="text-xs text-gray-500 mt-0.5">Cold outreach — 📧 Email · 🦋 Bluesky · 🐘 Mastodon</p>
              </div>
            </div>
          </div>
          <Link
            href="/hermes/campaigns/new"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-amber-400/10 flex items-center gap-2">
            + New Campaign
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-2xl font-extrabold ${s.color}`}>
                  {loading ? '–' : s.value}
                </span>
              </div>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Campaigns</h2>
          {campaigns.length > 0 && (
            <span className="text-xs text-gray-600">{campaigns.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-2xl mx-auto mb-4">⚡</div>
            <h2 className="text-base font-bold mb-1">No campaigns yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Create a campaign, add prospects, let HERMES write and send your outreach.
            </p>
            <Link
              href="/hermes/campaigns/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-extrabold rounded-xl transition-all">
              Create first campaign →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => {
              const prospectCount = c.hermes_prospects?.[0]?.count ?? 0
              const messageCount  = c.hermes_messages?.[0]?.count ?? 0
              return (
                <Link
                  key={c.id}
                  href={`/hermes/campaigns/${c.id}`}
                  className="group block bg-gray-900 border border-gray-800 hover:border-amber-400/30 rounded-2xl p-5 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name + badges */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-base group-hover:text-amber-400 transition-colors">{c.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[c.status]}`}>
                          {c.status}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                          c.mode === 'auto'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-700'
                        }`}>
                          {c.mode === 'auto' ? '⚡ Auto-send' : '✏️ Draft'}
                        </span>
                      </div>

                      {/* Goal */}
                      {c.goal && (
                        <p className="text-xs text-gray-400 mb-2 truncate">{c.goal}</p>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">👤 {prospectCount} prospect{prospectCount !== 1 ? 's' : ''}</span>
                        <span className="flex items-center gap-1">✉️ {messageCount} message{messageCount !== 1 ? 's' : ''}</span>
                        <span className="flex items-center gap-1">
                          {(c.channels ?? []).map(ch => (
                            <span key={ch} title={CHANNEL_LABELS[ch] ?? ch} className="flex items-center gap-0.5">
                              {CHANNEL_ICONS[ch] ?? ch}
                            </span>
                          ))}
                        </span>
                        {c.created_at && (
                          <span className="text-gray-600">
                            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-600 group-hover:text-amber-400 text-lg transition-colors mt-1">›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Footer tip */}
        {!loading && campaigns.length > 0 && (
          <p className="text-xs text-gray-600 text-center mt-8">
            HERMES runs follow-up sequences daily at 9am UTC · Auto-discover runs every Monday 10am UTC
          </p>
        )}
      </div>
    </div>
  )
}

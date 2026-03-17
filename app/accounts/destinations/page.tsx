'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Destination = {
  id: string
  platform: string
  label: string
  destination_id: string
  webhook_url?: string
  metadata?: Record<string, any>
}

const PLATFORM_META: Record<string, { icon: string; label: string; webhookBased: boolean; helpText: string; placeholder: string }> = {
  discord: {
    icon: '💬',
    label: 'Discord',
    webhookBased: true,
    helpText: 'Go to your Discord server → Channel Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL',
    placeholder: 'https://discord.com/api/webhooks/...',
  },
  telegram: {
    icon: '✈️',
    label: 'Telegram',
    webhookBased: false,
    helpText: 'Enter your Telegram group or channel username (e.g. @mygroupname) or numeric chat ID',
    placeholder: '@mychannelname or -1001234567890',
  },
}

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [platform, setPlatform] = useState<'discord' | 'telegram'>('discord')
  const [label, setLabel] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('post_destinations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setDestinations(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    const meta = PLATFORM_META[platform]
    if (!label.trim()) { showToast('Give this destination a label', 'error'); return }
    if (meta.webhookBased && !webhookUrl.trim()) { showToast('Webhook URL is required', 'error'); return }
    if (!meta.webhookBased && !destinationId.trim()) { showToast('Channel/group ID is required', 'error'); return }

    setSaving(true)
    const { data, error } = await supabase
      .from('post_destinations')
      .insert({
        user_id: userId,
        platform,
        label: label.trim(),
        destination_id: meta.webhookBased ? webhookUrl.trim() : destinationId.trim(),
        webhook_url: meta.webhookBased ? webhookUrl.trim() : null,
      })
      .select()
      .single()

    if (error) { showToast('Failed to save destination', 'error'); setSaving(false); return }
    setDestinations(prev => [data, ...prev])
    setLabel('')
    setWebhookUrl('')
    setDestinationId('')
    setShowForm(false)
    showToast('Destination saved', 'success')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('post_destinations').delete().eq('id', id)
    setDestinations(prev => prev.filter(d => d.id !== id))
    setConfirmDelete(null)
    setDeleting(null)
    showToast('Destination removed', 'success')
  }

  const byPlatform = destinations.reduce((acc, d) => {
    if (!acc[d.platform]) acc[d.platform] = []
    acc[d.platform].push(d)
    return acc
  }, {} as Record<string, Destination[]>)

  const meta = PLATFORM_META[platform]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/accounts" className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                  ← Accounts
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Post Destinations</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Configure where SocialMate sends posts on Discord and Telegram
              </p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="self-start sm:self-auto bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + Add Destination
              </button>
            )}
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold text-blue-700 mb-2">How destinations work</p>
            <div className="space-y-1.5">
              {[
                { icon: '💬', text: 'Discord — create a webhook in your channel settings and paste the URL here. SocialMate will post to that channel directly.' },
                { icon: '✈️', text: 'Telegram — add @SocialMateBot to your group or channel, then enter the group username or chat ID here.' },
              ].map(item => (
                <div key={item.icon} className="flex items-start gap-2 text-xs text-blue-600">
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ADD FORM */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-extrabold mb-4">Add Destination</h2>
              <div className="space-y-4">

                {/* PLATFORM TOGGLE */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Platform</label>
                  <div className="flex gap-2">
                    {(['discord', 'telegram'] as const).map(p => (
                      <button key={p} onClick={() => setPlatform(p)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          platform === p ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}>
                        <span>{PLATFORM_META[p].icon}</span>
                        <span>{PLATFORM_META[p].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* LABEL */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Destination Label
                  </label>
                  <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                    placeholder={platform === 'discord' ? 'e.g. #announcements in My Server' : 'e.g. My Community Channel'}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                  <p className="text-xs text-gray-400 mt-1">This is just a name to help you identify it in Compose</p>
                </div>

                {/* WEBHOOK / ID */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                    {meta.webhookBased ? 'Webhook URL' : 'Channel / Group ID'}
                  </label>
                  <input
                    type={meta.webhookBased ? 'url' : 'text'}
                    value={meta.webhookBased ? webhookUrl : destinationId}
                    onChange={e => meta.webhookBased ? setWebhookUrl(e.target.value) : setDestinationId(e.target.value)}
                    placeholder={meta.placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 font-mono" />
                </div>

                {/* HELP */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">How to get this:</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{meta.helpText}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : 'Save Destination'}
                  </button>
                  <button onClick={() => { setShowForm(false); setLabel(''); setWebhookUrl(''); setDestinationId('') }}
                    className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESTINATIONS LIST */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-16" />)}
            </div>
          ) : destinations.length === 0 && !showForm ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📍</div>
              <p className="text-sm font-bold mb-1">No destinations yet</p>
              <p className="text-xs text-gray-400 mb-5">
                Add a Discord webhook or Telegram channel so SocialMate knows where to send your posts.
              </p>
              <button onClick={() => setShowForm(true)}
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Add your first destination →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byPlatform).map(([plat, dests]) => {
                const pm = PLATFORM_META[plat] || { icon: '📱', label: plat }
                return (
                  <div key={plat}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{pm.icon}</span>
                      <h2 className="text-sm font-bold">{pm.label}</h2>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {dests.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dests.map(d => {
                        const isConfirming = confirmDelete === d.id
                        const isDeleting   = deleting === d.id
                        return (
                          <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-all">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{d.label}</p>
                                <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                                  {d.webhook_url || d.destination_id}
                                </p>
                              </div>
                              {!isConfirming && (
                                <button onClick={() => setConfirmDelete(d.id)}
                                  className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all flex-shrink-0">
                                  Remove
                                </button>
                              )}
                            </div>
                            {isConfirming && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                                <p className="text-xs text-red-600 font-semibold flex-1">
                                  Remove "{d.label}"? Posts scheduled to this destination will fail.
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button onClick={() => handleDelete(d.id)} disabled={isDeleting}
                                    className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                                    {isDeleting
                                      ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Removing...</>
                                      : 'Yes, remove'}
                                  </button>
                                  <button onClick={() => setConfirmDelete(null)}
                                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

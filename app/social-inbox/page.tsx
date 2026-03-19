'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

type Message = {
  id: string
  platform: string
  type: 'comment' | 'mention' | 'reply'
  author: string
  content: string
  post_url?: string
  received_at: string
  read: boolean
}

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  mastodon: '🐘',
  discord:  '💬',
  telegram: '✈️',
  reddit:   '🤖',
  youtube:  '▶️',
  linkedin: '💼',
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function SocialInbox() {
  const router  = useRouter()
  const [loading, setLoading]       = useState(true)
  const [messages, setMessages]     = useState<Message[]>([])
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [filter, setFilter]         = useState<'all' | 'unread' | 'mention' | 'reply'>('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [fetching, setFetching]     = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Get connected platforms
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('platform, access_token, refresh_token, platform_user_id')
        .eq('user_id', user.id)

      const platforms = (accounts || []).map((a: any) => a.platform)
      setConnectedPlatforms(platforms)

      // Fetch real Bluesky notifications if connected
      const bsky = (accounts || []).find((a: any) => a.platform === 'bluesky')
      if (bsky) {
        setFetching(true)
        try {
          const res = await fetch('/api/inbox/bluesky', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            setMessages(data.messages || [])
          }
        } catch (e) {
          console.error('Bluesky inbox fetch failed', e)
        }
        setFetching(false)
      }

      setLoading(false)
    }
    init()
  }, [router])

  const markRead = (id: string) =>
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))

  const markAllRead = () =>
    setMessages(prev => prev.map(m => ({ ...m, read: true })))

  const unreadCount = messages.filter(m => !m.read).length

  const filtered = messages.filter(m => {
    if (filter === 'unread'  && m.read)            return false
    if (filter === 'mention' && m.type !== 'mention') return false
    if (filter === 'reply'   && m.type !== 'reply')   return false
    if (platformFilter !== 'all' && m.platform !== platformFilter) return false
    return true
  })

  const activePlatforms = Array.from(new Set(messages.map(m => m.platform)))

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const hasNoAccounts = connectedPlatforms.length === 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📬</span>
                <h1 className="text-2xl font-extrabold tracking-tight">Social Inbox</h1>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <p className="text-sm text-gray-400">Mentions and replies from your connected platforms.</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-bold text-gray-500 hover:text-black transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* NO ACCOUNTS CONNECTED */}
          {hasNoAccounts ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-bold text-gray-700 mb-1">No platforms connected yet</p>
              <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto leading-relaxed">
                Connect your social accounts to start seeing mentions, replies, and comments here in one place.
              </p>
              <Link href="/accounts"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Connect accounts →
              </Link>
            </div>
          ) : (
            <>
              {/* STATS */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total',    value: messages.length },
                  { label: 'Unread',   value: unreadCount },
                  { label: 'Mentions', value: messages.filter(m => m.type === 'mention').length },
                  { label: 'Replies',  value: messages.filter(m => m.type === 'reply').length },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* FILTERS */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1">
                  {(['all', 'unread', 'mention', 'reply'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
                {activePlatforms.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1">
                    <button onClick={() => setPlatformFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        platformFilter === 'all' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                      }`}>
                      All
                    </button>
                    {activePlatforms.map(p => (
                      <button key={p} onClick={() => setPlatformFilter(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          platformFilter === p ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                        }`}>
                        {PLATFORM_ICONS[p]} {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MESSAGES */}
              {fetching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm font-bold text-gray-700 mb-1">
                    {messages.length === 0 ? 'No activity yet' : 'Nothing matches this filter'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {messages.length === 0
                      ? 'When people mention or reply to you, it will show up here.'
                      : 'Try changing the filter above.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(msg => (
                    <div key={msg.id} onClick={() => markRead(msg.id)}
                      className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-gray-300 ${
                        !msg.read ? 'border-black' : 'border-gray-100'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                          {PLATFORM_ICONS[msg.platform] || '📱'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-extrabold">{msg.author}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              msg.type === 'mention' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {msg.type}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">{formatTime(msg.received_at)}</span>
                            {!msg.read && <div className="w-2 h-2 bg-black rounded-full" />}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{msg.content}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-400 capitalize">{msg.platform}</span>
                            {msg.post_url && (
                              <a href={msg.post_url} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-xs font-bold text-black hover:underline">
                                View post →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COMING SOON BANNER */}
              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 font-semibold">
                  More platforms coming soon — connect your accounts to expand your inbox.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
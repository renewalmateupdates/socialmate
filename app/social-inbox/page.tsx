'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Message = {
  id: string
  platform: string
  type: 'comment' | 'mention' | 'dm'
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

const SAMPLE_MESSAGES: Message[] = [
  { id: '1', platform: 'bluesky',  type: 'comment',  author: '@creator.bsky',    content: 'This is such a great post! Really helped me understand the topic.',          received_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),   read: false },
  { id: '2', platform: 'mastodon', type: 'mention',  author: '@user@mastodon.social', content: '@yourhandle have you seen this? Thought of you immediately.',            received_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),   read: false },
  { id: '3', platform: 'discord',  type: 'comment',  author: 'CoolUser#1234',    content: 'Just shared this in our server — everyone loved it!',                        received_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),  read: true  },
  { id: '4', platform: 'bluesky',  type: 'mention',  author: '@another.bsky',    content: 'Replying to your thread — I think there\'s another angle worth exploring.', received_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),  read: true  },
  { id: '5', platform: 'telegram', type: 'comment',  author: 'TelegramUser',     content: 'Can you post more content like this? Subscribed to the channel just for it.', received_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(), read: true  },
]

export default function SocialInbox() {
  const router = useRouter()
  const { plan } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES)
  const [filter, setFilter] = useState<'all' | 'unread' | 'comment' | 'mention' | 'dm'>('all')
  const [platformFilter, setPlatformFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const markRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  const markAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })))
  }

  const unreadCount = messages.filter(m => !m.read).length

  const filtered = messages.filter(m => {
    if (filter === 'unread' && m.read) return false
    if (filter === 'comment' && m.type !== 'comment') return false
    if (filter === 'mention' && m.type !== 'mention') return false
    if (filter === 'dm' && m.type !== 'dm') return false
    if (platformFilter !== 'all' && m.platform !== platformFilter) return false
    return true
  })

  const platforms = Array.from(new Set(messages.map(m => m.platform)))

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📬</span>
                <h1 className="text-2xl font-extrabold tracking-tight">Social Inbox</h1>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <p className="text-sm text-gray-400">Comments and mentions from all your connected platforms in one place.</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs font-bold text-gray-500 hover:text-black transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total',    value: messages.length   },
              { label: 'Unread',   value: unreadCount       },
              { label: 'Comments', value: messages.filter(m => m.type === 'comment').length  },
              { label: 'Mentions', value: messages.filter(m => m.type === 'mention').length  },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1">
              {(['all', 'unread', 'comment', 'mention'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1">
              <button onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  platformFilter === 'all' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                }`}>
                All platforms
              </button>
              {platforms.map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    platformFilter === p ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                  }`}>
                  {PLATFORM_ICONS[p]} {p}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-bold text-gray-700 mb-1">No messages match this filter</p>
              <p className="text-xs text-gray-400">Try changing the filter above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(msg => (
                <div key={msg.id}
                  onClick={() => markRead(msg.id)}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-gray-300 ${
                    !msg.read ? 'border-black' : 'border-gray-100'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {PLATFORM_ICONS[msg.platform] || '📱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-extrabold text-gray-900">{msg.author}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          msg.type === 'comment' ? 'bg-blue-50 text-blue-600' :
                          msg.type === 'mention' ? 'bg-purple-50 text-purple-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {msg.type}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{formatTime(msg.received_at)}</span>
                        {!msg.read && (
                          <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-2">
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

          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-400 font-semibold">
              Live inbox sync coming soon — currently showing recent activity. Connect more platforms to see more messages.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
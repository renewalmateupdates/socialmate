'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const PLATFORMS = ['Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'Threads']

function ComposeInner() {
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('')
const searchParams = useSearchParams()
const [scheduledAt, setScheduledAt] = useState(searchParams.get('date') || '')
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSave = async (saveStatus: 'draft' | 'scheduled') => {
    if (!content) return setMessage('Please write something first!')
    if (saveStatus === 'scheduled' && !platform) return setMessage('Please select a platform!')
    if (saveStatus === 'scheduled' && !scheduledAt) return setMessage('Please pick a date and time!')

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content,
      platform: platform || 'none',
      scheduled_at: scheduledAt || null,
      status: saveStatus
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(saveStatus === 'draft' ? 'Draft saved!' : 'Post scheduled!')
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose", active: true },
            { icon: "📂", label: "Drafts", href: "/drafts" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-black transition-colors text-sm">← Back</Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Post</h1>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          {/* PLATFORM SELECT */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${platform === p ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            />
            <div className="text-xs text-gray-400 text-right mt-1">{content.length} characters</div>
          </div>

          {/* SCHEDULE */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {message && (
            <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${message.includes('!') && !message.includes('Please') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-black transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('scheduled')}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:opacity-80 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Schedule Post →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function Compose() {
  return (
    <Suspense>
      <ComposeInner />
    </Suspense>
  )
}
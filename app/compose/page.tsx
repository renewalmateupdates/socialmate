'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const PLATFORMS = ['Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'Threads']

function ComposeInner() {
  const searchParams = useSearchParams()
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('')
  const [scheduledAt, setScheduledAt] = useState(searchParams.get('date') || '')
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSave = async (saveStatus: 'draft' | 'scheduled') => {
    if (!content) return setMessage('Please write something first!')
    if (saveStatus === 'scheduled' && !platform) return setMessage('Please select a platform!')
    if (saveStatus === 'scheduled' && !scheduledAt) return setMessage('Please pick a date and time!')

    if (saveStatus === 'scheduled') {
      const scheduledDate = new Date(scheduledAt)
      const twoWeeksFromNow = new Date()
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
      if (scheduledDate > twoWeeksFromNow) {
        return setMessage('⚡ Free plan allows scheduling up to 2 weeks out. Upgrade to Pro for 3 months, or Agency for unlimited!')
      }
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content,
      platform,
      scheduled_at: scheduledAt || null,
      status: saveStatus,
    })

    if (error) {
      setMessage('Something went wrong. Please try again.')
    } else {
      setMessage(saveStatus === 'draft' ? '✅ Draft saved!' : '✅ Post scheduled!')
      setContent('')
      setPlatform('')
      setScheduledAt('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            <Link key={item.label} href={(item as any).href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(item as any).active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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
        <div className="p-3 border-t border-gray-100">
          <Link href="/compose" className="w-full block text-center bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>
      </div>

      <div className="ml-56 flex-1 p-8 max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-black transition-colors">← Back</button>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Post</h1>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${platform === p ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What do you want to share?"
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            />
            <div className="text-xs text-gray-400 text-right mt-1">{content.length} characters</div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {message && (
            <div className={`text-sm px-4 py-3 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700' : message.includes('⚡') ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="border border-gray-200 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl hover:border-gray-400 transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('scheduled')}
              disabled={loading}
              className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
            >
              Schedule Post →
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
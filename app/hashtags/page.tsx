'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Collection = {
  id: string
  name: string
  hashtags: string[]
  created_at: string
}

export default function HashtagCollections() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState<Collection[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 3

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('hashtag_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setCollections(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openNew = () => {
    setEditingId(null)
    setName('')
    setHashtags([])
    setHashtagInput('')
    setShowModal(true)
  }

  const openEdit = (col: Collection) => {
    setEditingId(col.id)
    setName(col.name)
    setHashtags(col.hashtags)
    setHashtagInput('')
    setShowModal(true)
  }

  const addHashtag = (input: string) => {
    const tags = input
      .split(/[\s,]+/)
      .map(t => t.trim().replace(/^#*/, '#').toLowerCase())
      .filter(t => t.length > 1 && !hashtags.includes(t))
    if (tags.length) setHashtags(prev => [...prev, ...tags])
    setHashtagInput('')
  }

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag))
  }

  const handleSave = async () => {
    if (!name.trim()) { showToast('Please enter a collection name', 'error'); return }
    if (hashtags.length === 0) { showToast('Add at least one hashtag', 'error'); return }
    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('hashtag_collections')
        .update({ name: name.trim(), hashtags })
        .eq('id', editingId)
      if (error) { showToast('Failed to update collection', 'error'); setSaving(false); return }
      setCollections(prev => prev.map(c => c.id === editingId ? { ...c, name: name.trim(), hashtags } : c))
      showToast('Collection updated!', 'success')
    } else {
      const { data, error } = await supabase
        .from('hashtag_collections')
        .insert({ user_id: user.id, name: name.trim(), hashtags })
        .select()
        .single()
      if (error) { showToast('Failed to create collection', 'error'); setSaving(false); return }
      setCollections(prev => [data, ...prev])
      showToast('Collection created!', 'success')
    }

    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('hashtag_collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
    showToast('Collection deleted', 'success')
  }

  const handleCopy = (col: Collection) => {
    navigator.clipboard.writeText(col.hashtags.join(' '))
    setCopiedId(col.id)
    setTimeout(() => setCopiedId(null), 2000)
    showToast('Hashtags copied!', 'success')
  }

  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.hashtags.some(h => h.includes(search.toLowerCase()))
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
{ icon: "⏳", label: "Queue", href: "/queue" },
{ icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
{ icon: "🖼️", label: "Media Library", href: "/media" },
{ icon: "📝", label: "Templates", href: "/templates" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags", active: true },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
{ icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Hashtag Collections</h1>
            <p className="text-sm text-gray-400 mt-0.5">Save and reuse hashtag groups across your posts</p>
          </div>
          <button onClick={openNew} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Collection
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))
          ) : (
            [
              { label: "Collections", value: collections.length.toString(), sub: "saved groups", icon: "📁" },
              { label: "Total Hashtags", value: collections.reduce((acc, c) => acc + c.hashtags.length, 0).toString(), sub: "across all collections", icon: "#️⃣" },
              { label: "Avg per Collection", value: collections.length ? Math.round(collections.reduce((acc, c) => acc + c.hashtags.length, 0) / collections.length).toString() : '0', sub: "hashtags per group", icon: "📊" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </div>
            ))
          )}
        </div>

        {/* SEARCH */}
        <div className="relative mb-6 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search collections or hashtags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
          />
        </div>

        {/* COLLECTIONS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonBox key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{search ? '🔍' : '#️⃣'}</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {search ? 'No collections match your search' : 'No hashtag collections yet'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {search ? 'Try a different search term.' : 'Create collections of hashtags to quickly add them to your posts. Great for recurring themes and campaigns.'}
            </p>
            {!search && (
              <button onClick={openNew} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Create Your First Collection →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(col => (
              <div key={col.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-200 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{col.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{col.hashtags.length} hashtag{col.hashtags.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(col)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all text-sm">✏️</button>
                    <button onClick={() => handleDelete(col.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-sm">🗑️</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 flex-1">
                  {col.hashtags.slice(0, 12).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">{tag}</span>
                  ))}
                  {col.hashtags.length > 12 && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg">+{col.hashtags.length - 12} more</span>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(col)}
                  className={`w-full text-sm font-semibold py-2 rounded-xl border transition-all ${copiedId === col.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  {copiedId === col.id ? '✅ Copied!' : '📋 Copy All Hashtags'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-base tracking-tight">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl leading-none transition-colors">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* NAME */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g. Travel, Fitness, Morning Posts..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* HASHTAG INPUT */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Add Hashtags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type hashtags separated by spaces or commas..."
                    value={hashtagInput}
                    onChange={e => setHashtagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                        e.preventDefault()
                        if (hashtagInput.trim()) addHashtag(hashtagInput)
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                  />
                  <button
                    onClick={() => { if (hashtagInput.trim()) addHashtag(hashtagInput) }}
                    className="px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Press Enter, Space, or comma to add · # is added automatically</p>
              </div>

              {/* HASHTAG CHIPS */}
              {hashtags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{hashtags.length} Hashtags</label>
                    <button onClick={() => setHashtags([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {hashtags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-medium">
                        {tag}
                        <button onClick={() => removeHashtag(tag)} className="text-gray-400 hover:text-red-500 transition-colors leading-none">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type MediaItem = {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  size: number
  created_at: string
}

type FilterType = 'all' | 'image' | 'video'

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MediaLibrary() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

      const { data: files, error } = await supabase.storage
        .from('media')
        .list(`${user.id}/`, { sortBy: { column: 'created_at', order: 'desc' } })

      if (!error && files) {
        const items: MediaItem[] = files
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(f => {
            const ext = f.name.split('.').pop()?.toLowerCase() || ''
            const isVideo = ['mp4', 'mov', 'webm', 'avi'].includes(ext)
            const { data } = supabase.storage.from('media').getPublicUrl(`${user.id}/${f.name}`)
            return {
              id: f.id || f.name,
              name: f.name,
              url: data.publicUrl,
              type: isVideo ? 'video' : 'image',
              size: f.metadata?.size || 0,
              created_at: f.created_at || new Date().toISOString(),
            }
          })
        setMedia(items)
      }
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
    const maxSize = 50 * 1024 * 1024

    const validFiles = Array.from(files).filter(f => {
      if (!allowed.includes(f.type)) { showToast(`${f.name}: unsupported file type`, 'error'); return false }
      if (f.size > maxSize) { showToast(`${f.name}: file too large (max 50MB)`, 'error'); return false }
      return true
    })

    if (validFiles.length === 0) return
    setUploading(true)
    setUploadProgress(0)

    const newItems: MediaItem[] = []
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${user.id}/${filename}`

      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) { showToast(`Failed to upload ${file.name}`, 'error'); continue }

      const { data } = supabase.storage.from('media').getPublicUrl(path)
      newItems.push({
        id: filename,
        name: filename,
        url: data.publicUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        created_at: new Date().toISOString(),
      })
      setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100))
    }

    setMedia(prev => [...newItems, ...prev])
    setUploading(false)
    setUploadProgress(0)
    showToast(`${newItems.length} file${newItems.length !== 1 ? 's' : ''} uploaded!`, 'success')
  }

  const handleDelete = async () => {
    if (!user || selected.size === 0) return
    const toDelete = media.filter(m => selected.has(m.id))
    await supabase.storage.from('media').remove(toDelete.map(m => `${user.id}/${m.name}`))
    setMedia(prev => prev.filter(m => !selected.has(m.id)))
    setSelected(new Set())
    showToast(`${toDelete.length} file${toDelete.length !== 1 ? 's' : ''} deleted`, 'success')
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = media.filter(m => {
    const matchType = filter === 'all' || m.type === filter
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

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
            { icon: "🖼️", label: "Media Library", href: "/media", active: true },
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
            <h1 className="text-2xl font-extrabold tracking-tight">Media Library</h1>
            <p className="text-sm text-gray-400 mt-0.5">Upload and manage your images and videos</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + Upload Files
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))
          ) : (
            [
              { label: "Total Files", value: media.length.toString(), sub: "in your library", icon: "🗂️" },
              { label: "Images", value: media.filter(m => m.type === 'image').length.toString(), sub: "photos & graphics", icon: "🖼️" },
              { label: "Videos", value: media.filter(m => m.type === 'video').length.toString(), sub: "clips & reels", icon: "🎬" },
              { label: "Storage Used", value: formatBytes(media.reduce((acc, m) => acc + m.size, 0)), sub: "of unlimited free", icon: "💾" },
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

        {/* DRAG & DROP ZONE */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center cursor-pointer transition-all ${dragOver ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="text-2xl">⏳</div>
              <p className="text-sm font-semibold text-gray-700">Uploading... {uploadProgress}%</p>
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-3">{dragOver ? '📥' : '☁️'}</div>
              <p className="text-sm font-semibold text-gray-700 mb-1">{dragOver ? 'Drop to upload' : 'Drag & drop files here'}</p>
              <p className="text-xs text-gray-400">or click to browse · Images & videos up to 50MB</p>
            </>
          )}
        </div>

        {/* FILTER + SEARCH */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
            {(['all', 'image', 'video'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
              >
                {f === 'all' ? 'All' : f === 'image' ? '🖼️ Images' : '🎬 Videos'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <button onClick={handleDelete} className="text-sm font-semibold text-red-500 hover:text-red-700 px-3 py-2 rounded-xl border border-red-200 hover:border-red-400 transition-all">
                🗑️ Delete {selected.size} selected
              </button>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white w-52"
              />
            </div>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5,6,7,8,9,10].map(i => <SkeletonBox key={i} className="aspect-square rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{search ? '🔍' : '🖼️'}</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {search ? 'No files match your search' : 'Your media library is empty'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {search ? 'Try a different search term or clear your filter.' : 'Upload images and videos to reuse them across your posts.'}
            </p>
            {!search && (
              <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Upload Your First File →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(item => (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden bg-white border-2 transition-all cursor-pointer ${selected.has(item.id) ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <button
                  onClick={e => { e.stopPropagation(); toggleSelect(item.id) }}
                  className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected.has(item.id) ? 'bg-black border-black' : 'bg-white border-gray-300 opacity-0 group-hover:opacity-100'}`}
                >
                  {selected.has(item.id) && <span className="text-white text-xs">✓</span>}
                </button>
                <button
                  onClick={() => setPreviewItem(item)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 bg-white rounded-lg shadow flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100"
                >
                  ⛶
                </button>
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden" onClick={() => setPreviewItem(item)}>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <span className="text-3xl">🎬</span>
                      <span className="text-xs">Video</span>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-50">
                  <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(item.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-sm tracking-tight truncate max-w-xs">{previewItem.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(previewItem.size)} · {formatDate(previewItem.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewItem.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                  Open ↗
                </a>
                <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-black text-xl leading-none px-1 transition-colors">×</button>
              </div>
            </div>
            <div className="bg-gray-50 flex items-center justify-center p-4 min-h-64">
              {previewItem.type === 'image' ? (
                <img src={previewItem.url} alt={previewItem.name} className="max-h-96 max-w-full object-contain rounded-xl" />
              ) : (
                <video src={previewItem.url} controls className="max-h-96 max-w-full rounded-xl" />
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(previewItem.url); showToast('URL copied!', 'success') }}
                className="flex-1 text-sm font-semibold py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-all"
              >
                📋 Copy URL
              </button>
              <Link href={`/compose?media=${encodeURIComponent(previewItem.url)}`} className="flex-1 text-sm font-semibold py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all text-center">
                ✏️ Use in Post
              </Link>
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
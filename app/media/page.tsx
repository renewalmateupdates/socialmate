'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type MediaFile = {
  id: string
  name: string
  url: string
  size: number
  type: string
  created_at: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Media() {
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<MediaFile | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await loadFiles(user.id)
      setLoading(false)
    }
    getData()
  }, [])

  const loadFiles = async (userId: string) => {
    const { data, error } = await supabase.storage.from('media').list(userId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    if (error || !data) return
    const mapped = data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
      id: f.id || f.name,
      name: f.name,
      url: supabase.storage.from('media').getPublicUrl(`${userId}/${f.name}`).data.publicUrl,
      size: f.metadata?.size || 0,
      type: f.metadata?.mimetype || 'image/jpeg',
      created_at: f.created_at || new Date().toISOString(),
    }))
    setFiles(mapped)
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpload = async (uploadFiles: FileList | File[]) => {
    const arr = Array.from(uploadFiles)
    const allowed = arr.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (allowed.length === 0) { showToast('Only images and videos are allowed', 'error'); return }
    setUploading(true)
    let uploaded = 0
    for (const file of allowed) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(`${user.id}/${fileName}`, file)
      if (!error) uploaded++
    }
    await loadFiles(user.id)
    setUploading(false)
    showToast(`${uploaded} file${uploaded !== 1 ? 's' : ''} uploaded!`, 'success')
  }

  const handleDelete = async (file: MediaFile) => {
    await supabase.storage.from('media').remove([`${user.id}/${file.name}`])
    setFiles(prev => prev.filter(f => f.id !== file.id))
    setPreview(null)
    showToast('File deleted', 'success')
  }

  const handleBulkDelete = async () => {
    const toDelete = files.filter(f => selected.has(f.id))
    const paths = toDelete.map(f => `${user.id}/${f.name}`)
    await supabase.storage.from('media').remove(paths)
    setFiles(prev => prev.filter(f => !selected.has(f.id)))
    setSelected(new Set())
    showToast(`${toDelete.length} file${toDelete.length !== 1 ? 's' : ''} deleted`, 'success')
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    showToast('URL copied to clipboard!', 'success')
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }

  const filtered = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'image' && f.type.startsWith('image/')) || (filter === 'video' && f.type.startsWith('video/'))
    return matchSearch && matchFilter
  })

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const imageCount = files.filter(f => f.type.startsWith('image/')).length
  const videoCount = files.filter(f => f.type.startsWith('video/')).length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Media Library</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${files.length} file${files.length !== 1 ? 's' : ''} · ${formatBytes(totalSize)}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {uploading ? '⏳ Uploading...' : '⬆️ Upload'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
              [
                { label: 'Total Files', value: files.length, icon: '🗂️' },
                { label: 'Images', value: imageCount, icon: '🖼️' },
                { label: 'Videos', value: videoCount, icon: '🎬' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    <span>{stat.icon}</span>
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                </div>
              ))
            )}
          </div>

          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all ${dragOver ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-400'}`}>
            <div className="text-2xl mb-1">📁</div>
            <p className="text-sm font-semibold text-gray-500">Drag & drop files here</p>
            <p className="text-xs text-gray-400 mt-0.5">Images and videos supported</p>
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white" />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
              {(['all', 'image', 'video'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                  {f === 'all' ? 'All' : f === 'image' ? '🖼️ Images' : '🎬 Videos'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 ml-auto">
              <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${view === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>⊞</button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${view === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>☰</button>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="bg-black text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-4">
              <span className="text-sm font-semibold">{selected.size} selected</span>
              <button onClick={handleBulkDelete} className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
                🗑️ Delete Selected
              </button>
              <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-lg leading-none ml-auto">×</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonBox key={i} className="aspect-square rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">{search ? '🔍' : '🖼️'}</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">{search ? 'No files match your search' : 'No media yet'}</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                {search ? 'Try a different search term.' : 'Upload images and videos to use in your posts.'}
              </p>
              {!search && (
                <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                  Upload Your First File →
                </button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(file => (
                <div key={file.id}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${selected.has(file.id) ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setPreview(file)}>
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center"><span className="text-4xl">🎬</span></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-start justify-between p-2">
                    <input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-black opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                      <button onClick={e => { e.stopPropagation(); handleCopyUrl(file.url) }} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-xs hover:bg-gray-100 transition-all">📋</button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all">
                    <p className="text-white text-xs font-semibold truncate">{file.name}</p>
                    <p className="text-white/70 text-xs">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {filtered.map((file, i) => (
                <div key={file.id}
                  className={`flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-all group cursor-pointer ${i !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
                  onClick={() => setPreview(file)}>
                  <input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded accent-black cursor-pointer flex-shrink-0" />
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)} · {timeAgo(file.created_at)}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{file.type.split('/')[0]}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={e => { e.stopPropagation(); handleCopyUrl(file.url) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm">📋</button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(file) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold truncate max-w-xs">{preview.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(preview.size)} · {preview.type} · {timeAgo(preview.created_at)}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6">
              {preview.type.startsWith('image/') ? (
                <img src={preview.url} alt={preview.name} className="w-full rounded-xl max-h-72 object-contain bg-gray-50" />
              ) : (
                <video src={preview.url} controls className="w-full rounded-xl max-h-72 bg-black" />
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => handleCopyUrl(preview.url)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">📋 Copy URL</button>
              <a href={preview.url} download={preview.name} target="_blank" rel="noreferrer" className="flex-1 py-2.5 text-sm font-semibold text-center border border-gray-200 rounded-xl hover:border-gray-400 transition-all">⬇️ Download</a>
              <button onClick={() => handleDelete(preview)} className="py-2.5 px-4 text-sm font-semibold text-red-400 border border-red-100 rounded-xl hover:border-red-300 transition-all">🗑️</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

const FILTERS = ['All', 'Images', 'Videos']
const MAX_FILE_SIZE_MB = 50
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [userId, setUserId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  // M2: inline confirm for delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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
        .from('media_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFiles(data || [])
      setLoading(false)
    }
    load()
  }, [router]) // M1: fixed

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length || !userId) return

    // M3: validate type and size before uploading anything
    const invalid = selected.filter(f => !ACCEPTED_TYPES.includes(f.type))
    const oversized = selected.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    if (invalid.length) {
      showToast(`Unsupported file type: ${invalid.map(f => f.name).join(', ')}`, 'error')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (oversized.length) {
      showToast(`File too large (max ${MAX_FILE_SIZE_MB}MB): ${oversized.map(f => f.name).join(', ')}`, 'error')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    let successCount = 0
    for (const file of selected) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: false })
      if (uploadError) { showToast(`Failed to upload ${file.name}`, 'error'); continue }
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
      const { data: record } = await supabase
        .from('media_files')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: path,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single()
      if (record) { setFiles(prev => [record, ...prev]); successCount++ }
    }
    setUploading(false)
    if (successCount > 0) showToast(`${successCount} file${successCount !== 1 ? 's' : ''} uploaded`, 'success')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async (file: any) => {
    setDeleting(file.id)
    await supabase.storage.from('media').remove([file.file_path])
    await supabase.from('media_files').delete().eq('id', file.id)
    setFiles(prev => prev.filter(f => f.id !== file.id))
    setConfirmDelete(null)
    showToast('Deleted', 'success')
    setDeleting(null)
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const filtered = files.filter(f => {
    if (filter === 'All') return true
    if (filter === 'Images') return f.file_type?.startsWith('image/')
    if (filter === 'Videos') return f.file_type?.startsWith('video/')
    return true
  })

  const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Media Library</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {files.length} file{files.length !== 1 ? 's' : ''} · {formatSize(totalSize)} used
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="file" multiple accept="image/*,video/*"
                onChange={handleUpload} className="hidden" id="media-upload" />
              <label htmlFor="media-upload"
                className={`bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? '⏳ Uploading...' : '+ Upload Files'}
              </label>
            </div>
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 w-fit">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* UPLOAD ZONE */}
          <label htmlFor="media-upload"
            className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center mb-6 hover:border-gray-400 transition-all cursor-pointer group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
            <p className="text-sm font-bold text-gray-500">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">Images and videos · Max {MAX_FILE_SIZE_MB}MB per file</p>
          </label>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonBox key={i} className="aspect-square" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-sm font-bold mb-1">No media files yet</p>
              <p className="text-xs text-gray-400">Upload images and videos to use in your posts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(file => {
                const isConfirming = confirmDelete === file.id
                return (
                  <div key={file.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 transition-all group">
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                      {file.file_type?.startsWith('image/') ? (
                        <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🎥</span>
                        </div>
                      )}
                      {/* HOVER OVERLAY */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 flex-wrap p-2">
                        {isConfirming ? (
                          // M2: inline confirm
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-white font-semibold">Delete?</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(file)} disabled={deleting === file.id}
                                className="text-xs font-bold px-2.5 py-1.5 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                                {deleting === file.id ? '...' : 'Yes'}
                              </button>
                              <button onClick={() => setConfirmDelete(null)}
                                className="text-xs font-bold px-2.5 py-1.5 bg-white text-black rounded-lg hover:opacity-80 transition-all">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleCopy(file.file_url, file.id)}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                                copied === file.id ? 'bg-green-400 text-black' : 'bg-white text-black hover:opacity-80'
                              }`}>
                              {copied === file.id ? '✓' : 'Copy URL'}
                            </button>
                            <button onClick={() => setConfirmDelete(file.id)}
                              className="text-xs font-bold px-2.5 py-1.5 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-700 truncate">{file.file_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.file_size || 0)}</p>
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
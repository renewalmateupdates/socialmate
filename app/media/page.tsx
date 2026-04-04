'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

const FILTERS = ['All', 'Images', 'Videos']
const MAX_FILE_SIZE_MB = 50
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']

const PLAN_STORAGE_LIMITS: Record<string, number> = {
  free:   1  * 1024 * 1024 * 1024,
  pro:    10 * 1024 * 1024 * 1024,
  agency: 50 * 1024 * 1024 * 1024,
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [userId, setUserId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { plan } = useWorkspace()

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
  }, [router])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length || !userId) return

    const invalid  = selected.filter(f => !ACCEPTED_TYPES.includes(f.type))
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

    const currentUsed  = files.reduce((sum, f) => sum + (f.file_size || 0), 0)
    const incomingSize = selected.reduce((sum, f) => sum + f.size, 0)
    const storageLimit = PLAN_STORAGE_LIMITS[plan] ?? PLAN_STORAGE_LIMITS.free
    if (currentUsed + incomingSize > storageLimit) {
      const limitGB = storageLimit / (1024 * 1024 * 1024)
      const usedGB  = (currentUsed / (1024 * 1024 * 1024)).toFixed(2)
      showToast(`Storage limit reached (${usedGB}GB / ${limitGB}GB). Upgrade for more storage.`, 'error')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    let successCount = 0
    for (const file of selected) {
      const ext  = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: false })
      if (uploadError) { showToast(`Failed to upload ${file.name}`, 'error'); continue }
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
      const { data: record } = await supabase
        .from('media_files')
        .insert({
          user_id:   userId,
          file_name: file.name,
          file_path: path,
          file_url:  urlData.publicUrl,
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
    if (selectedFile?.id === file.id) setSelectedFile(null)
    setConfirmDelete(null)
    showToast('File deleted', 'success')
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
    if (filter === 'Images') return f.file_type?.startsWith('image/')
    if (filter === 'Videos') return f.file_type?.startsWith('video/')
    return true
  })

  const totalSize     = files.reduce((sum, f) => sum + (f.file_size || 0), 0)
  const storageLimit  = PLAN_STORAGE_LIMITS[plan] ?? PLAN_STORAGE_LIMITS.free
  const storagePercent = Math.min((totalSize / storageLimit) * 100, 100)
  const storageLimitGB = storageLimit / (1024 * 1024 * 1024)

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Media Library</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {files.length} file{files.length !== 1 ? 's' : ''} · {formatSize(totalSize)} used
              </p>
            </div>
            <div className="self-start sm:self-auto">
              <input ref={inputRef} type="file" multiple accept="image/*,video/*"
                onChange={handleUpload} className="hidden" id="media-upload" />
              <label htmlFor="media-upload"
                className={`inline-block bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? '⏳ Uploading...' : '+ Upload Files'}
              </label>
            </div>
          </div>

          {/* STORAGE BAR */}
          <div className="bg-surface border border-theme rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Storage Used</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {formatSize(totalSize)} / {storageLimitGB}GB
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${
                storagePercent > 90 ? 'bg-red-500' :
                storagePercent > 70 ? 'bg-yellow-400' : 'bg-black'
              }`} style={{ width: `${storagePercent}%` }} />
            </div>
            {storagePercent > 90 && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-red-500 font-semibold">Storage almost full</p>
                <Link href="/settings?tab=Plan" className="text-xs font-bold text-black underline">
                  Upgrade →
                </Link>
              </div>
            )}
          </div>

          {/* FILTER + UPLOAD ZONE */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filter === f ? 'bg-black text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* DROP ZONE */}
          <label htmlFor="media-upload"
            className="block border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-6 md:p-8 text-center mb-6 hover:border-gray-400 transition-all cursor-pointer group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Images and videos · Max {MAX_FILE_SIZE_MB}MB per file</p>
          </label>

          {/* FILE DETAIL PANEL */}
          {selectedFile && (
            <div className="bg-surface border border-theme-md rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                {selectedFile.file_type?.startsWith('image/') ? (
                  <img src={selectedFile.file_url} alt={selectedFile.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎥</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate mb-1">{selectedFile.file_name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{formatSize(selectedFile.file_size || 0)}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleCopy(selectedFile.file_url, selectedFile.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      copied === selectedFile.id
                        ? 'bg-green-500 text-white border-green-500'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}>
                    {copied === selectedFile.id ? '✓ Copied' : 'Copy URL'}
                  </button>
                  {confirmDelete === selectedFile.id ? (
                    <>
                      <button onClick={() => handleDelete(selectedFile)}
                        disabled={deleting === selectedFile.id}
                        className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                        {deleting === selectedFile.id
                          ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                          : 'Yes, delete'}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(selectedFile.id)}
                      className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                      Delete
                    </button>
                  )}
                  <button onClick={() => { setSelectedFile(null); setConfirmDelete(null) }}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all ml-auto">
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GRID */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonBox key={i} className="aspect-square" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-sm font-bold mb-1">
                {filter === 'All' ? 'No media files yet' : `No ${filter.toLowerCase()} yet`}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Upload images and videos to use in your posts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map(file => {
                const isSelected = selectedFile?.id === file.id
                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(isSelected ? null : file)
                      setConfirmDelete(null)
                    }}
                    className={`bg-surface border-2 rounded-2xl overflow-hidden transition-all text-left w-full ${
                      isSelected ? 'border-black' : 'border-theme hover:border-gray-300'
                    }`}>
                    <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                      {file.file_type?.startsWith('image/') ? (
                        <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🎥</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{file.file_name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatSize(file.file_size || 0)}</p>
                    </div>
                  </button>
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
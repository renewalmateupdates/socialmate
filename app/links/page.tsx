'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

type ShortLink = {
  id: string
  slug: string
  original_url: string
  title: string | null
  clicks: number
  created_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + '…'
}

export default function LinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create form state
  const [urlInput, setUrlInput] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // Per-link copy state: id -> 'Copied!' or undefined
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/links')
      if (!res.ok) { setError('Failed to load links'); return }
      const data = await res.json()
      setLinks(data.links ?? [])
    } catch {
      setError('Network error loading links')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    if (!urlInput.trim()) { setCreateError('URL is required'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim(), title: titleInput.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error || 'Failed to shorten link'); return }
      setLinks(prev => [data.link, ...prev])
      setCreateSuccess(`Short link created: ${data.short_url}`)
      setUrlInput('')
      setTitleInput('')
    } catch {
      setCreateError('Network error — please try again')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this short link? Existing clicks will be lost.')) return
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
      if (res.ok) setLinks(prev => prev.filter(l => l.id !== id))
    } catch {
      // silent
    }
  }

  function handleCopy(link: ShortLink) {
    const url = `https://socialmate.studio/go/${link.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(link.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="md:ml-56 p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Link Shortener</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
            Create short links at socialmate.studio/go/[slug] with click tracking.
          </p>
        </div>

        {/* CREATE FORM */}
        <form
          onSubmit={handleCreate}
          className="rounded-2xl p-5 mb-6 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-mid)' }}
        >
          <h2 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Create short link
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg)' }}>
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border-mid)',
                  color: 'var(--fg)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--fg)' }}>
                Title <span className="text-xs font-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="My landing page"
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border-mid)',
                  color: 'var(--fg)',
                }}
              />
            </div>
            {createError && <p className="text-xs text-red-500 font-semibold">{createError}</p>}
            {createSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold break-all">
                {createSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={creating}
              className="self-start bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-50 min-h-[44px]"
            >
              {creating ? 'Shortening…' : '🔗 Shorten URL'}
            </button>
          </div>
        </form>

        {/* LINKS LIST */}
        <div>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Your links {links.length > 0 && `(${links.length})`}
          </h2>

          {loading && (
            <div className="text-sm py-8 text-center" style={{ color: 'var(--text-faint)' }}>
              Loading…
            </div>
          )}

          {!loading && error && (
            <div className="text-sm text-red-500 py-4">{error}</div>
          )}

          {!loading && !error && links.length === 0 && (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ borderColor: 'var(--border-mid)', color: 'var(--text-faint)' }}
            >
              <div className="text-3xl mb-2">🔗</div>
              <p className="text-sm font-semibold">No short links yet</p>
              <p className="text-xs mt-1">Create your first one above or use the shortener in Compose.</p>
            </div>
          )}

          <div className="space-y-3">
            {links.map(link => {
              const shortUrl = `https://socialmate.studio/go/${link.slug}`
              const isCopied = copiedId === link.id
              return (
                <div
                  key={link.id}
                  className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border-mid)' }}
                >
                  <div className="flex-1 min-w-0">
                    {link.title && (
                      <p className="text-sm font-bold mb-0.5 truncate" style={{ color: 'var(--fg)' }}>
                        {link.title}
                      </p>
                    )}
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors break-all"
                    >
                      {shortUrl}
                    </a>
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: 'var(--text-faint)' }}
                      title={link.original_url}
                    >
                      {truncate(link.original_url, 72)}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                      <span>
                        <span className="font-bold" style={{ color: 'var(--fg)' }}>{link.clicks}</span> click{link.clicks !== 1 ? 's' : ''}
                      </span>
                      <span>·</span>
                      <span>{formatDate(link.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(link)}
                      className="text-xs font-bold px-3 py-2 min-h-[36px] rounded-xl border transition-all hover:border-blue-400 hover:text-blue-500"
                      style={{ borderColor: 'var(--border-mid)', color: 'var(--fg)' }}
                    >
                      {isCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-xs font-bold px-3 py-2 min-h-[36px] rounded-xl border border-red-200 dark:border-red-900 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

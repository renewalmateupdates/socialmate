'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type LinkItem = {
  id: string
  title: string
  url: string
  active: boolean
}

type SocialLinks = {
  instagram?: string
  twitter?: string
  linkedin?: string
  tiktok?: string
  youtube?: string
  threads?: string
  bluesky?: string
}

type BioPage = {
  id: string
  slug: string
  title: string
  bio: string
  avatar_url: string
  background: string
  button_style: string
  links: LinkItem[]
  socials: SocialLinks
  published: boolean
}

const BACKGROUNDS = [
  { id: 'white', label: 'Clean White', preview: 'bg-white' },
  { id: 'gray', label: 'Soft Gray', preview: 'bg-gray-100' },
  { id: 'black', label: 'Midnight', preview: 'bg-gray-900' },
  { id: 'gradient-purple', label: 'Purple Haze', preview: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 'gradient-blue', label: 'Ocean', preview: 'bg-gradient-to-br from-blue-500 to-cyan-400' },
  { id: 'gradient-green', label: 'Forest', preview: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: 'gradient-orange', label: 'Sunset', preview: 'bg-gradient-to-br from-orange-400 to-pink-500' },
  { id: 'gradient-dark', label: 'Dark Mode', preview: 'bg-gradient-to-br from-gray-900 to-gray-700' },
]

const BUTTON_STYLES = [
  { id: 'rounded', label: 'Rounded' },
  { id: 'pill', label: 'Pill' },
  { id: 'sharp', label: 'Sharp' },
  { id: 'outline', label: 'Outline' },
]

const BG_CLASSES: Record<string, string> = {
  'white': 'bg-white',
  'gray': 'bg-gray-100',
  'black': 'bg-gray-900',
  'gradient-purple': 'bg-gradient-to-br from-purple-500 to-pink-500',
  'gradient-blue': 'bg-gradient-to-br from-blue-500 to-cyan-400',
  'gradient-green': 'bg-gradient-to-br from-green-400 to-emerald-600',
  'gradient-orange': 'bg-gradient-to-br from-orange-400 to-pink-500',
  'gradient-dark': 'bg-gradient-to-br from-gray-900 to-gray-700',
}

const TEXT_COLORS: Record<string, string> = {
  'white': 'text-gray-900',
  'gray': 'text-gray-900',
  'black': 'text-white',
  'gradient-purple': 'text-white',
  'gradient-blue': 'text-white',
  'gradient-green': 'text-white',
  'gradient-orange': 'text-white',
  'gradient-dark': 'text-white',
}

const BUTTON_CLASSES: Record<string, string> = {
  'rounded': 'rounded-xl',
  'pill': 'rounded-full',
  'sharp': 'rounded-none',
  'outline': 'rounded-xl border-2 border-current bg-transparent',
}

function getButtonClass(style: string, bg: string) {
  const isDark = bg !== 'white' && bg !== 'gray'
  const base = BUTTON_CLASSES[style] || 'rounded-xl'
  if (style === 'outline') return `${base} ${isDark ? 'border-white text-white' : 'border-gray-900 text-gray-900'}`
  return `${base} ${isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`
}

export default function LinkInBio() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<BioPage | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'socials'>('links')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('link_in_bio')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPage(data)
      } else {
        const slug = (user.email?.split('@')[0] ?? 'user').replace(/[^a-z0-9]/gi, '').toLowerCase() + Math.floor(Math.random() * 999)
        const newPage = {
          user_id: user.id,
          slug,
          title: '',
          bio: '',
          avatar_url: '',
          background: 'white',
          button_style: 'rounded',
          links: [],
          socials: {},
          published: true,
        }
        const { data: created } = await supabase.from('link_in_bio').insert(newPage).select().single()
        setPage(created)
      }
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!page) return
    setSaving(true)
    const { error } = await supabase
      .from('link_in_bio')
      .update({
        title: page.title,
        bio: page.bio,
        background: page.background,
        button_style: page.button_style,
        links: page.links,
        socials: page.socials,
        published: page.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id)

    if (error) { showToast('Failed to save', 'error') } else { showToast('Page saved!', 'success') }
    setSaving(false)
  }

  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) { showToast('Enter a title and URL', 'error'); return }
    let url = newLinkUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    const newItem: LinkItem = { id: Date.now().toString(), title: newLinkTitle.trim(), url, active: true }
    setPage(prev => prev ? { ...prev, links: [...prev.links, newItem] } : prev)
    setNewLinkTitle('')
    setNewLinkUrl('')
  }

  const removeLink = (id: string) => {
    setPage(prev => prev ? { ...prev, links: prev.links.filter(l => l.id !== id) } : prev)
  }

  const toggleLink = (id: string) => {
    setPage(prev => prev ? { ...prev, links: prev.links.map(l => l.id === id ? { ...l, active: !l.active } : l) } : prev)
  }

  const moveLink = (id: string, dir: 'up' | 'down') => {
    if (!page) return
    const idx = page.links.findIndex(l => l.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === page.links.length - 1) return
    const newLinks = [...page.links]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[newLinks[idx], newLinks[swap]] = [newLinks[swap], newLinks[idx]]
    setPage(prev => prev ? { ...prev, links: newLinks } : prev)
  }

  const pageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/l/${page?.slug}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Link copied!', 'success')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio", active: true },
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

      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Link in Bio</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your free Linktree-style page, included with SocialMate</p>
          </div>
          <div className="flex items-center gap-2">
            {page && (
              <button onClick={handleCopyUrl} className={`text-sm font-semibold px-4 py-2.5 border rounded-xl transition-all ${copied ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-400'}`}>
                {copied ? '✅ Copied!' : '🔗 Copy Link'}
              </button>
            )}
            {page && (
              <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                👁️ Preview
              </a>
            )}
            <button onClick={handleSave} disabled={saving} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            <SkeletonBox className="h-96 rounded-2xl" />
            <SkeletonBox className="h-96 rounded-2xl" />
          </div>
        ) : page ? (
          <div className="grid grid-cols-2 gap-6">

            {/* EDITOR */}
            <div className="space-y-4">

              {/* Page URL */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Your Page URL</label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-gray-400 flex-shrink-0">{typeof window !== 'undefined' ? window.location.origin : ''}/l/</span>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={e => setPage(prev => prev ? { ...prev, slug: e.target.value.replace(/[^a-z0-9-_]/gi, '').toLowerCase() } : prev)}
                    className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Profile */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Profile</label>
                <input
                  type="text"
                  placeholder="Your name or brand"
                  value={page.title}
                  onChange={e => setPage(prev => prev ? { ...prev, title: e.target.value } : prev)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
                <textarea
                  placeholder="Short bio or tagline..."
                  value={page.bio}
                  onChange={e => setPage(prev => prev ? { ...prev, bio: e.target.value } : prev)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                />
                <input
                  type="text"
                  placeholder="Avatar image URL (paste a link to your photo)"
                  value={page.avatar_url}
                  onChange={e => setPage(prev => prev ? { ...prev, avatar_url: e.target.value } : prev)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Tabs */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="flex border-b border-gray-100">
                  {(['links', 'design', 'socials'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-gray-50 text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'}`}
                    >
                      {tab === 'links' ? '🔗 Links' : tab === 'design' ? '🎨 Design' : '📱 Socials'}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === 'links' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Link title (e.g. My Website)"
                          value={newLinkTitle}
                          onChange={e => setNewLinkTitle(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="URL (e.g. mysite.com)"
                            value={newLinkUrl}
                            onChange={e => setNewLinkUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addLink()}
                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                          />
                          <button onClick={addLink} className="px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all">
                            Add
                          </button>
                        </div>
                      </div>
                      {page.links.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No links yet — add your first one above</p>
                      ) : (
                        <div className="space-y-2">
                          {page.links.map((link, idx) => (
                            <div key={link.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${link.active ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 opacity-50'}`}>
                              <div className="flex flex-col gap-0.5">
                                <button onClick={() => moveLink(link.id, 'up')} disabled={idx === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▲</button>
                                <button onClick={() => moveLink(link.id, 'down')} disabled={idx === page.links.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▼</button>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{link.title}</p>
                                <p className="text-xs text-gray-400 truncate">{link.url}</p>
                              </div>
                              <button onClick={() => toggleLink(link.id)} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all ${link.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {link.active ? 'On' : 'Off'}
                              </button>
                              <button onClick={() => removeLink(link.id)} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'design' && (
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">Background</label>
                        <div className="grid grid-cols-4 gap-2">
                          {BACKGROUNDS.map(bg => (
                            <button
                              key={bg.id}
                              onClick={() => setPage(prev => prev ? { ...prev, background: bg.id } : prev)}
                              className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${bg.preview} ${page.background === bg.id ? 'border-black' : 'border-transparent'}`}
                            >
                              {page.background === bg.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs">✓</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{BACKGROUNDS.find(b => b.id === page.background)?.label}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">Button Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {BUTTON_STYLES.map(style => (
                            <button
                              key={style.id}
                              onClick={() => setPage(prev => prev ? { ...prev, button_style: style.id } : prev)}
                              className={`py-2 text-sm font-semibold border-2 transition-all ${style.id === 'pill' ? 'rounded-full' : style.id === 'sharp' ? 'rounded-none' : 'rounded-xl'} ${page.button_style === style.id ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Visibility</label>
                        <button
                          onClick={() => setPage(prev => prev ? { ...prev, published: !prev.published } : prev)}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all ${page.published ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className={`w-8 h-4 rounded-full transition-all relative ${page.published ? 'bg-green-400' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${page.published ? 'left-4' : 'left-0.5'}`} />
                          </div>
                          <span className="text-sm font-semibold">{page.published ? 'Published — visible to everyone' : 'Unpublished — only you can see it'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'socials' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400">Add your social handles to display icons on your page</p>
                      {[
                        { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: '@yourhandle' },
                        { key: 'twitter', label: 'X / Twitter', icon: '🐦', placeholder: '@yourhandle' },
                        { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/you' },
                        { key: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: '@yourhandle' },
                        { key: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'youtube.com/c/you' },
                        { key: 'threads', label: 'Threads', icon: '🧵', placeholder: '@yourhandle' },
                        { key: 'bluesky', label: 'Bluesky', icon: '🦋', placeholder: '@you.bsky.social' },
                      ].map(s => (
                        <div key={s.key} className="flex items-center gap-2">
                          <span className="text-base w-6 text-center flex-shrink-0">{s.icon}</span>
                          <input
                            type="text"
                            placeholder={s.placeholder}
                            value={(page.socials as any)[s.key] || ''}
                            onChange={e => setPage(prev => prev ? { ...prev, socials: { ...prev.socials, [s.key]: e.target.value } } : prev)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="sticky top-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
                  <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">Open full page ↗</a>
                </div>
                <div className={`rounded-2xl overflow-hidden min-h-96 ${BG_CLASSES[page.background] || 'bg-white'}`}>
                  <div className="p-6 flex flex-col items-center gap-4">
                    {page.avatar_url ? (
                      <img src={page.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow" />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow ${TEXT_COLORS[page.background] === 'text-white' ? 'bg-white/20' : 'bg-black/10'}`}>
                        {page.title ? page.title[0].toUpperCase() : '?'}
                      </div>
                    )}
                    {page.title && <h2 className={`text-base font-bold text-center ${TEXT_COLORS[page.background] || 'text-gray-900'}`}>{page.title}</h2>}
                    {page.bio && <p className={`text-xs text-center max-w-xs ${TEXT_COLORS[page.background] === 'text-white' ? 'text-white/80' : 'text-gray-500'}`}>{page.bio}</p>}

                    {/* Social icons */}
                    {Object.keys(page.socials).filter(k => (page.socials as any)[k]).length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {[
                          { key: 'instagram', icon: '📸' },
                          { key: 'twitter', icon: '🐦' },
                          { key: 'linkedin', icon: '💼' },
                          { key: 'tiktok', icon: '🎵' },
                          { key: 'youtube', icon: '▶️' },
                          { key: 'threads', icon: '🧵' },
                          { key: 'bluesky', icon: '🦋' },
                        ].filter(s => (page.socials as any)[s.key]).map(s => (
                          <span key={s.key} className="text-lg">{s.icon}</span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="w-full space-y-2 mt-2">
                      {page.links.filter(l => l.active).map(link => (
                        <div
                          key={link.id}
                          className={`w-full py-3 px-4 text-sm font-semibold text-center transition-all ${getButtonClass(page.button_style, page.background)}`}
                        >
                          {link.title}
                        </div>
                      ))}
                      {page.links.filter(l => l.active).length === 0 && (
                        <p className={`text-xs text-center py-4 ${TEXT_COLORS[page.background] === 'text-white' ? 'text-white/50' : 'text-gray-400'}`}>Your links will appear here</p>
                      )}
                    </div>

                    <p className={`text-xs mt-2 ${TEXT_COLORS[page.background] === 'text-white' ? 'text-white/40' : 'text-gray-300'}`}>Made with SocialMate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
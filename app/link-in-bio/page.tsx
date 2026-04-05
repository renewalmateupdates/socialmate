'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const THEMES = [
  { id: 'white',    label: 'Clean White', bg: 'bg-white',         text: 'text-gray-900',    btn: 'bg-gray-900 text-white'       },
  { id: 'black',    label: 'Midnight',    bg: 'bg-gray-950',      text: 'text-white',       btn: 'bg-white text-gray-900'       },
  { id: 'gray',     label: 'Soft Gray',   bg: 'bg-gray-100',      text: 'text-gray-800',    btn: 'bg-gray-800 text-white'       },
  { id: 'blue',     label: 'Ocean Blue',  bg: 'bg-blue-600',      text: 'text-white',       btn: 'bg-white text-blue-600'       },
  { id: 'purple',   label: 'Deep Purple', bg: 'bg-purple-700',    text: 'text-white',       btn: 'bg-white text-purple-700'     },
  { id: 'green',    label: 'Forest',      bg: 'bg-emerald-700',   text: 'text-white',       btn: 'bg-white text-emerald-700'    },
  { id: 'sunset',   label: 'Sunset',      bg: 'bg-orange-500',    text: 'text-white',       btn: 'bg-white text-orange-500'     },
  { id: 'rose',     label: 'Rose Gold',   bg: 'bg-rose-100',      text: 'text-rose-900',    btn: 'bg-rose-700 text-white'       },
  { id: 'slate',    label: 'Slate',       bg: 'bg-slate-700',     text: 'text-slate-100',   btn: 'bg-slate-100 text-slate-900'  },
  { id: 'amber',    label: 'Amber',       bg: 'bg-amber-400',     text: 'text-amber-950',   btn: 'bg-amber-950 text-amber-100'  },
  { id: 'neon',     label: 'Neon',        bg: 'bg-black',         text: 'text-green-400',   btn: 'bg-green-400 text-black'      },
  { id: 'lavender', label: 'Lavender',    bg: 'bg-violet-100',    text: 'text-violet-900',  btn: 'bg-violet-600 text-white'     },
  { id: 'sand',     label: 'Sand',        bg: 'bg-yellow-50',     text: 'text-yellow-900',  btn: 'bg-yellow-800 text-yellow-50' },
  { id: 'crimson',  label: 'Crimson',     bg: 'bg-red-700',       text: 'text-white',       btn: 'bg-white text-red-700'        },
]

const BTN_STYLES = [
  { id: 'rounded', label: 'Rounded', class: 'rounded-xl'   },
  { id: 'pill',    label: 'Pill',    class: 'rounded-full' },
  { id: 'square',  label: 'Square',  class: 'rounded-none' },
]

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram',   icon: '📸', placeholder: 'https://instagram.com/yourhandle'     },
  { id: 'twitter',   label: 'X / Twitter', icon: '𝕏',  placeholder: 'https://x.com/yourhandle'            },
  { id: 'bluesky',   label: 'Bluesky',     icon: '🦋', placeholder: 'https://bsky.app/profile/yourhandle'  },
  { id: 'mastodon',  label: 'Mastodon',    icon: '🐘', placeholder: 'https://mastodon.social/@yourhandle'  },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '💼', placeholder: 'https://linkedin.com/in/yourname'     },
  { id: 'tiktok',    label: 'TikTok',      icon: '🎵', placeholder: 'https://tiktok.com/@yourhandle'       },
  { id: 'youtube',   label: 'YouTube',     icon: '▶️', placeholder: 'https://youtube.com/@yourchannel'     },
  { id: 'discord',   label: 'Discord',     icon: '💬', placeholder: 'https://discord.gg/yourserver'        },
  { id: 'telegram',  label: 'Telegram',    icon: '✈️', placeholder: 'https://t.me/yourhandle'              },
  { id: 'pinterest', label: 'Pinterest',   icon: '📌', placeholder: 'https://pinterest.com/yourhandle'     },
]

const LINK_TYPES = [
  { id: 'custom',    label: 'Custom Link', icon: '🔗' },
  { id: 'youtube',   label: 'YouTube',     icon: '▶️' },
  { id: 'instagram', label: 'Instagram',   icon: '📸' },
  { id: 'twitter',   label: 'X / Twitter', icon: '𝕏'  },
  { id: 'bluesky',   label: 'Bluesky',     icon: '🦋' },
  { id: 'mastodon',  label: 'Mastodon',    icon: '🐘' },
  { id: 'discord',   label: 'Discord',     icon: '💬' },
  { id: 'telegram',  label: 'Telegram',    icon: '✈️' },
  { id: 'tiktok',    label: 'TikTok',      icon: '🎵' },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '💼' },
  { id: 'email',     label: 'Email',       icon: '📧' },
  { id: 'website',   label: 'Website',     icon: '🌐' },
]

const PUBLIC_BASE = 'socialmate.studio/l'
const CUSTOM_DOMAIN_REFERRAL_THRESHOLD = 3

interface BioLink {
  id: string
  title: string
  url: string
  active: boolean
  type?: string
}

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function getLinkIcon(type?: string) {
  const found = LINK_TYPES.find(t => t.id === type)
  return found ? found.icon : '🔗'
}

export default function LinkInBio() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recordId, setRecordId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [slug, setSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [theme, setTheme] = useState('white')
  const [btnStyle, setBtnStyle] = useState('rounded')
  const [links, setLinks] = useState<BioLink[]>([{ id: makeId(), title: '', url: '', active: true, type: 'custom' }])
  const [socials, setSocials] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'socials' | 'domain'>('links')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copied, setCopied] = useState(false)

  const [customDomainUnlocked, setCustomDomainUnlocked] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [savingDomain, setSavingDomain] = useState(false)
  const [payingReferrals, setPayingReferrals] = useState(0)

  const router = useRouter()
  const { plan } = useWorkspace()
  const canUseCustomDomain = plan === 'pro' || plan === 'agency' || customDomainUnlocked

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }
      setUser(authUser)

      const { data: bioData } = await supabase
        .from('bio_pages').select('*').eq('user_id', authUser.id).single()

      if (bioData) {
        setRecordId(bioData.id)
        setName(bioData.name || '')
        setBio(bioData.bio || '')
        setSlug(bioData.slug || '')
        setAvatarUrl(bioData.avatar_url || '')
        setTheme(bioData.theme || 'white')
        setBtnStyle(bioData.btn_style || 'rounded')
        setLinks(bioData.links?.length ? bioData.links : [{ id: makeId(), title: '', url: '', active: true, type: 'custom' }])
        setSocials(bioData.socials || {})
        setCustomDomain(bioData.custom_domain || '')
      } else {
        const defaultSlug = authUser.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
        setSlug(defaultSlug)
      }

      const { data: settings } = await supabase
        .from('user_settings').select('custom_domain_unlocked').eq('user_id', authUser.id).single()
      if (settings) setCustomDomainUnlocked(settings.custom_domain_unlocked || false)

      const { data: referrals } = await supabase
        .from('referral_conversions').select('status').eq('affiliate_user_id', authUser.id)
      if (referrals) {
        setPayingReferrals(referrals.filter(r => r.status === 'eligible' || r.status === 'paid').length)
      }

      setLoading(false)
    }
    load()
  }, [router])

  const checkSlug = async (val: string, userId: string) => {
    if (!val || val.length < 2) { setSlugAvailable(null); return }
    setCheckingSlug(true)
    const { data } = await supabase.from('bio_pages').select('id').eq('slug', val).neq('user_id', userId).maybeSingle()
    setSlugAvailable(!data)
    setCheckingSlug(false)
  }

  const addLink    = () => setLinks(prev => [...prev, { id: makeId(), title: '', url: '', active: true, type: 'custom' }])
  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))
  const updateLink = (id: string, field: keyof BioLink, value: any) =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  const moveLink   = (id: string, direction: 'up' | 'down') => {
    const idx = links.findIndex(l => l.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === links.length - 1) return
    const newLinks = Array.from(links)
    const swap = direction === 'up' ? idx - 1 : idx + 1
    ;[newLinks[idx], newLinks[swap]] = [newLinks[swap], newLinks[idx]]
    setLinks(newLinks)
  }

  const handleSave = async () => {
    if (!name.trim()) { showToast('Display name is required', 'error'); return }
    if (!slug.trim()) { showToast('URL slug is required', 'error'); return }
    if (slugAvailable === false) { showToast('That URL is already taken', 'error'); return }
    setSaving(true)
    const payload = {
      user_id:       user.id,
      name:          name.trim(),
      bio:           bio.trim(),
      slug:          slug.trim().toLowerCase(),
      avatar_url:    avatarUrl.trim(),
      theme,
      btn_style:     btnStyle,
      links:         links.filter(l => l.title.trim() && l.url.trim()),
      socials,
      custom_domain: canUseCustomDomain ? customDomain.trim() : null,
      updated_at:    new Date().toISOString(),
    }
    if (recordId) {
      const { error } = await supabase.from('bio_pages').update(payload).eq('id', recordId)
      if (error) { showToast('Failed to save: ' + error.message, 'error'); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('bio_pages').insert(payload).select().single()
      if (error) { showToast('Failed to save: ' + error.message, 'error'); setSaving(false); return }
      setRecordId(data.id)
    }
    showToast('Bio page saved!', 'success')
    setSaving(false)
  }

  const handleSaveDomain = async () => {
    if (!canUseCustomDomain) return
    setSavingDomain(true)
    await supabase.from('bio_pages').update({ custom_domain: customDomain.trim() }).eq('user_id', user.id)
    showToast('Custom domain saved!', 'success')
    setSavingDomain(false)
  }

  const copyLink = () => {
    const url = customDomain && canUseCustomDomain
      ? `https://${customDomain}`
      : `https://${PUBLIC_BASE}/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentTheme    = THEMES.find(t => t.id === theme) || THEMES[0]
  const currentBtnStyle = BTN_STYLES.find(b => b.id === btnStyle) || BTN_STYLES[0]
  const activeLinks     = links.filter(l => l.title.trim() && l.url.trim() && l.active)
  const publicUrl       = customDomain && canUseCustomDomain
    ? `https://${customDomain}`
    : `https://${PUBLIC_BASE}/${slug}`

  const PreviewPanel = () => (
    <div className="space-y-4">
      <div className="bg-surface border border-theme rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Live Preview</p>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="relative w-[210px]">
            {/* Phone shell — sharp multi-layer shadow */}
            <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_0_0_rgba(255,255,255,0.04)_inset,0_25px_70px_-8px_rgba(0,0,0,0.65),0_8px_24px_-4px_rgba(0,0,0,0.4)]">
              {/* Inner bezel */}
              <div className="bg-black rounded-[2.6rem] overflow-hidden ring-1 ring-white/5">
                {/* Dynamic Island / notch bar */}
                <div className="flex justify-center items-center pt-2.5 pb-1.5 bg-black">
                  <div className="w-20 h-5 bg-black rounded-full border border-gray-800/80 flex items-center justify-center gap-1.5 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700/60" />
                  </div>
                </div>
                {/* Screen content */}
                <div className={`${currentTheme.bg} min-h-[380px] overflow-y-auto`}
                  style={{ scrollbarWidth: 'none' }}>
                  <div className="flex flex-col items-center px-4 pt-6 pb-8">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl mb-3 overflow-hidden border-2 border-white/20 flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                      {avatarUrl
                        ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        : <span>{name?.[0]?.toUpperCase() || '👤'}</span>
                      }
                    </div>
                    <h2 className={`text-[12px] font-extrabold text-center mb-1 leading-tight ${currentTheme.text}`}>
                      {name || 'Your Name'}
                    </h2>
                    {bio && (
                      <p className={`text-[9.5px] text-center mb-3 leading-relaxed opacity-70 max-w-[148px] ${currentTheme.text}`}>
                        {bio}
                      </p>
                    )}
                    {/* Social icons */}
                    {Object.entries(socials).filter(([, v]) => v).length > 0 && (
                      <div className="flex items-center gap-2 mb-3.5 flex-wrap justify-center">
                        {SOCIAL_PLATFORMS.filter(p => socials[p.id]).map(p => (
                          <span key={p.id} className="text-sm leading-none">{p.icon}</span>
                        ))}
                      </div>
                    )}
                    {/* Links */}
                    <div className="w-full space-y-2">
                      {activeLinks.length === 0 ? (
                        <div className={`text-[9px] text-center opacity-40 py-4 ${currentTheme.text}`}>
                          Add links to see them here
                        </div>
                      ) : (
                        activeLinks.map(link => (
                          <div key={link.id}
                            className={`w-full py-2.5 px-3 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 shadow-sm ${currentTheme.btn} ${currentBtnStyle.class}`}>
                            <span className="text-[11px] leading-none">{getLinkIcon(link.type)}</span>
                            <span>{link.title}</span>
                          </div>
                        ))
                      )}
                    </div>
                    {plan === 'free' && (
                      <p className={`text-[8px] mt-5 opacity-25 ${currentTheme.text}`}>Made with SocialMate</p>
                    )}
                  </div>
                </div>
                {/* Bottom home bar */}
                <div className="flex justify-center py-2.5 bg-black">
                  <div className="w-24 h-1 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
            {/* Side buttons — left */}
            <div className="absolute -left-[3px] top-[4.5rem] w-[3px] h-5 bg-gray-700 rounded-l-full" />
            <div className="absolute -left-[3px] top-[6rem] w-[3px] h-9 bg-gray-700 rounded-l-full" />
            <div className="absolute -left-[3px] top-[9.5rem] w-[3px] h-9 bg-gray-700 rounded-l-full" />
            {/* Power button — right */}
            <div className="absolute -right-[3px] top-[5.5rem] w-[3px] h-14 bg-gray-700 rounded-r-full" />
          </div>
        </div>
      </div>

      {/* Copy link block */}
      {slug && (
        <div className="bg-black rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-400 mb-1">Your public URL</p>
          <p className="text-[11px] text-white font-mono mb-3 break-all opacity-70">
            {customDomain && canUseCustomDomain ? customDomain : `${PUBLIC_BASE}/${slug}`}
          </p>
          <button onClick={copyLink}
            className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
              copied ? 'bg-green-400 text-black' : 'bg-white text-black hover:opacity-80'
            }`}>
            {copied ? '✓ Copied!' : '🔗 Copy My Link'}
          </button>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Link in Bio</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Your free bio page — no Linktree needed</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {slug && (
                <button onClick={copyLink}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 shadow-sm'
                  }`}>
                  {copied ? '✓ Copied!' : '🔗 Copy Bio Link'}
                </button>
              )}
              <button
                onClick={() => setShowPreview(p => !p)}
                className="lg:hidden text-xs font-bold px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>

          {/* MOBILE PREVIEW */}
          {showPreview && (
            <div className="lg:hidden mb-6">
              <PreviewPanel />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* PROFILE */}
              <div className="bg-surface border border-theme rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Profile</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                      Display Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name or brand"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                      Page URL <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-semibold">/l/</span>
                      <input type="text" value={slug}
                        onChange={e => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setSlug(val); setSlugAvailable(null) }}
                        onBlur={() => user && checkSlug(slug, user.id)}
                        placeholder="yourname"
                        className={`w-full pl-8 pr-8 py-2.5 text-sm border rounded-xl focus:outline-none transition-all dark:bg-gray-900 dark:text-gray-100 ${
                          slugAvailable === false ? 'border-red-300' : slugAvailable === true ? 'border-green-300' : 'border-gray-200 dark:border-gray-600 focus:border-gray-400'
                        }`} />
                      {checkingSlug && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">...</span>}
                      {slugAvailable === true  && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500 font-bold">✓</span>}
                      {slugAvailable === false && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500 font-bold">✕</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 150))}
                    placeholder="A short description of you or your brand..."
                    rows={2} maxLength={150}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 resize-none dark:bg-gray-900 dark:text-gray-100" />
                  <p className={`text-xs mt-1 ${bio.length >= 140 ? 'text-orange-500 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                    {bio.length}/150
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                    Avatar URL <span className="text-gray-400 dark:text-gray-500 font-normal">(paste any image URL)</span>
                  </label>
                  <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-900 dark:text-gray-100" />
                </div>
              </div>

              {/* TABS */}
              <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1 overflow-x-auto">
                {[
                  { id: 'links',   label: '🔗 Links'   },
                  { id: 'socials', label: '📱 Socials'  },
                  { id: 'design',  label: '🎨 Design'   },
                  { id: 'domain',  label: canUseCustomDomain ? '🌐 Domain' : '🔒 Domain' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* LINKS TAB */}
              {activeTab === 'links' && (
                <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Links</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{activeLinks.length} active</p>
                  </div>
                  {links.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-1">No links yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Add links to your bio page below.</p>
                    </div>
                  )}
                  {links.map((link, i) => (
                    <div key={link.id}
                      className={`border rounded-2xl p-3 transition-all ${
                        link.active
                          ? 'border-gray-200 dark:border-gray-700'
                          : 'border-gray-100 dark:border-gray-800 opacity-50'
                      }`}>
                      {/* Top controls row */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => moveLink(link.id, 'up')} disabled={i === 0}
                            className="w-5 h-5 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 disabled:opacity-0 transition-all rounded">
                            ↑
                          </button>
                          <button onClick={() => moveLink(link.id, 'down')} disabled={i === links.length - 1}
                            className="w-5 h-5 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 disabled:opacity-0 transition-all rounded">
                            ↓
                          </button>
                        </div>
                        {/* Type selector */}
                        <select
                          value={link.type || 'custom'}
                          onChange={e => updateLink(link.id, 'type', e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-1.5 py-1 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200 flex-shrink-0">
                          {LINK_TYPES.map(lt => (
                            <option key={lt.id} value={lt.id}>{lt.icon} {lt.label}</option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-300 dark:text-gray-600 font-bold flex-1 text-right">#{i + 1}</span>
                        {/* Active toggle */}
                        <button onClick={() => updateLink(link.id, 'active', !link.active)}
                          title={link.active ? 'Active — click to hide' : 'Hidden — click to show'}
                          className={`w-8 h-4 rounded-full transition-all relative flex-shrink-0 ${link.active ? 'bg-black' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${link.active ? 'left-4' : 'left-0.5'}`} />
                        </button>
                        <button onClick={() => removeLink(link.id)}
                          className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-all ml-0.5 w-5 h-5 flex items-center justify-center">
                          ✕
                        </button>
                      </div>
                      {/* Inputs row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={e => updateLink(link.id, 'title', e.target.value)}
                          placeholder="Button label"
                          className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-800 dark:text-gray-100" />
                        <input
                          type="url"
                          value={link.url}
                          onChange={e => updateLink(link.id, 'url', e.target.value)}
                          placeholder="https://..."
                          className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-800 dark:text-gray-100" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addLink}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-xs font-bold text-gray-400 dark:text-gray-500 hover:border-gray-400 hover:text-black dark:hover:text-white transition-all">
                    + Add Link
                  </button>
                </div>
              )}

              {/* SOCIALS TAB */}
              {activeTab === 'socials' && (
                <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
                  <div className="mb-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Social Profiles</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">These appear as icons above your links.</p>
                  </div>
                  {SOCIAL_PLATFORMS.map(p => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-xl w-7 flex-shrink-0 text-center leading-none">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block mb-0.5">{p.label}</label>
                        <input
                          type="url"
                          value={socials[p.id] || ''}
                          onChange={e => setSocials(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder={p.placeholder}
                          className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-800 dark:text-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DESIGN TAB */}
              {activeTab === 'design' && (
                <div className="bg-surface border border-theme rounded-2xl p-5 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Theme</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {THEMES.map(t => (
                        <button key={t.id} onClick={() => setTheme(t.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === t.id ? 'border-black dark:border-white' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                          <div className={`w-5 h-5 rounded-lg ${t.bg} border border-gray-200 dark:border-gray-600 flex-shrink-0`} />
                          <span className="text-xs font-semibold truncate">{t.label}</span>
                          {theme === t.id && <span className="ml-auto text-xs font-bold flex-shrink-0">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Button Style</p>
                    <div className="flex gap-2 md:gap-3">
                      {BTN_STYLES.map(b => (
                        <button key={b.id} onClick={() => setBtnStyle(b.id)}
                          className={`flex-1 py-2.5 text-xs font-bold border-2 transition-all ${b.class} ${
                            btnStyle === b.id ? 'border-black bg-black text-white' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                          }`}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-2xl p-4 ${plan === 'free' ? 'bg-gray-50 dark:bg-gray-800 border border-theme' : 'bg-surface border border-theme-md'}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">Remove "Made with SocialMate" branding</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {plan === 'free' ? 'Available on Pro and Agency plans' : 'Your bio page shows no SocialMate branding'}
                        </p>
                      </div>
                      {plan === 'free' ? (
                        <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full flex-shrink-0">Pro</span>
                      ) : (
                        <div className="w-10 h-5 rounded-full bg-black relative flex-shrink-0">
                          <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 right-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DOMAIN TAB */}
              {activeTab === 'domain' && (
                <div className="space-y-4">
                  {canUseCustomDomain ? (
                    <div className="bg-surface border border-theme rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🌐</span>
                        <h2 className="text-base font-extrabold">Custom Domain</h2>
                        {customDomainUnlocked && plan === 'free' && (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Earned via referrals</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                        Point your domain at SocialMate and your bio page will load at your own URL instead of {PUBLIC_BASE}/{slug || 'yourname'}.
                      </p>
                      <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Your Domain</label>
                        <input type="text" value={customDomain}
                          onChange={e => setCustomDomain(e.target.value.toLowerCase().replace(/\s/g, ''))}
                          placeholder="links.yourbrand.com"
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-black transition-all dark:bg-gray-900 dark:text-gray-100" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">e.g. links.yourbrand.com or bio.yourname.com</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 border border-theme rounded-xl p-4 space-y-2">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">DNS Setup Instructions</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add this CNAME record in your domain's DNS settings:</p>
                        <div className="bg-surface border border-theme-md rounded-lg p-3 font-mono text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                          <div className="grid grid-cols-3 gap-2 mb-1">
                            <span className="font-bold text-gray-400 dark:text-gray-500">Type</span>
                            <span className="font-bold text-gray-400 dark:text-gray-500">Name</span>
                            <span className="font-bold text-gray-400 dark:text-gray-500">Value</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span>CNAME</span>
                            <span>{customDomain ? customDomain.split('.')[0] : 'links'}</span>
                            <span>socialmate.studio</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">DNS changes can take up to 48 hours to propagate.</p>
                      </div>
                      <button onClick={handleSaveDomain} disabled={savingDomain || !customDomain.trim()}
                        className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                        {savingDomain ? 'Saving...' : 'Save Domain'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-black text-white rounded-2xl p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🌐</span>
                          <h2 className="text-base font-extrabold">Custom Domain</h2>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                          Use your own domain for your Link in Bio page — available on Pro and Agency, or unlock it free by referring paying users.
                        </p>
                        <div className="bg-white/10 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold">Referral unlock progress</p>
                            <p className="text-xs font-bold">{payingReferrals} / {CUSTOM_DOMAIN_REFERRAL_THRESHOLD}</p>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full bg-white transition-all"
                              style={{ width: `${Math.min((payingReferrals / CUSTOM_DOMAIN_REFERRAL_THRESHOLD) * 100, 100)}%` }} />
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {payingReferrals >= CUSTOM_DOMAIN_REFERRAL_THRESHOLD
                              ? '✅ Unlocked! Refresh to access your custom domain settings.'
                              : `${CUSTOM_DOMAIN_REFERRAL_THRESHOLD - payingReferrals} more paying referral${CUSTOM_DOMAIN_REFERRAL_THRESHOLD - payingReferrals !== 1 ? 's' : ''} to unlock`}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                          <a href="/settings?tab=Referrals"
                            className="flex-1 text-center py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                            Get my referral link →
                          </a>
                          <a href="/settings?tab=Plan"
                            className="flex-1 text-center py-2.5 border border-white/30 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all">
                            Upgrade to Pro →
                          </a>
                        </div>
                      </div>

                      <div className="bg-surface border border-theme rounded-2xl p-5">
                        <h3 className="text-sm font-extrabold mb-3">How the referral unlock works</h3>
                        <div className="space-y-3">
                          {[
                            { step: '1', text: 'Share your referral link from the Referrals tab in Settings' },
                            { step: '2', text: 'When 3 of your referrals upgrade to a paid plan, custom domain unlocks permanently' },
                            { step: '3', text: 'Come back here, set your domain, and follow the DNS instructions' },
                          ].map(item => (
                            <div key={item.step} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                {item.step}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-0.5">{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP PREVIEW */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <PreviewPanel />
              </div>
            </div>
          </div>
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

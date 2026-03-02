'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280, threads: 500, bluesky: 300, mastodon: 500,
  instagram: 2200, linkedin: 3000, facebook: 63206, pinterest: 500,
  tiktok: 2200, youtube: 5000, snapchat: 250, discord: 2000,
  telegram: 4096, reddit: 40000, lemon8: 2200, bereal: 200,
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const ALL_PLATFORMS = Object.keys(PLATFORM_LIMITS)

const AI_TONES = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Educational', 'Promotional']
const AI_GOALS = ['Engagement', 'Brand Awareness', 'Drive Traffic', 'Product Launch', 'Storytelling', 'Community']

function ComposeInner() {
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showHashtags, setShowHashtags] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [hashtags, setHashtags] = useState<any[]>([])
  const [media, setMedia] = useState<any[]>([])
  const [templateSearch, setTemplateSearch] = useState('')
  const [hashtagSearch, setHashtagSearch] = useState('')
  const [aiTopic, setAiTopic] = useState('')
  const [aiTone, setAiTone] = useState('Casual')
  const [aiGoal, setAiGoal] = useState('Engagement')
  const [aiPlatform, setAiPlatform] = useState('instagram')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<string[]>([])
  const [aiCredits, setAiCredits] = useState(15)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const editIdParam = searchParams.get('edit')
      const templateParam = searchParams.get('template')
      const dateParam = searchParams.get('date')

      if (editIdParam) {
        setEditId(editIdParam)
        const { data } = await supabase.from('posts').select('*').eq('id', editIdParam).single()
        if (data) {
          setContent(data.content || '')
          setSelectedPlatforms(data.platforms || ['instagram'])
          if (data.scheduled_at) setScheduledAt(data.scheduled_at.slice(0, 16))
        }
      }

      if (templateParam) setContent(decodeURIComponent(templateParam))
      if (dateParam) setScheduledAt(dateParam + 'T09:00')

      const [{ data: tData }, { data: hData }, { data: mData }, { data: settings }] = await Promise.all([
        supabase.from('templates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('hashtag_collections').select('*').eq('user_id', user.id),
        supabase.from('media_library').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_settings').select('settings').eq('user_id', user.id).single(),
      ])

      setTemplates(tData || [])
      setHashtags(hData || [])
      setMedia(mData || [])
      if (settings?.settings?.ai_credits_used !== undefined) {
        setAiCredits(Math.max(0, 15 - (settings.settings.ai_credits_used || 0)))
      }
      if (!editIdParam && !templateParam && settings?.settings?.default_platforms) {
        setSelectedPlatforms(settings.settings.default_platforms)
      }
    }
    init()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) { setContent(prev => prev + text); return }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newContent = content.slice(0, start) + text + content.slice(end)
    setContent(newContent)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + text.length, start + text.length) }, 0)
  }

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const handleSave = async (status: 'draft' | 'scheduled') => {
    if (!content.trim()) { showToast('Write something first', 'error'); return }
    if (status === 'scheduled' && !scheduledAt) { showToast('Pick a date and time', 'error'); return }
    if (selectedPlatforms.length === 0) { showToast('Select at least one platform', 'error'); return }
    setSaving(true)

    const payload = {
      content: content.trim(),
      platforms: selectedPlatforms,
      status,
      scheduled_at: status === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
      user_id: user.id,
    }

    if (editId) {
      await supabase.from('posts').update(payload).eq('id', editId)
      showToast(status === 'draft' ? 'Draft updated!' : 'Post rescheduled!', 'success')
    } else {
      await supabase.from('posts').insert(payload)
      showToast(status === 'draft' ? 'Draft saved!' : 'Post scheduled!', 'success')
    }

    setSaving(false)
    setTimeout(() => router.push(status === 'draft' ? '/drafts' : '/queue'), 1000)
  }

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) { showToast('Describe what to write about', 'error'); return }
    if (aiCredits <= 0) { showToast('No AI credits remaining', 'error'); return }
    setAiLoading(true)
    setAiResults([])

    try {
      const platformLimit = PLATFORM_LIMITS[aiPlatform] || 2200
      const prompt = `Generate 3 different social media captions for ${aiPlatform}.

Topic: ${aiTopic}
Tone: ${aiTone}
Goal: ${aiGoal}
Character limit: ${platformLimit}

Requirements:
- Each caption must be under ${platformLimit} characters
- Write for ${aiPlatform} specifically
- Tone should be ${aiTone.toLowerCase()}
- Goal is ${aiGoal.toLowerCase()}
- Include relevant emojis
- Include 3-5 relevant hashtags at the end of each caption
- Make each caption meaningfully different from the others

Return ONLY a JSON array of 3 strings, no other text, no markdown, no backticks. Example format:
["caption one here", "caption two here", "caption three here"]`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      if (Array.isArray(parsed) && parsed.length > 0) {
        setAiResults(parsed)
        const newUsed = (15 - aiCredits) + 1
        setAiCredits(prev => Math.max(0, prev - 1))
        if (user) {
          const { data: existing } = await supabase.from('user_settings').select('settings').eq('user_id', user.id).single()
          const current = existing?.settings || {}
          await supabase.from('user_settings').upsert({
            user_id: user.id,
            settings: { ...current, ai_credits_used: newUsed }
          }, { onConflict: 'user_id' })
        }
      } else {
        showToast('Could not parse AI response', 'error')
      }
    } catch (err) {
      showToast('AI generation failed — try again', 'error')
    }

    setAiLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const overLimit = selectedPlatforms.filter(p => {
    const limit = PLATFORM_LIMITS[p]
    return limit && content.length > limit
  })

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
            { icon: "✏️", label: "Compose", href: "/compose", active: true },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
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
              <span className="text-xs font-bold text-gray-700">{aiCredits}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(aiCredits / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{aiCredits} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{editId ? 'Edit Post' : 'Compose'}</h1>
              <p className="text-sm text-gray-400 mt-0.5">Write once, post everywhere</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* LEFT — EDITOR */}
            <div className="col-span-2 space-y-4">

              {/* TOOLBAR */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: '🤖 AI Write', key: 'ai', active: showAI },
                  { label: '📝 Templates', key: 'templates', active: showTemplates },
                  { label: '#️⃣ Hashtags', key: 'hashtags', active: showHashtags },
                  { label: '🖼️ Media', key: 'media', active: showMedia },
                ].map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => {
                      setShowAI(btn.key === 'ai' ? !showAI : false)
                      setShowTemplates(btn.key === 'templates' ? !showTemplates : false)
                      setShowHashtags(btn.key === 'hashtags' ? !showHashtags : false)
                      setShowMedia(btn.key === 'media' ? !showMedia : false)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${btn.active ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  >
                    {btn.label}
                    {btn.key === 'ai' && aiCredits > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${btn.active ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {aiCredits}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* AI PANEL */}
              {showAI && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <h3 className="text-sm font-bold">AI Caption Generator</h3>
                    </div>
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${aiCredits > 5 ? 'bg-green-100 text-green-700' : aiCredits > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-500'}`}>
                      {aiCredits} credit{aiCredits !== 1 ? 's' : ''} left
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">What should I write about?</label>
                    <textarea
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      placeholder="e.g. Launching our new product, a sustainable water bottle that keeps drinks cold for 24 hours..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Platform</label>
                      <select
                        value={aiPlatform}
                        onChange={e => setAiPlatform(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                      >
                        {ALL_PLATFORMS.map(p => (
                          <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Tone</label>
                      <select
                        value={aiTone}
                        onChange={e => setAiTone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                      >
                        {AI_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Goal</label>
                      <select
                        value={aiGoal}
                        onChange={e => setAiGoal(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
                      >
                        {AI_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || aiCredits <= 0 || !aiTopic.trim()}
                    className="w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating 3 captions...
                      </>
                    ) : aiCredits <= 0 ? (
                      '❌ No credits remaining'
                    ) : (
                      `✨ Generate 3 Captions (uses 1 credit)`
                    )}
                  </button>

                  {/* AI RESULTS */}
                  {aiResults.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Choose a caption to use</p>
                      {aiResults.map((result, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-all group">
                          <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{result}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{result.length} chars</span>
                            <button
                              onClick={() => {
                                setContent(result)
                                setShowAI(false)
                                showToast('Caption inserted!', 'success')
                              }}
                              className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
                            >
                              Use this →
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleAIGenerate}
                        disabled={aiLoading || aiCredits <= 0}
                        className="w-full py-2 border border-gray-200 text-xs font-semibold rounded-xl hover:border-gray-400 transition-all disabled:opacity-50"
                      >
                        🔄 Regenerate (uses 1 credit)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TEMPLATES PANEL */}
              {showTemplates && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold">Templates</h3>
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {templates.filter(t => t.name?.toLowerCase().includes(templateSearch.toLowerCase())).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No templates yet — <Link href="/templates" className="text-black font-semibold underline">create one</Link></p>
                    ) : (
                      templates.filter(t => t.name?.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setContent(t.content || ''); setShowTemplates(false); showToast('Template loaded!', 'success') }}
                          className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-gray-300 transition-all"
                        >
                          <p className="text-xs font-bold">{t.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{t.content}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* HASHTAGS PANEL */}
              {showHashtags && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold">Hashtag Collections</h3>
                  <input
                    type="text"
                    value={hashtagSearch}
                    onChange={e => setHashtagSearch(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {hashtags.filter(h => h.name?.toLowerCase().includes(hashtagSearch.toLowerCase())).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No collections yet — <Link href="/hashtags" className="text-black font-semibold underline">create one</Link></p>
                    ) : (
                      hashtags.filter(h => h.name?.toLowerCase().includes(hashtagSearch.toLowerCase())).map(h => (
                        <button
                          key={h.id}
                          onClick={() => { insertAtCursor('\n' + (h.tags || []).join(' ')); setShowHashtags(false); showToast('Hashtags inserted!', 'success') }}
                          className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-gray-300 transition-all"
                        >
                          <p className="text-xs font-bold">{h.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{(h.tags || []).slice(0, 5).join(' ')}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* MEDIA PANEL */}
              {showMedia && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold">Media Library</h3>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {media.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4 col-span-4">No media yet — <Link href="/media" className="text-black font-semibold underline">upload files</Link></p>
                    ) : (
                      media.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { insertAtCursor(` ${m.url} `); setShowMedia(false); showToast('Media inserted!', 'success') }}
                          className="aspect-square bg-gray-100 rounded-xl overflow-hidden hover:ring-2 hover:ring-black transition-all"
                        >
                          {m.type?.startsWith('image') ? (
                            <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TEXTAREA */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your post here... Use the toolbar above to add AI captions, templates, hashtags, or media."
                  rows={10}
                  className="w-full px-5 py-4 text-sm focus:outline-none resize-none"
                />
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  <span className="text-xs text-gray-400">{content.length} characters</span>
                  {overLimit.length > 0 && (
                    <span className="text-xs font-semibold text-red-500">
                      ⚠️ Over limit on: {overLimit.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* PER PLATFORM COUNTERS */}
              {selectedPlatforms.length > 0 && content.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlatforms.map(p => {
                    const limit = PLATFORM_LIMITS[p]
                    if (!limit) return null
                    const pct = Math.min((content.length / limit) * 100, 100)
                    const over = content.length > limit
                    const warn = content.length > limit * 0.8
                    return (
                      <div key={p} className="bg-white border border-gray-100 rounded-xl px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold capitalize flex items-center gap-1">
                            {PLATFORM_ICONS[p]} {p}
                          </span>
                          <span className={`text-xs font-bold ${over ? 'text-red-500' : warn ? 'text-orange-400' : 'text-gray-400'}`}>
                            {content.length}/{limit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${over ? 'bg-red-400' : warn ? 'bg-orange-400' : 'bg-black'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* SCHEDULE + ACTIONS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Schedule Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                    />
                    {scheduledAt && (
                      <button onClick={() => setScheduledAt('')} className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-400 hover:text-black hover:border-gray-400 transition-all">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="flex-1 py-3 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editId ? '💾 Update Draft' : '📂 Save as Draft'}
                  </button>
                  <button
                    onClick={() => handleSave('scheduled')}
                    disabled={saving || !scheduledAt}
                    className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Scheduling...' : editId ? '📅 Reschedule' : '📅 Schedule Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT — PLATFORMS */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Platforms</h3>
                <div className="space-y-1.5">
                  {ALL_PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selectedPlatforms.includes(p) ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <span>{PLATFORM_ICONS[p]}</span>
                      <span className="flex-1 text-left capitalize">{p}</span>
                      {selectedPlatforms.includes(p) && <span>✓</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button onClick={() => setSelectedPlatforms(ALL_PLATFORMS)} className="flex-1 text-xs font-semibold py-1.5 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">All</button>
                  <button onClick={() => setSelectedPlatforms([])} className="flex-1 text-xs font-semibold py-1.5 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">None</button>
                </div>
              </div>

              {/* TIPS */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tips</h3>
                {[
                  { icon: '🤖', text: 'Use AI Write to generate captions instantly', href: null },
                  { icon: '📝', text: 'Save time with Templates', href: '/templates' },
                  { icon: '#️⃣', text: 'Insert Hashtag Collections in one click', href: '/hashtags' },
                  { icon: '📆', text: 'Schedule multiple posts with Bulk Scheduler', href: '/bulk-scheduler' },
                ].map(tip => (
                  <div key={tip.text} className="flex items-start gap-2 text-xs text-gray-500">
                    <span className="flex-shrink-0">{tip.icon}</span>
                    {tip.href ? (
                      <Link href={tip.href} className="hover:text-black transition-colors">{tip.text}</Link>
                    ) : (
                      <span>{tip.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Compose() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>}>
      <ComposeInner />
    </Suspense>
  )
}
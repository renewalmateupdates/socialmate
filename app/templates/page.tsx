'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

const CATEGORIES = ['All', 'Promotional', 'Educational', 'Engagement', 'Announcement', 'Personal', 'Question', 'Poll', 'Thread', 'Other']

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖', discord: '💬', telegram: '✈️',
  mastodon: '🐘', snapchat: '👻', lemon8: '🍋', bereal: '📷',
}

const PLATFORM_LABELS: Record<string, string> = {
  bluesky: 'Bluesky', discord: 'Discord', telegram: 'Telegram', mastodon: 'Mastodon',
  instagram: 'Instagram', twitter: 'X/Twitter', linkedin: 'LinkedIn', tiktok: 'TikTok',
  youtube: 'YouTube', pinterest: 'Pinterest', reddit: 'Reddit', threads: 'Threads',
}

// Only show live platforms in the template platform picker
const LIVE_PLATFORM_IDS = ['discord', 'bluesky', 'telegram', 'mastodon']
const SOON_PLATFORM_IDS = ['linkedin', 'youtube', 'pinterest', 'reddit']

const STARTER_TEMPLATES = [
  // ─── Promotional ───────────────────────────────────────────────
  {
    id: 'starter-1',
    title: 'Product / Service Launch',
    category: 'Promotional',
    platforms: ['bluesky', 'discord'],
    content: `🚀 Introducing [product/service name]!\n\n[One sentence describing what it does and who it's for.]\n\nHere's what makes it different:\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\n[Call to action — link in bio / comment below / DM us]`,
  },
  {
    id: 'starter-9',
    title: 'New Content / Blog Post Drop',
    category: 'Promotional',
    platforms: ['bluesky', 'mastodon', 'discord'],
    content: `Just published: [Title of your post / video / resource] 📝\n\n[One sentence that captures the main value — what will someone learn or get?]\n\nIf you've ever [problem or situation], this one's for you.\n\n🔗 Link in bio / [direct link]\n\n(RT/share if you found it useful — helps more people find it!)`,
  },
  {
    id: 'starter-promo3',
    title: 'Limited-Time Offer',
    category: 'Promotional',
    platforms: ['bluesky', 'discord', 'telegram'],
    content: `⏰ [X]% off [product/service] — this weekend only.\n\n[One compelling sentence about what they're getting.]\n\nUse code [CODE] at checkout.\n\nOffer ends [date/day]. Link in bio 👇`,
  },
  {
    id: 'starter-promo4',
    title: 'Waitlist / Pre-Launch',
    category: 'Promotional',
    platforms: ['bluesky', 'mastodon'],
    content: `We're building something new 👀\n\n[One teaser sentence — what's the problem it solves?]\n\nWe're opening early access to [X] people first.\n\n🔗 Join the waitlist (link in bio) — spots are limited.\n\nWho do you know who needs this? Tag them 👇`,
  },
  // ─── Educational ───────────────────────────────────────────────
  {
    id: 'starter-2',
    title: 'Quick Tip / How-To',
    category: 'Educational',
    platforms: ['bluesky', 'mastodon'],
    content: `💡 [Topic] tip that changed everything for me:\n\n[Tip in one clear sentence.]\n\nHere's how to do it:\n1️⃣ [Step 1]\n2️⃣ [Step 2]\n3️⃣ [Step 3]\n\nSave this for later and share with someone who needs it! 👇`,
  },
  {
    id: 'starter-10',
    title: 'Lessons Learned / Reflection',
    category: 'Educational',
    platforms: ['bluesky', 'mastodon', 'telegram'],
    content: `[Timeframe] ago I [what you started / launched / tried]. Here's what I learned 🧵\n\n✅ What worked: [2–3 honest points]\n❌ What didn't: [1–2 honest points]\n💡 What I'd do differently: [Key insight]\n\nBuilding in public because I wish someone had told me this earlier. Questions?`,
  },
  {
    id: 'starter-edu3',
    title: 'Common Mistake + Fix',
    category: 'Educational',
    platforms: ['bluesky', 'mastodon', 'discord'],
    content: `Most people [do X wrong]. Here's why it's costing them 👇\n\nThe mistake: [Describe the common error in 1–2 sentences]\n\nWhy it matters: [Impact / consequence]\n\nThe fix: [Clear actionable solution]\n\nSave this and stop making it 🙏`,
  },
  {
    id: 'starter-edu4',
    title: 'Resources Roundup',
    category: 'Educational',
    platforms: ['bluesky', 'mastodon'],
    content: `[Number] resources I wish I had when starting [topic/niche] 📚\n\n→ [Resource 1] — [why it's great in one sentence]\n→ [Resource 2] — [why it's great]\n→ [Resource 3] — [why it's great]\n→ [Resource 4] — [why it's great]\n\nBookmark this. Which one are you trying first? 👇`,
  },
  // ─── Engagement ────────────────────────────────────────────────
  {
    id: 'starter-3',
    title: 'Engagement Question',
    category: 'Engagement',
    platforms: ['bluesky', 'discord', 'mastodon'],
    content: `[Relatable observation or bold statement about your niche.] 🤔\n\nI used to think [common misconception], but now I know [what you actually believe].\n\nWhat do you think — am I wrong?\n\nDrop your take below 👇`,
  },
  {
    id: 'starter-7',
    title: 'Hot Take / Controversial Opinion',
    category: 'Engagement',
    platforms: ['bluesky', 'mastodon'],
    content: `Unpopular opinion: [Your honest take on something in your niche] 🌶️\n\nEvery [expert / influencer / brand] tells you to [common advice]. I think that's wrong.\n\nHere's why: [2–3 sentences with your reasoning]\n\nChange my mind 👇`,
  },
  {
    id: 'starter-8',
    title: 'Customer / Community Spotlight',
    category: 'Engagement',
    platforms: ['discord', 'bluesky', 'telegram'],
    content: `Shoutout to [person / community member / customer] 🙌\n\n[What they did, built, or said that was noteworthy — be specific]\n\nThis is exactly why we do what we do.\n\nTag someone who deserves a spotlight this week 👇`,
  },
  // ─── Announcement ──────────────────────────────────────────────
  {
    id: 'starter-5',
    title: 'Weekly Roundup',
    category: 'Announcement',
    platforms: ['bluesky', 'mastodon'],
    content: `This week in [your niche] 📰\n\n→ [Thing 1 that happened or that you learned]\n→ [Thing 2]\n→ [Thing 3]\n\nMy take: [One sentence opinion or insight]\n\nFollowing along? Subscribe so you don't miss next week's. 🔔`,
  },
  {
    id: 'starter-6',
    title: 'Milestone Celebration',
    category: 'Announcement',
    platforms: ['bluesky', 'discord', 'mastodon', 'telegram'],
    content: `We just hit [milestone — followers / orders / months / years]! 🎉\n\nHonestly didn't know if we'd get here when we started.\n\nThank you to everyone who [followed / bought / supported / shared]. This is yours too.\n\nNext goal: [next milestone]. Let's go. 🚀`,
  },
  {
    id: 'starter-ann3',
    title: 'Platform / Feature Update',
    category: 'Announcement',
    platforms: ['discord', 'telegram', 'bluesky'],
    content: `Big update to [product/community/platform] 🛠️\n\nWhat's new:\n• [Feature / change 1]\n• [Feature / change 2]\n• [Feature / change 3]\n\nWhy we made this: [One honest sentence about the reason]\n\nQuestions or feedback? Drop them below 👇`,
  },
  // ─── Personal ──────────────────────────────────────────────────
  {
    id: 'starter-4',
    title: 'Behind the Scenes',
    category: 'Personal',
    platforms: ['discord', 'telegram'],
    content: `A little behind the scenes of [what you're working on] 👀\n\n[Short honest description of what your day/process looks like.]\n\nThe part nobody tells you about [your field/work]:\n[Honest, unexpected insight]\n\nAnything you want to know more about? Ask me below 👇`,
  },
  {
    id: 'starter-per2',
    title: 'Introduce Yourself',
    category: 'Personal',
    platforms: ['bluesky', 'mastodon', 'discord'],
    content: `Hey, I'm [name] 👋\n\nI [what you do in one sentence].\n\nI post about:\n→ [Topic 1]\n→ [Topic 2]\n→ [Topic 3]\n\nIf any of that sounds like your thing, follow along — I post every [frequency].\n\nWho are you and what brings you here? Drop it below 👇`,
  },
  // ─── Question ──────────────────────────────────────────────────
  {
    id: 'starter-q1',
    title: 'Open Question to Community',
    category: 'Question',
    platforms: ['bluesky', 'mastodon', 'discord'],
    content: `Quick question for my community 🙋\n\n[Your genuine question in one clear sentence?]\n\nI'm asking because [1–2 sentence context — why you want to know]\n\nEvery answer genuinely helps. 🙏`,
  },
  {
    id: 'starter-q2',
    title: 'This or That',
    category: 'Question',
    platforms: ['bluesky', 'discord', 'mastodon'],
    content: `This or That 👇\n\n[Option A] vs [Option B] — which do you prefer for [context]?\n\nI'm firmly in the [Option A/B] camp, but I know this is controversial.\n\nReply with your pick and why 🔥`,
  },
  {
    id: 'starter-q3',
    title: 'Ask Me Anything',
    category: 'Question',
    platforms: ['discord', 'telegram', 'bluesky'],
    content: `AMA time 🎤\n\nI've been [doing X / building Y / working in Z] for [timeframe].\n\nAsk me anything about:\n• [Topic 1]\n• [Topic 2]\n• [Topic 3]\n\nDrop your question below — I'll answer every single one 👇`,
  },
  // ─── Poll ──────────────────────────────────────────────────────
  {
    id: 'starter-poll1',
    title: 'Community Poll',
    category: 'Poll',
    platforms: ['bluesky', 'discord', 'mastodon'],
    content: `📊 Quick poll:\n\n[Your question]\n\n🅰️ [Option A]\n🅱️ [Option B]\n🆎 [Option C — optional]\n🆚 [Option D — optional]\n\nVote below! I'll share results on [day/date].`,
  },
  {
    id: 'starter-poll2',
    title: 'Feature / Direction Vote',
    category: 'Poll',
    platforms: ['discord', 'telegram'],
    content: `Help me decide what to build/make next 🗳️\n\nI'm torn between:\n\n1️⃣ [Option 1] — [brief description]\n2️⃣ [Option 2] — [brief description]\n3️⃣ [Option 3] — [brief description]\n\nComment your vote (1, 2, or 3). Most votes wins — building it this week!`,
  },
  // ─── Thread ────────────────────────────────────────────────────
  {
    id: 'starter-thread1',
    title: 'Thread Opener (How I did X)',
    category: 'Thread',
    platforms: ['bluesky', 'mastodon'],
    content: `How I [achieved result] in [timeframe] — a thread 🧵\n\n[One punchy sentence on what this thread delivers]\n\n(Thread follows — hit follow so you don't miss the end 👇)`,
  },
  {
    id: 'starter-thread2',
    title: 'Thread Opener (X Things)',
    category: 'Thread',
    platforms: ['bluesky', 'mastodon'],
    content: `[Number] things I learned about [topic] that nobody talks about 🧵\n\nMost people know [common surface-level truth]. This thread goes deeper.\n\nThread ↓`,
  },
  {
    id: 'starter-thread3',
    title: 'Storytime Thread',
    category: 'Thread',
    platforms: ['bluesky', 'mastodon', 'telegram'],
    content: `Story time: the day [something happened that changed how you think] 📖\n\n[One gripping sentence to hook them — make them need to keep reading]\n\nThread ↓ (worth it, I promise)`,
  },
]

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Other')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [savingStarter, setSavingStarter] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [starterCategory, setStarterCategory] = useState('All')
  const [starterSearch, setStarterSearch] = useState('')
  const router = useRouter()
  const { activeWorkspace } = useWorkspace()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      let templatesQuery = supabase
        .from('post_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (activeWorkspace && !activeWorkspace.is_personal) {
        templatesQuery = templatesQuery.eq('workspace_id', activeWorkspace.id)
      }

      const { data } = await templatesQuery
      setTemplates(data || [])
      setLoading(false)
    }
    load()
  }, [router, activeWorkspace])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { showToast('Title and content required', 'error'); return }
    setSaving(true)
    const payload = {
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      category,
      platforms,
      updated_at: new Date().toISOString(),
    }
    if (editingId) {
      const { data, error } = await supabase
        .from('post_templates').update(payload).eq('id', editingId).select().single()
      if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
      setTemplates(prev => prev.map(t => t.id === editingId ? data : t))
    } else {
      const { data, error } = await supabase
        .from('post_templates').insert(payload).select().single()
      if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
      setTemplates(prev => [data, ...prev])
    }
    resetForm()
    showToast(editingId ? 'Template updated' : 'Template saved', 'success')
    setSaving(false)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setTitle('')
    setContent('')
    setCategory('Other')
    setPlatforms([])
  }

  const handleEdit = (t: any) => {
    setEditingId(t.id)
    setTitle(t.title)
    setContent(t.content)
    setCategory(t.category || 'Other')
    setPlatforms(t.platforms || [])
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('post_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
    setConfirmDelete(null)
    showToast('Deleted', 'success')
    setDeleting(null)
  }

  const handleCopy = (t: any) => {
    navigator.clipboard.writeText(t.content)
    setCopied(t.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSaveStarter = async (starter: typeof STARTER_TEMPLATES[0]) => {
    if (!userId) return
    setSavingStarter(starter.id)
    const { data, error } = await supabase
      .from('post_templates')
      .insert({
        user_id: userId,
        title: starter.title,
        content: starter.content,
        category: starter.category,
        platforms: starter.platforms,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) { showToast('Failed to save', 'error'); setSavingStarter(null); return }
    setTemplates(prev => [data, ...prev])
    showToast(`"${starter.title}" saved to your templates`, 'success')
    setSavingStarter(null)
  }

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  // Filtered user templates — category + search
  const filtered = useMemo(() => {
    let result = templates
    if (activeCategory !== 'All') result = result.filter(t => t.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [templates, activeCategory, searchQuery])

  // Filtered starter templates
  const filteredStarters = useMemo(() => {
    let result = STARTER_TEMPLATES
    if (starterCategory !== 'All') result = result.filter(t => t.category === starterCategory)
    if (starterSearch.trim()) {
      const q = starterSearch.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [starterCategory, starterSearch])

  const starterCategories = Array.from(new Set(['All', ...STARTER_TEMPLATES.map(t => t.category)]))

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Post Templates</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${templates.length} template${templates.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
                + New Template
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-surface border border-theme-md rounded-2xl p-5 md:p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">
                {editingId ? 'Edit Template' : 'New Template'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Product Launch Announcement"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:focus:border-gray-400 dark:bg-gray-900 dark:text-gray-100"
                      autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 bg-white dark:bg-gray-900 dark:text-gray-100">
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    Content
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(use [brackets] for fill-in sections)</span>
                  </label>
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Excited to announce [product/service]! 🎉&#10;&#10;[Describe key benefit]&#10;&#10;[Call to action] 👇"
                    rows={6}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 resize-none dark:bg-gray-900 dark:text-gray-100" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{content.length} chars</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                    Best for platforms <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LIVE_PLATFORM_IDS.map(id => (
                      <button key={id} onClick={() => togglePlatform(id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          platforms.includes(id)
                            ? 'bg-black text-white border-black'
                            : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                        }`}>
                        <span>{PLATFORM_ICONS[id]}</span>
                        <span className="capitalize">{id}</span>
                      </button>
                    ))}
                    {SOON_PLATFORM_IDS.map(id => (
                      <div key={id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-dashed border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        title={`${id} — coming soon`}>
                        <span>{PLATFORM_ICONS[id]}</span>
                        <span className="capitalize">{id}</span>
                        <span className="text-gray-200 dark:text-gray-600 ml-0.5 text-xs">Soon</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Template'}
                  </button>
                  <button onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USER TEMPLATES SEARCH + FILTER */}
          {(templates.length > 0 || searchQuery) && (
            <div className="space-y-3 mb-5">
              {/* Search bar */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search your templates..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-900 dark:text-gray-100"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    ✕
                  </button>
                )}
              </div>
              {/* Category pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      activeCategory === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-surface border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* USER TEMPLATES */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-28" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3 mb-10">
              {filtered.map(t => {
                const isConfirming = confirmDelete === t.id
                return (
                  <div key={t.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <p className="text-sm font-extrabold truncate">{t.title}</p>
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          {t.category || 'Other'}
                        </span>
                      </div>
                      {!isConfirming && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                          <button onClick={() => handleCopy(t)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                              copied === t.id
                                ? 'bg-green-500 text-white border-green-500'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                            }`}>
                            {copied === t.id ? '✓' : 'Copy'}
                          </button>
                          <Link href={`/compose?content=${encodeURIComponent(t.content)}`}
                            className="text-xs font-bold px-2.5 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                            Use →
                          </Link>
                          <button onClick={() => handleEdit(t)}
                            className="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            Edit
                          </button>
                          <button onClick={() => setConfirmDelete(t.id)}
                            className="text-xs font-bold px-2.5 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 whitespace-pre-line mb-3">
                      {t.content}
                    </p>

                    {t.platforms && t.platforms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {t.platforms.map((p: string) => (
                          <span key={p}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                            <span className="text-sm leading-none">{PLATFORM_ICONS[p]}</span>
                            <span>{PLATFORM_LABELS[p] || p}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 font-semibold flex-1">
                          Permanently delete "{t.title}"? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                            className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {deleting === t.id
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                              : 'Yes, delete'}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : templates.length > 0 && (searchQuery || activeCategory !== 'All') ? (
            <div className="mb-10 bg-gray-50 dark:bg-gray-800 border border-theme rounded-2xl p-6 text-center">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">No templates match your search</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All') }}
                className="text-xs text-black dark:text-white font-bold underline mt-1">
                Clear filters
              </button>
            </div>
          ) : null}

          {/* STARTER TEMPLATES */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold tracking-tight">Starter Templates</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {STARTER_TEMPLATES.length} templates
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Ready-made formats for the 4 live platforms. Hit "Use →" to open in Compose, or "Save" to add to your collection.
            </p>

            {/* Starter search + filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={starterSearch}
                  onChange={e => setStarterSearch(e.target.value)}
                  placeholder="Search starter templates..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-900 dark:text-gray-100"
                />
                {starterSearch && (
                  <button onClick={() => setStarterSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    ✕
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {starterCategories.map(cat => (
                  <button key={cat} onClick={() => setStarterCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      starterCategory === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-surface border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredStarters.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 border border-theme rounded-2xl p-6 text-center">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">No starter templates match your search</p>
                <button onClick={() => { setStarterSearch(''); setStarterCategory('All') }}
                  className="text-xs text-black dark:text-white font-bold underline mt-1">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStarters.map(t => (
                  <div key={t.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <p className="text-sm font-extrabold truncate">{t.title}</p>
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          {t.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                        <button onClick={() => handleCopy(t)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                            copied === t.id
                              ? 'bg-green-500 text-white border-green-500'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                          }`}>
                          {copied === t.id ? '✓' : 'Copy'}
                        </button>
                        <Link href={`/compose?content=${encodeURIComponent(t.content)}`}
                          className="text-xs font-bold px-2.5 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                          Use →
                        </Link>
                        <button onClick={() => handleSaveStarter(t)} disabled={savingStarter === t.id}
                          className="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                          {savingStarter === t.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 whitespace-pre-line mb-3">
                      {t.content}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {t.platforms.map(p => (
                        <span key={p}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                          <span className="text-sm leading-none">{PLATFORM_ICONS[p]}</span>
                          <span>{PLATFORM_LABELS[p] || p}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EMPTY STATE — no saved templates yet */}
          {!loading && templates.length === 0 && !showForm && (
            <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-theme rounded-2xl p-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                You haven't saved any templates yet. Use a starter above or{' '}
                <button onClick={() => setShowForm(true)} className="text-black dark:text-white font-bold underline">
                  create your own
                </button>.
              </p>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

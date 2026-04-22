'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

const PLATFORMS = [
  { id: 'discord',   name: 'Discord',   icon: '💬', limit: 2000,  live: true  },
  { id: 'bluesky',   name: 'Bluesky',   icon: '🦋', limit: 300,   live: true  },
  { id: 'telegram',  name: 'Telegram',  icon: '✈️', limit: 4096,  live: true  },
  { id: 'mastodon',  name: 'Mastodon',  icon: '🐘', limit: 500,   live: true  },
  { id: 'twitter',   name: 'X',         icon: '🐦', limit: 280,   live: true  },
  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', limit: 3000,  live: false },
  { id: 'youtube',   name: 'YouTube',   icon: '▶️', limit: 5000,  live: false },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', limit: 500,   live: false },
  { id: 'reddit',    name: 'Reddit',    icon: '🤖', limit: 40000, live: false },
]

const COMING_SOON_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'tiktok',    name: 'TikTok',    icon: '🎵' },
  { id: 'facebook',  name: 'Facebook',  icon: '📘' },
  { id: 'threads',   name: 'Threads',   icon: '🧵' },
  { id: 'snapchat',  name: 'Snapchat',  icon: '👻' },
  { id: 'lemon8',    name: 'Lemon8',    icon: '🍋' },
  { id: 'bereal',    name: 'BeReal',    icon: '📷' },
]

const DESTINATION_PLATFORMS = ['discord', 'telegram']

const AI_TOOLS = [
  { id: 'caption',   label: 'Caption',   emoji: '✍️',  credits: 5,  desc: 'Generate a caption from your topic'     },
  { id: 'hashtags',  label: 'Hashtags',  emoji: '#️⃣', credits: 5,  desc: 'Generate relevant hashtags'             },
  { id: 'rewrite',   label: 'Rewrite',   emoji: '🔁',  credits: 5,  desc: 'Rewrite your post to be punchier'       },
  { id: 'hook',      label: 'Hook',      emoji: '🎣',  credits: 5,  desc: 'Generate 3 viral opening hooks'         },
  { id: 'thread',    label: 'Thread',    emoji: '🧵',  credits: 10, desc: 'Turn your idea into a full thread'      },
  { id: 'repurpose', label: 'Repurpose', emoji: '♻️',  credits: 5,  desc: 'Reshape long content for this platform' },
]

const SCORE_CREDIT_COST = 5

const STARTER_TEMPLATES = [
  {
    id: 'starter-1',
    platforms: ['bluesky', 'discord'],
    content: `🚀 Introducing [product/service name]!\n\n[One sentence describing what it does and who it's for.]\n\nHere's what makes it different:\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\n[Call to action — link in bio / comment below / DM us]`,
  },
  {
    id: 'starter-2',
    platforms: ['bluesky', 'mastodon'],
    content: `💡 [Topic] tip that changed everything for me:\n\n[Tip in one clear sentence.]\n\nHere's how to do it:\n1️⃣ [Step 1]\n2️⃣ [Step 2]\n3️⃣ [Step 3]\n\nSave this for later and share with someone who needs it! 👇`,
  },
  {
    id: 'starter-3',
    platforms: ['bluesky', 'discord'],
    content: `[Relatable observation or bold statement about your niche.] 🤔\n\nI used to think [common misconception], but now I know [what you actually believe].\n\nWhat do you think — am I wrong?\n\nDrop your take below 👇`,
  },
  {
    id: 'starter-4',
    platforms: ['telegram', 'discord'],
    content: `A little behind the scenes of [what you're working on] 👀\n\n[Short honest description of what your day/process looks like.]\n\nThe part nobody tells you about [your field/work]:\n[Honest, unexpected insight]\n\nAnything you want to know more about? Ask me below 👇`,
  },
  {
    id: 'starter-5',
    platforms: ['bluesky', 'mastodon'],
    content: `This week in [your niche] 📰\n\n→ [Thing 1 that happened or that you learned]\n→ [Thing 2]\n→ [Thing 3]\n\nMy take: [One sentence opinion or insight]\n\nFollowing along? Subscribe so you don't miss next week's. 🔔`,
  },
  {
    id: 'starter-6',
    platforms: ['bluesky', 'mastodon'],
    content: `We just hit [milestone]! 🎉\n\nWhen we started, [where you began]. Today, [where you are].\n\nThis wouldn't have happened without [your audience/team/community]. Thank you.\n\nThe next goal: [next milestone]. We're just getting started. 🚀 #milestone #growth`,
  },
  {
    id: 'starter-7',
    platforms: ['bluesky', 'mastodon'],
    content: `Unpopular opinion: [your hot take].\n\nHere's why I actually believe this:\n\n[reason 1].\n[reason 2].\n[reason 3].\n\nChange my mind 👇`,
  },
  {
    id: 'starter-8',
    platforms: ['bluesky', 'discord'],
    content: `Story time 🧵\n\n[Setup the story — what was happening].\n\nThen [the turning point].\n\nWhat I learned: [the lesson].\n\nIf you're going through [similar situation], just know [encouragement].\n\nDrop a ❤️ if this resonated.`,
  },
  {
    id: 'starter-9',
    platforms: ['bluesky', 'mastodon'],
    content: `[Number] things I wish I knew about [topic] before I started:\n\n1. [tip]\n2. [tip]\n3. [tip]\n4. [tip]\n5. [tip]\n\nSave this. Your future self will thank you. 🔖`,
  },
  {
    id: 'starter-10',
    platforms: ['bluesky', 'mastodon'],
    content: `Quick question for my community 👇\n\n[Ask your question here]\n\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\n\nReply with your answer! I'll share results tomorrow.`,
  },
  {
    id: 'starter-11',
    platforms: ['bluesky', 'mastodon'],
    content: `Real numbers, no filter:\n\n[Metric 1]: [number]\n[Metric 2]: [number]\n[Metric 3]: [number]\n\n[What this means / what you're working toward].\n\nTransparency matters. 📊`,
  },
  {
    id: 'starter-12',
    platforms: ['discord', 'telegram'],
    content: `What my [day/morning/week] actually looks like:\n\n[Time]: [activity]\n[Time]: [activity]\n[Time]: [activity]\n[Time]: [activity]\n\nNo highlight reel — just the real thing.\n\nWhat does yours look like? 👇`,
  },
  {
    id: 'starter-13',
    platforms: ['bluesky', 'mastodon'],
    content: `I made a mistake so you don't have to.\n\n[What happened].\n\nWhat I thought would happen: [expectation].\nWhat actually happened: [reality].\n\nThe lesson: [takeaway].\n\nAlways [advice]. 💡`,
  },
  {
    id: 'starter-14',
    platforms: ['bluesky', 'discord'],
    content: `Grateful post incoming 🙏\n\nTo everyone who [action your audience took]: thank you.\n\nWhen I [vulnerable moment or struggle], you showed up.\n\nThis community is [what it means to you].\n\nYou're the reason I keep going. ❤️`,
  },
  {
    id: 'starter-15',
    platforms: ['bluesky', 'mastodon'],
    content: `For the next [timeframe], [your offer/product] is [discount/deal].\n\nHere's what you get:\n✅ [benefit 1]\n✅ [benefit 2]\n✅ [benefit 3]\n\nNormal price: [price]. Your price: [discounted price].\n\nLink in bio. Grab it before [deadline]. 🔥`,
  },
]

type PublishResult = {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

type ScoreResult = {
  score: number
  label: string
  strengths: string[]
  improvements: string[]
  verdict: string
}

type Destination = {
  id: string
  platform: string
  label: string
}

type ConnectedAccount = {
  id: string
  platform: string
  account_name: string
  platform_user_id: string
}

function getLocalDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ComposeInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { credits, setCredits, applyCredits, plan, activeWorkspace } = useWorkspace()

  const [loading, setLoading] = useState(true)
  const [showPostingDisclaimer, setShowPostingDisclaimer] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['discord'])
  const [content, setContent] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [templateBanner, setTemplateBanner] = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [publishResults, setPublishResults] = useState<PublishResult[] | null>(null)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const [scoreError, setScoreError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [bestTimeLabel, setBestTimeLabel] = useState<string | null>(null)

  // Repurpose panel state
  const REPURPOSE_FORMATS = [
    { id: 'thread'        as const, label: 'Thread'    },
    { id: 'email'         as const, label: 'Email'     },
    { id: 'caption'       as const, label: 'Caption'   },
    { id: 'long_form'     as const, label: 'Long-Form' },
    { id: 'short_hook'    as const, label: 'Hook'      },
    { id: 'linkedin_post' as const, label: 'LinkedIn'  },
  ]
  type RepurposeFormat = 'thread' | 'email' | 'caption' | 'long_form' | 'short_hook' | 'linkedin_post'
  const [showRepurposePanel, setShowRepurposePanel] = useState(false)
  const [repurposeFormat, setRepurposeFormat]       = useState<RepurposeFormat>('thread')
  const [repurposeResult, setRepurposeResult]       = useState('')
  const [repurposeLoading, setRepurposeLoading]     = useState(false)
  const [repurposeError, setRepurposeError]         = useState('')
  const [repurposeCopied, setRepurposeCopied]       = useState(false)

  // Hashtag collections
  type HashtagCollection = {
    id: string
    name: string
    hashtags: string[]
    workspace_id: string | null
    created_at: string
    updated_at: string
  }
  const [showHashtagPanel, setShowHashtagPanel] = useState(false)
  const [hashtagCollections, setHashtagCollections] = useState<HashtagCollection[]>([])
  const [hashtagsLoaded, setHashtagsLoaded] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionTags, setNewCollectionTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [hashtagSaving, setHashtagSaving] = useState(false)
  const [hashtagError, setHashtagError] = useState('')
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false)

  // Media attachments
  type MediaItem = { file: File; preview: string; url?: string; type: 'image' | 'video'; uploading: boolean }
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [destinations, setDestinations] = useState<Record<string, Destination[]>>({})
  const [selectedDestinations, setSelectedDestinations] = useState<Record<string, string>>({})
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set())
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, ConnectedAccount[]>>({})
  const [selectedAccountIds, setSelectedAccountIds] = useState<Record<string, string>>({})
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null)
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0)

  // X / Twitter quota state
  type TwitterQuota = { used: number; limit: number; boosterBalance: number }
  const [twitterQuota, setTwitterQuota] = useState<TwitterQuota | null>(null)

  // Brand Voice badge
  const [brandVoiceName, setBrandVoiceName] = useState<string | null>(null)

  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const maxScheduleDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + (planConfig.scheduleWeeks * 7))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()

  const todayLocal = getLocalDateString()
  const scheduleHorizonLabel =
    plan === 'free'   ? '2 weeks' :
    plan === 'pro'    ? '1 month' :
    '3 months'

  // Show posting disclaimer once per session
  useEffect(() => {
    if (!sessionStorage.getItem('sm_posting_disclaimer_dismissed')) {
      setShowPostingDisclaimer(true)
    }
  }, [])

  // Fetch brand voice for badge
  useEffect(() => {
    fetch('/api/user/brand-voice')
      .then(r => r.json())
      .then(d => {
        const bv = d.brand_voice
        if (bv?.voiceName) setBrandVoiceName(bv.voiceName)
      })
      .catch(() => {})
  }, [])

  // Reload data whenever active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return
    const wsId = activeWorkspace.id || null   // guard: empty string → null

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }

      // Load destinations scoped to this workspace
      const destQuery = supabase
        .from('post_destinations')
        .select('id, platform, label')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: true })

      const destsResult = activeWorkspace && !activeWorkspace.is_personal
        ? await destQuery.eq('workspace_id', activeWorkspace.id)
        : await destQuery.is('workspace_id', null)
      const dests = destsResult.data

      // For client workspaces: no fallback — they have their own isolated accounts
      // For personal workspace: fallback to all user's personal destinations
      const { data: allDests } = (!dests?.length && activeWorkspace?.is_personal)
        ? await supabase
            .from('post_destinations')
            .select('id, platform, label')
            .eq('user_id', data.user.id)
            .is('workspace_id', null)
            .order('created_at', { ascending: true })
        : { data: null }

      const destData = dests?.length ? dests : (allDests || [])

      if (destData.length > 0) {
        const grouped = destData.reduce((acc: Record<string, Destination[]>, d: Destination) => {
          if (!acc[d.platform]) acc[d.platform] = []
          acc[d.platform].push(d)
          return acc
        }, {})
        setDestinations(grouped)
        const autoSelected: Record<string, string> = {}
        Object.entries(grouped).forEach(([platform, list]) => {
          if ((list as Destination[]).length > 0) autoSelected[platform] = (list as Destination[])[0].id
        })
        setSelectedDestinations(autoSelected)
      }

      // Load connected accounts with full details — scoped to workspace
      let accountsQuery = supabase
        .from('connected_accounts')
        .select('id, platform, account_name, platform_user_id')
        .eq('user_id', data.user.id)

      if (activeWorkspace && !activeWorkspace.is_personal) {
        accountsQuery = accountsQuery.eq('workspace_id', activeWorkspace.id)
      } else {
        accountsQuery = accountsQuery.is('workspace_id', null)
      }

      const { data: accountsData } = await accountsQuery

      // Group accounts by platform
      const byPlatform: Record<string, ConnectedAccount[]> = {}
      ;(accountsData || []).forEach((acc: ConnectedAccount) => {
        if (!byPlatform[acc.platform]) byPlatform[acc.platform] = []
        byPlatform[acc.platform].push(acc)
      })
      setConnectedAccounts(byPlatform)

      // Auto-select first account for each platform
      const autoSelected: Record<string, string> = {}
      Object.entries(byPlatform).forEach(([platform, accounts]) => {
        if (accounts.length > 0) autoSelected[platform] = accounts[0].id
      })
      setSelectedAccountIds(autoSelected)

      // Build connected platforms set
      const platformsSet = new Set<string>(Object.keys(byPlatform))
      // Discord/Telegram are connected via post_destinations
      if (destData.length > 0) {
        destData.forEach((d: Destination) => platformsSet.add(d.platform))
      }
      setConnectedPlatforms(platformsSet)

      // Load draft if editing
      const draftId = searchParams.get('draft')
      if (draftId) {
        const { data: draft } = await supabase
          .from('posts')
          .select('*')
          .eq('id', draftId)
          .eq('user_id', data.user.id)
          .single()
        if (draft) {
          setContent(draft.content || '')
          if (draft.platforms?.length > 0) setSelectedPlatforms(draft.platforms)
          setCurrentDraftId(draftId)
          setTemplateBanner('Editing draft — make your changes and save or publish.')
        }
      }

      setLoading(false)
    })
  }, [router, searchParams, activeWorkspace?.id])

  useEffect(() => {
    const templateId        = searchParams.get('template')
    const starterTemplateId = searchParams.get('starterTemplate')
    const draftId           = searchParams.get('draft')

    if (draftId) return

    if (starterTemplateId) {
      const starter = STARTER_TEMPLATES.find(t => t.id === starterTemplateId)
      if (starter) {
        setContent(starter.content)
        const validPlatforms = starter.platforms.filter(p =>
          PLATFORMS.some(pl => pl.id === p && pl.live)
        )
        if (validPlatforms.length > 0) setSelectedPlatforms(validPlatforms)
        setTemplateBanner('Starter template loaded — replace the [bracketed] sections with your content.')
      }
    } else if (templateId) {
      const loadTemplate = async () => {
        const { data } = await supabase
          .from('post_templates')
          .select('*')
          .eq('id', templateId)
          .single()
        if (data) {
          setContent(data.content)
          if (data.platforms && data.platforms.length > 0) {
            const validPlatforms = data.platforms.filter((p: string) =>
              PLATFORMS.some(pl => pl.id === p && pl.live)
            )
            if (validPlatforms.length > 0) setSelectedPlatforms(validPlatforms)
          }
          setTemplateBanner(`Template "${data.title}" loaded.`)
        }
      }
      loadTemplate()
    }
  }, [searchParams])

  // Fetch X quota whenever twitter enters the selected platforms list
  useEffect(() => {
    if (!selectedPlatforms.includes('twitter')) return
    fetch('/api/accounts/twitter/quota')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTwitterQuota({ used: d.used, limit: d.limit, boosterBalance: d.boosterBalance ?? 0 }) })
      .catch(() => {/* non-critical */})
  }, [selectedPlatforms.includes('twitter')]) // eslint-disable-line react-hooks/exhaustive-deps

  const livePlatforms = PLATFORMS.filter(p => p.live)
  const soonPlatforms = PLATFORMS.filter(p => !p.live)

  const activePlatform = selectedPlatforms.length > 0
    ? (PLATFORMS.find(p => selectedPlatforms[0] === p.id) || PLATFORMS[0])
    : null

  const charCount = content.length

  // Per-platform character status — check ALL selected platforms, not just the first
  const overLimitPlatforms = selectedPlatforms
    .map(id => PLATFORMS.find(pl => pl.id === id))
    .filter((p): p is (typeof PLATFORMS)[0] => !!p && charCount > p.limit)
    .sort((a, b) => a.limit - b.limit) // most restrictive first

  const charOver  = overLimitPlatforms.length > 0

  const missingDestinations = selectedPlatforms
    .filter(p => DESTINATION_PLATFORMS.includes(p))
    .filter(p => !selectedDestinations[p] && (!destinations[p] || destinations[p].length === 0))

  const dismissDisclaimer = () => {
    sessionStorage.setItem('sm_posting_disclaimer_dismissed', '1')
    setShowPostingDisclaimer(false)
  }

  const loadHashtagCollections = async () => {
    if (hashtagsLoaded) return
    try {
      const res = await fetch('/api/hashtag-collections')
      const data = await res.json()
      if (res.ok) {
        setHashtagCollections(data.collections)
        setHashtagsLoaded(true)
      }
    } catch {
      // silently fail — non-critical
    }
  }

  const handleToggleHashtagPanel = () => {
    if (!showHashtagPanel) loadHashtagCollections()
    setShowHashtagPanel(p => !p)
  }

  const handleUseCollection = (col: HashtagCollection) => {
    const tagString = col.hashtags.map(t => `#${t}`).join(' ')
    setContent(prev => prev ? `${prev}\n\n${tagString}` : tagString)
    showToast(`Added ${col.hashtags.length} hashtags from "${col.name}" ✓`)
  }

  const handleNewTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = newTagInput.trim().replace(/^#/, '').replace(/\s+/g, '')
      if (tag && !newCollectionTags.includes(tag) && newCollectionTags.length < 30) {
        setNewCollectionTags(prev => [...prev, tag])
      }
      setNewTagInput('')
    }
    if (e.key === 'Backspace' && !newTagInput && newCollectionTags.length > 0) {
      setNewCollectionTags(prev => prev.slice(0, -1))
    }
  }

  const removeNewTag = (tag: string) => {
    setNewCollectionTags(prev => prev.filter(t => t !== tag))
  }

  const handleSaveCollection = async () => {
    setHashtagError('')
    if (!newCollectionName.trim()) { setHashtagError('Collection name is required'); return }
    if (newCollectionTags.length === 0) { setHashtagError('Add at least one hashtag'); return }
    setHashtagSaving(true)
    try {
      const res = await fetch('/api/hashtag-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName, hashtags: newCollectionTags }),
      })
      const data = await res.json()
      if (!res.ok) { setHashtagError(data.error || 'Failed to save'); return }
      setHashtagCollections(prev => [data.collection, ...prev])
      setNewCollectionName('')
      setNewCollectionTags([])
      setNewTagInput('')
      setShowNewCollectionForm(false)
      showToast(`Collection "${data.collection.name}" saved ✓`)
    } catch {
      setHashtagError('Network error. Please try again.')
    } finally {
      setHashtagSaving(false)
    }
  }

  const handleDeleteCollection = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/hashtag-collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setHashtagCollections(prev => prev.filter(c => c.id !== id))
        showToast(`"${name}" deleted`)
      }
    } catch {
      showToast('Failed to delete collection', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleDateChange = (val: string) => {
    setScheduleError('')
    setBestTimeLabel(null)
    if (val && val > maxScheduleDate) {
      setScheduleError(
        `Your ${plan} plan can only schedule up to ${scheduleHorizonLabel} in advance. Upgrade to schedule further out.`
      )
      return
    }
    setScheduleDate(val)
  }

  const handleRateLimit = () => {
    const until = Date.now() + 30_000
    setRateLimitedUntil(until)
    setRateLimitCountdown(30)
  }

  useEffect(() => {
    if (!rateLimitedUntil) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((rateLimitedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setRateLimitedUntil(null)
        setRateLimitCountdown(0)
        clearInterval(interval)
      } else {
        setRateLimitCountdown(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [rateLimitedUntil])

  const handleAiTool = async (tool: typeof AI_TOOLS[0]) => {
    setAiError('')
    if (!content.trim()) {
      setAiError('Write something first — the AI needs your content or topic to work with.')
      return
    }
    if (credits < tool.credits) {
      setAiError(`Not enough credits. This tool costs ${tool.credits} credit${tool.credits > 1 ? 's' : ''} and you have ${credits} remaining.`)
      return
    }
    setActiveAiTool(tool.id)
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.id,
          content,
          platform: activePlatform?.name || 'general',
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'rate_limited') {
          handleRateLimit()
          setAiError(data.message || "You're going too fast — wait 30 seconds and try again.")
        } else {
          setAiError('Something went wrong. Please try again.')
        }
        return
      }
      setAiResult(data.result)
      const newTotal = typeof data.creditsRemaining === 'number' ? data.creditsRemaining : credits - tool.credits
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      } else {
        setCredits(newTotal)
      }
      showToast(`Used ${tool.credits} credit${tool.credits > 1 ? 's' : ''} · ${newTotal} remaining`, 'info')
    } catch {
      setAiError('Network error. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleScorePost = async () => {
    if (!content.trim()) { setScoreError('Write some content first before scoring.'); return }
    if (credits < SCORE_CREDIT_COST) { setScoreError(`You need ${SCORE_CREDIT_COST} credits to score a post.`); return }
    setScoring(true)
    setScoreError('')
    setScoreResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'score', content, platform: activePlatform?.name || 'general' }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'rate_limited') {
          handleRateLimit()
          setScoreError(data.message || "You're going too fast — wait 30 seconds and try again.")
        } else {
          setScoreError('Scoring failed. Please try again.')
        }
        setScoring(false)
        return
      }
      try {
        const raw = data.result
        const scoreMatch        = raw.match(/SCORE:\s*(\d+)/i)
        const strengthsMatch    = raw.match(/STRENGTHS:([\s\S]*?)(?:IMPROVEMENTS:|$)/i)
        const improvementsMatch = raw.match(/IMPROVEMENTS:([\s\S]*?)(?:VERDICT:|$)/i)
        const verdictMatch      = raw.match(/VERDICT:([\s\S]*?)$/i)
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 50
        const label = score >= 80 ? 'Great' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work'
        const strengths = strengthsMatch
          ? strengthsMatch[1].trim().split('\n').filter(Boolean).map((s: string) => s.replace(/^[-•*]\s*/, ''))
          : []
        const improvements = improvementsMatch
          ? improvementsMatch[1].trim().split('\n').filter(Boolean).map((s: string) => s.replace(/^[-•*]\s*/, ''))
          : []
        const verdict = verdictMatch ? verdictMatch[1].trim() : raw
        setScoreResult({ score, label, strengths, improvements, verdict })
      } catch {
        setScoreResult({ score: 0, label: 'Unknown', strengths: [], improvements: [], verdict: data.result })
      }
      const newCredits = typeof data.creditsRemaining === 'number' ? data.creditsRemaining : credits - SCORE_CREDIT_COST
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      } else {
        setCredits(newCredits)
      }
    } catch {
      setScoreError('Network error. Please try again.')
    }
    setScoring(false)
  }

  const handleRepurpose = async () => {
    setRepurposeError('')
    setRepurposeResult('')
    if (!content.trim()) { setRepurposeError('Write or paste content in the composer first.'); return }
    if (credits < 5) { setRepurposeError('Not enough credits. You need 5 credits.'); return }
    setRepurposeLoading(true)
    try {
      const res = await fetch('/api/ai/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format: repurposeFormat }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'rate_limited') {
          handleRateLimit()
          setRepurposeError(data.message || "You're going too fast — wait 30 seconds and try again.")
        } else {
          setRepurposeError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }
      setRepurposeResult(data.result)
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      } else if (typeof data.creditsRemaining === 'number') {
        setCredits(data.creditsRemaining)
      } else {
        setCredits(credits - 5)
      }
      showToast('Repurposed — 5 credits used', 'info')
    } catch {
      setRepurposeError('Network error. Please try again.')
    } finally {
      setRepurposeLoading(false)
    }
  }

  const handleRepurposeCopy = () => {
    if (!repurposeResult) return
    navigator.clipboard.writeText(repurposeResult).then(() => {
      setRepurposeCopied(true)
      setTimeout(() => setRepurposeCopied(false), 2000)
    })
  }

  const handleInsertResult = () => {
    if (!aiResult) return
    setContent(prev => prev ? `${prev}\n\n${aiResult}` : aiResult)
    setAiResult('')
    setActiveAiTool(null)
    showToast('Inserted into post ✓')
  }

  const handleReplaceWithResult = () => {
    if (!aiResult) return
    setContent(aiResult)
    setAiResult('')
    setActiveAiTool(null)
    showToast('Post replaced ✓')
  }

  // Best-time picker — sets schedule to tomorrow at optimal ET hour for selected platforms
  const BEST_HOUR_ET: Record<string, number> = {
    bluesky: 9, discord: 17, telegram: 8, mastodon: 10, twitter: 9,
  }
  const handleUseBestTime = () => {
    const platforms = selectedPlatforms.filter(p => p !== 'discord' && p !== 'telegram')
    const primaryPlatform = platforms[0] || selectedPlatforms[0] || 'bluesky'
    const etHour = BEST_HOUR_ET[primaryPlatform] ?? 9

    // Build tomorrow in local time
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yyyy = tomorrow.getFullYear()
    const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd   = String(tomorrow.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    // ET hour → local time. Detect UTC offset of device, shift from ET (UTC-4).
    const etOffsetMs  = 4 * 60 * 60 * 1000 // EDT = UTC-4
    const utcMs       = Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), etHour) + etOffsetMs
    const localDate   = new Date(utcMs)
    const localHour   = String(localDate.getHours()).padStart(2, '0')
    const localMinute = String(localDate.getMinutes()).padStart(2, '0')
    const timeStr     = `${localHour}:${localMinute}`

    handleDateChange(dateStr)
    setScheduleTime(timeStr)

    // Format a friendly label
    const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' })
    const displayTime = localDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const platformName = PLATFORMS.find(p => p.id === primaryPlatform)?.name ?? primaryPlatform
    setBestTimeLabel(`Set to ${dayName} at ${displayTime} — best time for ${platformName}`)
  }

  const handlePublish = async () => {
    if (!content.trim() || charOver || selectedPlatforms.length === 0 || !!scheduleError || mediaStillUploading) return
    setPublishing(true)
    setPublishResults(null)
    try {
      let scheduledAt: string | undefined
      if (scheduleDate) {
        const time = scheduleTime || '09:00'
        scheduledAt = new Date(`${scheduleDate}T${time}`).toISOString()
      }

      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          scheduledAt,
          destinations: selectedDestinations,
          draftId: currentDraftId || undefined,
          workspaceId: activeWorkspace?.id,
          selectedAccountIds,
          mediaUrls: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Something went wrong', 'error'); return }

      if (scheduledAt) {
        showToast('Post scheduled successfully! ✓')
        setContent('')
        setScheduleDate('')
        setScheduleTime('')
        setCurrentDraftId(null)
        setScoreResult(null)
        clearMedia()
      } else {
        setPublishResults(data.results || [])
        const allFailed  = data.results?.every((r: PublishResult) => !r.success)
        const someFailed = data.results?.some((r: PublishResult) => !r.success)
        if (allFailed) showToast('Failed to publish to all platforms', 'error')
        else if (someFailed) showToast('Published to some platforms — check results below', 'info')
        else {
          showToast('Published successfully! ✓')
          setContent('')
          setCurrentDraftId(null)
          setScoreResult(null)
          clearMedia()
        }
      }
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/posts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          postId: currentDraftId,
          workspaceId: activeWorkspace?.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to save draft', 'error'); return }
      setCurrentDraftId(data.postId)
      showToast('Saved to drafts ✓')
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    e.target.value = '' // reset so same file can be reselected

    const MAX_FILES = 4
    const slots     = MAX_FILES - mediaItems.length
    if (slots <= 0) return
    const toAdd = files.slice(0, slots)

    for (const file of toAdd) {
      const type    = file.type.startsWith('video/') ? 'video' : 'image'
      const preview = type === 'image' ? URL.createObjectURL(file) : ''
      const item: MediaItem = { file, preview, type, uploading: true }

      setMediaItems(prev => [...prev, item])

      try {
        const form = new FormData()
        form.append('file', file)
        const res  = await fetch('/api/media/upload', { method: 'POST', body: form })
        const data = await res.json()

        if (res.ok && data.url) {
          setMediaItems(prev => prev.map(m =>
            m.preview === preview && m.file === file
              ? { ...m, url: data.url, uploading: false }
              : m
          ))
        } else {
          showToast(data.error || 'Upload failed — try a smaller file', 'error')
          setMediaItems(prev => prev.filter(m => !(m.preview === preview && m.file === file)))
          if (preview) URL.revokeObjectURL(preview)
        }
      } catch {
        showToast('Upload failed — check your connection', 'error')
        setMediaItems(prev => prev.filter(m => !(m.preview === preview && m.file === file)))
        if (preview) URL.revokeObjectURL(preview)
      }
    }
  }

  const removeMediaItem = (preview: string, file: File) => {
    setMediaItems(prev => {
      const item = prev.find(m => m.preview === preview && m.file === file)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(m => !(m.preview === preview && m.file === file))
    })
  }

  const clearMedia = () => {
    mediaItems.forEach(m => { if (m.preview) URL.revokeObjectURL(m.preview) })
    setMediaItems([])
  }

  const uploadedMediaUrls = mediaItems.filter(m => m.url).map(m => m.url!)
  const mediaStillUploading = mediaItems.some(m => m.uploading)

  const scoreColor = scoreResult
    ? scoreResult.score >= 80 ? 'text-green-600'
    : scoreResult.score >= 60 ? 'text-blue-600'
    : scoreResult.score >= 40 ? 'text-yellow-600'
    : 'text-red-500' : ''

  const scoreBg = scoreResult
    ? scoreResult.score >= 80 ? 'bg-green-50 border-green-100'
    : scoreResult.score >= 60 ? 'bg-blue-50 border-blue-100'
    : scoreResult.score >= 40 ? 'bg-yellow-50 border-yellow-100'
    : 'bg-red-50 border-red-100' : ''

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Compose</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {activeWorkspace && !activeWorkspace.is_personal
                  ? `Posting as ${activeWorkspace.client_name || activeWorkspace.name}`
                  : 'Write, schedule, and publish your posts'}
              </p>
            </div>
            <button
              onClick={() => setShowPreview(p => !p)}
              className="lg:hidden text-xs font-bold px-3 py-2.5 min-h-[44px] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 transition-all">
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
          </div>

          {/* WORKSPACE BANNER */}
          {activeWorkspace && !activeWorkspace.is_personal && (
            <div className="mb-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-base">🏢</span>
              <p className="text-xs font-semibold text-purple-700">
                Active workspace: <span className="font-extrabold">{activeWorkspace.client_name || activeWorkspace.name}</span>
                {' '}— posts will be scoped to this client.
              </p>
            </div>
          )}

          {templateBanner && (
            <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-700">📋 {templateBanner}</p>
              <button onClick={() => setTemplateBanner(null)} className="text-xs text-blue-400 hover:text-blue-700 ml-4 font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0">✕</button>
            </div>
          )}

          {showPostingDisclaimer && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Heads up on automated posting</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  Scheduled and bulk posting can trigger spam detection on some platforms — especially Mastodon, Bluesky, and X. Space out your posts, vary your content, and stay within each platform&apos;s rate limits. We&apos;re not responsible for account actions taken by third-party platforms.
                </p>
              </div>
              <button onClick={dismissDisclaimer} className="text-amber-400 hover:text-amber-600 text-lg leading-none shrink-0">×</button>
            </div>
          )}

          {showPreview && (
            <div className="lg:hidden mb-4 bg-surface border border-theme rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Preview</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 min-h-24">
                {content
                  ? <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                  : <p className="text-xs text-gray-300 dark:text-gray-600 text-center mt-4">Your post preview appears here</p>
                }
              </div>
              {content && selectedPlatforms.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                  {selectedPlatforms.map(id => {
                    const p = PLATFORMS.find(pl => pl.id === id)
                    if (!p) return null
                    const over = charCount > p.limit
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <span className="text-sm">{p.icon}</span>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{p.name}</span>
                        <span className={`ml-auto text-xs font-bold ${over ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          {charCount}/{p.limit.toLocaleString()}{over && ' ⚠️'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* PLATFORM SELECTOR */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {livePlatforms.map(p => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all border ${
                        selectedPlatforms.includes(p.id)
                          ? 'bg-black text-white border-black'
                          : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}>
                      <span>{p.icon}</span>{p.name}
                    </button>
                  ))}
                </div>
                {/* Multi-account selectors — shown when a selected platform has 2+ accounts */}
                {selectedPlatforms.some(pid => (connectedAccounts[pid]?.length ?? 0) > 1) && (
                  <div className="mt-3 space-y-2">
                    {selectedPlatforms
                      .filter(pid => (connectedAccounts[pid]?.length ?? 0) > 1)
                      .map(pid => {
                        const accounts = connectedAccounts[pid]
                        const platformInfo = PLATFORMS.find(p => p.id === pid)
                        return (
                          <div key={pid} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                              {platformInfo?.icon} {platformInfo?.name}
                            </span>
                            <select
                              value={selectedAccountIds[pid] || ''}
                              onChange={e => setSelectedAccountIds(prev => ({ ...prev, [pid]: e.target.value }))}
                              style={{ fontSize: '16px' }}
                              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
                            >
                              {accounts.map((acc: ConnectedAccount) => (
                                <option key={acc.id} value={acc.id}>
                                  @{acc.account_name || acc.platform_user_id}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {soonPlatforms.map(p => (
                    <div key={p.id} title={`${p.name} — coming soon`}
                      className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border border-dashed border-blue-100 text-blue-300 cursor-not-allowed select-none">
                      <span>{p.icon}</span><span>{p.name}</span>
                      <span className="text-xs font-bold text-blue-300 ml-0.5">· Soon</span>
                    </div>
                  ))}
                  {COMING_SOON_PLATFORMS.map(p => (
                    <div key={p.id} title={`${p.name} — coming soon`}
                      className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed select-none">
                      <span>{p.icon}</span><span>{p.name}</span>
                      <span className="text-xs font-normal text-gray-300 dark:text-gray-600 ml-0.5">· Soon</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlatforms.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700">Select at least one platform to compose a post.</p>
                </div>
              )}

              {/* X / TWITTER QUOTA WARNINGS */}
              {selectedPlatforms.includes('twitter') && twitterQuota && (() => {
                const { used, limit, boosterBalance } = twitterQuota
                if (used >= limit && boosterBalance === 0) {
                  return (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-800">
                      <span>🚫</span>
                      <span className="flex-1">X quota reached ({used}/{limit}) — <Link href="/settings?tab=Plan#x-booster" className="underline font-semibold">Buy X Booster →</Link></span>
                    </div>
                  )
                }
                if (used >= limit && boosterBalance > 0) {
                  return (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5 rounded-lg flex items-center gap-2 border border-amber-200 dark:border-amber-800">
                      <span>⚡</span>
                      <span>Monthly quota reached — using booster balance ({boosterBalance} post{boosterBalance !== 1 ? 's' : ''} remaining)</span>
                    </div>
                  )
                }
                if (used >= Math.floor(limit * 0.8)) {
                  return (
                    <div className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2.5 rounded-lg flex items-center gap-2 border border-yellow-200 dark:border-yellow-800">
                      <span>⚠️</span>
                      <span>X quota at {used}/{limit} — running low</span>
                    </div>
                  )
                }
                return null
              })()}

              {/* UNCONNECTED PLATFORM WARNINGS */}
              {selectedPlatforms
                .filter(id => !connectedPlatforms.has(id))
                .map(id => {
                  const p = PLATFORMS.find(pl => pl.id === id)
                  if (!p) return null
                  return (
                    <div key={id} className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg flex items-center gap-2 border border-amber-200 dark:border-amber-800">
                      <span>⚠️</span>
                      <span>No {p.name} account connected — <Link href="/accounts" className="underline font-semibold">Connect one in Accounts →</Link></span>
                    </div>
                  )
                })}

              {/* DESTINATION SELECTOR */}
              {selectedPlatforms.some(p => DESTINATION_PLATFORMS.includes(p)) && (
                <div className="bg-surface border border-theme rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Post Destinations</p>
                  <div className="space-y-3">
                    {selectedPlatforms
                      .filter(p => DESTINATION_PLATFORMS.includes(p))
                      .map(platformId => {
                        const platform = PLATFORMS.find(p => p.id === platformId)!
                        const platformDests = destinations[platformId] || []
                        return (
                          <div key={platformId}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm">{platform.icon}</span>
                              <span className="text-xs font-bold text-gray-700">{platform.name}</span>
                            </div>
                            {platformDests.length === 0 ? (
                              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                <p className="text-xs text-amber-700 font-semibold">
                                  No {platform.name} destinations configured
                                </p>
                                <Link href="/accounts/destinations"
                                  className="text-xs font-bold text-black ml-3 underline hover:opacity-70 flex-shrink-0">
                                  Add one →
                                </Link>
                              </div>
                            ) : (
                              <select
                                value={selectedDestinations[platformId] || ''}
                                onChange={e => setSelectedDestinations(prev => ({
                                  ...prev,
                                  [platformId]: e.target.value,
                                }))}
                                style={{ fontSize: '16px' }}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-gray-400 bg-white dark:bg-gray-900 font-semibold">
                                {platformDests.map(d => (
                                  <option key={d.id} value={d.id}>{d.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {missingDestinations.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-amber-700">
                    {missingDestinations.map(p => PLATFORMS.find(pl => pl.id === p)?.name).join(' and ')} need{missingDestinations.length === 1 ? 's' : ''} a destination before you can post.
                  </p>
                  <Link href="/accounts/destinations"
                    className="text-xs font-bold text-black ml-3 underline hover:opacity-70 flex-shrink-0">
                    Set up →
                  </Link>
                </div>
              )}

              {/* STARTER TEMPLATES QUICK STRIP — only shown when textarea is empty */}
              {!content && !searchParams.get('draft') && !searchParams.get('starterTemplate') && !searchParams.get('template') && (
                <div className="bg-surface border border-theme rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Starter Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'starter-1',  label: '🚀 Product Launch'        },
                      { id: 'starter-2',  label: '💡 Tips & Tricks'          },
                      { id: 'starter-3',  label: '🤔 Engagement Hook'        },
                      { id: 'starter-4',  label: '👀 Behind the Scenes'      },
                      { id: 'starter-5',  label: '📰 Weekly Roundup'         },
                      { id: 'starter-6',  label: '🎉 Milestone Announcement' },
                      { id: 'starter-7',  label: '🔥 Hot Take'               },
                      { id: 'starter-8',  label: '🧵 Storytime'              },
                      { id: 'starter-9',  label: '🔖 Value Drop'             },
                      { id: 'starter-10', label: '📊 Question / Poll'        },
                      { id: 'starter-11', label: '📈 Behind the Numbers'     },
                      { id: 'starter-12', label: '🗓️ Day in My Life'        },
                      { id: 'starter-13', label: '💡 Lesson Learned'         },
                      { id: 'starter-14', label: '🙏 Appreciation Post'      },
                      { id: 'starter-15', label: '💰 Promotion / Offer'      },
                    ].map(t => (
                      <Link key={t.id} href={`?starterTemplate=${t.id}`}
                        className="text-xs font-semibold px-3 py-2.5 min-h-[44px] inline-flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all">
                        {t.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* TEXT AREA */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <textarea
                  value={content}
                  onChange={e => { setContent(e.target.value); setScoreResult(null) }}
                  placeholder="What do you want to post? Write your content here, or use an AI tool to generate it..."
                  rows={5}
                  className="w-full outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 min-h-[120px] sm:min-h-[200px]"
                  style={{ fontSize: '16px' }}
                />
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800 mt-2 gap-2 flex-wrap">
                  {selectedPlatforms.length === 0 ? (
                    <span className="text-xs text-gray-300 dark:text-gray-600">Select a platform to see character limit</span>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedPlatforms.map(id => {
                        const p = PLATFORMS.find(pl => pl.id === id)
                        if (!p) return null
                        const over    = charCount > p.limit
                        const nearPct = charCount / p.limit
                        const color   = over         ? 'text-red-500'
                                      : nearPct > 0.9 ? 'text-amber-500'
                                      : 'text-gray-400 dark:text-gray-500'
                        const bg      = over         ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-2 py-0.5'
                                      : nearPct > 0.9 ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-0.5'
                                      : ''
                        return (
                          <span key={id} className={`text-xs font-semibold flex items-center gap-1 ${color} ${bg}`}>
                            <span className="text-sm leading-none">{p.icon}</span>
                            <span>{charCount.toLocaleString()}<span className="font-normal opacity-60">/{p.limit.toLocaleString()}</span>{over && ' ⚠️'}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
                    {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* BULK SCHEDULER PROMPT — shown when over char limit */}
                {charOver && (
                  <div className="mt-2 flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                    <span className="text-red-500 text-sm mt-0.5">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed">
                        {charCount - overLimitPlatforms[0].limit} characters over {overLimitPlatforms[0].name}&apos;s {overLimitPlatforms[0].limit.toLocaleString()}-character limit.
                        Split into a timed sequence instead.
                      </p>
                      <Link href="/bulk-scheduler" className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mt-1 transition-colors">
                        Use Bulk Scheduler →
                      </Link>
                    </div>
                  </div>
                )}

                {/* MEDIA ATTACHMENTS */}
                <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                  {mediaItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mediaItems.map((item, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          {item.type === 'image' && item.preview ? (
                            <img src={item.preview} className="w-full h-full object-cover" alt="Media preview" />
                          ) : (
                            <span className="text-2xl">{item.type === 'video' ? '🎬' : '🖼️'}</span>
                          )}
                          {item.uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                          {!item.uploading && item.url && (
                            <div className="absolute top-1 left-1">
                              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaItem(item.preview, item.file)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                            <p className="text-[9px] text-white truncate">{item.file.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={mediaItems.length >= 4}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 min-h-[44px] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <span>📎</span>
                      {mediaItems.length === 0 ? 'Attach image / video' : `${mediaItems.length}/4 attached`}
                    </button>
                    {mediaItems.length > 0 && (
                      <button
                        type="button"
                        onClick={clearMedia}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors font-semibold">
                        Remove all
                      </button>
                    )}
                    {mediaStillUploading && (
                      <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Discord, Bluesky, Mastodon, Telegram · JPEG, PNG, GIF, WebP, MP4
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                    multiple
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* HASHTAG COLLECTIONS */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide"># Collections</p>
                  <button
                    onClick={handleToggleHashtagPanel}
                    className="text-xs font-bold px-3 py-2 min-h-[36px] border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 transition-all">
                    {showHashtagPanel ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showHashtagPanel && (
                  <div className="mt-3 space-y-3">
                    {plan === 'free' && hashtagCollections.length >= 3 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Free plan: 3 collections max</p>
                        <a href="/settings?tab=Plan" className="text-xs font-bold text-blue-800 dark:text-blue-300 hover:underline flex-shrink-0">Upgrade to Pro →</a>
                      </div>
                    )}

                    {hashtagCollections.length === 0 && !showNewCollectionForm && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">No collections yet. Save your favourite hashtag sets to reuse them quickly.</p>
                      </div>
                    )}

                    {hashtagCollections.map(col => (
                      <div key={col.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{col.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUseCollection(col)}
                              className="text-xs font-bold px-2.5 py-1.5 min-h-[32px] bg-black text-white rounded-lg hover:opacity-80 transition-all">
                              Use
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(col.id, col.name)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {col.hashtags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}

                    {showNewCollectionForm ? (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={e => setNewCollectionName(e.target.value)}
                          placeholder="Collection name (e.g. Tech Stack)"
                          style={{ fontSize: '16px' }}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-gray-400 bg-white dark:bg-gray-900"
                        />
                        <div
                          className="min-h-[44px] w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 flex flex-wrap gap-1 items-center cursor-text"
                          onClick={() => document.getElementById('sm-new-tag-input')?.focus()}>
                          {newCollectionTags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                              #{tag}
                              <button type="button" onClick={() => removeNewTag(tag)} className="text-gray-400 hover:text-red-500 transition-colors leading-none">×</button>
                            </span>
                          ))}
                          <input
                            id="sm-new-tag-input"
                            type="text"
                            value={newTagInput}
                            onChange={e => setNewTagInput(e.target.value)}
                            onKeyDown={handleNewTagKeyDown}
                            placeholder={newCollectionTags.length === 0 ? 'Type a hashtag + Enter to add' : ''}
                            style={{ fontSize: '16px' }}
                            className="flex-1 min-w-[120px] outline-none bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{newCollectionTags.length}/30 tags</p>
                        {hashtagError && (
                          <p className="text-xs text-red-500">{hashtagError}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveCollection}
                            disabled={hashtagSaving}
                            className="text-xs font-bold px-3 py-2 min-h-[36px] bg-black text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                            {hashtagSaving ? 'Saving...' : 'Save Collection'}
                          </button>
                          <button
                            onClick={() => { setShowNewCollectionForm(false); setNewCollectionName(''); setNewCollectionTags([]); setNewTagInput(''); setHashtagError('') }}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-semibold min-h-[36px] px-2">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      (plan !== 'free' || hashtagCollections.length < 3) && (
                        <button
                          onClick={() => setShowNewCollectionForm(true)}
                          className="w-full text-xs font-bold px-3 py-2.5 min-h-[44px] border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-gray-500 dark:text-gray-400">
                          + New Collection
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* BRAND VOICE BADGE */}
              <div className="flex items-center gap-2 px-1 mb-1">
                {brandVoiceName ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 bg-[#0a0a0a] border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-bold px-3 py-1.5 rounded-full min-h-[32px]">
                      🎙️ {brandVoiceName}
                    </span>
                    <Link href="/settings?tab=Brand+Voice" className="text-xs text-[#9ca3af] hover:text-[#F59E0B] transition-colors underline underline-offset-2 min-h-[32px] flex items-center">
                      Edit
                    </Link>
                  </>
                ) : (
                  <Link href="/settings?tab=Brand+Voice" className="text-xs text-[#9ca3af] hover:text-[#F59E0B] transition-colors min-h-[44px] flex items-center gap-1">
                    <span>🎙️</span>
                    <span>No brand voice — <span className="underline underline-offset-2">add one</span></span>
                  </Link>
                )}
              </div>

              {/* AI TOOLS */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">AI Tools</p>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{credits} credits remaining</span>
                </div>

                {rateLimitedUntil && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 text-sm text-orange-700 dark:text-orange-300 mb-3">
                    <span className="font-semibold">Rate limit reached.</span> Try again in 0:{String(rateLimitCountdown).padStart(2, '0')}
                    <p className="text-xs mt-1 opacity-75">You're generating too fast — this prevents spam and keeps SocialMate free for everyone.</p>
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {AI_TOOLS.map(tool => (
                    <button key={tool.id} onClick={() => handleAiTool(tool)}
                      disabled={aiLoading || !!rateLimitedUntil} title={tool.desc}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        activeAiTool === tool.id ? 'bg-black text-white border-black'
                        : (aiLoading || !!rateLimitedUntil) ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-900 border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}>
                      <div className="text-lg mb-1">{tool.emoji}</div>
                      <p className="text-xs font-bold">{tool.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tool.credits} cr</p>
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowRepurposePanel(p => !p); setRepurposeResult(''); setRepurposeError('') }}
                    title="Repurpose current content into a different format"
                    className={`p-3 rounded-xl border text-center transition-all ${
                      showRepurposePanel ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-white dark:bg-gray-900 border-gray-200 hover:border-amber-400 text-gray-700 dark:text-gray-300'
                    }`}>
                    <div className="text-lg mb-1">🔄</div>
                    <p className="text-xs font-bold">Repurpose</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">5 cr</p>
                  </button>
                </div>

                {/* REPURPOSE INLINE PANEL */}
                {showRepurposePanel && (
                  <div className="mb-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">🔄 Repurpose Content</p>
                      <button
                        onClick={() => { setShowRepurposePanel(false); setRepurposeResult(''); setRepurposeError('') }}
                        className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-base font-bold">
                        ×
                      </button>
                    </div>

                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                      Uses your current compose content. Pick a format:
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {REPURPOSE_FORMATS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setRepurposeFormat(f.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                            repurposeFormat === f.id
                              ? 'bg-amber-400 text-black border-amber-400'
                              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                          }`}>
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleRepurpose}
                      disabled={repurposeLoading || !content.trim() || !!rateLimitedUntil}
                      className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold py-2.5 min-h-[44px] rounded-xl transition-all flex items-center justify-center gap-2">
                      {repurposeLoading ? (
                        <><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />Repurposing...</>
                      ) : 'Repurpose → (5 credits)'}
                    </button>

                    {repurposeError && (
                      <div className="mt-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                        <p className="text-xs text-red-600 dark:text-red-400">{repurposeError}</p>
                      </div>
                    )}

                    {repurposeResult && !repurposeLoading && (
                      <div className="mt-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Result</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">{repurposeResult}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => { setContent(repurposeResult); setRepurposeResult(''); setShowRepurposePanel(false); showToast('Content replaced ✓') }}
                            className="text-xs font-bold px-3 py-2.5 min-h-[44px] bg-black text-white rounded-lg hover:opacity-80 transition-all">
                            Replace
                          </button>
                          <button
                            onClick={handleRepurposeCopy}
                            className="text-xs font-bold px-3 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:border-gray-500 transition-all">
                            {repurposeCopied ? 'Copied ✓' : 'Copy'}
                          </button>
                          <button
                            onClick={() => setRepurposeResult('')}
                            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all ml-auto min-h-[44px] px-2">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                    <p className="text-xs text-red-600">{aiError}</p>
                  </div>
                )}

                {aiLoading && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Generating with Gemini...
                    </div>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div className="bg-theme border border-theme-md rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Result</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{aiResult}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={handleInsertResult}
                        className="text-xs font-bold px-3 py-2.5 min-h-[44px] bg-black text-white rounded-lg hover:opacity-80 transition-all">
                        Insert below
                      </button>
                      <button onClick={handleReplaceWithResult}
                        className="text-xs font-bold px-3 py-2.5 min-h-[44px] border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:border-gray-500 transition-all">
                        Replace post
                      </button>
                      <button onClick={() => { setAiResult(''); setActiveAiTool(null) }}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all ml-auto min-h-[44px] px-2">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* POST SCORE */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Post Score</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">AI predicts how your post will perform before you publish</p>
                  </div>
                  <button onClick={handleScorePost}
                    disabled={scoring || !content.trim() || credits < SCORE_CREDIT_COST || !!rateLimitedUntil}
                    className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto">
                    {scoring ? (
                      <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scoring...</>
                    ) : `⚡ Score Post — ${SCORE_CREDIT_COST} cr`}
                  </button>
                </div>

                {scoreError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-xs text-red-600">{scoreError}</p>
                  </div>
                )}

                {scoreResult && (
                  <div className={`border rounded-xl p-4 ${scoreBg}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center flex-shrink-0">
                        <p className={`text-4xl font-extrabold ${scoreColor}`}>{scoreResult.score}</p>
                        <p className={`text-xs font-bold ${scoreColor}`}>{scoreResult.label}</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-white/60 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all ${
                            scoreResult.score >= 80 ? 'bg-green-500' :
                            scoreResult.score >= 60 ? 'bg-blue-500' :
                            scoreResult.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                          }`} style={{ width: `${scoreResult.score}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{scoreResult.verdict}</p>
                      </div>
                    </div>
                    {scoreResult.strengths.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">✅ Strengths</p>
                        <ul className="space-y-1">
                          {scoreResult.strengths.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-300">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scoreResult.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">💡 Improvements</p>
                        <ul className="space-y-1">
                          {scoreResult.improvements.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-300">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!scoreResult && !scoreError && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Write your post and hit Score Post to get an AI prediction of how it will perform.</p>
                  </div>
                )}
              </div>

              {/* SCHEDULE */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Schedule</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {plan === 'free'   && '⏳ Free — up to 2 weeks ahead'}
                    {plan === 'pro'    && '⏳ Pro — up to 1 month ahead'}
                    {plan === 'agency' && '⏳ Agency — up to 3 months ahead'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input type="date" value={scheduleDate}
                    min={todayLocal}
                    max={maxScheduleDate}
                    onChange={e => handleDateChange(e.target.value)}
                    style={{ fontSize: '16px' }}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-black dark:bg-gray-900 transition-all" />
                  <input type="time" value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    style={{ fontSize: '16px' }}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-black dark:bg-gray-900 transition-all" />
                </div>
                {/* Best time picker */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUseBestTime}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] hover:text-amber-400 transition-colors">
                    ✨ Use best time
                  </button>
                  {bestTimeLabel && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">{bestTimeLabel}</span>
                  )}
                </div>
                {scheduleError && (
                  <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-amber-700">{scheduleError}</p>
                    <a href="/settings?tab=Plan" className="text-xs font-bold text-black whitespace-nowrap hover:underline">Upgrade →</a>
                  </div>
                )}
              </div>

              {/* PUBLISH RESULTS */}
              {publishResults && (
                <div className="bg-surface border border-theme rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Publish Results</p>
                  <div className="space-y-2">
                    {publishResults.map(result => (
                      <div key={result.platform} className={`flex items-center gap-3 p-3 rounded-xl border ${
                        result.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                      }`}>
                        <span className="text-lg">{PLATFORMS.find(p => p.id === result.platform)?.icon || '📱'}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{PLATFORMS.find(p => p.id === result.platform)?.name || result.platform}</p>
                          {result.error && <p className="text-xs text-red-500 mt-0.5">{result.error}</p>}
                        </div>
                        <span className={`text-xs font-bold flex-shrink-0 ${result.success ? 'text-green-600' : 'text-red-500'}`}>
                          {result.success ? '✓ Published' : '✗ Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIONS — sticky on mobile so keyboard doesn't push buttons off screen */}
              <div className="sticky bottom-0 bg-theme border-t border-theme-md pt-3 pb-4 -mx-1 px-1 lg:static lg:border-t-0 lg:bg-transparent lg:pt-0 lg:pb-0 lg:mx-0 lg:px-0"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePublish}
                    disabled={
                      publishing ||
                      !content.trim() ||
                      charOver ||
                      selectedPlatforms.length === 0 ||
                      !!scheduleError ||
                      missingDestinations.length > 0 ||
                      mediaStillUploading
                    }
                    className="flex-1 bg-black text-white text-sm font-bold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {publishing
                      ? (scheduleDate ? 'Scheduling...' : 'Publishing...')
                      : (scheduleDate ? 'Schedule Post' : 'Post Now')}
                  </button>
                  <button onClick={handleSaveDraft} disabled={saving || !content.trim()}
                    className="px-5 py-3 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : currentDraftId ? 'Update Draft' : 'Save Draft'}
                  </button>
                </div>
              </div>

            </div>

            {/* DESKTOP PREVIEW */}
            <div className="hidden lg:block space-y-4">
              {/* QUICK START — shown when no content yet */}
              {!content && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Quick Start</p>
                  <div className="space-y-2">
                    {[
                      { emoji: '1️⃣', text: 'Connect a social account', href: '/accounts' },
                      { emoji: '2️⃣', text: 'Write your post or use an AI tool', href: null },
                      { emoji: '3️⃣', text: 'Post now or schedule it', href: null },
                    ].map((step, i) => (
                      step.href
                        ? <a key={i} href={step.href} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors">
                            <span>{step.emoji}</span> <span className="underline underline-offset-2">{step.text}</span>
                          </a>
                        : <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{step.emoji}</span> <span>{step.text}</span>
                          </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Try a starter template:</p>
                    <Link href="?starterTemplate=starter-1" className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all">
                      🚀 Product Launch Template
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-surface border border-theme rounded-2xl p-4 sticky top-8">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Preview</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 min-h-32">
                  {content
                    ? <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
                    : <div className="text-center mt-6">
                        <p className="text-xs text-gray-300 dark:text-gray-600 mb-3">Your post preview appears here</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Start typing or use an AI tool ↙</p>
                      </div>
                  }
                </div>
                {content && selectedPlatforms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                    {selectedPlatforms.map(id => {
                      const p = PLATFORMS.find(pl => pl.id === id)
                      if (!p) return null
                      const over = charCount > p.limit
                      return (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-sm">{p.icon}</span>
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{p.name}</span>
                          <span className={`ml-auto text-xs font-bold ${over ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {charCount}/{p.limit.toLocaleString()}
                            {over && ' ⚠️'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {selectedPlatforms.some(p => DESTINATION_PLATFORMS.includes(p)) && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                    {selectedPlatforms
                      .filter(p => DESTINATION_PLATFORMS.includes(p))
                      .map(platformId => {
                        const destId = selectedDestinations[platformId]
                        const dest = destinations[platformId]?.find(d => d.id === destId)
                        const platform = PLATFORMS.find(p => p.id === platformId)
                        if (!dest) return null
                        return (
                          <div key={platformId} className="flex items-center gap-1.5">
                            <span className="text-xs">{platform?.icon}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">→ {dest.label}</span>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'info'  ? 'bg-blue-600' :
          'bg-black'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Compose() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <ComposeInner />
    </Suspense>
  )
}
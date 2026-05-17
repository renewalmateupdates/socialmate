'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useI18n } from '@/contexts/I18nContext'

const REPURPOSE_FORMATS = [
  { id: 'thread',        label: 'Thread'    },
  { id: 'email',         label: 'Email'     },
  { id: 'caption',       label: 'Caption'   },
  { id: 'long_form',     label: 'Long-Form' },
  { id: 'short_hook',    label: 'Hook'      },
  { id: 'linkedin_post', label: 'LinkedIn'  },
] as const

type RepurposeFormat = typeof REPURPOSE_FORMATS[number]['id']

function RepurposeCard({ credits, setCredits, applyCredits }: {
  credits: number
  setCredits: (n: number) => void
  applyCredits: (monthly: number, earned: number, paid: number) => void
}) {
  const { t } = useI18n()
  const [content, setContent]   = useState('')
  const [format, setFormat]     = useState<RepurposeFormat>('thread')
  const [result, setResult]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(false)

  const handleRepurpose = async () => {
    setError('')
    setResult('')
    if (!content.trim()) { setError('Paste your content first.'); return }
    if (credits < 5) { setError('Not enough credits. You need 5 credits.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'rate_limited') {
          setError(data.message || "You're going too fast — wait 30 seconds and try again.")
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }
      setResult(data.result)
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      } else if (typeof data.creditsRemaining === 'number') {
        setCredits(data.creditsRemaining)
      } else {
        setCredits(credits - 5)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-surface border border-theme rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Content Repurpose</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Transform any content into a new format instantly</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black text-white flex-shrink-0">5 credits</span>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={t('app_ai_features.repurpose_placeholder')}
        rows={4}
        style={{ fontSize: '16px' }}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none transition-colors mb-3"
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {REPURPOSE_FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`text-xs font-bold px-3 py-2 rounded-full border transition-all ${
              format === f.id
                ? 'bg-amber-400 text-black border-amber-400'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleRepurpose}
        disabled={loading || !content.trim()}
        className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{t('app_ai_features.repurposing')}</>
        ) : t('app_ai_features.repurpose_btn')}
      </button>

      {error && (
        <div className="mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('app_ai_features.result_label')}</p>
            <button
              onClick={handleCopy}
              className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-80 transition-all flex-shrink-0">
              {copied ? t('app_ai_features.copied') : t('app_ai_features.copy')}
            </button>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  )
}

const AI_TOOLS = [
  {
    emoji: '✍️',
    label: 'Caption Generator',
    credits: '5 credits',
    what: 'Generates platform-optimized captions based on your topic and tone.',
    how: 'Powered by Google Gemini. Analyzes your topic and platform to generate captions that match character limits, tone, and engagement patterns.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '#️⃣',
    label: 'Hashtag Generator',
    credits: '5 credits',
    what: 'Generates a set of relevant, high-performing hashtags for your post.',
    how: 'AI analyzes your caption content and niche to suggest hashtags that balance reach and relevance.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🔁',
    label: 'Post Rewrite / Improver',
    credits: '5 credits',
    what: 'Takes your existing caption and makes it sharper, more engaging, and better structured.',
    how: 'AI rewrites for stronger hooks, better readability, and platform-appropriate tone.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🎣',
    label: 'Viral Hook Generator',
    credits: '5 credits',
    what: 'Generates 3 scroll-stopping opening lines designed to drive clicks and engagement.',
    how: 'Trained on viral content patterns across TikTok, YouTube, LinkedIn and Reddit.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🧵',
    label: 'Thread Generator',
    credits: '10 credits',
    what: 'Turns a single topic or idea into a structured multi-part thread.',
    how: 'AI structures your idea into a narrative arc with a hook, supporting points, and a strong CTA.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '♻️',
    label: 'Content Repurposer',
    credits: '5 credits',
    what: 'Paste a blog post, transcript, or long caption and get platform-ready content out the other side.',
    how: 'AI extracts key ideas from long-form content and reshapes them into short-form posts for each platform.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '⚡',
    label: 'Post Score',
    credits: '5 credits',
    what: 'Get an AI score (0–100) on your post with specific strengths and improvements.',
    how: 'AI evaluates your post for hook strength, readability, platform fit, and engagement potential.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
  {
    emoji: '📅',
    label: 'AI Content Calendar',
    credits: '25 credits',
    what: 'Generate a full 30-day content calendar based on your niche, platforms, and posting goals.',
    how: 'AI plans a content strategy around your niche, then generates individual posts for each day. Fully editable before publishing.',
    href: '/compose',
    available: true,
    proOnly: true,
  },
  {
    emoji: '🎨',
    label: 'AI Image Generation',
    credits: '25 credits',
    what: 'Generate custom images for your posts directly inside SocialMate.',
    how: 'Powered by Google Gemini image models. Generated images can be added directly to your scheduled post.',
    href: '/compose',
    available: true,
    proOnly: true,
  },
]

const GROWTH_TOOLS = [
  {
    emoji: '🔥',
    label: 'SM-Pulse',
    credits: '20 credits per scan',
    what: 'Scans social platforms to surface what is trending in your niche right now.',
    how: 'Analyzes trending hashtags, viral post formats, and engagement spikes across Reddit, YouTube, and connected platforms.',
    href: '/sm-pulse',
    available: true,
    proOnly: false,
  },
  {
    emoji: '📊',
    label: 'SM-Radar',
    credits: '20 credits per report',
    what: 'Analyzes your personal post performance to surface what is actually working for your audience.',
    how: 'SM-Radar pulls data from your connected accounts and identifies patterns in your best-performing content — timing, format, length, and tone.',
    href: '/sm-radar',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🕵️',
    label: 'Content Gap Detector',
    credits: '10 credits',
    what: 'Spots underserved topics and content gaps in your niche so you can create content nobody else is making.',
    how: 'Analyzes your niche across platforms and surfaces the questions, formats, and topics that are missing or underserved.',
    href: '/content-gap',
    available: true,
    proOnly: false,
  },
]

const SCHEDULING_TOOLS = [
  {
    emoji: '📦',
    label: 'Bulk Scheduler',
    credits: 'Free (manual)',
    what: 'Schedule dozens of posts at once instead of one at a time.',
    how: 'Posts are queued and distributed across your selected timeframe. Manual bulk scheduling is always free.',
    href: '/bulk-scheduler',
    available: true,
    proOnly: false,
  },
  {
    emoji: '⏰',
    label: 'Best Time to Post',
    credits: 'Free',
    what: 'See when your audience is most active so you can schedule posts for maximum reach.',
    how: 'Pulled from your connected account analytics. Displayed on your dashboard and suggested during scheduling.',
    href: '/best-times',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🛡️',
    label: 'Platform Requirement Guard',
    credits: 'Always free',
    what: "Automatically warns you if your post violates a platform's rules before it goes live.",
    how: 'Checks every post against known platform limits for character counts, video length, file size, and hashtag caps before scheduling.',
    href: '/compose',
    available: true,
    proOnly: false,
  },
]

const CREATOR_TOOLS = [
  {
    emoji: '🔗',
    label: 'Link-in-Bio Page',
    credits: 'Free',
    what: 'A clean, shareable page that houses all your links — like Linktree, built into SocialMate.',
    how: 'Fully customizable from your dashboard. Pro users can connect a custom domain.',
    href: '/link-in-bio',
    available: true,
    proOnly: false,
  },
  {
    emoji: '📋',
    label: 'Post Template Library',
    credits: 'Free',
    what: 'Save your best post formats as reusable templates so you never start from scratch.',
    how: 'Templates are stored in your account for quick reuse.',
    href: '/templates',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🖼️',
    label: 'Media Library',
    credits: 'Free',
    what: 'Store and organize your images and videos inside SocialMate for quick access when scheduling.',
    how: 'Free tier: 1 GB. Pro: 10 GB. Agency: 50 GB.',
    href: '/media',
    available: true,
    proOnly: false,
  },
  {
    emoji: '🏷️',
    label: 'Hashtag Collections',
    credits: 'Free',
    what: 'Save groups of hashtags and apply them to posts with one click.',
    how: 'Saved in your account. Fully editable. No limits on how many collections you create.',
    href: '/hashtags',
    available: true,
    proOnly: false,
  },
]

function ToolCard({ tool, plan }: { tool: any; plan: string }) {
  const { t } = useI18n()
  const isLocked = tool.proOnly && plan === 'free'

  const inner = (
    <div className={`bg-surface border rounded-2xl p-5 transition-all group ${
      isLocked
        ? 'border-theme opacity-60'
        : 'border-theme hover:border-gray-300 hover:shadow-sm cursor-pointer'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.emoji}</span>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{tool.label}</p>
          {tool.proOnly && (
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">{t('app_ai_features.pro_badge')}</span>
          )}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
          tool.credits === 'Free' || tool.credits === 'Always free' || tool.credits === 'Free (manual)'
            ? 'bg-green-50 text-green-600'
            : 'bg-black text-white'
        }`}>
          {tool.credits}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t('app_ai_features.what_it_does')}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tool.what}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t('app_ai_features.how_it_works')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tool.how}</p>
        </div>
      </div>
      {!isLocked && tool.href && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs font-bold text-black dark:text-white group-hover:underline">{t('app_ai_features.use_this_tool')}</span>
        </div>
      )}
      {isLocked && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs font-bold text-purple-500">{t('app_ai_features.upgrade_to_pro')}</span>
        </div>
      )}
    </div>
  )

  if (!isLocked && tool.href) {
    return <Link href={tool.href}>{inner}</Link>
  }
  if (isLocked) {
    return <Link href="/settings?tab=Plan">{inner}</Link>
  }
  return inner
}

function Section({ title, tools, plan }: { title: string; tools: any[]; plan: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      <div className="space-y-3">
        {tools.map(tool => <ToolCard key={tool.label} tool={tool} plan={plan} />)}
      </div>
    </div>
  )
}

export default function AIFeaturesPage() {
  const router = useRouter()
  const { credits, setCredits, applyCredits, creditsTotal, plan } = useWorkspace()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

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
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t('app_ai_features.title')}</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('app_ai_features.subtitle')}</p>
            </div>
            <div className={`text-right px-4 py-3 rounded-2xl border ${
              plan === 'agency' ? 'bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-800' :
              plan === 'pro'    ? 'bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-800'     :
              'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('app_ai_features.ai_credits')}</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{credits} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">/ {creditsTotal}</span></p>
              {plan === 'free' && (
                <Link href="/settings?tab=Plan" className="text-xs font-bold text-black dark:text-white hover:underline">
                  {t('app_ai_features.get_more_credits')}
                </Link>
              )}
            </div>
          </div>

          <div className="bg-black text-white rounded-2xl p-5 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t('app_ai_features.all_tools_live')}</p>
              <p className="text-sm font-extrabold">{t('app_ai_features.tools_ready')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('app_ai_features.pro_required')}</p>
            </div>
            <Link href="/compose"
              className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              {t('app_ai_features.open_compose')}
            </Link>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3 mb-8 flex items-start gap-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>{t('app_ai_features.why_credits')}</strong> {t('app_ai_features.credits_explanation')}
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-4">{t('app_ai_features.content_repurpose')}</h2>
            <RepurposeCard credits={credits} setCredits={setCredits} applyCredits={applyCredits} />
          </div>

          <Section title={t('app_ai_features.section_ai_tools')} tools={AI_TOOLS} plan={plan} />
          <Section title={t('app_ai_features.section_growth')} tools={GROWTH_TOOLS} plan={plan} />
          <Section title={t('app_ai_features.section_scheduling')} tools={SCHEDULING_TOOLS} plan={plan} />
          <Section title={t('app_ai_features.section_creator')} tools={CREATOR_TOOLS} plan={plan} />

        </div>
      </main>
    </div>
  )
}
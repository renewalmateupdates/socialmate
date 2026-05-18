'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

// ─── Question bank ────────────────────────────────────────────────────────────

type QType = 'multi' | 'single' | 'text'
interface Question {
  key: string
  text: string
  type: QType
  options?: string[]
  placeholder?: string
  tier: 'foundation' | 'deep_dive' | 'advanced'
}

const QUESTIONS: Question[] = [
  // ── Foundation (10 questions) ───────────────────────────────────────────────
  {
    key: 'niche',
    text: 'What best describes your main content niche?',
    type: 'multi',
    options: ['Entrepreneurship', 'Creator Economy', 'Personal Finance', 'Tech & Coding', 'Health & Fitness', 'Lifestyle', 'Education', 'Music & Art', 'Gaming', 'Sports', 'Other'],
    tier: 'foundation',
  },
  {
    key: 'audience',
    text: 'Who are you creating content for?',
    type: 'multi',
    options: ['Aspiring entrepreneurs', '9-to-5 workers who want out', 'Creators and influencers', 'College students', 'Working professionals', 'General audience', 'Anyone willing to listen'],
    tier: 'foundation',
  },
  {
    key: 'content_goals',
    text: 'What do you want your content to achieve?',
    type: 'multi',
    options: ['Build my personal brand', 'Grow sales or clients', 'Build a loyal community', 'Share knowledge for free', 'Go viral', 'Inspire real action', 'Document my journey'],
    tier: 'foundation',
  },
  {
    key: 'voice_words',
    text: 'Pick words that describe YOUR voice.',
    type: 'multi',
    options: ['Real & unfiltered', 'Hustle-driven', 'Strategic', 'Funny', 'Educational', 'Inspirational', 'Bold', 'Laid-back', 'Analytical', 'Raw', 'Confident', 'Vulnerable'],
    tier: 'foundation',
  },
  {
    key: 'natural_talk',
    text: 'How do you naturally talk?',
    type: 'single',
    options: ['Like I\'m texting a friend', 'Like I\'m teaching a class', 'Like I\'m giving a speech', 'Depends on the day'],
    tier: 'foundation',
  },
  {
    key: 'posting_style',
    text: 'What\'s your posting style?',
    type: 'single',
    options: ['Short punchy hits (under 100 words)', 'Long-form stories or threads', 'A mix of both'],
    tier: 'foundation',
  },
  {
    key: 'never_sound_like',
    text: 'What would you NEVER want to sound like?',
    type: 'multi',
    options: ['A corporate robot', 'A fake guru selling a dream', 'Generic AI filler', 'An influencer just chasing clout', 'None of these bother me'],
    tier: 'foundation',
  },
  {
    key: 'your_story',
    text: 'In one sentence — what\'s your story? (Who are you and what are you building?)',
    type: 'text',
    placeholder: 'e.g. "I work a deli job and build a SaaS nights and weekends because I believe everyone deserves the tools the pros use."',
    tier: 'foundation',
  },
  {
    key: 'content_solves',
    text: 'What problem do you create content to solve for people?',
    type: 'text',
    placeholder: 'e.g. "I show first-gen entrepreneurs how to build without funding, connections, or a degree."',
    tier: 'foundation',
  },
  {
    key: 'personal_slang',
    text: 'What words, phrases or slang do you use IRL that make you YOU?',
    type: 'text',
    placeholder: 'e.g. "bro, facts, no cap, lowkey, ight, we in boi"',
    tier: 'foundation',
  },

  // ── Deep Dive (15 questions) ────────────────────────────────────────────────
  {
    key: 'endless_topic',
    text: 'What topic could you talk about for 3 hours straight — no notes needed?',
    type: 'text',
    placeholder: 'e.g. "Building software as a non-developer, business credit, why most gurus are full of it"',
    tier: 'deep_dive',
  },
  {
    key: 'niche_wrong',
    text: 'What\'s something your niche consistently gets wrong that you always want to correct?',
    type: 'text',
    placeholder: 'e.g. "Everyone says you need to post every day. I think consistency beats frequency."',
    tier: 'deep_dive',
  },
  {
    key: 'vulnerability',
    text: 'How do you handle personal vulnerability in your content?',
    type: 'single',
    options: ['I\'m an open book — I share everything', 'I share some things when relevant', 'I keep personal stuff private'],
    tier: 'deep_dive',
  },
  {
    key: 'humor',
    text: 'Do you use humor in your content?',
    type: 'single',
    options: ['Yes constantly — it\'s part of my brand', 'Sometimes when it fits naturally', 'Rarely', 'Never'],
    tier: 'deep_dive',
  },
  {
    key: 'differentiator',
    text: 'What separates you from everyone else doing what you do?',
    type: 'text',
    placeholder: 'e.g. "I\'m actually doing it while broke. No $10k course. Just code, sweat, and a deli apron."',
    tier: 'deep_dive',
  },
  {
    key: 'audience_feel',
    text: 'When someone reads your content, how do you want them to feel?',
    type: 'multi',
    options: ['Motivated to take action right now', 'Seen and understood', 'Smarter than before', 'Entertained', 'Like they got real advice from a friend'],
    tier: 'deep_dive',
  },
  {
    key: 'failure_stance',
    text: 'How do you talk about your failures and mistakes?',
    type: 'single',
    options: ['I share them openly as lessons', 'I mention them when relevant', 'I keep them private'],
    tier: 'deep_dive',
  },
  {
    key: 'building_toward',
    text: 'What are you building toward? Be specific.',
    type: 'text',
    placeholder: 'e.g. "2,000 paying users by end of 2026, quit the deli job, help other founders do the same"',
    tier: 'deep_dive',
  },
  {
    key: 'one_personality_thing',
    text: 'If SOMA could capture ONE thing about your personality in every post, what would it be?',
    type: 'text',
    placeholder: 'e.g. "That I\'m building this from nothing — and I\'m going to make it."',
    tier: 'deep_dive',
  },
  {
    key: 'role',
    text: 'Are you more of a teacher, a peer, or an entertainer?',
    type: 'single',
    options: ['Teacher — I want to educate', 'Peer — I want to be relatable', 'Entertainer — I want to be memorable', 'All three honestly'],
    tier: 'deep_dive',
  },
  {
    key: 'content_lead',
    text: 'Do you prefer to lead with data/facts, personal stories, or strong opinions?',
    type: 'single',
    options: ['Data and facts', 'Personal stories', 'Strong opinions', 'Mix it up every time'],
    tier: 'deep_dive',
  },
  {
    key: 'contrarian_belief',
    text: 'What\'s a belief you hold that most people in your niche would disagree with?',
    type: 'text',
    placeholder: 'e.g. "You don\'t need a business coach. You need to start building and learn from reality."',
    tier: 'deep_dive',
  },
  {
    key: 'audience_frustration',
    text: 'Describe your audience\'s #1 frustration in one sentence.',
    type: 'text',
    placeholder: 'e.g. "They want to build something but feel stuck because they think they need money or a team first."',
    tier: 'deep_dive',
  },
  {
    key: 'speaking_to',
    text: 'Do you want to sound like you\'re speaking to one person or a crowd?',
    type: 'single',
    options: ['One person (direct, intimate)', 'A crowd (broad, rallying)', 'Depends on the content'],
    tier: 'deep_dive',
  },
  {
    key: 'success_vision',
    text: 'What does your content success look like in 12 months?',
    type: 'text',
    placeholder: 'e.g. "10k real followers, 500 subscribers, and 5 people who DM saying I changed how they think"',
    tier: 'deep_dive',
  },

  // ── Advanced (15 questions) ─────────────────────────────────────────────────
  {
    key: 'promo_stance',
    text: 'How do you feel about promotional content mixed with organic posts?',
    type: 'single',
    options: ['I hate it — keep it pure', 'I\'ll do it if done authentically', 'I\'m comfortable with it'],
    tier: 'advanced',
  },
  {
    key: 'content_ratio',
    text: 'What ratio of evergreen vs trending content do you prefer?',
    type: 'single',
    options: ['Mostly evergreen (timeless advice)', 'Mix of both (50/50)', 'Mostly trending (timely angles)'],
    tier: 'advanced',
  },
  {
    key: 'slow_week',
    text: 'How should SOMA handle weeks when nothing major happened in your life?',
    type: 'single',
    options: ['Repurpose past wins and lessons', 'Go deeper on personal/behind-the-scenes', 'Post timeless advice from your worldview', 'Ask me before generating'],
    tier: 'advanced',
  },
  {
    key: 'hot_take_ratio',
    text: 'How often do you want hot takes or controversial angles?',
    type: 'single',
    options: ['Every post if possible', 'About 1 in 3 posts', 'Occasionally when it fits', 'Rarely or never'],
    tier: 'advanced',
  },
  {
    key: 'vibe_reference',
    text: 'What creator, brand, or public figure has a vibe closest to yours?',
    type: 'text',
    placeholder: 'e.g. "Gary Vee mixed with Naval Ravikant. Direct but thoughtful."',
    tier: 'advanced',
  },
  {
    key: 'first_impression',
    text: 'What\'s the ONE thing you want new followers to know about you immediately?',
    type: 'text',
    placeholder: 'e.g. "That I\'m just like them — no connections, no funding, building anyway."',
    tier: 'advanced',
  },
  {
    key: 'consistency_vs_quality',
    text: 'How do you balance consistency vs quality?',
    type: 'single',
    options: ['Consistency wins — post even if it\'s not perfect', 'Quality over everything — I\'d rather skip than post weak content', 'Both equally — I find a way to do both'],
    tier: 'advanced',
  },
  {
    key: 'post_format',
    text: 'Do you prefer posts that invite discussion, or bold statements that stand alone?',
    type: 'single',
    options: ['Questions that invite discussion', 'Bold statements that make a point', 'Both work for me'],
    tier: 'advanced',
  },
  {
    key: 'proud_content',
    text: 'What content have you posted that you\'re most proud of? Why?',
    type: 'text',
    placeholder: 'Tell SOMA what your best work looks like so it can aim for that.',
    tier: 'advanced',
  },
  {
    key: 'campaign_style',
    text: 'How do you want SOMA to handle campaign-style content? (e.g., 3-day series, challenge week)',
    type: 'single',
    options: ['Yes — plan campaigns and series when relevant', 'Stick to standalone posts', 'Mix of both'],
    tier: 'advanced',
  },
  {
    key: 'promo_ratio',
    text: 'What\'s your content-to-promotion ratio goal?',
    type: 'single',
    options: ['100% content (never promotional)', '90/10 (mostly content, rare promos)', '80/20 (standard balance)', '70/30 or more (actively promoting)'],
    tier: 'advanced',
  },
  {
    key: 'pov_style',
    text: 'Should SOMA write posts in first person (I, me, my) or more general?',
    type: 'single',
    options: ['Always first person — MY voice', 'General perspective when it fits', 'Mix it up'],
    tier: 'advanced',
  },
  {
    key: 'avoid_topics',
    text: 'Are there any topics or themes SOMA should avoid entirely?',
    type: 'text',
    placeholder: 'e.g. "Never mention politics, religion, or anything that could alienate my audience"',
    tier: 'advanced',
  },
  {
    key: 'seasonal_relevance',
    text: 'What times of year or events matter most to your content?',
    type: 'text',
    placeholder: 'e.g. "Tax season (Jan-April), Black Friday, back to school, NBA playoffs"',
    tier: 'advanced',
  },
  {
    key: 'anything_else',
    text: 'Anything else SOMA should know about you that we haven\'t asked?',
    type: 'text',
    placeholder: 'This is your chance to tell SOMA the thing that makes you different in a way no question captured.',
    tier: 'advanced',
  },
]

const TIER_CONFIG = {
  foundation: {
    label: 'Foundation',
    badge: '10 questions',
    desc: 'Core voice and style. Done in 5 minutes.',
    color: 'emerald',
    questions: QUESTIONS.filter(q => q.tier === 'foundation'),
  },
  deep_dive: {
    label: 'Deep Dive',
    badge: '25 questions',
    desc: 'Foundation + personality and audience depth.',
    color: 'amber',
    questions: QUESTIONS.filter(q => q.tier === 'foundation' || q.tier === 'deep_dive'),
  },
  advanced: {
    label: 'Advanced',
    badge: '40 questions',
    desc: 'Full intelligence. SOMA learns everything.',
    color: 'purple',
    questions: QUESTIONS,
  },
}

type Tier = keyof typeof TIER_CONFIG

// ─── Component ────────────────────────────────────────────────────────────────

export default function SomaVoicePage() {
  const router = useRouter()
  const { t } = useI18n()
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'done'>('intro')
  const [selectedTier, setSelectedTier] = useState<Tier>('foundation')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [existingTier, setExistingTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/soma/voice')
      .then(r => r.json())
      .then(d => {
        if (d.personality_tier && d.personality_tier !== 'none') {
          setExistingTier(d.personality_tier)
          if (d.personality_answers) setAnswers(d.personality_answers)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeQuestions = TIER_CONFIG[selectedTier].questions
  const currentQ = activeQuestions[currentIdx]
  const progress = ((currentIdx + 1) / activeQuestions.length) * 100

  function handleSelect(key: string, value: string, type: QType) {
    setAnswers(prev => {
      if (type === 'multi') {
        const arr: string[] = Array.isArray(prev[key]) ? [...prev[key]] : []
        return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
      }
      return { ...prev, [key]: value }
    })
  }

  function handleText(key: string, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function canProceed() {
    if (!currentQ) return false
    const val = answers[currentQ.key]
    if (currentQ.type === 'text') return true // text is optional
    if (currentQ.type === 'multi') return Array.isArray(val) && val.length > 0
    return !!val
  }

  async function handleFinish() {
    setSaving(true)
    try {
      await fetch('/api/soma/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, tier: selectedTier }),
      })
      setPhase('done')
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Intro / Tier Selection ──────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <Link href="/soma/projects" className="text-gray-500 hover:text-gray-300 text-sm mb-8 inline-flex items-center gap-1">
          {t('app_soma_voice.back_to_projects')}
        </Link>

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🧬</div>
          <h1 className="text-3xl font-bold text-white mb-3">{t('app_soma_voice.title')}</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            {t('app_soma_voice.subtitle')}
          </p>
          {existingTier && (
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700 rounded-lg px-4 py-2 text-sm text-purple-300">
              ✓ You completed <strong>{TIER_CONFIG[existingTier as Tier]?.label ?? existingTier}</strong> — {t('app_soma_voice.existing_tier_note')}
            </div>
          )}
        </div>

        <div className="grid gap-4 mb-8">
          {(Object.keys(TIER_CONFIG) as Tier[]).map(tier => {
            const cfg = TIER_CONFIG[tier]
            const colors: Record<string, string> = {
              emerald: 'border-emerald-600 hover:border-emerald-400',
              amber:   'border-amber-600 hover:border-amber-400',
              purple:  'border-purple-600 hover:border-purple-400',
            }
            const selectedColors: Record<string, string> = {
              emerald: 'border-emerald-400 bg-emerald-950/30',
              amber:   'border-amber-400 bg-amber-950/30',
              purple:  'border-purple-400 bg-purple-950/30',
            }
            const badgeColors: Record<string, string> = {
              emerald: 'bg-emerald-900/40 text-emerald-300',
              amber:   'bg-amber-900/40 text-amber-300',
              purple:  'bg-purple-900/40 text-purple-300',
            }
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${selectedTier === tier ? selectedColors[cfg.color] : 'border-gray-700 bg-gray-900 ' + colors[cfg.color]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-lg">{cfg.label}</div>
                    <div className="text-gray-400 text-sm mt-0.5">{cfg.desc}</div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColors[cfg.color]}`}>
                    {cfg.badge}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => { setCurrentIdx(0); setPhase('quiz') }}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-lg transition-colors"
        >
          {t('app_soma_voice.start_interview')} {TIER_CONFIG[selectedTier].label} {t('app_soma_voice.interview_suffix')}
        </button>
        <p className="text-center text-gray-600 text-sm mt-3">{t('app_soma_voice.save_later')}</p>
      </div>
    </div>
  )

  // ── Done ───────────────────────────────────────────────────────────────────
  if (phase === 'done') return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🧬✅</div>
        <h2 className="text-2xl font-bold text-white mb-3">{t('app_soma_voice.done_title')}</h2>
        <p className="text-gray-400 mb-2">
          {t('app_soma_voice.done_desc')}
        </p>
        <p className="text-gray-500 text-sm mb-8">
          {t('app_soma_voice.done_feedback')}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/soma/dashboard"
            className="block w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
          >
            {t('app_soma_voice.go_to_dashboard')}
          </Link>
          <button
            onClick={() => { setCurrentIdx(0); setPhase('intro') }}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm"
          >
            {t('app_soma_voice.retake')}
          </button>
        </div>
      </div>
    </div>
  )

  // ── Quiz ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-800 w-full">
        <div
          className="h-1 bg-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          {/* Counter */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-gray-500 text-sm">
              {currentIdx + 1} {t('app_soma_voice.of_label')} {activeQuestions.length} — <span className="text-gray-400">{TIER_CONFIG[selectedTier].label}</span>
            </span>
            {currentIdx > 0 && (
              <button
                onClick={() => setCurrentIdx(i => i - 1)}
                className="text-gray-500 hover:text-gray-300 text-sm"
              >
                {t('app_soma_voice.back')}
              </button>
            )}
          </div>

          {/* Question */}
          <h2 className="text-2xl font-semibold text-white mb-6 leading-snug">
            {currentQ.text}
          </h2>

          {/* Answer area */}
          {currentQ.type === 'text' ? (
            <textarea
              value={answers[currentQ.key] ?? ''}
              onChange={e => handleText(currentQ.key, e.target.value)}
              placeholder={currentQ.placeholder}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500 transition-colors"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {currentQ.options!.map(opt => {
                const val = answers[currentQ.key]
                const selected = currentQ.type === 'multi'
                  ? Array.isArray(val) && val.includes(opt)
                  : val === opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(currentQ.key, opt, currentQ.type)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all text-sm font-medium ${
                      selected
                        ? 'border-purple-500 bg-purple-950/40 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {selected && <span className="mr-2">✓</span>}
                    {opt}
                  </button>
                )
              })}
              {currentQ.type === 'multi' && (
                <p className="text-gray-600 text-xs mt-1">{t('app_soma_voice.select_all_apply')}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {currentIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(i => i + 1)}
                disabled={!canProceed() && currentQ.type !== 'text'}
                className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {t('app_soma_voice.next')}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold transition-colors"
              >
                {saving ? t('app_soma_voice.building') : t('app_soma_voice.build_btn')}
              </button>
            )}
            {currentQ.type !== 'text' && (
              <button
                onClick={() => currentIdx < activeQuestions.length - 1 ? setCurrentIdx(i => i + 1) : handleFinish()}
                className="px-4 py-3.5 rounded-xl border border-gray-700 text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                {t('app_soma_voice.skip')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', desc: 'Photos & Reels' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', desc: 'Short posts' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', desc: 'Professional' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', desc: 'Short video' },
  { id: 'facebook', label: 'Facebook', icon: '📘', desc: 'Pages & Groups' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', desc: 'Visual content' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', desc: 'Video' },
  { id: 'threads', label: 'Threads', icon: '🧵', desc: 'Text & photos' },
  { id: 'snapchat', label: 'Snapchat', icon: '👻', desc: 'Stories' },
  { id: 'bluesky', label: 'Bluesky', icon: '🦋', desc: 'Decentralized' },
  { id: 'reddit', label: 'Reddit', icon: '🤖', desc: 'Communities' },
  { id: 'discord', label: 'Discord', icon: '💬', desc: 'Announcements' },
  { id: 'telegram', label: 'Telegram', icon: '✈️', desc: 'Channels' },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘', desc: 'Federated' },
  { id: 'lemon8', label: 'Lemon8', icon: '🍋', desc: 'Lifestyle' },
  { id: 'bereal', label: 'BeReal', icon: '📷', desc: 'Authentic' },
]

const USE_CASES = [
  { id: 'creator', label: 'Content Creator', icon: '🎨', desc: 'Growing my personal brand' },
  { id: 'business', label: 'Business Owner', icon: '🏢', desc: 'Marketing my business' },
  { id: 'agency', label: 'Agency / Freelancer', icon: '💼', desc: 'Managing client accounts' },
  { id: 'marketing', label: 'Marketing Team', icon: '📣', desc: 'Team social media management' },
  { id: 'nonprofit', label: 'Nonprofit', icon: '❤️', desc: 'Spreading our mission' },
  { id: 'other', label: 'Just Exploring', icon: '🔍', desc: 'Checking it out' },
]

const STEPS = [
  { id: 1, label: 'Welcome', icon: '👋' },
  { id: 2, label: 'Use Case', icon: '🎯' },
  { id: 3, label: 'Platforms', icon: '📱' },
  { id: 4, label: 'First Post', icon: '✏️' },
  { id: 5, label: "You're in!", icon: '🚀' },
]

export default function Onboarding() {
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [useCase, setUseCase] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [firstPost, setFirstPost] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setDisplayName(user.email?.split('@')[0] || '')
    }
    init()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    setSaving(true)

    await supabase.from('profiles').update({
      full_name: displayName,
      onboarding_completed: true,
    }).eq('id', user.id)

    await supabase.from('user_settings').upsert({
      user_id: user.id,
      settings: {
        display_name: displayName,
        use_case: useCase,
        default_platforms: selectedPlatforms,
        onboarding_complete: true,
      }
    }, { onConflict: 'user_id' })

    if (firstPost.trim()) {
      await supabase.from('posts').insert({
        user_id: user.id,
        content: firstPost.trim(),
        platforms: selectedPlatforms,
        status: 'draft',
      })
    }

    setSaving(false)
    router.push('/dashboard')
  }

  const handleSkipPost = async () => {
    setSaving(true)

    await supabase.from('profiles').update({
      full_name: displayName,
      onboarding_completed: true,
    }).eq('id', user.id)

    await supabase.from('user_settings').upsert({
      user_id: user.id,
      settings: {
        display_name: displayName,
        use_case: useCase,
        default_platforms: selectedPlatforms,
        onboarding_complete: true,
      }
    }, { onConflict: 'user_id' })

    setSaving(false)
    router.push('/dashboard')
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </div>
        <button
          onClick={async () => {
            if (user) {
              await supabase.from('profiles').update({
                onboarding_completed: true,
              }).eq('id', user.id)
            }
            router.push('/dashboard')
          }}
          className="text-xs text-gray-400 hover:text-black transition-colors font-semibold"
        >
          Skip setup →
        </button>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-100 h-1">
        <div
          className="bg-black h-1 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* STEP INDICATORS */}
      <div className="flex items-center justify-center gap-2 py-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === s.id ? 'bg-black text-white' :
              step > s.id ? 'bg-gray-100 text-gray-500' :
              'text-gray-300'
            }`}>
              <span>{step > s.id ? '✓' : s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px ${step > s.id ? 'bg-gray-300' : 'bg-gray-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* STEP CONTENT */}
      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-lg">

          {/* STEP 1 — WELCOME */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-6">👋</div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-3">Welcome to SocialMate</h1>
              <p className="text-gray-400 mb-8">Let's get you set up in under 2 minutes. First, what should we call you?</p>

              <div className="text-left mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Your Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name or brand..."
                  onKeyDown={e => e.key === 'Enter' && displayName.trim() && setStep(2)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 text-center text-lg font-semibold"
                  autoFocus
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What you get — free</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '16 social platforms',
                    'Unlimited scheduling',
                    'Bulk Scheduler',
                    'Link in Bio builder',
                    'Team collaboration',
                    '15 AI credits / month',
                    'Analytics dashboard',
                    'Post templates',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500 font-bold">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => displayName.trim() ? setStep(2) : showToast('Enter your name to continue')}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all"
              >
                Get started →
              </button>
            </div>
          )}

          {/* STEP 2 — USE CASE */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">How will you use SocialMate?</h2>
                <p className="text-gray-400 text-sm">This helps us personalize your experience</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {USE_CASES.map(uc => (
                  <button
                    key={uc.id}
                    onClick={() => setUseCase(uc.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      useCase === uc.id ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{uc.icon}</div>
                    <p className="text-sm font-bold">{uc.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{uc.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => useCase ? setStep(3) : showToast('Pick an option to continue')}
                  className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — PLATFORMS */}
          {step === 3 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Which platforms do you use?</h2>
                <p className="text-gray-400 text-sm">Select all that apply — you can change this later</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedPlatforms.includes(p.id) ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{p.label}</p>
                      <p className="text-xs text-gray-400">{p.desc}</p>
                    </div>
                    {selectedPlatforms.includes(p.id) && (
                      <span className="text-black font-bold text-sm flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-xs text-center text-gray-400 mb-6">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected · All 16 are free
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => selectedPlatforms.length > 0 ? setStep(4) : showToast('Select at least one platform')}
                  className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — FIRST POST */}
          {step === 4 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Write your first post</h2>
                <p className="text-gray-400 text-sm">Start a draft now or skip — you can always come back</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  {selectedPlatforms.slice(0, 6).map(p => {
                    const pl = PLATFORMS.find(pl => pl.id === p)
                    return pl ? <span key={p} className="text-lg">{pl.icon}</span> : null
                  })}
                  {selectedPlatforms.length > 6 && (
                    <span className="text-xs text-gray-400">+{selectedPlatforms.length - 6} more</span>
                  )}
                </div>
                <textarea
                  value={firstPost}
                  onChange={e => setFirstPost(e.target.value)}
                  placeholder={`Write something for your audience...\n\nTip: Use [brackets] for fill-in-the-blank sections`}
                  rows={6}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">Will be saved as a draft</p>
                  <p className="text-xs text-gray-400">{firstPost.length} chars</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Need inspiration?</p>
                <div className="space-y-1.5">
                  {[
                    "Excited to share something new with you all 🎉 [describe what's coming]",
                    "Here's what I've been working on lately: [project or update]",
                    "Quick tip for [your audience]: [share a valuable insight]",
                  ].map(idea => (
                    <button
                      key={idea}
                      onClick={() => setFirstPost(idea)}
                      className="w-full text-left text-xs text-gray-500 hover:text-black p-2 rounded-lg hover:bg-white transition-all"
                    >
                      → {idea.length > 60 ? idea.slice(0, 60) + '...' : idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all"
                >
                  ← Back
                </button>
                {firstPost.trim() ? (
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all"
                  >
                    Save Draft & Continue →
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all"
                  >
                    Skip for now →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 — DONE */}
          {step === 5 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                You're all set, {displayName || 'friend'}!
              </h2>
              <p className="text-gray-400 mb-8">
                Your account is ready. Here's what to explore first.
              </p>

              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: '✏️', title: 'Compose a post', desc: 'Write and schedule your first post across all your platforms', href: '/compose', cta: 'Start writing' },
                  { icon: '📆', title: 'Bulk schedule content', desc: 'Plan a whole week of posts in one session', href: '/bulk-scheduler', cta: 'Open scheduler' },
                  { icon: '🔗', title: 'Set up Link in Bio', desc: 'Create your free bio page — no Linktree needed', href: '/link-in-bio', cta: 'Build bio page' },
                  { icon: '📅', title: 'View your calendar', desc: 'See all your scheduled content at a glance', href: '/calendar', cta: 'Open calendar' },
                ].map(action => (
                  <div key={action.title} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{action.title}</p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                    <Link
                      href={action.href}
                      className="text-xs font-bold text-gray-400 group-hover:text-black transition-colors flex-shrink-0"
                    >
                      {action.cta} →
                    </Link>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-50"
              >
                {saving ? 'Setting up your account...' : 'Go to Dashboard →'}
              </button>

              <p className="text-xs text-gray-400 mt-4">
                You can always change your settings in <Link href="/settings" className="underline">Settings</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg bg-red-500 text-white">
          ❌ {toast}
        </div>
      )}
    </div>
  )
}
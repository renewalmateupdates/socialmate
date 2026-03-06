'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram',  icon: '📸', desc: 'Photos & Reels',   available: false },
  { id: 'linkedin',  label: 'LinkedIn',   icon: '💼', desc: 'Professional',     available: true  },
  { id: 'youtube',   label: 'YouTube',    icon: '▶️', desc: 'Video',            available: true  },
  { id: 'pinterest', label: 'Pinterest',  icon: '📌', desc: 'Visual content',   available: true  },
  { id: 'reddit',    label: 'Reddit',     icon: '🤖', desc: 'Communities',      available: true  },
  { id: 'discord',   label: 'Discord',    icon: '💬', desc: 'Announcements',    available: true  },
  { id: 'bluesky',   label: 'Bluesky',    icon: '🦋', desc: 'Decentralized',    available: true  },
  { id: 'mastodon',  label: 'Mastodon',   icon: '🐘', desc: 'Federated',        available: true  },
  { id: 'telegram',  label: 'Telegram',   icon: '✈️', desc: 'Channels',         available: true  },
  { id: 'tiktok',    label: 'TikTok',     icon: '🎵', desc: 'Short video',      available: false },
  { id: 'facebook',  label: 'Facebook',   icon: '📘', desc: 'Pages & Groups',   available: false },
  { id: 'threads',   label: 'Threads',    icon: '🧵', desc: 'Text & photos',    available: false },
  { id: 'twitter',   label: 'X / Twitter',icon: '🐦', desc: 'Short posts',      available: false },
  { id: 'snapchat',  label: 'Snapchat',   icon: '👻', desc: 'Stories',          available: false },
  { id: 'lemon8',    label: 'Lemon8',     icon: '🍋', desc: 'Lifestyle',        available: false },
  { id: 'bereal',    label: 'BeReal',     icon: '📷', desc: 'Authentic',        available: false },
]

const USE_CASES = [
  { id: 'creator',   label: 'Content Creator',    icon: '🎨', desc: 'Growing my personal brand'      },
  { id: 'business',  label: 'Business Owner',     icon: '🏢', desc: 'Marketing my business'          },
  { id: 'agency',    label: 'Agency / Freelancer',icon: '💼', desc: 'Managing client accounts'       },
  { id: 'marketing', label: 'Marketing Team',     icon: '📣', desc: 'Team social media management'   },
  { id: 'nonprofit', label: 'Nonprofit',          icon: '❤️', desc: 'Spreading our mission'          },
  { id: 'other',     label: 'Just Exploring',     icon: '🔍', desc: 'Checking it out'                },
]

const STEPS = [
  { id: 1, label: 'Welcome',    icon: '👋' },
  { id: 2, label: 'Use Case',   icon: '🎯' },
  { id: 3, label: 'Platforms',  icon: '📱' },
  { id: 4, label: 'First Post', icon: '✏️' },
  { id: 5, label: "You're in!", icon: '🚀' },
]

export default function Onboarding() {
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [useCase, setUseCase] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
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
    const platform = PLATFORMS.find(p => p.id === id)
    if (!platform?.available) return
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
      display_name: displayName,
      use_case: useCase,
      default_platforms: selectedPlatforms,
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
              await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
            }
            router.push('/dashboard')
          }}
          className="text-xs text-gray-400 hover:text-black transition-colors font-semibold">
          Skip setup →
        </button>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-100 h-1">
        <div className="bg-black h-1 transition-all duration-500" style={{ width: `${progress}%` }} />
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

              {/* CREDIT ACTIVATION EXPLAINER */}
              <div className="bg-black rounded-2xl p-5 mb-6 text-left text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚡</span>
                  <p className="text-sm font-extrabold">100 free AI credits waiting for you</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  Credits activate once you complete setup — this keeps things fair and prevents abuse.
                  Here's all it takes:
                </p>
                <div className="space-y-2">
                  {[
                    { step: '1', label: 'Verify your email',                     done: true  },
                    { step: '2', label: 'Connect one social platform',            done: false },
                    { step: '3', label: 'Publish or schedule your first post',    done: false },
                  ].map(item => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        item.done ? 'bg-green-400 text-black' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {item.done ? '✓' : item.step}
                      </div>
                      <p className={`text-xs font-semibold ${item.done ? 'text-gray-300 line-through' : 'text-white'}`}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Invite a friend after setup and you both earn another 25 credits on top.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What you get — free forever</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '16 social platforms',
                    'Unlimited scheduling',
                    'Bulk Scheduler',
                    'Link in Bio builder',
                    '2 team seats',
                    '100 AI credits / month',
                    'Analytics dashboard',
                    'Post templates',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500 font-bold">✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => displayName.trim() ? setStep(2) : showToast('Enter your name to continue')}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
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
                  <button key={uc.id} onClick={() => setUseCase(uc.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      useCase === uc.id ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'
                    }`}>
                    <div className="text-2xl mb-2">{uc.icon}</div>
                    <p className="text-sm font-bold">{uc.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{uc.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button onClick={() => useCase ? setStep(3) : showToast('Pick an option to continue')}
                  className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — PLATFORMS */}
          {step === 3 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Which platforms do you use?</h2>
                <p className="text-gray-400 text-sm">Select available ones now — more coming soon</p>
              </div>

              {/* CREDIT STEP REMINDER */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                <span className="text-lg">⚡</span>
                <p className="text-xs text-blue-700 font-semibold">
                  Connect at least one platform to activate your 100 free AI credits
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {PLATFORMS.map(p => {
                  const selected = selectedPlatforms.includes(p.id)
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        !p.available
                          ? 'border-gray-50 bg-gray-50 opacity-50 cursor-not-allowed'
                          : selected
                          ? 'border-black bg-black/5'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <span className="text-xl">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.label}</p>
                        <p className="text-xs text-gray-400">
                          {p.available ? p.desc : 'Coming soon'}
                        </p>
                      </div>
                      {selected && p.available && (
                        <span className="text-black font-bold text-sm flex-shrink-0">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-center text-gray-400 mb-6">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected ·
                {' '}Instagram, TikTok, Facebook & Threads coming soon
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button
                  onClick={() => selectedPlatforms.length > 0 ? setStep(4) : showToast('Select at least one platform to activate your credits')}
                  className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — FIRST POST */}
          {step === 4 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Write your first post</h2>
                <p className="text-gray-400 text-sm">One post unlocks your 100 AI credits — takes 30 seconds</p>
              </div>

              {/* CREDIT STEP REMINDER */}
              <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-5">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <p className="text-xs text-green-700 font-semibold">
                    Almost there — publish or schedule this post to unlock your credits
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {[
                    { label: 'Email verified', done: true  },
                    { label: 'Platform connected', done: selectedPlatforms.length > 0 },
                    { label: 'First post', done: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${item.done ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.done ? '✓' : '○'}
                      </span>
                      <span className={`text-xs ${item.done ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
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
                  rows={5}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">Saved as a draft — edit before publishing</p>
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
                    <button key={idea} onClick={() => setFirstPost(idea)}
                      className="w-full text-left text-xs text-gray-500 hover:text-black p-2 rounded-lg hover:bg-white transition-all">
                      → {idea.length > 65 ? idea.slice(0, 65) + '...' : idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)}
                  className="px-6 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                {firstPost.trim() ? (
                  <button onClick={() => setStep(5)}
                    className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                    Save Draft & Unlock Credits →
                  </button>
                ) : (
                  <button onClick={() => setStep(5)}
                    className="flex-1 py-3 border border-gray-200 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all text-gray-500">
                    Skip for now →
                  </button>
                )}
              </div>
              {!firstPost.trim() && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Skipping means credits activate when you publish your first post from the dashboard
                </p>
              )}
            </div>
          )}

          {/* STEP 5 — DONE */}
          {step === 5 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                You're all set, {displayName || 'friend'}!
              </h2>
              <p className="text-gray-400 mb-6 text-sm">Your account is ready. Here's what to do next.</p>

              {/* CREDIT STATUS */}
              <div className={`rounded-2xl p-4 mb-6 text-left ${
                firstPost.trim() && selectedPlatforms.length > 0
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-amber-50 border border-amber-100'
              }`}>
                {firstPost.trim() && selectedPlatforms.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="text-sm font-extrabold text-green-700">100 AI credits unlocked!</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        Invite a friend and you both earn another 25 credits on top.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">⚡</span>
                    <div>
                      <p className="text-sm font-extrabold text-amber-700">Credits activate on your first post</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        {!selectedPlatforms.length
                          ? 'Connect a platform and publish one post from the dashboard to unlock your 100 credits.'
                          : 'Publish or schedule your first post from the dashboard to unlock your 100 credits.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: '✏️', title: 'Compose a post',       desc: 'Write and schedule your first post',             href: '/compose',        cta: 'Start writing'   },
                  { icon: '📆', title: 'Bulk schedule content', desc: 'Plan a whole week of posts in one session',      href: '/bulk-scheduler', cta: 'Open scheduler'  },
                  { icon: '🔗', title: 'Set up Link in Bio',   desc: 'Your free bio page — no Linktree needed',        href: '/link-in-bio',    cta: 'Build bio page'  },
                  { icon: '🤖', title: 'Explore AI tools',     desc: 'Captions, hooks, calendars, trend scanning',     href: '/features',       cta: 'See features'    },
                ].map(action => (
                  <div key={action.title}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{action.title}</p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                    <Link href={action.href}
                      className="text-xs font-bold text-gray-400 group-hover:text-black transition-colors flex-shrink-0">
                      {action.cta} →
                    </Link>
                  </div>
                ))}
              </div>

              <button onClick={handleFinish} disabled={saving}
                className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-50">
                {saving ? 'Setting up your account...' : 'Go to Dashboard →'}
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Settings can be changed anytime in{' '}
                <Link href="/settings" className="underline">Settings</Link>
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
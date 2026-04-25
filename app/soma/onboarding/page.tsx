'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TOTAL_STEPS = 5
const LS_STEP_KEY = 'soma_onboarding_step'
const LS_ANSWERS_KEY = 'soma_onboarding_answers'

// Step 1 options
const TONE_OPTIONS = [
  { id: 'direct',       label: 'Direct & Blunt'     },
  { id: 'motivational', label: 'Motivational'        },
  { id: 'analytical',   label: 'Analytical'          },
  { id: 'conversational', label: 'Conversational'    },
  { id: 'storyteller',  label: 'Storyteller'         },
  { id: 'sarcastic',    label: 'Sarcastic'           },
  { id: 'professional', label: 'Professional'        },
  { id: 'raw',          label: 'Raw & Vulnerable'    },
]

// Step 2 options
const SENTENCE_STYLE_OPTIONS = [
  { id: 'short',   label: 'Short punchy sentences'         },
  { id: 'mixed',   label: 'Mix of short and long'          },
  { id: 'long',    label: 'Long-form detailed explanations' },
]
const LANGUAGE_STYLE_OPTIONS = [
  { id: 'casual',      label: 'Slang & casual language'     },
  { id: 'professional', label: 'Clean professional language' },
  { id: 'middle',      label: 'Somewhere in between'        },
]

// Step 3 options
const AVOID_OPTIONS = [
  { id: 'buzzwords',   label: 'Corporate buzzwords ("synergy", "leverage", "circle back")' },
  { id: 'fake_positivity', label: 'Overly positive / fake enthusiasm'                     },
  { id: 'generic_ai', label: 'Generic AI phrases ("In today\'s fast-paced world…")'      },
  { id: 'hashtag_spam', label: 'Excessive hashtag spam'                                  },
]

// Initial state
function initialState() {
  return {
    // Step 1
    primaryTone: [] as string[],
    // Step 2
    sentenceStyle: '',
    languageStyle: '',
    // Step 3
    avoidChecked: [] as string[],
    avoidFreeText: '',
    // Step 4 — sliders 0-10
    humor: 5,
    directness: 5,
    vulnerability: 5,
    expertise: 5,
    motivation: 5,
    // Step 5
    example1: '',
    example2: '',
    example3: '',
  }
}

type FormState = ReturnType<typeof initialState>

export default function SomaOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialState())
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Progress bar width — 0% on step 1, 100% on step 5
  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  // ── Restore saved progress from localStorage on mount ───────────────────────
  useEffect(() => {
    try {
      const savedStep    = localStorage.getItem(LS_STEP_KEY)
      const savedAnswers = localStorage.getItem(LS_ANSWERS_KEY)
      if (savedStep) {
        const parsed = parseInt(savedStep, 10)
        if (parsed >= 1 && parsed <= TOTAL_STEPS) setStep(parsed)
      }
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers) as Partial<FormState>
        setForm(prev => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore localStorage errors
    }
    setHydrated(true)
  }, [])

  // ── Persist current step + answers to localStorage ───────────────────────────
  const persistToLocalStorage = useCallback((currentStep: number, currentForm: FormState) => {
    try {
      localStorage.setItem(LS_STEP_KEY, String(currentStep))
      localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(currentForm))
    } catch {
      // ignore
    }
  }, [])

  // ── Clear saved progress ─────────────────────────────────────────────────────
  function clearSavedProgress() {
    try {
      localStorage.removeItem(LS_STEP_KEY)
      localStorage.removeItem(LS_ANSWERS_KEY)
    } catch {
      // ignore
    }
  }

  // ── Step navigation ──────────────────────────────────────────────────────────
  function goNext() {
    if (step < TOTAL_STEPS) {
      const nextStep = step + 1
      setStep(nextStep)
      persistToLocalStorage(nextStep, form)
    }
  }
  function goBack() {
    if (step > 1) {
      const prevStep = step - 1
      setStep(prevStep)
      persistToLocalStorage(prevStep, form)
    }
  }

  // ── Skip current step (advance without saving that step's answer) ────────────
  function skipStep() {
    if (step < TOTAL_STEPS) {
      const nextStep = step + 1
      setStep(nextStep)
      persistToLocalStorage(nextStep, form)
    }
  }

  // ── Toggle multi-select ──────────────────────────────────────────────────────
  function toggleTone(id: string) {
    setForm(prev => {
      const has = prev.primaryTone.includes(id)
      if (has) return { ...prev, primaryTone: prev.primaryTone.filter(t => t !== id) }
      if (prev.primaryTone.length >= 3) return prev // max 3
      return { ...prev, primaryTone: [...prev.primaryTone, id] }
    })
  }

  function toggleAvoid(id: string) {
    setForm(prev => {
      const has = prev.avoidChecked.includes(id)
      if (has) return { ...prev, avoidChecked: prev.avoidChecked.filter(a => a !== id) }
      return { ...prev, avoidChecked: [...prev.avoidChecked, id] }
    })
  }

  // ── Save & continue later ────────────────────────────────────────────────────
  async function handleSaveLater() {
    setSaving(true)
    setSaveSuccess(false)
    setError(null)
    persistToLocalStorage(step, form)

    try {
      // Save partial progress to server (interview_completed=false — no credit charge)
      const payload = {
        tone_profile: {
          primary_tone: form.primaryTone,
          avoid:        [...form.avoidChecked, form.avoidFreeText].filter(Boolean),
        },
        writing_style_rules: {
          sentence_style: form.sentenceStyle,
          language_style: form.languageStyle,
        },
        behavioral_traits: {
          humor:         form.humor,
          directness:    form.directness,
          vulnerability: form.vulnerability,
          expertise:     form.expertise,
          motivation:    form.motivation,
        },
        voice_examples:      [form.example1, form.example2, form.example3].filter(s => s.trim().length > 0),
        interview_completed: false,
      }

      await fetch('/api/soma/identity', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      // Non-fatal — localStorage already saved progress
    } catch {
      // ignore — localStorage is the source of truth for resume
    } finally {
      setSaving(false)
    }

    setSaveSuccess(true)
    // Brief confirmation, then redirect
    setTimeout(() => router.push('/soma'), 1200)
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(skipExamples = false) {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        tone_profile: {
          primary_tone: form.primaryTone,
          avoid:        [...form.avoidChecked, form.avoidFreeText].filter(Boolean),
        },
        writing_style_rules: {
          sentence_style: form.sentenceStyle,
          language_style: form.languageStyle,
        },
        behavioral_traits: {
          humor:         form.humor,
          directness:    form.directness,
          vulnerability: form.vulnerability,
          expertise:     form.expertise,
          motivation:    form.motivation,
        },
        voice_examples: skipExamples
          ? []
          : [form.example1, form.example2, form.example3].filter(s => s.trim().length > 0),
        interview_completed: true,
      }

      const res = await fetch('/api/soma/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      clearSavedProgress()
      router.push('/soma')
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Slider helper ────────────────────────────────────────────────────────────
  function SliderRow({ label, field }: { label: string; field: keyof typeof form }) {
    const val = form[field] as number
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-300">{label}</span>
          <span className="text-sm font-bold text-amber-400 w-6 text-right">{val}</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={val}
          onChange={e => setForm(prev => ({ ...prev, [field]: Number(e.target.value) }))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            bg-zinc-700 accent-amber-400"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>None</span>
          <span>Max</span>
        </div>
      </div>
    )
  }

  // ── Shared button styles ─────────────────────────────────────────────────────
  const btnPrimary = `min-h-[44px] px-6 py-3 rounded-xl font-semibold text-sm
    bg-amber-400 hover:bg-amber-300 text-black transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed`

  const btnSecondary = `min-h-[44px] px-6 py-3 rounded-xl font-semibold text-sm
    bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700`

  // ── Save later button (shown on all steps) ───────────────────────────────────
  function SaveLaterButton() {
    if (saveSuccess) {
      return (
        <p className="text-xs text-emerald-400 text-center animate-fadeIn">
          Progress saved — redirecting...
        </p>
      )
    }
    return (
      <div className="text-center">
        <button
          onClick={handleSaveLater}
          disabled={saving || submitting}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save & continue later'}
        </button>
      </div>
    )
  }

  // ── Step content ─────────────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">Step 1 of 5</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                How would you describe your natural writing voice?
              </h2>
              <p className="mt-2 text-zinc-400 text-sm">Select up to 3 that feel most like you.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TONE_OPTIONS.map(opt => {
                const selected = form.primaryTone.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleTone(opt.id)}
                    className={`min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium transition-all border text-left
                      ${selected
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                  >
                    {selected && <span className="mr-2 text-amber-400">✓</span>}
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={skipStep}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px] px-2"
              >
                Skip
              </button>
              <button
                onClick={goNext}
                disabled={form.primaryTone.length === 0}
                className={btnPrimary}
              >
                Continue →
              </button>
            </div>
            <SaveLaterButton />
          </div>
        )

      case 2:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">Step 2 of 5</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                How do you write?
              </h2>
              <p className="mt-2 text-zinc-400 text-sm">Pick one from each group.</p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Sentence length</p>
                <div className="space-y-2">
                  {SENTENCE_STYLE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setForm(prev => ({ ...prev, sentenceStyle: opt.id }))}
                      className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border
                        ${form.sentenceStyle === opt.id
                          ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                    >
                      {form.sentenceStyle === opt.id && <span className="mr-2 text-amber-400">✓</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Language style</p>
                <div className="space-y-2">
                  {LANGUAGE_STYLE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setForm(prev => ({ ...prev, languageStyle: opt.id }))}
                      className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border
                        ${form.languageStyle === opt.id
                          ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                    >
                      {form.languageStyle === opt.id && <span className="mr-2 text-amber-400">✓</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className={btnSecondary}>← Back</button>
              <div className="flex items-center gap-3">
                <button
                  onClick={skipStep}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px] px-2"
                >
                  Skip
                </button>
                <button
                  onClick={goNext}
                  disabled={!form.sentenceStyle || !form.languageStyle}
                  className={btnPrimary}
                >
                  Continue →
                </button>
              </div>
            </div>
            <SaveLaterButton />
          </div>
        )

      case 3:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">Step 3 of 5</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                What writing styles do you HATE?
              </h2>
              <p className="mt-2 text-zinc-400 text-sm">SOMA will actively avoid these. Check all that apply.</p>
            </div>

            <div className="space-y-3">
              {AVOID_OPTIONS.map(opt => {
                const checked = form.avoidChecked.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleAvoid(opt.id)}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border
                      ${checked
                        ? 'bg-red-500/10 border-red-500 text-red-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                  >
                    {checked && <span className="mr-2 text-red-400">✗</span>}
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                Anything else to avoid? (optional)
              </label>
              <textarea
                value={form.avoidFreeText}
                onChange={e => setForm(prev => ({ ...prev, avoidFreeText: e.target.value }))}
                placeholder="e.g. &quot;Never use em dashes&quot; or &quot;No numbered lists&quot;"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
                  text-sm text-zinc-200 placeholder-zinc-600 resize-none
                  focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className={btnSecondary}>← Back</button>
              <div className="flex items-center gap-3">
                <button
                  onClick={skipStep}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px] px-2"
                >
                  Skip
                </button>
                <button onClick={goNext} className={btnPrimary}>Continue →</button>
              </div>
            </div>
            <SaveLaterButton />
          </div>
        )

      case 4:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">Step 4 of 5</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                How much of each do you show in your content?
              </h2>
              <p className="mt-2 text-zinc-400 text-sm">Drag each slider to match your natural style.</p>
            </div>

            <div className="space-y-6">
              <SliderRow label="Humor"                 field="humor"         />
              <SliderRow label="Directness"            field="directness"    />
              <SliderRow label="Personal vulnerability" field="vulnerability" />
              <SliderRow label="Technical expertise"   field="expertise"     />
              <SliderRow label="Motivation / hype"     field="motivation"    />
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className={btnSecondary}>← Back</button>
              <div className="flex items-center gap-3">
                <button
                  onClick={skipStep}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px] px-2"
                >
                  Skip
                </button>
                <button onClick={goNext} className={btnPrimary}>Continue →</button>
              </div>
            </div>
            <SaveLaterButton />
          </div>
        )

      case 5:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">Step 5 of 5</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Paste 1–3 posts you've written that felt most "you"
              </h2>
              <p className="mt-2 text-zinc-400 text-sm">
                Optional but recommended — these examples train SOMA to write exactly like you.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { field: 'example1' as const, label: 'Example 1' },
                { field: 'example2' as const, label: 'Example 2 (optional)' },
                { field: 'example3' as const, label: 'Example 3 (optional)' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                    {label}
                  </label>
                  <textarea
                    value={form[field]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder="Paste a post you're proud of…"
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3
                      text-sm text-zinc-200 placeholder-zinc-600 resize-none
                      focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex justify-between items-center">
              <button onClick={goBack} className={btnSecondary}>← Back</button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className={btnSecondary}
                >
                  Skip & Finish
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className={btnPrimary}
                >
                  {submitting ? 'Saving…' : 'Finish Setup'}
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Don't render step content until localStorage has been checked (avoids flash)
  if (!hydrated) return null

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800 fixed top-0 left-0 z-50">
        <div
          className="h-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-black text-lg tracking-tight">SOMA</span>
          <span className="text-zinc-600 text-xs hidden sm:block">Voice Interview</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 font-medium">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-lg">
          {renderStep()}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
      `}</style>
    </div>
  )
}

'use client'
import { useState } from 'react'

// Rotating question pool — SOMA picks 3 each time to keep it fresh
const QUESTION_POOL = [
  {
    key: 'core_belief',
    text: 'What\'s one belief or value that shapes everything you post — even when you don\'t say it directly?',
    type: 'text' as const,
    placeholder: 'e.g. "I believe anyone can build if they have the right tools. Everything I post comes back to that."',
  },
  {
    key: 'who_youre_speaking_to',
    text: 'Who are you actually speaking to when you post? Describe them like a real person.',
    type: 'text' as const,
    placeholder: 'e.g. "Someone working a 9-5 who wants to build something but has no idea where to start"',
  },
  {
    key: 'emotional_response',
    text: 'What\'s the emotional response you want people to feel after reading your posts?',
    type: 'single' as const,
    options: ['Inspired to take action', 'Understood / seen', 'Smarter than before', 'Challenged / provoked', 'Connected to your story', 'Entertained'],
  },
  {
    key: 'off_brand_language',
    text: 'What phrases, words, or vibes would feel completely off-brand for you?',
    type: 'text' as const,
    placeholder: 'e.g. "Hustle porn, corporate jargon, anything that sounds fake or performative"',
  },
  {
    key: 'honest_contrast',
    text: 'What tension or contrast in your life right now is the most honest story you could tell?',
    type: 'text' as const,
    placeholder: 'e.g. "Building a SaaS while doing physical labor. The gap between where I am and where I\'m going."',
  },
  {
    key: 'content_goal',
    text: 'Right now, what\'s your primary goal with your content?',
    type: 'single' as const,
    options: ['Build an audience from scratch', 'Convert followers to customers', 'Attract collaborators or cofounders', 'Establish thought leadership', 'Stay consistent and visible', 'Grow community around my brand'],
  },
  {
    key: 'fired_up_topic',
    text: 'What topic or angle are you most fired up about right now — even if you haven\'t posted about it yet?',
    type: 'text' as const,
    placeholder: 'e.g. "The unfair advantage AI gives solo founders. The lie that you need a team to build something real."',
  },
  {
    key: 'style_inspiration',
    text: 'Is there a creator, thinker, or voice whose content style you\'d want SOMA to draw from?',
    type: 'text' as const,
    placeholder: 'e.g. "Nipsey Hussle\'s cadence, Naval\'s depth, James Baldwin\'s directness"',
  },
  {
    key: 'hidden_context',
    text: 'What\'s something happening in your life right now that most of your followers don\'t know about?',
    type: 'text' as const,
    placeholder: 'e.g. "Lost a client this week. About to make a big pivot. Quietly building something new."',
  },
  {
    key: 'vulnerability_level',
    text: 'How vulnerable do you want to get in your content this week?',
    type: 'single' as const,
    options: ['Keep it professional — product focus', 'Hint at the journey without oversharing', 'Raw and real — share the struggle', 'All in — nothing off limits'],
  },
  {
    key: 'contrarian_take',
    text: 'What\'s a contrarian belief you hold that most people in your space would push back on?',
    type: 'text' as const,
    placeholder: 'e.g. "You don\'t need investors. Most advice from successful people is survivorship bias."',
  },
  {
    key: 'one_thing_to_nail',
    text: 'If SOMA could only nail ONE thing about your voice in the next batch, what would it be?',
    type: 'text' as const,
    placeholder: 'e.g. "Sound like I\'m talking to a friend, not pitching to strangers. Confident but never arrogant."',
  },
  {
    key: 'missed_mark',
    text: 'Did any post this batch miss the mark or not sound like you?',
    type: 'text' as const,
    placeholder: 'Tell SOMA what felt off — it won\'t repeat that mistake.',
  },
  {
    key: 'whats_happening',
    text: 'What\'s happening in your world right now that SOMA should weave into next week?',
    type: 'text' as const,
    placeholder: 'e.g. "Launched a new feature, had a rough week, hit a milestone, made a hard decision"',
  },
  {
    key: 'tone_check',
    text: 'How\'s the tone landing?',
    type: 'single' as const,
    options: ['Too formal — loosen up', 'Too casual — dial it back', 'Just right', 'Too generic — more personality'],
  },
  {
    key: 'go_deeper',
    text: 'What topic do you want SOMA to go deeper on?',
    type: 'text' as const,
    placeholder: 'e.g. "The bootstrapped founder grind, business credit, the realities of solo building"',
  },
]

function pickQuestions(seed: number): typeof QUESTION_POOL {
  // Deterministically rotate 3 questions based on call count
  const total = QUESTION_POOL.length
  return [
    QUESTION_POOL[seed % total],
    QUESTION_POOL[(seed + 1) % total],
    QUESTION_POOL[(seed + 2) % total],
  ]
}

interface Props {
  projectId?: string
  generationCount: number // used to rotate questions
  onClose: () => void
}

export default function SomaVoiceFeedbackModal({ projectId, generationCount, onClose }: Props) {
  const questions = pickQuestions(generationCount)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function handleSingle(key: string, val: string) {
    setResponses(prev => ({ ...prev, [key]: val }))
  }
  function handleText(key: string, val: string) {
    setResponses(prev => ({ ...prev, [key]: val }))
  }
  function handleRating(key: string, val: number) {
    setResponses(prev => ({ ...prev, [key]: String(val) }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payload = questions
        .filter(q => responses[q.key])
        .map(q => ({
          question_key:  q.key,
          question_text: q.text,
          answer:        responses[q.key],
        }))

      if (payload.length > 0) {
        await fetch('/api/soma/voice/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: payload, project_id: projectId }),
        })
      }
      setDone(true)
    } catch {
      setDone(true) // dismiss even on failure
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-4">🧬</div>
        <h3 className="text-white font-semibold text-lg mb-2">Voice DNA updated</h3>
        <p className="text-gray-400 text-sm mb-6">SOMA learned something new about you. Every response makes the next batch sharper.</p>
        <button onClick={onClose} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors">
          Got it
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-2xl mb-1">🎙️</div>
            <h3 className="text-white font-bold text-lg">3 quick questions</h3>
            <p className="text-gray-400 text-sm">Help SOMA learn your voice. Takes 30 seconds.</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-xl ml-4">✕</button>
        </div>

        <div className="flex flex-col gap-6">
          {questions.map((q, qi) => (
            <div key={q.key}>
              <p className="text-gray-200 text-sm font-medium mb-3">
                <span className="text-purple-400 mr-1">{qi + 1}.</span> {q.text}
              </p>

              {q.type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => handleRating(q.key, n)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${
                        responses[q.key] === String(n)
                          ? 'border-purple-500 bg-purple-950/40 text-purple-300'
                          : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {'⭐'.repeat(n)}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'single' && (
                <div className="flex flex-col gap-2">
                  {q.options!.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSingle(q.key, opt)}
                      className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        responses[q.key] === opt
                          ? 'border-purple-500 bg-purple-950/30 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                      }`}
                    >
                      {responses[q.key] === opt && '✓ '}{opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'text' && (
                <textarea
                  value={responses[q.key] ?? ''}
                  onChange={e => handleText(q.key, e.target.value)}
                  placeholder={q.placeholder}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
          >
            {submitting ? 'Saving…' : 'Update My Voice DNA'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-gray-700 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

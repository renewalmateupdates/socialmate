'use client'
import { useState } from 'react'

// Rotating question pool — SOMA picks 3 each time to keep it fresh
const QUESTION_POOL = [
  {
    key: 'voice_match',
    text: 'How well did these posts match YOUR voice?',
    type: 'rating' as const,
  },
  {
    key: 'more_of',
    text: 'What type of content do you want more of next week?',
    type: 'single' as const,
    options: ['Mindset & motivation', 'Personal story / behind the scenes', 'Hard lessons & failures', 'Wins & progress', 'Educational / value drops', 'Hot takes & opinions', 'Questions that spark discussion'],
  },
  {
    key: 'missed_mark',
    text: 'Did any post miss the mark or not sound like you?',
    type: 'text' as const,
    placeholder: 'Tell SOMA what felt off — it won\'t make that mistake again.',
  },
  {
    key: 'whats_happening',
    text: 'What\'s happening in your world right now that SOMA should weave into next week?',
    type: 'text' as const,
    placeholder: 'e.g. "Launched a new feature, had a rough week at work, hit a milestone"',
  },
  {
    key: 'tone_check',
    text: 'How\'s the tone landing?',
    type: 'single' as const,
    options: ['Too formal — loosen up', 'Too casual — dial it back', 'Just right', 'Too generic — more personality'],
  },
  {
    key: 'overall_rating',
    text: 'How would you rate this batch overall?',
    type: 'rating' as const,
  },
  {
    key: 'go_deeper',
    text: 'What topic do you want SOMA to go deeper on?',
    type: 'text' as const,
    placeholder: 'e.g. "The bootstrapped founder grind, business credit, my tech stack"',
  },
  {
    key: 'favorite_angle',
    text: 'Which angle resonated most with your audience?',
    type: 'single' as const,
    options: ['Personal vulnerability', 'Actionable tips', 'Contrarian take', 'Progress update', 'Motivational push', 'Not sure yet'],
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

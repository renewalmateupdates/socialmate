'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLATFORMS = [
  { name: "Instagram", color: "#e1306c" },
  { name: "X (Twitter)", color: "#000000" },
  { name: "LinkedIn", color: "#0077b5" },
  { name: "TikTok", color: "#000000" },
  { name: "YouTube", color: "#ff0000" },
  { name: "Pinterest", color: "#e60023" },
  { name: "Threads", color: "#000000" },
  { name: "Snapchat", color: "#ffcc00" },
  { name: "Bluesky", color: "#0085ff" },
  { name: "Reddit", color: "#ff4500" },
  { name: "Discord", color: "#5865f2" },
  { name: "Telegram", color: "#229ed9" },
]

const GOALS = [
  { icon: "🚀", label: "Grow my audience" },
  { icon: "💼", label: "Promote my business" },
  { icon: "🎨", label: "Share my creativity" },
  { icon: "📈", label: "Drive traffic to my site" },
  { icon: "👥", label: "Manage clients" },
  { icon: "🏆", label: "Build my personal brand" },
]

const POSTING_FREQ = [
  { label: "1-2x per week", desc: "Just getting started" },
  { label: "3-5x per week", desc: "Staying consistent" },
  { label: "Daily", desc: "Full send" },
  { label: "Multiple times a day", desc: "Content machine" },
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedGoal, setSelectedGoal] = useState('')
  const [selectedFreq, setSelectedFreq] = useState('')
  const router = useRouter()

  const togglePlatform = (name: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    )
  }

  const handleFinish = () => {
    localStorage.setItem('onboarding_complete', 'true')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-lg shadow-sm">

        {/* PROGRESS */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-black' : 'bg-gray-100'}`} />
          ))}
        </div>

        {/* STEP 1 — PLATFORMS */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight mb-1">Which platforms do you use?</h1>
              <p className="text-gray-500 text-sm">Select all that apply. You can change this later.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-8">
              {PLATFORMS.map(p => (
                <button
                  key={p.name}
                  onClick={() => togglePlatform(p.name)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedPlatforms.includes(p.name) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedPlatforms.includes(p.name) ? 'white' : p.color }} />
                  <span className="truncate text-xs">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedPlatforms.length === 0}
              className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-30 text-sm"
            >
              Continue →
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              {selectedPlatforms.length === 0 ? 'Select at least one platform' : `${selectedPlatforms.length} selected`}
            </p>
          </div>
        )}

        {/* STEP 2 — GOAL */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight mb-1">What is your main goal?</h1>
              <p className="text-gray-500 text-sm">This helps us tailor your experience.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {GOALS.map(g => (
                <button
                  key={g.label}
                  onClick={() => setSelectedGoal(g.label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${selectedGoal === g.label ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-all text-sm">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedGoal}
                className="flex-1 bg-black text-white font-semibold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-30 text-sm"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — POSTING FREQUENCY */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight mb-1">How often do you post?</h1>
              <p className="text-gray-500 text-sm">We will use this to help you plan your content calendar.</p>
            </div>
            <div className="space-y-3 mb-8">
              {POSTING_FREQ.map(f => (
                <button
                  key={f.label}
                  onClick={() => setSelectedFreq(f.label)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${selectedFreq === f.label ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  <span className="font-semibold text-sm">{f.label}</span>
                  <span className={`text-xs ${selectedFreq === f.label ? 'text-gray-400' : 'text-gray-400'}`}>{f.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-400 transition-all text-sm">
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!selectedFreq}
                className="flex-1 bg-black text-white font-semibold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-30 text-sm"
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={handleFinish} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
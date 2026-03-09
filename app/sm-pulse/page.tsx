'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const SAMPLE_TRENDS = [
  { topic: '#AITools',          platform: 'LinkedIn',  spike: '+340%', type: 'Hashtag',  hot: true  },
  { topic: 'Day in my life',    platform: 'TikTok',    spike: '+210%', type: 'Format',   hot: true  },
  { topic: '#SmallBusiness',    platform: 'Instagram', spike: '+180%', type: 'Hashtag',  hot: false },
  { topic: 'Unpopular opinion', platform: 'Reddit',    spike: '+155%', type: 'Format',   hot: true  },
  { topic: '#ContentCreator',   platform: 'YouTube',   spike: '+120%', type: 'Hashtag',  hot: false },
  { topic: 'Story time thread', platform: 'LinkedIn',  spike: '+98%',  type: 'Format',   hot: false },
  { topic: '#FreelanceLife',    platform: 'Instagram', spike: '+87%',  type: 'Hashtag',  hot: false },
  { topic: 'Hot take:',         platform: 'Reddit',    spike: '+76%',  type: 'Format',   hot: false },
]

const PLATFORM_ICONS: Record<string, string> = {
  LinkedIn: '💼', TikTok: '🎵', Instagram: '📸',
  Reddit: '🤖', YouTube: '▶️', Twitter: '🐦',
}

export default function SMPulsePage() {
  const router = useRouter()
  const { plan, credits, setCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const handleScan = async () => {
    if (credits < 5) return
    setScanning(true)
    await new Promise(r => setTimeout(r, 2000))
    setCredits(credits - 5)
    setScanned(true)
    setLastScanned('Just now')
    setScanning(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <h1 className="text-2xl font-extrabold tracking-tight">SM-Pulse</h1>
              </div>
              <p className="text-sm text-gray-400">
                Scan what's trending in your niche right now — before it peaks.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cost per scan</div>
              <div className="text-xl font-extrabold">5 <span className="text-sm font-semibold text-gray-400">credits</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{credits} remaining</div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-3">How SM-Pulse works</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Scan triggered',    desc: 'SM-Pulse queries trending signals across Reddit, YouTube, and your connected platforms.' },
                { step: '2', title: 'Patterns detected', desc: 'AI identifies hashtag spikes, viral post formats, and engagement anomalies in your niche.' },
                { step: '3', title: 'Opportunities surfaced', desc: 'You get a ranked list of trends you can act on before they hit peak saturation.' },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-extrabold mx-auto mb-2">
                    {item.step}
                  </div>
                  <p className="text-xs font-bold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SCAN BUTTON */}
          <div className="bg-black rounded-2xl p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold mb-1">
                {scanned ? '✅ Scan complete — results below' : 'Ready to scan your niche'}
              </p>
              <p className="text-xs text-gray-400">
                {lastScanned ? `Last scanned: ${lastScanned}` : 'Results refresh weekly. Each scan costs 5 credits.'}
              </p>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || credits < 5}
              className="flex-shrink-0 bg-white text-black text-xs font-extrabold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {scanning ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                '🔥 Run Scan — 5 credits'
              )}
            </button>
          </div>

          {/* RESULTS */}
          {scanned && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold">Trending Now in Your Niche</h2>
                <span className="text-xs text-gray-400">Refreshes weekly</span>
              </div>
              <div className="space-y-2">
                {SAMPLE_TRENDS.map((trend, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{PLATFORM_ICONS[trend.platform] || '🌐'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{trend.topic}</p>
                          {trend.hot && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-500 rounded-full">🔥 Hot</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{trend.platform} · {trend.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-xl">
                        {trend.spike}
                      </span>
                      <Link href={`/compose`}
                        className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                        Use →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREVIEW STATE — not yet scanned */}
          {!scanned && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-extrabold mb-4">What you'll see after scanning</h2>
              <div className="space-y-2 opacity-40 pointer-events-none select-none">
                {SAMPLE_TRENDS.slice(0, 4).map((trend, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-200 rounded-full" />
                      <div>
                        <div className="w-32 h-3 bg-gray-200 rounded mb-1" />
                        <div className="w-20 h-2.5 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">Run a scan to unlock your trend report</p>
            </div>
          )}

          {/* LOW CREDITS WARNING */}
          {credits < 5 && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-red-600">
                You need at least 5 credits to run a scan. You have {credits} remaining.
              </p>
              <Link href="/settings?tab=Referrals"
                className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-4">
                Earn credits →
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
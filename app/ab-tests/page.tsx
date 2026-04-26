'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  discord:  '💬',
  telegram: '✈️',
  mastodon: '🐘',
  twitter:  '🐦',
  linkedin: '💼',
}

type BlueskyStats = { likes: number; reposts: number; replies: number } | null

type ABPost = {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduled_at: string | null
  published_at: string | null
  ab_test_id: string
  ab_variant: 'a' | 'b'
  bluesky_stats: BlueskyStats
  created_at: string
}

type ABTest = {
  id: string
  created_at: string
  a: ABPost | null
  b: ABPost | null
}

function engagementScore(post: ABPost | null): number {
  if (!post) return 0
  const bs = post.bluesky_stats
  if (!bs) return 0
  return (bs.likes ?? 0) + (bs.reposts ?? 0) * 2 + (bs.replies ?? 0) * 3
}

function statusLabel(post: ABPost | null): string {
  if (!post) return 'Missing'
  if (post.status === 'published') return 'Published'
  if (post.status === 'scheduled') return 'Scheduled'
  if (post.status === 'failed') return 'Failed'
  if (post.status === 'partial') return 'Partial'
  return post.status
}

function testStatus(test: ABTest): 'running' | 'complete' | 'failed' {
  if (!test.a || !test.b) return 'running'
  if (test.b.status === 'published') return 'complete'
  if (test.a.status === 'published' && test.b.status === 'scheduled') return 'running'
  if (test.a.status === 'failed' && test.b.status === 'failed') return 'failed'
  return 'running'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function VariantCard({
  label,
  post,
  score,
  isWinner,
  isTie,
}: {
  label: string
  post: ABPost | null
  score: number
  isWinner: boolean
  isTie: boolean
}) {
  const st = statusLabel(post)
  const statusColor =
    st === 'Published' ? 'text-green-600 dark:text-green-400' :
    st === 'Scheduled' ? 'text-blue-600 dark:text-blue-400' :
    st === 'Failed'    ? 'text-red-500' :
    'text-gray-400 dark:text-gray-500'

  const cardBorder = isWinner && !isTie
    ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-300 dark:ring-amber-700'
    : 'border-theme'

  return (
    <div className={`flex-1 min-w-0 bg-surface border ${cardBorder} rounded-2xl p-4 flex flex-col gap-3 relative`}>
      {isWinner && !isTie && (
        <span className="absolute -top-3 left-4 bg-amber-400 text-black text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
          Winner
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Version {label}
        </span>
        <span className={`text-xs font-bold ${statusColor}`}>{st}</span>
      </div>

      {post ? (
        <>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap line-clamp-4 min-h-[80px]">
            {post.content}
          </p>

          <div className="flex flex-wrap gap-1">
            {post.platforms.map(p => (
              <span key={p} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                {PLATFORM_ICONS[p] ?? '📱'} {p}
              </span>
            ))}
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
            {post.scheduled_at && (
              <p>Scheduled: {formatDate(post.scheduled_at)}</p>
            )}
            {post.published_at && (
              <p>Published: {formatDate(post.published_at)}</p>
            )}
          </div>

          {post.bluesky_stats ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Bluesky Engagement
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{post.bluesky_stats.likes ?? 0}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1">likes</span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{post.bluesky_stats.reposts ?? 0}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1">reposts</span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{post.bluesky_stats.replies ?? 0}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1">replies</span>
                </span>
              </div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-700">
                Score: {score} <span className="font-normal text-gray-400">(likes + 2×reposts + 3×replies)</span>
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2.5">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {post.status === 'published' && post.platforms.includes('bluesky')
                  ? 'No engagement data yet — sync analytics to update'
                  : 'Engagement tracked for Bluesky posts'}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Post not found</p>
      )}
    </div>
  )
}

export default function ABTestsPage() {
  const router = useRouter()
  const { plan } = useWorkspace()
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isPro = plan === 'pro' || plan === 'agency'

  useEffect(() => {
    if (!isPro) { setLoading(false); return }
    fetch('/api/ab-tests')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setTests(d.tests || [])
      })
      .catch(() => setError('Failed to load A/B tests'))
      .finally(() => setLoading(false))
  }, [isPro])

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
          <div className="max-w-4xl mx-auto">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">A/B Tests</h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                  Compare two post variants and see which performs better
                </p>
              </div>
              <Link
                href="/compose"
                className="text-xs font-bold px-4 py-2.5 min-h-[44px] bg-black text-white rounded-xl hover:opacity-80 transition-all flex items-center gap-1.5">
                + New A/B Test
              </Link>
            </div>

            {!isPro && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">
                  A/B Testing is a Pro feature
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">
                  Upgrade to Pro to schedule A/B post variants and track which version gets more engagement.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-black rounded-xl transition-all">
                  Upgrade to Pro — $5/mo
                </a>
              </div>
            )}

            {isPro && error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {isPro && !error && tests.length === 0 && (
              <div className="bg-surface border border-theme rounded-2xl p-8 text-center">
                <p className="text-3xl mb-3">🧪</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">No A/B tests yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Write two versions of a post in Compose, set a delay between them, and let SocialMate tell you which one wins.
                </p>
                <Link
                  href="/compose"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Start your first A/B test →
                </Link>
              </div>
            )}

            {isPro && !error && tests.length > 0 && (
              <div className="space-y-6">
                {tests.map(test => {
                  const scoreA = engagementScore(test.a)
                  const scoreB = engagementScore(test.b)
                  const bothPublished = test.a?.status === 'published' && test.b?.status === 'published'
                  const isTie = bothPublished && scoreA === scoreB
                  const aWins = bothPublished && !isTie && scoreA > scoreB
                  const bWins = bothPublished && !isTie && scoreB > scoreA
                  const tStatus = testStatus(test)

                  return (
                    <div key={test.id} className="bg-surface border border-theme rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                            {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            tStatus === 'complete' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            tStatus === 'failed'   ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          }`}>
                            {tStatus === 'complete' ? 'Complete' : tStatus === 'failed' ? 'Failed' : 'Running'}
                          </span>
                          {isTie && tStatus === 'complete' && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              Tie
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate max-w-[120px]" title={test.id}>
                          {test.id.slice(0, 8)}…
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <VariantCard
                          label="A"
                          post={test.a}
                          score={scoreA}
                          isWinner={aWins}
                          isTie={isTie}
                        />
                        <div className="hidden sm:flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-extrabold text-gray-300 dark:text-gray-600">vs</span>
                        </div>
                        <div className="flex sm:hidden items-center justify-center py-1">
                          <span className="text-xs font-extrabold text-gray-300 dark:text-gray-600">— vs —</span>
                        </div>
                        <VariantCard
                          label="B"
                          post={test.b}
                          score={scoreB}
                          isWinner={bWins}
                          isTie={isTie}
                        />
                      </div>

                      {tStatus === 'running' && (
                        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-center">
                          Waiting for both variants to publish before showing results.
                          {test.b?.scheduled_at && ` Version B scheduled for ${formatDate(test.b.scheduled_at)}.`}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

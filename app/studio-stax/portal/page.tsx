'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIES: Record<string, string> = {
  'social-media':     'Social Media Tools',
  'content-creation': 'Content Creation',
  'ai-tools':         'AI Tools',
  'analytics':        'Analytics & Growth',
  'creator-economy':  'Creator Economy',
  'community':        'Community Building',
  'productivity':     'Productivity',
  'developer-tools':  'Developer Tools',
}

type Listing = {
  id: string
  name: string
  tagline: string | null
  description: string | null
  category: string
  url: string | null
  logo_url: string | null
  status: string
  renewal_date: string | null
  smgive_donated_cents: number
  plan_tier: string | null
  free_until: string | null
}

type Tab = 'listing' | 'rankings' | 'status' | 'analytics'

type AnalyticsData = {
  all_time:     { views: number; clicks: number }
  last_30:      { views: number; clicks: number }
  last_7:       { views: number; clicks: number }
  daily_last_7: Array<{ date: string; views: number; clicks: number }>
}

export default function StudioStaxPortalPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('listing')
  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<Listing | null>(null)
  const [noListing, setNoListing] = useState(false)

  // Edit form state
  const [editMode, setEditMode] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      try {
        // Match by applicant_email — curated_listings doesn't have user_id
        const { data: listingData } = await supabase
          .from('curated_listings')
          .select('id, name, tagline, description, category, url, logo_url, status, renewal_date, smgive_donated_cents, plan_tier, free_until')
          .eq('applicant_email', user.email ?? '')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!listingData) {
          setNoListing(true)
          setLoading(false)
          return
        }

        setListing(listingData as Listing)
        setEditDesc(listingData.description ?? '')
        setEditUrl(listingData.url ?? '')
      } catch {
        setNoListing(true)
      }

      setLoading(false)
    }
    init()
  }, [router])

  // Lazy-load analytics when the tab is first opened
  useEffect(() => {
    if (activeTab !== 'analytics' || analytics || analyticsLoading) return
    setAnalyticsLoading(true)
    setAnalyticsError('')
    fetch('/api/studio-stax/analytics')
      .then(r => r.json())
      .then(data => {
        if (data.error) setAnalyticsError(data.error)
        else setAnalytics(data as AnalyticsData)
      })
      .catch(() => setAnalyticsError('Failed to load analytics.'))
      .finally(() => setAnalyticsLoading(false))
  }, [activeTab, analytics, analyticsLoading])

  const handleSaveEdit = async () => {
    if (!listing) return
    setEditSaving(true)
    setEditError('')
    setEditSuccess(false)
    try {
      const { error } = await supabase
        .from('curated_listings')
        .update({ description: editDesc, url: editUrl })
        .eq('id', listing.id)

      if (error) {
        setEditError(error.message || 'Failed to save changes.')
      } else {
        setListing(l => l ? { ...l, description: editDesc, url: editUrl } : l)
        setEditMode(false)
        setEditSuccess(true)
        setTimeout(() => setEditSuccess(false), 3000)
      }
    } catch {
      setEditError('Network error. Please try again.')
    }
    setEditSaving(false)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
        </div>
      </PublicLayout>
    )
  }

  if (noListing) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6">🗂️</div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">
            No listing found
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Your account doesn&apos;t have an active Studio Stax listing yet. Apply to get listed in our curated creator tools directory.
          </p>
          <Link
            href="/studio-stax/apply"
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
            Apply for a Listing →
          </Link>
          <div className="mt-6">
            <Link href="/studio-stax" className="text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              ← Back to Studio Stax
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!listing) return null

  const totalDonated = listing.smgive_donated_cents ?? 0
  const progressInterval = 10_000 // $100 in cents
  const progressRemainder = totalDonated % progressInterval
  const progressPct = progressInterval > 0 ? Math.round((progressRemainder / progressInterval) * 100) : 0
  const nextMilestone = Math.ceil((totalDonated + 1) / progressInterval) * progressInterval

  const statusColors: Record<string, string> = {
    approved: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
    active:   'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    pending:  'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
    expired:  'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    rejected: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400',
  }
  const statusLabels: Record<string, string> = {
    approved: 'Approved — Payment Pending',
    active:   'Active',
    pending:  'Pending Review',
    expired:  'Expired',
    rejected: 'Rejected',
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'listing',   label: 'My Listing'          },
    { id: 'analytics', label: 'Analytics'            },
    { id: 'rankings',  label: 'Rankings & SM-Give'   },
    { id: 'status',    label: 'Status & Renewal'     },
  ]

  // Determine renewal date — from column or free_until
  const renewalDate = listing.renewal_date ?? listing.free_until

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/studio-stax" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">
            ← Back to Studio Stax
          </Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Lister Portal
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your Studio Stax listing and track your SM-Give impact.
              </p>
            </div>
            {listing.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.logo_url} alt={listing.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl font-extrabold text-amber-600 shrink-0">
                {listing.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max text-xs font-bold px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: My Listing ── */}
        {activeTab === 'listing' && (
          <div className="space-y-5">
            {editSuccess && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400">
                Listing updated successfully.
              </div>
            )}

            {/* Read-only info */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Listing Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tool Name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{listing.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Admin-managed</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {CATEGORIES[listing.category] ?? listing.category}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Admin-managed</p>
                </div>
                {listing.tagline && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tagline</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{listing.tagline}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editable fields */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Editable Info</p>
                {!editMode && (
                  <button
                    onClick={() => { setEditMode(true); setEditError('') }}
                    className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    Edit listing →
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Description <span className="text-gray-400 font-normal">(max 300 chars)</span>
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value.slice(0, 300))}
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{editDesc.length}/300</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                    <input
                      type="url"
                      value={editUrl}
                      onChange={e => setEditUrl(e.target.value)}
                      placeholder="https://yourtool.com"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600"
                    />
                  </div>
                  {editError && <p className="text-sm font-medium text-red-500">{editError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                      {editSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setEditMode(false); setEditDesc(listing.description ?? ''); setEditUrl(listing.url ?? '') }}
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {listing.description || <span className="text-gray-400 italic">No description set.</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Website</p>
                    <a
                      href={listing.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block">
                      {listing.url || '—'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Analytics ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {analyticsLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-gray-900 dark:border-white" />
              </div>
            )}

            {analyticsError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {analyticsError}
              </div>
            )}

            {analytics && (() => {
              const ctr = (period: { views: number; clicks: number }) =>
                period.views > 0 ? ((period.clicks / period.views) * 100).toFixed(1) : '—'

              const maxVal = Math.max(
                ...analytics.daily_last_7.map(d => d.views),
                1
              )

              const fmtDate = (iso: string) => {
                const d = new Date(iso + 'T00:00:00')
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }

              return (
                <>
                  {/* Stat cards — 3 periods */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {([
                      { label: 'Last 7 days',  data: analytics.last_7    },
                      { label: 'Last 30 days', data: analytics.last_30   },
                      { label: 'All time',     data: analytics.all_time  },
                    ] as const).map(({ label, data }) => (
                      <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">{label}</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Views</span>
                            <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{data.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Clicks</span>
                            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{data.clicks.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">CTR</span>
                            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{ctr(data)}{ctr(data) !== '—' ? '%' : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 7-day bar chart */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-6">Last 7 days</p>

                    {/* Legend */}
                    <div className="flex items-center gap-5 mb-5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-800" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Views</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-amber-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Clicks</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-2 h-28">
                      {analytics.daily_last_7.map(day => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full">
                          {/* Bars */}
                          <div className="flex-1 w-full flex items-end gap-0.5">
                            <div
                              className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-t transition-all"
                              style={{ height: `${Math.max((day.views / maxVal) * 100, day.views > 0 ? 4 : 0)}%` }}
                              title={`${day.views} views`}
                            />
                            <div
                              className="flex-1 bg-amber-400 dark:bg-amber-500 rounded-t transition-all"
                              style={{ height: `${Math.max((day.clicks / maxVal) * 100, day.clicks > 0 ? 4 : 0)}%` }}
                              title={`${day.clicks} clicks`}
                            />
                          </div>
                          {/* Date label */}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {fmtDate(day.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Context note */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Views are counted each time your listing appears on the Studio Stax directory. Clicks are counted when someone visits your site.
                  </p>
                </>
              )
            })()}
          </div>
        )}

        {/* ── Tab: Rankings & SM-Give ── */}
        {activeTab === 'rankings' && (
          <div className="space-y-5">
            {/* Rank card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Your SM-Give Impact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                    ${(totalDonated / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-500 font-semibold mt-1">Total donated to SM-Give</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    {totalDonated === 0 ? '—' : `$${((nextMilestone - totalDonated) / 100).toFixed(0)}`}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold mt-1">To next ranking milestone</p>
                </div>
              </div>

              {/* Progress to next milestone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Progress to next milestone</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ${(progressRemainder / 100).toFixed(0)} / ${(progressInterval / 100).toFixed(0)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-2">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Donate more to SM-Give to improve your ranking in the directory.
                </p>
              </div>
            </div>

            {/* How ranking works */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">How rankings work</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Listings are ranked by total SM-Give donations within your category. The more you give, the higher you rank.
                No tool can hold a top 3 spot for more than 3 consecutive months — keeping it fair for everyone.
              </p>
              <Link
                href="/sm-give"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                Donate to SM-Give →
              </Link>
            </div>
          </div>
        )}

        {/* ── Tab: Status & Renewal ── */}
        {activeTab === 'status' && (
          <div className="space-y-5">
            {/* Status card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Current Status</p>
              <div className={`inline-flex items-center gap-2 border rounded-xl px-4 py-2 text-sm font-bold mb-4 ${statusColors[listing.status] ?? statusColors.pending}`}>
                {listing.status === 'active'   && '✅'}
                {listing.status === 'approved' && '⏳'}
                {listing.status === 'pending'  && '⏳'}
                {listing.status === 'expired'  && '❌'}
                {listing.status === 'rejected' && '✕'}
                {statusLabels[listing.status] ?? listing.status}
              </div>

              {renewalDate ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {listing.free_until ? 'Free Until' : 'Renewal Date'}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(renewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  {listing.status === 'active' && (() => {
                    const daysLeft = Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return daysLeft <= 30 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                        ⚠️ {daysLeft} day{daysLeft !== 1 ? 's' : ''} until renewal — renew soon to keep your ranking.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {daysLeft} days remaining
                      </p>
                    )
                  })()}
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500">Renewal date will be set once your listing is active.</p>
              )}

              {listing.plan_tier && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Plan Tier</p>
                  <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${
                    listing.plan_tier === 'founding'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {listing.plan_tier === 'founding' ? 'Founding member' : 'Standard'}
                  </span>
                </div>
              )}
            </div>

            {/* Renew CTA — only for active/expired */}
            {(listing.status === 'active' || listing.status === 'expired') && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">Renew Your Listing</p>
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-4 leading-relaxed">
                  Keep your tool in front of thousands of creators. Renewing early locks in your current rank.
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 text-center">
                    <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">$100</p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold">/year</p>
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                    <p>✅ Stays in directory for 1 year</p>
                    <p>✅ Keeps current ranking</p>
                    <p>✅ SM-Give donations carry over</p>
                  </div>
                </div>
                <Link
                  href="/studio-stax/renew"
                  className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
                  Renew listing — $100/yr →
                </Link>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">
                  No charge today — you&apos;ll be taken to a secure checkout page.
                </p>
              </div>
            )}

            {/* Approved — waiting on payment */}
            {listing.status === 'approved' && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Approved — payment link coming</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  Your application was approved! Joshua will send a payment link to your email shortly. Check your inbox (and spam folder).
                </p>
              </div>
            )}

            {/* Pending info */}
            {listing.status === 'pending' && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">Application under review</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                  Joshua reviews every application personally and responds within 48 hours. You&apos;ll receive an email when your listing is approved.
                </p>
              </div>
            )}

            {/* Expired info */}
            {listing.status === 'expired' && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
                <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">Listing expired</p>
                <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                  Your listing has been removed from the public directory. Renew now to get back in and retain your SM-Give history.
                </p>
              </div>
            )}

            {/* Rejected info */}
            {listing.status === 'rejected' && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Application not approved</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Your application wasn&apos;t approved this time. You&apos;re welcome to apply again with a different tool, or reach out to Joshua if you have questions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

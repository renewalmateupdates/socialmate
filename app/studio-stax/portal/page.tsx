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
  user_id: string
  studio_name: string
  description: string
  category: string
  website_url: string
  logo_url: string | null
  status: 'active' | 'pending' | 'expired'
  renewal_date: string | null
  sm_give_total: number
  rank: number | null
}

type Donation = {
  id: string
  listing_id: string
  user_id: string
  amount: number
  created_at: string
}

type Tab = 'listing' | 'rankings' | 'history' | 'status'

export default function StudioStaxPortalPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('listing')
  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<Listing | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [noListing, setNoListing] = useState(false)

  // Edit form state
  const [editMode, setEditMode] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Use maybeSingle so missing table or missing row both return null gracefully
      const { data: listingData } = await supabase
        .from('studio_stax_listings')
        .select('id, user_id, studio_name, description, category, website_url, logo_url, status, renewal_date, sm_give_total, rank')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!listingData) {
        setNoListing(true)
        setLoading(false)
        return
      }

      setListing(listingData as Listing)
      setEditDesc(listingData.description ?? '')
      setEditUrl(listingData.website_url ?? '')

      // Load donation history
      const { data: donationData } = await supabase
        .from('sm_give_donations')
        .select('id, listing_id, user_id, amount, created_at')
        .eq('listing_id', listingData.id)
        .order('created_at', { ascending: false })

      setDonations(Array.from(donationData ?? []) as Donation[])
      setLoading(false)
    }
    init()
  }, [router])

  const handleSaveEdit = async () => {
    if (!listing) return
    setEditSaving(true)
    setEditError('')
    setEditSuccess(false)
    const { error } = await supabase
      .from('studio_stax_listings')
      .update({ description: editDesc, website_url: editUrl })
      .eq('id', listing.id)

    if (error) {
      setEditError(error.message || 'Failed to save changes.')
    } else {
      setListing(l => l ? { ...l, description: editDesc, website_url: editUrl } : l)
      setEditMode(false)
      setEditSuccess(true)
      setTimeout(() => setEditSuccess(false), 3000)
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
            No active listing found
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Your account doesn&apos;t have an active Studio Stax listing yet. Apply to get listed in our curated directory.
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

  // Rank progress bar: assume we need to compare with next rank's donation amount
  // We show a simple bar based on the listing's sm_give_total relative to rank
  const totalDonated = listing.sm_give_total ?? 0
  const cumulativeTotal = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  // For the progress bar: show progress toward next $100 milestone
  const progressInterval = 100_00 // $100 in cents
  const progressRemainder = totalDonated % progressInterval
  const progressPct = progressInterval > 0 ? Math.round((progressRemainder / progressInterval) * 100) : 0
  const nextMilestone = Math.ceil((totalDonated + 1) / progressInterval) * progressInterval

  const statusColors: Record<string, string> = {
    active:  'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    pending: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
    expired: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  }
  const statusLabels: Record<string, string> = {
    active:  'Active',
    pending: 'Pending Review',
    expired: 'Expired',
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'listing',  label: 'My Listing'          },
    { id: 'rankings', label: 'Rankings & Visibility' },
    { id: 'history',  label: 'SM-Give History'      },
    { id: 'status',   label: 'Listing Status'        },
  ]

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
              <img src={listing.logo_url} alt={listing.studio_name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl font-extrabold text-amber-600 shrink-0">
                {listing.studio_name.charAt(0)}
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
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Studio Name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{listing.studio_name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Admin-managed</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {CATEGORIES[listing.category] ?? listing.category}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Admin-managed</p>
                </div>
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
                      onClick={() => { setEditMode(false); setEditDesc(listing.description ?? ''); setEditUrl(listing.website_url ?? '') }}
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
                      href={listing.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block">
                      {listing.website_url || '—'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Rankings & Visibility ── */}
        {activeTab === 'rankings' && (
          <div className="space-y-5">
            {/* Rank card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Your Ranking</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    {listing.rank != null ? `#${listing.rank}` : '—'}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold mt-1">
                    {listing.rank != null ? `in ${CATEGORIES[listing.category] ?? 'your category'}` : 'Rank pending'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                    ${(totalDonated / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">Total donated to SM-Give</p>
                </div>
              </div>

              {/* Progress to next milestone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Progress to next ranking milestone</p>
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
                  Donate <span className="font-bold text-gray-900 dark:text-gray-100">
                    ${((nextMilestone - totalDonated) / 100).toFixed(0)} more
                  </span> to reach the next milestone and climb the rankings.
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
                Donate more to climb →
              </Link>
            </div>
          </div>
        )}

        {/* ── Tab: SM-Give History ── */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Donation History</p>
              <span className="text-xs font-bold text-green-600 dark:text-green-400">
                Total: ${(cumulativeTotal / 100).toFixed(2)}
              </span>
            </div>

            {donations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">❤️</div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">No donations yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                  Start donating to SM-Give to climb the rankings and support creators.
                </p>
                <Link
                  href="/sm-give"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                  Make your first donation →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left text-xs font-bold text-gray-400 dark:text-gray-500 pb-3 pr-4">Date</th>
                      <th className="text-right text-xs font-bold text-gray-400 dark:text-gray-500 pb-3 pr-4">Amount</th>
                      <th className="text-right text-xs font-bold text-gray-400 dark:text-gray-500 pb-3">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let runningTotal = 0
                      return Array.from(donations).reverse().map((donation) => {
                        runningTotal += donation.amount ?? 0
                        const cumAtThisPoint = runningTotal
                        return { donation, cumAtThisPoint }
                      }).reverse().map(({ donation, cumAtThisPoint }) => (
                        <tr key={donation.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                          <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                            {new Date(donation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-green-600 dark:text-green-400">
                            +${((donation.amount ?? 0) / 100).toFixed(2)}
                          </td>
                          <td className="py-3 text-right text-gray-500 dark:text-gray-400">
                            ${(cumAtThisPoint / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Listing Status ── */}
        {activeTab === 'status' && (
          <div className="space-y-5">
            {/* Status card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Current Status</p>
              <div className={`inline-flex items-center gap-2 border rounded-xl px-4 py-2 text-sm font-bold mb-4 ${statusColors[listing.status] ?? statusColors.pending}`}>
                {listing.status === 'active'  && '✅'}
                {listing.status === 'pending' && '⏳'}
                {listing.status === 'expired' && '❌'}
                {statusLabels[listing.status] ?? listing.status}
              </div>

              {listing.renewal_date ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Renewal Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(listing.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  {listing.status === 'active' && (() => {
                    const daysLeft = Math.ceil((new Date(listing.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
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
                <p className="text-xs text-gray-400 dark:text-gray-500">Renewal date not set yet.</p>
              )}
            </div>

            {/* Renew CTA */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">Renew Your Listing</p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-4 leading-relaxed">
                Keep your tool in front of thousands of creators. Renewing early locks in your current rank.
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">$99</p>
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
                Renew listing — $99/yr →
              </Link>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">
                No charge today — you&apos;ll be taken to a secure checkout page.
              </p>
            </div>

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
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

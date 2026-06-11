'use client'

import { useState, useEffect, useCallback } from 'react'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'

interface GrantHit {
  id: string
  number: string
  title: string
  agency: string
  agencyCode: string
  openDate: string
  closeDate: string
  oppStatus: string
  docType: string
}

const ELIGIBILITY_OPTIONS = [
  { value: '', label: 'All applicants' },
  { value: '21', label: 'Individuals' },
  { value: '23', label: 'Small businesses' },
  { value: '22', label: 'For-profits (other than small business)' },
  { value: '12', label: 'Nonprofits with 501(c)(3) status' },
  { value: '13', label: 'Nonprofits without 501(c)(3) status' },
  { value: '20', label: 'Private colleges/universities' },
  { value: '06', label: 'Public colleges/universities' },
  { value: '99', label: 'Unrestricted (any entity type)' },
]

const FUNDING_CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'AR', label: 'Arts' },
  { value: 'BC', label: 'Business and Commerce' },
  { value: 'CD', label: 'Community Development' },
  { value: 'ED', label: 'Education' },
  { value: 'ELT', label: 'Employment, Labor and Training' },
  { value: 'EN', label: 'Energy' },
  { value: 'ENV', label: 'Environment' },
  { value: 'FN', label: 'Food and Nutrition' },
  { value: 'HL', label: 'Health' },
  { value: 'HO', label: 'Housing' },
  { value: 'HU', label: 'Humanities' },
  { value: 'ISS', label: 'Income Security and Social Services' },
  { value: 'RD', label: 'Regional Development' },
  { value: 'ST', label: 'Science and Technology / R&D' },
  { value: 'T', label: 'Transportation' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://socialmate.studio/grants',
      url: 'https://socialmate.studio/grants',
      name: 'Free Grants Finder for Creators & Small Businesses | SocialMate',
      description:
        'Search live US federal grant opportunities from grants.gov for free. Filter by eligibility (individuals, small businesses, nonprofits) and category. No account required.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socialmate.studio' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Grants Finder',
            item: 'https://socialmate.studio/grants',
          },
        ],
      },
    },
  ],
}

function formatDate(d: string) {
  if (!d) return '—'
  return d
}

export default function GrantsPage() {
  const [keyword, setKeyword] = useState('')
  const [eligibility, setEligibility] = useState('')
  const [fundingCategory, setFundingCategory] = useState('')
  const [hits, setHits] = useState<GrantHit[]>([])
  const [hitCount, setHitCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const runSearch = useCallback(async () => {
    setLoading(true)
    setError(false)
    setHasSearched(true)
    try {
      const res = await fetch('/api/grants/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, eligibility, fundingCategory }),
      })
      if (!res.ok) throw new Error('search failed')
      const data = await res.json()
      setHits(data.hits ?? [])
      setHitCount(data.hitCount ?? 0)
    } catch {
      setError(true)
      setHits([])
      setHitCount(null)
    } finally {
      setLoading(false)
    }
  }, [keyword, eligibility, fundingCategory])

  useEffect(() => {
    runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            Free Tool
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Grants Finder
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Search live U.S. federal grant opportunities from grants.gov. For creators, small
            businesses, nonprofits, and individuals — free, no account required.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-8 space-y-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search grants by keyword (e.g. small business, arts, technology)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
            >
              {ELIGIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Who can apply: {opt.label}
                </option>
              ))}
            </select>

            <select
              value={fundingCategory}
              onChange={(e) => setFundingCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
            >
              {FUNDING_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Category: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runSearch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search Grants'}
          </button>
        </div>

        {/* Results */}
        {error && (
          <div className="text-center py-12 text-gray-400">
            Couldn&apos;t reach grants.gov right now. Try again in a moment.
          </div>
        )}

        {!error && hasSearched && (
          <>
            {hitCount !== null && (
              <p className="text-sm text-gray-500 mb-4">
                {hitCount.toLocaleString()} open opportunit{hitCount === 1 ? 'y' : 'ies'} found
                {hits.length < hitCount ? ` — showing first ${hits.length}` : ''}
              </p>
            )}

            <div className="space-y-3">
              {hits.map((hit) => (
                <a
                  key={hit.id}
                  href={`https://www.grants.gov/search-results-detail/${hit.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {hit.title}
                    </h2>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-1">
                      {hit.oppStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{hit.agency}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                    <span>Posted: {formatDate(hit.openDate)}</span>
                    <span>Closes: {formatDate(hit.closeDate) || 'Rolling / Not specified'}</span>
                    <span>Opportunity #: {hit.number}</span>
                  </div>
                </a>
              ))}
            </div>

            {!loading && hits.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No open grants matched your filters. Try a broader search or different category.
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-12 text-center text-xs text-gray-600 max-w-xl mx-auto leading-relaxed">
          Data is pulled live from{' '}
          <a
            href="https://www.grants.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-amber-400 underline"
          >
            grants.gov
          </a>
          , the U.S. government&apos;s official grants database. SocialMate doesn&apos;t process
          applications or charge for this tool — click any result to apply directly on
          grants.gov.
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

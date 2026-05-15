import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'
import ListingViewTracker from './ListingViewTracker'

const CATEGORIES = [
  { id: 'social-media',      label: 'Social Media Tools'   },
  { id: 'content-creation',  label: 'Content Creation'     },
  { id: 'ai-tools',          label: 'AI Tools'              },
  { id: 'analytics',         label: 'Analytics & Growth'   },
  { id: 'creator-economy',   label: 'Creator Economy'       },
  { id: 'community',         label: 'Community Building'   },
  { id: 'productivity',      label: 'Productivity'          },
  { id: 'developer-tools',   label: 'Developer Tools'       },
]

// Price labels for known Garrison listings — won't hit DB, just display
const GARRISON_PRICE: Record<string, string> = {
  'RenewalMate': 'Free forever',
  'Enki':        'Free to start',
}

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function getHostname(url: string) {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

export const metadata = {
  title: 'Studio Stax — SocialMate',
  description: 'Founder-approved tools for creators, builders, and communities. Ranked by generosity, not budget.',
}

export const revalidate = 3600

export default async function StudioStaxPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: listings } = await supabase
    .from('curated_listings')
    .select('id, name, tagline, description, url, logo_url, category, smgive_donated_cents, consecutive_featured_months, admin_featured, created_at, is_nsfw, featured, featured_until')
    .eq('status', 'approved')

  // Founding spots counter
  const { count: foundingSpotsUsed } = await supabase
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
  const FOUNDING_LIMIT = 100
  const spotsUsed = foundingSpotsUsed ?? 0
  const spotsRemaining = Math.max(0, FOUNDING_LIMIT - spotsUsed)
  const foundingFull = spotsUsed >= FOUNDING_LIMIT

  // Ranking formula:
  // 1. Admin featured (Garrison) separated and shown first
  // 2. Regular listings ranked by donation + age bonus
  const now = Date.now()
  const allListings = listings ?? []

  const nowIso = new Date(now).toISOString()

  const garrison    = allListings.filter(l => l.admin_featured)
  const nonGarrison = allListings.filter(l => !l.admin_featured)

  // Paid featured = featured=true AND featured_until is in the future
  const paidFeatured = nonGarrison.filter(
    l => l.featured && l.featured_until && l.featured_until > nowIso
  )
  const regular = nonGarrison.filter(
    l => !(l.featured && l.featured_until && l.featured_until > nowIso)
  )

  const ranked = regular.slice().sort((a, b) => {
    const ageMonthsA = Math.floor((now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
    const ageMonthsB = Math.floor((now - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
    const scoreA = (a.smgive_donated_cents ?? 0) * (1 + Math.min(ageMonthsA, 12) * 0.05)
    const scoreB = (b.smgive_donated_cents ?? 0) * (1 + Math.min(ageMonthsB, 12) * 0.05)
    return scoreB - scoreA
  })

  const byCategory: Record<string, typeof listings> = {}
  for (const cat of CATEGORIES) {
    byCategory[cat.id] = ranked.filter(l => l.category === cat.id).slice(0, 5)
  }
  const hasRegular = Object.values(byCategory).some(arr => arr && arr.length > 0)
  const hasPaidFeatured = paidFeatured.length > 0

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-6">
            ❤️ SM-Give Certified Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
            Studio <span className="text-amber-500">Stax</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Founder-approved tools that share our belief: technology should empower creators, not exploit them. Ranked by generosity to SM-Give — not by who paid the most.
          </p>
          {/* Founding spots counter */}
          {!foundingFull ? (
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-full px-5 py-2 mt-6 text-sm font-bold text-amber-700 dark:text-amber-400">
              🔥 {spotsRemaining} of {FOUNDING_LIMIT} Founding Spots Remaining
              <span className="font-normal text-amber-600 dark:text-amber-500">— $100/yr (then $150/yr)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-2 mt-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
              🏅 {spotsUsed} Founding Members
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/studio-stax/apply"
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              Apply for a Listing →
            </Link>
            {!foundingFull ? (
              <span className="text-xs text-gray-400 dark:text-gray-500">$100/year founder price · first 100 spots · goes to $150 after</span>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">Standard listing $150/yr</span>
            )}
            <Link href="/studio-stax/portal"
              className="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Lister Portal →
            </Link>
          </div>
        </div>

        {/* ── GILGAMESH'S GARRISON ── */}
        {garrison.length > 0 && (
          <section className="mb-16">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-purple-600 dark:bg-purple-700 text-white px-4 py-1.5 rounded-full">
                <span className="text-base">👑</span>
                <span className="text-xs font-extrabold uppercase tracking-widest">Gilgamesh&apos;s Garrison</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Built by the founder. Always here.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {garrison.map(listing => (
                <Link
                  key={listing.id}
                  href={`/studio-stax/${nameToSlug(listing.name)}`}
                  className="group relative flex flex-col bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-700 ring-1 ring-purple-200 dark:ring-purple-800 rounded-2xl p-6 hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all overflow-hidden"
                >
                  {/* NSFW badge */}
                  {listing.is_nsfw && (
                    <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full select-none">18+</span>
                  )}
                  {/* Top row */}
                  <div className="flex items-start gap-4 mb-4">
                    {listing.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.logo_url}
                        alt={listing.name}
                        className={`w-12 h-12 rounded-xl object-cover shrink-0 transition-all duration-300 ${listing.is_nsfw ? 'blur-md group-hover:blur-none' : ''}`}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-extrabold text-lg shrink-0">
                        {listing.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-extrabold text-base text-gray-900 dark:text-gray-100">{listing.name}</p>
                        {/* Founder's Pick badge */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700 uppercase tracking-wider">
                          👑 Founder&apos;s Pick
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{listing.tagline}</p>
                    </div>
                    {/* Price */}
                    {GARRISON_PRICE[listing.name] && (
                      <span className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                        {GARRISON_PRICE[listing.name]}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {listing.is_nsfw ? (
                    <div className="mb-4 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 blur-sm group-hover:blur-none transition-all duration-300 select-none group-hover:select-auto">{listing.description}</p>
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 group-hover:hidden">This listing contains adult content — hover to reveal</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {listing.description}
                    </p>
                  )}

                  {/* URL */}
                  <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {getHostname(listing.url)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── PAID FEATURED ── */}
        {hasPaidFeatured && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-yellow-500 dark:bg-yellow-600 text-black px-4 py-1.5 rounded-full">
                <span className="text-base">⭐</span>
                <span className="text-xs font-extrabold uppercase tracking-widest">Featured Listings</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Paid spotlight placement</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paidFeatured.map(listing => (
                <Link
                  key={listing.id}
                  href={`/studio-stax/${nameToSlug(listing.name)}`}
                  className="group relative flex flex-col bg-white dark:bg-gray-900 border-2 border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-200 dark:ring-yellow-700 rounded-2xl p-6 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all overflow-hidden"
                >
                  {/* Featured badge */}
                  <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold bg-yellow-400 text-black px-2 py-0.5 rounded-full select-none">⭐ Featured</span>

                  {listing.is_nsfw && (
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full select-none">18+</span>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    {listing.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.logo_url}
                        alt={listing.name}
                        className={`w-12 h-12 rounded-xl object-cover shrink-0 transition-all duration-300 ${listing.is_nsfw ? 'blur-md group-hover:blur-none' : ''}`}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-yellow-700 dark:text-yellow-300 font-extrabold text-lg shrink-0">
                        {listing.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pr-16">
                      <p className="font-extrabold text-base text-gray-900 dark:text-gray-100 mb-0.5">{listing.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{listing.tagline}</p>
                    </div>
                  </div>

                  {listing.is_nsfw ? (
                    <div className="mb-4 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 blur-sm group-hover:blur-none transition-all duration-300 select-none group-hover:select-auto">{listing.description}</p>
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 group-hover:hidden">Adult content — hover to reveal</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-semibold group-hover:underline">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {getHostname(listing.url)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* How ranking works */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-14 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">How rankings work</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Listings are ranked by how much each tool donates to SM-Give — our charity initiative. The more you give, the higher you rank. No exceptions. Tools can&apos;t stay in the top 3 of any category for more than 3 consecutive months — keeping it fair for everyone.
            </p>
          </div>
          <div className="flex gap-4 text-center shrink-0">
            <div><p className="text-2xl font-extrabold text-amber-500">❤️</p><p className="text-xs text-gray-400 mt-1">Donate to<br/>SM-Give</p></div>
            <div><p className="text-2xl font-extrabold text-gray-400">→</p></div>
            <div><p className="text-2xl font-extrabold text-green-500">📈</p><p className="text-xs text-gray-400 mt-1">Rank<br/>higher</p></div>
            <div><p className="text-2xl font-extrabold text-gray-400">→</p></div>
            <div><p className="text-2xl font-extrabold text-blue-500">👀</p><p className="text-xs text-gray-400 mt-1">More<br/>exposure</p></div>
          </div>
        </div>

        {/* Regular category listings */}
        {!hasRegular ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">First listings coming soon</h2>
            <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-md mx-auto text-sm">Be among the first 100 tools in Studio Stax. Apply now and lock in the $100/year founder price before it goes to $150.</p>
            <Link href="/studio-stax/apply" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              Apply Now →
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {CATEGORIES.map(cat => {
              const items = byCategory[cat.id] ?? []
              if (items.length === 0) return null
              return (
                <section key={cat.id}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{cat.label}</h2>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{items.length} tool{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((listing, idx) => (
                      <Link key={listing.id} href={`/studio-stax/${nameToSlug(listing.name)}`}
                        className={`group relative block bg-white dark:bg-gray-900 border rounded-2xl p-5 hover:shadow-lg transition-all overflow-hidden ${
                          idx === 0 ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800' :
                          idx === 1 ? 'border-gray-200 dark:border-gray-700' :
                          'border-gray-100 dark:border-gray-800'
                        }`}>
                        {/* NSFW badge */}
                        {listing.is_nsfw && (
                          <span className="absolute top-3 right-3 z-10 text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full select-none">18+</span>
                        )}
                        <div className="flex items-start gap-3 mb-3">
                          {listing.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={listing.logo_url}
                              alt={listing.name}
                              className={`w-10 h-10 rounded-xl object-cover shrink-0 transition-all duration-300 ${listing.is_nsfw ? 'blur-md group-hover:blur-none' : ''}`}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0">
                              {listing.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{listing.name}</p>
                              {idx === 0 && <span className="shrink-0 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">⭐ Top Pick</span>}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{listing.tagline}</p>
                          </div>
                        </div>
                        {listing.is_nsfw ? (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 blur-sm group-hover:blur-none transition-all duration-300 select-none group-hover:select-auto">{listing.description}</p>
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 group-hover:hidden">This listing contains adult content — hover to reveal</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{listing.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-medium">{getHostname(listing.url)}</span>
                          {listing.smgive_donated_cents > 0 && (
                            <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                              ❤️ ${(listing.smgive_donated_cents / 100).toFixed(0)} to SM-Give
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-20 text-center border-t border-gray-100 dark:border-gray-800 pt-16">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">Think your tool belongs here?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            We only list tools built for the people — not VC-backed giants trying to squeeze every dollar out of creators. If that&apos;s you, apply.
          </p>
          <Link href="/studio-stax/apply" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 rounded-xl hover:opacity-80 transition-all text-sm">
            Apply for a Listing →
          </Link>
        </div>
      </div>

      {/* Fire-and-forget view tracking for all listings on this page */}
      <ListingViewTracker listingIds={allListings.map(l => l.id)} />
    </PublicLayout>
  )
}

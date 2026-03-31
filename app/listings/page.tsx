import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'

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

export const metadata = {
  title: 'Curated Listings — SocialMate',
  description: 'Founder-approved tools for creators, builders, and communities. Ranked by generosity, not budget.',
}

export const revalidate = 3600

export default async function ListingsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: listings } = await supabase
    .from('curated_listings')
    .select('id, name, tagline, description, url, logo_url, category, tags, smgive_donated_cents, consecutive_featured_months, created_at')
    .eq('status', 'approved')
    .order('smgive_donated_cents', { ascending: false })

  const byCategory: Record<string, typeof listings> = {}
  for (const cat of CATEGORIES) {
    byCategory[cat.id] = (listings ?? []).filter(l => l.category === cat.id).slice(0, 5)
  }
  const hasAny = Object.values(byCategory).some(arr => arr && arr.length > 0)

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-6">
            ❤️ SM-Give Certified Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
            Tools Built <span className="text-amber-500">By the People</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Founder-approved tools that share our belief: technology should empower creators, not exploit them. Ranked by generosity to SM-Give — not by who paid the most.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/listings/apply"
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              Apply for a Listing →
            </Link>
            <span className="text-xs text-gray-400 dark:text-gray-500">$149/year · founder-reviewed · limited spots</span>
          </div>
        </div>

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

        {!hasAny ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">First listings coming soon</h2>
            <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-md mx-auto text-sm">Be among the first tools featured in our curated directory. Apply now and get founding member pricing.</p>
            <Link href="/listings/apply" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
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
                      <a key={listing.id} href={listing.url} target="_blank" rel="noopener noreferrer"
                        className={`group block bg-white dark:bg-gray-900 border rounded-2xl p-5 hover:shadow-lg transition-all ${
                          idx === 0 ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800' :
                          idx === 1 ? 'border-gray-200 dark:border-gray-700' :
                          'border-gray-100 dark:border-gray-800'
                        }`}>
                        <div className="flex items-start gap-3 mb-3">
                          {listing.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={listing.logo_url} alt={listing.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{listing.description}</p>
                        {listing.smgive_donated_cents > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                              ❤️ Donated ${(listing.smgive_donated_cents / 100).toFixed(0)} to SM-Give
                            </span>
                          </div>
                        )}
                      </a>
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
          <Link href="/listings/apply" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 rounded-xl hover:opacity-80 transition-all text-sm">
            Apply for a Listing — $149/year →
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

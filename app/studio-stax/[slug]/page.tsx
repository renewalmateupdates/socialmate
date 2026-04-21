import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'
import NsfwLogoReveal from './NsfwLogoReveal'

const CATEGORY_LABELS: Record<string, string> = {
  'social-media':     'Social Media Tools',
  'content-creation': 'Content Creation',
  'ai-tools':         'AI Tools',
  'analytics':        'Analytics & Growth',
  'creator-economy':  'Creator Economy',
  'community':        'Community Building',
  'productivity':     'Productivity',
  'developer-tools':  'Developer Tools',
}

// Derive slug from listing name: lowercase + hyphens
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

interface Props {
  params: Promise<{ slug: string }>
}

async function getListing(slug: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  // Fetch all approved listings and match by derived slug
  const { data: listings } = await supabase
    .from('curated_listings')
    .select('id, name, tagline, description, url, logo_url, category, mission_statement, is_nsfw, smgive_donated_cents, admin_featured')
    .eq('status', 'approved')

  if (!listings) return null

  return listings.find(l => nameToSlug(l.name) === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing) return { title: 'Listing Not Found — Studio Stax' }
  return {
    title: `${listing.name} — Studio Stax`,
    description: listing.tagline ?? listing.description?.slice(0, 160) ?? undefined,
  }
}

export const revalidate = 3600

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params
  const listing = await getListing(slug)

  if (!listing) notFound()

  const donatedDollars = listing.smgive_donated_cents > 0
    ? (listing.smgive_donated_cents / 100).toFixed(0)
    : null

  const categoryLabel = CATEGORY_LABELS[listing.category] ?? listing.category ?? null

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/studio-stax"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-200 transition-colors mb-10"
        >
          ← Back to Studio Stax
        </Link>

        {/* Admin Featured Banner */}
        {listing.admin_featured && (
          <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-500/40 rounded-2xl px-5 py-3.5 mb-8">
            <span className="text-base">⚔️</span>
            <p className="text-sm font-extrabold text-yellow-400">
              Gilgamesh&apos;s Garrison — Featured
            </p>
          </div>
        )}

        {/* NSFW warning */}
        {listing.is_nsfw && (
          <div className="flex items-center gap-2 bg-red-950/30 border border-red-700/40 rounded-xl px-4 py-2.5 mb-6">
            <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">18+</span>
            <p className="text-xs text-red-400 font-semibold">This listing contains mature content.</p>
          </div>
        )}

        {/* Main card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {/* Logo + Name */}
          <div className="flex items-start gap-5 mb-6">
            {listing.is_nsfw ? (
              <NsfwLogoReveal logoUrl={listing.logo_url} name={listing.name} />
            ) : listing.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.logo_url}
                alt={listing.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl font-extrabold text-gray-400 shrink-0">
                {listing.name.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">{listing.name}</h1>
              {listing.tagline && (
                <p className="text-sm text-gray-400 leading-snug">{listing.tagline}</p>
              )}
            </div>
          </div>

          {/* Category badge */}
          {categoryLabel && (
            <div className="mb-6">
              <span className="inline-block text-[11px] font-bold bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-300 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Mission statement */}
          {listing.mission_statement && (
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 mb-6">
              <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Mission</p>
              <p className="text-sm text-gray-300 leading-relaxed italic">&ldquo;{listing.mission_statement}&rdquo;</p>
            </div>
          )}

          {/* SM-Give donation */}
          {donatedDollars && (
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-3 mb-6">
              <span className="text-base">💚</span>
              <p className="text-sm font-bold text-green-400">
                Has donated ${donatedDollars} to SM-Give
              </p>
            </div>
          )}

          {/* CTA button */}
          <a
            href={`/api/studio-stax/click/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-sm py-3.5 rounded-xl transition-colors"
          >
            Visit {listing.name}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {listing.url && (
            <p className="text-center text-xs text-gray-600 mt-2">{getHostname(listing.url)}</p>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

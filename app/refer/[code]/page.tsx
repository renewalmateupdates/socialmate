export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import RefCodeSetter from './RefCodeSetter'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AffiliateInfo {
  code: string
  displayName: string
  avatarUrl: string | null
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getAffiliateByCode(code: string): Promise<AffiliateInfo | null> {
  const db = getSupabaseAdmin()
  const upperCode = code.toUpperCase()

  // 1. Resolve user_id from user_settings.referral_code
  const { data: settings } = await db
    .from('user_settings')
    .select('user_id')
    .eq('referral_code', upperCode)
    .maybeSingle()

  if (!settings?.user_id) return null

  // 2. Confirm affiliate is active
  const { data: affiliate } = await db
    .from('affiliates')
    .select('id, status')
    .eq('user_id', settings.user_id)
    .eq('status', 'active')
    .maybeSingle()

  if (!affiliate) return null

  // 3. Fetch display info from affiliate_profiles (may not exist — non-fatal)
  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('full_name, avatar_url')
    .eq('user_id', settings.user_id)
    .maybeSingle()

  const displayName = profile?.full_name?.trim() || upperCode

  return {
    code: upperCode,
    displayName,
    avatarUrl: profile?.avatar_url ?? null,
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const info = await getAffiliateByCode(code)
  const name = info?.displayName ?? code.toUpperCase()
  return {
    title: `${name} invites you to SocialMate`,
    description:
      'What competitors charge $99/mo for, we give for $5. Schedule to 5+ platforms, 12 AI tools, and analytics — free forever or Pro from $5/mo.',
  }
}

// ── Benefit bullets ───────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: '📅',
    title: 'Schedule to 5+ platforms',
    desc: 'Bluesky, X/Twitter, Mastodon, Discord, Telegram — one composer, one queue.',
  },
  {
    icon: '✨',
    title: '12 AI tools built in',
    desc: 'Caption writer, hook generator, thread expander, content repurposer, and more — powered by Gemini.',
  },
  {
    icon: '📊',
    title: 'Analytics + insights',
    desc: 'Best-times heatmap, per-platform breakdown, and engagement sync — so you grow, not just post.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ReferPage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const info = await getAffiliateByCode(code)

  if (!info) notFound()

  const signupUrl = `/signup?ref=${info.code}`
  const initials = info.displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PublicNav />

      {/* ── Cookie setter (client) ─────────────────────────────────────────── */}
      <RefCodeSetter code={info.code} />

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 py-12 sm:py-20">

        {/* ── Invitation banner ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mb-10">
          {info.avatarUrl ? (
            <img
              src={info.avatarUrl}
              alt={info.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold select-none"
            >
              {initials}
            </div>
          )}
          <p className="text-sm text-gray-400 tracking-wide">
            You&apos;ve been invited by{' '}
            <span className="text-white font-semibold">{info.displayName}</span>
          </p>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="max-w-2xl w-full text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            SocialMate —{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              The Creator OS
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            What competitors charge{' '}
            <span className="line-through text-gray-500">$99/mo</span> for,
            we give for{' '}
            <span className="font-bold text-white">$5</span>.
          </p>
        </div>

        {/* ── Benefits ──────────────────────────────────────────────────── */}
        <div className="max-w-2xl w-full grid sm:grid-cols-3 gap-4 mb-12">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2"
            >
              <span className="text-2xl">{b.icon}</span>
              <p className="font-semibold text-white text-sm">{b.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Pricing callout ───────────────────────────────────────────── */}
        <div className="max-w-2xl w-full mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center sm:text-left">
            <PricePill label="Free" sub="forever" color="text-emerald-400" />
            <Divider />
            <PricePill label="Pro" sub="$5 / mo" color="text-violet-400" />
            <Divider />
            <PricePill label="Agency" sub="$20 / mo" color="text-amber-400" />
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <a
            href={signupUrl}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors text-white font-bold text-lg shadow-lg shadow-violet-900/40"
          >
            Start free <span aria-hidden="true">→</span>
          </a>
          <p className="text-xs text-gray-500">No credit card required</p>
        </div>

      </main>

      <PublicFooter />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PricePill({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <span className={`text-lg font-bold ${color}`}>{label}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </div>
  )
}

function Divider() {
  return (
    <span className="hidden sm:block text-gray-700 text-xl font-light select-none">·</span>
  )
}

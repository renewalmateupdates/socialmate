import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Wall of Love — SocialMate',
  description: 'Real testimonials from creators, founders, and teams using SocialMate to grow their audience.',
}

// Add real testimonials here as they come in. Each entry:
// { name, handle, platform, quote, avatar (emoji or initials) }
const TESTIMONIALS: {
  name: string
  handle?: string
  platform?: string
  quote: string
  avatar: string
  role?: string
}[] = [
  // Placeholder — replace with real quotes when collected
  // {
  //   name: 'Jane Doe',
  //   handle: '@janedoe',
  //   platform: 'Bluesky',
  //   quote: 'SocialMate cut my posting time in half. Finally a scheduler that doesn\'t cost more than my rent.',
  //   avatar: '👩‍💻',
  //   role: 'Creator & Coach',
  // },
]

const STAR = '★'

export default function WallOfLove() {
  const hasTestimonials = TESTIMONIALS.length > 0

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Wall of Love</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Real people. Real results.
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
            What creators, founders, and teams are saying about SocialMate. No cherry-picking. Just the truth.
          </p>
        </div>

        {hasTestimonials ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{t.name}</p>
                    {t.role && <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>}
                    {t.handle && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.handle} · {t.platform}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="text-amber-400 text-sm tracking-wider">{STAR.repeat(5)}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — shows until real testimonials are added */
          <div className="text-center py-16 mb-10">
            <div className="text-6xl mb-6">🧡</div>
            <p className="text-lg font-extrabold tracking-tight mb-3">The reviews are coming</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
              SocialMate soft-launched March 26, 2026. We&apos;re 30+ users in and building fast.
              Real testimonials are on their way — check back soon.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex -space-x-1.5">
                {['🧑‍💻', '👩‍🎨', '🧑‍🎤', '👨‍💼', '👩‍🚀'].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-base">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-700 dark:text-gray-300">30+</span> creators already using SocialMate
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center">
          <p className="text-base font-extrabold tracking-tight mb-2">Are you a SocialMate user?</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 leading-relaxed">
            If SocialMate has made your content life easier, we&apos;d love to hear about it.
            A one-liner is enough — just honest words.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:hey@socialmate.studio?subject=SocialMate%20testimonial&body=Hi%20Joshua%2C%0A%0AHere%27s%20my%20honest%20take%20on%20SocialMate%3A%0A%0A"
              className="px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
              Send a testimonial →
            </a>
            <Link href="/signup"
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all text-gray-600 dark:text-gray-400">
              Try SocialMate free →
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}

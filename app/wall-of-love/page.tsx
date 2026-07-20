'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

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
  const { t } = useI18n()
  const hasTestimonials = TESTIMONIALS.length > 0

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('wall_of_love.badge')}</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            {t('wall_of_love.hero_title')}
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
            {t('wall_of_love.hero_desc')}
          </p>
        </div>

        {hasTestimonials ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-panel border border-edge rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{testimonial.name}</p>
                    {testimonial.role && <p className="text-xs text-gray-400 dark:text-gray-500">{testimonial.role}</p>}
                    {testimonial.handle && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{testimonial.handle} · {testimonial.platform}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="text-amber-400 text-sm tracking-wider">{STAR.repeat(5)}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — shows until real testimonials are added */
          <div className="text-center py-16 mb-10">
            <div className="text-6xl mb-6">🧡</div>
            <p className="text-lg font-extrabold tracking-tight mb-3">{t('wall_of_love.empty_title')}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
              {t('wall_of_love.empty_desc')}
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
                <span className="font-bold text-gray-700 dark:text-gray-300">30+</span> {t('wall_of_love.creators_using')}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-panel border border-edge rounded-3xl p-8 text-center">
          <p className="text-base font-extrabold tracking-tight mb-2">{t('wall_of_love.cta_title')}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 leading-relaxed">
            {t('wall_of_love.cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:hey@socialmate.studio?subject=SocialMate%20testimonial&body=Hi%20Joshua%2C%0A%0AHere%27s%20my%20honest%20take%20on%20SocialMate%3A%0A%0A"
              className="px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
              {t('wall_of_love.send_testimonial_cta')}
            </a>
            <Link href="/signup"
              className="px-6 py-3 border border-edge text-sm font-semibold rounded-xl hover:border-gray-400 transition-all text-gray-600 dark:text-gray-400">
              {t('wall_of_love.try_free_cta')}
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}

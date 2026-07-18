'use client'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

export default function PublicFooter() {
  const { t } = useI18n()

  const FOOTER_COLUMNS = [
    {
      heading: t('footer.product'),
      links: [
        { labelKey: 'footer.links.features',     href: '/features'  },
        { labelKey: 'footer.links.pricing',       href: '/pricing'   },
        { labelKey: 'footer.links.roadmap',       href: '/roadmap'   },
        { labelKey: 'footer.links.clips_studio',  href: '/clips'     },
        { labelKey: 'footer.links.soma',          href: '/soma'      },
        { labelKey: 'footer.links.monetize',      href: '/monetize'  },
      ],
    },
    {
      heading: t('footer.solutions'),
      links: [
        { labelKey: 'footer.links.streamers',     href: '/for/streamers'      },
        { labelKey: 'footer.links.agencies',      href: '/for/agencies'       },
        { labelKey: 'footer.links.small_business',href: '/for/small-business' },
        { labelKey: 'footer.links.studio_stax',   href: '/studio-stax'        },
      ],
    },
    {
      heading: t('footer.company'),
      links: [
        { labelKey: 'footer.links.story',         href: '/story'      },
        { labelKey: 'footer.links.blog',          href: '/blog'       },
        { labelKey: 'footer.links.merch',         href: '/merch'      },
        { labelKey: 'footer.links.affiliates',    href: '/affiliates' },
        { labelKey: 'footer.links.referral',      href: '/referral'   },
        { labelKey: 'footer.links.gils_guide',    href: '/guides'     },
      ],
    },
    {
      heading: t('footer.legal'),
      links: [
        { labelKey: 'footer.links.privacy',       href: '/privacy',     rose: false },
        { labelKey: 'footer.links.terms',         href: '/terms',       rose: false },
        { labelKey: 'footer.links.wall_of_love',  href: '/wall-of-love',rose: false },
        { labelKey: 'footer.links.sm_give',       href: '/give',        rose: true  },
      ],
    },
  ]

  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-16">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">

        {/* Logo + tagline */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-sm tracking-tight text-gray-100">SocialMate</span>
          </Link>
          <span className="text-xs text-gray-500 ml-1">{t('footer.tagline')}</span>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {FOOTER_COLUMNS.map(col => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors ${'rose' in link && link.rose
                        ? 'text-rose-400 hover:text-rose-300 font-medium'
                        : 'text-gray-400 hover:text-gray-100'
                      }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-5">
          <p className="text-xs text-gray-500">{t('footer.copyright')}</p>
        </div>

      </div>
    </footer>
  )
}

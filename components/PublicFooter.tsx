import Link from 'next/link'

type FooterLink = { label: string; href: string; rose?: boolean }
type FooterColumn = { heading: string; links: FooterLink[] }

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',     href: '/features' },
      { label: 'Pricing',      href: '/pricing'  },
      { label: 'Roadmap',      href: '/roadmap'  },
      { label: 'Clips Studio', href: '/clips'    },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'For Streamers',      href: '/for/streamers'      },
      { label: 'For Agencies',       href: '/for/agencies'       },
      { label: 'For Small Business', href: '/for/small-business' },
      { label: 'Studio Stax',        href: '/studio-stax'        },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Our Story',   href: '/story'      },
      { label: 'Blog',        href: '/blog'       },
      { label: 'Merch',       href: '/merch'      },
      { label: 'Affiliates',  href: '/affiliates' },
      { label: 'Referral',    href: '/referral'   },
      { label: "Gil's Guide", href: '/gilgamesh'  },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy',    href: '/privacy', rose: false },
      { label: 'Terms',      href: '/terms',   rose: false },
      { label: '❤️ SM-Give', href: '/give',    rose: true  },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">

        {/* Logo + tagline */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-gray-100">SocialMate</span>
          </Link>
          <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">by Gilgamesh Enterprise LLC</span>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {FOOTER_COLUMNS.map(col => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors ${
                        link.rose
                          ? 'text-rose-400 hover:text-rose-300 font-medium'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 SocialMate · All rights reserved</p>
        </div>

      </div>
    </footer>
  )
}

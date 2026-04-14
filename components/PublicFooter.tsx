import Link from 'next/link'

const LINKS = [
  { label: 'Features',         href: '/features'           },
  { label: 'Pricing',          href: '/pricing'            },
  { label: 'Blog',             href: '/blog'               },
  { label: 'Roadmap',          href: '/roadmap'            },
  { label: 'For Streamers',    href: '/for/streamers'      },
  { label: 'For Agencies',     href: '/for/agencies'       },
  { label: 'For Small Business', href: '/for/small-business' },
  { label: 'Affiliate',        href: '/affiliate'          },
  { label: 'Privacy',          href: '/privacy'            },
  { label: 'Terms',            href: '/terms'              },
]

export default function PublicFooter() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-gray-100">SocialMate</span>
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 SocialMate · All rights reserved</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

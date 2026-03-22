import PublicNav from './PublicNav'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PublicNav />
      <main>{children}</main>
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-xs font-bold">S</div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">SocialMate</span>
          </div>
          <nav className="flex items-center gap-5 flex-wrap">
            {[
              { label: 'Features',  href: '/features'  },
              { label: 'Pricing',   href: '/pricing'   },
              { label: 'Affiliate', href: '/affiliate' },
              { label: 'Referral',  href: '/referral'  },
              { label: 'Our Story', href: '/story'     },
              { label: 'Blog',      href: '/blog'      },
              { label: 'Privacy',   href: '/privacy'   },
              { label: 'Terms',     href: '/terms'     },
            ].map(link => (
              <Link key={link.label} href={link.href}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 SocialMate</p>
        </div>
      </footer>
    </div>
  )
}
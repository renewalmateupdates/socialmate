import PublicNav from './PublicNav'
import PHLaunchBanner from './PHLaunchBanner'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PHLaunchBanner />
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
          <div className="flex items-center gap-4 flex-wrap">
            <a href="https://www.producthunt.com/posts/socialmate-2"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6154] hover:bg-[#e5564a] text-white text-xs font-semibold rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm2.17 17.33H10.5V8.67h4.67c1.38 0 2.5 1.12 2.5 2.5v3.66c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
              </svg>
              Featured on Product Hunt
            </a>
            <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 SocialMate</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
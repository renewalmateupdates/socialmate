import PublicNav from './PublicNav'
import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <main>{children}</main>
      <footer className="border-t border-gray-100 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-sm font-bold">SocialMate</span>
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
                className="text-xs text-gray-400 hover:text-black transition-all">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-400">© 2025 SocialMate</p>
        </div>
      </footer>
    </div>
  )
}
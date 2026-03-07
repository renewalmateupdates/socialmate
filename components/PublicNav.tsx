'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Features',  href: '/features' },
  { label: 'AI Tools',  href: '/features'  },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Our Story', href: '/story'     },
  { label: 'Blog',      href: '/blog'      },
]

export default function PublicNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'text-black bg-gray-100'
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-all">
            Sign in
          </Link>
          <Link href="/signup"
            className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </div>
    </header>
  )
}
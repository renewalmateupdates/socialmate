'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Features',  href: '/features'  },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Roadmap',   href: '/roadmap'   },
  { label: 'Platforms', href: '#platforms' },
  { label: 'Our Story', href: '/story'     },
  { label: 'Blog',      href: '/blog'      },
]

export default function LandingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
            SocialMate
            <span className="text-[10px] font-semibold bg-pink-500 text-white px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/partners" className="hidden md:block text-sm font-semibold text-amber-500 hover:text-amber-400 transition-all">
            Partners
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all hidden sm:block">
                Sign in
              </Link>
              <Link href="/signup"
                className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
                Get started free →
              </Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all gap-1.5"
            aria-label="Toggle menu">
            <span className={`block w-4 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-4 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
            <Link href="/partners"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
              🤝 Partners Portal
            </Link>
          </div>
          {!isLoggedIn && (
            <div className="pt-1">
              <Link href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

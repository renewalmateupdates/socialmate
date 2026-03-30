'use client'
import { useState } from 'react'
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
  const pathname    = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
            SocialMate
            <span className="text-[10px] font-semibold bg-pink-500 text-white px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link href="/partners" className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-all">
            Partners
          </Link>
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all">
            Sign in
          </Link>
          <Link href="/signup"
            className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>

        {/* Mobile: Sign in + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all px-2 py-1">
            Sign in
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-[5px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Open menu">
            <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full" />
            <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full" />
            <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 z-50 h-screen w-72 max-w-[85vw] bg-white dark:bg-gray-950 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400 text-lg font-bold"
                aria-label="Close menu">
                ✕
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.label} href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <Link href="/partners"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
                  🤝 Partners Portal
                </Link>
              </div>
            </nav>

            {/* Bottom CTAs */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2 flex-shrink-0">
              <Link href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-80 transition-all">
                Get started free →
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

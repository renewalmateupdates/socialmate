'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const AUDIENCES = [
  { label: '🎮 Streamers',      href: '/for/streamers'     },
  { label: '🏢 Agencies',       href: '/for/agencies'      },
  { label: '🏪 Small Business', href: '/for/small-business' },
]

const RESOURCES = [
  { label: '📰 Blog',               href: '/blog'      },
  { label: "📚 Gilgamesh's Guides", href: '/guides'    },
  { label: '❓ FAQ',                href: '/faq'       },
  { label: '📋 Changelog',          href: '/changelog' },
]

type DropdownKey = 'audiences' | 'resources'

export default function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<DropdownKey | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleDropdown = (key: DropdownKey) =>
    setActiveDropdown(prev => (prev === key ? null : key))

  const flatLinkCls = (href: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
        : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
    }`

  const dropdownTriggerCls = (key: DropdownKey, links: { href: string }[]) =>
    `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      activeDropdown === key || links.some(l => pathname.startsWith(l.href))
        ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800'
        : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
    }`

  const chevron = (active: boolean) => (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${active ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const dropdownPanel = (links: { label: string; href: string }[]) => (
    <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-1 z-50">
      {links.map(link => (
        <Link key={link.href} href={link.href}
          onClick={() => setActiveDropdown(null)}
          className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all ${
            pathname.startsWith(link.href)
              ? 'text-black dark:text-white bg-gray-50 dark:bg-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}>
          {link.label}
        </Link>
      ))}
    </div>
  )

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="SocialMate" className="w-10 h-10 rounded-xl" />
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
            SocialMate
            <span className="text-[10px] font-semibold bg-pink-500 text-white px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          <Link href="/features" className={flatLinkCls('/features')}>Features</Link>
          <Link href="/pricing"  className={flatLinkCls('/pricing')}>Pricing</Link>

          <span className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1.5" />

          {/* Audiences dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('audiences')}
              className={dropdownTriggerCls('audiences', AUDIENCES)}>
              Audiences {chevron(activeDropdown === 'audiences')}
            </button>
            {activeDropdown === 'audiences' && dropdownPanel(AUDIENCES)}
          </div>

          <span className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1.5" />

          <Link href="/studio-stax" className={flatLinkCls('/studio-stax')}>Studio Stax</Link>
          <Link href="/soma"        className={flatLinkCls('/soma')}>SOMA</Link>
          <Link href="/enki"        className={flatLinkCls('/enki')}>Enki</Link>
          <Link href="/monetize"    className={flatLinkCls('/monetize')}>Monetize</Link>

          <span className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1.5" />

          {/* Resources dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('resources')}
              className={dropdownTriggerCls('resources', RESOURCES)}>
              Resources {chevron(activeDropdown === 'resources')}
            </button>
            {activeDropdown === 'resources' && dropdownPanel(RESOURCES)}
          </div>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link href="/merch" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-all">
            👕 Merch
          </Link>
          <Link href="/give" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all">
            ❤️ Give
          </Link>
          <Link href="/partners" className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-all">
            Partners
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all">
                Sign in
              </Link>
              <Link href="/signup"
                className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
                Get started free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Sign in/Dashboard + Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {isLoggedIn ? (
            <Link href="/dashboard" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all px-2 py-1">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all px-2 py-1">
              Sign in
            </Link>
          )}
          <button
            onClick={() => setOpen(true)}
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-[5px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
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
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="fixed top-0 right-0 z-50 h-screen w-72 max-w-[85vw] bg-white dark:bg-gray-950 shadow-2xl flex flex-col">

            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400 text-lg font-bold"
                aria-label="Close menu">
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Main links */}
              {[
                { label: 'Features', href: '/features' },
                { label: 'Pricing',  href: '/pricing'  },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  {link.label}
                </Link>
              ))}

              {/* Audiences */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button
                  onClick={() => setMobileExpanded(prev => prev === 'audiences' ? null : 'audiences')}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                  <span>Audiences</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${mobileExpanded === 'audiences' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileExpanded === 'audiences' && AUDIENCES.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname.startsWith(link.href)
                        ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Products */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Products</p>
                {[
                  { label: '🗂️ Studio Stax', href: '/studio-stax' },
                  { label: '⚡ SOMA',         href: '/soma'        },
                  { label: '◆ Enki',          href: '/enki'        },
                  { label: '💜 Monetize',     href: '/monetize'    },
                ].map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname.startsWith(link.href)
                        ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Resources */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button
                  onClick={() => setMobileExpanded(prev => prev === 'resources' ? null : 'resources')}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                  <span>Resources</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${mobileExpanded === 'resources' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileExpanded === 'resources' && RESOURCES.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname.startsWith(link.href)
                        ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Merch / Give / Partners */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <Link href="/merch" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all">
                  👕 Merch
                </Link>
                <Link href="/give" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all">
                  ❤️ SM-Give
                </Link>
                <Link href="/partners" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
                  🤝 Partners Portal
                </Link>
              </div>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2 flex-shrink-0">
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-80 transition-all">
                  Dashboard →
                </Link>
              ) : (
                <Link href="/signup" onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-80 transition-all">
                  Get started free →
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}

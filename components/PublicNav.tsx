'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/contexts/I18nContext'
import { SUPPORTED_LOCALES, localeFromPath } from '@/lib/i18n'

// Locale-prefixed landing pages — switching language navigates to the locale URL
const PUBLIC_LOCALE_PATHS = new Set(['/', '/es', '/de', '/fr', '/pt', '/ru', '/zh', '/ja', '/ko'])

// Audience + resource hrefs — labels are computed inside the component via t()
const AUDIENCE_HREFS = [
  { key: 'audiences_items.streamers',        href: '/for/streamers'         },
  { key: 'audiences_items.agencies',         href: '/for/agencies'          },
  { key: 'audiences_items.small_business',   href: '/for/small-business'    },
  { key: 'audiences_items.tiktok_creators',  href: '/for/tiktok-creators'   },
  { key: 'audiences_items.video_creators',   href: '/for/video-creators'    },
  { key: 'audiences_items.linkedin_creators',href: '/for/linkedin-creators' },
  { key: 'audiences_items.fitness_coaches',  href: '/for/fitness-coaches'   },
  { key: 'audiences_items.musicians',        href: '/for/musicians'         },
  { key: 'audiences_items.restaurants',      href: '/for/restaurants'       },
  { key: 'audiences_items.real_estate',      href: '/for/real-estate'       },
  { key: 'audiences_items.nonprofits',       href: '/for/nonprofits'        },
  { key: 'audiences_items.podcasters',       href: '/for/podcasters'        },
  { key: 'audiences_items.coaches',          href: '/for/coaches'           },
  { key: 'audiences_items.content_creators', href: '/for/content-creators'  },
  { key: 'audiences_items.bloggers',         href: '/for/bloggers'          },
]

const RESOURCE_HREFS = [
  { key: 'resources_items.blog',      href: '/blog'      },
  { key: 'resources_items.guides',    href: '/guides'    },
  { key: 'resources_items.grants',    href: '/grants'    },
  { key: 'resources_items.faq',       href: '/faq'       },
  { key: 'resources_items.changelog', href: '/changelog' },
  { key: 'resources_items.about',     href: '/about'     },
  { key: 'resources_items.press',     href: '/press'     },
]

// Products use brand names — no translation needed for the names themselves
const PRODUCTS = [
  { label: '🗂️ Studio Stax',   href: '/studio-stax' },
  { label: '⚡ SOMA',          href: '/soma'         },
  { label: '◆ Enki',           href: '/enki'         },
  { label: '💜 Monetize',      href: '/monetize'     },
  { label: '🎵 TikTok Studio', href: '/tiktok'       },
  { label: '👕 Merch',         href: '/merch'        },
]

type DropdownKey = 'audiences' | 'products' | 'resources'

export default function PublicNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { locale, setLocale, t } = useI18n()

  // Build translated label arrays inside the component so t() picks up locale
  const AUDIENCES = AUDIENCE_HREFS.map(a => ({ label: t(`nav.${a.key}`), href: a.href }))
  const RESOURCES = RESOURCE_HREFS.map(r => ({ label: t(`nav.${r.key}`), href: r.href }))

  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<DropdownKey | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  }, [])

  const handleSetLocale = (code: string) => {
    setLocale(code as Parameters<typeof setLocale>[0])
    setLangOpen(false)
    // Navigate to the locale landing page when on the root or a locale page
    const isOnLocalePage = PUBLIC_LOCALE_PATHS.has(pathname) || localeFromPath(pathname) !== null
    if (isOnLocalePage) {
      router.push(code === 'en' ? '/' : `/${code}`)
    }
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
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
        ? 'text-ink-high bg-raised'
        : 'text-ink-muted hover:text-ink-high hover:bg-surface'
    }`

  const dropdownTriggerCls = (key: DropdownKey, links: { href: string }[]) =>
    `flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      activeDropdown === key || links.some(l => pathname.startsWith(l.href))
        ? 'text-ink-high bg-raised'
        : 'text-ink-muted hover:text-ink-high hover:bg-surface'
    }`

  const chevron = (active: boolean) => (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${active ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const dropdownPanel = (links: { label: string; href: string }[]) => (
    <div className="absolute top-full left-0 mt-1 w-52 bg-surface border border-edge rounded-xl shadow-2xl shadow-black/50 py-1 z-50">
      {links.map(link => (
        <Link key={link.href} href={link.href}
          onClick={() => setActiveDropdown(null)}
          className={`flex items-center px-4 py-2.5 text-sm font-medium transition-all ${
            pathname.startsWith(link.href)
              ? 'text-ink-high bg-raised'
              : 'text-ink-muted hover:text-ink-high hover:bg-surface'
          }`}>
          {link.label}
        </Link>
      ))}
    </div>
  )

  const currentLocaleFlag = SUPPORTED_LOCALES.find(l => l.code === locale)?.flag ?? '🌐'

  return (
    <header
      className="sticky top-0 z-50 bg-void/90 backdrop-blur-md border-b border-edge"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo + language picker */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt={t('nav.logo_alt')} className="w-10 h-10 rounded-xl" />
            <span className="font-display text-body font-medium tracking-tight text-ink-high hidden sm:inline">
              SocialMate
              <span className="ml-2 font-mono text-eyebrow uppercase text-ink-faint">{t('nav.beta')}</span>
            </span>
          </Link>

          {/* Globe language picker */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(p => !p)}
              className="flex items-center justify-center w-8 h-8 rounded-lg font-mono text-eyebrow text-ink-muted bg-surface border border-edge hover:text-ink-high hover:border-edge-lit transition-colors"
              aria-label="Change language"
              title="Change language"
            >
              {currentLocaleFlag}
            </button>
            {langOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-40 bg-surface border border-edge rounded-xl shadow-2xl shadow-black/50 py-1 z-50 max-h-72 overflow-y-auto">
                {SUPPORTED_LOCALES.map(lang => (
                  <button key={lang.code} onClick={() => handleSetLocale(lang.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all text-left ${
                      locale === lang.code
                        ? 'font-semibold text-ink-high bg-raised'
                        : 'text-ink-muted hover:text-ink-high hover:bg-surface'
                    }`}>
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {locale === lang.code && <span className="ml-auto text-amber text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
          <Link href="/features"   className={flatLinkCls('/features')}>{t('nav.features')}</Link>
          <Link href="/pricing"    className={flatLinkCls('/pricing')}>{t('nav.pricing')}</Link>
          <Link href="/enterprise" className={flatLinkCls('/enterprise')}>{t('nav.enterprise')}</Link>

          <span className="w-px h-4 bg-edge mx-1.5" />

          {/* Audiences dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('audiences')}
              className={dropdownTriggerCls('audiences', AUDIENCES)}>
              {t('nav.audiences')} {chevron(activeDropdown === 'audiences')}
            </button>
            {activeDropdown === 'audiences' && dropdownPanel(AUDIENCES)}
          </div>

          {/* Products dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('products')}
              className={dropdownTriggerCls('products', PRODUCTS)}>
              {t('nav.products_label')} {chevron(activeDropdown === 'products')}
            </button>
            {activeDropdown === 'products' && dropdownPanel(PRODUCTS)}
          </div>

          <span className="w-px h-4 bg-edge mx-1.5" />

          {/* Resources dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('resources')}
              className={dropdownTriggerCls('resources', RESOURCES)}>
              {t('nav.resources')} {chevron(activeDropdown === 'resources')}
            </button>
            {activeDropdown === 'resources' && dropdownPanel(RESOURCES)}
          </div>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
          <Link href="/partners" className="text-small font-medium text-amber hover:text-amber/80 transition-colors">
            {t('nav.partners')}
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="bg-amber text-void text-small font-semibold px-4 py-2 rounded-xl hover:bg-amber/90 transition-colors">
              {t('nav.go_to_dashboard')}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-small text-ink-muted hover:text-ink-high transition-colors">
                {t('nav.sign_in')}
              </Link>
              <Link href="/signup"
                className="bg-amber text-void text-small font-semibold px-4 py-2 rounded-xl hover:bg-amber/90 transition-colors">
                {t('nav.get_started')} →
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Sign in/Dashboard + Hamburger */}
        <div className="flex xl:hidden items-center gap-2">
          {isLoggedIn ? (
            <Link href="/dashboard" className="text-small text-ink-muted hover:text-ink-high transition-colors px-2 py-1">
              {t('nav.go_to_dashboard')}
            </Link>
          ) : (
            <Link href="/login" className="text-small text-ink-muted hover:text-ink-high transition-colors px-2 py-1">
              {t('nav.sign_in')}
            </Link>
          )}
          <button
            onClick={() => setOpen(true)}
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-[5px] hover:bg-surface transition-colors"
            aria-label="Open menu">
            <span className="block w-5 h-0.5 bg-ink-muted rounded-full" />
            <span className="block w-5 h-0.5 bg-ink-muted rounded-full" />
            <span className="block w-5 h-0.5 bg-ink-muted rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="fixed top-0 right-0 z-50 h-screen w-72 max-w-[85vw] bg-void shadow-2xl flex flex-col">

            <div className="flex items-center justify-between px-5 h-16 border-b border-edge flex-shrink-0">
              <span className="font-display text-title text-ink-high">{t('nav.mobile_menu')}</span>
              <button
                onClick={() => setOpen(false)}
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-surface transition-colors text-ink-muted text-lg"
                aria-label="Close menu">
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Main links */}
              {[
                { label: t('nav.features'), href: '/features' },
                { label: t('nav.pricing'),  href: '/pricing'  },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-ink-high bg-raised font-medium'
                      : 'text-ink-muted hover:text-ink-high hover:bg-surface'
                  }`}>
                  {link.label}
                </Link>
              ))}

              {/* Audiences */}
              <div className="pt-2 border-t border-edge mt-2">
                <button
                  onClick={() => setMobileExpanded(prev => prev === 'audiences' ? null : 'audiences')}
                  className="w-full flex items-center justify-between px-4 py-1.5 font-mono text-eyebrow uppercase text-ink-faint hover:text-ink-muted transition-colors">
                  <span>{t('nav.audiences')}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${mobileExpanded === 'audiences' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileExpanded === 'audiences' && AUDIENCES.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname.startsWith(link.href)
                        ? 'text-ink-high bg-raised font-medium'
                        : 'text-ink-muted hover:text-ink-high hover:bg-surface'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Products */}
              <div className="pt-2 border-t border-edge mt-2">
                <p className="px-4 py-1.5 font-mono text-eyebrow uppercase text-ink-faint">{t('nav.products_label')}</p>
                {[
                  { label: '🗂️ Studio Stax',    href: '/studio-stax'    },
                  { label: '⚡ SOMA',           href: '/soma'          },
                  { label: '◆ Enki',            href: '/enki'          },
                  { label: '💜 Monetize',       href: '/monetize'      },
                  { label: '🎵 TikTok Studio',  href: '/tiktok' },
                  { label: '⚡ HERMES',         href: '/hermes'        },
                  { label: '🏢 Enterprise',     href: '/enterprise'    },
                ].map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname.startsWith(link.href)
                        ? 'text-ink-high bg-raised font-medium'
                        : 'text-ink-muted hover:text-ink-high hover:bg-surface'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Resources */}
              <div className="pt-2 border-t border-edge mt-2">
                <button
                  onClick={() => setMobileExpanded(prev => prev === 'resources' ? null : 'resources')}
                  className="w-full flex items-center justify-between px-4 py-1.5 font-mono text-eyebrow uppercase text-ink-faint hover:text-ink-muted transition-colors">
                  <span>{t('nav.resources')}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${mobileExpanded === 'resources' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileExpanded === 'resources' && RESOURCES.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname.startsWith(link.href)
                        ? 'text-ink-high bg-raised font-medium'
                        : 'text-ink-muted hover:text-ink-high hover:bg-surface'
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Merch / Give / Partners */}
              <div className="pt-2 border-t border-edge mt-2">
                <Link href="/merch" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all">
                  {t('nav.mobile_merch')}
                </Link>
                <Link href="/give" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all">
                  {t('nav.mobile_sm_give')}
                </Link>
                <Link href="/partners" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber hover:bg-surface transition-all">
                  🤝 {t('nav.partners')}
                </Link>
              </div>

              {/* Language picker */}
              <div className="pt-2 border-t border-edge mt-2">
                <p className="px-4 py-1.5 font-mono text-eyebrow uppercase text-ink-faint">{t('nav.mobile_language')}</p>
                <div className="grid grid-cols-2 gap-1 px-3 pb-2">
                  {SUPPORTED_LOCALES.map(lang => (
                    <button key={lang.code} onClick={() => { handleSetLocale(lang.code); setOpen(false) }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        locale === lang.code
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold'
                          : 'text-ink-muted hover:bg-surface'
                      }`}>
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="p-4 border-t border-edge space-y-2 flex-shrink-0">
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-amber text-void text-small font-semibold hover:bg-amber/90 transition-colors">
                  {t('nav.go_to_dashboard')}
                </Link>
              ) : (
                <Link href="/signup" onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-amber text-void text-small font-semibold hover:bg-amber/90 transition-colors">
                  {t('nav.get_started')} →
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}

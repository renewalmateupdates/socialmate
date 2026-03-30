import PublicNav from './PublicNav'
import PHLaunchBanner from './PHLaunchBanner'
import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Features',  href: '/features'  },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Roadmap',   href: '/roadmap'   },
  { label: 'Affiliate', href: '/affiliate' },
  { label: 'Referral',  href: '/referral'  },
  { label: 'Our Story', href: '/story'     },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Privacy',   href: '/privacy'   },
  { label: 'Terms',     href: '/terms'     },
]

// Replace these with your actual SocialMate handles/links
const SOCIALS = [
  {
    label: 'X / Twitter',
    href: 'https://x.com/socialmatehq',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Bluesky',
    href: 'https://bsky.app/profile/socialmate.studio',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/socialmatehq',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/socialmate',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.899 19.899 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
]

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PHLaunchBanner />
      <PublicNav />
      <main>{children}</main>

      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">

          {/* Top row: logo + socials */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-xs font-bold">S</div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">SocialMate</span>
              <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">by Gilgamesh Enterprise LLC</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-x-5 gap-y-2 flex-wrap mb-8">
            {FOOTER_LINKS.map(link => (
              <Link key={link.label} href={link.href}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all">
                {link.label}
              </Link>
            ))}
            <Link href="/give" className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-all">
              ❤️ SM-Give
            </Link>
          </nav>

          {/* Bottom row: badges + copyright */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Product Hunt badge */}
              <a href="https://www.producthunt.com/posts/socialmate-2"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6154] hover:bg-[#e5564a] text-white text-xs font-semibold rounded-lg transition-colors">
                <svg width="14" height="14" viewBox="0 0 26 26" fill="none">
                  <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm2.17 17.33H10.5V8.67h4.67c1.38 0 2.5 1.12 2.5 2.5v3.66c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
                </svg>
                Featured on Product Hunt
              </a>

              {/* Fazier badge */}
              <a href="https://fazier.com/launches/socialmate.studio" target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
                  width={120}
                  alt="Fazier badge"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 SocialMate · All rights reserved</p>
          </div>

        </div>
      </footer>
    </div>
  )
}
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PartnersHeader({ email }: { email?: string }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/partners')
  }

  const navLinks = [
    { label: 'Dashboard', href: '/partners/dashboard' },
  ]

  return (
    <header style={{ background: '#111111', borderBottom: '1px solid #222' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link href="/partners/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #F59E0B, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff',
            }}>S</div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#f1f1f1', letterSpacing: '-0.02em' }}>SocialMate</span>
              <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partners</span>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13, fontWeight: 600,
                  color: pathname === link.href ? '#F59E0B' : '#9ca3af',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: pathname === link.href ? 'rgba(245,158,11,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {email && (
              <span style={{ fontSize: 12, color: '#6b7280' }}>{email}</span>
            )}
            <button
              onClick={handleSignOut}
              style={{
                fontSize: 12, fontWeight: 600, color: '#9ca3af',
                background: 'transparent', border: '1px solid #333',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}

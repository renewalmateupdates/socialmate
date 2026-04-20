import Link from 'next/link'
import { MerchProductCard } from './MerchProductCard'
import { MerchWaitlistForm } from './MerchWaitlistForm'

const amber   = '#F59E0B'
const dark    = '#0a0a0a'
const surface = '#111111'
const border  = '#222222'
const muted   = '#6b7280'

const HOW_IT_WORKS = [
  { step: '01', title: 'Pick your item', desc: 'Choose from tees, hoodies, mugs, and more. Every item ships globally through our print partner.' },
  { step: '02', title: 'Check out securely', desc: 'Pay via Stripe. Enter your shipping address at checkout — we handle the rest.' },
  { step: '03', title: 'We fulfill globally', desc: 'Orders are printed on demand and shipped worldwide. No inventory, no waste — just your merch, made fresh.' },
  { step: '04', title: '75% of profit → SM-Give', desc: "Three quarters of every order's profit goes directly to school supplies, baby essentials, and homeless care packages." },
]

async function getProducts() {
  try {
    const shopId = process.env.PRINTIFY_SHOP_ID || '27238436'
    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

export default async function MerchPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams
  const products = await getProducts()
  const orderSuccess = params.success === 'true'

  return (
    <div style={{ minHeight: '100vh', background: dark, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${border}`,
        position: 'sticky', top: 0, background: dark, zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>S</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>SocialMate</span>
            <span style={{
              fontSize: 10, color: '#000', fontWeight: 800,
              background: amber, padding: '2px 7px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Merch</span>
          </div>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← Back to SocialMate</Link>
      </header>

      {/* Order success banner */}
      {orderSuccess && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.3)',
          padding: '16px 24px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>
            🎉 Order confirmed! Your merch is being printed and will ship soon. Check your email for tracking.
          </span>
        </div>
      )}

      {/* Hero */}
      <section style={{ padding: '72px 24px 64px', textAlign: 'center', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 28,
        }}>
          <span style={{ fontSize: 14 }}>👕</span>
          <span style={{ color: amber, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Store Open · Creator Merch · Powered by Purpose
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 60px)', fontWeight: 900, color: '#f1f1f1',
          letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 20px',
        }}>
          Wear the mission.
        </h1>

        <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.75, margin: '0 auto 36px', maxWidth: 580 }}>
          Power to the people — on every item. Shirts are live and shipping now. 75% of the profit goes to
          school supplies, baby essentials, and homeless care packages. Merch that means something.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          {[
            { value: '75%', label: 'of profit to SM-Give' },
            { value: '🌍', label: 'Global fulfillment' },
            { value: '🖨️', label: 'Print on demand' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 12, padding: '12px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: amber, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', textAlign: 'center', margin: '0 0 36px', letterSpacing: '-0.02em' }}>
          Shop Now
        </h2>

        {products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {products.map((product: any) => (
              <MerchProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: muted, padding: '40px 0' }}>
            <p style={{ fontSize: 15 }}>Products loading — check back shortly.</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', textAlign: 'center', margin: '0 0 36px', letterSpacing: '-0.02em' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {HOW_IT_WORKS.map(item => (
            <div key={item.step} style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 16, padding: '22px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${amber}, transparent)`, opacity: 0.5,
              }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: amber, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Step {item.step}
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb', margin: '0 0 8px', lineHeight: 1.4 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creator differentiator */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <div style={{
          background: `linear-gradient(135deg, rgba(245,158,11,0.06), rgba(139,92,246,0.04))`,
          border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 24, padding: '48px 40px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 10, padding: '5px 12px', alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: amber, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Coming — Creator Edition
              </span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f1f1', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Want your handle on it?
            </h2>
            <p style={{ fontSize: 15, color: '#9ca3af', margin: 0, lineHeight: 1.8 }}>
              Upcoming creator edition merch lets you put your <strong style={{ color: '#e5e7eb' }}>@handle or logo</strong> alongside
              the <strong style={{ color: '#10B981' }}>SM-Give mark</strong> — so every time someone wears your merch,
              they&apos;re also advertising that you give back.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {[
                'Your @handle or logo printed on every item',
                'SM-Give charity mark co-branded on every piece',
                '75% of profit goes to real people — kids, parents, people experiencing homelessness',
                'Global print-on-demand — no inventory required',
                'Available to all SocialMate users',
              ].map(point => (
                <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: amber, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.55 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist for new drops */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 80px', width: '100%' }}>
        <div style={{
          background: surface, border: `1px solid ${border}`,
          borderRadius: 24, padding: '48px 40px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 36 }}>🚀</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '16px 0 10px', letterSpacing: '-0.02em' }}>
            Get notified on new drops
          </h2>
          <p style={{ fontSize: 15, color: muted, margin: '0 auto 28px', maxWidth: 440, lineHeight: 1.7 }}>
            More drops incoming — hoodies, mugs, and creator edition. Drop your email to be first in line.
          </p>
          <MerchWaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
          <Link href="/give" style={{ fontSize: 13, color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
            ❤️ SM-Give — How we give back
          </Link>
          <Link href="/signup" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>Get started free</Link>
          <Link href="/affiliates" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>Affiliate program</Link>
          <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← SocialMate home</Link>
        </div>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>© 2026 SocialMate · Gilgamesh Enterprise LLC</p>
      </footer>

    </div>
  )
}

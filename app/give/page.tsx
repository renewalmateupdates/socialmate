import Link from 'next/link'

// Amber/warm design tokens
const amber   = '#F59E0B'
const amberDim = '#D97706'
const dark    = '#0a0a0a'
const surface = '#111111'
const surface2 = '#161616'
const border  = '#222222'
const muted   = '#6b7280'

export const metadata = {
  title: 'SM-Give · SocialMate',
  description: 'SocialMate gives back. Every unclaimed affiliate contribution goes toward school supplies, baby essentials, and homeless care packages.',
}

const pillars = [
  {
    emoji: '🎒',
    title: 'School Supply Bookbags',
    subtitle: 'For underprivileged kids heading back to school',
    description:
      'Every child deserves to walk into their first day of school ready to learn — not worried about whether they have the tools they need. We pack quality backpacks with real school supplies: notebooks, pencils, folders, crayons, a ruler, scissors, and more. No cheap dollar-store fillers. We send these to underprivileged schools and community programs so kids can focus on what matters.',
    color: '#3B82F6',
    colorDim: 'rgba(59,130,246,0.12)',
    colorBorder: 'rgba(59,130,246,0.25)',
    impact: 'Every bag serves one child for a full school year',
  },
  {
    emoji: '👶',
    title: 'Diaper Bags for Struggling Parents',
    subtitle: 'Priority given to single parents',
    description:
      'A new baby is overwhelming — and for struggling or single parents, it can feel impossible. We put together fully loaded diaper bags with quality essentials: diapers, wipes, rash cream, a few outfits (real clothes, not cheap onesies), swaddle blankets, pacifiers, and a simple care guide. Nobody should have to worry about their newborn going without. We prioritize single-parent households and families referred through local support programs.',
    color: '#EC4899',
    colorDim: 'rgba(236,72,153,0.12)',
    colorBorder: 'rgba(236,72,153,0.25)',
    impact: 'Each bag supports one family through the first weeks',
  },
  {
    emoji: '🏠',
    title: 'Homeless Care Packages',
    subtitle: 'Dignity in every package',
    description:
      'A care package isn\'t just supplies — it\'s a reminder that someone sees you. Our packages include hygiene essentials (deodorant, toothbrush, toothpaste, soap, feminine products where needed), socks, a warm beanie, snacks, and a handwritten note. We partner with local shelters and outreach organizations to distribute directly to individuals experiencing homelessness. Every package is assembled with intention.',
    color: '#10B981',
    colorDim: 'rgba(16,185,129,0.12)',
    colorBorder: 'rgba(16,185,129,0.25)',
    impact: 'Each package serves one person, immediately',
  },
]

export default function GivePage() {
  return (
    <div style={{ minHeight: '100vh', background: dark, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${border}`,
        position: 'sticky', top: 0, background: dark, zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>S</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>SocialMate</span>
            <span style={{
              fontSize: 10, color: '#000', fontWeight: 800,
              background: amber, padding: '2px 7px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Give</span>
          </div>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← Back to SocialMate</Link>
      </header>

      {/* Hero */}
      <section style={{ padding: '72px 24px 56px', textAlign: 'center', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 20, padding: '6px 16px', marginBottom: 28,
        }}>
          <span style={{ fontSize: 14 }}>❤️</span>
          <span style={{ color: amber, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>SocialMate Gives Back</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#f1f1f1',
          letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px',
        }}>
          Built to grow.<br />
          <span style={{ color: amber }}>Committed to give.</span>
        </h1>

        <p style={{
          fontSize: 18, color: '#9ca3af', lineHeight: 1.7,
          margin: '0 auto 40px', maxWidth: 600,
        }}>
          SocialMate isn&apos;t just a tool — it&apos;s a company built on purpose. A portion of every unclaimed affiliate contribution goes directly to three causes close to our hearts: kids heading to school, parents starting over, and people who need to feel seen.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {['🎒 School Supplies', '👶 Baby Essentials', '🏠 Homeless Packages'].map(tag => (
            <span key={tag} style={{
              padding: '8px 16px',
              background: surface2, border: `1px solid ${border}`,
              borderRadius: 20, fontSize: 13, fontWeight: 600, color: '#d1d5db',
            }}>{tag}</span>
          ))}
        </div>
      </section>

      {/* Charity Pillars */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {pillars.map((pillar) => (
            <div key={pillar.title} style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 20, padding: '32px 36px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${pillar.color}, transparent)`,
                opacity: 0.6,
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: pillar.colorDim, border: `1px solid ${pillar.colorBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, flexShrink: 0,
                }}>
                  {pillar.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ marginBottom: 4 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                      {pillar.title}
                    </h2>
                    <p style={{ fontSize: 13, color: muted, margin: 0, fontStyle: 'italic' }}>
                      {pillar.subtitle}
                    </p>
                  </div>

                  <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.75, margin: '14px 0 18px' }}>
                    {pillar.description}
                  </p>

                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: pillar.colorDim, border: `1px solid ${pillar.colorBorder}`,
                    borderRadius: 8, padding: '6px 12px',
                  }}>
                    <span style={{ fontSize: 11, color: pillar.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Impact →
                    </span>
                    <span style={{ fontSize: 12, color: '#d1d5db' }}>{pillar.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Funds Work */}
      <section style={{
        maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%',
      }}>
        <div style={{
          background: 'rgba(245,158,11,0.05)', border: `1px solid rgba(245,158,11,0.2)`,
          borderRadius: 24, padding: '48px 40px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Where the money actually goes
            </h2>
            <p style={{ fontSize: 15, color: '#9ca3af', margin: 0, lineHeight: 1.6, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
              We believe in transparency. Here&apos;s exactly how unclaimed affiliate proceeds flow through SM-Give.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
            {[
              {
                step: '01',
                label: 'Affiliate earns a commission',
                detail: 'Every referral is tracked and credited to the referring affiliate partner.',
              },
              {
                step: '02',
                label: 'Payout deadline passes',
                detail: 'Affiliates must file the necessary claim form before the payout deadline each cycle.',
              },
              {
                step: '03',
                label: 'Unclaimed proceeds redirected',
                detail: 'Any unclaimed balance — approximately 75% of it — is allocated directly to SM-Give.',
              },
              {
                step: '04',
                label: 'Packages assembled & distributed',
                detail: 'We purchase supplies and distribute through local shelters, schools, and community programs.',
              },
            ].map(item => (
              <div key={item.step} style={{
                background: surface, border: `1px solid ${border}`,
                borderRadius: 14, padding: '20px 22px',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: amber,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
                }}>Step {item.step}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#e5e7eb', margin: '0 0 8px', lineHeight: 1.4 }}>{item.label}</p>
                <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.6 }}>{item.detail}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: surface, border: `1px solid rgba(245,158,11,0.3)`,
            borderRadius: 14, padding: '18px 22px',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💡</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f1f1', margin: '0 0 6px' }}>
                Why 75%?
              </p>
              <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.7 }}>
                The remaining 25% of unclaimed proceeds is retained to cover operational costs — hosting, payment processing, and program administration. We believe in being honest about what it takes to run this sustainably. The other 75% goes exactly where we say it does: directly to supplies and distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Why we do this
        </h2>
        <p style={{
          fontSize: 16, color: '#9ca3af', lineHeight: 1.8,
          maxWidth: 620, margin: '0 auto 32px',
        }}>
          SocialMate was built by someone who grew up understanding that not everyone starts at the same line. We didn&apos;t build this company to extract value — we built it to create it. For creators, for businesses, and for the communities around us.
        </p>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
          SM-Give isn&apos;t a marketing tactic. It&apos;s a commitment. As SocialMate grows, so does our capacity to give. Every subscriber, every referral, and every affiliate who uses this platform is part of something bigger than a social media scheduler.
        </p>
      </section>

      {/* Bottom CTA */}
      <section style={{
        maxWidth: 880, margin: '0 auto 72px', padding: '0 24px', width: '100%',
      }}>
        <div style={{
          background: `linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04))`,
          border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 20,
          padding: '48px 40px', textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Want to contribute directly?
          </h2>
          <p style={{ fontSize: 15, color: muted, margin: '0 auto 28px', maxWidth: 480, lineHeight: 1.7 }}>
            The best way to support SM-Give right now is to use SocialMate, share it with others, or become an affiliate partner. Every subscription and referral fuels both the product and the giving.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 12,
              background: amber, color: '#000',
              fontSize: 14, fontWeight: 800, textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}>
              Get Started Free →
            </Link>
            <Link href="/affiliate" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 12,
              background: surface, border: `1px solid ${border}`,
              color: '#d1d5db', fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              Become an Affiliate
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px', borderTop: `1px solid ${border}`,
        textAlign: 'center', marginTop: 'auto',
      }}>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
          © {new Date().getFullYear()} Gilgamesh Enterprise LLC · SocialMate · SM-Give Initiative
        </p>
      </footer>

    </div>
  )
}

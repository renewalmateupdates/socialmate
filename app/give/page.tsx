'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import GiveLiveCounter from './GiveLiveCounter'
import GiveDonate from './GiveDonate'
import { useI18n } from '@/contexts/I18nContext'

// Amber/warm design tokens
const amber   = '#F59E0B'
const amberDim = '#D97706'
const dark    = '#0a0a0a'
const surface = '#111111'
const surface2 = '#161616'
const border  = '#222222'
const muted   = '#6b7280'

export default function GivePage() {
  const { t } = useI18n()

  const pillars = [
    {
      emoji: '🎒',
      title: t('give.pillar1_title'),
      subtitle: t('give.pillar1_subtitle'),
      description: t('give.pillar1_desc'),
      color: '#3B82F6',
      colorDim: 'rgba(59,130,246,0.12)',
      colorBorder: 'rgba(59,130,246,0.25)',
      impact: t('give.pillar1_impact'),
    },
    {
      emoji: '👶',
      title: t('give.pillar2_title'),
      subtitle: t('give.pillar2_subtitle'),
      description: t('give.pillar2_desc'),
      color: '#EC4899',
      colorDim: 'rgba(236,72,153,0.12)',
      colorBorder: 'rgba(236,72,153,0.25)',
      impact: t('give.pillar2_impact'),
    },
    {
      emoji: '🏠',
      title: t('give.pillar3_title'),
      subtitle: t('give.pillar3_subtitle'),
      description: t('give.pillar3_desc'),
      color: '#10B981',
      colorDim: 'rgba(16,185,129,0.12)',
      colorBorder: 'rgba(16,185,129,0.25)',
      impact: t('give.pillar3_impact'),
    },
  ]
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
        <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← {t('give.back_link')}</Link>
      </header>

      {/* Hero */}
      <section style={{ padding: '72px 24px 56px', textAlign: 'center', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`,
          borderRadius: 20, padding: '6px 16px', marginBottom: 28,
        }}>
          <span style={{ fontSize: 14 }}>❤️</span>
          <span style={{ color: amber, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('give.badge')}</span>
        </div>

        <GiveLiveCounter />

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#f1f1f1',
          letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px',
        }}>
          {t('give.hero_title_line1')}<br />
          <span style={{ color: amber }}>{t('give.hero_title_line2')}</span>
        </h1>

        <p style={{
          fontSize: 18, color: '#9ca3af', lineHeight: 1.7,
          margin: '0 auto 28px', maxWidth: 600,
        }}>
          {t('give.hero_desc')}
        </p>

        {/* Give stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { value: '2%', label: t('give.stat1_label'), sub: t('give.stat1_sub') },
            { value: '50%', label: t('give.stat2_label'), sub: t('give.stat2_sub') },
            { value: '75%', label: t('give.stat3_label'), sub: t('give.stat3_sub') },
          ].map(stat => (
            <div key={stat.value} style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 14, padding: '16px 24px', textAlign: 'center', minWidth: 140,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: amber, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {[t('give.tag1'), t('give.tag2'), t('give.tag3')].map(tag => (
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
                      {t('give.impact_label')} →
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
              {t('give.flow_title')}
            </h2>
            <p style={{ fontSize: 15, color: '#9ca3af', margin: 0, lineHeight: 1.6, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('give.flow_desc')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
            {[
              {
                step: '01',
                label: t('give.flow_step1_label'),
                detail: t('give.flow_step1_detail'),
              },
              {
                step: '02',
                label: t('give.flow_step2_label'),
                detail: t('give.flow_step2_detail'),
              },
              {
                step: '03',
                label: t('give.flow_step3_label'),
                detail: t('give.flow_step3_detail'),
              },
              {
                step: '04',
                label: t('give.flow_step4_label'),
                detail: t('give.flow_step4_detail'),
              },
            ].map(item => (
              <div key={item.step} style={{
                background: surface, border: `1px solid ${border}`,
                borderRadius: 14, padding: '20px 22px',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: amber,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
                }}>{t('give.step_label')} {item.step}</div>
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
                {t('give.why_75_title')}
              </p>
              <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.7 }}>
                {t('give.why_75_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          {t('give.why_title')}
        </h2>
        <p style={{
          fontSize: 16, color: '#9ca3af', lineHeight: 1.8,
          maxWidth: 620, margin: '0 auto 32px',
        }}>
          {t('give.why_desc1')}
        </p>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
          {t('give.why_desc2')}
        </p>
      </section>

      {/* Donate directly */}
      <section style={{ maxWidth: 880, margin: '0 auto 72px', padding: '0 24px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

          {/* Donate now */}
          <div style={{
            background: 'rgba(245,158,11,0.05)', border: `1px solid rgba(245,158,11,0.2)`,
            borderRadius: 20, padding: '36px 28px',
          }}>
            <Suspense fallback={<div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>Loading…</div>}>
              <GiveDonate />
            </Suspense>
          </div>

          {/* Use SocialMate */}
          <div style={{
            background: 'rgba(245,158,11,0.03)', border: `1px solid ${border}`,
            borderRadius: 20, padding: '36px 28px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👑</div>
            <p style={{ fontSize: 11, fontWeight: 700, color: amber, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t('give.support_badge')}
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>
              {t('give.support_title')}
            </h3>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, marginBottom: 24 }}>
              {t('give.support_desc')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 12,
                background: amber, color: '#000',
                fontSize: 14, fontWeight: 800, textDecoration: 'none',
              }}>
                {t('give.get_started_cta')}
              </Link>
              <Link href="/affiliates" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 12,
                background: surface, border: `1px solid ${border}`,
                color: '#d1d5db', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              }}>
                {t('give.become_affiliate_cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

    </div>
  )
}

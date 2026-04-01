'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const gold   = '#F59E0B'
const purple = '#7C3AED'
const dark   = '#0a0a0a'
const border = '#222222'
const muted  = '#6b7280'

const PLATFORMS = ['Twitter/X','Instagram','TikTok','YouTube','LinkedIn','Facebook','Pinterest','Bluesky','Mastodon','Discord','Telegram','Newsletter']
const CONTENT_TYPES = ['Creator / Influencer','Blogger / Newsletter','Podcaster','Social Media Manager','Marketing Agency','Community Builder','Other']
const AUDIENCE_SIZES = ['Under 500','500 – 2,000','2,000 – 10,000','10,000 – 50,000','50,000+']
const MONTHLY_REACHES = ['Under 1,000','1,000 – 5,000','5,000 – 20,000','20,000 – 100,000','100,000+']
const ENGAGEMENT_RATES = ['Under 1%','1 – 3%','3 – 6%','6 – 10%','10%+']

type PageState = 'loading' | 'not_logged_in' | 'check_plan' | 'upgrade_required' | 'form' | 'pending' | 'rejected_cooldown' | 'active'

export default function AccessDeniedPage() {
  const [state, setState] = useState<PageState>('loading')
  const [affiliateData, setAffiliateData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [socialHandles, setSocialHandles] = useState('')
  const [contentType, setContentType] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [audienceSize, setAudienceSize] = useState('')
  const [monthlyReach, setMonthlyReach] = useState('')
  const [engagementRate, setEngagementRate] = useState('')
  const [promotionPlan, setPromotionPlan] = useState('')
  const [whyGoodFit, setWhyGoodFit] = useState('')

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setState('not_logged_in'); return }

      // Load affiliate status
      const res = await fetch('/api/affiliate/stats')
      if (res.ok) {
        const json = await res.json()
        const aff = json.affiliate

        if (aff) {
          setAffiliateData(aff)
          if (aff.status === 'active') { setState('active'); return }
          if (aff.status === 'pending_review') { setState('pending'); return }
          if (aff.status === 'rejected') {
            if (aff.can_reapply_at && new Date(aff.can_reapply_at) > new Date()) {
              setState('rejected_cooldown'); return
            }
            // Can reapply — fall through to form
          }
        }
      }

      setState('check_plan')

      // Check if paid subscriber via user_settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!settings || settings.plan === 'free') {
        setState('upgrade_required')
      } else {
        setState('form')
      }
    }
    check()
  }, [])

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !promotionPlan.trim() || !whyGoodFit.trim()) {
      setSubmitError('Please fill out all required fields.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/affiliate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:       fullName.trim(),
          website_url:     websiteUrl.trim() || null,
          social_handles:  socialHandles.trim() || null,
          content_type:    contentType || null,
          platforms:       selectedPlatforms,
          audience_size:   audienceSize || null,
          monthly_reach:   monthlyReach || null,
          engagement_rate: engagementRate || null,
          promotion_plan:  promotionPlan.trim(),
          why_good_fit:    whyGoodFit.trim(),
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSubmitted(true)
      } else {
        setSubmitError(json.error || 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: '#0f0f0f', border: `1px solid ${border}`,
    color: '#f1f1f1', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const sel: React.CSSProperties = { ...inp, appearance: 'none', cursor: 'pointer' }
  const label: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: muted,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
  }
  const required: React.CSSProperties = { color: gold, marginLeft: 3 }

  // ── States ──

  if (state === 'loading' || state === 'check_plan') {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (state === 'not_logged_in') {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🤝</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>Become a SocialMate Affiliate</h1>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 32 }}>
            Earn 30–40% recurring commission on every referral. Sign in to apply.
          </p>
          <Link href="/partners" style={{
            display: 'block', padding: '12px 24px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${gold}, ${purple})`,
            color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center',
          }}>Sign in to apply →</Link>
        </div>
      </div>
    )
  }

  if (state === 'upgrade_required') {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>💳</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>Paid plan required</h1>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 24 }}>
            SocialMate affiliates must be active paid subscribers. We want our affiliates to genuinely know and use the product — that's what makes for real, trustworthy recommendations.
          </p>
          <div style={{ background: '#111', border: `1px solid ${border}`, borderRadius: 14, padding: 24, marginBottom: 32, textAlign: 'left' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>What affiliates earn</p>
            {['30% recurring on every referral subscription','40% at 100+ active referrals','10–15% on credit pack purchases via your promo code','Unique single-use promo codes that auto-regenerate'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                <span style={{ color: gold, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/settings?tab=Plan" style={{
            display: 'block', padding: '12px 24px', borderRadius: 10,
            background: `linear-gradient(135deg, ${gold}, ${purple})`,
            color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', marginBottom: 12,
          }}>Upgrade to Pro →</Link>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/partners')}
            style={{ padding: '11px 24px', borderRadius: 10, background: 'transparent', border: `1px solid ${border}`, color: muted, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  if (state === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>⏳</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>Application under review</h1>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 24 }}>
            We review applications manually and typically respond within 3 business days. You'll get an email either way.
          </p>
          <Link href="/dashboard" style={{ display: 'block', padding: '12px 24px', borderRadius: 10, background: '#1a1a1a', border: `1px solid ${border}`, color: '#f1f1f1', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'rejected_cooldown' && affiliateData?.can_reapply_at) {
    const reapplyDate = new Date(affiliateData.can_reapply_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>📅</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>Come back soon</h1>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 24 }}>
            Your previous application wasn't approved. You can reapply on <strong style={{ color: gold }}>{reapplyDate}</strong>.
          </p>
          {affiliateData?.rejection_reason && (
            <div style={{ background: '#1a1a1a', border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Feedback from your review</div>
              <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6 }}>{affiliateData.rejection_reason}</div>
            </div>
          )}
          <Link href="/dashboard" style={{ display: 'block', padding: '12px 24px', borderRadius: 10, background: '#1a1a1a', border: `1px solid ${border}`, color: '#f1f1f1', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'active') {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', marginBottom: 12 }}>You're already an affiliate!</h1>
          <Link href="/partners/dashboard" style={{ color: gold, fontSize: 14, textDecoration: 'none', fontWeight: 700 }}>Go to your dashboard →</Link>
        </div>
      </div>
    )
  }

  // ── Form state ──
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>Application submitted!</h1>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 24 }}>
            We review every application manually and will get back to you within 3 business days. Keep an eye on your email.
          </p>
          <Link href="/dashboard" style={{ display: 'block', padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${gold}, ${purple})`, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${border}` }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>S</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>SocialMate</span>
            <span style={{ fontSize: 10, color: '#000', fontWeight: 800, background: gold, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Partners</span>
          </div>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← Dashboard</Link>
      </header>

      <main style={{ flex: 1, padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 20, padding: '6px 14px', marginBottom: 16 }}>
              <span style={{ color: gold, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Affiliate Program</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f1f1', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Apply to become a partner</h1>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.6, margin: 0 }}>
              Earn 30–40% recurring commission + 10–15% on credit packs. Applications reviewed within 3 business days.
            </p>
          </div>

          {/* Earnings preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Base commission', value: '30% recurring' },
              { label: '100+ referrals', value: '40% recurring' },
              { label: 'Credit packs (lower)', value: '10% flat' },
              { label: 'Credit packs (higher)', value: '15% flat' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#111', border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: gold }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: '#111111', border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <label style={label}>Full Name<span style={required}>*</span></label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inp} />
              </div>

              <div>
                <label style={label}>Content Type<span style={required}>*</span></label>
                <select value={contentType} onChange={e => setContentType(e.target.value)} style={sel}>
                  <option value="">Select content type...</option>
                  {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={label}>Website or Blog URL</label>
                <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" style={inp} />
              </div>

              <div>
                <label style={label}>Social Handles</label>
                <input type="text" value={socialHandles} onChange={e => setSocialHandles(e.target.value)} placeholder="@handle on Instagram, @handle on X, etc." style={inp} />
              </div>

              <div>
                <label style={label}>Platforms you're active on</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {PLATFORMS.map(p => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: `1px solid ${selectedPlatforms.includes(p) ? gold : border}`,
                        background: selectedPlatforms.includes(p) ? 'rgba(245,158,11,0.12)' : 'transparent',
                        color: selectedPlatforms.includes(p) ? gold : muted,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={label}>Audience / Follower Count</label>
                  <select value={audienceSize} onChange={e => setAudienceSize(e.target.value)} style={sel}>
                    <option value="">Select range...</option>
                    {AUDIENCE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Monthly Reach</label>
                  <select value={monthlyReach} onChange={e => setMonthlyReach(e.target.value)} style={sel}>
                    <option value="">Select range...</option>
                    {MONTHLY_REACHES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={label}>Avg. Engagement Rate</label>
                <select value={engagementRate} onChange={e => setEngagementRate(e.target.value)} style={sel}>
                  <option value="">Select range...</option>
                  {ENGAGEMENT_RATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={label}>How will you promote SocialMate?<span style={required}>*</span></label>
                <textarea value={promotionPlan} onChange={e => setPromotionPlan(e.target.value)}
                  placeholder="Describe your content strategy — where you'll share, what kind of content you'll create, how you'll introduce SocialMate to your audience..."
                  rows={4} style={{ ...inp, resize: 'vertical' as const }} />
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{promotionPlan.length} chars (100+ recommended)</div>
              </div>

              <div>
                <label style={label}>Why are you a good fit?<span style={required}>*</span></label>
                <textarea value={whyGoodFit} onChange={e => setWhyGoodFit(e.target.value)}
                  placeholder="Tell us about your audience and why they'd benefit from SocialMate. What makes you the right person to represent this product?"
                  rows={3} style={{ ...inp, resize: 'vertical' as const }} />
              </div>

              {submitError && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={submitting}
                style={{
                  padding: '13px 20px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${gold}, ${purple})`,
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  opacity: submitting ? 0.6 : 1, fontFamily: 'inherit',
                }}>
                {submitting ? 'Submitting...' : 'Submit Application →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#374151', margin: 0 }}>
                You must be an active paid subscriber to apply. Applications reviewed within 3 business days.
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer style={{ padding: '24px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>© {new Date().getFullYear()} Gilgamesh Enterprise LLC · SocialMate Partner Program</p>
      </footer>
    </div>
  )
}

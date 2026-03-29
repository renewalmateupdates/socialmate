// ─── Shared styles ───────────────────────────────────────────────────────────

const BASE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 0;
  background: #0a0a0a;
  color: #f1f1f1;
`

const HEADER_HTML = `
  <div style="background: linear-gradient(135deg, #F59E0B, #7C3AED); padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #fff;">S</div>
      <span style="font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">SocialMate</span>
      <span style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-left: 4px;">Partners</span>
    </div>
  </div>
`

function wrapper(content: string) {
  return `
    <div style="${BASE}">
      <div style="background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #222;">
        ${HEADER_HTML}
        <div style="padding: 32px;">
          ${content}
        </div>
        <div style="border-top: 1px solid #222; padding: 20px 32px; text-align: center;">
          <p style="font-size: 11px; color: #374151; margin: 0;">
            © ${new Date().getFullYear()} Gilgamesh Enterprise LLC · SocialMate Partner Program ·
            <a href="mailto:hello@socialmate.studio" style="color: #6b7280; text-decoration: none;">hello@socialmate.studio</a>
          </p>
        </div>
      </div>
    </div>
  `
}

function heading(text: string) {
  return `<h2 style="font-size: 20px; font-weight: 800; color: #f1f1f1; margin: 0 0 12px; letter-spacing: -0.02em;">${text}</h2>`
}

function p(text: string) {
  return `<p style="font-size: 14px; color: #9ca3af; line-height: 1.7; margin: 0 0 16px;">${text}</p>`
}

function btn(url: string, label: string) {
  return `
    <a href="${url}" style="display: inline-block; padding: 13px 28px; border-radius: 10px; background: linear-gradient(135deg, #F59E0B, #7C3AED); color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: -0.01em;">
      ${label}
    </a>
  `
}

function card(content: string, style = '') {
  return `
    <div style="background: #0a0a0a; border: 1px solid #222; border-radius: 10px; padding: 18px 20px; margin: 16px 0; ${style}">
      ${content}
    </div>
  `
}

// ─── 1. Invite email ──────────────────────────────────────────────────────────

export function affiliateInviteEmail({
  email,
  acceptUrl,
  declineUrl,
  expiresAt,
}: {
  email: string
  acceptUrl: string
  declineUrl: string
  expiresAt: string
}) {
  const expiry = new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return wrapper(`
    ${heading("You're invited to the SocialMate Partner Program")}
    ${p(`Hi there, you've been personally selected to join the SocialMate Affiliate Partner Program. Earn 30–40% recurring commissions on every subscriber you refer.`)}
    ${card(`
      <div style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Partner benefits</div>
      <div style="font-size: 13px; color: #d1d5db; line-height: 2;">
        💰 &nbsp;30% recurring commission on subscriptions<br/>
        🚀 &nbsp;40% when you hit 100+ active referrals<br/>
        🎟️ &nbsp;Unique promo codes for your audience (20% & 15% off)<br/>
        💳 &nbsp;Weekly payouts via Stripe Connect<br/>
        📊 &nbsp;Real-time dashboard with conversion tracking
      </div>
    `)}
    <div style="margin: 24px 0;">
      ${btn(acceptUrl, 'Accept Invitation →')}
      <a href="${declineUrl}" style="display: inline-block; margin-left: 12px; padding: 13px 20px; border-radius: 10px; border: 1px solid #333; color: #6b7280; font-size: 13px; font-weight: 600; text-decoration: none;">
        No thanks
      </a>
    </div>
    ${p(`This invite expires on <strong style="color: #F59E0B;">${expiry}</strong>. If you did not expect this email, you can safely ignore it.`)}
  `)
}

// ─── 2. Accept confirmation ───────────────────────────────────────────────────

export function affiliateWelcomeEmail({
  email,
  referralLink,
}: {
  email: string
  referralLink: string
}) {
  return wrapper(`
    ${heading("Welcome to the SocialMate Partner Program! 🎉")}
    ${p(`You're officially an affiliate partner. Your account is active and you're ready to start earning 30% recurring commission on every subscription you refer.`)}
    ${card(`
      <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Your Referral Link</div>
      <div style="font-family: monospace; font-size: 14px; color: #F59E0B; word-break: break-all;">${referralLink}</div>
    `)}
    ${card(`
      <div style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">Quick reminders</div>
      <div style="font-size: 13px; color: #9ca3af; line-height: 1.9;">
        ⏳ &nbsp;New earnings have a 60-day hold before payout<br/>
        💵 &nbsp;Minimum $25 balance to request payout<br/>
        📋 &nbsp;W-9 required at $600 lifetime earnings (we'll email you)<br/>
        📈 &nbsp;Hit 100 referrals to unlock <strong style="color: #F59E0B;">40% commission</strong>
      </div>
    `)}
    <div style="margin-top: 24px;">
      ${btn('https://socialmate.studio/partners/dashboard', 'Go to Dashboard →')}
    </div>
  `)
}

// ─── 3. Decline "bummer" email ────────────────────────────────────────────────

export function affiliateDeclineBummerEmail({ email }: { email: string }) {
  return wrapper(`
    ${heading("No worries — door's always open 🤝")}
    ${p(`You declined the SocialMate Partner Program invite — totally understood! Life gets busy.`)}
    ${p(`If you ever change your mind, just reply to this email or reach out at <a href="mailto:hello@socialmate.studio" style="color: #F59E0B; text-decoration: none;">hello@socialmate.studio</a> and we'll get you set up.`)}
    ${p(`In the meantime, you can still use SocialMate for free to schedule posts, manage your social channels, and use the AI content tools.`)}
    <div style="margin-top: 24px;">
      ${btn('https://socialmate.studio', 'Check out SocialMate →')}
    </div>
  `)
}

// ─── 4. W-9 alert emails (days 1, 14, 30, 45, 55, 59) ───────────────────────

export function w9AlertEmail({
  email,
  dayNumber,
  deadlineDate,
  withheldAmountCents,
}: {
  email: string
  dayNumber: number
  deadlineDate: string
  withheldAmountCents: number
}) {
  const deadline    = new Date(deadlineDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const amount      = `$${(withheldAmountCents / 100).toFixed(2)}`
  const daysLeft    = 60 - dayNumber
  const isUrgent    = dayNumber >= 45
  const isCritical  = dayNumber >= 55

  const urgencyColor = isCritical ? '#ef4444' : isUrgent ? '#f97316' : '#F59E0B'
  const subjectEmoji = isCritical ? '🚨' : isUrgent ? '⚠️' : '📋'

  return wrapper(`
    ${heading(`${subjectEmoji} W-9 Required — Day ${dayNumber} of 60`)}
    ${p(`Your lifetime earnings from the SocialMate Partner Program have exceeded $599. Per IRS regulations, we're required to collect a W-9 from U.S.-based affiliates.`)}
    ${card(`
      <div style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Withholding Details</div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #222;">
        <span style="font-size: 13px; color: #9ca3af;">Amount withheld</span>
        <span style="font-size: 13px; font-weight: 700; color: #F59E0B;">${amount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #222;">
        <span style="font-size: 13px; color: #9ca3af;">Deadline</span>
        <span style="font-size: 13px; font-weight: 700; color: ${urgencyColor};">${deadline}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span style="font-size: 13px; color: #9ca3af;">Days remaining</span>
        <span style="font-size: 13px; font-weight: 700; color: ${urgencyColor};">${daysLeft} days</span>
      </div>
    `)}
    ${isCritical ? `
      <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 16px 18px; margin: 16px 0;">
        <p style="font-size: 13px; color: #f87171; font-weight: 700; margin: 0 0 6px;">URGENT: ${daysLeft} days remaining</p>
        <p style="font-size: 13px; color: #9ca3af; margin: 0; line-height: 1.6;">If your W-9 is not submitted by the deadline, your withheld funds (${amount}) will be permanently forfeited — 50% to SM-Give charity and 50% to Gilgamesh Enterprise LLC, as disclosed in the Affiliate Agreement.</p>
      </div>
    ` : ''}
    ${p(`Submit your W-9 in your partner dashboard to release your withheld earnings.`)}
    <div style="margin-top: 24px;">
      ${btn('https://socialmate.studio/partners/dashboard#w9-section', 'Submit W-9 Now →')}
    </div>
  `)
}

// ─── 5. W-9 submitted confirmation ───────────────────────────────────────────

export function w9SubmittedEmail({ email }: { email: string }) {
  return wrapper(`
    ${heading('W-9 received — you\'re all clear ✅')}
    ${p(`We've received your W-9 form. Your withheld earnings will be released in the next payout cycle.`)}
    ${p(`If you have any questions about your earnings or payout status, check your partner dashboard or reply to this email.`)}
    <div style="margin-top: 24px;">
      ${btn('https://socialmate.studio/partners/dashboard', 'View Dashboard →')}
    </div>
  `)
}

// ─── 6. Payout requested confirmation ────────────────────────────────────────

export function payoutConfirmationEmail({
  email,
  amountCents,
  payoutId,
}: {
  email: string
  amountCents: number
  payoutId: string
}) {
  const amount = `$${(amountCents / 100).toFixed(2)}`
  return wrapper(`
    ${heading('Payout request received')}
    ${p(`We've received your payout request for <strong style="color: #F59E0B;">${amount}</strong>. Your request is in the queue and will be reviewed within 1–2 business days.`)}
    ${card(`
      <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Request ID</div>
      <div style="font-family: monospace; font-size: 12px; color: #6b7280;">${payoutId}</div>
    `)}
    ${p(`You'll receive another email once your payout is approved and sent to your Stripe account. Payouts typically arrive within 1–3 business days after approval.`)}
    <div style="margin-top: 20px;">
      ${btn('https://socialmate.studio/partners/dashboard', 'View Payout Status →')}
    </div>
  `)
}

// ─── 7. Payout approved ───────────────────────────────────────────────────────

export function payoutApprovedEmail({
  email,
  amountCents,
}: {
  email: string
  amountCents: number
}) {
  const amount = `$${(amountCents / 100).toFixed(2)}`
  return wrapper(`
    ${heading(`Payout approved — ${amount} on the way! 💸`)}
    ${p(`Your payout of <strong style="color: #22c55e;">${amount}</strong> has been approved and is being transferred to your Stripe Connect account.`)}
    ${p(`Funds typically arrive in your bank account within 1–3 business days depending on your bank.`)}
    ${card(`
      <div style="font-size: 12px; color: #9ca3af; line-height: 1.8;">
        ✅ &nbsp;Transfer initiated<br/>
        🏦 &nbsp;Arriving in 1–3 business days<br/>
        📬 &nbsp;Stripe will send a separate transfer notification
      </div>
    `)}
    ${p(`Keep sharing your referral link — every new subscriber earns you another commission. 🚀`)}
    <div style="margin-top: 20px;">
      ${btn('https://socialmate.studio/partners/dashboard', 'View Dashboard →')}
    </div>
  `)
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { w9AlertEmail } from '@/lib/emails/affiliateEmails'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

// Alert schedule: days 1, 14, 30, 45, 55, 59 after withholding starts
const ALERT_DAYS = [1, 14, 30, 45, 55, 59] as const

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const now = new Date()

  // 1. Mark affiliates who've hit $599 as w9_required
  const { data: needsW9 } = await db
    .from('affiliate_profiles')
    .select('id')
    .gte('lifetime_earnings_cents', 59900)
    .eq('w9_required', false)
    .eq('w9_submitted', false)

  for (const a of needsW9 ?? []) {
    const withholdingStart  = now.toISOString()
    const forfeitureDeadline = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
    await db
      .from('affiliate_profiles')
      .update({
        w9_required:                 true,
        w9_withholding_started_at:   withholdingStart,
        w9_forfeiture_deadline:      forfeitureDeadline,
      })
      .eq('id', a.id)
  }

  // 2. Send alerts for affiliates who have withholding active
  const { data: affiliates } = await db
    .from('affiliate_profiles')
    .select('id, email, w9_withholding_started_at, w9_forfeiture_deadline, available_balance_cents, w9_submitted, w9_funds_forfeited')
    .eq('w9_required', true)
    .eq('w9_submitted', false)
    .eq('w9_funds_forfeited', false)

  let alertsSent = 0
  let forfeited  = 0

  for (const affiliate of affiliates ?? []) {
    if (!affiliate.w9_withholding_started_at) continue

    const startedAt  = new Date(affiliate.w9_withholding_started_at)
    const daysPassed = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24))
    const deadline   = affiliate.w9_forfeiture_deadline ?? ''

    // Check forfeiture
    if (daysPassed >= 60) {
      await db
        .from('affiliate_profiles')
        .update({ w9_funds_forfeited: true, available_balance_cents: 0 })
        .eq('id', affiliate.id)

      // Log notification
      await db.from('affiliate_notifications').insert({
        affiliate_id: affiliate.id,
        type:         'w9_forfeiture',
        subject:      'Your withheld funds have been forfeited',
        metadata:     { amount_cents: affiliate.available_balance_cents },
      })

      forfeited++
      continue
    }

    // Check each alert day
    for (const alertDay of ALERT_DAYS) {
      if (daysPassed < alertDay) continue

      // Check if already sent this alert
      const { data: existingAlert } = await db
        .from('affiliate_notifications')
        .select('id')
        .eq('affiliate_id', affiliate.id)
        .eq('type', `w9_day${alertDay}`)
        .maybeSingle()

      if (existingAlert) continue

      // Send email
      try {
        await getResend().emails.send({
          from: 'SocialMate Partners <hello@socialmate.studio>',
          to: affiliate.email,
          subject: `⚠️ W-9 Required — Day ${alertDay} of 60 — Action needed`,
          html: w9AlertEmail({
            email:              affiliate.email,
            dayNumber:          alertDay,
            deadlineDate:       deadline,
            withheldAmountCents: affiliate.available_balance_cents,
          }),
        })
      } catch (err) {
        console.error(`Failed to send W-9 day ${alertDay} alert to ${affiliate.email}:`, err)
        continue
      }

      // Record notification sent
      await db.from('affiliate_notifications').insert({
        affiliate_id: affiliate.id,
        type:         `w9_day${alertDay}`,
        subject:      `W-9 reminder — day ${alertDay} of 60`,
        metadata:     { day: alertDay },
      })

      alertsSent++
      break // Only send the most recent alert per run
    }
  }

  return NextResponse.json({
    success: true,
    newly_flagged: needsW9?.length ?? 0,
    alerts_sent: alertsSent,
    forfeited,
    run_at: now.toISOString(),
  })
}

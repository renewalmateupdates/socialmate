import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateGuideEmail(name: string | null): string {
  const greeting = name ? `Hey ${name.split(' ')[0]}` : 'Hey there'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:black;font-weight:900;font-size:16px;">S</span>
        </div>
        <span style="color:white;font-weight:700;font-size:16px;">SocialMate</span>
      </div>
    </div>

    <!-- Hero -->
    <div style="background:#111;border:2px solid rgba(245,158,11,0.4);border-radius:16px;padding:32px;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:16px;">📖</div>
      <h1 style="margin:0 0 12px;color:white;font-size:24px;font-weight:800;line-height:1.3;">${greeting}, your copy of Gilgamesh's Guide is here.</h1>
      <p style="margin:0 0 20px;color:#9ca3af;font-size:15px;line-height:1.6;">
        Everything they don't teach you about starting a business, building a brand, and becoming the person who pulls it off.
      </p>
      <a href="https://socialmate.studio/gils-guide/download"
        style="display:inline-block;background:#F59E0B;color:#000;font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:12px;">
        Download the Guide →
      </a>
    </div>

    <!-- What's inside -->
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What's inside</p>
      ${[
        'How to start a business with $0',
        'Content strategy that actually builds an audience',
        'Mindset and habits for the unglamorous daily work',
        'Free tools to run a real operation on a tight budget',
        'The money chapter — pricing, taxes, what matters',
      ].map(item => `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
        <span style="color:#F59E0B;font-weight:800;font-size:14px;margin-top:1px;">→</span>
        <span style="color:#d1d5db;font-size:14px;line-height:1.5;">${item}</span>
      </div>`).join('')}
    </div>

    <!-- SM-Give -->
    <div style="background:#0d1f0d;border:1px solid #1a3d1a;border-radius:16px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#4ade80;font-size:13px;font-weight:700;">❤️ Support the Guide</p>
      <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
        The guide is free forever. If it helps you, consider <a href="https://socialmate.studio/give" style="color:#4ade80;">paying it forward</a> —
        100% of donations go to SM-Give, our community fund for creators in need.
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <p style="color:#6b7280;font-size:13px;margin-bottom:16px;">While you're here — SocialMate is free to start:</p>
      <a href="https://socialmate.studio/signup"
        style="display:inline-block;background:white;color:black;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">
        Try SocialMate Free →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #222;padding-top:24px;text-align:center;">
      <p style="margin:0 0 8px;color:#555;font-size:12px;">— Joshua Bostic, Founder · Gilgamesh Enterprise LLC / SocialMate</p>
      <p style="margin:0;color:#444;font-size:11px;">socialmate.studio · You received this because you requested Gilgamesh's Guide.</p>
    </div>

  </div>
</body>
</html>
  `
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const admin = getAdmin()
    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name ? name.trim() : null

    // Upsert — if already exists just resend the email
    const { error } = await admin
      .from('gils_guide_subscribers')
      .upsert(
        { email: cleanEmail, name: cleanName, download_sent: true },
        { onConflict: 'email', ignoreDuplicates: false }
      )

    if (error) {
      console.error('gils_guide_subscribers upsert error:', error)
      return NextResponse.json({ error: 'Failed to save subscriber' }, { status: 500 })
    }

    // Send the guide email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
      await resend.emails.send({
        from: 'Joshua @ SocialMate <hello@socialmate.studio>',
        to: cleanEmail,
        subject: "Your copy of Gilgamesh's Guide is here 📖",
        html: generateGuideEmail(cleanName),
      })
    } catch (emailErr) {
      // Non-fatal — subscriber is saved, email just didn't send
      console.error('Resend error for gils-guide:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
